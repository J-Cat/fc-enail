/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';
import { IProfile, IProfileState } from '../state/IProfileState';

const initialState: IProfileState = {
  loaded: false,
  loading: false,
  requesting: false,
  profiles: [],
};

const getProfiles = (): AppThunk<{ error?: string, currentProfile?: string, profiles?: IProfile[] }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, currentProfile?: string, profiles?: IProfile[] }> => {
  dispatch(startLoad());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/profiles',
      method: 'GET',
    });

    const { currentProfile, profiles }: { currentProfile: string, profiles: IProfile[] } = response.data;
    dispatch(completeGetProfiles({ currentProfile, profiles }));
    return { currentProfile, profiles };
  } catch (e) {
    const error = i18n.t(
      'PROFILES.GET_STATE_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the profiles: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
}

const saveProfile = (profile: IProfile): AppThunk<{ error?: string, profile?: IProfile }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, profile?: IProfile }> => {
  dispatch(startRequest());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/profiles',
      method: 'POST',
      data: profile,
    });

    const updated: IProfile = response.data;
    dispatch(completeSaveProfile(updated));
    return { profile: updated };
  } catch (e) {
    const error = i18n.t(
      'PROFILES.SAVE_PROFILE_UNKNOWN_ERROR', 
      'An unknown error occured trying to save the profile: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
}

const toggleTuning = (): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/profiles/tuning',
      method: 'POST',
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'PROFILES.TOGGLE_TUNING_ERROR', 
      'An unknown error occured trying to change the e-nail tuning state: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
}

const setCurrentProfile = (key: string): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, profile?: IProfile }> => {
  dispatch(startLoad());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/profiles/setCurrent',
      method: 'POST',
      data: {
        key,
      },
    });

    dispatch(completeSetCurrentProfile(key));
    return {};
  } catch (e) {
    const error = i18n.t(
      'PROFILES.SET_CURRENT_PROFILE_ERROR', 
      'An unknown error occured trying to set the current profile: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
}

const deleteProfile = (key: string): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, profile?: IProfile }> => {
  dispatch(startLoad());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/profiles/delete',
      method: 'POST',
      data: {
        key,
      },
    });

    dispatch(completeDeleteProfile(key));
    return {};
  } catch (e) {
    const error = i18n.t(
      'PROFILES.DELETE_PROFILE_ERROR', 
      'An unknown error occured deleting the profile: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
}

const slice = createSlice({
  name: 'PROFILES',
  initialState,
  reducers: {    
    startLoad: (state: IProfileState): IProfileState => {
      return {
        ...state,
        loading: true,
      };
    },
    startRequest: (state: IProfileState): IProfileState => {
      return {
        ...state,
        requesting: true,
      };
    },
    completeRequest: (state: IProfileState): IProfileState => {
      return {
        ...state,
        requesting: false,
      };
    },
    completeGetProfiles: (state: IProfileState, action: PayloadAction<{ currentProfile: string, profiles: IProfile[] }>): IProfileState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        currentProfile: action.payload.currentProfile,
        profiles: action.payload.profiles,
      };
    },
    completeSaveProfile: (state: IProfileState, action: PayloadAction<IProfile>): IProfileState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        profiles: [
          ...(state.profiles.filter(p => p.key !== action.payload.key)),
          {...action.payload},
        ],
      };
    },
    completeSetCurrentProfile: (state: IProfileState, action: PayloadAction<string>): IProfileState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        currentProfile: action.payload,
      };
    },
    completeDeleteProfile: (state: IProfileState, action: PayloadAction<string>): IProfileState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        profiles: [
          ...(state.profiles.filter(p => p.key !== action.payload)),
        ],
      };
    },
    updateCurrentProfile: (state: IProfileState, action: PayloadAction<IProfile>): IProfileState => {
      return {
        ...state,
        profiles: [
          ...(state.profiles.filter(p => p.key !== action.payload.key)),
          action.payload,
        ],
      };
    },
    setError: (state: IProfileState, action: PayloadAction<string>): IProfileState => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
  },
});

export {
  getProfiles,
  toggleTuning,
  saveProfile,
  deleteProfile,
  setCurrentProfile,
};

export const {
  startLoad,
  startRequest,
  completeRequest,
  completeGetProfiles,
  completeSetCurrentProfile,
  completeSaveProfile,
  completeDeleteProfile,
  updateCurrentProfile,
  setError,
} = slice.actions;

const profileReducer = slice.reducer;

export { profileReducer };
