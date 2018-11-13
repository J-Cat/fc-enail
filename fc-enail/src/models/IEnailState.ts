/*
 * File: c:\fc-enail\fc-enail\src\models\IEnailState.ts
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
import { IEnailScript } from './IEnailScript';
import { IStep } from './IStep';

 export interface IEnailState {
    readonly setPoint: number;
    readonly presentValue: number;
    readonly running: boolean;
    readonly connected: boolean;
    readonly ready: boolean;
    readonly stepSize: number;
    readonly directionCount: number;
    readonly lastDirection: Direction;
    readonly lastUpdate: number;
    readonly changingDirection: boolean;
    readonly scripts: IEnailScript[];
    readonly currentScript?: IEnailScript;
    readonly currentStep?: IStep;
    readonly currentStepPos: number;
    readonly scriptRunning: boolean;
    readonly scriptStartSP?: number;
    readonly mode: EnailMode;
    readonly presets: number[];
}

export enum Direction {
    'None' = -1,
    'Up' = 1,
    'Down' = 0
}

export enum EnailMode {
    'Home' = 0,
    'Script' = 1,
    'Settings' = 2
}