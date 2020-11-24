/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Middleware, MiddlewareAPI } from 'redux';
import { AppDispatch } from '../store';
import Axios from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../reducers/rootReducer';

let authInterceptorHandle = 0;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types
export const authMiddleware: Middleware<{}, RootState> = (api: MiddlewareAPI<AppDispatch>) => (
  next: AppDispatch,
) => <A extends PayloadAction<string | void>>(action: A): void => {
  switch (action.type) {
  case 'AUTH/completeLogin': {
    const token = action.payload;
    if (!token) {
      next(action);
      return;
    }

    try {
      Axios.interceptors.request.eject(authInterceptorHandle);
      // eslint-disable-next-line no-empty
    } catch { }

    authInterceptorHandle = Axios.interceptors.request.use(
      config => {
        return new Promise(resolve => {
          if (config.url && config.url.toLowerCase().startsWith('/auth/')) {
            resolve(config);
          } else {
            resolve({
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${token}`,
              },
            });
          }
        });
      },
      error => {
        console.log(`Axios interceptor error: ${error}`);
      },
    );

    /* ********************************************************************* */
    /* Initialize Here!!                                                     */
    /* ********************************************************************* */
    next(action);    

    return;
  }

  default: {
    // if (!action.type.startsWith('AUTH/')) {
    //   if (!api.getState().auth.authenticated)) {
    //   }
    // }
    next(action);
    return;
  }
  }
};
