import React, { useEffect, useRef, useState } from "react";
import "./index.scss";
import PlayerScore from "./PlayerScore";

const ScoreContent = () => {
  return (
    <div className="w-35">
     <PlayerScore />
    </div>
  );
};

export default ScoreContent;
