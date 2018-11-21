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
import { home, getIconByName } from './icons';
import { format } from 'date-fns';
import { EnailMode } from '../models/IEnailState';
import * as Constants from '../models/constants';
import Debug from 'debug';
import { config } from '../config';
import { IOledState } from '../models/IOledState';
import { IMenuItem } from '../models/IMenuState';

const debug = Debug('fc-enail:oled');
const HTTP_PORT = config.options.httpPort;

const DISPLAY_REFRESH_RATE = config.options.displayRefreshRate;

export class OledUi {
    private running: boolean = false;
    private flashStatus: boolean = true;
    private icon: Uint8Array = home;
    private lines: string[] = ["", ""];
    private lastLines: string[] = ["", ""];
    private lastUpdate: number = 0;
    private timeout?: NodeJS.Timeout;
    private scrollPos: number[] = [0, 0, 0, 0];
    private scrollDone: boolean[] = [true, false, false, false];
    private characterOn: number = 1;
    private state?: IOledState;
    private lastState?: IOledState;

    constructor() {
    }

    start = (address: number) => {
        display.init(1, address);
        display.turnOn();           // Turn on display module
        display.setFont(Font.UbuntuMono_8ptFontInfo);
        display.clearScreen();
        display.refresh();
    }

    stop = () => {
        this.running = false;
        display.clearScreen();
        display.refresh();
        display.turnOff();
        display.dispose();
    }

    private drawIcon = () => {
        this.drawBitmap(this.icon, 97, 40);
    }

