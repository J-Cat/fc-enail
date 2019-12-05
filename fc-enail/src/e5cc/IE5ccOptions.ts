/*
 * File: c:\fc-enail\fc-enail\src\e5cc\IE5ccOptions.ts
 * Project: c:\fc-enail\fc-enail
 * Created Date: Thursday November 8th 2018
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
import { SerialPortOptions } from 'modbus-serial/ModbusRTU';

export interface IE5CCOptions {
    readonly device: string;
    readonly options: SerialPortOptions;
}