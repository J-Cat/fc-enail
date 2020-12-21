import { Button, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { deleteProfile, saveProfile, setCurrentProfile as setProfile, toggleTuning } from '../../store/reducers/profileReducer';
import { RootState } from '../../store/reducers/rootReducer';
import { IProfile } from '../../store/state/IProfileState';
import { AppDispatch } from '../../store/store';

import './profiles.less';

interface IFormData {
  p: number;
  i: number;
  d: number;
  offset: number;
  title: string;
}

const ProfilesPage: React.FC = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const tuning = useSelector<RootState, boolean>(state => state.enail.state?.tuning || false);
  const loading = useSelector<RootState, boolean>(state => state.enail.loading);
  const requesting = useSelector<RootState, boolean>(state => state.profiles.requesting);
  const profile = useSelector<RootState, string>(state => state.profiles.currentProfile || '');
  const profiles = useSelector<RootState, IProfile[]>(state => state.profiles.profiles);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    setCurrentProfile(profile);
    setFormValues(profile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  
  const selectedOnChange = (key: string) => {
    setCurrentProfile(key);
    if (key === 'new-profile') {
      formRef.current?.setFieldsValue({
        title: '',
      });
      formRef.current?.getFieldInstance('title')?.focus?.();
      return;
    }
    setFormValues(key);
  };

  const setFormValues = (key: string) => {
    const prf = profiles.find(p => p.key === key);
    if (!prf) {
      return;
    }
    formRef.current?.setFieldsValue({
      title: prf.title,
      p: prf.p / 10,
      i: prf.i,
      d: prf.d,
      offset: prf.offset,
    });
  };

  const updateProfile = async (formData: IFormData) => {
    Modal.confirm({
      title: t('profiles.updateConfirm', 'Update Profile?'),
      content: t('profiles.updateConfirmContent', 'Do you want to update the profile: {{profile}}', { profile: formData.title }),
      onOk: async () => {
        const profile = currentProfile === 'new-profile'
          ? {
            key: '',
          }
          : profiles.find(p => p.key === currentProfile);
        if (profile) {
          const result = await dispatch(saveProfile({
            ...profile,
            ...formData,
            p: Math.round(formData.p * 10),
          }));  
          if (result.error) {
            Modal.error({
              title: t('profiles.save.error.title', 'Error'),
              content: t('profiles.save.error.content', 'An error occured saving the profile: {{profile}}', { profile: formData.title }),
            });
          } else {
            Modal.info({
              title: t('profiles.savesuccess.title', 'Success'),
              content: t('profiels.savesuccess.content', 'Successfully saved the profile: {{profile}}', { profile: formData.title }),
            });
          }
        }
      },
    });
  };

  const setActive = async () => {
    const prf = profiles.find(p => p.key === currentProfile);
    if (!prf) {
      return;
    }
    Modal.confirm({
      title: t('profile.setactive.confirm.title', 'Set Active?'),
      content: t('profile.setactive.confirm.content', 'Load the {{profile}} profile?', { profile: prf.title }),
      onOk: async () => {
        const result = await dispatch(setProfile(currentProfile));
        if (result.error) {
          Modal.error({
            title: t('profile.setactive.error.title', 'Error Setting Active'),
            content: t('profile.setactive.error..content', 'An error occured setting {{profile}} to the active profile.', { profile: prf.title }),
          });
        }
      },
    });
  };

  const onDeleteProfile = async () => {
    const prf = profiles.find(p => p.key === currentProfile);
    if (!prf || (prf.key === profile)) {
      return;
    }
    Modal.confirm({
      title: t('profiles.deleteProfile.confirm.title', 'Delete Profile?'),
      content: t('profiles.deleteProfile.confirm.content', 'Delete the {{profile}} profile?', { profile: prf.title }),
      onOk: async () => {
        const result = await dispatch(deleteProfile(currentProfile));
        if (result.error) {
          Modal.error({
            title: t('profiles.deleteProfile.error.title', 'Error Deleting Profile'),
            content: t('profiles.deleteProfile.error.content', 'An error occured deleting the {{profile}} profile.', { profile: prf.title }),
          });
          return;
        }
        setCurrentProfile(profile);
        setFormValues(profile);
      },
    });
  };

  const onAutoTune = async () => {
    const prf = profiles.find(p => p.key === currentProfile);
    if (!prf || (prf.key !== profile)) {
      return;
    }
    if (tuning) {
      const result = await dispatch(toggleTuning());
      if (result.error) {
        Modal.error({
          title: t('profiles.error.canceltune.title', 'Error Cancelling'),
          content: t('profiles.error.canceltune.content', 'An error occured cancelling the auto-tuning for {{profile}}.', { profile: prf.title }),
        });
        return;
      }    
    } else {
      Modal.confirm({
        title: t('profiles.tune.confirm.title', 'Auto-Tune?'),
        content: t('profiles.tune.confirm.content', 'Would you like to auto-tune the PID settings for {{profile}}? (this could take 5-10 minutes)', { profile: prf.title }),
        onOk: async () => {
          const result = await dispatch(toggleTuning());
          if (result.error) {
            Modal.error({
              title: t('profiles.tune.error.title', 'Error Auto-Tuning'),
              content: t('profiles.tune.error.content', 'An error occured starting the auto-tuning for {{profile}}.', { profile: prf.title }),
            });
            return;
          }
        },
      });
    }
  };

  if (loading) {
    return <Spin />;
  }

  const prf = profiles.find(p => p.key === currentProfile);

  return <div className="profile-container">
    <div className="spacer" />
    <Form className="profile-form" ref={ref => { if (ref) { formRef.current = ref; } }} onFinish={updateProfile}>
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
      <Form.Item label={t('profiles.profile', 'Profile')} rules={[{ required: true }]}>
        <Select value={currentProfile} onChange={selectedOnChange}>
          <Select.Option key="new-profile" value="new-profile">-New-</Select.Option>
          {profiles.map(p => {
            return (
              <Select.Option 
                key={p.key} value={p.key}
              >
                {p.title}{p.key === profile ? t('active-tag', '(active)') : ''}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Form.Item label={t('profiles.title', 'Profile Title')} rules={[{ required: true }]} name="title" initialValue={prf?.title}>
        <Input />
      </Form.Item>
      <Form.Item name="p" label={t('label.proportionalBand', 'Proportional Band (P)')} rules={[{ required: true, type: 'number', min: 0 }]} initialValue={(prf?.p || 0) / 10}>
        <InputNumber />
      </Form.Item>
      <Form.Item name="i" label={t('label.integralTime', 'Integral Time (I)')} rules={[{ required: true, type: 'number', min: 0 }]} initialValue={prf?.i}>
        <InputNumber />
      </Form.Item>
      <Form.Item name="d" label={t('label.derivativeTime', 'Derivative Time (D)')} rules={[{ required: true, type: 'number', min: 0 }]} initialValue={prf?.d}>
        <InputNumber />
      </Form.Item>
      <Form.Item name="offset" label={t('label.offset', 'Offset')} rules={[{ required: true, type: 'number', min: -500, max: 500 }]} initialValue={prf?.offset}>
        <InputNumber />
      </Form.Item>

      <Form.Item className="button-row">
        <Button type="primary" htmlType="submit" disabled={requesting || tuning}>
          {t('profiles.buttonSave', 'Save')}
        </Button>
        &nbsp;
        <Button type="primary" htmlType="button" hidden={(!currentProfile || (currentProfile === profile)) && (currentProfile !== 'new-profile')} disabled={tuning}
          onClick={setActive}>
          {t('button.setActive', 'Set Active')}
        </Button>
        &nbsp;
        <Button type="primary" htmlType="button" hidden={(!currentProfile || (currentProfile === profile)) && (currentProfile !== 'new-profile')} disabled={tuning}
          onClick={onDeleteProfile}>
          {t('button.delete', 'Delete')}
        </Button>
        &nbsp;
        <Button type="primary" htmlType="button" hidden={currentProfile !== profile}
          onClick={onAutoTune}>
          {!tuning ? t('button.tune', 'Auto-Tune') : t('button.cancelTune', 'Cancel Auto-Tune')}
        </Button>
      </Form.Item>
    </Form>
    <div className="spacer" />
  </div>;
};

const profilesPage = withRouter(ProfilesPage);
export { profilesPage as ProfilesPage };