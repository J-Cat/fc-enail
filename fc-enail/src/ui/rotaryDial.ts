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
import { SimpleEventDispatcher, ISimpleEvent } from "strongly-typed-events";
import { Gpio } from 'onoff';
import { Button } from './button';

const ROTATION_THROTTLE = 25;

export class RotaryDial {
    private lastA: number = 0;
    private lastB: number = 0;
    private inputA?: Gpio;
    private inputB?: Gpio;
    private button?: Button;
    private lastRotation = 0;
    private rotationThrottle = ROTATION_THROTTLE;

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

    setRotationThrottle = (value: number) => {
        this.rotationThrottle = value;
    }

    private rotaryInterupt = (isA: boolean) => {
        const newA: number = this.inputA!.readSync()
        const newB: number = this.inputB!.readSync();
        if (newA === this.lastA && newB === this.lastB) {
            return;
        }
    
        this.lastA = newA;
        this.lastB = newB;

        if (newA === 1 && newB === 1) {
            const lastRotation = this.lastRotation;
            this.lastRotation = Date.now();
            if ((this.lastRotation - lastRotation) > this.rotationThrottle) {
                if (isA) {
                    this._onCounterClockwise.dispatch(this);
                } else {
                    this._onClockwise.dispatch(this);
                }
            }
        }
    }

    init = (gpioA: number, gpioB: number, gpioButton: number) => {   
        this.inputA = new Gpio(gpioA, 'in', 'rising');
        this.inputB = new Gpio(gpioB, 'in', 'rising');
        this.button = new Button();
        this.button.init(gpioButton);

        this.inputA.watch((err: Error, value: number) => {
            if (err) {
                return;
            }
            this.rotaryInterupt(true);
        });

        this.inputB.watch((err: Error, value: number) => {
            if (err) {
                return;
            }
            this.rotaryInterupt(false);
        });

        this.button.onClick.subscribe(() => {
            this._onClick.dispatch(this);
        });

        this.button.onDoubleClick.subscribe(() => {
            this._onDoubleClick.dispatch(this);
        });
    }
}

const dial = new RotaryDial();
export default dial;