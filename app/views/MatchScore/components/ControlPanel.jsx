import React from "react";

const ControlPanel = ({ buttons = [] }) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 p-6 rounded-2xl shadow-2xl border-2 border-gray-600">
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className="min-w-[140px] bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-blue-500/50 border-2 border-blue-400 active:scale-95"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
