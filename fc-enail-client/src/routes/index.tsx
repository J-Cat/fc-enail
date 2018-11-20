import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home } from './home';
import { Settings } from './settings';
import { Scripts } from './scripts';
import { Reconnect } from './reconnect';
import { SignIn } from './signin';

export default class Routes extends React.Component<{}> {
    render() {
        return (
            <Switch>
              <Route path="/connect" component={Reconnect} />
              <Route path="/signin" component={SignIn} />
              <Route path="/settings" component={Settings} /> 
              <Route path="/scripts" component={Scripts} /> 
              <Route component={Home} /> 
            </Switch>
        )
    }
}