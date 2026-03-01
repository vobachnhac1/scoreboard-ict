import React from "react";

/**
 * Section: Cấu hình thời gian
 * Cho phép điều chỉnh thời gian thi đấu, nghỉ, hiệp phụ, y tế
 */
const TimeConfigSection = ({ matchInfo, setMatchInfo }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-1.5 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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

      <div className="p-4 bg-white dark:bg-gray-900 grid grid-cols-2 gap-3">
        {/* Thời gian thi đấu */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 text-[11px] uppercase tracking-wider">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-emerald-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg> */}
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
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500 border border-gray-300 dark:border-gray-600 font-bold text-base transition-shadow"
          />
        </div>

        {/* Thời gian nghỉ */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 text-[11px] uppercase tracking-wider">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-amber-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg> */}
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
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-amber-500 border border-gray-300 dark:border-gray-600 font-bold text-base transition-shadow"
          />
        </div>

        {/* Thời gian hiệp phụ */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 text-[11px] uppercase tracking-wider">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-purple-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg> */}
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
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-500 border border-gray-300 dark:border-gray-600 font-bold text-base transition-shadow"
          />
        </div>

        {/* Thời gian y tế */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-semibold mb-2 text-[11px] uppercase tracking-wider">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-rose-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg> */}
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
            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:focus:ring-rose-500 border border-gray-300 dark:border-gray-600 font-bold text-base transition-shadow"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeConfigSection;
