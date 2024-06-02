import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ScoreBoard from '../views/ScoreBoard';

// Config Socket.IO
import SocketClient from './socket/SocketClient';
import Versus from '../views/Versus';
import { useHotkeys } from 'react-hotkeys-hook';
import PlayerList from '../views/PlayerList';
import Bracket from '../views/Bracket';
import QrViews from '../views/QrViews';
import SidebarLayout from '../components/Layout/SidebarLayout';
import UserManagement from '../views/UserManagement';
import UserInfo from '../views/UserInfo';

export const socketClient = new SocketClient();

// Tạo component App
const Routers = () => {
  const navigate = useNavigate();
  useHotkeys('F1', () => navigate('/versus'));
  useHotkeys('esc', () => navigate('/'));
  useHotkeys('F2', () => navigate('/scoreboard'));
  useHotkeys('F3', () => navigate('/player-list'));
  useHotkeys('F4', () => navigate('/bracket'));

  const routes = [
    { path: '/', element: <QrViews /> },
    { path: '/versus', element: <Versus /> },
    { path: '/scoreboard', element: <ScoreBoard /> },
    { path: '/player-list', element: <PlayerList /> },
    { path: '/bracket', element: <Bracket /> },
    { path: '/user-management', element: <UserManagement /> },
    { path: '/user-info', element: <UserInfo /> }
  ];

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route path={route.path} key={index} element={<SidebarLayout>{route.element}</SidebarLayout>} />
      ))}
    </Routes>
  );
};

export default Routers;
