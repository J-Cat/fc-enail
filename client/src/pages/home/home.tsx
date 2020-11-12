import { Form, Spin } from 'antd';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSocketIO } from '../../hooks/useSocketIO';
import { getState } from '../../store/reducers/enailReducer';
import { RootState } from '../../store/reducers/rootReducer';
import { AppDispatch } from '../../store/store';
import './home.less';

const { Item } = Form;

const HomePage: FC = () => {
  const loaded = useSelector((state: RootState) => state.enail.loaded);
  const loading = useSelector((state: RootState) => state.enail.loading);
  const enailState = useSelector((state: RootState) => state.enail.state);
  const [t] = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getState());
  }, []);

  useSocketIO();

  if (loading) {
    return <Spin />;
  }

  return (<div>
    {JSON.stringify(enailState, null, ' ')}
  </div>);
};

const homePage = withRouter(HomePage);

export { homePage as HomePage };
