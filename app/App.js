import React, { useEffect } from 'react';
import Routes from './config/routes';
import { useHotkeys } from 'react-hotkeys-hook';
import { HashRouter, useNavigate } from 'react-router-dom';
import './index.css';
import './styles/main.scss';
import { useSelector, useDispatch } from 'react-redux';
import { initI18n } from './i18n';
import { connectSocket, disconnectSocket } from './config/redux/reducers/socket-reducer';
import { useSocketEvent, emitSocketEvent } from './config/hooks/useSocketEvents';
import { ThemeProvider } from './contexts/ThemeContext';

import { checkLicenseStatus, setLicenseStatus } from './config/redux/controller/licenseSlice';

const App = () => {
  const { language } = useSelector((state) => state.language);

  const dispatch = useDispatch();
  const connectionStatus = useSelector((state) => state.socket.connected);

  useEffect(() => {
    // Check license on startup
    dispatch(checkLicenseStatus());

    // Listen to license status from Electron
    if (window.electron && window.electron.onLicenseStatus) {
      window.electron.onLicenseStatus((data) => {
        console.log("Global License status update:", data);
        dispatch(setLicenseStatus(data));
      });
    }

    if(!connectionStatus){
      dispatch(connectSocket('admin'));
    }
    return () => {
      dispatch(disconnectSocket());
      if (window.electron && window.electron.removeLicenseListeners) {
        window.electron.removeLicenseListeners();
      }
    };
  }, []);


  // console.log(language);
  useEffect(() => {
    initI18n(language);
  }, [language]);

  return (
    <ThemeProvider>
      <HashRouter>
        <Routes />
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
