import { Dispatch } from 'redux';
import { RSAA } from 'redux-api-middleware';
import { Zeroconf } from '@ionic-native/zeroconf';

import { IEnailState } from '../models/IEnailState';
import { ISavedState } from '../models/ISavedState';
import { EnailAction, IErrorAction } from '../models/Actions';
import * as Constants from '../models/constants';
import { IEnailEmitState } from 'src/models/IEnailEmitState';
import { IEnailScript } from '../models/IEnailScript';
import { IVerifyTokenResponse } from '../models/IVerifyTokenResponse';
import { IPidSettings } from '../models/IPidSettings';

const initialState: IEnailState = {
    serviceFound: false,
    connected: false,
    requesting: false,
    reconnect: false,
    presets: [],
    token: ''
};

export const connectSocket = () => {
    return {
        type: Constants.SOCKET_CONNECT
    };
}

export const socketConnected = () => {
    return {
        type: Constants.SOCKET_CONNECTED
    }
}

export const socketDisconnected = () => {
    return {
        type: Constants.SOCKET_DISCONNECTED
    }
}

export const receiveEnailState = (reading: IEnailEmitState) => {
    return {
        type: Constants.SOCKET_EMIT_STATE,
        payload: reading
    }
}

export const getScripts = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/scripts`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.SCRIPTS_REQUEST,
                Constants.SCRIPTS_RESPONSE,
                Constants.SCRIPTS_ERROR
            ]
        }
    }
}

export const reconnect = (retry: boolean, ignoreCache: boolean = false) => {
    return async (dispatch: Dispatch<EnailAction>) => {
        if (retry) {
            try {
                // dispatch({
                //     type: Constants.SERVICE_FOUND,
                //     payload: 'http://172.19.0.21:4000'
                // });
                // return;
                const serviceUrl = await fetchServiceUrl(ignoreCache);

                dispatch({
                    type: Constants.SERVICE_FOUND,
                    payload: serviceUrl
                });
            } catch {
                if (!ignoreCache) {
                    dispatch<any>(reconnect(true, true));
                } else {
                    dispatch<any>(reconnect(false, false));
                }
            }
            // dispatch<any>(getScripts());
            // dispatch<any>(getSavedState());
            // dispatch<any>(connectSocket());
        } else {
            dispatch({
                type: Constants.RECONNECT,
                payload: retry
            });        
        }
    };
}

export const connectManual = (serviceUrl: string) => {
    return (dispatch: Dispatch<EnailAction>) => {
        fetch(serviceUrl)
        .then((response: Response) => {
            if (response.status !== 200) {
                dispatch<any>(reconnect(false, false));
            } else {
                dispatch({
                    type: Constants.SERVICE_FOUND,
                    payload: serviceUrl
                })
            }
        });
    };
}

const getServiceUrl = (): string => {
    return localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL) || '';
}

const fetchServiceUrl = (ignoreCache: boolean): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const serviceUrl = ignoreCache ? '' : localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL) || '';
        if (serviceUrl !== '') {
            const timeout = setTimeout(() => {
                reject();
            }, 5000);

            fetch(serviceUrl)
            .then((response: Response) => {
                clearTimeout(timeout);
                if (response.status !== 200) {
                    reject();
                } else {
                    resolve(serviceUrl);
                }
            }).catch(() => {
                reject();
            });
            return;
        }

        const zeroconf = new Zeroconf();
        const timeout2 = setTimeout(() => {
            reject();
        }, 5000);

        zeroconf.watch('_fc-enail._tcp.', 'local.').subscribe((result: { action: string, service: any }) => {
            switch (result.action) {
                case 'resolved': {
                    clearTimeout(timeout2);
                    
                    const url = `http://${result.service.ipv4Addresses[0]}:${result.service.port}`;

                    const timeout3 = setTimeout(() => {
                        reject();
                    }, 5000);
                    
                    fetch(url)
                    .then((response: Response) => {
                        clearTimeout(timeout3);
                        if (response.status !== 200) {
                            reject();
                        } else {
                            resolve(url);
                        }
                    }).catch(() => {
                        reject();
                    });

                    zeroconf.unwatch('_fc-enail._tcp.', 'local.');
                    break;
                }
            }
        }, () => {
            // localStorage.setItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL, config.serviceUrl);
            reject();
            return;    
        });
    });
}

