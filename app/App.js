import React, { useEffect } from 'react';
import Routes from './config/routes';
import { useHotkeys } from 'react-hotkeys-hook';
import { HashRouter, useNavigate } from 'react-router-dom';
import './index.css';
import './styles/main.scss';
import { useSelector } from 'react-redux';
import { initI18n } from './i18n';
const App = () => {
  const { language } = useSelector((state) => state.language);

  // console.log(language);
  useEffect(() => {
    initI18n(language);
  }, [language]);

  return (
    <HashRouter>
      <Routes />
    </HashRouter>
  );
};

export default App;
