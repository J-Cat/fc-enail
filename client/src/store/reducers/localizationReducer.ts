/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILocalizationState } from '../state/ILocalizationState';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';

const getInitialState = (): ILocalizationState => {
  const language = sessionStorage.getItem(Constants.LANGUAGE_STATE_KEY);
  return { 
    language: language || 'en',
  };
};

const initialState: ILocalizationState = getInitialState();

const setLanguage = (language: string): AppThunk<void> => async (dispatch: AppDispatch): Promise<void> => {
  return new Promise(resolve => {
    sessionStorage.setItem(Constants.LANGUAGE_STATE_KEY, language);
    dispatch(completeSetLanguage(language));
    resolve();
  });
};

const slice = createSlice({
  name: 'LOCALIZATION',
  initialState,
  reducers: {
    completeSetLanguage: (state: ILocalizationState, action: PayloadAction<string>): ILocalizationState => {
      return {
        language: action.payload,
      };
    },
  },
});

export {
  setLanguage,
};

export const {
  completeSetLanguage,
} = slice.actions;

const localizationReducer = slice.reducer;

export { localizationReducer };
