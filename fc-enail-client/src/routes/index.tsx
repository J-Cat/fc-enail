import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Home } from './home';
import { IEnailStore } from 'src/models/IEnailStore';
import { Store } from 'redux';
import { EnailAction } from 'src/models/Actions';

export default class Routes extends React.Component<{ store: Store<IEnailStore, EnailAction> }> {
    render() {
        return (
            <Switch>
              <Route component={Home} /> 
            </Switch>
        )
    }
}