import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { CodePush, InstallMode } from '@ionic-native/code-push';

import App from './App';

import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';

import './styles/theme.css';
import './index.less';

import history from './history';
import registerServiceWorker from './registerServiceWorker';

import { configureStore } from './store/createStore';
import { IEnailStore } from './models/IEnailStore';
import { EnailAction } from './models/Actions';
import { updateVersion } from './reducers/versionReducer';
// import { registerIonic } from '@ionic/react';

const startApp = () => {
  const initialState = (window as any).__INITIAL_STATE__;
  const store: Store<IEnailStore, EnailAction> = configureStore(initialState);

  // registerIonic();

  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );

  CodePush.sync({
    installMode: InstallMode.IMMEDIATE,
    mandatoryInstallMode: InstallMode.IMMEDIATE,
    updateDialog: {
      appendReleaseDescription: true
    }
  }).subscribe(data => {
    // alert('Updater successfull:' + data);
  }, err => {
    // alert('Update error:' + err);
  });

  CodePush.getCurrentPackage().then(packInfo => {
    if (packInfo && packInfo.label) {
        const version = store.getState().version.version + "." + packInfo.label;
        store.dispatch(updateVersion(version));
    }
  });

  document.addEventListener("resume", () => {
    CodePush.sync({
      installMode: InstallMode.IMMEDIATE,
      mandatoryInstallMode: InstallMode.IMMEDIATE,
      updateDialog: {
        appendReleaseDescription: true
      }
    }).subscribe(data => {
      // alert('Updater successfull:' + data);
    }, err => {
      // alert('Update error:' + err);
    });
  });  

  registerServiceWorker();
};

if (window.cordova) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}