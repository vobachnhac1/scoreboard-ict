import React from "react";

const Player = ({item}) => {
    console.log('item', item[1])
  return (
    <>
      <div className="flex items-center w-48 bg-slate-300 justify-between py-2 px-3">
        <div>
          <img className="w-16 h-16" src={"../../assets/avatar.jpg"} />
          <div>
            {item[1]}
          </div>
        </div>
        <div>0</div>
      </div>
    </>
  );
};

export default Player;
