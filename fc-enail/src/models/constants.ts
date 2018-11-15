/*
 * File: c:\fc-enail\fc-enail\src\models\constants.ts
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
export const E5CC_CONNECT = 'ENAIL/E5CC/CONNECT';
export const E5CC_CONNECTED = 'ENAIL/E5CC/CONNECTED';
export const E5CC_UPDATE_SETPOINT = 'ENAIL/E5CC/UPDATE_SETPOINT';
export const E5CC_MOVE_SETPOINT = 'ENAIL/E5CC/MOVE_SETPOINT';
export const E5CC_INCREASE_SETPOINT = 'ENAIL/E5CC/INCREASE_SETPOINT';
export const E5CC_DECREASE_SETPOINT = 'ENAIL/E5CC/DECREASE_SETPOINT';
export const E5CC_UPDATE_STATE = 'ENAIL/E5CC/UPDATE_STATE';
export const E5CC_UPDATE_ALL_STATE = 'ENAIL/E5CC/UPDATE_ALL_STATE';
export const GET_RUNNING = 'ENAIL/RUNNING';
export const E5CC_READY = 'ENAIL/E5CC/READY';

export const SCRIPT_RUN = 'ENAIL/SCRIPT/RUN';
export const SCRIPT_END = 'ENAIL/SCRIPT/END';
export const SCRIPT_INCREASE = 'ENAIL/SCRIPT/INCREASE';
export const SCRIPT_DECREASE = 'ENAIL/SCRIPT/DECREASE';
export const SET_CURRENT_SCRIPT = 'ENAIL/SCRIPT/SET';

export const RUN_STEP = 'ENAIL/STEP/RUN';
export const NEXT_STEP = 'ENAIL/STEP/NEXT';
export const STEP_PARALLEL = 'parallel';
export const STEP_LOOP = 'loop';
export const STEP_FEEDBACK = 'feedback';
export const STEP_MOVETEMP = 'movetemp';
export const STEP_WAITTEMP = 'waittemp';
export const STEP_TIMER = 'timer';
export const STEP_SEQUENTIAL = 'sequential';

export const E5CC_STEP_MOVE_TEMP = 'ENAIL/E5CC/STEP_MOVE_TEMP';
export const E5CC_STEP_MOVE_TEMP_START = 'ENAIL/E5CC/STEP_MOVE_TEMP_START';
export const E5CC_STEP_MOVE_TEMP_COMPLETE = 'ENAIL/E5CC/STEP_MOVE_TEMP_COMPLETE';

export const SET_MODE = 'ENAIL/MODE';
export const DISPLAY_UPDATE = 'ENAIL/DISPLAY/UPDATE';

export const EMIT_STATE = 'ENAIL/EMIT/STATE';

export const LOAD_SAVED_STATE = 'ENAIL/STATE/LOAD';
export const PERSIST_SAVED_STATE = 'ENAIL/STATE/PERSIST';

export const SETTING_SELECT = 'ENAIL/SETTING/SELECT';
export const SETTING_BACK = 'ENAIL/SETTING/BACK';
export const SETTING_DOWN = 'ENAIL/SETTING/DOWN';
export const SETTING_UP = 'ENAIL/SETTING/UP';

export const NETWORK_INFO = 'ENAIL/NETWORK/INFO';
export const NETWORK_SCAN = 'ENAIL/NETWORK/SCAN';
export const NETWORK_CONNECTING = 'ENAIL/NETWORK/CONNECTING';

export const MENU = {
    SETTINGS: {
        KEY: '0',
        TITLE: 'Settings',
        NETWORK: {
            KEY: '0.0',
            TITLE: 'Network',
            CONNECT: {
                KEY: '0.0.0',
                TITLE: 'Connect',
                ACTION: 'ENAIL/NETWORK/CONNECT'
            },
            VIEW: {
                KEY: '0.0.1',
                TITLE: 'View',
                ACTION: 'ENAIL/NETWORK/VIEW'
            },
            EDIT: {
                KEY: '0.0.2',
                TITLE: 'Edit',
                ACTION: 'ENAIL/NETWORK/EDIT'
            }
        }
    }
}