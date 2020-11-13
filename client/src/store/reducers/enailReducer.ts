/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IConfig, IEnailState, ISharedState } from '../state/IEnailState';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';

const initialState: IEnailState = {
  loaded: false,
  loading: false,
  requesting: false,
};

const getState = (): AppThunk<{ result: boolean, state?: ISharedState, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, state?: ISharedState, error?: string }> => {
  dispatch(startLoad());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/state',
      method: 'GET',
    });

    const state: ISharedState = response.data;
    dispatch(completeGetState(state));
    return { result: true, state };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.GET_STATE_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the e-nail state: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
}

const sendState = (newState: ISharedState): AppThunk<{ 
  result: boolean, lastState?: ISharedState, state?: ISharedState, error?: string 
}> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, lastState?: ISharedState, state?: ISharedState, error?: string }> => {
  dispatch(startRequest());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/state',
      method: 'POST',
      data: newState,
    });

    const [lastState, state]: [ISharedState, ISharedState] = response.data;
    dispatch(completeGetState(state));
    return { result: true, lastState, state };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.SEND_STATE_UNKNOWN_ERROR', 
      'An unknown error occured trying to send an update to the e-nail: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
}

const getConfig = (): AppThunk<{ result: boolean, config?: IConfig, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, config?: IConfig, error?: string }> => {
  dispatch(startLoad());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/config',
      method: 'GET',
    });

    const config: IConfig = response.data;
    dispatch(completeGetConfig(config));
    return { result: true, config };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.GET_STATE_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the e-nail state: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
}

const sendConfig = (config: IConfig): AppThunk<{ result: boolean, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, error?: string }> => {
  dispatch(startRequest());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/config',
      method: 'POST',
      data: config,
    });

    dispatch(completeRequest());
    return { result: true };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.GET_STATE_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the e-nail state: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
}

const slice = createSlice({
  name: 'ENAIL',
  initialState,
  reducers: {    
    startLoad: (state: IEnailState): IEnailState => {
      return {
        ...state,
        loading: true,
      };
    },
    startRequest: (state: IEnailState): IEnailState => {
      return {
        ...state,
        requesting: true,
      };
    },
    completeRequest: (state: IEnailState): IEnailState => {
      return {
        ...state,
        requesting: false,
      };
    },
    completeGetState: (state: IEnailState, action: PayloadAction<ISharedState>): IEnailState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        state: action.payload,
      };
    },
    completeGetConfig: (state: IEnailState, action: PayloadAction<IConfig>): IEnailState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        config: action.payload,
      };
    },
    setState: (state: IEnailState, action: PayloadAction<ISharedState>): IEnailState => {
      return {
        ...state,
        state: {
          ...state.state,
          ...action.payload,
        },
      };
    },
    setError: (state: IEnailState, action: PayloadAction<string>): IEnailState => {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    },
  },
});

export {
  getState,
  getConfig,
  sendState,
  sendConfig,
};

export const {
  startLoad,
  startRequest,
  completeRequest,
  completeGetState,
  completeGetConfig,
  setState,
  setError,
} = slice.actions;

const enailReducer = slice.reducer;

export { enailReducer };
