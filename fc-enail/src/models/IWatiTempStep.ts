/*
 * File: c:\enail-magic\src\models\IConditionalStep.ts
 * Project: c:\enail-magic
 * Created Date: Saturday August 25th 2018
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
import { Direction } from "./direction";
import { IStep } from "./IStep";

export interface IWaitTempStep extends IStep {
    readonly offset: number;
    readonly direction: Direction;
    readonly timeout: number;
}