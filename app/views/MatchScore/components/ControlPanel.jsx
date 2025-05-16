import React from "react";

const ControlPanel = ({ buttons = [] }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 items-center justify-center px-14">
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={btn.onClick}
          className="w-28 bg-white text-black rounded-sm text-sm p-1 transition duration-200 hover:bg-gray-200 hover:font-medium"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default ControlPanel;
