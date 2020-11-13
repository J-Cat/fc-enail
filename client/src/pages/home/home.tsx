import { Card, Col, Form, Row, Slider, Spin, Switch } from 'antd';
import Grid from 'antd/lib/card/Grid';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSocketIO } from '../../hooks/useSocketIO';
import { getConfig, getState, sendState, setState } from '../../store/reducers/enailReducer';
import { RootState } from '../../store/reducers/rootReducer';
import { IConfig } from '../../store/state/IEnailState';
import { AppDispatch } from '../../store/store';
import './home.less';

const { Item } = Form;

const HomePage: FC = () => {
  const loading = useSelector<RootState, boolean>(state => state.enail.loading);
  const presentValue = useSelector<RootState, number>(state => state.enail?.state?.pv || 0);
  const setPoint = useSelector<RootState, number>(state => state.enail?.state?.sp || 0);
  const running = useSelector<RootState, boolean>(state => state.enail.state?.running || false);
  const config = useSelector<RootState, IConfig|undefined>(state => state.enail.config);
  const shutoffTimer = useSelector<RootState, number>(
    state => Math.max(
      0, 
      ((state.enail.config?.autoShutoff || 0) * 60000) 
      - (Date.now() - (state.enail.state?.started || 0)),
    ),
  );
  const [ isRunning, setIsRunning ] = useState(false);
  const [ setPointLocal, setSetPointLocal ] = useState(setPoint);
  const [t] = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const powerChangeStart = useRef(0);
  const setPointChangeStart = useRef(0);
  const setPointChanging = useRef(false);

  useEffect(() => {
    //presentValueChangeStart = Date.now();
    if (!loading && ((Date.now() - setPointChangeStart.current)>2000) && !setPointChanging.current) {
      setSetPointLocal(setPoint);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPoint]);

  useEffect(() => {
    if (!loading && ((Date.now() - powerChangeStart.current)>2000)) {
      setIsRunning(running);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    dispatch(getState()).then(() => {
      dispatch(getConfig());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSocketIO();

  const onPowerChange = async (value: boolean) => {
    powerChangeStart.current = Date.now();
    const { result, state } = await dispatch(sendState({
      running: value,
    }));
    if (result && state?.running !== isRunning && state?.running !== undefined) {
      setIsRunning(state?.running);
    }
  }

  const getTimeString = (value: number): string => {
    if (!running) {
      return '';
    }
    const h = Math.floor(value / 3600000);
    const m = Math.floor(
      (value - (h * 3600000))
      /
      60000,
    );
    const s = Math.floor(
      (value - (h * 3600000) - (m * 60000))
      /
      1000,
    )
    return `${h !== 0 ? `${h.toString()}:` : ''}${h === 0 ? m.toString() : m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const onSetPointChange = (value: number) => {
    setPointChanging.current = true;
    setSetPointLocal(value);
  }
  const updateSetPoint = async (value: number) => {
    setPointChangeStart.current = Date.now();
    setSetPointLocal(value);
    await dispatch(sendState({ sp: value }));
    setPointChanging.current = false;
  };
  
  if (loading) {
    return <Spin />;
  }

  return (
    <Grid className="home-grid">
      <Row>
        <Col span={16}>
          <Card title={`${presentValue.toFixed(0)}\u00B0F`} className="temp-card">
            {setPoint.toFixed(0)}&deg;F
          </Card>
        </Col>
        <Col span={8} className="power-switch">
          <Card title={<Switch checked={isRunning} onClick={onPowerChange} />} className="power-switch-card">
            {running ? getTimeString(shutoffTimer) : <span>&nbsp;</span>}
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Slider 
            value={setPointLocal} 
            min={config?.min || 0}
            max={config?.max || 1000}
            onChange={onSetPointChange} 
            onAfterChange={updateSetPoint} 
          />
        </Col>
      </Row>
    </Grid>
  );
};

const homePage = withRouter(HomePage);

export { homePage as HomePage };
