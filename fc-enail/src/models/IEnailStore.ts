/*
 * File: c:\fc-enail\fc-enail\src\models\IEnailStore.ts
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
import { IEnailState } from './IEnailState';
import { IMenuState } from './IMenuState';

export interface IEnailStore {
    readonly enail: IEnailState;
    readonly menu: IMenuState;
}