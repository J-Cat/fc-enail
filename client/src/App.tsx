import { ConfigProvider, Layout, Menu } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import './App.less';
import { useAuthentication } from './hooks/useAuthentication';
import { Constants } from './models/constants';
import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { RootState } from './store/reducers/rootReducer';

export const App: React.FC = () => {
  const authenticated = useSelector<RootState>(state => state.auth.authenticated);

  useAuthentication();

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
              <Route path={`${Constants.CLIENT_BASE_PATH}`} exact={true}>
                <HomePage />
              </Route>
            </Switch>
          </div>
        </Content>
        <Footer className="app-footer" hidden={!authenticated}>
          <Menu className="app-menu" theme="dark" mode="horizontal">
            <Menu.Item className="app-menu-item" key="home">
              Home
            </Menu.Item> 
            <Menu.Item className="app-menu-item" key="profiles">
              Profiles
            </Menu.Item> 
            <Menu.Item className="app-menu-item" key="scripts">
              Scripts
            </Menu.Item> 
            <Menu.Item className="app-menu-item" key="settings">
              Settings
            </Menu.Item> 
          </Menu>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
