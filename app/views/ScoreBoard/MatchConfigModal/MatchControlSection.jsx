import React from "react";

/**
 * Section: Điều khiển trận đấu
 * Cho phép điều chỉnh hiệp hiện tại, thời gian còn lại và quick jump buttons
 */
const MatchControlSection = ({
  currentRound,
  setCurrentRound,
  timeLeft,
  setTimeLeft,
  totalRounds,
  roundDuration,
}) => {
  // Helper functions
  const jumpToStart = () => {
    setTimeLeft(roundDuration);
  };

  const jumpToMiddle = () => {
    setTimeLeft(Math.floor(roundDuration / 2));
  };

  const jumpToEnd = () => {
    setTimeLeft(10);
  };

  const pauseTimer = () => {
    // Just keep current time
    setTimeLeft(timeLeft);
  };

  return (
    <div className="bg-white rounded shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>Điều khiển trận đấu</span>
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Hiệp hiện tại */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-200 p-5 rounded">
            <label className="flex items-center gap-2 text-blue-700 font-bold mb-3 text-sm uppercase tracking-wide">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Hiệp hiện tại
            </label>
            <input
              type="number"
              min="1"
              max={totalRounds}
              value={currentRound}
              onChange={(e) => setCurrentRound(parseInt(e.target.value) || 1)}
              className="w-full bg-white text-blue-900 px-4 py-3 rounded focus:outline-none focus:ring-4 focus:ring-indigo-300 text-center text-3xl font-black border-2 border-indigo-300 shadow-inner"
            />
          </div>

          {/* Thời gian còn lại */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 p-5 rounded">
            <label className="flex items-center gap-2 text-rose-700 font-bold mb-3 text-sm uppercase tracking-wide">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Thời gian còn lại (giây)
            </label>
            <input
              type="number"
              min="0"
              max={roundDuration}
              value={timeLeft/ 10}
              onChange={(e) => setTimeLeft(parseInt(e.target.value * 10) || 0)}
              className="w-full bg-white text-rose-900 px-4 py-3 rounded focus:outline-none focus:ring-4 focus:ring-rose-300 text-center text-3xl font-black border-2 border-rose-300 shadow-inner"
            />
          </div>
        </div>

        {/* Quick jump buttons */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 rounded border border-gray-200">
          <p className="text-gray-700 font-bold text-sm mb-3 uppercase tracking-wide">
            ⚡ Điều chỉnh nhanh
          </p>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={jumpToStart}
              className="bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white px-4 py-3 rounded text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Đầu hiệp
            </button>
            <button
              onClick={jumpToMiddle}
              className="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Giữa hiệp
            </button>
            <button
              onClick={jumpToEnd}
              className="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Cuối hiệp
            </button>
            <button
              onClick={pauseTimer}
              className="bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Tạm dừng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchControlSection;
