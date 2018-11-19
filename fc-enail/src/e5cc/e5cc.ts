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
import Debug from 'debug';
import store from '../store/createStore';
import { updateAllState, setReady, nextStep, updateP, updateD, updateI, getPidSettings } from '../reducers/enailReducer';
import { fork, ChildProcess } from 'child_process';
import * as Constants from '../models/constants';
const debug = Debug('fc-enail:e5cc');

class E5CC {  
    private e5ccService: ChildProcess;
    private isRunning: boolean = false;
    private isTuning: boolean = false;
    private sp: number = 0;
    private pv: number = 0;
    private started: boolean = false;
    private p: number = 0;
    private i: number = 0;
    private d: number = 0;

    constructor() {
        this.e5ccService = fork(`${__dirname}/service.js`);

        this.e5ccService.on('message', m => {
            debug(m);
            switch (m.type) {
                case 'DATA': {
                    if (this.isTuning !== m.isTuning) {
                        store.dispatch(getPidSettings(true));
                    }
                    
                    this.pv = m.pv as number;
                    this.sp = m.sp as number;
                    this.isRunning = m.isRunning as boolean
                    this.isTuning = m.isTuning;
                    this.started = true;
                    store.dispatch(updateAllState(m.pv, m.sp, m.isRunning, m.isTuning));        
                    break;
                }

                case 'READCOMPLETE': {
                    if (m.console) {
                        console.log(`${m.address} = ${m.result}`);
                    }
                    switch (m.address) {
                        case Constants.E5CC.VARIABLES.P: {
                            this.p = m.result as number;
                            store.dispatch(updateP(this.p));
                            break;
                        }
                        case Constants.E5CC.VARIABLES.I: {
                            this.i = m.result as number;
                            store.dispatch(updateI(this.i));
                            break;
                        }
                        case Constants.E5CC.VARIABLES.D: {
                            this.d = m.result as number;
                            store.dispatch(updateD(this.d));
                            break;
                        }
                    }
                    break;
                }

                case 'RUNCOMPLETE': {
                    store.dispatch<any>(setReady());
                    break;
                }

                case 'WRITECOMPLETE': {
                    if ((m.address as number) === Constants.E5CC.VARIABLES.SETPOINT && (m.isStep as boolean)) {
                        store.dispatch(nextStep());
                    } else {
                        store.dispatch<any>(setReady());
                    }
                    break;
                }
            }
        });

        process.on('exit', () => {
            this.e5ccService.kill();
        });
    }

    read = (address: number, retry: number = 3, args: any = {}) => {
        this.e5ccService.send({ type: 'READ', address, retry, args });
    }

    readBatch = (addressList: number[], retry: number = 3, args: any = {}) => {
        this.e5ccService.send({ type: 'READBATCH', addressList, retry, args });
    }

    write = (address: number, value: number, retry: boolean = true) => {
        this.e5ccService.send({ type: 'WRITE', address, value, retry });
    }

    writeBatch = (data: { address: number; value: number; }[], retry: boolean = true) => {
        this.e5ccService.send({ type: 'WRITEBATCH', data, retry });
    }

    run = (command: number, args: any = {}) => {
        this.e5ccService.send({ type: 'RUN', command, args });
    }

    getPV = () => {
        if (this.started) {
            return this.pv;
        }
    }

    getSP = () => {
        if (this.started) {
            return this.sp;
        }
    }

    getIsRunning = () => {
        if (this.started) {
            return this.isRunning;
        }
    }

    getIsTuning = () => {
        if (this.started) {
            return this.isTuning;
        }
    }

    start = () => {
        this.e5ccService.send({ type: 'RUN', command: Constants.E5CC.COMMANDS.START });
    }

    stop = () => {
        this.e5ccService.send({ type: 'RUN', command: Constants.E5CC.COMMANDS.STOP });
    }

    toggleTune = (percent: 40|100 = 100) => {
        if (this.isTuning) {
            this.e5ccService.send({ type: 'RUN', command: Constants.E5CC.COMMANDS.TUNE_CANCEL });
        } else {
            this.e5ccService.send({ 
                type: 'RUN', 
                command: percent === 100 ? Constants.E5CC.COMMANDS.TUNE_100 : Constants.E5CC.COMMANDS.TUNE_40
            });
        }
    }

    toggleState = async (): Promise<boolean> => {
        if (this.started) {
            if (this.isRunning) {
                this.stop();
                return false;
            } else {
                this.start();
                return true;
            }
        } else {
            return false;
        }
    }

    setSP = (value: number, retry: number = 0, args: any = {}) => {
        this.e5ccService.send({ 
            type: 'WRITE', 
            address: Constants.E5CC.VARIABLES.SETPOINT, 
            value, 
            retry, 
            args 
        });
    }

    // toggleUnit = async (): Promise<boolean> => {
    //     if (await run(0x0700)) {
    //         if (await write(0x2C01, Math.abs((await read(0x2C01))-1))) {
    //             return await run(0x0600);
    //         }
    //     } 
    //     return false;
    // }
}

const e5cc = new E5CC();
export default e5cc;