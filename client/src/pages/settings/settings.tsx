import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Button, InputNumber, Spin, Modal, Select, Upload } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { AppDispatch } from '../../store/store';
import { RootState } from '../../store/reducers/rootReducer';
import { checkForUpdates, getUrl, reboot, restartService, sendConfig, sendQuickSet, updateTime } from '../../store/reducers/enailReducer';
import { useTranslation } from 'react-i18next';
import './settings.less';
import { IConfig } from '../../store/state/IEnailState';
import { RcFile } from 'antd/lib/upload';
import { deleteSound, uploadSound } from '../../store/reducers/soundsReducer';
import { IncludedSounds, ISounds } from '../../models/ISounds';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require('../../../package.json').version;

interface IFormData {
  autoShutoff?: number;
  screenSaverTimeout?: number;
  screenOffTimeout?: number;
  max?: number;
  min?: number;
  volume?: number;
  localtunnel?: string;
  quickset?: string;
  startupSound?: string;
}

const SettingsPage: React.FC = () => {
  const tuning = useSelector<RootState, boolean>(state => state.enail.state?.tuning || false);
  const scriptRunning = useSelector<RootState, boolean>(state => state.enail.state?.scriptRunning || false);
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.enail.loading);
  const requesting = useSelector((state: RootState) => state.enail.requesting);
  const config = useSelector<RootState, IConfig|undefined>(state => state.enail.config);
  const url = useSelector<RootState, string>(state => state.enail.state?.url || '');
  const quickset = useSelector<RootState, number[]>(state => state.enail.quickset);
  const sounds = useSelector<RootState, ISounds>(state => state.sounds.sounds);
  const [t] = useTranslation();
  const [currentStartupSound, setCurrentStartupSound] = useState<string|undefined>(config?.startupSound);
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    dispatch(getUrl());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSettings = async (formData: IFormData) => {
    if (
      (formData.autoShutoff === undefined)
      || (formData.min === undefined)
      || (formData.max === undefined) 
      || (formData.screenSaverTimeout === undefined) 
      || (formData.screenOffTimeout === undefined) 
      || (formData.autoShutoff === undefined)
      || (formData.volume === undefined)
      || (formData.startupSound === undefined)
    ) {
      Modal.error({
        title: t('settings.error.title', 'Error'),
        content: t('settings.error.invalidParameters', 'Invalid parameters specified'),
      });
      return;
    }

    const result = await dispatch(sendConfig({
      autoShutoff: formData.autoShutoff,
      min: formData.min,
      max: formData.max,
      screenSaverTimeout: formData.screenSaverTimeout,
      screenOffTimeout: formData.screenOffTimeout,
      localtunnel: formData.localtunnel || '',
      volume: formData.volume || 100,
      startupSound: formData.startupSound,
    }));

    if (result.error) {
      Modal.error({
        title: t('settings.error.title', 'Error'),
        content: t('settings.error.sendconfig', 'An error occured saving the configuration.'),
      });
    }

    const result2 = await dispatch(sendQuickSet(formData.quickset?.split(',').map(s => parseInt(s)) || []));
    if (result2.error) {
      Modal.error({
        title: t('settings.error.title', 'Error'),
        content: t('settings.error.sendquicksets', 'An error occured saving the presets.'),
      });
    }

    Modal.info({
      title: t('success.savedConfig.Title', 'Success'),
      content: t('success.savedConfig.Content', 'Successfully saved your settings.'),
    });
  };

  const onRestart = async (): Promise<void> => {
    Modal.confirm({
      title: t('settings.restartConfirm', 'Restart Service?'),
      content: t('settings.restartConfirmContent', 'Are you sure you want to restart the FC E-Nail service?'),
      onOk: async () => {
        dispatch(restartService());
      },
    });
  };

  const onReboot = async (): Promise<void> => {
    Modal.confirm({
      title: t('settings.rebootConfirm', 'Reboot Device?'),
      content: t('settings.rebootConfirmContent', 'Are you sure you want to reboot the FC E-Nail controller?'),
      onOk: async () => {
        dispatch(reboot());
      },
    });
  };

  const onUpload = async (file: RcFile): Promise<void> => {
    const result = await dispatch(uploadSound(file.name, file as Blob));
    if (result.error) {
      Modal.error({
        title: t('settings.error.title', 'Error'),
        content: t('settings.error.upload', 'An error occured uploading the sound file.'),
      });
    }  
  };

  const onDeleteSound = async (): Promise<void> => {
    if (!currentStartupSound) {
      return;
    }

    Modal.confirm({
      title: t('settings.deleteSoundConfirmTitle', 'Delete Sound File?'),
      content: t('settings.rebootConfirmContent', 'Are you sure you want to delete the sound file, {{sound}}?', { sound: currentStartupSound }),
      onOk: async () => {
        const result = await dispatch(deleteSound(currentStartupSound));
        if (result.error) {
          Modal.error({
            title: t('settings.error.title', 'Error'),
            content: t('settings.error.deleteSound', 'An error occured deleting the sound file.'),
          });
          return;
        }  
        setCurrentStartupSound('appear');
        formRef.current?.setFieldsValue({ startupSound: 'appear' });
      },
    });
  };

  const onCheckForUpdates = async (): Promise<void> => {
    Modal.confirm({
      title: t('settings.confirmCheckForUpdatesTitle', 'Check for Updates?'),
      content: t('settings.confirmCheckForUpdatesContent', 'Check for updates?'),
      onOk: async () => {
        await dispatch(checkForUpdates());
      },
    });
  };

  const onUpdateTime = async (): Promise<void> => {
    Modal.confirm({
      title: t('settings.confirmUpdateTimeTitle', 'Update E-Nail Clock?'),
      content: t('settings.confirmUpdateTimeContent', 'Would you like to update the E-Nail time with your current time, {{timeStr}}?', { timeStr: (new Date()).toUTCString()}),
      onOk: async () => {
        await dispatch(updateTime());
      },
    });
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="settings-container">
      <div className="spacer" />
      <Form
        ref={ref => { if (ref) { formRef.current = ref; }}}
        name="basic"
        onFinish={submitSettings}
        className="settings-form"
      >
        <Form.Item className="header-row" wrapperCol={{ style: { textAlign: 'center' }}}>
          <div className="header-col">
            <img src={`${process.env.PUBLIC_URL}/favicon.ico`} />
            <div>
              <h1>{t('FC E-Nail', 'FC E-Nail')}</h1>
              <br/>
              <h3>{t('by J-Cat', 'by J-Cat')}</h3>
            </div>
          </div>
        </Form.Item>
        <Form.Item
          label={t('settings.volume', 'Volume')}
          name="volume"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 0,
            max: 100,
          }]}
          initialValue={config?.volume}
        >
          <InputNumber disabled={requesting} />
        </Form.Item>
        <Form.Item
          label={t('settings.min', 'Minimum')}
          name="min"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 0,
            max: 400,
          }]}
          initialValue={config?.min}
        >
          <InputNumber disabled={requesting} />
        </Form.Item>

        <Form.Item
          label={t('settings.max', 'Maximum')}
          name="max"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 500,
            max: 1200,
          }]}
          initialValue={config?.max}
        >
          <InputNumber disabled={requesting} />
        </Form.Item>

        <Form.Item
          label={t('settings.presets', 'Presets')}
          name="quickset"
          rules={[{ required: true },
            { type: 'regexp' },
            { 
              pattern: /^\d+((,\d+)|(,(\d+,)+\d+))$/,
              message: t('settings.presetsError', 'Presets must be a comma separated list of numbers.'),
            },
          ]}
          initialValue={quickset.join(',')}
        >
          <Input disabled={requesting} />
        </Form.Item>

        <Form.Item
          label={t('settings.autoshutoff', 'Auto Shutoff (in minutes)')}
          name="autoShutoff"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 15,
            max: 480,
          }]}
          initialValue={config?.autoShutoff}
        >
          <InputNumber disabled={requesting} />
        </Form.Item>

        <Form.Item
          label={t('settings.screenSaverTimeout', 'Screen Saver Timeout (in minutes)')}
          name="screenSaverTimeout"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 1,
            max: 10,
          }]}
          initialValue={config?.screenSaverTimeout}
        >
          <InputNumber disabled={requesting} />
        </Form.Item>

        <Form.Item
          label={t('settings.screenOffTimeout', 'Screen Off Timeout (in minutes)')}
          name="screenOffTimeout"
          rules={[{ 
            required: true, 
            type: 'number',
            min: 1,
            max: 60,
          }]}
          initialValue={config?.screenOffTimeout}
        >
          <InputNumber disabled={requesting} />
        </Form.Item>

        <Form.Item
          label={t('settings.startupSound', 'Startup Sound')}
          name="startupSound"
          initialValue={config?.startupSound}
        >
          <Select onChange={value => { setCurrentStartupSound(value.toString()); }}>
            {Object.keys(sounds).map(key => {
              return <Select.Option key={key} value={key}>{key[0].toUpperCase()}{key.substring(1)}</Select.Option>;
            })}
          </Select>
        </Form.Item>

        <Form.Item label=" " colon={false}>
          <Button disabled={IncludedSounds.findIndex(f => f.toLowerCase() === currentStartupSound?.toLowerCase()) >= 0} onClick={onDeleteSound} icon={<DeleteOutlined />} type="primary">{t('settings.deletesound', 'Delete Sound')}</Button>
          &nbsp;
          <Upload beforeUpload={onUpload} type="select" accept=".wav" showUploadList={false}>
            <Button icon={<UploadOutlined />} type="primary">{t('settings.upload', 'Upload Sound')}</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label={t('settings.localtunnel', 'LocalTunnel.me Subdomain')}
          name="localtunnel"
          rules={[{ 
            type: 'string',
          }]}
          initialValue={config?.localtunnel}
          className="last-row"
        >
          <Input disabled={requesting} />
        </Form.Item>

        <Form.Item>
          <div hidden={!url} className="localtunnel-me-link">
            <a href={url}>{url}</a>
          </div>
        </Form.Item>

        <Form.Item label={t('settings.versionlabel', 'Version')}>
          <div>{version}</div>
        </Form.Item>

        <Form.Item className="button-row">
          <Button type="primary" htmlType="submit" disabled={requesting || tuning || scriptRunning}>
            {t('settings.buttonSave', 'Save')}
          </Button>
          &nbsp;
          <Button 
            type="primary" htmlType="button" disabled={requesting || tuning || scriptRunning}
            onClick={onUpdateTime}
          >
            {t('settings.buttonUpdateTime', 'Update E-Nail Time')}
          </Button>
          &nbsp;
          <Button 
            type="primary" htmlType="button" disabled={requesting || tuning || scriptRunning}
            onClick={onCheckForUpdates}
          >
            {t('settings.buttonCheckForUpdates', 'Check for Updates')}
          </Button>
          &nbsp;
          <Button 
            type="primary" htmlType="button" disabled={requesting || tuning || scriptRunning}
            onClick={onRestart}
          >
            {t('settings.buttonRestart', 'Restart Service')}
          </Button>
          &nbsp;
          <Button 
            type="primary" htmlType="button" disabled={requesting || tuning || scriptRunning}
            onClick={onReboot}
          >
            {t('settings.buttonReboot', 'Reboot')}
          </Button>
        </Form.Item>
      </Form>
      <div className="spacer" />
    </div>
  );
};

const settingsPage = withRouter(SettingsPage);

export { settingsPage as SettingsPage };
