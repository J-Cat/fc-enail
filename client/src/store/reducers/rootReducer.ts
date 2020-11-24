import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './authReducer';
import { enailReducer } from './enailReducer';
import { localizationReducer } from './localizationReducer';
import { networkReducer } from './networkReducer';
import { profileReducer } from './profileReducer';
import { scriptReducer } from './scriptReducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  localization: localizationReducer,
  enail: enailReducer,
  profiles: profileReducer,
  network: networkReducer,
  scripts: scriptReducer,
});

export type RootState = ReturnType<typeof rootReducer>;