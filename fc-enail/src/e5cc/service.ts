import * as ModbusRtu from 'modbus-serial';
import { send } from 'process';
import { IE5CCOptions } from './IE5ccOptions';

import Debug from 'debug';
const debug = Debug('fc-enail:e5cc-service');

const MONITOR_CYCLE_TIME = 500;
const CONNECT_DELAY = 250;

let _options: IE5CCOptions = {
    device: '/dev/ttyUSB0',
    options: {
        baudRate: 57600,
        dataBits: 8,
        stopBits: 1,
        parity: 'even'
    }
};

let errorCount = 0;
let fetchTimeout: NodeJS.Timeout;
let lastUpdated = 0;
const _client = new ModbusRtu();

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

export const read = async (address: number, retry: number = 3): Promise<number|undefined> => {
    try {
        return await executeRead(address, retry);
    } catch {
        return undefined;
    }
}

const executeRead = async (address: number, retry: number, retryCount: number = 0): Promise<number|undefined> => {
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
                return await executeRead(address, retry, retryCount + 1);
            })
        } else {
            return undefined;
        }
    }    
}

export const write = async (address: number, value: number, retry: number = 3, args: any = {}): Promise<boolean> => {
    try {
        debug(`${address}, ${value}`);
        const result = await executeWrite(address, value, retry) || false;
        if (result) {
            if (send) {
                send({
                    type: 'WRITECOMPLETE',
                    address,
                    value,
                    result,
                    ...args
                });
            }
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

export const run = async (command: number, retry: number = 3): Promise<boolean> => {
    try {
        await executeRun(command, retry);
        return true;
    } catch {
        return false;
    }
}

const executeRun = async (command: number, retry: number, retryCount: number = 0): Promise<boolean> => {
    try {
        await _client.writeRegister(0x0000, command);
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

const isRunning = async (retry: number = 3): Promise<void> => {
    try {
        const value = await read(0x2407, retry);
        if (send && value) {
            send({
                type: 'STATE/RESPONSE',
                value: (value & 256) === 0
            });
        }
    } catch {}
}

const readSP = async (retry: number = 3): Promise<void> => {
    try {
        const value = await read(0x2103, retry);
        if (send && value) {
            send({
                type: 'SP/RESPONSE',
                value
            });
        }
    } catch {}
}

const readPV = async (retry: number = 3) => {
    try {
        const value = await read(0x2000, retry);
        if (send && value) {
            send({
                type: 'PV/RESPONSE',
                value
            });
        }
    } catch {}
}

const getE5CCState = () => {
    new Promise(async (resolve, reject) => {
        debug('Start');
        if ((Date.now() - lastUpdated) < MONITOR_CYCLE_TIME) {
            resolve();
            return;
        }

        // timeout and reject if it takes way too long
        fetchTimeout = setTimeout(() => {
            reject();
        }, MONITOR_CYCLE_TIME*5);

        try {
            debug('Get data');
            const pv = await read(0x2000, 1);
            const sp = await read(0x2103, 1);
            const runningValue = await read(0x2407, 1);
            const running = runningValue ? (runningValue & 256) === 0 : false;

            debug(`Got -> ${sp}, ${pv}, ${running}`);
            if (send && sp && pv) {
                debug(`Sending -> ${sp}, ${pv}, ${running}`);
                send({
                    type: 'DATA',
                    pv,
                    sp,
                    isRunning: running
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
            setTimeout(() => {resolve();}, MONITOR_CYCLE_TIME);
        }).then(() => {
            getE5CCState();
        });
    }).catch(() => {
        debug(`error count = ${errorCount}`);
        errorCount += 1;
        if (errorCount < 10) {
            new Promise(resolve => {
                setTimeout(() => {resolve();}, MONITOR_CYCLE_TIME);
            }).then(() => {
                getE5CCState();
            });
        } else {
            clearTimeout(fetchTimeout);
            new Promise(resolve => {
                setTimeout(() => {resolve();}, MONITOR_CYCLE_TIME*2);
            }).then(() => {
                close().then(() => {
                    connect().then(() => {
                        getE5CCState();
                    });
                })
            });
        }
    });
}

connect(_options).then(() => {
    debug('connect');
    getE5CCState();
});

process.on('message', async m => {
    switch (m.type) {
        case 'READ': {
            const value = await read(m.address, m.retry)
            break;
        }

        case 'WRITE': {
            const value = await write(m.address, m.value, m.retry, m.args);
            break;
        }

        case 'RUN': {
            const value = await run(m.command, m.retry);
            break;
        }
    }
});
