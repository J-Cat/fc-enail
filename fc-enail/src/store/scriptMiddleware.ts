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
import { IEnailState } from '../models/IEnailState';
import { nextStep, stepFeedback, runStep, stepTimer, stepMoveTemp, stepWaitTemp } from '../reducers/enailReducer';
import { IMoveTempStep } from '../models/IMoveTempStep';
import { IFeedbackStep } from '../models/IFeedbackStep';
import { ITimerStep } from '../models/ITimerStep';
import { IWaitTempStep } from '../models/IWatiTempStep';

export const scriptMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const result = next(action);

    switch (action.type) {
        case Constants.RUN_SCRIPT: {
            store.dispatch<any>(runStep())
            break;
        }

        case Constants.RUN_STEP: {
            executeStep(store.dispatch, store.getState().enail);
            break;
        }

        case Constants.NEXT_STEP: {
            store.dispatch<any>(runStep());
            break;
        }
    }

    return result;
}

const executeStep = (dispatch: Dispatch<any>, state: IEnailState) => {
    if (state.currentStep === undefined) {
        return;
    }

    const step = state.currentStep;
    console.log(`${step.type}, ${step.key}`)
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