import React, { useRef, useState } from "react";
import "./index.scss";
import ScoreHeader from "./ScoreHeader";
import PlayerScore from "./PlayerScore";
import Timer from "./Timer";
import ScoreContent from "./ScoreContent";
import ButtonList from "./ButtonList";
import Noti from "./Noti";

const ScoreBoard = () => {
  return (
    <div className="py-5 px-32 h-screen bg-green-900 ">
      <ScoreHeader />
      <div>
        <div className="mt-7 text-center text-white text-2xl">
          <div>Trận số: <span className='ml-2'>1</span></div>
          <div>VL-Nam-32Kg-Cấp 1</div>
        </div>
        <div className="flex justify-between">
          <ScoreContent />
          <Timer />
          <ScoreContent />
        </div>

        <div className="flex justify-between mt-20">
          <ButtonList />
          <Noti />
          <ButtonList />
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
