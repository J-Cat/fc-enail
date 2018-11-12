import { IEnailState } from './IEnailState';
import { IVersionState } from './IVersionState';

export interface IEnailStore {
    readonly enail: IEnailState;
    readonly version: IVersionState;
}