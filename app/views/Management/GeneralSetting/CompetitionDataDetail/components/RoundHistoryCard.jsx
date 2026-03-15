import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getActionTypeLabel,
  getActionTypeColorClassWithBorder,
} from "../../../../../helpers/actionType";

// Component hiển thị chi tiết từng hiệp
export default function RoundHistoryCard({ round, roundIndex, logs }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-all duration-200 mb-3 hover:shadow-md">
      {/* Header - Tóm tắt hiệp */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors flex items-center justify-between group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded transition-colors ${expanded ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide uppercase">
              {t("competition_detail.round_history.round")} {round.round}
            </span>
            {round.roundType && round.roundType !== "NORMAL" && (
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-800">
                {round.roundType === "EXTRA" ? t("competition_detail.round_history.extra_round") : round.roundType}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Điểm số */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span className="text-lg font-black text-red-600 dark:text-red-400 w-6 text-right">
                {round.red?.match?.score || 0}
              </span>
            </div>
            <div className="text-gray-300 dark:text-gray-600 font-light text-xl">-</div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 w-6 text-left">
                {round.blue?.match?.score || 0}
              </span>
            </div>
          </div>

          {/* Số lượng logs */}
          {logs.length > 0 && (
            <div className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
              {logs.length} <span className="hidden sm:inline">{t("competition_detail.round_history.actions")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded - Chi tiết logs */}
      {expanded && logs.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4">
          <div className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/80 dark:bg-gray-900/50 sticky top-0 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("competition_detail.round_history.time")}</th>
                  <th className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("competition_detail.round_history.type")}</th>
                  <th className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">{t("competition_detail.round_history.team")}</th>
                  <th className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("competition_detail.round_history.description")}</th>
                  <th className="px-4 py-2 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">{t("competition_detail.round_history.score")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {logs.map((log, logIndex) => (
                  <tr key={`round-${round.round}-log-${logIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">
                      {log.time || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${getActionTypeColorClassWithBorder(log.actionType)}`}>
                        {getActionTypeLabel(log.actionType)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {log.team === "red" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 font-bold text-[10px] uppercase tracking-wider">{t("competition_detail.round_history.red")}</span>
                      ) : log.team === "blue" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 font-bold text-[10px] uppercase tracking-wider">{t("competition_detail.round_history.blue")}</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                      {log.description || "-"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="font-mono text-gray-900 dark:text-gray-100 font-bold bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                        {log.redScore || 0} - {log.blueScore || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thống kê hiệp */}
          {round.red && round.blue && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50/50 dark:bg-red-900/10 rounded p-3 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-widest">{t("competition_detail.round_history.red_team")}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between pr-2 border-r border-red-200 dark:border-red-800">
                    <span>{t("competition_detail.round_history.point")}:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{round.red.match?.score || 0}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>{t("competition_detail.round_history.fall")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{round.red.match?.fall || 0}</span>
                  </div>
                  <div className="flex justify-between pr-2 border-r border-red-200 dark:border-red-800">
                    <span>{t("competition_detail.round_history.remind")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{round.red.match?.remind || 0}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>{t("competition_detail.round_history.warn")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{round.red.match?.warn || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded p-3 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest">{t("competition_detail.round_history.blue_team")}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between pr-2 border-r border-blue-200 dark:border-blue-800">
                    <span>{t("competition_detail.round_history.point")}:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{round.blue.match?.score || 0}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>{t("competition_detail.round_history.fall")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{round.blue.match?.fall || 0}</span>
                  </div>
                  <div className="flex justify-between pr-2 border-r border-blue-200 dark:border-blue-800">
                    <span>{t("competition_detail.round_history.remind")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{round.blue.match?.remind || 0}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>{t("competition_detail.round_history.warn")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{round.blue.match?.warn || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thông báo khi không có logs */}
      {expanded && logs.length === 0 && (
        <div className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("competition_detail.round_history.no_actions")}</p>
        </div>
      )}
    </div>
  );
}
