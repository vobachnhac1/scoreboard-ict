import React from "react";

const SquareBox = ({ left, center, right, minHeight = "2.5rem" }) => {
  const boxClass = `w-10 bg-white flex items-center justify-center`;
  const centerClass = `w-14 bg-white flex items-center justify-center`;

  return (
    <div className="flex justify-center items-center gap-1 text-xs text-center">
      <div className={boxClass} style={{ minHeight }}>
        {left}
      </div>
      <div className={centerClass} style={{ minHeight }}>
        {center}
      </div>
      <div className={boxClass} style={{ minHeight }}>
        {right}
      </div>
    </div>
  );
};

export default SquareBox;
