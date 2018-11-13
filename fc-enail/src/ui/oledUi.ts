/*
 * File: c:\fc-enail\fc-enail\src\ui\oledUi.ts
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
import { display, Font, Color, Layer } from 'ssd1306-i2c-js';
import { home } from './icons';
import { format } from 'date-fns';
import store from '../store/createStore';
import { EnailMode } from '../models/IEnailState';

const DISPLAY_REFRESH_RATE = 5000;

export class OledUi {
    private running: boolean = false;
    private flashStatus: boolean = true;
    private flashRate: number = 0;
    private icon: Uint8Array = home;
    private line1: string = "";
    private line2: string = "";
    private currentIcon: Uint8Array = home;
    private currentFlashRate: number = 0;
    private lastUpdate: number = 0;

    constructor() {
    }

    start(address: number) {
        display.init(1, address);
        display.turnOn();           // Turn on display module
        display.setFont(Font.UbuntuMono_8ptFontInfo);
        this.setIcon(this.icon, 0);
        display.clearScreen();
        display.refresh();
        this.running = true;
        this.render();
    }

    stop = () => {
        this.running = false;
        display.clearScreen();
        display.refresh();
        display.turnOff();
        display.dispose();
    }

    setIcon = (icon: Uint8Array, flashRate: number = 0) => {
        this.icon = icon;
        this.flashRate = flashRate;
        this.flashStatus = true;
    }

    drawIcon = () => {
        this.drawBitmap(this.icon, 97, 40);
    }

    drawBitmap = (data: Uint8Array, xPos: number, yPos: number) => {
        let s: string = '';
        for (let pos = 0; pos < 72; pos++) {
            for (let c = 0; c < 8; c++) {
                if (((data[pos] >> (7 - c)) & 0b1) === 0b1) {
                    s += 'X';
                    display.drawPixel(
                        ((((pos % 3) * 8) + c) * 1) + xPos, 
                        (Math.floor(pos / 3) * 1) + yPos, 
                        Color.White, 
                        Layer.Layer0);
                } else {
                    s += ' ';
                }
            }
            if (pos % 3 === 1) {
                s += '\n';
            }
        }
        //console.log(s);
    }

    scrollPos = 0;

    displayLine1Scrolling = () => {
        if (!!this.line1) {
            let s: string = this.line1;
            if (s.length <= 13 && this.scrollPos > 0) {
                this.scrollPos += 1;
                if (this.scrollPos >= 5) {
                    let pos: number = Math.min(this.scrollPos-5, 3);
                    if (this.scrollPos >= 50) {
                        this.scrollPos = 0;
                    } else if (this.scrollPos >= 50) {
                        pos = Math.min(this.scrollPos - 49, 2);
                    }
                    this.drawFixedString(0, 0, s.substr(pos), 2, Color.White, Layer.Layer0);                
                } else {
                    this.drawFixedString(0, 0, s, 2, Color.White, Layer.Layer0);                
                }
            } else if (s.length > 10) {
                s += " ... ";

                const s1: string = s.substr(this.scrollPos, 10);
                let s2: string = '';
                if (s1.length < 10) { // were at the end
                    s2 = '#' + s.substr(0, 9 - s1.length);
                }

                this.scrollPos += 1;
                if (this.scrollPos > s.length) {
                    this.scrollPos = 0;
                }

                this.drawFixedString(0, 0, s1 + s2, 2, Color.White, Layer.Layer0);
            } else {
                this.drawFixedString(0, 0, s, 2, Color.White, Layer.Layer0);
            }
        }
    }

    drawFixedString = (x: number, y:number, value: string, size: number, color: Color, layer: Layer) => {
        if (value.indexOf('\u00B0') >= 0) {
            const pos = value.indexOf('\u00B0');
            display.drawString(x, y, value.substring(0, pos), size, color, layer);
            display.drawRect(x+((pos+3)*8)-1, y+2, 5, 5, color, layer);
            display.drawString(x+((pos+3)*8)+5, y, value.substr(pos+1), size, color, layer);
        } else {
            display.drawString(x, y, value, 2, Color.White, Layer.Layer0);                
        }
    }

    displayLine1 = () => {
        this.displayLine1Scrolling();
    }

    getNewState = () => {
        const state = store.getState().enail;
        let line1 = this.line1;
        let line2 = this.line2;
        let icon = this.currentIcon;
        let flashRate = this.currentFlashRate;
        let flashStatus = this.flashStatus;
        
        line2 = `${format(Date.now(), 'h:mm')}`;
        switch (state.mode) {
            case EnailMode.Script: {
                line1 = state.currentScript ? state.currentScript.title : '-Select-';
                break;
            }
            case EnailMode.Settings: {
                line1 = 'Settings';
                break;
            }
            default: {
                line1 = 'FC E-Nail';
                break;
            }
        }

        return {
            line1, line2, icon, flashRate, flashStatus
        };
    }
    
    displayLine2 = () => {
        // display.setFont(Font.UbuntuMono_16ptFontInfo);
        display.drawString(4, 45, 
            this.line2,
            2, Color.White, Layer.Layer0
        );
        // display.setFont(Font.UbuntuMono_8ptFontInfo);
    }

    resetPosition() {
        this.scrollPos = 0;
    }

    renderTimer = () => {
        setTimeout(() => {
            const state = store.getState().enail;
            let line1 = this.line1;
            let line2 = this.line2;
            
            line2 = `${format(Date.now(), 'h:mm')}`;
            switch (state.mode) {
                case EnailMode.Script: {
                    line1 = state.currentScript ? state.currentScript.title : '-Select-';
                    break;
                }
                case EnailMode.Settings: {
                    line1 = 'Settings';
                    break;
                }
                default: {
                    line1 = 'FC E-Nail';
                    break;
                }
            
            }
    
            if (this.flashRate > 0 || this.line1 !== line1 || this.line2 !== line2 || this.icon !== this.currentIcon || this.flashRate !== this.currentFlashRate) {
                this.line1 = line1;
                this.line2 = line2;
                this.currentFlashRate = this.flashRate;
                this.currentIcon = this.icon;

                if ((Date.now() - this.lastUpdate) >= (this.flashRate * 1000)) {
                    this.flashStatus = !this.flashStatus;

                    // Clear display buffer
                    display.clearScreen();
                    
                    this.displayLine1();
                    this.displayLine2();
                    
    
                    if (this.flashStatus || this.flashRate === 0) {
                        this.drawIcon();
                    }
    
                    this.lastUpdate = Date.now();
                    display.refresh();           
                }
            }

            if (this.running) {
                this.renderTimer();
            }                    
        }, this.flashRate !== 0 ? this.flashRate * 1000 : DISPLAY_REFRESH_RATE ); 
    }

    render() {
        this.renderTimer();
    }
}

const oledUi = new OledUi();

export default oledUi;