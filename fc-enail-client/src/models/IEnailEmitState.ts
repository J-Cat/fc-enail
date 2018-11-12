import { EnailMode } from './EnailMode';

export interface IEnailEmitState {
    readonly pv: number;
    readonly sp: number;
    readonly running: boolean;
    readonly scriptRunning: boolean;
    readonly currentScript?: number;
    readonly currentStep?: string;
    readonly currentStepPos: number;
    readonly mode: EnailMode;
}