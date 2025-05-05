import React, { useRef, useState } from 'react';
import './index.scss';
import ScoreHeader from './ScoreHeader';
import PlayerScore from './PlayerScore';
import Timer from './Timer';
import ScoreContent from './ScoreContent';
import ButtonList from './ButtonList';
import Noti from './Noti';
import Vovinam from './Vovinam';
import Pencak from './Pencak';
import KickBoxing from './KickBoxing';

const ScoreBoard = () => {
  const [type, setType] = useState('vovinam');

  switch (type) {
    case 'vovinam':
      return <Vovinam />;
    case 'pencak':
      return <Pencak />;
    case 'kickboxing':
      return <KickBoxing />;
    default:
      return <Vovinam />;
  }
};

export default ScoreBoard;
