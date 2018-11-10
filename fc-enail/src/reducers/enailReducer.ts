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
import { IEnailState, Direction } from '../models/IEnailState';
import { Direction as WaitDirection } from '../models/direction';
import { EnailAction, IBasicAction } from '../models/Actions';
import { Dispatch, Action } from 'redux';
import * as Constants from '../models/constants';
import e5cc from '../e5cc/e5cc';
import { IEnailScript } from '../models/IEnailScript';
import { IStep } from '../models/IStep';
import { ILoopStep } from '../models/ILoopStep';
import oledUi from '../ui/oledUi';
import { getIconByName } from '../ui/icons';
import { IFeedbackStep } from '../models/IFeedbackStep';
import aplay from '../aplay';
import { ITimerStep } from '../models/ITimerStep';
import { IMoveTempStep } from '../models/IMoveTempStep';
import { IWaitTempStep } from '../models/IWatiTempStep';

const enailScripts: Array<IEnailScript> = require("../assets/enail-scripts.json")

const STEP_ACCELERATION_TIMEOUT = 350;
const STEP_ACCELERATION_PERIOD = 250;
const MAX_STEP_SIZE = 10;
const STEP_COUNT_ACCEL = 5;

const getStepByKey = (root: IStep, key: string): IStep | undefined => {
    if (key === '') {
        return root;
    }

    let step = root;
    for (const index of key.split('.').map(s => parseInt(s))) {
        if (step.steps === undefined) {
            break;
        }

        if (step.steps.length < index) {
            break;
        }

        step = step.steps[index];
    }

    return step;
}

const getNextStepKey = (step: IStep, stepIndex: number, parent: IStep, root: IStep) => {
    if (step.steps !== undefined && step.steps.length > 0) {
        return `${step.key !== '' ? `${step.key}.0` : '0'}`
    }

    if (parent.steps === undefined) {
        return;
    }
    
    if (!step.last! && parent.type !== Constants.STEP_PARALLEL) {
        return `${parent.key !== '' ? `${parent.key}.` : ''}${stepIndex + 1}`;
    } else {
        if (parent === undefined || parent.last!) {
            return;
        }

        const parentKey = parent.key!.split('.');
        const parentIndex = parseInt(parentKey[parentKey.length - 1]);

        return `${parent.parent !== '' ? `${parent.parent}.` : ''}${parentIndex+1}`;
    }
}

const mapStep = (step: IStep, stepIndex: number, parent: IStep, root: IStep): IStep => {
    const key: string = `${parent.key !== '' ? `${parent.key}.` : ''}${stepIndex}`;
    let newStep = {
        ...step,
        key,
        parent: parent.key,
        loopCount: parent.type === Constants.STEP_LOOP ? (parent as ILoopStep).count : 0,
        last: parent.steps === undefined ? true : stepIndex >= parent.steps.length - 1
    };
    newStep = {
        ...newStep,
        next: getNextStepKey(newStep, stepIndex, parent, root)
    };

    return {
        ...newStep,
        steps: step.steps === undefined ? [] : step.steps.map((subStep, subStepIndex) => {
            return mapStep(subStep, subStepIndex, newStep, root);
        })
    }
}

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
    scripts: enailScripts.map((script, index) => {
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
    })
};

const getNextStep = (state: IEnailState): IStep | undefined => {
    if (state.currentStep === undefined || state.currentScript === undefined) {
        return;
    }

    if (state.currentStep.loopCount! > 0 && state.currentStep.last && state.currentStep.loopCount! > state.currentStepPos) {
        const parent = getStepByKey(state.currentScript.step, state.currentStep.parent!);
        if (parent !== undefined && parent.next !== undefined) {
            return getStepByKey(state.currentScript.step, parent.next);
        }
    }

    if (state.currentStep.next === undefined) {
        return;
    }

    return getStepByKey(state.currentScript.step, state.currentStep.next);
}

const getNextStepPos = (state: IEnailState): number => {
    if (state.currentStep === undefined || state.currentScript === undefined) {
        return state.currentStepPos;
    }

    if (state.currentStep.type === Constants.STEP_LOOP) {
        return 0;
    }

    if (state.currentStep.loopCount! > 0 && state.currentStep.last) {
        return state.currentStepPos + 1;
    }

    return state.currentStepPos;
}

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

export const runScript = (index: number) => {
    return {
        type: Constants.RUN_SCRIPT,
        payload: index
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

        // if (step.led) {

        // }

        if (step.sound) {
            aplay.play(step.sound);
        }

        dispatch(nextStep());
    };
}

export const stepTimer = (step: ITimerStep) => {
    return (dispatch: Dispatch<IBasicAction>) => {
        setTimeout(() => {
            dispatch(nextStep());
        }, step.timeout * 1000);
    }
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
    }
}

export const stepMoveTempComplete = () => {
    return {
        type: Constants.E5CC_STEP_MOVE_TEMP_COMPLETE
    }
}

export const stepWaitTemp = (step: IWaitTempStep, setPoint: number) => {
    return (dispatch: Dispatch<IBasicAction>) => {
        monitorTemp(step, setPoint).then(() => {
            dispatch(nextStep());
        })
    }
}

export const monitorTemp = async (step: IWaitTempStep, setPoint: number): Promise<void> => {
    return new Promise<void>(async resolve => {
        let tempReached = false;
        const startTime = Date.now();
        while (!tempReached) {
            tempReached = await checkTemp(step, setPoint);
            if (!tempReached && ((Date.now() - startTime) > (step.timeout * 1000))) {
                tempReached = true;
            }             
        }
        resolve();
    });
}

export const checkTemp = (step: IWaitTempStep, setPoint: number) => {
    return new Promise<boolean>(async resolve => {
        const pv = await e5cc.readPV();
        switch (step.direction) {
            case WaitDirection.UP: {
                if (Math.floor(pv) >= Math.floor(setPoint + step.offset)) {
                    resolve(true);
                }
                break;
            }

            case WaitDirection.DOWN: {
                if (Math.floor(pv) <= Math.floor(setPoint + step.offset)) {
                    resolve(true);
                }
                break;
            }
        }

        setTimeout(() => { resolve(false); }, 500);
    });
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
            if (!state.ready) {
                return state;
            }

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

        case Constants.RUN_SCRIPT: {
            const index = action.payload as number;
            if (index >= state.scripts.length) {
                return state;
            }

            return {
                ...state,
                currentScript: state.scripts[index],
                currentStep: state.scripts[index].step
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

        default: {
            return state;
        }
    }
}