    private drawBitmap = (data: Uint8Array, xPos: number, yPos: number) => {
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

    private displayLineScrolling = (index: number, x: number, y: number, selected: boolean) => {
        const line = this.lines[index];
        if (!!line) {
            let s: string = line;
            if (s.length > (10 - (selected ? 1 : 0))) {
                s += "     ";

                const s1: string = s.substr(this.scrollPos[index], 10 - (selected ? 1 : 0));
                let s2: string = '';
                if (s1.length < (10 - (selected ? 1 : 0))) { // were at the end
                    s2 = s.substr(0, 10 - s1.length - (selected ? 1 : 0));
                }

                if (this.scrollPos[index] >= s.length) {
                    this.scrollDone[index] = true;
                    this.scrollPos[index] = 0;
                } else if (!this.scrollDone[index]) {
                    this.scrollPos[index] += 1;
                }
                this.drawFixedString(x, y, (selected ? '*' : '') + s1 + s2, 2, Color.White, Layer.Layer0);
            } else {
                this.drawFixedString(x, y, `${selected ? '*' : ''}${s}`, 2, Color.White, Layer.Layer0);
            }
        }
    }

    private drawFixedString = (x: number, y:number, value: string, size: number, color: Color, layer: Layer) => {
        if (value.indexOf('\u00B0') >= 0) {
            const pos = value.indexOf('\u00B0');
            display.drawString(x, y, value.substring(0, pos), size, color, layer);
            display.drawRect(x+((pos+3)*8)-1, y+2, 5, 5, color, layer);
            display.drawString(x+((pos+3)*8)+5, y, value.substr(pos+1), size, color, layer);
        } else {
            display.drawString(x, y, value, 2, color, Layer.Layer0);                
        }
    }

    private drawLines = () => {    
        if (!this.state) {
            return;
        }    

        if (this.state.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY
            && this.state.actionStep >= 1
        ) {
            this.drawInput(this.state.availableNetworks[this.state.selectedIndex], this.state.input);
            return;
        }

        if (this.scrollDone.reduce((previousValue, currentValue, currentIndex) => {
            return currentIndex >= this.lines.length ? previousValue : (previousValue && currentValue);
        }) === true) {
            this.scrollDone = [true, false, false, false];
        }

        const item = this.getMenuItemByKey(this.state.currentMenu, this.state.menu);
        for (let index = this.state.menuBottom; index <= this.state.menuTop; index += 1) {
            const {x, y} = this.getLineCoordinates(index-this.state.menuBottom);
            const selected = (item.selectable && this.state.selectedIndex === index) || false;
            this.displayLineScrolling(index, x, y, selected);
        }
    }

    private drawInput = (header: string, value: string) => {
        // this.lines[0] = state.scan[state.currentIndex].ssid;
        // this.displayLineScrolling(0, 0, 0, false);
        this.drawFixedString(0, 0,  header, 2, Color.White, Layer.Layer0);
        
        for (let i = 0; i < value.length; i += 1) {
            if (i === (value.length - 1)) {
                display.drawChar((i - (Math.floor(i / 10) * 10))*12, 4+(Math.floor(i / 10)+1)*20, value.charCodeAt(i), 2, Color.White, Layer.Layer0);
            } else {
                display.drawChar((i - (Math.floor(i / 10) * 10))*12, 4+(Math.floor(i / 10)+1)*20, '*'.charCodeAt(0), 2, Color.White, Layer.Layer0);
            }
        }
        
        if (value.length > 20) {
            display.drawLine(0, 40, 132, 40, Color.White, Layer.Layer0);
            display.drawLine(0, 62, 132, 62, Color.White, Layer.Layer0)
        } else if (value.length > 10) {
            display.drawLine(0, 40, 132, 40, Color.White, Layer.Layer0);
            display.drawLine(0, 62, 12*value.length, 62, Color.White, Layer.Layer0);            
            if (this.characterOn === 1) {
                display.drawLine(12*(value.length-1), 62, 12*value.length, 62, Color.White, Layer.Layer0);            
            }
            display.drawLine(12*value.length, 62, 132, 62, Color.White, Layer.Layer0);            
        } else {
            display.drawLine(0, 40, 12*value.length, 40, Color.White, Layer.Layer0);            
            if (this.characterOn === 1) {
                display.drawLine(12*(value.length-1), 40, 12*value.length, 40, Color.White, Layer.Layer0);            
            }
            display.drawLine(12*value.length, 40, 132, 40, Color.White, Layer.Layer0);            
            display.drawLine(0, 62, 132, 62, Color.White, Layer.Layer0)
        }

        this.characterOn = (this.characterOn - 1) * -1;
    }


    private getLineCoordinates = (index: number): { x: number, y: number } => {
        if ((this.lines.length === 2) && (index === 1)) {
            if (this.state && !this.state.scriptRunning) {
                return { x: 4, y: 45 };
            } else {
                return { x: 0, y: 45 };
            }
        } 
        return { x: 0, y: (index * 16) };
    }

    private resetPosition() {
        this.scrollPos = [0, 0, 0, 0];
    }

    private getSettingsItems = (): string[] => {
        if (!this.state || this.state.currentMenu === '') {
            return [Constants.MENU.SETTINGS.TITLE];
        }

        const menuPath = this.state.currentMenu.split('.').map(s => parseInt(s));
        menuPath.shift();

        let item = this.state.menu;
        for (let index of menuPath) {
            item = item.children![index]
        }

        if (this.state.executing) {
            switch (item.key) {
                case Constants.MENU.SETTINGS.NETWORK.VIEW.KEY: {
                    if (this.state.networkInfo) {
                    // show network settings and return (ie. URL)
                        return [
                            Constants.MENU.SETTINGS.NETWORK.TITLE, 
                            `${this.state.networkInfo.ssid}`, 
                            `${this.state.networkInfo.ip}`,
                            `http://${this.state.networkInfo.ip}${HTTP_PORT !== 80 ? `:${HTTP_PORT}` : ''}`
                        ];
                    }
                    break;
                }

                case Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY: {
                    // connect to WiFi
                    switch (this.state.actionStep) {
                        case 0: {
                            if (this.state.availableNetworks) {
                                // show network settings and return (ie. URL)
                                return [
                                    ...this.state.availableNetworks
                                ];
                            }
                            break;        
                        }
                    }
                    break;
                }
            }
            return [item.title];
        }
        
        return item.children ? item.children.map(m => m.title) : [item.title];
    }

    private setLinesAndIcon = () => {
        this.lastLines = this.lines;

        if (!this.state) {
            this.lines = [Constants.APPLICATION_TITLE];
            this.icon = home;
            return;
        }

        let lines = this.lines;
        let flashStatus = this.flashStatus;

        if (this.state.isPassphrase) {
            lines = [Constants.APPLICATION_TITLE, this.state.passphrase];            
        } else {
            switch (this.state.mode) {
                case EnailMode.Script: {
                    lines = [
                        this.state.scriptTitle
                    ];
                    break;
                }
                case EnailMode.Settings: {
                    lines = this.getSettingsItems();
                    break;
                }
                default: {
                    if (this.state.scriptRunning) {
                        const elapsed = Date.now() - this.state.scriptStartTime;
                        const m = Math.floor(elapsed / 60000);
                        const s = Math.floor((elapsed % 60000) / 1000);
                        const d = `${m}:${s.toString().length === 1 ? '0' : ''}${s}`;
                        lines = [this.state.scriptTitle, this.state.stepMessage || d];
                    } else {
                        lines = [Constants.APPLICATION_TITLE];
                    }
                    break;
                }
            }

            if (lines.length === 1) {
                lines.push(`${format(Date.now(), 'h:mm')}`);
            }

            this.icon = getIconByName(this.state.icon);
        }

        this.lines = lines;
    }

    render = (newState: IOledState) => {
        let changed = false;
        if (!this.running) {
            changed = true;
            this.running = true;
        }
        this.lastState = this.state;
        this.state = newState;

        if (!changed) {
            const s1: any = this.lastState;
            const s2: any = this.state;
            for (let key of Object.keys(s1)) {
                if (s1[key] !== s2[key]) {
                    changed = true;
                }
            }
        }

        this.setLinesAndIcon();

        if (this.lines.filter((l, i) => l !== this.lastLines[i]).length > 0) {
            changed = true;
            this.scrollPos = [0, 0, 0, 0];
            this.scrollDone = [this.state.mode === EnailMode.Settings, false, false, false];
        }

        if (changed || this.state.flashRate > 0 || this.state.passphrase) {
            // render
            this.flashStatus = !this.flashStatus;

            // Clear display buffer
            display.clearScreen();
            
            display.setFont(Font.UbuntuMono_8ptFontInfo);
    
            this.drawLines();
    
            if (
                (this.flashStatus || this.state.flashRate === 0) 
                && (this.lines.length < 3) 
                && (!this.state.isPassphrase)
                && (!(
                    this.state.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY 
                    && this.state.actionStep >= 1
                ))
            ) {
                this.drawIcon();
            }
    
            this.lastUpdate = Date.now();
            display.refresh();           
        }
    }

    getMenuItemByKey = (key: string, rootMenu: IMenuItem): IMenuItem => {
        if (key === '') {
            return rootMenu;
        }
    
        const menuPath = key.split('.').map(s => parseInt(s));
        menuPath.shift();
        
        let item = rootMenu;
        for (let index of menuPath) {
            item = item.children![index];
        }
    
        return item;
    }
}

const oledUi = new OledUi();
oledUi.start(config.options.hardware.oled.address);

process.on('message', m => {
    if (!m) {
        return;
    }

    oledUi.render(m as IOledState);
});

process.on('exit', () => {
    oledUi.stop();
});
