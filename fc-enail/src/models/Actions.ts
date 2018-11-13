/*
 * File: c:\fc-enail\fc-enail\src\models\Actions.ts
 * Project: c:\fc-enail\fc-enail
 * Created Date: Friday November 9th 2018
 * Author: J-Cat
 * -----
 * Last Modified:
 * Modified By:
 * -----
 * License: 
 *    This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 
 *    International License (http://creativecommons.org/licenses/by-nc/4.0/).
 * -----
 * Copyright (c) 2018
 */
import { Action } from 'redux';
import { Direction } from './IEnailState';
import { ISavedState } from './ISavedState';

export type EnailAction = IErrorAction | IBasicAction | ISocketConnectAction | IE5CCUpdateStateAction | IUserStateAction;

export interface IErrorAction extends Action<string> {
    payload?: { name: string, validationErrors: any, message: string };
    meta?:any;
    error?: boolean;
}

export interface IE5CCUpdateStateAction extends Action<string> {
    payload?: { pv: number, sp: number, isRunning: boolean }
}

export interface IUserStateAction extends Action<string> {
    payload?: ISavedState
}
    
export interface IBasicAction extends Action<string> {
    payload?: string | number | boolean | Direction;
    meta?: string;
}

export interface ISocketConnectAction extends Action<string> {
    payload?: SocketIO.Server;
    meta?: string;
}