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
import { nextStep, persistProfiles } from '../reducers/enailReducer';
import e5cc from '../e5cc/e5cc';
import led from '../ui/led';
import server from '../server/server';
import { IPidSettings } from '../models/IPidSettings';

export const e5ccMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const result = next(action);
    const state = store.getState().enail;

    switch (action.type) {
        case Constants.E5CC_STEP_MOVE_TEMP: {
            e5cc.setSP(state.setPoint, 3, { isStep: true });
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
            //getE5CCState(store.dispatch);
            break;
        }

        case Constants.E5CC_SET_SETPOINT: {
//            store.dispatch(moveSP(Direction.None));
            e5cc.setSP(action.payload as number);
            break;
        }

        case Constants.E5CC_MOVE_SETPOINT: {
            e5cc.setSP(state.setPoint + (result.payload as number));
            break;
        }

        case Constants.E5CC_TOGGLE_STATE: {
            e5cc.toggleState();
            break;
        }

        case Constants.E5CC_TOGGLE_TUNE: {
            e5cc.toggleTune();
            break;
        }

        case Constants.E5CC_GET_PID_SETTINGS: {
            e5cc.readBatch([
                Constants.E5CC.VARIABLES.P,
                Constants.E5CC.VARIABLES.I,
                Constants.E5CC.VARIABLES.D
            ]);
            break;
        }

        case Constants.E5CC_SAVE_PID_SETTINGS: {
            const pid = action.payload as IPidSettings;
            e5cc.writeBatch([
                { address: Constants.E5CC.VARIABLES.P, value: pid.p },
                { address: Constants.E5CC.VARIABLES.I, value: pid.i },
                { address: Constants.E5CC.VARIABLES.D, value: pid.d }
            ]);
            store.dispatch<any>(persistProfiles(store.getState().enail.profiles));
            break;
        }

        case Constants.DELETE_PROFILE: {
            store.dispatch<any>(persistProfiles(store.getState().enail.profiles));
            break;
        }
    }

    return result;
}