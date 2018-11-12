/*
 * File: c:\solar\solar-monitor-client\src\modules\version.ts
 * Project: c:\solar\solar-monitor-client
 * Created Date: Monday September 3rd 2018
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
import { IVersionState } from "../models/IVersionState";

const pjson: { version: string } = require('../../package.json');

export const versionReducer = (state: IVersionState = { version: pjson.version }, action: {}): IVersionState => {
    return state;
};
