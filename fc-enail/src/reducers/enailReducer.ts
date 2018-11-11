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
import { IEnailState, Direction, EnailMode } from '../models/IEnailState';
import { EnailAction, IBasicAction, IRunScriptAction } from '../models/Actions';
import { Dispatch, Action } from 'redux';
import * as Constants from '../models/constants';
import e5cc from '../e5cc/e5cc';
import { IEnailScript } from '../models/IEnailScript';
import oledUi from '../ui/oledUi';
import { getIconByName } from '../ui/icons';
import { IFeedbackStep } from '../models/IFeedbackStep';
import aplay from '../aplay';
import { ITimerStep } from '../models/ITimerStep';
import { IMoveTempStep } from '../models/IMoveTempStep';
import { IWaitTempStep } from '../models/IWatiTempStep';
import led from '../ui/led';
import { mapStep, getNextStep, getNextStepPos, monitorTemp } from '../helpers/stepHelper';

const enailScripts: Array<IEnailScript> = require("../assets/enail-scripts.json")

const STEP_ACCELERATION_TIMEOUT = 450;
const STEP_ACCELERATION_PERIOD = 350;
const MAX_STEP_SIZE = 10;
const STEP_COUNT_ACCEL = 5;

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
    currentStep: scripts.length > 0 ? scripts[0].step : undefined
};

export const connect = () => {
    return (dispatch: Dispatch<Action<string>>) => {
        e5cc.connect().then(() => {
            dispatch({
                type: Constants.E5CC_CONNECTED    
            });
        })
    };
}

export const getSP = () => {
    return (dispatch: Dispatch<IBasicAction>) => {
        e5cc.readSP().then(value => {
            dispatch({
                type: Constants.E5CC_UPDATE_SETPOINT,
                payload: value
            });
        });
    }
}

export const setSP = (value: number) => {
    return (dispatch: Dispatch<IBasicAction>) => {
        e5cc.setSP(value).then(() => {
            dispatch({
                type: Constants.E5CC_UPDATE_SETPOINT,
                payload: value
            });
        });
    }
    
}

export const increaseSP = () => {
    return {
        type: Constants.E5CC_INCREASE_SETPOINT
    }
}

export const decreaseSP = () => {
    return {
        type: Constants.E5CC_DECREASE_SETPOINT
    }
}

