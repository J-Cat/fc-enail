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
import { EnailAction, IBasicAction } from '../models/Actions';
import { Dispatch, Action } from 'redux';
import * as Constants from '../models/constants';
import e5cc from '../e5cc/e5cc';

const STEP_ACCELERATION_TIMEOUT = 350;
const STEP_ACCELERATION_PERIOD = 250;
const MAX_STEP_SIZE = 10;
const STEP_COUNT_ACCEL = 5;

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
    changingDirection: false
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
    }
}

export const moveSP = (direction: Direction) => {
    return {
        type: Constants.E5CC_MOVE_SETPOINT,
        payload: direction
    }
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
                ready: true,
                setPoint: action.payload as number
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

        default: {
            return state;
        }
    }
}
