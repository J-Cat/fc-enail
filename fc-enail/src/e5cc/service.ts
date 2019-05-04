import * as ModbusRtu from 'modbus-serial';
import { send } from 'process';
import * as AsyncLock from 'async-lock';
import { IE5CCOptions } from './IE5ccOptions';

import Debug from 'debug';
const debug = Debug('fc-enail:e5cc-service');

import { E5CC as Constants } from '../models/constants';
const { VARIABLES, COMMANDS, FLAGS } = Constants;

import { config } from '../config';
import { SequentialTaskQueue } from 'sequential-task-queue';

const CONNECT_DELAY = 250;

let _options: IE5CCOptions = config.options.e5cc;

let errorCount = 0;
let fetchTimeout: NodeJS.Timeout;
let lastUpdated = 0;
const taskQueue = new SequentialTaskQueue({
    timeout: 10000
});

const _client = new ModbusRtu();

const cachedResults: {
    [address: number]: number
} = {};

const connect = (options?: IE5CCOptions): Promise<void> => {
    return new Promise<void>(resolve => {
        if (options !== undefined) {
            _options = options;
        }
        debug('connecting');
        _client.connectRTU(_options.device, _options.options, () => {
            _client.setID(1);
            debug(`Connected to Omron, timeout set to: ${_client.getTimeout()}ms`);
            setTimeout(() => {
                resolve();
            }, CONNECT_DELAY);
        });
    });
}

const close = (): Promise<void> => {
    return new Promise<void>(resolve => {
        _client.close(() => {
            resolve();
        });
    });
}

export const read = async (address: number, retry: number = 3, args: any = {}): Promise<number|undefined> => {
    let result = undefined;
    try {
        result = await executeRead(address, retry, 0, args);
        if (result !== undefined) {
            cachedResults[address] = result;
        } else if (cachedResults[address] !== undefined) {
            result = cachedResults[address];
        }
    } catch (e) {
        debug(e);
    }
    debug(`Read Result, ${address} = ${result}`);
    if (send) {
        send({
            type: 'READCOMPLETE',
            address,
            result,
            ...args
        });
    }
    return result;
}

const executeRead = async (address: number, retry: number, retryCount: number = 0, args: any): Promise<number|undefined> => {
    try {
        const value = await _client.readHoldingRegisters(address, 1);
        return value.data[0];
    } catch {
        debug('Read error');
        if (retryCount < retry) {
            debug('Retrying');
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, 250);
            }).then(async () => {
                return await executeRead(address, retry, retryCount + 1, args);
            })
        } else {
            return undefined;
        }
    }    
}

export const write = async (address: number, value: number, retry: number = 3, args: any = {}): Promise<boolean> => {
    try {
        let result: boolean = false;
        let newValue = value;
        debug(`${address}, ${value}`);
        if (address === Constants.VARIABLES.SETPOINT) {
            lock.acquire('SP', async () => {
                if (newSP !== undefined) {
                    newValue = newSP;
                    newSP = undefined;
                }
            });
        }
        result = await executeWrite(address, newValue, retry) || false;
        if (send) {
            send({
                type: 'WRITECOMPLETE',
                address,
                value: newValue,
                result,
                ...args
            });
        }
        return result;
    } catch {
        return false;
    }
}

const executeWrite = async (address: number, value: number, retry: number, retryCount: number = 0): Promise<boolean> => {
    try {
        await _client.writeRegister(address, value);
        return true;
    } catch (e) {
        debug(`Write error: ${e}`);
        if (retryCount < retry) {
            debug('Retrying');
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, 250);
            }).then(async () => {
                return await executeWrite(address, value, retry, retryCount + 1)
            })
        } else {
            return false;
        }
    }
}

export const run = async (command: number, retry: number = 3, args: any): Promise<boolean> => {
    let result = false;
    try {
        await executeRun(command, retry);
        result = true;
    } catch (e) {
        debug(e);
    }
    if (send) {
        send({
            type: 'RUNCOMPLETE',
            command,
            ...args
        });
    }
    return result;
}

const executeRun = async (command: number, retry: number, retryCount: number = 0): Promise<boolean> => {
    try {
        await _client.writeRegister(COMMANDS.RUN, command);
        return true;
    } catch {
        debug('Run error.')
        if (retryCount < retry) {
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, 250);
            }).then(async () => {
                return await executeRun(command, retry, retryCount + 1);
            });
        } else {
            return false;
        }
    }
}

