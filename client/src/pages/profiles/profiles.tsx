import { Button, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useEnsureLoaded } from '../../hooks/useEnsureLoaded';
import { getProfiles, saveProfile, setCurrentProfile as setProfile } from '../../store/reducers/profileReducer';
import { RootState } from '../../store/reducers/rootReducer';
import { IProfile } from '../../store/state/IProfileState';
import { AppDispatch } from '../../store/store';

import './profiles.less';

interface IFormData {
  p: number;
  i: number;
  d: number;
  title: string;
}

const ProfilesPage: React.FC = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector<RootState, boolean>(state => state.enail.loading);
  const requesting = useSelector<RootState, boolean>(state => state.profiles.requesting);
  const profile = useSelector<RootState, string>(state => state.profiles.currentProfile || '');
  const profiles = useSelector<RootState, IProfile[]>(state => state.profiles.profiles);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const formRef = useRef<FormInstance>();

  useEnsureLoaded();

  useEffect(() => {
    dispatch(getProfiles());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    setCurrentProfile(profile)
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
  }

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
    });
  }

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
              title: t('error', 'Error'),
              content: t('profiles.save.error', 'An error occured saving the profile: {{profile}}', { profile: formData.title }),
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
  }

  const setActive = async () => {
    const prf = profiles.find(p => p.key === currentProfile);
    if (!prf) {
      return;
    }
    Modal.confirm({
      title: t('confirm.setActive.title', 'Set Active?'),
      content: t('confirm.setActive.content', 'Load the {{profile}} profile?', { profile: prf.title }),
      onOk: async () => {
        const result = await dispatch(setProfile(currentProfile));
        if (result.error) {
          Modal.error({
            title: t('error.setactive.title', 'Error Setting Active'),
            content: t('error.setactive.content', 'An error occured setting {{profile}} to the active profile.', { profile: prf.title }),
          });
        }
      },
    });
  }

  if (loading) {
    return <Spin />;
  }

  const prf = profiles.find(p => p.key === currentProfile);

  return <Form className="profile-form" ref={ref => { if (ref) { formRef.current = ref; } }} onFinish={updateProfile}>
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

    <Form.Item className="button-row">
        <Button type="primary" htmlType="submit" disabled={requesting}>
          {t('profiles.buttonSave', 'Save')}
        </Button>
        &nbsp;
        <Button type="primary" htmlType="button" hidden={(!currentProfile || (currentProfile === profile)) && (currentProfile !== 'new-profile')}
          onClick={setActive}>
          {t('button.setActive', 'Set Active')}
        </Button>
      </Form.Item>
  </Form>;
}

const profilesPage = withRouter(ProfilesPage);
export { profilesPage as ProfilesPage };