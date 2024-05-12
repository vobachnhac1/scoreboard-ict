import React, { useRef, useState } from "react";
import "./index.scss";
import ScoreHeader from "./ScoreHeader";
import PlayerScore from "./PlayerScore";
import Timer from "./Timer";
import ScoreContent from "./ScoreContent";
import ButtonList from "./ButtonList"
import Noti from "./Noti"

const ScoreBoard = () => {
  return (
    <div className="py-5 px-32 h-screen bg-green-900">
      <div>
        <ScoreHeader />
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
  );
};

export default ScoreBoard;
