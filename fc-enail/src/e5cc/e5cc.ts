/*
 * File: c:\fc-enail\fc-enail\src\e5cc\e5cc.ts
 * Project: c:\fc-enail\fc-enail
 * Created Date: Thursday November 8th 2018
 * Author: J-Cat
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * License: 
 *    This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 
 *    International License (http://creativecommons.org/licenses/by-nc/4.0/).
 * -----
 * Copyright (c) 2018
 */
import * as ModbusRtu from 'modbus-serial';
import { SimpleEventDispatcher, ISimpleEvent } from 'ste-simple-events';
import { SequentialTaskQueue } from 'sequential-task-queue';

import { IE5CCOptions } from './IE5ccOptions';

const CONNECT_DELAY = 250;

class E5CC {
    private _client = new ModbusRtu();
    private _options: IE5CCOptions = {
        device: '/dev/ttyUSB0',
        options: {
            baudRate: 57600,
            dataBits: 8,
            stopBits: 2,
            parity: 'none'
        }
    };
    private queue: SequentialTaskQueue = new SequentialTaskQueue();
    
    constructor() {
    }

    protected _onConnect: SimpleEventDispatcher<E5CC> = new SimpleEventDispatcher<E5CC>();
    get onConnect(): ISimpleEvent<E5CC> {
        return this._onConnect.asEvent();
    }

    connect = (options?: IE5CCOptions): Promise<void> => {
        return new Promise<void>(resolve => {
            if (options !== undefined) {
                this._options = options;
            }
            this._client.connectRTU(this._options.device, this._options.options, () => {
                this._client.setID(1);
                setTimeout(() => {
                    //this._onConnect.dispatch(this);
                    resolve();
                }, CONNECT_DELAY);
            });
        });
    }

    close = (): Promise<void> => {
        return new Promise<void>(resolve => {
            this._client.close(() => {
                resolve();
            });
        });
    }

    read = async (address: number, retry: boolean = true): Promise<number> => {
        return new Promise<number>(resolve => {
            this.queue.push(async () => {
                await this.executeRead(address, resolve, retry);
            });
        });
    }

    executeRead = async (address: number, resolve: (value: number) => void, retry: boolean, retryCount: number = 0) => {
        try {
            const value = await this._client.readHoldingRegisters(address, 1);
            resolve(value.data[0]);
        } catch {
            if (retryCount < 5 && retry) {
                this.queue.push(async () => {
                    await this.executeRead(address, resolve, retry, retryCount + 1)
                })
            } 
        }
    }

    write = async (address: number, value: number, retry: boolean = true): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.queue.push(async () => {
                await this.executeWrite(address, value, resolve, retry);
            });
        });
    }

    executeWrite = async (address: number, value: number, resolve: (result: boolean) => void, retry: boolean, retryCount: number = 0) => {
        try {
            await this._client.writeRegister(address, value);
            resolve(true);
        } catch {
            if (retryCount < 5 && retry) {
                this.queue.push(async () => {
                    await this.executeWrite(address, value, resolve, retry, retryCount + 1)
                });
            } else {
                resolve(false);
            }
        }
    }

    run = async (command: number, retry: boolean = true): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.queue.push(async () => {
                await this.executeRun(command, resolve, retry)
            });
        });
    }

    executeRun = async (command: number, resolve: (result: boolean) => void, retry: boolean, retryCount: number = 0) => {
        try {
            await this._client.writeRegister(0x0000, command);
            resolve(true);
        } catch {
            if (retryCount < 5 && retry) {
                this.queue.push(async () => {
                    await this.executeRun(command, resolve, retry, retryCount + 1)
                });
            } else {
                resolve(false);
            }
        }
    }

    isRunning = async (): Promise<boolean> => {
        try {
            const value = await this.read(0x2407);
            return (await ((value & 256) === 0));
        } catch (e) {
            return false;
        }
    }

    start = async (): Promise<boolean> => {
        return await this.run(0x0100);
    }

    stop = async (): Promise<boolean> => {
        return await this.run(0x0101);
    }

    toggleState = async (): Promise<boolean> => {
        if ((await this.isRunning())) {
            await this.stop();
            return false;
        } else {
            await this.start();
            return true;
        }
    }

    readSP = async (): Promise<number> => {
        return await this.read(0x2103);
    }

    setSP = async (value: number, retry: boolean = false): Promise<boolean> => {
        return await this.write(0x2103, value, retry);
    }

    readPV = async (): Promise<number> => {
        return await this.read(0x2000);        
    }

    toggleUnit = async (): Promise<boolean> => {
        if (await this.run(0x0700)) {
            if (await this.write(0x2C01, Math.abs((await this.read(0x2C01))-1))) {
                return await this.run(0x0600);
            }
        } 
        return false;
    }
}

const e5cc = new E5CC();
export default e5cc;