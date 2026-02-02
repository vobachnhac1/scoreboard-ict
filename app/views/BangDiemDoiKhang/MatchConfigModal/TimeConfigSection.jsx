import React from "react";

/**
 * Section: Cấu hình thời gian
 * Cho phép điều chỉnh thời gian thi đấu, nghỉ, hiệp phụ, y tế
 */
const TimeConfigSection = ({ matchInfo, setMatchInfo }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 dark:from-blue-600 dark:via-blue-700 dark:to-blue-700 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm p-2 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>Cấu hình thời gian</span>
        </h3>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 grid grid-cols-2 gap-5">
        {/* Thời gian thi đấu */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-2 border-green-200 dark:border-green-700 p-5 rounded">
          <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-3 text-sm uppercase tracking-wide">
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
            Thời gian thi đấu (giây)
          </label>
          <input
            type="number"
            value={matchInfo.thoi_gian_thi_dau}
            onChange={(e) =>
              setMatchInfo({
                ...matchInfo,
                thoi_gian_thi_dau: parseInt(e.target.value),
              })
            }
            className="w-full bg-white dark:bg-gray-700 text-green-900 dark:text-green-100 px-4 py-3 rounded focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-600 border-2 border-green-300 dark:border-green-600 font-bold text-lg shadow-inner"
          />
        </div>

        {/* Thời gian nghỉ */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 border-2 border-yellow-200 dark:border-yellow-700 p-5 rounded">
          <label className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 font-bold mb-3 text-sm uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Thời gian nghỉ (giây)
          </label>
          <input
            type="number"
            value={matchInfo.thoi_gian_nghi}
            onChange={(e) =>
              setMatchInfo({
                ...matchInfo,
                thoi_gian_nghi: parseInt(e.target.value),
              })
            }
            className="w-full bg-white dark:bg-gray-700 text-yellow-900 dark:text-yellow-100 px-4 py-3 rounded focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-600 border-2 border-yellow-300 dark:border-yellow-600 font-bold text-lg shadow-inner"
          />
        </div>

        {/* Thời gian hiệp phụ */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900 dark:to-purple-900 border-2 border-violet-200 dark:border-violet-700 p-5 rounded">
          <label className="flex items-center gap-2 text-violet-700 dark:text-violet-300 font-bold mb-3 text-sm uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Thời gian hiệp phụ (giây)
          </label>
          <input
            type="number"
            value={matchInfo.thoi_gian_hiep_phu}
            onChange={(e) =>
              setMatchInfo({
                ...matchInfo,
                thoi_gian_hiep_phu: parseInt(e.target.value),
              })
            }
            className="w-full bg-white dark:bg-gray-700 text-violet-900 dark:text-violet-100 px-4 py-3 rounded focus:outline-none focus:ring-4 focus:ring-violet-300 dark:focus:ring-violet-600 border-2 border-violet-300 dark:border-violet-600 font-bold text-lg shadow-inner"
          />
        </div>

        {/* Thời gian y tế */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 border-2 border-red-200 dark:border-red-700 p-5 rounded">
          <label className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold mb-3 text-sm uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            Thời gian y tế (giây)
          </label>
          <input
            type="number"
            value={matchInfo.thoi_gian_y_te}
            onChange={(e) =>
              setMatchInfo({
                ...matchInfo,
                thoi_gian_y_te: parseInt(e.target.value),
              })
            }
            className="w-full bg-white dark:bg-gray-700 text-red-900 dark:text-red-100 px-4 py-3 rounded focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-600 border-2 border-red-300 dark:border-red-600 font-bold text-lg shadow-inner"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeConfigSection;
