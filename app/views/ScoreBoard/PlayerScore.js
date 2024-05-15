import React, { useEffect, useRef, useState } from 'react';
import './index.scss';

const PlayerScore = () => {
  const array = [1, 2];

  return (
    <div className="bg-red-700 px-5 py-1 text-white">
      <div className="text-9xl text-center">0</div>
      <div className="flex">
        <div className="w-4-5">
          <div>Nguyễn Cao Duy Khôi</div>
          <div>TH Bình Trị Động</div>
        </div>
        <div className="w-1-5">
          <img className="max-h" src={'../../assets/avatar.jpg'} />
        </div>
      </div>
    </div>
  );
};

export default PlayerScore;
