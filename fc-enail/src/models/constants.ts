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

export const APPLICATION_TITLE = 'FC E-Nail';

export const E5CC_CONNECT = 'ENAIL/E5CC/CONNECT';
export const E5CC_CONNECTED = 'ENAIL/E5CC/CONNECTED';
export const E5CC_UPDATE_SETPOINT = 'ENAIL/E5CC/UPDATE_SETPOINT';
export const E5CC_UPDATE_P = 'ENAIL/E5CC/UPDATE_P';
export const E5CC_UPDATE_I = 'ENAIL/E5CC/UPDATE_I';
export const E5CC_UPDATE_D = 'ENAIL/E5CC/UPDATE_D';
export const E5CC_SET_SETPOINT = 'ENAIL/E5CC/SET_SETPOINT';
export const E5CC_MOVE_SETPOINT = 'ENAIL/E5CC/MOVE_SETPOINT';
export const E5CC_UPDATE_STATE = 'ENAIL/E5CC/UPDATE_STATE';
export const E5CC_UPDATE_ALL_STATE = 'ENAIL/E5CC/UPDATE_ALL_STATE';
export const E5CC_TOGGLE_STATE = 'ENAIL/E5CC/TOGGLE_STATE';
export const E5CC_TOGGLE_TUNE = 'ENAIL/E5CC/TOGGLE_TUNE';
export const E5CC_READY = 'ENAIL/E5CC/READY';
export const E5CC_GET_PID_SETTINGS = 'ENAIL/E5CC/GET_PID_SETTINGS';
export const E5CC_SAVE_PID_SETTINGS = 'ENAIL/E5CC/SAVE_PID_SETTINGS';

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
export const E5CC_STEP_MOVE_TEMP_COMPLETE = 'ENAIL/E5CC/STEP_MOVE_TEMP_COMPLETE';

export const SET_MODE = 'ENAIL/MODE';
export const DISPLAY_UPDATE = 'ENAIL/DISPLAY/UPDATE';
export const SET_ICON = 'ENAIL/DISPLAY/SET_ICON';

export const EMIT_STATE = 'ENAIL/EMIT/STATE';

export const LOAD_SAVED_STATE = 'ENAIL/STATE/LOAD';
export const PERSIST_SAVED_STATE = 'ENAIL/STATE/PERSIST';

export const SETTING_SELECT = 'ENAIL/SETTING/SELECT';
export const SETTING_BACK = 'ENAIL/SETTING/BACK';
export const SETTING_DOWN = 'ENAIL/SETTING/DOWN';
export const SETTING_UP = 'ENAIL/SETTING/UP';

export const MENU_NAVIGATE = 'ENAIL/MENU/NAVIGATE';

export const NETWORK_INFO = 'ENAIL/NETWORK/INFO';
export const NETWORK_SCAN = 'ENAIL/NETWORK/SCAN';
export const NETWORK_CONNECTING = 'ENAIL/NETWORK/CONNECTING';

export const PASSPHRASE_GENERATE = 'ENAIL/PASSPHRASE/GENERATE';
export const PASSPHRASE_VERIFY = 'ENAIL/PASSPHRASE/VERIFY';
export const PASSPHRASE_CLEAR = 'ENAIL/PASSPHRASE/CLEAR';

export const INPUT_ACTIONS = {
    CLICK: 'CLICK',
    MEDIUMCLICK: 'MEDIUMCLICK',
    LONGCLICK: 'LONGCLICK',
    REALLYLONGCLICK: 'REALLYLONGCLICK',
    ROTARYCLICK: 'ROTARYCLICK',
    ROTATION: 'ROTATION'
}

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
            SAVE: {
                KEY: '0.0.2',
                TITLE: 'Save',
                ACTION: 'ENAIL/NETWORK/SAVE'
            }
        }
    }
}

export const E5CC = {
    COMMANDS: {
        RUN: 0x0000,
        STOP: 0x0101,
        START: 0x0100,
        TUNE_100: 0x0301,
        TUNE_40: 0x0302,
        TUNE_CANCEL: 0X0300

    },
    VARIABLES: {
        SETPOINT: 0x2103,
        PRESENTVALUE: 0x2000,
        STATUS: 0x2407,
        P: 0x2A00,
        I: 0x2A01,
        D: 0x2A02
    },
    FLAGS: {
        STOPPED: 256,
        TUNING: 128
    }
}