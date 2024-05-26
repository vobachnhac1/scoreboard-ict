import './i18n';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as stores from './config/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render component App vào #root element
root.render(
  <React.StrictMode>
    <Provider store={stores.default.store}>
      <PersistGate loading={null} persistor={stores.default.persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
