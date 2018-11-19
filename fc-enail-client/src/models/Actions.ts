import { Action } from 'redux';
import { IEnailEmitState } from './IEnailEmitState';
import { IEnailScript } from './IEnailScript';
import { ISavedState } from './ISavedState';
import { IVerifyTokenResponse } from './IVerifyTokenResponse';
import { IPidSettings } from './IPidSettings';
import { ISavedProfiles } from './ISavedProfiles';

export type EnailAction = IErrorAction | IBasicAction | IEnailEmitStateAction;

export interface IErrorAction extends Action<string> {
    payload?: { name: string, validationErrors: any, message: string };
    meta?:any;
    error?: boolean;
    message?: string;
}

export interface IBasicAction extends Action<string> {
    payload?: string | number | boolean | IEnailScript[] | ISavedState | IVerifyTokenResponse | IPidSettings | ISavedProfiles;
    meta?: string;
}

export interface IEnailEmitStateAction extends Action<string> {
    payload?: IEnailEmitState,
    meta?: string
}
