/*
 * File: c:\fc-enail\fc-enail-client\src\config\index.ts
 * Project: c:\fc-enail\fc-enail-client
 * Created Date: Sunday November 11th 2018
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
export interface IConfig {
    readonly serviceUrl: string;
    readonly socketIoUrl: string;
}

const config: IConfig = require('./config.json');

export default config;
