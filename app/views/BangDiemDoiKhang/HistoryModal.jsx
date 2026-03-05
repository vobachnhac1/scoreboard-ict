import React from "react";
import { useTranslation } from "react-i18next";
import {
  getActionTypeLabel,
  getActionTypeColorClass,
} from "../../helpers/actionType";

const HistoryModal = ({
  showHistoryModal,
  setShowHistoryModal,
  actionHistory,
  undoLastAction,
}) => {
  const { t } = useTranslation();

  if (!showHistoryModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Minimalist Design */}
        <div className="relative bg-white dark:bg-gray-800 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
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
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("scoreboard.doikhang.history_modal_title")}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 font-medium">
                  {t("scoreboard.doikhang.history_total")}: <span className="text-gray-900 dark:text-gray-200 font-bold">{actionHistory.length}</span> {t("scoreboard.doikhang.history_actions")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-160px)] bg-gray-50/50 dark:bg-gray-900/50 flex-1">
          {actionHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 h-full">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-sm w-full">
                <div className="bg-gray-50 dark:bg-gray-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center">
                  {t("scoreboard.doikhang.history_no_actions")}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-center mt-2 text-sm leading-relaxed">
                  {t("scoreboard.doikhang.history_actions_desc")}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 backdrop-blur-sm z-10 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-16">
                        {t("scoreboard.doikhang.history_stt")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-20">
                        {t("scoreboard.doikhang.history_round")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">
                        {t("scoreboard.doikhang.history_time")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">
                        {t("scoreboard.doikhang.history_type")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("scoreboard.doikhang.history_description")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider text-center w-20">
                        {t("scoreboard.doikhang.history_red")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-wider text-center w-20">
                        {t("scoreboard.doikhang.history_blue")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">
                        {t("scoreboard.doikhang.history_remind")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">
                        {t("scoreboard.doikhang.history_warn")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">
                        {t("scoreboard.doikhang.history_kick")}
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-24">
                        {t("scoreboard.doikhang.history_action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {actionHistory.map((action, index) => (
                      <tr
                        key={action.id}
                        className={`transition-colors duration-150 ${action.team === "red"
                            ? "bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                            : action.team === "blue"
                              ? "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                      >
                        {/* STT */}
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-500 dark:text-gray-400">
                          {actionHistory.length - index}
                        </td>

                        {/* Hiệp */}
                        <td className="px-5 py-4 text-center text-gray-800 dark:text-gray-200 font-bold">
                          {action.round}
                        </td>

                        {/* Thời gian */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-block text-gray-600 dark:text-gray-400 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {action.time}
                          </span>
                        </td>

                        {/* Loại */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm border ${getActionTypeColorClass(action.actionType)}`}
                          >
                            {getActionTypeLabel(action.actionType)}
                          </span>
                        </td>

                        {/* Mô tả */}
                        <td className="px-5 py-4 text-gray-700 dark:text-gray-300 min-w-[200px] max-w-[400px]">
                          <div className="whitespace-normal break-words leading-relaxed text-sm">
                            {action.description}
                          </div>
                        </td>

                        {/* Điểm Đỏ */}
                        <td className="px-5 py-4 w-20">
                          <div className="flex justify-center w-full">
                            <span className="flex items-center justify-center w-8 h-8 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold border border-red-200/50 dark:border-red-800/50">
                              {action.redScore}
                            </span>
                          </div>
                        </td>

                        {/* Điểm Xanh */}
                        <td className="px-5 py-4 w-20">
                          <div className="flex justify-center w-full">
                            <span className="flex items-center justify-center w-8 h-8 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold border border-blue-200/50 dark:border-blue-800/50">
                              {action.blueScore}
                            </span>
                          </div>
                        </td>

                        {/* Nhắc nhở */}
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-500 dark:text-gray-400">
                          {action.remindRed > 0 || action.remindBlue > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800/50">
                              {action.remindRed}/{action.remindBlue}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Cảnh cáo */}
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-500 dark:text-gray-400">
                          {action.warnRed > 0 || action.warnBlue > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800/50">
                              {action.warnRed}/{action.warnBlue}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Đòn chân */}
                        <td className="px-5 py-4 text-center font-mono text-xs text-gray-500 dark:text-gray-400">
                          {action.kickRed > 0 || action.kickBlue > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800/50">
                              {action.kickRed}/{action.kickBlue}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="px-5 py-4 text-center">
                          {index === 0 && (
                            <button
                              onClick={undoLastAction}
                              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1.5 w-full border border-gray-200 dark:border-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                              {t("scoreboard.doikhang.history_undo")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Minimalist */}
        <div className="bg-white dark:bg-gray-800 px-8 py-5 flex justify-end items-center border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowHistoryModal(false)}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors flex items-center gap-2 border border-transparent dark:border-gray-600"
          >
            {t("scoreboard.doikhang.history_close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
