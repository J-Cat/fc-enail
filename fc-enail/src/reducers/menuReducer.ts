import { Dispatch } from 'redux';
import { wpa, IWpaCliStatus, IWpaScanResult, wpa_supplicant } from 'wireless-tools';

import { IMenuState, IMenuItem } from '../models/IMenuState';
import { EnailAction, INetworkInfoAction, IWiFiScanAction } from '../models/Actions';
import * as Constants from '../models/constants';

import Debug from 'debug';
const debug = Debug('fc-enail:reducer');

const WPA_CHARS = "-+_!#$%&*@=^ 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/\\,.:;?<>\"'`()[]{}|~"

const initialState: IMenuState = {
    menu: {
        key: Constants.MENU.SETTINGS.KEY,
        title: Constants.MENU.SETTINGS.TITLE,
        selectable: false,
        children: [{
            key: Constants.MENU.SETTINGS.NETWORK.KEY,
            title: Constants.MENU.SETTINGS.NETWORK.TITLE,
            selectable: true,
            children: [{
                key: Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY,
                title: Constants.MENU.SETTINGS.NETWORK.CONNECT.TITLE,
                action: Constants.MENU.SETTINGS.NETWORK.CONNECT.ACTION,
                selectable: true,
                maxAction: 1
            }, {
                key: Constants.MENU.SETTINGS.NETWORK.VIEW.KEY,
                title: Constants.MENU.SETTINGS.NETWORK.VIEW.TITLE,
                action: Constants.MENU.SETTINGS.NETWORK.VIEW.ACTION,
                selectable: false,
                maxAction: 1
            }, {
                key: Constants.MENU.SETTINGS.NETWORK.SAVE.KEY,
                title: Constants.MENU.SETTINGS.NETWORK.SAVE.TITLE,
                action: Constants.MENU.SETTINGS.NETWORK.SAVE.ACTION,
                selectable: false,
                maxAction: 1
            }]
        }]
    },
    currentMenu: '',
    currentIndex: 0,
    currentCharacter: 0,
    passphrase: '',
    top: 3,
    bottom: 0,
    max: 3,
    executing: false,
    actionStep: 0,
    scan: [],
    connecting: false
};

export const settingSelect = () => {
    return {
        type: Constants.SETTING_SELECT
    };
}

export const settingBack = () => {
    return {
        type: Constants.SETTING_BACK
    };
}

export const settingDown = () => {
    return {
        type: Constants.SETTING_DOWN
    };
}

export const settingUp = () => {
    return {
        type: Constants.SETTING_UP
    };
}

export const navigate = (key: string) => {
    return {
        type: Constants.MENU_NAVIGATE,
        payload: key
    }
}

export const getCurrentMenuItem = (state: IMenuState) => {
    return getMenuItemByKey(state.currentMenu, state.menu);
}

