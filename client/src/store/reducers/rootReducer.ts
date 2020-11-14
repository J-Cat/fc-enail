import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from './authReducer';
import { enailReducer } from './enailReducer';
import { localizationReducer } from './localizationReducer';
import { profileReducer } from './profileReducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  localization: localizationReducer,
  enail: enailReducer,
  profiles: profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>