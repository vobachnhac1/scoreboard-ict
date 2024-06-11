import React, { useEffect, useRef, useState } from "react";
import "./index.scss";
import PlayerScore from "./PlayerScore";
import MatchList from "./MatchList";

const ScoreContent = () => {
  return (
    <div className="w-35">
      <PlayerScore />
      <MatchList />
    </div>
  );
};

export default ScoreContent;
