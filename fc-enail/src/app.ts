/*
 * File: c:\fc-enail\fc-enail\src\app.ts
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
import aplay from './aplay';
import store from './store/createStore';
import { toggleState, runScript, endScript, setMode, increaseCurrentScript, decreaseCurrentScript, loadSavedState, clearPassphrase, setSP, stepMoveTemp, updateAllState, moveSetPoint } from './reducers/enailReducer';
import oledUi from './ui/oledUi';
import button from './ui/button';
import led from './ui/led';
import consoleUi from './ui/consoleUi';
import { EnailMode } from './models/IEnailState';
import server from './server/server';
import { settingSelect, settingDown, settingUp, settingBack, connectWiFiNetwork, getNetworkInfo } from './reducers/menuReducer';
import * as Constants from './models/constants';
import { fork, ChildProcess } from 'child_process'
import { config } from './config';

import Debug from 'debug';
const debug = Debug('fc-enail:app');

let processExitCount = 0;
let processExitRunning = false;
let dial: ChildProcess;

const initDial = () => {
    let env = process.env;
    delete env.NODE_OPTIONS;
    dial = fork(`${__dirname}/ui/rotaryDial.js`);

    dial.on('message', m => {
        switch (m.type) {
            case 'ROTATION': {
                switch (store.getState().enail.mode) {
                    case EnailMode.Home: {
                        const newValue: number = (m.offset < 0 ? -1 : 1) * m.step;
                        debug(`Modify Set Point = ${newValue}`);
                        store.dispatch(moveSetPoint(newValue));
                        break;
                    }

                    case EnailMode.Script: {
                        if (m.offset > 0) {
                            store.dispatch(increaseCurrentScript());
                        } else if (m.offset < 0) {
                            store.dispatch(decreaseCurrentScript());
                        }
                        break;
                    }
                    case EnailMode.Settings: {
                        if (m.offset > 0) {
                            store.dispatch(settingDown(Math.ceil(m.step/2.5)));
                        } else if (m.offset < 0) {
                            store.dispatch(settingUp(Math.ceil(m.step/2.5)));
                        }    
                        break;
                    }
                }
                break;
            }

            case 'CLICK': {
                // change menu
                switch (store.getState().enail.mode) {
                    case EnailMode.Home: {
                        dial.send({ type: 'MODE', mode: EnailMode.Script});
                        store.dispatch(setMode(EnailMode.Script));
                        break;
                    }
                    case EnailMode.Script: {
                        dial.send({ type: 'MODE', mode: EnailMode.Settings});
                        store.dispatch(setMode(EnailMode.Settings));
                        break;
                    }
                    case EnailMode.Settings: {
                        dial.send({ type: 'MODE', mode: EnailMode.Home});
                        store.dispatch(settingBack());
                        //store.dispatch(setMode(EnailMode.Home));
                        break;
                    }
                }
                break;
            }
        }
    })
}

const initButton = async () => {
    button.init(25);
    button.onClick.subscribe(() => {
        if (processExitRunning) {
            processExitRunning = false;
            return;
        }

        const state = store.getState().enail;
        if (state.passphrase !== '') {
            store.dispatch(clearPassphrase());
            return;
        }
        
        switch (state.mode) {
            case EnailMode.Home: {
                store.dispatch<any>(toggleState());
                break;
            }

            case EnailMode.Script: {
                if (state.scriptRunning) {
                    store.dispatch<any>(endScript());
                } else {
                    store.dispatch<any>(runScript());
                }
                break;
            }

            case EnailMode.Settings: {
                store.dispatch<any>(settingSelect());
                break;
            }
        }
    });

    button.onMediumClick.subscribe(() => {
        if (processExitRunning) {
            processExitRunning = false;
            return;
        }

        const state = store.getState();
        switch (state.enail.mode) {
            case EnailMode.Script: {
                store.dispatch<any>(toggleState());
                break;
            }

            case EnailMode.Home: {
                if (state.enail.scriptRunning) {
                    store.dispatch<any>(endScript());
                } else {
                    store.dispatch<any>(runScript());
                }
                break;
            }

            case EnailMode.Settings: {
                if ((state.menu.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY)
                    && (state.menu.actionStep === 1)
                ) {
                    store.dispatch<any>(connectWiFiNetwork(state.menu.scan![state.menu.currentIndex].ssid, state.menu.passphrase));
                }
            }
        }
    });

    button.onLongClick.subscribe(() => {
        if (processExitRunning) {
            processExitRunning = false;
            return;
        }

        if (store.getState().enail.mode !== EnailMode.Home) {
            return;
        }
        
        processExitCount = 0;
        processExitRunning = true;
        processExit(1);
    });

    button.onReallyLongLick.subscribe(() => {
        if (processExitRunning) {
            processExitRunning = false;
            return;
        }

        if (store.getState().enail.mode !== EnailMode.Home) {
            return;
        }

        processExitCount = 0;
        processExitRunning = true;
        processExit(2);
    });
}

const processExit = (code: 1|2) => {
    if (!processExitRunning) {
        processExitCount = 0;
        return;
    }
    
    if (processExitCount >= (5 * code)) {
        aplay.play('longbeep');    
        new Promise(resolve => {
            setTimeout(() => {resolve();}, 1000);
        }).then(() => {
            if (processExitRunning) {
                process.exit(code);
            }
        })
        return;
    }

    aplay.play('beep');
    new Promise(resolve => {
        setTimeout(() => {resolve();}, 1000/code);
    }).then(() => {
        processExitCount += 1;
        processExit(code);        
    });
}


// initialize stuff
led.init(5);
consoleUi.init();

//store.dispatch<any>(connect());
store.dispatch<any>(loadSavedState());
store.dispatch<any>(getNetworkInfo());

initDial();
initButton();
oledUi.start(config.options.hardware.oled.address);
aplay.init({
    basePath: `${__dirname}/assets/sounds/`
});
server.init();

aplay.play('appear');

process.on('exit', () => {
    dial.kill();
});