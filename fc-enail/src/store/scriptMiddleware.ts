/*
 * File: c:\fc-enail\fc-enail\src\store\scriptMiddleware.ts
 * Project: c:\fc-enail\fc-enail
 * Created Date: Saturday November 10th 2018
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
import { IEnailStore } from '../models/IEnailStore';
import { Store, Dispatch } from 'redux';
import { EnailAction } from '../models/Actions';

import * as Constants from '../models/constants';
import { IEnailState, EnailMode } from '../models/IEnailState';
import { nextStep, stepFeedback, runStep, stepTimer, stepMoveTemp, stepWaitTemp, endScript, setSP } from '../reducers/enailReducer';
import { IMoveTempStep } from '../models/IMoveTempStep';
import { IFeedbackStep } from '../models/IFeedbackStep';
import { ITimerStep } from '../models/ITimerStep';
import { IWaitTempStep } from '../models/IWatiTempStep';
import led from '../ui/led';
import oledUi from '../ui/oledUi';
import { home, script, gear } from '../ui/icons';
import aplay from '../aplay';

import Debug from 'debug';
const debug = Debug("fc-enail:script");

export const scriptMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const result = next(action);

    const state = store.getState().enail;
    const running = state.scriptRunning;

    switch (action.type) {
        case Constants.SCRIPT_RUN: {
            store.dispatch<any>(runStep());
            break;
        }

        case Constants.RUN_STEP: {
            if (running) {
                executeStep(store.dispatch, store.getState().enail);
            }
            break;
        }

        case Constants.NEXT_STEP: {
            if (running) {
                store.dispatch<any>(runStep());
            }
            break;
        }

        case Constants.SCRIPT_END: {
            led.flash(0);
            oledUi.setIcon(getModeIcon(state.mode), 0);
            aplay.once("complete", () => {
                store.dispatch<any>(setSP(state.scriptStartSP!));
            });
            aplay.play("complete");
        }
    }

    return result;
}

const getModeIcon = (mode: EnailMode): Uint8Array => {
    switch (mode) {
        case EnailMode.Script: {
            return script;
        }

        case EnailMode.Settings: {
            return gear;
        }

        default: {
            return home;
        }
    }
}

const executeStep = (dispatch: Dispatch<any>, state: IEnailState) => {
    if (state.currentStep === undefined) {
        // finish script
        dispatch<any>(endScript());
        return;
    }

    const step = state.currentStep;
    debug(`${step.type}, ${step.key}`);
    switch (step.type) {
        case Constants.STEP_LOOP: case Constants.STEP_SEQUENTIAL: {
            dispatch<any>(nextStep());
            break;
        }

        case Constants.STEP_FEEDBACK: {
            dispatch<any>(stepFeedback(step as IFeedbackStep));
            break;
        }

        case Constants.STEP_TIMER: {
            dispatch<any>(stepTimer(step as ITimerStep));
            break;
        }

        case Constants.STEP_MOVETEMP: {
            dispatch<any>(stepMoveTemp(step as IMoveTempStep))
            break;
        }

        case Constants.STEP_WAITTEMP: {
            dispatch<any>(stepWaitTemp(step as IWaitTempStep, state.setPoint));
            break;
        }

        case Constants.STEP_PARALLEL: {
            break;
        }
    }
}