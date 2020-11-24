/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INetworkConfig, INetworkState } from '../state/INetworkState';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';
import { completeRequest, startRequest } from './enailReducer';

const initialState: INetworkState = {
  loaded: false,
  loading: false,
  requesting: false,
  scanning: false,
  ssids: [],
};
const getNetworkConfig = (): AppThunk<{ error?: string, config?: INetworkConfig }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, config?: INetworkConfig }> => {
  dispatch(startGetNetworkInfo());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/network',
      method: 'GET',
    });

    const data: INetworkConfig & { ssids: string[] } = response.data;

    if (data?.mode && data?.ssid) {
      const info = { mode: data.mode, ssid: data.ssid };
      const ssids = data.ssids;
      dispatch(completeGetNetworkInfo({ config: info, ssids}));
      return { config: info };
    } else {
      throw i18n.t('NETWORK.getNetworkConfigFailed', 'Retrieving network information failed.');
    }
  } catch (e) {
    const error = i18n.t(
      'NETWORK.getNetworkConfigUnknownError', 
      'An unknown error occured trying to retrieve the network configuration: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return { error };
  }
};

const scanNetworks = (): AppThunk<{ error?: string, ssids?: string[] }> => async (
  dispatch: AppDispatch,
): Promise<{ error?: string, ssids?: string[] }> => {
  dispatch(startScanNetworks());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/network/scan',
      method: 'GET',
    });

    const ssids: string[] = response.data;

    dispatch(completeScanNetworks(ssids));

    return { ssids };
  } catch (e) {
    const error = i18n.t(
      'NETWORK.scanNetworksUnknownError', 
      'An unknown error occured trying to scan for nearby WiFi networks: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return { error };
  }
};

const connectWifi = (
  mode: string, ssid: string, passcode: string,
):AppThunk<{ error?: string }> => async (dispatch: AppDispatch): Promise<{ error?: string }> => {
  dispatch(startRequest());

  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/network/connect',
      method: 'POST',
      data: {
        mode, ssid, passcode,
      },
    });

    dispatch(completeRequest());
    return {};
  } catch (e) {
    const error = i18n.t(
      'NETWORK.connectError', 
      'An unknown error occured trying to connect to the WiFi network, {{ssid}}: {{error}}', 
      { ssid, error: e.message },
    );
    
    dispatch(setError(error));
    return { error };
  }
};

const slice = createSlice({
  name: 'NETWORK',
  initialState,
  reducers: {
    startRequest: (state: INetworkState): INetworkState => {
      return {
        ...state,
        requesting: true,
      };
    },
    startGetNetworkInfo: (state: INetworkState): INetworkState => {
      return {
        ...state,
        loading: true,
      };
    },
    completeGetNetworkInfo: (state: INetworkState, action: PayloadAction<{config: INetworkConfig, ssids: string[]}>): INetworkState => {
      return {
        ...state,
        loaded: true,
        loading: false,
        config: action.payload.config,
        ssids: action.payload.ssids || [],
      };
    },
    startScanNetworks: (state: INetworkState): INetworkState => {
      return {
        ...state,
        scanning: true,
      };
    },
    completeScanNetworks: (state: INetworkState, action: PayloadAction<string[]>): INetworkState => {
      return {
        ...state,
        scanning: false,
        ssids: action.payload,
      };
    },
    setError: (state: INetworkState, action: PayloadAction<string>): INetworkState => {
      return {
        ...state,
        loading: false,
        requesting: false,
        error: action.payload,
      };
    },
  },
});

export {
  getNetworkConfig,
  scanNetworks,
  connectWifi,
};

export const {
  startGetNetworkInfo,
  completeGetNetworkInfo,
  startScanNetworks,
  completeScanNetworks,
  setError,
} = slice.actions;

const networkReducer = slice.reducer;

export { networkReducer };
