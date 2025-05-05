import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.scss';

const PlayerScore = ({ type = 'vovinam' }) => {
  const viewHeight = useMemo(() => {
    if (type === 'vovinam') return 'min-h-[50vh]';
    if (type === 'pencak') return 'min-h-[65vh]';
  }, [type]);

  return (
    <div className={`bg-red-400 text-white p-4 px-8 flex flex-col gap-12 items-center justify-center ${viewHeight}`}>
      <div className="text-8xl text-center">
        <span className="">10</span>
      </div>

      <div className="w-full flex justify-center items-center gap-4">
        <div className="">
          <img className="w-40 h-40 object-cover" src={'../../assets/avatar.jpg'} />
        </div>

        <div className="">
          <div className="text-2xl py-2">Dang Huu Nam</div>
          <div className="text-2xl py-2">Dang Huu Nam</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerScore;
