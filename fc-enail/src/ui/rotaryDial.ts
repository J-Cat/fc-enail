/*
 * File: c:\fc-enail\fc-enail\src\ui\rotaryDial.ts
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
import { SimpleEventDispatcher, ISimpleEvent, EventDispatcher, IEvent } from "strongly-typed-events";
import { Gpio } from 'onoff';
import Debug from 'debug';
import { send } from "process";
import { EnailMode } from "../models/IEnailState";
import { config } from '../config';
import * as Constants from '../models/constants';

const debug = Debug('fc-enail:rotary');

const ROTATION_THROTTLE = 10;
const MESSAGE_THROTTLE = 50;

export class RotaryDial {
    private lastA: number = 0;
    private lastB: number = 0;
    private inputA?: Gpio;
    private inputB?: Gpio;
    private button?: Gpio;
    private lastUpdate = 0;
    private lastInternalUpdate = 0;
    private offset = 0;
    private lastOffset = 0;
    private step = 0;
    private dispatchPromise = Promise.resolve();
    private mode: EnailMode = EnailMode.Home;

    protected _onClockwise: SimpleEventDispatcher<RotaryDial> = new SimpleEventDispatcher<RotaryDial>();
    get onClockwise(): ISimpleEvent<RotaryDial> {
        return this._onClockwise.asEvent();
    }

    protected _onCounterClockwise: SimpleEventDispatcher<RotaryDial> = new SimpleEventDispatcher<RotaryDial>();
    get onCounterClockwise(): ISimpleEvent<RotaryDial> {
        return this._onCounterClockwise.asEvent();
    }

    protected _onClick: SimpleEventDispatcher<RotaryDial> = new SimpleEventDispatcher<RotaryDial>();
    get onClick(): ISimpleEvent<RotaryDial> {
        return this._onClick.asEvent();
    }

    protected _onDoubleClick: SimpleEventDispatcher<RotaryDial> = new SimpleEventDispatcher<RotaryDial>();
    get onDoubleClick(): ISimpleEvent<RotaryDial> {
        return this._onDoubleClick.asEvent();
    }

    protected _onChange: EventDispatcher<RotaryDial, { offset: number, step: number }> = new EventDispatcher<RotaryDial, { offset: number, step: number }>();
    get onChange(): IEvent<RotaryDial, { offset: number, step: number }> {
        return this._onChange.asEvent();
    }

    private rotaryInterupt = () => {
        const a = this.lastA;
        const b = this.lastB;

        this.dispatchPromise.then(() => {
            if (a === 0 && b === 0 || a === 1 && b === 1) {
                //this._onChange.dispatch(this, 1);
                if ((Date.now() - this.lastInternalUpdate) > ROTATION_THROTTLE) {
                    this.offset += 1;
                    this.lastInternalUpdate = Date.now();
                }
            } else if (a === 1 && b === 0 || a === 0 && b === 1 || a === 2 && b === 0) { 
                if ((Date.now() - this.lastInternalUpdate) > ROTATION_THROTTLE) {
                    //this._onChange.dispatch(this, -1);
                    this.offset -= 1;
                    this.lastInternalUpdate = Date.now();
                }
            }  
        });

        const elapsed = Date.now() - this.lastUpdate;
        if (elapsed > (this.mode === EnailMode.Home ? MESSAGE_THROTTLE : 0)) {
            this.dispatchPromise = new Promise(resolve => {
                if (this.offset !== 0) {
                    if (elapsed > 750) {
                        this.step = 1;
                    } else {
                        if (this.offset > 0) {
                            if (this.lastOffset > 0 && this.step <= 10 && elapsed < 250) {
                                this.step += 1;
                            } else if (this.step > 1) {
                              this.step -= 1;
                            }
                        } else {
                            if (this.lastOffset < 0 && this.step <= 10 && elapsed < 250) {
                                this.step += 1;
                            } else if (this.step > 1) {
                                this.step -= 1;
                            }
                        }
                    }
                    // debug(`Offset = ${this.offset}, Last = ${this.lastOffset}, Step = ${this.step}`);
                    this._onChange.dispatch(this, { offset: this.offset, step: this.step });
                    this.lastOffset = this.offset;
                    this.offset = 0;
                }
                this.lastUpdate = Date.now();
                resolve();
            });
        }

    }

    init = (gpioA: number, gpioB: number, gpioButton: number) => {   
        this.inputA = new Gpio(gpioA, 'in', 'both', { debounceTimeout: 20 });
        this.inputB = new Gpio(gpioB, 'in', 'both', { debounceTimeout: 20 });
        this.button = new Gpio(gpioButton, 'in', 'rising', { activeLow: true, debounceTimeout: 20 });

        this.inputA.watch((err: Error, value: number) => {
            if (err) {
                return;
            }
            this.lastA = value;
        });


        this.inputB.watch((err: Error, value: number) => {
            if (err) {
                return;
            }
            this.lastB = value;
            this.rotaryInterupt();
        });

        this.button.watch((err: Error, value: number) => {
            if (err) {
                return;
            }
            this._onClick.dispatch(this);
        });
    }

    setMode = (mode: EnailMode) => {
        this.mode = mode;
    }
}

const dial = new RotaryDial();
dial.onChange.subscribe((source, { offset, step }) => {
    if (process.send) {
        process.send({ type: Constants.INPUT_ACTIONS.ROTATION, offset, step });
    }
});

dial.onClick.subscribe(source => {
    if (send) {
        send({ type: Constants.INPUT_ACTIONS.ROTARYCLICK });
    }
});

dial.init(
    config.options.hardware.dial.A, 
    config.options.hardware.dial.B, 
    config.options.hardware.dial.C
);

