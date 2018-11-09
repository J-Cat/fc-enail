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
import Icons from './icons';
import { format } from 'date-fns';

export class OledUi {
    private lastUpdate: number = 0;
    private flashStatus: boolean = true;
    private flashRate: number = 0;
    private _icon: Uint8Array = Icons.home;
    private line1: string = "FC E-Nail"
    private line2: string = format(Date.now(), "h:mm");

    constructor() {
    }

    start(address: number) {
        display.init(1, address);
        display.turnOn();           // Turn on display module
        display.setFont(Font.UbuntuMono_8ptFontInfo);
        this.setIcon(this._icon, 0);
        display.clearScreen();
        display.refresh();
    }

    stop = () => {
        display.clearScreen();
        display.refresh();
        display.turnOff();
        display.dispose();
    }

    setIcon(icon: Uint8Array, flashRate: number = 0) {
        this._icon = icon;
        this.flashRate = flashRate;
        this.flashStatus = true;
        this.drawIcon();
    }

    drawIcon = () => {
        this.drawBitmap(this._icon, 97, 40);
        //this.flash();
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
                    display.drawString(0, 0, s.substr(pos), 2, Color.White, Layer.Layer0);                
                } else {
                    display.drawString(0, 0, s, 2, Color.White, Layer.Layer0);                
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

                display.drawString(0, 0, s1 + s2, 2, Color.White, Layer.Layer0);
            } else {
                display.drawString(0, 0, s, 2, Color.White, Layer.Layer0);
            }
        }
    }

    displayLine1 = () => {
        this.displayLine1Scrolling();
    }
    
    displayLine2 = () => {
        this.line2 = format(Date.now(), 'h:mm');
        // display.setFont(Font.UbuntuMono_16ptFontInfo);
        display.drawString(4, 45, 
            `${this.line2}`,
            2, Color.White, Layer.Layer0
        );
        // display.setFont(Font.UbuntuMono_8ptFontInfo);
    }

    resetPosition() {
        this.scrollPos = 0;
    }

    renderTimer = () => {
        setTimeout(() => {
            if (Date.now() - this.lastUpdate > 1000) {
                this.flashStatus = !this.flashStatus;
                this.lastUpdate = Date.now();
                // Clear display buffer
                display.clearScreen();
                
                this.displayLine1();
                this.displayLine2();

                if (this.flashStatus || this.flashRate === 0) {
                    this.drawIcon();
                }

                display.refresh();       
            }

            this.renderTimer();
        }, 1000);
        
    }

    render() {
        this.renderTimer();
    }
}

const oledUi = new OledUi();

export default oledUi;