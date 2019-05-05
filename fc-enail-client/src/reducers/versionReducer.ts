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
import * as Constants from '../models/constants';
import { IBasicAction } from 'src/models/Actions';

const pjson: { version: string } = require('../../package.json');

export const updateVersion = (newVersion: string) => {
    return {
        type: Constants.UPDATE_VERSION,
        payload: newVersion
    };
}
export const versionReducer = (state: IVersionState = { version: pjson.version }, action: IBasicAction): IVersionState => {
    switch (action.type) {
        case Constants.UPDATE_VERSION: {
            return {
                ...state,
                version: action.payload as string
            };
        }

        default: {
            return state;
        }
    }
};
