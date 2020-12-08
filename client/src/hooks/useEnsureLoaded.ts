import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getState, getConfig, getQuickSet } from '../store/reducers/enailReducer';
import { getProfiles } from '../store/reducers/profileReducer';
import { RootState } from '../store/reducers/rootReducer';
import { getScripts } from '../store/reducers/scriptReducer';
import { getSounds } from '../store/reducers/soundsReducer';
import { AppDispatch } from '../store/store';

export const useEnsureLoaded = (): void => {
  const dispatch = useDispatch<AppDispatch>();
  const authenticated = useSelector<RootState, boolean>(state => state.auth.authenticated);


  const load = async (): Promise<void> => {
    const result = await dispatch(getState());
    if (result.error) {
      console.error(result.error);
      return;
    }
    dispatch(getConfig());
    dispatch(getQuickSet());
    dispatch(getProfiles());
    dispatch(getScripts());
    dispatch(getSounds());
  };

  useEffect(() => {
    if (authenticated) {
      load();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};