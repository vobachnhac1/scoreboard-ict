import React, { useEffect } from 'react';
import Routes from './config/routes';
import { useHotkeys } from 'react-hotkeys-hook';
import { HashRouter, useNavigate } from 'react-router-dom';
import './index.css';
import './styles/main.scss';
import { useSelector, useDispatch } from 'react-redux';
import { initI18n } from './i18n';
import { connectSocket, disconnectSocket } from './config/reducers/socket-reducer';
import { useSocketEvent, emitSocketEvent } from './config/hooks/useSocketEvents';
const App = () => {
  const { language } = useSelector((state) => state.language);

  const dispatch = useDispatch();
  const connectionStatus = useSelector((state) => state.socket.connectionStatus);

  useEffect(() => {
    dispatch(connectSocket('admin'));

    return () => {
      dispatch(disconnectSocket());
    };
  }, [dispatch]);


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