export const increaseCurrentScript = () => {
    return {
        type: Constants.SCRIPT_INCREASE
    }
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

export const getState = () => {
    return (dispatch: Dispatch<IBasicAction>) => {
        e5cc.isRunning().then(value => {
            dispatch({
                type: Constants.E5CC_UPDATE_STATE,
                payload: value
            });
        });
    }
}

export const toggleState = () => {
    return (dispatch: Dispatch<IBasicAction>) => {
        e5cc.toggleState().then(value => {
            dispatch({
                type: Constants.E5CC_UPDATE_STATE,
                payload: value
            });
        });
    };
}

export const moveSP = (direction: Direction) => {
    return {
        type: Constants.E5CC_MOVE_SETPOINT,
        payload: direction
    };
}

export const runScript = ()  => {
    return (dispatch: Dispatch<IBasicAction>) => {
        e5cc.readSP().then(value => {
            dispatch({
                type: Constants.SCRIPT_RUN,
                payload: value
            });
        });
    };
}

export const endScript = () => {
    return {
        type: Constants.SCRIPT_END
    };
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
    return (dispatch: Dispatch<IBasicAction>) => {
        if (step.icon) {
            oledUi.setIcon(getIconByName(step.icon), step.flashRate || 0);
            oledUi.render();
        }

        if (step.led) {
            led.flash(step.led);
        }

        if (step.sound) {
            aplay.once("complete", () => {
                dispatch(nextStep());
            });
            aplay.play(step.sound);
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

export const stepMoveTempStart = () => {
    return {
        type: Constants.E5CC_STEP_MOVE_TEMP_START
    };
}

export const stepMoveTempComplete = () => {
    return {
        type: Constants.E5CC_STEP_MOVE_TEMP_COMPLETE
    };
}

export const stepWaitTemp = (step: IWaitTempStep, setPoint: number) => {
    return (dispatch: Dispatch<IBasicAction>) => {
        monitorTemp(step, setPoint).then(() => {
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

export const updateDisplay = () => {
    return {
        type: Constants.DISPLAY_UPDATE
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

        case Constants.E5CC_STEP_MOVE_TEMP_START: {
            return {
                ...state,
                ready: true
            };
        }

        case Constants.E5CC_STEP_MOVE_TEMP_COMPLETE: {
            return {
                ...state,
                ready: true
            };
        }

        case Constants.E5CC_INCREASE_SETPOINT: {
            if (!state.ready) {
                return state;
            } else {
                let stepSize: number = state.stepSize;
                let directionCount: number = state.directionCount;
                let lastDirection = Direction.Up;
                let changingDirection = false;
                if ((Date.now() - state.lastUpdate) < STEP_ACCELERATION_PERIOD && state.lastDirection === Direction.Up) {
                    if (directionCount < STEP_COUNT_ACCEL) {
                        directionCount += 1;
                    } else {
                        if (stepSize < MAX_STEP_SIZE) {
                            stepSize += 1;
                        }
                    }
                } else if (state.lastDirection !== Direction.Up) {
                    if (state.changingDirection || ((Date.now() - state.lastUpdate) > STEP_ACCELERATION_PERIOD)) {
                        stepSize = 1;
                        directionCount = 0;        
                    } else {
                        changingDirection = true;
                        lastDirection = Direction.Down;
                    }
                } else if ((Date.now() - state.lastUpdate) > STEP_ACCELERATION_TIMEOUT) {
                    if (stepSize > 1) {
                        const reduceStepSize = Math.min(stepSize - 1, Math.max(1, (Date.now() - state.lastUpdate) / STEP_ACCELERATION_TIMEOUT));
                        stepSize -= reduceStepSize;
                        directionCount = 0;
                    } else {
                        directionCount = 0;
                    }
                }

                return {
                    ...state,
                    ready: false,
                    stepSize,
                    directionCount,
                    lastDirection,
                    changingDirection,
                    setPoint: state.setPoint + stepSize
                };
            }
        }

        case Constants.E5CC_DECREASE_SETPOINT: {
            if (!state.ready) {
                return state;
            } else {
                let stepSize: number = state.stepSize;
                let directionCount: number = state.directionCount;
                let lastDirection = Direction.Down;
                let changingDirection = false;
                if ((Date.now() - state.lastUpdate) < STEP_ACCELERATION_PERIOD && state.lastDirection === Direction.Down) {
                    if (directionCount < STEP_COUNT_ACCEL) {
                        directionCount += 1;
                    } else {
                        if (stepSize < MAX_STEP_SIZE) {
                            stepSize += 1;
                        }
                    }
                } else if (state.lastDirection !== Direction.Down) {
                    if (state.changingDirection || ((Date.now() - state.lastUpdate) > STEP_ACCELERATION_PERIOD)) {
                        stepSize = 1;
                        directionCount = 0;
                    } else {
                        changingDirection = true;
                        lastDirection = Direction.Up;
                    }
                } else if ((Date.now() - state.lastUpdate) > STEP_ACCELERATION_TIMEOUT) {
                    if (stepSize > 1) {
                        const reduceStepSize = Math.min(stepSize - 1, Math.max(1, (Date.now() - state.lastUpdate) / STEP_ACCELERATION_TIMEOUT));
                        stepSize -= reduceStepSize;
                        directionCount = 0;
                    } else {
                        directionCount = 0;
                    }
                }

                return {
                    ...state,
                    ready: false,
                    stepSize,
                    directionCount,
                    lastDirection,
                    changingDirection,
                    setPoint: state.setPoint - stepSize
                };
            }
        }

        case Constants.E5CC_MOVE_SETPOINT: {
            return {
                ...state,
                ready: true
            }
        }

        case Constants.E5CC_UPDATE_STATE: {
            return {
                ...state,
                running: action.payload as boolean
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
                scriptStartSP: action.payload as number,
                scriptRunning: true
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

            return {
                ...state,
                mode: action.payload as EnailMode
            }
        }


        default: {
            return state;
        }
    }
}
