/*
 * File: c:\fc-enail\fc-enail-client\src\types\redux-api-middleware.d.ts
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
declare module 'redux-api-middleware' {
    export const RSAA: string;
    export const isRSAA: (action: any) => boolean;
    export const validateRSAA: (action: any) => string[];
    export const isValidRSAA: (action: any) => boolean;
    export const getJSON: (input: any) => string;
    export const apiMiddleware: any;

    export interface InvalidRSAA extends Error {
        readonly validationErrors: string[];   
    }
    export interface InternalError extends Error {
    }
    export interface RequestError extends Error {
    }
    export interface ApiError extends Error {
        readonly status: string
        readonly statusText: string;
        readonly response: any
    }

    interface Action {
        type: string;
    }

    interface Dispatch<S> {
        <A extends Action>(action: A): A;
    }
}