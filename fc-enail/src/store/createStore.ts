/*
 * File: c:\fc-enail\fc-enail\src\store\createStore.ts
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
import {
    applyMiddleware,
    compose,
    createStore,
    Store
} from 'redux';
import thunk from 'redux-thunk';

import makeRootReducer from '../reducers';
import { IEnailStore } from '../models/IEnailStore';
import { EnailAction } from '../models/Actions';
import { e5ccMiddleware } from './e5ccMiddleware';
import { composeWithDevTools } from 'remote-redux-devtools';
import { scriptMiddleware } from './scriptMiddleware';
import { displayMiddleware } from './displayMiddleware';

const configureStore = (initialState?: IEnailStore): Store<IEnailStore, EnailAction> => {
    const middlewares: any = [
        thunk,
        e5ccMiddleware,
        scriptMiddleware,
        displayMiddleware
    ];

    //const composeEnhancers = composeWithDevTools({ realtime: true });
    const composeEnhancers = compose;

    const newState = initialState || {} as IEnailStore;
    const store: Store<IEnailStore, EnailAction> = createStore<IEnailStore, EnailAction, {}, {}>(makeRootReducer, newState,         
        composeEnhancers(applyMiddleware(...middlewares))
    );

    return store;

}

const store = configureStore();
export default store;