import * as React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';
import { Provider } from 'react-redux';

import { TabBar } from 'antd-mobile';
import { Icon } from 'antd';

import history from './history';
import { configureStore } from './store/createStore';
import { IEnailStore } from './models/IEnailStore';

import './App.less';
import { EnailAction } from './models/Actions';
import Routes from './routes';

const initialState = (window as any).__INITIAL_STATE__;
const store: Store<IEnailStore, EnailAction> = configureStore(initialState);

class App extends React.Component<{}, { activeTab: string }> {
  constructor() {
    super({});

    this.state = {
      activeTab: !!!history.location.pathname || history.location.pathname.trim() ? 'home' : history.location.pathname
    };
  }
  
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <TabBar className="App" tintColor="rgb(67, 104, 67)">
            <TabBar.Item title="Home" 
              icon={<Icon type="home" />} 
              selectedIcon={<Icon type="home" />} 
              selected={this.state.activeTab==='home'}
              onPress={
                // tslint:disable-next-line:jsx-no-lambda
                () => this.navigate('home')
              }
            >
              <Routes store={store} />
            </TabBar.Item>
            <TabBar.Item title="Scripts" 
              icon={<Icon type="code" />} 
              selectedIcon={<Icon type="code" />} 
              selected={this.state.activeTab==='scripts'}
              onPress={
                // tslint:disable-next-line:jsx-no-lambda
                () => this.navigate('scripts')
              }
            >
              <Routes store={store} />
            </TabBar.Item>
            <TabBar.Item title="Settings" 
              icon={<Icon type="setting" />} 
              selectedIcon={<Icon type="setting" />} 
              selected={this.state.activeTab==='settings'}
              onPress={
                // tslint:disable-next-line:jsx-no-lambda
                () => this.navigate('settings')
              }
            >
              <Routes store={store} />
            </TabBar.Item>
          </TabBar>
        </Router>
      </Provider>
    );
  }

  private navigate = (destination: string) => {
    this.setState({
      activeTab: destination
    }, () => {
      history.push(destination);
    });
  }
}

export default App;

