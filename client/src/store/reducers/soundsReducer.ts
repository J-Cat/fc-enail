/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';
import { ISoundsState } from '../state/ISoundsState';
import { ISounds } from '../../models/ISounds';
import { parse } from 'path';

const initialState: ISoundsState = {
  loaded: false,
  loading: false,
  requesting: false,
  sounds: {},
};

const getSounds = (): AppThunk<{ error?: string, sounds?: ISounds }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, sounds?: ISounds }> => {
  dispatch(startLoad());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/sounds',
      method: 'GET',
    });

    const sounds: ISounds = response.data;
    dispatch(completeGetSounds({ sounds }));
    return { sounds };
  } catch (e) {
    const error = i18n.t(
      'SDOUNDS.GET_SOUNDS_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the sounds: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const uploadSound = (filename: string, data: Blob): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startLoad());

  try {
    const formData = new FormData();
    formData.append('file', data, filename);

    const result = await Axios({
      baseURL: Constants.API_URL,
      url: '/sounds',
      method: 'POST',
      data: formData,
    });

    dispatch(completeGetSounds({ sounds: result.data as ISounds}));
    return {};
  } catch (e) {
    const error = i18n.t(
      'SOUNDS.UPLOAD_SOUND_UNKNOWN_ERROR', 
      'An unknown error occured trying to upload the sound: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const deleteSound = (key: string): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startLoad());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/sounds/delete',
      method: 'POST',
      data: {
        key,
      },
    });

    dispatch(completeDeleteSound(key));
    return {};
  } catch (e) {
    const error = i18n.t(
      'SOUNDS.DELETE_SOUND_ERROR', 
      'An unknown error occured deleting the sound: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const slice = createSlice({
  name: 'SOUNDS',
  initialState,
  reducers: {    
    startLoad: (state: ISoundsState): ISoundsState => {
      return {
        ...state,
        loading: true,
      };
    },
    startRequest: (state: ISoundsState): ISoundsState => {
      return {
        ...state,
        requesting: true,
      };
    },
    completeRequest: (state: ISoundsState): ISoundsState => {
      return {
        ...state,
        requesting: false,
      };
    },
    completeGetSounds: (state: ISoundsState, action: PayloadAction<{ sounds: ISounds }>): ISoundsState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        sounds: action.payload.sounds,
      };
    },
    completeDeleteSound: (state: ISoundsState, action: PayloadAction<string>): ISoundsState => {
      const sounds = Object.keys(state.sounds).reduce((previous, key) => {
        if (key.toLowerCase() === action.payload.toLowerCase()) {
          return previous;
        }

        return {
          ...previous,
          [key]: state.sounds[key],
        };
      }, {});
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        sounds,
      };
    },
    setError: (state: ISoundsState, action: PayloadAction<string>): ISoundsState => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
  },
});

export {
  getSounds,
  uploadSound,
  deleteSound,
};

export const {
  startLoad,
  startRequest,
  completeRequest,
  completeGetSounds,
  completeDeleteSound,
  setError,
} = slice.actions;

const soundsReducer = slice.reducer;

export { soundsReducer };

