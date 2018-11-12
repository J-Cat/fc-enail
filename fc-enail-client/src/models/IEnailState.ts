import { IEnailEmitState } from './IEnailEmitState';

export interface IEnailState {
    readonly connected: boolean;
    readonly emitState?: IEnailEmitState;
    readonly requesting: boolean;
    readonly error?: boolean;
    readonly message?: string;
    readonly scripts?: any;
    readonly serviceFound: boolean;
}