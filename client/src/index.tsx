import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Spin } from 'antd';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { App } from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { store } from './store/store';
import './index.less';
import './i18n';

const onSWUpdate = (registration: ServiceWorkerRegistration): void => {
  Modal.confirm({
    centered: true,
    title: 'Install Update?',
    content: 'An update to the FC E-Nail Cient has been detected, would you like to install it immediately?',
    onOk: () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    },
    onCancel: () => {
      // do nothing
    },
  });
};

// axios.interceptors.request.use(
//   config => {
//     return {
//       ...config,
//       headers: {
//         'Bypass-Tunnel-Reminder': 'true',
//       }
//     };
//   }
// );
  

ReactDOM.render(
  <Suspense fallback={<div className="app-loading"><Spin /></div>}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </Suspense>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({ onUpdate: onSWUpdate });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
