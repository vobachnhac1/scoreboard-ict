import React from 'react';
import { Routes, Route, HashRouter, useNavigate } from 'react-router-dom';
import { createBrowserHistory } from 'history';
// import Navbar from '../components/navbar';
// import Footer from '../components/footer';
// import Home from '../views/home';
// import About from '../views/about';
// import OverViewPage from '../views/overview';
import Home from '../views/Home';
import ScoreBoard from '../views/ScoreBoard';

// Config Socket.IO
import SocketClient from './socket/SocketClient';
import Versus from '../views/Versus';
import { useHotkeys } from 'react-hotkeys-hook';
import PlayerList from '../views/PlayerList';
import Bracket from '../views/Bracket';

export const socketClient = new SocketClient();

// Tạo component App
const Routers = () => {
  const navigate = useNavigate();
  useHotkeys('F1', () => navigate('/versus'));
  useHotkeys('esc', () => navigate('/'));
  useHotkeys('F2', () => navigate('/scoreboard'));
  useHotkeys('F3', () => navigate('/player-list'));
  useHotkeys('F4', () => navigate('/bracket'));
  return (
    <Routes>
      {/* <div style={{ flex: 1, width:'100%', height:'100%', backgroundColor:'white ' }}> */}
      {/* <Navbar /> */}
      <Route path="/" element={<Home />} />
      <Route path="/versus" element={<Versus />} />
      <Route path="/scoreboard" element={<ScoreBoard />} />
      <Route path="/player-list" element={<PlayerList />} />
      <Route path="/bracket" element={<Bracket />} />
      {/* <Route path="about" component={About} /> */}
      {/* <Footer /> */}
      {/* </div> */}
    </Routes>
  );
};

export default Routers;
