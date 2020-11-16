import { combineReducers } from '@reduxjs/toolkit'
import { authReducer } from './authReducer';
import { enailReducer } from './enailReducer';
import { localizationReducer } from './localizationReducer';
import { networkReducer } from './networkReducer';
import { profileReducer } from './profileReducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  localization: localizationReducer,
  enail: enailReducer,
  profiles: profileReducer,
  network: networkReducer,
});

export type RootState = ReturnType<typeof rootReducer>