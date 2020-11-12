/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEnailState, ISharedState } from '../state/IEnailState';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';

const initialState: IEnailState = {
  loaded: false,
  loading: false,
};

const getState = (): AppThunk<{ result: boolean, state?: ISharedState, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, state?: ISharedState, error?: string }> => {
  dispatch(startRequest());

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

const slice = createSlice({
  name: 'ENAIL',
  initialState,
  reducers: {
    startRequest: (state: IEnailState): IEnailState => {
      return {
        ...state,
        loading: true,
      };
    },
    completeGetState: (state: IEnailState, action: PayloadAction<ISharedState>): IEnailState => {
      return {
        ...state,
        loading: false,
        loaded: true,
        state: action.payload,
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
};

export const {
  startRequest,
  completeGetState,
  setState,
  setError,
} = slice.actions;

const enailReducer = slice.reducer;

export { enailReducer };
