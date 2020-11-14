import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getState, getConfig, getQuickSet } from '../store/reducers/enailReducer';
import { getProfiles } from '../store/reducers/profileReducer';
import { AppDispatch } from '../store/store';

export const useEnsureLoaded = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getState()).then(() => {
      dispatch(getConfig()).then(() => {
        dispatch(getQuickSet()).then(() => {
          dispatch(getProfiles());
        })
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

}