import React, { useEffect, useRef, useState } from 'react';
import './index.scss';

const ButtonList = () => {
  const array = ['GĐ1', 'GĐ2', 'GĐ3', 'GĐ4', 'GĐ5'];
  return (
    <div className="mt-2 flex flex-col items-center w-35">
      <div className=" flex justify-center items-center w-35 gap-2">
        {array.map((item) => {
          return <button className="p-2 px-3 bg-yellow-custom">{item}</button>;
        })}
      </div>
      <div className=" flex mt-2 justify-center items-center w-35 gap-2">
        {array.map((item) => {
          return <button className="p-2 px-3 bg-yellow-custom">{item}</button>;
        })}
      </div>
      <div className=" flex mt-2 justify-center items-center w-35 gap-2">
        {array.map((item) => {
          return <button className="p-2 px-3 bg-yellow-custom">{item}</button>;
        })}
      </div>
    </div>
  );
};

export default ButtonList;
