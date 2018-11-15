import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home } from './home';
import { Settings } from './settings';
import { Reconnect } from './reconnect';

export default class Routes extends React.Component<{}> {
    render() {
        return (
            <Switch>
              <Route path="/connect" component={Reconnect} />
              <Route path="/settings" component={Settings} /> 
              <Route component={Home} /> 
            </Switch>
        )
    }
}