const getE5CCState = async () => {
    await taskQueue.wait();
    taskQueue.push(() => {
        new Promise(async (resolve, reject) => {
            debug('Start');
            if ((Date.now() - lastUpdated) < config.options.monitorCycleTime) {
                resolve();
                return;
            }

            // timeout and reject if it takes way too long
            fetchTimeout = setTimeout(() => {
                reject();
            }, config.options.monitorCycleTime*5);

            try {
                debug('Get data');
                const pv = await read(VARIABLES.PRESENTVALUE, 1, {});
                const sp = await read(VARIABLES.SETPOINT, 1, {});
                const status = await read(VARIABLES.STATUS, 1, {});
                const running = status ? (status & FLAGS.STOPPED) === 0 : false;
                const tuning = status ? (status & FLAGS.TUNING) !== 0 : false;

                debug(`Got -> ${sp}, ${pv}, ${running}`);
                if (send && sp && pv) {
                    debug(`Sending -> ${sp}, ${pv}, ${running}`);
                    send({
                        type: 'DATA',
                        pv,
                        sp,
                        isRunning: running,
                        isTuning: tuning
                    });
                }
                lastUpdated = Date.now();
                resolve();
            } catch (e) {
                debug(e);
                reject();
            }
        }).then(() => {
            debug('no errors');
            errorCount = 0;
            new Promise(resolve => {
                setTimeout(() => {resolve();}, config.options.monitorCycleTime);
            }).then(() => {
                getE5CCState();
            });
        }).catch(() => {
            debug(`error count = ${errorCount}`);
            errorCount += 1;
            if (errorCount < 10) {
                new Promise(resolve => {
                    setTimeout(() => {resolve();}, config.options.monitorCycleTime);
                }).then(() => {
                    getE5CCState();
                });
            } else {
                clearTimeout(fetchTimeout);
                new Promise(resolve => {
                    setTimeout(() => {resolve();}, config.options.monitorCycleTime*2);
                }).then(() => {
                    close().then(() => {
                        connect().then(() => {
                            getE5CCState();
                        });
                    })
                });
            }
        });
    });
}

connect(_options).then(async () => {
    debug('connect');
    await read(Constants.VARIABLES.P);
    await read(Constants.VARIABLES.I);
    await read(Constants.VARIABLES.D);
    getE5CCState();
});

const lock: AsyncLock = new AsyncLock();
let newSP: number | undefined;
// let offset: number = 0;

process.on('message', async m => {
    // lock.acquire('READWRITE', async () => {
    //     switch (m.type) {
    //         case 'READ': {
    //             const value = await read(m.address as number, m.retry as number, m.args)
    //             break;
    //         }
    
    //         case 'READBATCH': {
    //             for (let address of m.addressList) {
    //                 await read(address as number, m.retry as number, m.args);
    //             }
    //             break;
    //         }
    
    //         case 'WRITE': {
    //             const value = await write(m.address as number, m.value as number, m.retry as number, m.args);
    //             break;
    //         }
    
    //         case 'WRITEBATCH': {
    //             for (let value of m.data) {
    //                 await write(value.address as number, value.value as number, m.retry as number, m.args);
    //             }
    //             break;
    //         }
    
    //         case 'RUN': {
    //             const value = await run(m.command as number, m.retry as number, m.args);
    //             break;
    //         }

    //         // case 'MOVESP': {
    //         //     lock.acquire('SP', () => {
    //         //         offset += m.value as number;
    //         //     }).catch(reason => {
            
    //         //     });            
    //         // }
    //     }    
    // });
    taskQueue.push(async () => {
        switch (m.type) {
            case 'READ': {
                await read(m.address as number, m.retry as number, m.args)
                break;
            }
    
            case 'READBATCH': {
                for (let address of m.addressList) {
                    await read(address as number, m.retry as number, m.args);
                }
                break;
            }
    
            case 'WRITE': {
                if (m.address === Constants.VARIABLES.SETPOINT) {
                    lock.acquire('SP', async () => {
                        newSP = m.value as number;
                    });
                }
                await write(m.address as number, m.value as number, m.retry as number, m.args);
                break;
            }
    
            case 'WRITEBATCH': {
                for (let value of m.data) {
                    await write(value.address as number, value.value as number, m.retry as number, m.args);
                }
                break;
            }
    
            case 'RUN': {
                await run(m.command as number, m.retry as number, m.args);
                break;
            }

            // case 'MOVESP': {
            //     lock.acquire('SP', () => {
            //         offset += m.value as number;
            //     }).catch(reason => {
            
            //     });            
            // }
        }    
    })
});
