import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

const ScoreHeader = () => {
  return (
    <div className="text-center text-white">
      <div className="text-2xl uppercase">
        <div>Giải vô địch năm 2021</div>
        <div>Môn: Pencak Silak</div>
      </div>

      <div className="mt-7">
        <div>Trận số: 01</div>
        <div>VL-Nam-32Kg-Cấp 1</div>
      </div>
    </div>
  );
};

export default ScoreHeader;
