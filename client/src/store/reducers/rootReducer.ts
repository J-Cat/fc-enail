import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from './authReducer';
import { enailReducer } from './enailReducer';
import { localizationReducer } from './localizationReducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  localization: localizationReducer,
  enail: enailReducer,
});

export type RootState = ReturnType<typeof rootReducer>