/*
 * File: c:\fc-enail\fc-enail\src\reducers\enailReducer.ts
 * Project: c:\fc-enail\fc-enail
 * Created Date: Friday November 9th 2018
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
import { Dispatch, Action } from 'redux';
import * as fs from 'fs';

import { IEnailState, Direction, EnailMode } from '../models/IEnailState';
import { EnailAction, IBasicAction, IE5CCUpdateStateAction, ISetIconAction } from '../models/Actions';
import * as Constants from '../models/constants';
import e5cc from '../e5cc/e5cc';
import { IEnailScript } from '../models/IEnailScript';
import { IFeedbackStep } from '../models/IFeedbackStep';
import aplay from '../aplay';
import { ITimerStep } from '../models/ITimerStep';
import { IMoveTempStep } from '../models/IMoveTempStep';
import { IWaitTempStep } from '../models/IWatiTempStep';
import led from '../ui/led';
import { mapStep, getNextStep, getNextStepPos, monitorTemp } from '../helpers/stepHelper';
import { generate } from 'generate-password';
import Debug from 'debug';
import { ISavedState } from '../models/ISavedState';
import { config } from '../config';
import { IOledState } from '../models/IOledState';
import { IPidSettings } from '../models/IPidSettings';

const debug = Debug('fc-enail:reducer');

const enailScripts: Array<IEnailScript> = require(config.files.scripts);

const scripts = enailScripts.map((script, index) => {
    const rootStep = {
        ...script.step,
        key: '',
        loopCount: 0,
        next: script.step.steps && script.step.steps.length > 0 ? '0' : undefined,
        parent: undefined,
        last: true
    };

    return {
        ...script,
        index,
        step: {
            ...rootStep,
            steps: rootStep.steps === undefined ? [] : rootStep.steps.map((step, stepIndex) => {
               return mapStep(step, stepIndex, rootStep, rootStep); 
            })
        }
    }
});

const initialState: IEnailState = {
    setPoint: 0,
    presentValue: 0,
    running: false,
    tuning: false,
    connected: false,
    ready: false,
    lastDirection: Direction.None,
    lastUpdate: 0,
    stepSize: 1,
    directionCount: 0,
    changingDirection: false,
    currentStepPos: 0,
    scriptRunning: false,
    mode: EnailMode.Home,
    scripts,
    currentScript: scripts.length > 0 ? scripts[0] : undefined,
    currentStep: scripts.length > 0 ? scripts[0].step : undefined,
    presets: [],
    scriptStartTime: 0,
    passphrase: '',
    icon: 'home',
    flashRate: 0,
    p: 0,
    i: 0,
    d: 0
};

export const updateSetPoint = (value: number) => {
    return {
        type: Constants.E5CC_UPDATE_SETPOINT,
        payload: value
    };
}

export const setSP = (value: number) => {
    return {
        type: Constants.E5CC_SET_SETPOINT,
        payload: value
    };    
}

export const moveSetPoint = (offset: number) => {
    return {
        type: Constants.E5CC_MOVE_SETPOINT,
        payload: offset
    };
}

export const updateAllState = (pv: number, sp: number, isRunning: boolean, isTuning: boolean) => {
    return {
        type: Constants.E5CC_UPDATE_ALL_STATE,
        payload: {
            pv,
            sp,
            isRunning,
            isTuning
        }
    }
}

export const getPidSettings = () => {
    return {
        type: Constants.E5CC_GET_PID_SETTINGS
    };
}

export const savePidSettings = (settings: IPidSettings) => {
    return {
        type: Constants.E5CC_SAVE_PID_SETTINGS,
        payload: settings
    };
}

export const updateP = (value: number) => {
    return {
        type: Constants.E5CC_UPDATE_P,
        payload: value
    };
}

export const updateI = (value: number) => {
    return {
        type: Constants.E5CC_UPDATE_I,
        payload: value
    };
}

export const updateD = (value: number) => {
    return {
        type: Constants.E5CC_UPDATE_D,
        payload: value
    };
}

export const increaseCurrentScript = () => {
    return {
        type: Constants.SCRIPT_INCREASE
    };
}

export const decreaseCurrentScript = () => {
    return {
        type: Constants.SCRIPT_DECREASE
    }
}

export const setReady = () => {
    return {
        type: Constants.E5CC_READY
    }
}

export const updateState = (value: boolean) => {
    return {
        type: Constants.E5CC_UPDATE_STATE,
        payload: value
    };
}

export const toggleState = () => {
    return {
        type: Constants.E5CC_TOGGLE_STATE
    };
}

export const toggleTune = () => {
    return {
        type: Constants.E5CC_TOGGLE_TUNE
    };
}

export const runScript = ()  => {
    return {
        type: Constants.SCRIPT_RUN,
        payload: e5cc.getSP()
    };
}

export const endScript = () => {
    return {
        type: Constants.SCRIPT_END
    };
}

export const setCurrentScript = (index: number) => {
    return {
        type: Constants.SET_CURRENT_SCRIPT,
        payload: index
    }
}

export const nextStep = () => {
    return {
        type: Constants.NEXT_STEP
    };
}

export const runStep = () => {
    return {
        type: Constants.RUN_STEP
    };
}

export const stepFeedback = (step: IFeedbackStep) => {
    return (dispatch: Dispatch<EnailAction>) => {
        if (step.icon) {
            dispatch(setIcon(step.icon, step.flashRate));
        }

        if (step.led !== undefined) {
            debug('flash');
            led.flash(step.led);
        }

        if (step.sound) {
            aplay.play(step.sound);
            new Promise(resolve => {
                setTimeout(() => {resolve();}, 1000);
            }).then(() => {
                dispatch(nextStep());
            })
        } else {
            dispatch(nextStep());
        }
    };
}

export const stepTimer = (step: ITimerStep) => {
    return (dispatch: Dispatch<IBasicAction>) => {
        setTimeout(() => {
            dispatch(nextStep());
        }, step.timeout * 1000);
    };
}

export const stepMoveTemp = (step: IMoveTempStep) => {
    return {
        type: Constants.E5CC_STEP_MOVE_TEMP,
        payload: step.value
    };
}

export const stepWaitTemp = (step: IWaitTempStep) => {
    return (dispatch: Dispatch<IBasicAction>) => {
        monitorTemp(step).then(() => {
            dispatch(nextStep());
        });
    };
}

export const setMode = (mode: EnailMode) => {
    return {
        type: Constants.SET_MODE,
        payload: mode
    };
}

export const updateDisplay = (state: IOledState) => {
    return {
        type: Constants.DISPLAY_UPDATE,
        payload: state
    };
}

export const setIcon = (icon: string, flashRate: number = 0) => {
    return {
        type: Constants.SET_ICON,
        payload: { icon, flashRate }
    };
}

export const loadSavedState = () => {
    return (dispatch: Dispatch<EnailAction>) => {
        fs.readFile(config.files.savedState, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
            if (err) {
                dispatch({
                    type: Constants.LOAD_SAVED_STATE,
                    payload: {
                        presets: [475, 535, 575, 600, 635]
                    } as ISavedState
                });
            } else {
                const savedState: ISavedState = JSON.parse(data);
                dispatch({
                    type: Constants.LOAD_SAVED_STATE,
                    payload: savedState
                });
            }
        });
    };
}

export const persistSavedState = (savedState: ISavedState) => {
    return (dispatch: Dispatch<EnailAction>) => {
        fs.writeFile(config.files.savedState, JSON.stringify(savedState), { encoding: 'utf8' }, (err: NodeJS.ErrnoException) => {
            if (!err) {
                dispatch({
                    type: Constants.PERSIST_SAVED_STATE,
                    payload: savedState
                });
            }
        });
    };
}

export const generatePassphrase = () => {
    return {
        type: Constants.PASSPHRASE_GENERATE
    };
}

export const verifyPassphrase = (passphrase: string) => {
    return {
        type: Constants.PASSPHRASE_VERIFY,
        payload: passphrase
    };
}

export const clearPassphrase = () => {
    return {
        type: Constants.PASSPHRASE_CLEAR
    };
}

export const enailReducer = (state: IEnailState = initialState, action: EnailAction): IEnailState => {
    switch (action.type) {
        case Constants.E5CC_CONNECTED: {
            return {
                ...state,
                connected: true,
                ready: false
            };
        }

        case Constants.E5CC_UPDATE_SETPOINT: {
            return {
                ...state,
                setPoint: action.payload as number
            };
        }

        case Constants.E5CC_STEP_MOVE_TEMP: {
            return {
                ...state,
                ready: false,
                setPoint: state.setPoint + (action.payload as number)
            };
        }

        case Constants.E5CC_SET_SETPOINT: {
            return {
                ...state,
                setPoint: action.payload as number,
                ready: false
            };
        }

        case Constants.E5CC_MOVE_SETPOINT: {
            return {
                ...state,
                setPoint: state.setPoint + (action.payload as number),
                ready: true
            }
        }

        case Constants.E5CC_UPDATE_STATE: {
            return {
                ...state,
                running: action.payload as boolean
            }
        }

        case Constants.E5CC_UPDATE_P: {
            return {
                ...state,
                p: action.payload as number
            }
        }

        case Constants.E5CC_UPDATE_I: {
            return {
                ...state,
                i: action.payload as number
            }
        }

        case Constants.E5CC_UPDATE_D: {
            return {
                ...state,
                d: action.payload as number
            }
        }

        case Constants.E5CC_READY: {
            return {
                ...state,
                lastUpdate: Date.now(),
                ready: true
            }
        }

        case Constants.SCRIPT_RUN: {
            if (state.scriptRunning) {
                return state;
            }

            return {
                ...state,
                scriptStartSP: state.setPoint,
                scriptRunning: true,
                scriptStartTime: Date.now()
            }
        }

        case Constants.SCRIPT_INCREASE: {
            if (state.scriptRunning || (state.currentScript === undefined)) {
                return state;
            }

            const index = state.currentScript.index! < state.scripts.length - 1 ? state.currentScript.index! + 1 : 0;
            return {
                ...state,
                currentScript: state.scripts[index],
                currentStep: state.scripts[index].step
            };
        }

        case Constants.SCRIPT_DECREASE: {
            if (state.scriptRunning || (state.currentScript === undefined)) {
                return state;
            }

            const index = state.currentScript.index! > 0 ? state.currentScript.index! - 1 : state.scripts.length - 1;

            return {
                ...state,
                currentScript: state.scripts[index],
                currentStep: state.scripts[index].step
            };
        }

        case Constants.SCRIPT_END: {
            return {
                ...state,
                scriptRunning: false,
                currentStep: state.currentScript ? state.currentScript.step : undefined
            }
        }

        case Constants.SET_CURRENT_SCRIPT: {
            if (state.scriptRunning) {
                return state;
            }

            const index = action.payload as number;

            return {
                ...state,
                currentScript: state.scripts[index],
                currentStep: state.scripts[index].step,
                currentStepPos: 0
            };
        }

        case Constants.NEXT_STEP: {
            if (!state.currentStep) {
                return state;
            }

            return {
                ...state,
                currentStep: getNextStep(state),
                currentStepPos: getNextStepPos(state)
            }
        
        }

        case Constants.SET_MODE: {
            if (state.scriptRunning) {
                return state;
            }

            const mode = action.payload as EnailMode;
            let newState = {
                ...state,
                mode
            };

            switch (mode) {
                case EnailMode.Script: {
                    newState = {
                        ...newState,
                        icon: 'script'
                    };
                    break;
                }
                case EnailMode.Settings: {
                    newState = {
                        ...newState,
                        icon: 'gear'
                    };
                    break;
                }
                default: {
                    newState = {
                        ...newState,
                        icon: 'home'
                    };
                    break;
                }
            }
            return newState;
        }

        case Constants.E5CC_UPDATE_ALL_STATE: {
            // if (!state.ready) {
            //     return state;
            // }

            return {
                ...state,
                presentValue: (action as IE5CCUpdateStateAction).payload!.pv,
                setPoint: state.setPoint === 0 || state.ready ? (action as IE5CCUpdateStateAction).payload!.sp : state.setPoint,
                running: (action as IE5CCUpdateStateAction).payload!.isRunning,
                tuning: (action as IE5CCUpdateStateAction).payload!.isTuning
            };
        }

        case Constants.LOAD_SAVED_STATE: {
            return {
                ...state,
                presets: (action.payload as ISavedState).presets
            };
        }

        case Constants.PERSIST_SAVED_STATE: {
            return {
                ...state,
                presets: (action.payload as ISavedState).presets
            }
        }

        case Constants.PASSPHRASE_GENERATE: {
            return {
                ...state,
                passphrase: generate({
                    length: 8,
                    numbers: true,
                    symbols: true,
                    uppercase: true
                })
            };
        }

        case Constants.PASSPHRASE_CLEAR: {
            return {
                ...state,
                passphrase: ''
            };
        }

        case Constants.SET_ICON: {
            return {
                ...state,
                icon: (action as ISetIconAction).payload!.icon,
                flashRate: (action as ISetIconAction).payload!.flashRate
            };
        }

        case Constants.E5CC_SAVE_PID_SETTINGS: {
            const pid = action.payload as IPidSettings;
            return {
                ...state,
                p: pid.p,
                i: pid.i,
                d: pid.d
            };
        }

        default: {
            return state;
        }
    }
}
