import { Action } from 'redux';
import { IEnailEmitState } from './IEnailEmitState';

export type EnailAction = IErrorAction | IBasicAction | IEnailEmitStateAction;

export interface IErrorAction extends Action<string> {
    payload?: { name: string, validationErrors: any, message: string };
    meta?:any;
    error?: boolean;
    message?: string;
}

export interface IBasicAction extends Action<string> {
    payload?: string | number | boolean;
    meta?: string;
}

export interface IEnailEmitStateAction extends Action<string> {
    payload?: IEnailEmitState,
    meta?: string
}