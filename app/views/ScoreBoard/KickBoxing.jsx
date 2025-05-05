import React, { useRef, useState } from 'react';
import './index.scss';
import ScoreHeader from './ScoreHeader';
import PlayerScore from './PlayerScore';
import Timer from './Timer';
import ScoreContent from './ScoreContent';
import ButtonList from './ButtonList';
import Noti from './Noti';

const KickBoxing = () => {
  const scoreArray = ['9', '9', '9', '9', '9'];
  const array = ['GĐ1', 'GĐ2', 'GĐ3', 'GĐ4', 'GĐ5'];
  return (
    <div className="py-5 px-32 h-full bg-green-900 ">
      <ScoreHeader />
      {/* <div>
        <div className="mt-7 text-center text-white text-2xl">
          <div>
            Trận số: <span className="ml-2">1</span>
          </div>
          <div>VL-Nam-32Kg-Cấp 1</div>
        </div>
        <div className="flex justify-between gap-8">
          <ScoreContent />
          <div>
            <Timer />
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
      </div> */}

      <div className="w-full flex justify-between gap-8">
        <div className="w-full">
          <div
            className={`bg-red-400 text-white p-4 px-8 flex flex-col gap-12 items-center justify-center min-h-[65vh]`}
          >
            <div className="text-8xl text-center">
              <span className="">10</span>
            </div>
          </div>
        </div>

        <div className="">
          <div>
            <Timer />
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
        </div>

        <div className="w-full">
          <div
            className={`bg-red-400 text-white p-4 px-8 flex flex-col gap-12 items-center justify-center min-h-[65vh]`}
          >
            <div className="text-8xl text-center">
              <span className="">10</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="mt-2 flex flex-col items-center w-35">
          <div className=" flex justify-center items-center w-35">
            {scoreArray.map((item) => {
              return <button className="p-2 w-16 px-3 bg-yellow-custom border border-black">{item}</button>;
            })}
          </div>
          <div className=" flex justify-center items-center w-35">
            {array.map((item) => {
              return <button className="p-2 w-16 px-3 bg-yellow-custom border border-black">{item}</button>;
            })}
          </div>
        </div>

        <div className=""></div>

        <div className="mt-2 flex flex-col items-center w-35">
          <div className=" flex justify-center items-center w-35">
            {scoreArray.map((item) => {
              return <button className="p-2 px-3 bg-yellow-custom border border-black">{item}</button>;
            })}
          </div>
          <div className=" flex justify-center items-center w-35">
            {array.map((item) => {
              return <button className="p-2 px-3 bg-yellow-custom border border-black">{item}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KickBoxing;
