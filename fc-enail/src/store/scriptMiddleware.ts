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
import * as fs from 'fs';
import { IEnailStore } from '../models/IEnailStore';
import { Store, Dispatch } from 'redux';
import { EnailAction } from '../models/Actions';
import * as Constants from '../models/constants';
import { IEnailState, EnailMode } from '../models/IEnailState';
import { nextStep, stepFeedback, runStep, stepTimer, stepMoveTemp, stepWaitTemp, endScript, setSP, setIcon, persistProfiles } from '../reducers/enailReducer';
import { IMoveTempStep } from '../models/IMoveTempStep';
import { IFeedbackStep } from '../models/IFeedbackStep';
import { ITimerStep } from '../models/ITimerStep';
import { IWaitTempStep } from '../models/IWatiTempStep';
import led from '../ui/led';
import aplay from '../aplay';
import { config } from '../config';

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

        //case Constants

        case Constants.SCRIPT_END: {
            led.flash(0);
            store.dispatch(setIcon(getModeIcon(state.mode), 0));
            aplay.once("complete", () => {
                debug(`script end, reseting sp to ${state.scriptStartSP!}`);
            });
            aplay.play("complete");
            store.dispatch<any>(setSP(state.scriptStartSP!));
            break;
        }

        case Constants.SAVE_SCRIPT: {
            fs.writeFile(config.files.scripts, JSON.stringify(store.getState().enail.scripts), { encoding: 'utf8' }, (err: NodeJS.ErrnoException | null) => {
                debug(err);
            });
            break;
        }

        case Constants.DELETE_PROFILE: {
            store.dispatch<any>(persistProfiles(store.getState().enail.profiles));
            break;
        }

        case Constants.DELETE_SCRIPT: {
            fs.writeFile(config.files.scripts, JSON.stringify(store.getState().enail.scripts), { encoding: 'utf8' }, (err: NodeJS.ErrnoException | null) => {
                debug(err);
            });
            break;
        }
    }

    return result;
}

const getModeIcon = (mode: EnailMode): string => {
    switch (mode) {
        case EnailMode.Script: {
            return 'script';
        }

        case EnailMode.Settings: {
            return 'gear';
        }

        default: {
            return 'home';
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
            dispatch<any>(stepWaitTemp(step as IWaitTempStep));
            break;
        }

        case Constants.STEP_PARALLEL: {
            break;
        }
    }
}