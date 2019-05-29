import * as React from 'react';
import { withRouter, RouteComponentProps, Route, Redirect } from 'react-router';
import { IonApp, IonTabBar, IonTabButton, IonLabel, IonIcon, IonTabs, IonRouterOutlet, IonPage } from '@ionic/react';

import './App.less';
import { Home } from './routes/home';
import { Scripts } from './routes/scripts';
import { Settings } from './routes/settings';
import { Reconnect } from './routes/reconnect';
import { SignIn } from './routes/signin';

class App extends React.Component<RouteComponentProps<{}>, {}> {
  constructor(props: RouteComponentProps<{}>) {
    super(props);

    if (this.props.location.pathname === '/') {
      this.props.history.push('/home');
    }
  }

  render() {
    return (
      <IonApp class="app">
        <IonPage className="app-page">
          <IonTabs>
            <IonRouterOutlet>
                <Route path="/:tab(home)" component={Home} exact={true} />
                <Route path="/:tab(scripts)" component={Scripts} exact={true} />
                <Route path="/:tab(settings)" component={Settings} />
                <Route path="/connect" component={Reconnect} />
                <Route path="/signin" component={SignIn} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom" class="app-page-tabbar">
              <IonTabButton tab="home" href="/home">
                <IonLabel>Home</IonLabel>
                <IonIcon name="home" />
              </IonTabButton>
              <IonTabButton tab="scripts" href="/scripts">
                <IonLabel>Scripts</IonLabel>
                <IonIcon name="code" />
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings">
                <IonLabel>Settings</IonLabel>
                <IonIcon name="settings" />
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonPage>
      </IonApp>
    );
  }

  // private navigate = (destination: string) => {
  //   this.props.history.push(destination);
  // }
}

export default withRouter(App);

