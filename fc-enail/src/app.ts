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
import dial from './ui/rotaryDial';
import aplay from './aplay';
import store from './store/createStore';
import { connect, increaseSP, decreaseSP, toggleState, runScript, endScript, setMode, increaseCurrentScript, decreaseCurrentScript, loadSavedState, clearPassphrase } from './reducers/enailReducer';
import oledUi from './ui/oledUi';
import button from './ui/button';
import led from './ui/led';
import consoleUi from './ui/consoleUi';
import { EnailMode } from './models/IEnailState';
import server from './server/server';
import { settingSelect, settingDown, settingUp, settingBack, connectWiFiNetwork, getNetworkInfo } from './reducers/menuReducer';
import e5cc from './e5cc/e5cc';

import * as Constants from './models/constants';

const OLED_ADDRESS = 0x3C;

let processExitCount = 0;
let processExitRunning = false;

const initDial = () => {
    dial.init(22, 23, 24);

    dial.onClockwise.subscribe(() => {
        switch (store.getState().enail.mode) {
            case EnailMode.Home: {
                store.dispatch(increaseSP());
                break;
            }
            case EnailMode.Script: {
                store.dispatch(increaseCurrentScript());
                break;
            }
            case EnailMode.Settings: {
                store.dispatch(settingDown());
                break;
            }
        }
    });

    dial.onCounterClockwise.subscribe(() => {
        switch (store.getState().enail.mode) {
            case EnailMode.Home: {
                store.dispatch(decreaseSP());
                break;
            }
            case EnailMode.Script: {
                store.dispatch(decreaseCurrentScript());
                break;
            }
            case EnailMode.Settings: {
                store.dispatch(settingUp());
                break;
            }
        }
    });

    dial.onClick.subscribe(() => {
        // change menu
        switch (store.getState().enail.mode) {
            case EnailMode.Home: {
                store.dispatch(setMode(EnailMode.Script));
                break;
            }
            case EnailMode.Script: {
                store.dispatch(setMode(EnailMode.Settings));
                break;
            }
            case EnailMode.Settings: {
                store.dispatch(settingBack());
                //store.dispatch(setMode(EnailMode.Home));
                break;
            }
        }
    });
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
    button.onDoubleClick.subscribe(() => {
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
        
        e5cc.close().then(() => {
            processExitCount = 0;
            processExitRunning = true;
            processExit(1);
        });
    });

    button.onReallyLongLick.subscribe(() => {
        if (processExitRunning) {
            processExitRunning = false;
            return;
        }

        if (store.getState().enail.mode !== EnailMode.Home) {
            return;
        }

        e5cc.close().then(() => {
            processExitCount = 0;
            processExitRunning = true;
            processExit(2);
        });
    });
}

const processExit = (code: 1|2) => {
    if (!processExitRunning) {
        processExitCount = 0;
        return;
    }
    
    if (processExitCount >= (6 * code)) {
        process.exit(code);
    }

    new Promise(resolve => {
        aplay.play('beep');
        setTimeout(() => {
            resolve()
        }, 1000/code);
    }).then(() => {
        processExitCount += 1;
        processExit(code);
    });
}


// initialize stuff
led.init(5);
consoleUi.init();

store.dispatch<any>(connect());
store.dispatch<any>(loadSavedState());
store.dispatch<any>(getNetworkInfo());

initDial();
initButton();
oledUi.start(OLED_ADDRESS);
aplay.init({
    basePath: `${__dirname}/assets/sounds/`
});
server.init();

aplay.play('appear');
