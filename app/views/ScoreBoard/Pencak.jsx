import React, { useRef, useState } from 'react';
import './index.scss';
import ScoreHeader from './ScoreHeader';
import PlayerScore from './PlayerScore';
import Timer from './Timer';
import ScoreContent from './ScoreContent';
import ButtonList from './ButtonList';
import Noti from './Noti';

const Pencak = () => {
  const fakeData = ['R1', 'R2', 'R3'];
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
          <div className="flex w-full">
            <div>
              {[0, 1, 2, 3, 4].map((index) => (
                <div className="flex gap-1 mt-1 first-of-type:mt-0" key={index}>
                  {fakeData.map((item) => {
                    return (
                      <div key={item}>
                        <button className="p-2 px-3 bg-yellow-custom">{item}</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <ScoreContent type="pencak" />
          </div>
          <div className="flex flex-col justify-between">
            <Timer />
            <div className="grid grid-cols-4 text-center gap-x-2 gap-y-3">
              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">H1</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">H2</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">H3</div>
              <div className="bg-white px-2">10</div>
            </div>

            <div className="grid grid-cols-4 text-center gap-x-2 gap-y-3">
              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">Nhắc nhở nhẹ</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">Nhắc nhở nặng</div>
              <div className="bg-white px-2">10</div>

              <div className="bg-white px-2">10</div>
              <div className="col-span-2 text-center bg-white px-2">Cảnh cáo</div>
              <div className="bg-white px-2">10</div>
            </div>
          </div>

          <div className="flex w-full">
            <ScoreContent type="pencak" />

            <div>
              {[0, 1, 2, 3, 4].map((index) => (
                <div className="flex gap-1 mt-1 first-of-type:mt-0" key={index}>
                  {fakeData.map((item) => {
                    return (
                      <div key={item}>
                        <button className="p-2 px-3 bg-yellow-custom">{item}</button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="flex justify-between">
          <ButtonList />
          <Noti />
          <ButtonList />
        </div> */}
      </div>
    </div>
  );
};

export default Pencak;
