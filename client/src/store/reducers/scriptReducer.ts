/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';
import { IScriptState } from '../state/IScriptState';
import { IScript } from '../../models/IScript';

const initialState: IScriptState = {
  loaded: false,
  loading: false,
  requesting: false,
  scripts: [],
};

const getScripts = (): AppThunk<{ error?: string, currentScript?: string, scripts?: IScript[] }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, currentScript?: string, scripts?: IScript[] }> => {
  dispatch(startLoad());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/scripts',
      method: 'GET',
    });

    const { currentScript, scripts }: { currentScript: string, scripts: IScript[] } = response.data;
    dispatch(completeGetScripts({ currentScript, scripts }));
    return { currentScript, scripts };
  } catch (e) {
    const error = i18n.t(
      'SCRIPTS.GET_STATE_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the scripts: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const saveScript = (script: IScript): AppThunk<{ error?: string, script?: IScript }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, script?: IScript }> => {
  dispatch(startRequest());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/scripts',
      method: 'POST',
      data: script,
    });

    const updated: IScript = response.data;
    dispatch(completeSaveScript(updated));
    return { script: updated };
  } catch (e) {
    const error = i18n.t(
      'SCRIPTS.SAVE_SCRIPT_UNKNOWN_ERROR', 
      'An unknown error occured trying to save the script: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const runScript = (key: string): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/scripts/run',
      method: 'POST',
      data: {
        key,
      },
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'SCRIPTS.RUN_SCRIPT_ERROR', 
      'An unknown error occured trying to run the script: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const setCurrentScript = (key: string): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, script?: IScript }> => {
  dispatch(startLoad());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/scripts/setCurrent',
      method: 'POST',
      data: {
        key,
      },
    });

    dispatch(completeSetCurrentScript(key));
    return {};
  } catch (e) {
    const error = i18n.t(
      'SCRIPTS.SET_CURRENT_SCRIPT_ERROR', 
      'An unknown error occured trying to set the current script: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const deleteScript = (key: string): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, script?: IScript }> => {
  dispatch(startLoad());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/scripts/delete',
      method: 'POST',
      data: {
        key,
      },
    });

    dispatch(completeDeleteScript(key));
    return {};
  } catch (e) {
    const error = i18n.t(
      'SCRIPTS.DELETE_SCRIPT_ERROR', 
      'An unknown error occured deleting the script: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const slice = createSlice({
  name: 'SCRIPTS',
  initialState,
  reducers: {    
    startLoad: (state: IScriptState): IScriptState => {
      return {
        ...state,
        loading: true,
      };
    },
    startRequest: (state: IScriptState): IScriptState => {
      return {
        ...state,
        requesting: true,
      };
    },
    completeRequest: (state: IScriptState): IScriptState => {
      return {
        ...state,
        requesting: false,
      };
    },
    completeGetScripts: (state: IScriptState, action: PayloadAction<{ currentScript: string, scripts: IScript[] }>): IScriptState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        currentScript: action.payload.currentScript,
        scripts: action.payload.scripts,
      };
    },
    completeSaveScript: (state: IScriptState, action: PayloadAction<IScript>): IScriptState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        scripts: [
          ...(state.scripts.filter(p => p.key !== action.payload.key)),
          {...action.payload},
        ],
      };
    },
    completeSetCurrentScript: (state: IScriptState, action: PayloadAction<string>): IScriptState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        currentScript: action.payload,
      };
    },
    completeDeleteScript: (state: IScriptState, action: PayloadAction<string>): IScriptState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        scripts: [
          ...(state.scripts.filter(p => p.key !== action.payload)),
        ],
      };
    },
    updateCurrentScript: (state: IScriptState, action: PayloadAction<IScript>): IScriptState => {
      return {
        ...state,
        scripts: [
          ...(state.scripts.filter(p => p.key !== action.payload.key)),
          action.payload,
        ],
      };
    },
    setError: (state: IScriptState, action: PayloadAction<string>): IScriptState => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
  },
});

export {
  getScripts,
  runScript,
  saveScript,
  deleteScript,
  setCurrentScript,
};

export const {
  startLoad,
  startRequest,
  completeRequest,
  completeGetScripts,
  completeSetCurrentScript,
  completeSaveScript,
  completeDeleteScript,
  updateCurrentScript,
  setError,
} = slice.actions;

const scriptReducer = slice.reducer;

export { scriptReducer };
