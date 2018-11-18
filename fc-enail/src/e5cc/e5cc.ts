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
import { updateAllState, setReady, nextStep } from '../reducers/enailReducer';
import { fork, ChildProcess } from 'child_process';
import * as Constants from '../models/constants';
const debug = Debug('fc-enail:e5cc');

class E5CC {  
    private e5ccService: ChildProcess;
    private isRunning: boolean = false;
    private sp: number = 0;
    private pv: number = 0;
    private started: boolean = false;

    constructor() {
        this.e5ccService = fork(`${__dirname}/service.js`);

        this.e5ccService.on('message', m => {
            debug(m);
            switch (m.type) {
                case 'DATA': {
                    this.pv = m.pv as number;
                    this.sp = m.sp as number;
                    this.isRunning = m.isRunning as boolean
                    this.started = true;
                    store.dispatch(updateAllState(m.pv, m.sp, m.isRunning));        
                    break;
                }

                case 'READCOMPLETE': {
                    if (m.console) {
                        console.log(m.result);
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

    write = (address: number, value: number, retry: boolean = true) => {
        this.e5ccService.send({ type: 'WRITE', address, value, retry });
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

    start = () => {
        this.e5ccService.send({ type: 'RUN', command: Constants.E5CC.COMMANDS.START });
    }

    stop = () => {
        this.e5ccService.send({ type: 'RUN', command: Constants.E5CC.COMMANDS.STOP });
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