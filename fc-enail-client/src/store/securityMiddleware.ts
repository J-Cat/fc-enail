/*
 * File: c:\fc-enail\fc-enail-client\src\store\securityMiddleware.ts
 * Project: c:\fc-enail\fc-enail-client
 * Created Date: Thursday November 15th 2018
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
import { Store, Dispatch } from "redux";
import { RSAA } from "redux-api-middleware";
import { IEnailStore } from "../models/IEnailStore";
import { EnailAction } from "../models/Actions";
import { generatePassphrase } from '../reducers/enailReducer';
import history from '../history';

export const securityMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    const callApi = action[RSAA] || null;

    if (!!callApi) {
        const token = store.getState().enail.token;
        if (token) {
            // const userName = user.username;
            callApi.headers = {
                ...callApi.headers,
                authorization: token,
                'Content-Type': 'application/json'
            };
        }
    }

    return next(action);
}

export const authorizationMiddleware = (store: Store<IEnailStore>) => <A extends EnailAction>(next: Dispatch<A>) => (action: A) => {
    if (action.type.endsWith('/ERROR')) {
        const payload = action.payload as any;
        if (payload && payload.status 
            && (typeof(payload.status) === 'number')
            && (payload.status === 401)
        ) {
            store.dispatch<any>(generatePassphrase());
            history.push('signin');
        }
    }

    return next(action);
}