import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

const Noti = () => {
  return (
    <div className="grid-container text-xs">
      <div className="col1">
        <div className="text-right">
          <button className="bg-yellow-custom px-2 mb-2">0</button>
        </div>
        <div className="text-right">
          <button className="bg-yellow-custom px-2">0</button>
        </div>
      </div>
      <div className="col2">
        <div className="text-center bg-yellow-custom mb-2 px-2">Nhắc Nhở</div>
        <div className="text-center bg-yellow-custom px-2">Cảnh cáo</div>
      </div>
      <div className="col3">
        <div className="row">
          <button className="bg-yellow-custom px-2 mb-2">0</button>
        </div>
        <div className="row">
          <button className="bg-yellow-custom px-2">0</button>
        </div>
      </div>
    </div>
  );
};

export default Noti;
