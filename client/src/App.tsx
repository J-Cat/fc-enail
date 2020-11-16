import { CodeOutlined, HomeOutlined, OrderedListOutlined, SettingOutlined, WifiOutlined } from '@ant-design/icons';
import { ConfigProvider, Layout, Menu } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Switch, Route, useHistory } from 'react-router-dom';
import './App.less';
import { useAuthentication } from './hooks/useAuthentication';
import { useEnsureLoaded } from './hooks/useEnsureLoaded';
import { useSocketIO } from './hooks/useSocketIO';
import { Constants } from './models/constants';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { ProfilesPage } from './pages/profiles/profiles';
import { SettingsPage } from './pages/settings/settings';
import { WifiPage } from './pages/wifi/wifi';
import { RootState } from './store/reducers/rootReducer';

export const App: React.FC = () => {
  const authenticated = useSelector<RootState>(state => state.auth.authenticated);
  const history = useHistory();
  const [t] = useTranslation();

  useAuthentication();
  useEnsureLoaded();
  useSocketIO();

  const getSelected = () => {
    const key = location.pathname.replace(/^.*\/(.*)$/, '$1');
    return [key];
  }

  return (
    <ConfigProvider>
      <Layout className="app">
        <Content className="app-content">
          <div className="app-content-main">
            <Switch>
              <Route path={`${Constants.CLIENT_BASE_PATH}home`}>
                <HomePage />
              </Route>
              <Route path={`${Constants.CLIENT_BASE_PATH}login`}>
                <LoginPage />
              </Route>
              <Route path={`${Constants.CLIENT_BASE_PATH}settings`}>
                <SettingsPage />
              </Route>
              <Route path={`${Constants.CLIENT_BASE_PATH}profiles`}>
                <ProfilesPage />
              </Route>
              <Route path={`${Constants.CLIENT_BASE_PATH}wifi`}>
                <WifiPage />
              </Route>
              <Route path={`${Constants.CLIENT_BASE_PATH}`} exact={true}>
                <HomePage />
              </Route>
            </Switch>
          </div>
        </Content>
        <Footer className="app-footer" hidden={!authenticated}>
          <Menu className="app-menu" theme="dark" mode="horizontal" selectedKeys={getSelected()}>
            <Menu.Item onClick={() => history.push(`${Constants.CLIENT_BASE_PATH}`)} className="app-menu-item" key="home" icon={<HomeOutlined />} title={t('menu.home', 'Home')} />
            <Menu.Item onClick={() => history.push(`${Constants.CLIENT_BASE_PATH}profiles`)} className="app-menu-item" key="profiles" icon={<OrderedListOutlined />} title={t('menu.profiles', 'Profiles')} />
            <Menu.Item onClick={() => history.push(`${Constants.CLIENT_BASE_PATH}scripts`)} className="app-menu-item" key="scripts" icon={<CodeOutlined />} title={t('menu.scripts', 'Scripts')} />
            <Menu.Item onClick={() => history.push(`${Constants.CLIENT_BASE_PATH}settings`)} className="app-menu-item" key="settings" icon={<SettingOutlined />} title={t('menu.settings', 'Settings')} />
            <Menu.Item onClick={() => history.push(`${Constants.CLIENT_BASE_PATH}wifi`)} className="app-menu-item" key="wifi" icon={<WifiOutlined />} title={t('menu.wifi', 'WiFi')} />
          </Menu>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