export const setSP = (value: number) => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/sp/${value}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.SETSP_REQUEST,
                Constants.SETSP_RESPONSE,
                Constants.SETSP_ERROR
            ]
        }
    };
}

export const toggleState = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/state`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.TOGGLE_STATE_REQUEST,
                Constants.TOGGLE_STATE_RESPONSE,
                Constants.TOGGLE_STATE_ERROR
            ]
        }
    }
}

export const toggleTuning = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/autotune`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.AUTOTUNE_REQUEST,
                Constants.AUTOTUNE_RESPONSE,
                Constants.AUTOTUNE_ERROR
            ]
        }
    }
}

export const savePidSettings = (pidSettings: IPidSettings) => {
    alert(JSON.stringify(pidSettings));
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/savepid`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pidSettings),
            types: [
                Constants.SAVEPID_REQUEST,
                Constants.SAVEPID_RESPONSE,
                Constants.SAVEPID_ERROR
            ]
        }
    };
}

export const runScript = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/script/run`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.RUN_SCRIPT_REQUEST,
                Constants.RUN_SCRIPT_RESPONSE,
                Constants.RUN_SCRIPT_ERROR
            ]
        }
    };
}

export const endScript = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/script/end`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.END_SCRIPT_REQUEST,
                Constants.END_SCRIPT_RESPONSE,
                Constants.END_SCRIPT_ERROR
            ]
        }
    };
}

export const setScript = (index: number) => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/script/set/${index}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.SET_SCRIPT_REQUEST,
                Constants.SET_SCRIPT_RESPONSE,
                Constants.SET_SCRIPT_ERROR
            ]
        }
    };
}

export const generatePassphrase = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/passphrase/generate`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.PASSPHRASE_GENERATE_REQUEST,
                Constants.PASSPHRASE_GENERATE_RESPONSE,
                Constants.PASSPHRASE_GENERATE_ERROR
            ]
        }
    };
}

export const verifyPassphrase = (passphrase: string) => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/passphrase/verify`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ passphrase } as { passphrase: string }),
            types: [
                Constants.PASSPHRASE_VERIFY_REQUEST,
                Constants.PASSPHRASE_VERIFY_RESPONSE,
                Constants.PASSPHRASE_VERIFY_ERROR
            ]
        }
    };
}

export const findEnailService = () => {
    return (dispatch: Dispatch<EnailAction>) => {
        const zeroconf = (cordova.plugins as any).zeroconf;
        zeroconf.watch('_fc-enail._tcp.', 'local.', (result: { action: string, service: any }) => {
            switch (result.action) {
                case 'added': case 'resolved': {
                    dispatch({
                        type: Constants.SERVICE_FOUND,
                        payload: `http://${result.service.ipv4Addresses[0]}:${result.service.port}`
                    });
                    break;
                }
            }
        });
    }
}

