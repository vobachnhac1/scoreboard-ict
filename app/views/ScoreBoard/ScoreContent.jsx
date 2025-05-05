import React, { useEffect, useRef, useState } from 'react';
import './index.scss';
import PlayerScore from './PlayerScore';
import MatchList from './MatchList';

const ScoreContent = ({ type = 'vovinam' }) => {
  return (
    <div className="w-full">
      <PlayerScore type={type} />
      {/* <MatchList /> */}
    </div>
  );
};

export default ScoreContent;
