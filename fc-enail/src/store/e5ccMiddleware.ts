/*
 * File: c:\fc-enail\fc-enail\src\store\e5ccMiddleware.ts
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
import { Dispatch, Store } from 'redux';

import { IEnailStore } from '../models/IEnailStore';
import { EnailAction, IE5CCUpdateStateAction } from '../models/Actions';
import * as Constants from '../models/constants';
import { getSP, setReady, getState, moveSP, stepMoveTempStart, stepMoveTempComplete, nextStep, updateAllState } from '../reducers/enailReducer';
import e5cc from '../e5cc/e5cc';
import { Direction } from '../models/IEnailState';
import led from '../ui/led';
import server from '../server/server';

const MONITOR_CYCLE_TIME = 500;

export const e5ccMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const result = next(action);
    const state = store.getState().enail;

    switch (action.type) {
        case Constants.E5CC_CONNECTED: {
            getE5CCState(store.dispatch, true);
            break;
        }

        case Constants.E5CC_STEP_MOVE_TEMP: {
            store.dispatch<any>(stepMoveTempStart());
            break;
        }

        case Constants.E5CC_STEP_MOVE_TEMP_START: {
            e5cc.setSP(state.setPoint).then(() => {
                store.dispatch<any>(stepMoveTempComplete())
            });
            break;
        }

        case Constants.E5CC_STEP_MOVE_TEMP_COMPLETE: {
            store.dispatch<any>(nextStep())
            break;
        }

        case Constants.E5CC_UPDATE_STATE: {
            if ((action.payload as boolean)) {
                led.on();
            } else {
                led.off();
            }
            break;
        }

        case Constants.E5CC_UPDATE_ALL_STATE: {
            if ((action as IE5CCUpdateStateAction).payload!.isRunning) {
                led.on();
            } else {
                led.off();
            }
            server.emitState();
            getE5CCState(store.dispatch);
            break;
        }

        case Constants.E5CC_INCREASE_SETPOINT: {
            store.dispatch(moveSP(Direction.Up));
            break;
        }

        case Constants.E5CC_DECREASE_SETPOINT: {
            store.dispatch(moveSP(Direction.Down));
            break;
        }

        case Constants.E5CC_MOVE_SETPOINT: {
            if (action.payload === Direction.None || ((state.lastDirection === action.payload) && !state.changingDirection)) {
                e5cc.setSP(state.setPoint).then(() => {
                    store.dispatch(setReady());
                });
            }
            break;
        }

//        case Constants.
        // case Constants.E5CC_INCREASE_SETPOINT:  {
        //     if (state.lastDirection !== Direction.Down) {
        //         e5cc.setSP(state.setPoint + state.stepSize).then(() => {
        //             store.dispatch(setReady());
        //         });
        //     }
        //     break;
        // }

        // case Constants.E5CC_DECREASE_SETPOINT: {
        //     if (state.lastDirection !== Direction.Up) {
        //         e5cc.setSP(state.setPoint - state.stepSize).then(() => {
        //             store.dispatch(setReady());
        //         });
        //     }
        //     break;

        // }
    }

    return result;
}

const getE5CCState = (dispatch: Dispatch<EnailAction>, immediate: boolean = false) => {
    setTimeout((async () => {
        const pv = await e5cc.readPV();
        const isRunning = await e5cc.isRunning();
        const sp = await e5cc.readSP();
        dispatch(updateAllState(pv, sp, isRunning));
    }), immediate ? 0 : MONITOR_CYCLE_TIME);
}
