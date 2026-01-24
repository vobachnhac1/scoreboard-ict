import React from "react";
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
  if (!showHistoryModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header - Modern Design */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
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
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Lịch sử thao tác
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Tổng số: {actionHistory.length} thao tác
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded transition-all hover:rotate-90 duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] bg-gradient-to-br from-gray-50 to-white">
          {actionHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 mx-auto mb-6 text-blue-400"
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
                <p className="text-2xl font-bold text-gray-700 text-center">
                  Chưa có thao tác nào
                </p>
                <p className="text-gray-500 text-center mt-2">
                  Các thao tác trong trận đấu sẽ được hiển thị tại đây
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600">
                      <th className="px-4 py-4 text-white font-bold text-center w-16 border-r border-blue-500">
                        <div className="flex items-center justify-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path
                              fillRule="evenodd"
                              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          STT
                        </div>
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-20 border-r border-blue-500">
                        Hiệp
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-24 border-r border-blue-500">
                        Thời gian
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-28 border-r border-blue-500">
                        Loại
                      </th>
                      <th className="px-4 py-4 text-white font-bold border-r border-blue-500">
                        Mô tả
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-20 border-r border-blue-500">
                        Đỏ
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-20 border-r border-blue-500">
                        Xanh
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-24 border-r border-blue-500">
                        Nhắc nhở
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-24 border-r border-blue-500">
                        Cảnh cáo
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-24 border-r border-blue-500">
                        Đòn chân
                      </th>
                      <th className="px-4 py-4 text-white font-bold text-center w-24">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionHistory.map((action, index) => (
                      <tr
                        key={action.id}
                        className={`border-b border-gray-200 hover:shadow-md transition-all duration-200 ${
                          action.team === "red"
                            ? "bg-gradient-to-r from-red-50 to-red-100/50"
                            : action.team === "blue"
                              ? "bg-gradient-to-r from-blue-50 to-blue-100/50"
                              : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {/* STT */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          <span className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-md min-w-[50px]">
                            #{actionHistory.length - index}
                          </span>
                        </td>

                        {/* Hiệp */}
                        <td className="px-4 py-4 text-center text-gray-800 font-bold text-base border-r border-gray-100">
                          {action.round}
                        </td>

                        {/* Thời gian */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded font-mono text-sm font-semibold">
                            {action.time}
                          </span>
                        </td>

                        {/* Loại */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          <span
                            className={`inline-block px-4 py-1.5 text-xs font-bold rounded shadow-md ${getActionTypeColorClass(action.actionType)}`}
                          >
                            {getActionTypeLabel(
                              action.actionType,
                            ).toUpperCase()}
                          </span>
                        </td>

                        {/* Mô tả */}
                        <td className="px-4 py-4 text-gray-800 font-medium min-w-[200px] max-w-[400px] border-r border-gray-100">
                          <div className="whitespace-normal break-words leading-relaxed">
                            {action.description}
                          </div>
                        </td>

                        {/* Điểm Đỏ */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          <span className="inline-flex items-center justify-center bg-gradient-to-br from-red-600 to-red-700 text-white px-3 py-2 rounded font-bold text-lg shadow-md min-w-[50px]">
                            {action.redScore}
                          </span>
                        </td>

                        {/* Điểm Xanh */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          <span className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white px-3 py-2 rounded font-bold text-lg shadow-md min-w-[50px]">
                            {action.blueScore}
                          </span>
                        </td>

                        {/* Nhắc nhở */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          {action.remindRed > 0 || action.remindBlue > 0 ? (
                            <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-bold text-sm border border-yellow-300">
                              {action.remindRed}/{action.remindBlue}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Cảnh cáo */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          {action.warnRed > 0 || action.warnBlue > 0 ? (
                            <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded font-bold text-sm border border-orange-300">
                              {action.warnRed}/{action.warnBlue}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Đòn chân */}
                        <td className="px-4 py-4 text-center border-r border-gray-100">
                          {action.kickRed > 0 || action.kickBlue > 0 ? (
                            <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded font-bold text-sm border border-purple-300">
                              {action.kickRed}/{action.kickBlue}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-4 text-center">
                          {index === 0 && (
                            <button
                              onClick={undoLastAction}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-1 mx-auto"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Hoàn tác
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

        {/* Footer - Redesigned */}
        <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 px-8 py-5 pb-8 flex justify-between items-center border-t-2 border-gray-300">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-4 py-2 rounded shadow-md">
              <span className="text-sm font-semibold">Tổng số thao tác:</span>
              <span className="ml-2 text-xl font-bold">
                {actionHistory.length}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowHistoryModal(false)}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 hover:from-blue-700 hover:via-blue-800 hover:to-blue-800 text-white px-8 py-3 rounded font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
