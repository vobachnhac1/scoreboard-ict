import React from 'react';
import './index.scss';
const PlayerCard = ({ position, image }) => {
  return (
    <div className={`player__card ${position === 'left' ? 'left__card' : 'right__card'}`}>
      <div className="player__card-avatar">
        <img src={image} />
      </div>
      <div className="player__card-info">
        <div>Nam</div>
        <div>Bình Dương chất</div>
      </div>
    </div>
  );
};

export default PlayerCard;
