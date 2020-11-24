import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getState, getConfig, getQuickSet } from '../store/reducers/enailReducer';
import { getProfiles } from '../store/reducers/profileReducer';
import { getScripts } from '../store/reducers/scriptReducer';
import { AppDispatch } from '../store/store';

export const useEnsureLoaded = (): void => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getState()).then(result => {
      if (result.error) {
        console.error(result.error);
        return;
      }
      dispatch(getConfig());
      dispatch(getQuickSet());
      dispatch(getProfiles());
      dispatch(getScripts());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};