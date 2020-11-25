import { Button, Card, Col, Modal, Row, Select, Slider, Spin, Switch } from 'antd';
import Icon, { BorderOutlined, ClockCircleOutlined, CloudOutlined, CodeOutlined, HomeOutlined, HourglassOutlined, LockOutlined, PlaySquareOutlined, SettingOutlined, StarOutlined, WifiOutlined } from '@ant-design/icons';
import Grid from 'antd/lib/card/Grid';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { sendState } from '../../store/reducers/enailReducer';
import { RootState } from '../../store/reducers/rootReducer';
import { IConfig, IScriptFeedback } from '../../store/state/IEnailState';
import { AppDispatch } from '../../store/store';
import './home.less';
import { IProfile } from '../../store/state/IProfileState';
import { setCurrentProfile as setProfile } from '../../store/reducers/profileReducer';
import { IScript } from '../../models/IScript';
import { runScript, setCurrentScript as setCurrentScriptReducer } from '../../store/reducers/scriptReducer';
import { ReactComponent as dropSvg } from '../../assets/icons/drop.svg';

const HomePage: FC = () => {
  const tuning = useSelector<RootState, boolean>(state => state.enail.state?.tuning || false);
  const loading = useSelector<RootState, boolean>(state => state.enail.loading);
  const script = useSelector<RootState, string>(state => state.scripts.currentScript || '');
  const scripts = useSelector<RootState, IScript[]>(state => state.scripts.scripts);
  const presentValue = useSelector<RootState, number>(state => state.enail?.state?.pv || 0);
  const setPoint = useSelector<RootState, number>(state => state.enail?.state?.sp || 0);
  const running = useSelector<RootState, boolean>(state => state.enail.state?.running || false);
  const scriptRunning = useSelector<RootState, boolean>(state => state.enail.state?.scriptRunning || false);
  const config = useSelector<RootState, IConfig|undefined>(state => state.enail.config);
  const quickset = useSelector<RootState, number[]>(state => state.enail.quickset);
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

  const profile = useSelector<RootState, string>(state => state.profiles.currentProfile || '');
  const profiles = useSelector<RootState, IProfile[]>(state => state.profiles.profiles);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [currentScript, setCurrentScript] = useState(script);
  const scriptFeedback = useSelector<RootState, IScriptFeedback|undefined>(state => state.enail.state?.scriptFeedback);

  useEffect(() => {
    setCurrentProfile(profile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    setCurrentScript(script);
  }, [script]);

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

  const onPowerChange = async (value: boolean) => {
    powerChangeStart.current = Date.now();
    const { result, state } = await dispatch(sendState({
      running: value,
    }));
    if (result && state?.running !== isRunning && state?.running !== undefined) {
      setIsRunning(state?.running);
    }
  };

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
    );
    return `${h !== 0 ? `${h.toString()}:` : ''}${h === 0 ? m.toString() : m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const onSetPointChange = (value: number) => {
    setPointChanging.current = true;
    setSetPointLocal(value);
  };
  const updateSetPoint = async (value: number) => {
    setPointChangeStart.current = Date.now();
    setSetPointLocal(value);
    await dispatch(sendState({ sp: value }));
    setPointChanging.current = false;
  };
  
  const onQuickSet = async (value: number) => {
    const result = await dispatch(sendState({ sp: value }));
    if (result.result && result.state?.sp) {
      setSetPointLocal(result.state?.sp);
    }
  };
  
  const profileOnChange = (key: string) => {
    const prf = profiles.find(p => p.key === key);
    if (!prf) {
      return;
    }
    Modal.confirm({
      title: t('confirm.setActive.title', 'Set Active?'),
      content: t('confirm.setActive.content', 'Load the {{profile}} profile?', { profile: prf.title }),
      onOk: async () => {
        const result = await dispatch(setProfile(key));
        if (result.error) {
          Modal.error({
            title: t('error.setactive.title', 'Error Setting Active'),
            content: t('error.setactive.content', 'An error occured setting {{profile}} to the active profile.', { profile: prf.title }),
          });
        }
        setCurrentProfile(key);
      },
    });
  };

  const getScriptStatus = (): JSX.Element => {
    if (!scriptFeedback) {
      return <></>;
    }

    if (scriptFeedback?.text) {
      return <div>{scriptFeedback.text}</div>;
    }
    
    return <div>Elapsed {getTimeString(Date.now() - (scriptFeedback?.start || 0))}</div>;
  };

  const getScriptIcon = (): JSX.Element => {
    if (!scriptFeedback) {
      return <></>;
    }

    if (!scriptFeedback?.icon) {
      return <></>;
    }

    switch (scriptFeedback.icon) {
    case 'clock': {
      return <ClockCircleOutlined />;
    }
    case 'cloud': {
      return <CloudOutlined />;
    }
    case 'code_16x16': {
      return <CodeOutlined />;
    }
    case 'drop': {
      return <Icon component={dropSvg} />;
    }
    case 'gear': {
      return <SettingOutlined />;
    }
    case 'home': {
      return <HomeOutlined />;
    }
    case 'hourglass': {
      return <HourglassOutlined />;
    }
    case 'lock': {
      return <LockOutlined />;
    }
    case 'star': {
      return <StarOutlined />;
    }
    case 'wifi': {
      return <WifiOutlined />;
    }
    }

    return <></>;
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="home-container">
      <div className="spacer" />
      <Grid className="home-grid" hoverable={false}>
        <Row className="header-row">
          <Col span={24} className="home-grid-header">
            <img src={`${process.env.PUBLIC_URL}/favicon.ico`} />&nbsp;<h1>FC E-Nail</h1>
          </Col>
        </Row>

        <Row>
          <Col span={16}>
            <Card title={`${presentValue.toFixed(0)}\u00B0F`} className="temp-card">
              {setPoint.toFixed(0)}&deg;F
            </Card>
          </Col>
          <Col span={8} className="power-switch">
            <Card title={<Switch disabled={tuning || scriptRunning} checked={isRunning} onClick={onPowerChange} />} className="power-switch-card">
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
              disabled={tuning || scriptRunning}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24} className="quickset-bar">
            {quickset.map(value => {
              return (
                <Button 
                  type="ghost" 
                  className={setPoint === value ? 'quickset-selected' : ''} 
                  key={`quickset-${value}`} 
                  onClick={() => { onQuickSet(value); }}
                  disabled={tuning || scriptRunning}
                >
                  {value}
                </Button>
              );
            })}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Card className="profile-card">
              <div className="profile-card-content">
                <div className="profile-card-content-label">{t('profiles.label', 'Profile')}</div>
                <div className="profile-card-content-value">
                  <Select value={currentProfile} onChange={profileOnChange} disabled={tuning || scriptRunning}>
                    <Select.Option key="new-profile" value="new-profile">-New-</Select.Option>
                    {profiles.map(p => {
                      return (
                        <Select.Option 
                          key={p.key} value={p.key}
                        >
                          {p.title}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Card className="script-card">
              <div className="script-card-content">
                {!scriptRunning
                  ?
                  <><div className="script-card-content-label">
                    {t('scripts.label', 'Script')}
                  </div><div className="script-card-content-value">
                    <Select 
                      value={currentScript}
                      onChange={value => {
                        dispatch(setCurrentScriptReducer(value));
                      }}
                    >
                      {scripts.map(s => (
                        <Select.Option key={s.key} value={s.key}>{s.title}</Select.Option>                      
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Button 
                      disabled={scriptRunning || tuning || !running || !currentScript} 
                      type="primary" icon={<PlaySquareOutlined />} 
                      onClick={() => {
                        if (!currentScript) {
                          return;
                        }
                        dispatch(runScript(script));
                      }}
                    />
                  </div></>
                  : <>
                    <div className="script-card-content-label">
                      {getScriptIcon()}
                    </div>
                    <div className="script-card-content-value">
                      {getScriptStatus()}
                    </div>
                    <div>
                      <Button 
                        disabled={!scriptRunning || tuning || !running || !currentScript} 
                        type="primary" icon={<BorderOutlined />} 
                        onClick={() => {
                          if (!currentScript) {
                            return;
                          }
                          dispatch(runScript(currentScript));
                        }}
                      />
                    </div>
                  </>
                }
              </div>
            </Card>
          </Col>
        </Row>
      </Grid>
      <div className="spacer" />
    </div>
  );
};

const homePage = withRouter(HomePage);

export { homePage as HomePage };
