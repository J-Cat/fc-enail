import { IEnailState, Direction } from '../models/IEnailState';

const STEP_ACCELERATION_TIMEOUT = 350;
const STEP_ACCELERATION_PERIOD = 250;
const MAX_STEP_SIZE = 10;
const STEP_COUNT_ACCEL = 5;

export const calculateStepSizeForIncrease = (state: IEnailState): {
    stepSize: number, directionCount: number, lastDirection: Direction, changingDirection: boolean
} => {
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

    return { stepSize, directionCount, lastDirection, changingDirection };
}

export const calculateStepSizeForDecrease = (state: IEnailState): {
    stepSize: number, directionCount: number, lastDirection: Direction, changingDirection: boolean
} => {
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

    return { stepSize, directionCount, lastDirection, changingDirection };
}