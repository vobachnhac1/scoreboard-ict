import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

const PlayerScore = () => {
  
  return (
    <div className="bg-red-700 text-white shape">
      <div className="text-9xl text-center">
        <span className=''>0</span>
      </div>
      <div className="flex py-3 px-11 items-end">
        <div className="w-4-5">
          <div className='mb-1'>Nguyễn Cao Duy Khôi</div>
          <div>TH Bình Trị Động</div>
        </div>
        <div className="w-1-5">
          <img className='max-h' src={"../../assets/avatar.jpg"} />
        </div>
      </div>
    </div>
  );
};

export default PlayerScore;
