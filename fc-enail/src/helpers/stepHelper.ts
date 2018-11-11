import { IStep } from '../models/IStep';
import { ILoopStep } from '../models/ILoopStep';
import * as Constants from '../models/constants';
import { IEnailState } from '../models/IEnailState';
import { IWaitTempStep } from '../models/IWatiTempStep';
import e5cc from '../e5cc/e5cc';
import { Direction } from '../models/direction';
import store from '../store/createStore';

import Debug from 'debug';
const debug = Debug("fc-enail:script");

export const mapStep = (step: IStep, stepIndex: number, parent: IStep, root: IStep): IStep => {
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

export const getNextStep = (state: IEnailState): IStep | undefined => {
    if (state.currentStep === undefined || state.currentScript === undefined) {
        return;
    }

    if (state.currentStep.loopCount! > 0 && state.currentStep.last && state.currentStep.loopCount! > state.currentStepPos + 1) {
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

export const getNextStepPos = (state: IEnailState): number => {
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

export const monitorTemp = async (step: IWaitTempStep): Promise<void> => {
    return new Promise<void>(async resolve => {
        let tempReached = false;
        const startTime = Date.now();
        while (!tempReached) {
            tempReached = await checkTemp(step);
            if (!tempReached && ((Date.now() - startTime) > (step.timeout * 1000))) {
                tempReached = true;
            }

            if (!tempReached) {
                if (!store.getState().enail.scriptRunning) {
                    tempReached = true;
                    debug('cancelling temp monitor');
                }
            }
        }
        resolve();
    });
}

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

const checkTemp = (step: IWaitTempStep) => {
    return new Promise<boolean>(async resolve => {
        const state = store.getState().enail;
        const pv = state.presentValue;
        const setPoint = state.setPoint;
        switch (step.direction) {
            case Direction.UP: {
                if (Math.floor(pv) >= Math.floor(setPoint + step.offset)) {
                    resolve(true);
                }
                break;
            }

            case Direction.DOWN: {
                if (Math.floor(pv) <= Math.floor(setPoint + step.offset)) {
                    resolve(true);
                }
                break;
            }
        }

        setTimeout(() => { resolve(false); }, 500);
    });
}
