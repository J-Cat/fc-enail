import React from 'react';
import { Form, Input, Button, InputNumber, Spin, Anchor, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { AppDispatch } from '../../store/store';
import { RootState } from '../../store/reducers/rootReducer';
import { sendConfig, sendQuickSet } from '../../store/reducers/enailReducer';
import { useTranslation } from 'react-i18next';
import './settings.less';
import { useEnsureLoaded } from '../../hooks/useEnsureLoaded';
import { IConfig } from '../../store/state/IEnailState';

interface IFormData {
  autoShutoff?: number;
  screenSaverTimeout?: number;
  screenOffTimeout?: number;
  max?: number;
  min?: number;
  localtunnel?: string;
  quickset?: string;
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.enail.loading);
  const requesting = useSelector((state: RootState) => state.enail.requesting);
  const config = useSelector<RootState, IConfig|undefined>(state => state.enail.config);
  const url = useSelector<RootState, string>(state => state.enail.state?.url || '');
  const quickset = useSelector<RootState, number[]>(state => state.enail.quickset);
  const [t] = useTranslation();

  const submitSettings = async (formData: IFormData) => {
    if (
      (formData.autoShutoff === undefined)
      || (formData.min === undefined)
      || (formData.max === undefined) 
      || (formData.screenSaverTimeout === undefined) 
      || (formData.screenOffTimeout === undefined) 
      || (formData.autoShutoff === undefined)
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

  if (loading) {
    return <Spin />;
  }

  return (
    <Form
      name="basic"
      onFinish={submitSettings}
      className="settings-form"
    >
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

      <div hidden={!url} className="localtunnel-me-link">
        <a href={url}>{url}</a>
      </div>

      <Form.Item className="button-row">
        <Button type="primary" htmlType="submit" disabled={requesting}>
          {t('settings.buttonSave', 'Save')}
        </Button>
      </Form.Item>
    </Form>
  );
};

const settingsPage = withRouter(SettingsPage);

export { settingsPage as SettingsPage };
