import { IEnailStore } from '../models/IEnailStore';
import { Store, Dispatch } from 'redux';
import { EnailAction } from '../models/Actions';

import * as Constants from '../models/constants';

import Debug from 'debug';
import { setMode } from '../reducers/enailReducer';
import { EnailMode } from '../models/IEnailState';
import { getNetworkInfo, getMenuItemByKey, internalSelect, getWiFiNetworks, settingBack, navigate } from '../reducers/menuReducer';
import { exec } from 'child_process';
import aplay from '../aplay';
const TEMP_WPA_SUPPLICANT_CONF = '/home/pi/wpa_supplicant.conf';

const debug = Debug("fc-enail:settings");

export const settingsMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const state = store.getState();

    switch (action.type) {
        case Constants.SETTING_BACK: {
            debug(`Current Menu = ${state.menu.currentMenu}`);
            if (state.menu.currentMenu === '') {
                store.dispatch(setMode(EnailMode.Home));
            }
            break;
        }

        case Constants.SETTING_SELECT: {
            const state = store.getState().menu;
            const newKey = internalSelect(state);
            let item = getMenuItemByKey(newKey, state.menu);

            //const actionStep = item.action === undefined ? 0 : Math.min(state.actionStep + 1, item.maxAction!);
            debug(`Action Step = ${state.actionStep}`);
            if (item.action && item.action !== '') {
                switch (item.action) {
                    case Constants.MENU.SETTINGS.NETWORK.CONNECT.ACTION: {
                        switch (state.actionStep) {
                            case 0: {
                                store.dispatch<any>(getWiFiNetworks());
                                break;
                            }

                        }
                        break;
                    }
                    case Constants.MENU.SETTINGS.NETWORK.VIEW.ACTION: {
                        store.dispatch<any>(getNetworkInfo());
                        break;
                    }
                    case Constants.MENU.SETTINGS.NETWORK.SAVE.ACTION: {
                        exec("sudo cat /home/pi/wpa_supplicant.conf | grep -v -E '\s*#.*' > /etc/wpa_supplicant/wpa_supplicant.conf && sudo rm /home/pi/wpa_supplicant.conf", () => {
                            setTimeout(() => {
                                aplay.play('complete');
                                store.dispatch(navigate(Constants.MENU.SETTINGS.KEY));
                            }, 1000);
                        });
                        break;
                    }
                }
            }
            break;
        }

        case Constants.NETWORK_CONNECTING: {
            const { ssid, passphrase } = action.payload as any;
            var command = "sudo cat /etc/wpa_supplicant/wpa_supplicant.conf | sed -n '1h;1!H;${;g;s/network={[^{}]*}//g;p;}' > " + TEMP_WPA_SUPPLICANT_CONF
                + " && sudo wpa_passphrase " + ssid + " \"" + passphrase + "\" >> " + TEMP_WPA_SUPPLICANT_CONF
                + " && sudo killall wpa_supplicant"
                + " && sudo wpa_supplicant -B -s -Dnl80211 -iwlan0 -c" + TEMP_WPA_SUPPLICANT_CONF
                + " && sudo dhclient wlan0";
            
            exec(command, err => {
                setTimeout(() => {
                    aplay.play('complete');
                    store.dispatch<any>(getNetworkInfo());
                    store.dispatch(navigate(Constants.MENU.SETTINGS.NETWORK.VIEW.KEY));
                }, 5000);
            });                       
        }
    }

    return next(action);
}
