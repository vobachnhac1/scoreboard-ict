import React, { useRef, useState } from 'react';
import './index.scss';
import ScoreHeader from './ScoreHeader';
import PlayerScore from './PlayerScore';
import Timer from './Timer';
import ScoreContent from './ScoreContent';
import ButtonList from './ButtonList';
import Noti from './Noti';
import { useSelector } from 'react-redux';

const Vovinam = () => {
  const configData = useSelector((state) => state.config);

  console.log(configData);
  return (
    <div className="py-5 px-32 h-full bg-green-900 ">
      <ScoreHeader />
      <div>
        <div className="mt-7 text-center text-white text-2xl">
          <div>
            Trận số: <span className="ml-2">1</span>
          </div>
          <div>VL-Nam-32Kg-Cấp 1</div>
        </div>
        <div className="flex justify-between gap-8">
          <ScoreContent />
          <div>
            <Timer config={configData} />
            <div className="grid grid-cols-4 text-center gap-x-2 gap-y-3">
              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">H1</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">H1</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">H1</div>
              <div className="bg-white px-2">10</div>
            </div>

            <div className="grid grid-cols-4 text-center gap-x-2 gap-y-3">
              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">Nhắc nhở</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">Cảnh cáo</div>
              <div className="bg-white px-2">10</div>
            </div>
          </div>

          <ScoreContent />
        </div>

        <div className="flex justify-between">
          <ButtonList />
          <Noti />
          <ButtonList />
        </div>
      </div>
    </div>
  );
};

export default Vovinam;
