import React from "react";

/**
 * ControlPanel Component
 * @param {Array} buttons - Array of button objects with { label, onClick }
 * @param {Number} buttonsPerRow - Number of buttons per row (default: 6)
 */
const ControlPanel = ({ buttons = [], buttonsPerRow = 5 }) => {
  // Chia buttons thành các rows
  const chunkButtons = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const buttonRows = chunkButtons(buttons, buttonsPerRow);

  return (
    <div className="bg-white/10 p-6 shadow-2xl rounded-lg">
      <div className="space-y-3">
        {buttonRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-wrap gap-3 items-center justify-center"
          >
            {row.map((btn, btnIndex) => (
              <button
                key={`${rowIndex}-${btnIndex}`}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={`
                  min-w-[140px] flex-1 max-w-[200px]
                  bg-gradient-to-br from-blue-500 to-blue-700
                  hover:from-blue-600 hover:to-blue-800
                  text-white font-bold py-3 px-6
                  rounded shadow-lg
                  transform transition-all duration-200
                  hover:scale-105 hover:shadow-blue-500/50
                  active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  ${btn.className || ''}
                `}
                title={btn.tooltip || btn.label}
              >
                {btn.icon && <span className="mr-2">{btn.icon}</span>}
                {btn.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
