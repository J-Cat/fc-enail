import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, Modal, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { AppDispatch } from '../../store/store';
import { RootState } from '../../store/reducers/rootReducer';
import { useTranslation } from 'react-i18next';
import './wifi.less';
import { connectWifi, getNetworkConfig, scanNetworks } from '../../store/reducers/networkReducer';
import { FormInstance } from 'antd/lib/form';

interface IFormData {
  mode: 'ap'|'infrastructure';
  ssid: string;
  ssidap: string;
  passcode: string;
}

const WifiPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector<RootState, boolean>(state => state.network.loading);
  const scanning = useSelector<RootState, boolean>(state => state.network.scanning);
  const mode = useSelector<RootState, ('ap'|'infrastructure')>(state => state.network.config?.mode || 'ap');
  const ssid = useSelector<RootState, string>(state => state.network.config?.ssid || '');
  const ssids = useSelector<RootState, string[]>(state => state.network.ssids);
  const [t] = useTranslation();
  const [wifiMode, setWifiMode] = useState('infrastructure');
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    formRef.current?.setFieldsValue({
      ssid,
      ssidap: ssid,
      mode,
    });
  }, [mode, ssid]);

  useEffect(() => {
    dispatch(getNetworkConfig());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScan = async () => {
    const { error } = await dispatch(scanNetworks());
    if (error) {
      Modal.error({
        title: t('wifi.error.scan.title', 'Scan Error'),
        content: t('wifi.error.scan.content', 'An error occured scanning for nearby WiFi networks: {{error}}', { error }),
      });
    }
  };

  const onConnect = async (formData: IFormData) => {
    const newSsid = formData.mode === 'ap' ? formData.ssidap : formData.ssid;
    const { error } = await dispatch(connectWifi(
      formData.mode, 
      newSsid, 
      formData.passcode,
    ));
    if (error) {
      Modal.error({
        title: t('wifi.error.connect.title', 'Connect Error'),
        content: t('wifi.error.connect.content', 'An error occured connecting to the WiFi network, {{ssid}}: {{error}}', { ssid: newSsid }),
      });
    }
  };

  const onWifiModeChange = (value: string) => {
    setWifiMode(value);
    if (value === 'ap') {
      formRef.current?.setFieldsValue({ ssidap: 'FCEnail' });
    }
  };

  if (loading || scanning) {
    return <Spin />;
  }

  return (
    <Form
      initialValues={{ remember: true }}
      className="wifi-form"
      ref={ref => { if (ref) { formRef.current = ref; }}}
      onFinish={onConnect}
    >
      <Form.Item className="header-row-fixed">
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} />&nbsp;<h1>{t('FC E-Nail', 'FC E-Nail')}</h1>
        <br/><h3>{t('by J-Cat', 'by J-Cat')}</h3>
      </Form.Item>
      <Form.Item
        label={t('wifi.mode.label', 'Mode')}
        name="mode"
        initialValue={mode}
      >
        <Select onChange={onWifiModeChange} value='infrastructure'>
          <Select.Option key="infrastructure" value="infrastructure">{t('wifi.label.client', 'Client')}</Select.Option>
          <Select.Option key="ap" value="ap">{t('wifi.label.accesspoint', 'Access Point')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={t('wifi.network.label', 'Network')}
        name="ssid"
        rules={[{ required: true, message: t('wifi.ssid.validation.required', 'You must select a network to connect to.') }]}
        hidden={wifiMode !== 'infrastructure'}
        initialValue={ssid}
      >
        <Select>
          {ssids.map(s => <Select.Option key={`ssid-${s}`} value={s}>{s}</Select.Option>)}
        </Select>
      </Form.Item>

      <Form.Item
        label={t('wifi.ssid.label', 'SSID')}
        name="ssidap"
        rules={[{ required: wifiMode === 'ap' }]}
        hidden={wifiMode !== 'ap'}
        initialValue={ssid}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={t('wifi.passcode.label', 'Passcode')}
        name="passcode"
        rules={[{ required: true, message: t('wifi.passcode.validation.required', 'Passcode is required.') }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item className="button-row">
        <Button type="primary" htmlType="button" onClick={onScan}>
          {t('wifi.button.scan', 'Scan')}
        </Button>
        &nbsp;
        <Button type="primary" htmlType="submit">
          {t('wifi.button.connect', 'Connect')}
        </Button>
      </Form.Item>
    </Form>
  );
};

const wifiPage = withRouter(WifiPage);

export { wifiPage as WifiPage };
