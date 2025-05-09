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
import Login from '../views/Login';
import NewsFeed from '../views/NewsFeed';
import { Empty } from 'antd';
import SystemManagement from '../views/SystemManagement';
import Home from '../views/Home';
import History from '../views/History';
import AdminLayout from '../components/Layout/AdminLayout';
import { Connect, Champion, ChampionCategory, ChampionEvent, ConfigSystem } from '../views/Management';

export const socketClient = new SocketClient();

// Tạo component App
const Routers = () => {
  const navigate = useNavigate();
  useHotkeys('F1', () => navigate('/'));

  const routes = [
    // { path: '/', element: <Home />, sidebar: false },

    { path: '/', element: <AdminLayout><div>PHẦN MỀM XEM LỊCH THI ĐẤU</div></AdminLayout> },
    { path: '/management/connect', element: <AdminLayout><Connect /></AdminLayout> },
    { path: '/management/general-setting', element: <AdminLayout><Champion /></AdminLayout> },
    { path: '/management/general-setting/champion', element: <AdminLayout><div>QUẢN LÝ CÀI ĐẶT CHUNG</div></AdminLayout> },
    // { path: '/management/general-setting/champion-grp', element: <AdminLayout><ChampionGroup /></AdminLayout> },
    { path: '/management/general-setting/champion-category', element: <AdminLayout><ChampionCategory /></AdminLayout> },
    { path: '/management/general-setting/champion-event', element: <AdminLayout><ChampionEvent /></AdminLayout> },
    { path: '/management/general-setting/config-system', element: <AdminLayout><ConfigSystem /></AdminLayout> },

    { path: '/feeds', element: <NewsFeed /> },
    { path: '/qr-views', element: <QrViews /> },
    { path: '/versus', element: <Versus /> },
    { path: '/scoreboard', element: <ScoreBoard /> },
    { path: '/player-list', element: <PlayerList /> },
    { path: '/bracket', element: <Bracket /> },
    { path: '/user-management', element: <UserManagement /> },
    { path: '/user-info', element: <UserInfo /> },
    { path: '/login', element: <Login /> },
    { path: '/system-management', element: <SystemManagement /> },
    { path: '/history', element: <History /> }
  ];

  const renderElement = (route) => {
    if (route.path === '/login') {
      return <Login />;
    }

    if (route.sidebar === false) {
      return route.element;
    }

    return <>{route.element}</>;
  };

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route path={route.path} key={index} element={renderElement(route)} />
      ))}
      <Route
        path="*"
        element={
          <div className="w-full h-full flex justify-center items-center flex-col">
            <Empty />
          </div>
        }
      />{' '}
      {/* 404 */}
    </Routes>
  );
};

export default Routers;
