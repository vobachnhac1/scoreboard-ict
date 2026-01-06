import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ScoreBoard from '../views/ScoreBoard';

// Config Socket.IO
import socketClient from './socket/SocketClient';
import Versus from '../views/Versus';
import { useHotkeys } from 'react-hotkeys-hook';
import PlayerList from '../views/PlayerList';
import Bracket from '../views/Bracket';
import QrViews from '../views/QrViews';
import UserManagement from '../views/UserManagement';
import UserInfo from '../views/UserInfo';
import Login from '../views/Login';
import NewsFeed from '../views/NewsFeed';
import { Empty } from 'antd';
import SystemManagement from '../views/SystemManagement';
import History from '../views/History';
import AdminLayout from '../components/Layout/AdminLayout';
import { Connect, Champion,ChampionGroup, ChampionCategory, ChampionEvent, ConfigSystem, CompetitionManagement, CompetitionDataDetail, MatchAthlete, Athlete, DataAthlete, ReportAthlete, ArrangeSchedule, CompetitionDataDetailOrther } from '../views/Management';
import MatchScore from '../views/MatchScore';

// import VovinamSparring from '../views/MatchScore/Sparring/Vovinam';
// import KickBoxingSparring from '../views/MatchScore/Sparring/KickBoxing';
// import PencakSparring from '../views/MatchScore/Sparring/Pencak';

import VovinamScore from '../views/MatchScore/VovinamScore';

// Import Dashboard and Error pages
import Dashboard from '../views/Dashboard';
import ErrorPage from '../views/Error/ErrorPage';
import NotFound from '../views/Error/NotFound';
import TestError from '../views/TestError';

// Import Error Boundary
import ErrorBoundary from '../components/ErrorBoundary';

// Export socketClient singleton để sử dụng ở các component khác
export { socketClient };

// Tạo component App
const Routers = () => {
  const navigate = useNavigate();
  // useHotkeys('F1', () => navigate('/'));

  const routes = [
    // { path: '/', element: <Home />, sidebar: false },
    { path: '/', element: <AdminLayout><Dashboard /></AdminLayout> },
    { path: '/test-error', element: <AdminLayout><TestError /></AdminLayout> },
    { path: '/management/connect', element: <AdminLayout><Connect /></AdminLayout> },
    // { path: '/management/athlete', element: <AdminLayout><Athlete /></AdminLayout> },
    // { path: '/management/athlete/match', element: <AdminLayout><MatchAthlete /></AdminLayout> },
    // { path: '/management/athlete/data', element: <AdminLayout><DataAthlete /></AdminLayout> },
    // { path: '/management/athlete/report', element: <AdminLayout><ReportAthlete /></AdminLayout> },
    { path: '/management/general-setting', element: <AdminLayout><div>QUẢN LÝ CÀI ĐẶT CHUNG</div></AdminLayout> },
    // { path: '/management/general-setting/champion', element: <AdminLayout><Champion /></AdminLayout> },
    // { path: '/management/general-setting/champion-grp', element: <AdminLayout><ChampionGroup /></AdminLayout> },
    // { path: '/management/general-setting/champion-category', element: <AdminLayout><ChampionCategory /></AdminLayout> },
    // { path: '/management/general-setting/champion-event', element: <AdminLayout><ChampionEvent /></AdminLayout> },
    // { path: '/management/general-setting/arrange-schedule', element: <AdminLayout><ArrangeSchedule /></AdminLayout> },
    { path: '/management/general-setting/config-system', element: <AdminLayout><ConfigSystem /></AdminLayout> },
    { path: '/management/general-setting/competition-management', element: <AdminLayout><CompetitionManagement /></AdminLayout> },
    { path: '/management/competition-data/:id', element: <AdminLayout><CompetitionDataDetail /></AdminLayout> },
    { path: '/management/competition-data-other/:id', element: <AdminLayout><CompetitionDataDetailOrther /></AdminLayout> },
    // { path: '/match-score', element: <AdminLayout><MatchScore /></AdminLayout> },
    { path: '/scoreboard/vovinam', element: <ScoreBoard /> },
    { path: '/scoreboard/vovinam-score', element: <VovinamScore /> },
    // { path: '/match-score/sparring/kickboxing', element: <KickBoxingSparring /> },
    // { path: '/match-score/sparring/pencak', element: <PencakSparring /> },

    // { path: '/feeds', element: <NewsFeed /> },
    // { path: '/qr-views', element: <QrViews /> },
    // { path: '/versus', element: <Versus /> },
    // { path: '/scoreboard', element: <ScoreBoard /> },
    // { path: '/player-list', element: <PlayerList /> },
    // { path: '/bracket', element: <Bracket /> },
    // { path: '/user-management', element: <UserManagement /> },
    // { path: '/user-info', element: <UserInfo /> },
    // { path: '/login', element: <Login /> },
    // { path: '/system-management', element: <SystemManagement /> },
    // { path: '/history', element: <History /> }
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
    <ErrorBoundary>
      <Routes>
        {routes.map((route, index) => (
          <Route path={route.path} key={index} element={renderElement(route)} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default Routers;
