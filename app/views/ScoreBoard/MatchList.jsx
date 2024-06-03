import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

const MatchList = () => {
  const array = [1, 2,1,2,1,2,1,2,1,2];

  return (
    <div className=" flex justify-between mt-2">
      {array.map((item) => {
        return <button className="py-1 px-3 bg-white rounded-full">{item}</button>;
      })}
    </div>
  );
};

export default MatchList;
