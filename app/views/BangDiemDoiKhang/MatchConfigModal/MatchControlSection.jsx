import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  // Helper functions
  const jumpToStart = () => {
    console.log("jumpToStart", roundDuration);
    setTimeLeft(roundDuration * 10);
  };

  const jumpToMiddle = () => {
    setTimeLeft(Math.floor(roundDuration * 10 / 2));
  };

  const jumpToEnd = () => {
    setTimeLeft(10);
  };

  const pauseTimer = () => {
    // Just keep current time
    setTimeLeft(timeLeft);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1.5 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          <span>{t("scoreboard.doikhang.match_control_title")}</span>
        </h3>
      </div>

      <div className="p-4 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Hiệp hiện tại */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 text-[11px] uppercase tracking-wider">
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg> */}
              {t("scoreboard.doikhang.match_control_current_round")}
            </label>
            <input
              type="number"
              min="1"
              max={totalRounds}
              value={currentRound}
              onChange={(e) => setCurrentRound(parseInt(e.target.value) || 1)}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 transition-shadow"
            />
          </div>

          {/* Thời gian còn lại */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 text-[11px] uppercase tracking-wider">
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg> */}
              {t("scoreboard.doikhang.match_control_time_left")}
            </label>
            <input
              type="number"
              min="0"
              max={roundDuration}
              value={timeLeft / 10}
              onChange={(e) => setTimeLeft(parseInt(e.target.value * 10) || 0)}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-rose-500 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 transition-shadow"
            />
          </div>
        </div>

        {/* Quick jump buttons */}
        <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded border border-gray-100 dark:border-gray-700/60">
          <p className="text-gray-600 dark:text-gray-400 font-semibold text-[10px] mb-2 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
            </svg>
            {t("scoreboard.doikhang.match_control_quick_adjust")}
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={jumpToStart}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-2 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
            >
              {t("scoreboard.doikhang.match_control_start_round")}
            </button>
            <button
              onClick={jumpToMiddle}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-2 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
            >
              {t("scoreboard.doikhang.match_control_mid_round")}
            </button>
            <button
              onClick={jumpToEnd}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-2 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
            >
              {t("scoreboard.doikhang.match_control_end_round")}
            </button>
            <button
              onClick={pauseTimer}
              className="bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 px-2 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm"
            >
              {t("scoreboard.doikhang.match_control_pause")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchControlSection;
