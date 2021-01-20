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
  quickset: [],
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
};

const getUrl = (): AppThunk<{ url?: string, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ url?: string, error?: string }> => {
  dispatch(startRequest());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/state/url',
      method: 'GET',
    });

    const state: { url: string } = response.data;
    dispatch(completeGetUrl(state.url));
    return { url: state.url };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.GET_URL_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the e-nail public url: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

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
};

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
};

const sendConfig = (config: IConfig): AppThunk<{ result: boolean, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/config',
      method: 'POST',
      data: config,
    });

    dispatch(completeSendConfig(config));
    return { result: true };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.ERROR_SAVE_CONFIG', 
      'An unknown error occured saving the configuration: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
};

const getQuickSet = (): AppThunk<{ result: boolean, values?: number[], error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, values?: number[], error?: string }> => {
  dispatch(startLoad());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/config/quickset',
      method: 'GET',
    });

    const values: number[] = response.data;
    dispatch(completeGetQuickSet(values));
    return { result: true, values };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.GET_QUICKSET_UNKNOWN_ERROR', 
      'An unknown error occured trying to retrieve the quick-set values: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
};

const sendQuickSet = (values: number[]): AppThunk<{ result: boolean, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/config/quickset',
      method: 'POST',
      data: values,
    });

    dispatch(completeRequest());
    return { result: true };
  } catch (e) {
    const error = i18n.t(
      'ENAIL.SEND_QUICKSET_UNKNOWN_ERROR', 
      'An unknown error occured trying to update the quick-set values: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      result: false,
      error,
    };
  }
};

const reboot = (): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/system/reboot',
      method: 'POST',
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'ENAIL.REBOOT_UNKNOWN_ERROR', 
      'An unknown error occured trying to reboot the FC E-Nail: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const restartService = (): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/system/restart',
      method: 'POST',
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'ENAIL.RESTART_UNKNOWN_ERROR', 
      'An unknown error occured trying to restart the FC E-Nail service: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const checkForUpdates = (): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/system/checkForUpdates',
      method: 'POST',
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'ENAIL.CHECK_FOR_UPDATES_UNKNOWN_ERROR', 
      'An unknown error occured issuing a request to check for updates: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

const updateTime = (): AppThunk<{ error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/system/updateTime',
      method: 'POST',
      data: {
        time: Date.now()
      },
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'ENAIL.UPDATE_TIME_UNKNOWN_ERROR', 
      'An unknown error occured trying to udpate the E-Nail clock: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return {
      error,
    };
  }
};

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
    completeSendConfig: (state: IEnailState, action: PayloadAction<IConfig>): IEnailState => {
      return {
        ...state,
        requesting: false,
        config: action.payload,
      };
    },
    completeGetQuickSet: (state: IEnailState, action: PayloadAction<number[]>): IEnailState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        loaded: true,
        quickset: action.payload,
      };
    },
    completeGetUrl: (state: IEnailState, action: PayloadAction<string>): IEnailState => {
      return {
        ...state,
        requesting: false,
        state: {
          ...state.state,
          url: action.payload,
        },
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
  getQuickSet,
  sendState,
  sendConfig,
  sendQuickSet,
  restartService,
  reboot,
  checkForUpdates,
  getUrl,
  updateTime,
};

export const {
  startLoad,
  startRequest,
  completeRequest,
  completeGetState,
  completeGetConfig,
  completeSendConfig,
  completeGetQuickSet,
  completeGetUrl,
  setState,
  setError,
} = slice.actions;

const enailReducer = slice.reducer;

export { enailReducer };
