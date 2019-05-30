import { IEnailEmitState } from './IEnailEmitState';
import { IEnailScript } from './IEnailScript';
import { ISavedProfiles } from './ISavedProfiles';

export interface IEnailState {
    readonly connected: boolean;
    readonly emitState?: IEnailEmitState;
    readonly requesting: boolean;
    readonly reconnect: boolean;
    readonly tokenError: boolean;
    readonly serviceFound: boolean;
    readonly scripts?: IEnailScript[];
    readonly presets: number[];
    readonly autoShutoff: number;
    readonly error?: boolean;
    readonly message?: string;
    readonly token: string;
    readonly profiles: ISavedProfiles;
    readonly theme: string;
}