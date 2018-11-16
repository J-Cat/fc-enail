import { IEnailEmitState } from './IEnailEmitState';
import { IEnailScript } from './IEnailScript';

export interface IEnailState {
    readonly connected: boolean;
    readonly emitState?: IEnailEmitState;
    readonly requesting: boolean;
    readonly reconnect: boolean;
    readonly serviceFound: boolean;
    readonly scripts?: IEnailScript[];
    readonly presets: number[];
    readonly error?: boolean;
    readonly message?: string;
    readonly token: string;
}