import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

const Timer = () => {
  return (
    <div className='flex flex-col justify-between'>
        <div className="text-center bg-yellow-300 py-3 px-8 h-fit">
      <div>Hiệp 1</div>
      <div className="text-5xl">01:30</div>
    </div>
    <div className='text-center text-red-600 font-bold'>Trạng thái: Tắt</div>
    </div>
  );
};

export default Timer;
