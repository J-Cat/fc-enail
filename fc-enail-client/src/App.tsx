import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { TabBar } from 'antd-mobile';
import { Icon } from 'antd';

import './App.less';
import Routes from './routes';

class App extends React.Component<RouteComponentProps<{}>, {}> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);
  }
  
  render() {
    let selectedPath = "home";
    if (this.props.location.pathname.indexOf('settings')>=0) {
      selectedPath = "settings";
    }
    
    return (
      <TabBar className="App" tintColor="rgb(67, 104, 67)">
        <TabBar.Item title="Home" 
          icon={<Icon type="home" />} 
          selectedIcon={<Icon type="home" />} 
          selected={selectedPath==='home'}
          onPress={
            // tslint:disable-next-line:jsx-no-lambda
            () => this.navigate('home')
          }
        >
          <Routes />
        </TabBar.Item>
        <TabBar.Item title="Scripts" 
          icon={<Icon type="code" />} 
          selectedIcon={<Icon type="code" />} 
          selected={selectedPath==='scripts'}
          onPress={
            // tslint:disable-next-line:jsx-no-lambda
            () => this.navigate('scripts')
          }
        >
          <Routes />
        </TabBar.Item>
        <TabBar.Item title="Settings" 
          icon={<Icon type="setting" />} 
          selectedIcon={<Icon type="setting" />} 
          selected={selectedPath==='settings'}
          onPress={
            // tslint:disable-next-line:jsx-no-lambda
            () => this.navigate('settings')
          }
        >
          <Routes />
        </TabBar.Item>
      </TabBar>
    );
  }

  private navigate = (destination: string) => {
    this.props.history.push(destination);
  }
}

export default withRouter(App);

