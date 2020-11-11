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
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { configureStore, Action, AnyAction } from '@reduxjs/toolkit';
import { rootReducer, RootState } from '../reducers';
import { e5ccMiddleware } from './e5ccMiddleware';
import { scriptMiddleware } from './scriptMiddleware';
import { displayMiddleware } from './displayMiddleware';
import { settingsMiddleware } from './settingsMiddleware';

export const store = configureStore({
    reducer: rootReducer,
    middleware: [
        //...getDefaultMiddleware({ serializableCheck: false }),
        thunk,
        e5ccMiddleware,
        scriptMiddleware,
        settingsMiddleware,
        displayMiddleware,
    ],
});

// const store = configureStore();
export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

export type AppThunk<T> = ThunkAction<
    Promise<T>,
    RootState,
    undefined,
    Action<string>
>;

export default store;