export const getMenuItemByKey = (key: string, rootMenu: IMenuItem): IMenuItem => {
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

export const internalSelect = (state: IMenuState) => {
    const item = getCurrentMenuItem(state);

    if ((state.currentMenu !== '') && (item.children && item.children.length > state.currentIndex)) {
        return item.children[state.currentIndex].key;
    } else {
        return item.key;
    }
}

const internalBack = (state: IMenuState) => {
    if (state.currentMenu === '' || state.currentMenu === Constants.MENU.SETTINGS.KEY) {
        return '';
    }

    const menuPath = state.currentMenu.split('.').map(s => parseInt(s));
    menuPath.shift();
    
    let item = state.menu;
    let parent = item;
    for (let index of menuPath) {
        parent = item;
        item = item.children![index];
        debug(`Parent: ${parent.key}`);
    }

    debug(`Final Parent: ${parent.key}`);

    return parent.key;    
}

const internalDown = (state: IMenuState) => {
    const item = getCurrentMenuItem(state);

    if (item.action && item.selectable) {
        if (state.actionStep >= 1) {
            return state.currentIndex;
        } else {
            return state.currentIndex + 1;
        }
    }

    if (item.children && item.children.length > state.currentIndex) {
        return state.currentIndex + 1;
    } else {
        return 0;
    }

}

const internalUp = (state: IMenuState) => {
    const item = getCurrentMenuItem(state);

    if (item.action && item.selectable) {
        if (state.actionStep >= 1) {
            return state.currentIndex;
        } else {
            return state.currentIndex - 1;
        }
    }

    if (state.currentIndex === 0) {
        return item.children ? item.children.length - 1 : 0;
    } else {
        return state.currentIndex - 1;
    }    
}

export const getNetworkInfo = () => {
    return (dispatch: Dispatch<INetworkInfoAction>) => {
        wpa.status('wlan0', (error, status) => {
            if (error) {
                dispatch(settingBack());
                return;
            }

            dispatch({
                type: Constants.NETWORK_INFO,
                payload: status
            });
        });
    }   
}

export const getWiFiNetworks = () => {
    return (dispatch: Dispatch<IWiFiScanAction>) => {
        wpa.scan('wlan0', (scanError) => {
            if (scanError) {
                dispatch(settingBack());
                return;
            }

            wpa.scan_results('wlan0', (error, results) => {
                let sortedResults: IWpaScanResult[] = [];
                for (const result of results) {
                    if (result.ssid && sortedResults.filter(value => value.ssid === result.ssid).length === 0) {
                        sortedResults.push(result);
                    }
                }
                if (sortedResults.length > 0) {
                    sortedResults = sortedResults.sort((a, b) => a.ssid.localeCompare(b.ssid));
                }

                if (error) {
                    dispatch(settingBack());
                    return;
                }

                dispatch({
                    type: Constants.NETWORK_SCAN,
                    payload: sortedResults
                });    
            });
        });
    }   
}

export const connectWiFiNetwork = (ssid: string, passphrase: string) => {
    return {
        type: Constants.NETWORK_CONNECTING,
        payload: {
            ssid,
            passphrase
        }
    };
}


const getNextWpaChar = (c: string) => {
    const newIndex = WPA_CHARS.indexOf(c) + 1;
    if (newIndex < WPA_CHARS.length) {
        return WPA_CHARS[newIndex];
    } else {
        return WPA_CHARS[0];
    }
}

const getPreviousWpaChar = (c: string) => {
    const newIndex = WPA_CHARS.indexOf(c) - 1;
    if (newIndex >= 0) {
        return WPA_CHARS[newIndex];
    } else {
        return WPA_CHARS[WPA_CHARS.length - 1];
    }
}

export const menuReducer = (state: IMenuState = initialState, action: EnailAction): IMenuState => {
    switch (action.type) {
        case Constants.PASSPHRASE_GENERATE: {
            return {
                ...state,
                currentCharacter: 0,
                currentIndex: 0,
                currentMenu: Constants.MENU.SETTINGS.KEY,
                actionStep: 0,
                bottom: 0,
                top: 3
            }
        }
        
        case Constants.MENU_NAVIGATE: {
            return {
                ...state,
                currentCharacter: 0,
                currentIndex: 0,
                currentMenu: action.payload as string,
                actionStep: 0,
                bottom: 0,
                top: 3
            }
        }

        case Constants.SETTING_SELECT: {
            const newKey = internalSelect(state);
            const currentItem = getCurrentMenuItem(state);
            const newItem = getMenuItemByKey(newKey, state.menu);
            const actionStep = currentItem.action === undefined ? 0 : Math.min(state.actionStep + 1, newItem.maxAction!);
            const currentIndex = actionStep >= 1 ? state.currentIndex : 0;
            let passphrase = state.passphrase;
            if (actionStep === 1) {
                if (state.actionStep === 0) {
                    passphrase = 'A';
                } else {
                    passphrase = passphrase + 'A';
                }
            }
            let currentCharacter = passphrase.length - 1;
            return {
                ...state,
                top: 3,
                bottom: 0,
                max: 3,
                currentMenu: newKey,
                currentIndex,
                executing: newItem.action !== undefined,
                actionStep,
                passphrase,
                currentCharacter
            };
        }

        case Constants.SETTING_BACK: {
            if (state.actionStep >= 1) {
                if (state.currentCharacter > 0) {
                    return {
                        ...state,
                        currentCharacter: state.currentCharacter - 1,
                        passphrase: state.passphrase.substr(0, state.passphrase.length-1)
                    }
                }
                return {
                    ...state,
                    actionStep: state.actionStep - 1
                };
            }

            return {
                ...state,
                currentMenu: internalBack(state),
                currentIndex: 0,
                executing: false,
                max: 3,
                top: 3, 
                bottom: 0
            };
        }

        case Constants.SETTING_DOWN: {
            const nextIndex = internalDown(state);
            return {
                ...state,
                currentIndex: nextIndex,
                passphrase: (state.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY)
                        && (state.actionStep >= 1)
                    ? (
                        state.passphrase.substr(0, state.currentCharacter) 
                        + getNextWpaChar(state.passphrase.charAt(state.currentCharacter)) 
                        + state.passphrase.substr(state.currentCharacter+1)
                    ) : state.passphrase,
                top: nextIndex > state.top ? state.top + 1 : state.top,
                bottom: nextIndex > state.top ? state.bottom + 1 : state.bottom
            };
        }

        case Constants.SETTING_UP: {
            const nextIndex = internalUp(state);
            return {
                ...state,
                currentIndex: nextIndex,
                passphrase: (state.currentMenu === Constants.MENU.SETTINGS.NETWORK.CONNECT.KEY)
                        && (state.actionStep >= 1) && (state.passphrase.length > 0)
                    ? (
                        state.passphrase.substr(0, state.currentCharacter) 
                        + getPreviousWpaChar(state.passphrase.charAt(state.currentCharacter)) 
                        + state.passphrase.substr(state.currentCharacter+1)
                    ) : state.passphrase,
                top: nextIndex < state.bottom ? state.top - 1 : state.top,
                bottom: nextIndex < state.bottom ? state.bottom - 1 : state.bottom
            };
        }

        case Constants.NETWORK_INFO: {
            return {
                ...state,
                connecting: false,
                networkInfo: action.payload as IWpaCliStatus
            };
        }

        case Constants.NETWORK_SCAN: {
            return {
                ...state,
                scan: action.payload as IWpaScanResult[],
                max: (action.payload as IWpaScanResult[]).length
            };
        }

        case Constants.NETWORK_CONNECTING: {
            return {
                ...state,
                connecting: true
            };
        }

        default: {
            return state;
        }
    }
}
