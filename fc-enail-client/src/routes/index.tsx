import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home } from './home';
import { Settings } from './settings';

export default class Routes extends React.Component<{}> {
    render() {
        return (
            <Switch>
              <Route path="/settings" component={Settings} /> 
              <Route component={Home} /> 
            </Switch>
        )
    }
}