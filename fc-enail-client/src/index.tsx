import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import App from './App';
import './index.less';

import history from './history';
import registerServiceWorker from './registerServiceWorker';

import { configureStore } from './store/createStore';
import { IEnailStore } from './models/IEnailStore';
import { EnailAction } from './models/Actions';

const startApp = () => {
  const initialState = (window as any).__INITIAL_STATE__;
  const store: Store<IEnailStore, EnailAction> = configureStore(initialState);

  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );

  registerServiceWorker();
};

if (window.cordova) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}