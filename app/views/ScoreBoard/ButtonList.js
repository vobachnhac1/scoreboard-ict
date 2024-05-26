import React, { useEffect, useRef, useState } from "react";
import "./index.scss";

const ButtonList = () => {
  const array = ["J1", "J2", "J3", "J4", "J5"];
  return (
    <div className=" flex justify-between w-35">
      {array.map((item) => {
        return <button className='p-2 bg-yellow-custom'>{item}</button>;
      })}
    </div>
  );
};

export default ButtonList;