export const getSavedState = () => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/savedstate`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.LOAD_SAVED_STATE_REQUEST,
                Constants.LOAD_SAVED_STATE_RESPONSE,
                Constants.LOAD_SAVED_STATE_ERROR
            ]
        }
    };
}

export const persistSavedState = (savedState: ISavedState) => {
    return {
        [RSAA]: {
            endpoint: `${getServiceUrl()}/savedstate`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            types: [
                Constants.PERSIST_SAVED_STATE_REQUEST,
                { type: Constants.PERSIST_SAVED_STATE_RESPONSE, meta: savedState },
                Constants.PERSIST_SAVED_STATE_ERROR
            ],
            body: JSON.stringify(savedState)
        }
    };
}

export const loadToken = (token: string) => {
    return {
        type: Constants.LOAD_TOKEN,
        payload: token
    }
}

export const tokenLoaded = () => {
    return {
        type: Constants.TOKEN_LOADED
    }
}

export const enailReducer = (state: IEnailState = initialState, action: EnailAction): IEnailState => {
    switch (action.type) {
        case Constants.SOCKET_CONNECTED: {
            return {
                ...state,
                connected: true
            };
        }

        case Constants.SOCKET_DISCONNECTED: {
            return {
                ...state,
                connected: false
            };
        }

        case Constants.SOCKET_EMIT_STATE: {
            return {
                ...state,
                emitState: action.payload as IEnailEmitState
            };
        }

        case Constants.SCRIPTS_REQUEST: {
            return {
                ...state,
                requesting: true,
                error: false
            };
        }

        case Constants.SCRIPTS_RESPONSE: {
            return {
                ...state,
                requesting: false,
                error: false,
                scripts: action.payload as IEnailScript[]
            };
        }

        case Constants.SETSP_REQUEST: case Constants.TOGGLE_STATE_REQUEST: 
        case Constants.RUN_SCRIPT_REQUEST: case Constants.END_SCRIPT_REQUEST: 
        case Constants.SET_SCRIPT_REQUEST: case Constants.LOAD_SAVED_STATE_REQUEST: 
        case Constants.PERSIST_SAVED_STATE_REQUEST: case Constants.PASSPHRASE_GENERATE_REQUEST: 
        case Constants.PASSPHRASE_VERIFY_REQUEST: case Constants.AUTOTUNE_REQUEST: 
        case Constants.SAVEPID_REQUEST: {
            return {
                ...state,
                requesting: true,
                error: false
            };
        }

        case Constants.SETSP_RESPONSE: case Constants.TOGGLE_STATE_RESPONSE: 
        case Constants.RUN_SCRIPT_RESPONSE: case Constants.RUN_SCRIPT_RESPONSE: 
        case Constants.SET_SCRIPT_RESPONSE: case Constants.PASSPHRASE_GENERATE_RESPONSE: 
        case Constants.AUTOTUNE_RESPONSE: case Constants.SAVEPID_RESPONSE: {
            return {
                ...state,
                requesting: false,
                error: false
            };
        }

        case Constants.SCRIPTS_ERROR: case Constants.SETSP_ERROR: case Constants.TOGGLE_STATE_ERROR: 
        case Constants.RUN_SCRIPT_ERROR: case Constants.END_SCRIPT_ERROR: 
        case Constants.SET_SCRIPT_ERROR: case Constants.PERSIST_SAVED_STATE_ERROR:
        case Constants.PASSPHRASE_GENERATE_ERROR: case Constants.PASSPHRASE_VERIFY_ERROR: 
        case Constants.AUTOTUNE_ERROR: case Constants.SAVEPID_ERROR: {
            return {
                ...state,
                requesting: false,
                error: true,
                message: !action.payload ? undefined : (action as IErrorAction).payload!.message
            };
        }

        case Constants.PERSIST_SAVED_STATE_RESPONSE: {
            return {
                ...state,
                requesting: false,
                error: false,
                presets: (action.meta as ISavedState).presets
            }
        }

        case Constants.PASSPHRASE_VERIFY_RESPONSE: {
            return {
                ...state,
                requesting: false,
                error: false,
                token: (action.payload as IVerifyTokenResponse).token
            };
        }

        case Constants.LOAD_TOKEN: {
            return {
                ...state,
                token: action.payload as string
            }
        }

        case Constants.LOAD_SAVED_STATE_RESPONSE: {
            return {
                ...state,
                requesting: false,
                error: false,
                presets: (action.payload as ISavedState).presets
            };
        }

        case Constants.LOAD_SAVED_STATE_ERROR: {
            return {
                ...state,
                requesting: false,
                error: true,
                message: !action.payload ? undefined : (action as IErrorAction).payload!.message,
                presets: []
            };
        }

        case Constants.SERVICE_FOUND: {
            return {
                ...state,
                serviceFound: true,
                reconnect: false
            }
        }

        case Constants.RECONNECT: {
            return {
                ...state,
                reconnect: true
            };
        }

        default: {
            return state;
        }
    }
}