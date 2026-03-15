import React from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import RoundHistoryCard from "./RoundHistoryCard";
import ConfirmModal from "../../../../../components/ConfirmModal";
import { getActionTypeColorClassWithBorder, getActionTypeLabel } from "../../../../../helpers/actionType";

export default function HistoryView({
  row,
  onClose,
  exportToExcelRef,
  showError,
  modalProps,
}) {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [matchInfo, setMatchInfo] = React.useState(null);
  const { t } = useTranslation();

  // Hàm xuất Excel
  const exportToExcel = () => {
    try {
      // Lấy dữ liệu
      const latestHistoryItem =
        history.length > 0 ? history[history.length - 1] : null;
      const allLogs = latestHistoryItem?.logs || [];
      const roundHistory = latestHistoryItem?.round_history || [];

      const redName = row.data[3] || "VĐV ĐỎ";
      const redUnit = row.data[4] || "";
      const blueName = row.data[6] || "VĐV XANH";
      const blueUnit = row.data[7] || "";
      const latestHistory =
        history.length > 0 ? history[history.length - 1] : null;
      const redScore = latestHistory?.red_score || 0;
      const blueScore = latestHistory?.blue_score || 0;
      const winner = matchInfo?.winner || row.winner;

      // Tạo workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Thông tin tổng quan
      const summaryData = [
        [t("competition_detail.modals.total_result")],
        [],
        [t("competition_detail.modals.info_column"), t("competition_detail.modals.value_column")],
        [t("competition_detail.round_history.red"), redName],
        [t("competition_detail.data_form.unit_label"), redUnit],
        [t("competition_detail.result_form.score_label"), redScore],
        [],
        [t("competition_detail.round_history.blue"), blueName],
        [t("competition_detail.data_form.unit_label"), blueUnit],
        [t("competition_detail.result_form.score_label"), blueScore],
        [],
        [
          t("competition_detail.data_form.winner_label"),
          winner === "RED" ? redName : winner === "BLUE" ? blueName : t("competition_detail.modals.draw"),
        ],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, "Tổng quan");

      // Sheet 2: Kết quả từng hiệp
      if (roundHistory.length > 0) {
        const roundData = [
          [t("competition_detail.modals.round_results_title")],
          [],
          [
            t("competition_detail.round_history.round"),
            t("competition_detail.modals.round_config"),
            t("competition_detail.result_form.score_label") + " (" + t("competition_detail.round_history.red") + ")",
            t("competition_detail.result_form.score_label") + " (" + t("competition_detail.round_history.blue") + ")",
            t("competition_detail.modals.victory"),
            t("competition_detail.modals.fall"),
            t("competition_detail.modals.out") || "Biên",
            t("competition_detail.modals.penalty_short"),
            t("competition_detail.modals.penalty"),
          ],
        ];

        roundHistory.forEach((round) => {
          roundData.push([
            round.round,
            round.roundType === "EXTRA" ? t("competition_detail.modals.extra_rounds_label") : t("competition_detail.round_history.round"),
            round.red?.match?.score || 0,
            round.blue?.match?.score || 0,
            round.red?.match?.win || 0,
            round.red?.match?.fall || 0,
            round.red?.match?.out || 0,
            round.red?.match?.warning || 0,
            round.red?.match?.penalty || 0,
          ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(roundData);
        XLSX.utils.book_append_sheet(wb, ws2, "Kết quả hiệp");
      }

      // Sheet 3: Lịch sử chi tiết
      if (allLogs.length > 0) {
        const logData = [
          [t("competition_detail.modals.detailed_action_history")],
          [],
          [
            t("competition_detail.modals.number_column"),
            t("competition_detail.round_history.time"),
            t("competition_detail.round_history.round"),
            t("competition_detail.modals.action_type"),
            t("competition_detail.round_history.team"),
            t("competition_detail.result_form.score_label"),
          ],
        ];

        allLogs.forEach((log, index) => {
          logData.push([
            index + 1,
            log.timestamp || "",
            log.round || "",
            getActionTypeLabel(log.action?.toLowerCase(), t) || log.action,
            log.side === "RED" ? t("competition_detail.round_history.red") : log.side === "BLUE" ? t("competition_detail.round_history.blue") : "",
            `${log.redScore || 0} - ${log.blueScore || 0}`,
          ]);
        });

        const ws3 = XLSX.utils.aoa_to_sheet(logData);
        XLSX.utils.book_append_sheet(wb, ws3, "Lịch sử chi tiết");
      }

      // Xuất file
      const fileName = `Ket_qua_tran_dau_${redName}_vs_${blueName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log("Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      showError("Có lỗi xảy ra khi xuất file Excel!");
    }
  };

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // Lấy lịch sử từ API nếu có match_id
        if (row.match_id) {
          const response = await axios.get(
            `http://localhost:6789/api/competition-match/${row.match_id}/history`,
          );
          if (response?.data?.success) {
            setHistory(response.data.data || []);
          }

          // Lấy thông tin match
          const matchResponse = await axios.get(
            `http://localhost:6789/api/competition-match/${row.match_id}`,
          );
          if (matchResponse?.data?.success) {
            setMatchInfo(matchResponse.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // Gán hàm exportToExcel vào ref để component cha có thể gọi
    if (exportToExcelRef) {
      exportToExcelRef.current = exportToExcel;
    }
  }, [row]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin  h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          {t("competition_detail.messages.loading")}
        </span>
      </div>
    );
  }

  // Tính điểm cuối cùng từ history
  const latestHistory = history.length > 0 ? history[history.length - 1] : null;
  const redScore = latestHistory?.red_score || 0;
  const blueScore = latestHistory?.blue_score || 0;
  const winner = matchInfo?.winner || row.winner;

  // Thông tin VĐV
  const redName = row.data[3] || "VĐV ĐỎ";
  const redUnit = row.data[4] || "";
  const blueName = row.data[6] || "VĐV XANH";
  const blueUnit = row.data[7] || "";

  // Lấy round_history và logs từ history cuối cùng
  const latestHistoryItem =
    history.length > 0 ? history[history.length - 1] : null;
  const roundHistory = latestHistoryItem?.round_history || [];
  const allLogs = latestHistoryItem?.logs || [];

  return (
    <div className="space-y-4">
      {/* 1. KẾT QUẢ TỔNG */}
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t("competition_detail.modals.total_result")}
        </h3>

        <div className="flex justify-between items-stretch gap-4">
          {/* Giáp Đỏ */}
          <div className={`flex-1 flex flex-col justify-center items-center bg-white dark:bg-gray-800 border-2 rounded p-4 transition-all ${winner?.toUpperCase() === "RED" ? "border-red-400 shadow-md ring-4 ring-red-500/10" : "border-gray-100 dark:border-gray-700"}`}>
            <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold mb-2 border border-red-200 dark:border-red-800 text-sm">
              {t("competition_detail.modals.red_initial")}
            </span>
            <div className="text-5xl font-black text-red-600 dark:text-red-400 mb-2">{redScore}</div>
            <div className="text-center w-full pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{redName}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{redUnit || "—"}</p>
            </div>
            {winner?.toUpperCase() === "RED" && (
              <div className="mt-4 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm">
                {t("competition_detail.modals.victory")}
              </div>
            )}
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center px-2">
            <div className="text-xl font-black text-gray-300 dark:text-gray-600 mb-1">VS</div>
            <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">{t("competition_detail.modals.match_no")}<br />{row.data[0]}</div>
            <div className="mt-4 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {row.match_status === "FIN" ? t("competition_detail.filters.status_finished") : row.match_status === "IN" ? t("competition_detail.filters.status_ongoing") : t("competition_detail.modals.waiting_comp")}
            </div>
          </div>

          {/* Giáp Xanh */}
          <div className={`flex-1 flex flex-col justify-center items-center bg-white dark:bg-gray-800 border-2 rounded p-4 transition-all ${winner?.toUpperCase() === "BLUE" ? "border-blue-400 shadow-md ring-4 ring-blue-500/10" : "border-gray-100 dark:border-gray-700"}`}>
            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-2 border border-blue-200 dark:border-blue-800 text-sm">
              {t("competition_detail.modals.blue_initial")}
            </span>
            <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-2">{blueScore}</div>
            <div className="text-center w-full pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{blueName}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{blueUnit || "—"}</p>
            </div>
            {winner?.toUpperCase() === "BLUE" && (
              <div className="mt-3 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                {t("competition_detail.modals.victory")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. KẾT QUẢ TỪNG HIỆP */}
      {roundHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-4">
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {t("competition_detail.modals.round_results_title")} ({roundHistory.length})
            </h3>
          </div>

          <div className="p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/20">
            {roundHistory.map((round, roundIndex) => {
              // Lọc logs theo hiệp
              const roundLogs = allLogs.filter((log) => log.round === round.round) || [];

              return (
                <RoundHistoryCard
                  key={`round-history-${round.round}-${round.roundType || "NORMAL"}`}
                  round={round}
                  roundIndex={roundIndex}
                  logs={roundLogs}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LỊCH SỬ CHI TIẾT HÀNH ĐỘNG */}
      {allLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-4">
          <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {t("competition_detail.modals.detailed_action_history")} ({allLogs.length})
            </h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {allLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg">{t("competition_detail.modals.no_action_history")}</p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 w-12 text-xs uppercase tracking-wider">
                      {t("competition_detail.modals.number_column")}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      {t("competition_detail.round_history.time")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 w-20 text-xs uppercase tracking-wider">
                      {t("competition_detail.round_history.round")}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      {t("competition_detail.modals.action_type")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 w-24 text-xs uppercase tracking-wider">
                      {t("competition_detail.round_history.team")}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      {t("competition_detail.round_history.description")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-500 dark:text-gray-400 w-32 text-xs uppercase tracking-wider">
                      {t("competition_detail.modals.score_column")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {allLogs.map((log, logIndex) => {
                    return (
                      <tr
                        key={`all-logs-${log.round}-${log.time}-${log.actionType}-${logIndex}`}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-center text-gray-400 dark:text-gray-500 text-xs font-mono">
                          {logIndex + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                          {log.time || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold font-mono">
                            {log.round || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border shadow-sm ${getActionTypeColorClassWithBorder(log.actionType)}`}>
                            {getActionTypeLabel(log.actionType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {log.team === "red" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 font-bold text-xs uppercase tracking-wider">
                              {t("competition_detail.round_history.red")}
                            </span>
                          ) : log.team === "blue" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 font-bold text-xs uppercase tracking-wider">
                              {t("competition_detail.round_history.blue")}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                          {log.description || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center font-mono text-gray-900 dark:text-gray-100 font-bold text-sm bg-gray-50 dark:bg-gray-900/50 px-3 py-1 rounded border border-gray-200 dark:border-gray-700">
                            {log.redScore || 0} - {log.blueScore || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal thông báo chung */}
      <ConfirmModal {...modalProps} />
    </div>
  );
}
