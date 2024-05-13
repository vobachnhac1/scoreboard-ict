import React from 'react';
import Routes from './config/routes';
import { useHotkeys } from 'react-hotkeys-hook';
import { HashRouter, useNavigate } from 'react-router-dom';

const App = () => {
  return (
    <HashRouter>
      <Routes />
    </HashRouter>
  );
};

export default App;
