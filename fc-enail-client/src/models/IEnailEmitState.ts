import { EnailMode } from './EnailMode';

export interface IEnailEmitState {
    readonly pv: number;
    readonly sp: number;
    readonly running: boolean;
    readonly tuning: boolean;
    readonly scriptRunning: boolean;
    readonly currentScript?: number;
    readonly currentStep?: string;
    readonly currentStepPos: number;
    readonly mode: EnailMode;
    readonly p: number;
    readonly i: number;
    readonly d: number;
}