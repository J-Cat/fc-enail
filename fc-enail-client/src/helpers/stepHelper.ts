import { IStep } from '../models/IStep';
import { ILoopStep } from '../models/ILoopStep';
import * as Constants from '../models/constants';

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

export const remapScript = (root: IStep): IStep => {
    const rootStep = {
        ...root,
        key: '',
        loopCount: 0,
        next: root.steps && root.steps.length > 0 ? '0' : undefined,
        parent: undefined,
        last: true
    };

    return {
        ...rootStep,
        steps: rootStep.steps === undefined ? [] : rootStep.steps.map((step, stepIndex) => {
           return mapStep(step, stepIndex, rootStep, rootStep); 
        })
    };
}

export const getStepByKey = (root: IStep, key: string): IStep | undefined => {
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

export const addItem = (step: IStep, item: IStep, destinationKey: string, destinationIndex: number): IStep => {
    if (!step.steps) {
        return step;
    }

    if ((step.key === destinationKey) || 
        (step.key === '' && destinationKey === 'root')
    ) {
        return {
            ...step,
            steps: [
                ...step.steps.slice(0, destinationIndex),
                item,
                ...step.steps.slice(destinationIndex)
            ]
        };  
    } else {
        return {
            ...step,
            steps: step.steps.map(s => {
                return addItem(s, item, destinationKey, destinationIndex);
            }) 
        };    
    }
}

export const deleteKey = (step: IStep, key: string): IStep => {
    if (!step.steps) {
        return step;
    }

    const index = step.steps.findIndex(s => s.key === key);
    let steps = [...step.steps];
    if (index >= 0) {
        steps = [...step.steps.slice(0, index), ...step.steps.slice(index+1)]
    }

    return {
        ...step,
        steps: steps.map(s => {
            return deleteKey(s, key);
        }) 
    };
}

export const moveStep = (root: IStep, key: string, destinationKey: string, destinationIndex: number): IStep => {
    if (key === '') {
        return root;
    }

    const newRoot = deleteKey(root, key); 
    const item = getStepByKey(root, key);
    if (item) {
        const final = addItem(newRoot, item, destinationKey, destinationIndex);
        return remapScript(final);
    } else {
        return root;
    }
}
