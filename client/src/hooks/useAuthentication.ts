import Axios from 'axios';
import { useEffect } from 'react';
import HttpStatusCodes from 'http-status-codes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store/store';
import { logoutSoft } from '../store/reducers/authReducer';
import { useHistory, useLocation } from 'react-router-dom';
import { RootState } from '../store/reducers/rootReducer';
import { Constants } from '../models/constants';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

let lastLoginError = 0;

export const useAuthentication = (): void => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const location = useLocation();
  const authenticated = useSelector((state: RootState) => state.auth.authenticated);
  const authenticating = useSelector((state: RootState) => state.auth.authenticating);
  const [t] = useTranslation();
  
  useEffect(() => {
    const handle = Axios.interceptors.response.use(
      (response) => {
        return response;
      }, (error) => {
        if (
          [
            HttpStatusCodes.UNAUTHORIZED, 
            HttpStatusCodes.FORBIDDEN, 
            HttpStatusCodes.NETWORK_AUTHENTICATION_REQUIRED,
          ].includes(error.response?.status)
        ) {
          if (error.response?.config.url !== '/auth') {
            if (!location.pathname.endsWith('login')) {
              if ((Date.now() - lastLoginError)>2000) {
                Modal.error({
                  centered: true,
                  title: t('labels.Unauthorized', 'Unauthorized!'),
                  content: t('error.unauthorized', 'Access denied to FC E-Nail: {{error}}', { error: error.message }),
                });  
              }
              lastLoginError = Date.now();
            }
            dispatch(logoutSoft()).then(() => {
              history.push(`${Constants.CLIENT_BASE_PATH}login`);
            });
            return;
          }
        }

        throw error;
      },
    );        

    return () => Axios.interceptors.response.eject(handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authenticated && !authenticating && !location.pathname.endsWith('/login')) {
    history.push(`${Constants.CLIENT_BASE_PATH}login`);
  }
};