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
import * as Constants from '../models/constants';
import { getCurrentMenuItem } from '../reducers/menuReducer';
import Debug from 'debug';
import { HTTP_PORT } from '../server/server';
import { IMenuState } from '../models/IMenuState';

const debug = Debug('fc-enail:oled');

const DISPLAY_REFRESH_RATE = 1000;

export class OledUi {
    private running: boolean = false;
    private flashStatus: boolean = true;
    private flashRate: number = 0;
    private icon: Uint8Array = home;
    private lines: string[] = ["", ""];
    private currentIcon: Uint8Array = home;
    private currentFlashRate: number = 0;
    private currentMenu: string = '-';
    private currentExecuting: boolean = false;
    private lastUpdate: number = 0;
    private selectedIndex = -1;
    private timeout?: NodeJS.Timeout;
    private scrollPos: number[] = [0, 0, 0, 0];
    private scrollDone: boolean[] = [true, false, false, false];
    private characterOn: number = 1;

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

    displayLineScrolling = (index: number, x: number, y: number, selected: boolean) => {
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

    drawFixedString = (x: number, y:number, value: string, size: number, color: Color, layer: Layer) => {
        if (value.indexOf('\u00B0') >= 0) {
            const pos = value.indexOf('\u00B0');
            display.drawString(x, y, value.substring(0, pos), size, color, layer);
            display.drawRect(x+((pos+3)*8)-1, y+2, 5, 5, color, layer);
            display.drawString(x+((pos+3)*8)+5, y, value.substr(pos+1), size, color, layer);
        } else {
            display.drawString(x, y, value, 2, color, Layer.Layer0);                
        }
    }

    getNewState = () => {
        const state = store.getState();
        let lines = this.lines;
        let icon = this.currentIcon;
        let flashRate = this.currentFlashRate;
        let flashStatus = this.flashStatus;
        let selectedIndex = state.menu.currentIndex;
        let selectedMenu = state.menu.currentMenu;
        let executing = state.menu.executing;
        
        switch (state.enail.mode) {
            case EnailMode.Script: {
                lines = [
                    state.enail.currentScript ? state.enail.currentScript.title : '-Select-'
                ];
                break;
            }
            case EnailMode.Settings: {
                lines = this.getSettingsItems();
                break;
            }
            default: {
                if (state.enail.scriptRunning) {
                    lines = [state.enail.currentScript!.title, state.enail.currentStep!.message || `Step ${state.enail.currentStep!.key}`];
                } else {
                    lines = ['FC E-Nail']
                }
                break;
            }
        }

        if (lines.length === 1) {
            lines.push(`${format(Date.now(), 'h:mm')}`);
        }

        return {
            lines, icon, flashRate, flashStatus, selectedIndex, selectedMenu, executing, mode: state.enail.mode
        };
    }
    
    drawLines = () => {        
        const state = store.getState().menu;

        if (state.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY
            && state.actionStep >= 1
        ) {
            this.drawInput(state);
            return;
        }

        if (this.scrollDone.reduce((previousValue, currentValue, currentIndex) => {
            return currentIndex >= this.lines.length ? previousValue : (previousValue && currentValue);
        }) === true) {
            this.scrollDone = [true, false, false, false];
        }

        const item = getCurrentMenuItem(store.getState().menu);
        for (let index = state.bottom; index <= state.top; index += 1) {
            const {x, y} = this.getLineCoordinates(index-state.bottom);
            const selected = (item.selectable && store.getState().menu.currentIndex === index) || false;
            this.displayLineScrolling(index, x, y, selected);
        }
    }

    drawInput = (state: IMenuState) => {
        // this.lines[0] = state.scan[state.currentIndex].ssid;
        // this.displayLineScrolling(0, 0, 0, false);
        this.drawFixedString(0, 0, state.scan[state.currentIndex].ssid, 2, Color.White, Layer.Layer0);
        
        let passphrase = state.passphrase;
        for (let i = 0; i < passphrase.length; i += 1) {
            if (i === (passphrase.length - 1)) {
                display.drawChar((i - (Math.floor(i / 10) * 10))*12, 4+(Math.floor(i / 10)+1)*20, passphrase.charCodeAt(i), 2, Color.White, Layer.Layer0);
            } else {
                display.drawChar((i - (Math.floor(i / 10) * 10))*12, 4+(Math.floor(i / 10)+1)*20, '*'.charCodeAt(0), 2, Color.White, Layer.Layer0);
            }
        }
        if (passphrase.length > 20) {
            display.drawLine(0, 40, 132, 40, Color.White, Layer.Layer0);
            display.drawLine(0, 62, 132, 62, Color.White, Layer.Layer0)
        } else if (passphrase.length > 10) {
            display.drawLine(0, 40, 132, 40, Color.White, Layer.Layer0);
            display.drawLine(0, 62, 12*passphrase.length, 62, Color.White, Layer.Layer0);            
            if (this.characterOn === 1) {
                display.drawLine(12*passphrase.length, 62, 12, 62, Color.White, Layer.Layer0);            
            }
            display.drawLine(12*(passphrase.length+1), 62, 132, 62, Color.White, Layer.Layer0);            
        } else {
            display.drawLine(0, 40, 12*passphrase.length, 40, Color.White, Layer.Layer0);            
            if (this.characterOn === 1) {
                display.drawLine(12*passphrase.length, 40, 12, 40, Color.White, Layer.Layer0);            
            }
            display.drawLine(12*(passphrase.length+1), 40, 132, 40, Color.White, Layer.Layer0);            
            display.drawLine(0, 62, 132, 62, Color.White, Layer.Layer0)
        }

        this.characterOn = (this.characterOn - 1) * -1;
    }


    getLineCoordinates = (index: number): { x: number, y: number } => {
        if ((this.lines.length === 2) && (index === 1)) {
            if (!store.getState().enail.scriptRunning) {
                return { x: 4, y: 45 };
            } else {
                return { x: 0, y: 45 };
            }
        } 
        return { x: 0, y: (index * 16) };
    }

    resetPosition() {
        this.scrollPos = [0, 0, 0, 0];
    }

    getSettingsItems = (): string[] => {
        const state = store.getState().menu;
        if (state.currentMenu === '') {
            return [Constants.MENU.SETTINGS.TITLE];
        }

        const menuPath = state.currentMenu.split('.').map(s => parseInt(s));
        menuPath.shift();

        let item = state.menu;
        for (let index of menuPath) {
            item = item.children![index]
        }

        if (state.executing) {
            switch (item.key) {
                case Constants.MENU.SETTINGS.NETWORK.VIEW.KEY: {
                    if (state.networkInfo) {
                    // show network settings and return (ie. URL)
                        return [
                            Constants.MENU.SETTINGS.NETWORK.TITLE, 
                            `${state.networkInfo.ssid}`, 
                            `${state.networkInfo.ip}`,
                            `http://${state.networkInfo.ip}:${HTTP_PORT}`
                        ];
                    }
                    break;
                }

                case Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY: {
                    // connect to WiFi
                    switch (state.actionStep) {
                        case 0: {
                            if (state.scan.length > 0) {
                                // show network settings and return (ie. URL)
                                return [
                                    ...state.scan.map(value => value.ssid)
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

    renderTimer = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            const state = this.getNewState();
    
            if (
                ((Date.now() - this.lastUpdate) >= (this.flashRate * 1000)) 
                || (this.lines.filter((l, i) => l !== state.lines[i]).length > 0) 
                || this.icon !== this.currentIcon 
                || this.flashRate !== this.currentFlashRate 
                || this.selectedIndex !== state.selectedIndex
                || this.currentExecuting !== state.executing
                || this.currentMenu !== state.selectedMenu
                || this.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY
            ) {
                this.currentFlashRate = this.flashRate;
                this.currentIcon = this.icon;
                this.selectedIndex = state.selectedIndex;
                this.currentMenu = state.selectedMenu;
                this.currentExecuting = state.executing;
                
                if (this.lines.filter((l, i) => l !== state.lines[i]).length > 0) {
                    this.scrollPos = [0, 0, 0, 0];
                    this.scrollDone = [state.mode === EnailMode.Settings, false, false, false];
                }
                this.lines = state.lines;

                this.flashStatus = !this.flashStatus;

                // Clear display buffer
                display.clearScreen();
                
                display.setFont(Font.UbuntuMono_8ptFontInfo);

                this.drawLines();

                if ((this.flashStatus || this.flashRate === 0) && this.lines.length < 3) {
                    this.drawIcon();
                }

                this.lastUpdate = Date.now();
                display.refresh();           
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