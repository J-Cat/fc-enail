import { configureStore, Action, AnyAction } from '@reduxjs/toolkit';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { rootReducer, RootState } from './reducers/rootReducer';
import { authMiddleware } from './middleware/authMiddleware';
import { completeLogin } from './reducers/authReducer';
import { Constants } from '../models/constants';

export const store = configureStore({
  reducer: rootReducer,
  middleware: [
    //...getDefaultMiddleware({ serializableCheck: false }),
    thunk,
    authMiddleware,
  ],
});

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

export type AppThunk<T> = ThunkAction<
    Promise<T>,
    RootState,
    undefined,
    Action<string>
>;

export type AppStore = typeof store;

const token = localStorage.getItem(Constants.TOKEN_STATE_KEY);
if (token) {
  store.dispatch(completeLogin(token));
}