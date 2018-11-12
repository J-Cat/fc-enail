import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.less';
import registerServiceWorker from './registerServiceWorker';

const startApp = () => {
  ReactDOM.render(
    <App />,
    document.getElementById('root') as HTMLElement
  );

  registerServiceWorker();
};

if (window.cordova) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}