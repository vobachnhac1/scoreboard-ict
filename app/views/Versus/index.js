import PlayerCard from '../../components/PlayerCard';
import './index.scss';
import React from 'react';

const Versus = () => {
  return (
    <>
      <div className="versus__background">
        {/* <div class="radial-lines"></div> */}
        <div className="pattern-overlay"></div>
        <div className="versus__background-circle">
          <div className="versus__background-text">
            <span className="v">V</span>
            <span className="s">S</span>
          </div>
        </div>
        <div className="versus__introduction">
          <div className="versus__introduction-title">GIẢI VÔ ĐỊCH VOVINAM TOÀN QUỐC</div>
          <div className="versus__introduction-sub">
            <p>Trận 1</p>
            <p>Vòng loại - 80kg Nam - cấp 1</p>
          </div>
        </div>
        <div className="versus__player">
          <PlayerCard position={'left'} image={'../../assets/avatar.jpg'} />
          <PlayerCard position={'right'} image={'../../assets/avatar.jpg'} />
        </div>
      </div>
    </>
  );
};

export default Versus;
