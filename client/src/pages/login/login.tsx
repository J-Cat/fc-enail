import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter, useHistory } from 'react-router-dom';
import { AppDispatch } from '../../store/store';
import { RootState } from '../../store/reducers/rootReducer';
import { login, requestLogin } from '../../store/reducers/authReducer';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../store/reducers/localizationReducer';
import './login.less';
import { Constants } from '../../models/constants';

interface IFormData {
  passcode: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useHistory();
  const authenticating = useSelector((state: RootState) => state.auth.authenticating);
  const requesting = useSelector((state: RootState) => state.auth.requesting);
  const language = useSelector((state: RootState) => state.localization.language);
  const [t, i18n] = useTranslation();

  useEffect(() => {
    dispatch(requestLogin());    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitLogin = async (formData: IFormData): Promise<void> => {
    const { result, error } = await dispatch(login(formData.passcode));
    if (result) {
      history.push(`${Constants.CLIENT_BASE_PATH}`);
      return;
    } else {
      Modal.error({
        centered: true,
        title: t('login.loginError', 'Login Error'),
        content: error,
      });
    }
  };

  const languageOnChange = (value: string) => {
    console.log(JSON.stringify(i18n.languages));
    i18n.changeLanguage(value).then(() => {
      dispatch(setLanguage(value));
    });
  };

  return (
    <Form
      initialValues={{ remember: true }}
      onFinish={submitLogin}
      className="login-form"
    >
      <Form.Item className="header-row-fixed">
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} />&nbsp;<h1>{t('FC E-Nail', 'FC E-Nail')}</h1>
        <br/><h3>{t('by J-Cat', 'by J-Cat')}</h3>
      </Form.Item>
      <Form.Item
        label={t('login.passcode', 'Passcode')}
        name="passcode"
        rules={[{ required: true, message: t('login.passcodeRequired', 'Passcode is required to authenticate to the FC-Enail.  It should be displayed on your device screen.') }]}
      >
        <Input disabled={authenticating} />
      </Form.Item>

      <Form.Item
        label={t('login.language', 'Language')}
        name="language"
        initialValue={language}
        className="login-form-language"
      >
        <Select key="language-dropdown" onChange={languageOnChange} disabled={authenticating}>
          <Select.Option key="language-en" value="en">{t('language.English', 'English')}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item className="button-row">
        <Button type="primary" htmlType="submit" disabled={authenticating || requesting}>
          {t('login.buttonLogin', 'Login')}
        </Button>
      </Form.Item>
    </Form>
  );
};

const loginPage = withRouter(LoginPage);

export { loginPage as LoginPage };
