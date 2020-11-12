/* eslint-disable @typescript-eslint/no-use-before-define */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthState } from '../state/IAuthState';
import { AppThunk, AppDispatch } from '../store';
import { Constants } from '../../models/constants';
import Axios from 'axios';
import i18n from '../../i18n';

const getInitialState = (): IAuthState => {
  try {
    const token = localStorage.getItem(Constants.TOKEN_STATE_KEY);

    if (token) {
      return {
        authenticated: true,
        authenticating: false,
        requesting: false,
        token,
      };
    }
  } catch (e) {
    console.log(`Unknown error getting initial auth state: ${e.message}`);
  }

  return {
    authenticated: false,
    authenticating: false,
    requesting: false,
  };
};

const initialState: IAuthState = getInitialState();

const logout = (): AppThunk<void> => async (dispatch: AppDispatch): Promise<void> => {
  return new Promise(resolve => {
    localStorage.removeItem(Constants.TOKEN_STATE_KEY);
    dispatch(completeLogout());
    resolve();
  });
};

const logoutSoft = (): AppThunk<void> => async (dispatch: AppDispatch): Promise<void> => {
  return new Promise(resolve => {
    dispatch(completeLogout());
    resolve();
  });
};

const requestLogin = (): AppThunk<void> => async (dispatch: AppDispatch): Promise<void> => {
  dispatch(requestLoginStart());
  
  try {
    await Axios({
      baseURL: Constants.API_URL,
      url: '/auth/passcode',
      method: 'POST',
    });

    dispatch(completeRequestLogin());
    return;
  } catch (e) {
    const error = i18n.t(
      'AUTH.REQUEST_LOGIN_UNKNOWN_ERROR', 
      'An unknown error occured trying to initiate a login request: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
  }
}

const login = (passcode: string): AppThunk<{ result: boolean, error?: string }> => async (
  dispatch: AppDispatch,
): Promise<{ result: boolean, error?: string}> => {
  dispatch(loginStart());

  try {
    const response = await Axios({
      baseURL: Constants.API_URL,
      url: '/auth/login',
      method: 'POST',
      data: {
        passphrase: passcode,
      },
    });

    const data = response.data;

    if (data && data?.token) {
      localStorage.setItem(Constants.TOKEN_STATE_KEY, data.token);
      dispatch(completeLogin(data.token));
      return { result: true };
    } else {
      throw i18n.t('AUTH.LOGIN_FAILED', 'Login failed.');
    }
  } catch (e) {
    const error = i18n.t(
      'AUTH.LOGIN_UNKNOWN_ERROR', 
      'An unknown error occured trying to login: {{error}}', 
      { error: e.message },
    );
    
    dispatch(setError(error));
    return { result: false, error };
  }
};

const slice = createSlice({
  name: 'AUTH',
  initialState,
  reducers: {
    requestLoginStart: (state: IAuthState): IAuthState => {
      return {
        ...state,
        requesting: true,
      };
    },
    completeRequestLogin: (state: IAuthState): IAuthState => {
      return {
        ...state,
        requesting: false,
      };
    },
    loginStart: (state: IAuthState): IAuthState => {
      return {
        ...state,
        authenticating: true,
        authenticated: false,
      };
    },
    completeLogin: (state: IAuthState, action: PayloadAction<string>): IAuthState => {
      return {
        ...state,
        authenticated: true,
        authenticating: false,
        token: action.payload,
      };
    },
    completeLogout: (state: IAuthState): IAuthState => {
      return {
        ...state,
        authenticated: false,
        authenticating: false,
        token: undefined,
      };
    },
    setError: (state: IAuthState, action: PayloadAction<string>): IAuthState => {
      return {
        ...state,
        authenticating: false,
        requesting: false,
        error: action.payload,
      };
    },
  },
});

export {
  logout,
  logoutSoft,
  login,
  requestLogin,
};

export const {
  requestLoginStart,
  completeRequestLogin,
  loginStart,
  completeLogin,
  completeLogout,
  setError,
} = slice.actions;

const authReducer = slice.reducer;

export { authReducer };
