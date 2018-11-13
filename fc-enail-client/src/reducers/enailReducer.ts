import { Dispatch } from 'redux';
import { RSAA } from 'redux-api-middleware';
import { Zeroconf } from '@ionic-native/zeroconf';

import { IEnailState } from '../models/IEnailState';
import { ISavedState } from '../models/ISavedState';
import { EnailAction, IErrorAction } from '../models/Actions';
import * as Constants from '../models/constants';
import { IEnailEmitState } from 'src/models/IEnailEmitState';
import { IEnailScript } from '../models/IEnailScript';
import config from '../config';

const initialState: IEnailState = {
    serviceFound: false,
    connected: false,
    requesting: false,
    presets: []
};

export const connectSocket = () => {
    return (dispatch: any) => {
        getServiceUrl().then(() => {
            dispatch({
                type: Constants.SOCKET_CONNECT
            });
        });
    }
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
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/scripts`,
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
            });
        });
    };
}

const getServiceUrl = (): Promise<string> => {
    return new Promise<string>(resolve => {
        const serviceUrl = localStorage.getItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL);
        if (serviceUrl) {
            resolve(serviceUrl);
            return;
        }

        const zeroconf = new Zeroconf();

        zeroconf.watch('_fc-enail._tcp.', 'local.').subscribe((result: { action: string, service: any }) => {
            switch (result.action) {
                case 'added': case 'resolved': {
                    const url = `http://${result.service.ipv4Addresses[0]}:${result.service.port}`;
                    localStorage.setItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL, url);
                    resolve(url);
                    zeroconf.unwatch('_fc-enail._tcp.', 'local.');
                    break;
                }
            }
        }, () => {
            localStorage.setItem(Constants.LOCAL_STORAGE_FCENAIL_SERVICE_URL, config.serviceUrl);
            resolve(config.serviceUrl);
            return;    
        });
    });
}

export const setSP = (value: number) => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/sp/${value}`,
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
            });
        });
    }
}

export const toggleState = () => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/state`,
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
            });
        });
    }
}

export const runScript = () => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/script/run`,
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
            });
        });
    }
}

export const endScript = () => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/script/end`,
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
            });
        });
    }
}

export const setScript = (index: number) => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/script/set/${index}`,
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
            });
        });
    }
}

export const findEnailService = () => {
    return (dispatch: Dispatch<EnailAction>) => {
        const zeroconf = (cordova.plugins as any).zeroconf;
        zeroconf.watch('_fc-enail._tcp.', 'local.', (result: { action: string, service: any }) => {
            switch (result.action) {
                case 'added': case 'resolved': {
                    dispatch({
                        type: Constants.SERVICE_FOUND
                    });
                    break;
                }
            }
        });
    }
}

export const getSavedState = () => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/savedstate`,
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
            });
        });
    };
}

export const persistSavedState = (savedState: ISavedState) => {
    return (dispatch: any) => {
        getServiceUrl().then((serviceUrl) => {
            dispatch({
                [RSAA]: {
                    endpoint: `${serviceUrl}/savedstate`,
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
            });
        });
    };
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
        case Constants.PERSIST_SAVED_STATE_REQUEST: {
            return {
                ...state,
                requesting: true,
                error: false
            };
        }

        case Constants.SETSP_RESPONSE: case Constants.TOGGLE_STATE_RESPONSE: 
        case Constants.RUN_SCRIPT_RESPONSE: case Constants.RUN_SCRIPT_RESPONSE: 
        case Constants.SET_SCRIPT_RESPONSE: {
            return {
                ...state,
                requesting: false,
                error: false
            };
        }

        case Constants.SCRIPTS_ERROR: case Constants.SETSP_ERROR: case Constants.TOGGLE_STATE_ERROR: 
        case Constants.RUN_SCRIPT_ERROR: case Constants.END_SCRIPT_ERROR: 
        case Constants.SET_SCRIPT_ERROR: case Constants.PERSIST_SAVED_STATE_ERROR: {
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
                serviceFound: true
            }
        }
        default: {
            return state;
        }
    }
}