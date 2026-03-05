import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SearchInput from "../../../components/SearchInput";
import { Constants } from "../../../common/Constants";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import {
  fetchConfigSystem,
  updateConfigSystem,
} from "../../../config/redux/controller/configSystemSlice";
import * as XLSX from "xlsx";
import useConfirmModal from "../../../hooks/useConfirmModal";
import ConfirmModal from "../../../components/ConfirmModal";
import {
  getActionTypeLabel,
  getActionTypeColorClass,
  getActionTypeColorClassWithBorder,
} from "../../../helpers/actionType";
import ConfigSystem from "./ConfigSystem";

// Component hiển thị chi tiết từng hiệp
function RoundHistoryCard({ round, roundIndex, logs }) {
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

// Component Card cho mỗi trận đấu
function MatchCard({
  row,
  listActions,
  getActionsByStatus,
  onDoubleClick,
  viewMode = "grid",
}) {
  const { t } = useTranslation();
  const status = row.match_status || "WAI";
  const statusConfig = {
    WAI: {
      label: t("competition_detail.match_card.waiting"),
      color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    IN: {
      label: t("competition_detail.match_card.ongoing"),
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      ),
    },
    FIN: {
      label: t("competition_detail.match_card.finished"),
      color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    CAN: {
      label: t("competition_detail.match_card.status_cancelled"),
      color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const currentStatus = statusConfig[status] || statusConfig["WAI"];
  const availableActions = getActionsByStatus(status);

  // Xác định màu nổi bật theo VĐV thắng
  const winner = row.winner?.toUpperCase();
  let cardBorderClass = "border-blue-50 dark:border-blue-900/20";
  let cardBgClass = "bg-white dark:bg-gray-800";
  let cardGlowClass = "";

  if (status === "FIN" && winner) {
    if (winner === "RED") {
      cardBorderClass = "border-red-200 dark:border-red-800/60";
      cardBgClass = "bg-red-50/20 dark:bg-red-900/10";
      cardGlowClass = "shadow-sm shadow-red-100/50 dark:shadow-none";
    } else if (winner === "BLUE") {
      cardBorderClass = "border-blue-200 dark:border-blue-800/60";
      cardBgClass = "bg-blue-50/20 dark:bg-blue-900/10";
      cardGlowClass = "shadow-sm shadow-blue-100/50 dark:shadow-none";
    }
  }

  // List View
  if (viewMode === "list") {
    return (
      <div
        className={`${cardBgClass} rounded shadow-sm hover:shadow-md transition-all duration-300 border ${cardBorderClass} ${cardGlowClass} overflow-hidden group relative flex h-full cursor-pointer`}
        onDoubleClick={() => onDoubleClick(row)}
      >
        <div className="flex items-center gap-4 p-4 w-full">
          <div className="flex-shrink-0">
            <div className="bg-blue-600 dark:bg-blue-500 text-white border border-blue-400 rounded px-3 py-2 font-black text-sm font-mono shadow-inner min-w-[60px] text-center">
              T{row.data[0]}
            </div>
          </div>

          {/* Giáp Đỏ */}
          <div className={`flex-1 min-w-0 ${status === "FIN" && winner === "RED" ? "opacity-100" : "opacity-80"}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <div className={`w-2 h-2 rounded-full ${status === "FIN" && winner === "RED" ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" : "bg-red-300"}`}></div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{t("competition_detail.match_card.red")}</span>
            </div>
            <div className={`font-black truncate ${status === "FIN" && winner === "RED" ? "text-red-700 dark:text-red-400 text-sm" : "text-blue-900 dark:text-blue-100 text-xs"}`}>
              {row.data[3] || "—"}
            </div>
            <div className="text-[10px] text-blue-400 dark:text-blue-500 font-bold truncate">
              {row.data[4] || "—"}
            </div>
          </div>

          <div className="flex-shrink-0 text-blue-200 dark:text-blue-800 font-black italic text-lg opacity-40">VS</div>

          {/* Giáp Xanh */}
          <div className={`flex-1 min-w-0 text-right ${status === "FIN" && winner === "BLUE" ? "opacity-100" : "opacity-80"}`}>
            <div className="flex items-center justify-end gap-2 mb-0.5">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{t("competition_detail.match_card.blue")}</span>
              <div className={`w-2 h-2 rounded-full ${status === "FIN" && winner === "BLUE" ? "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" : "bg-blue-300"}`}></div>
            </div>
            <div className={`font-black truncate ${status === "FIN" && winner === "BLUE" ? "text-blue-700 dark:text-blue-400 text-sm" : "text-blue-900 dark:text-blue-100 text-xs"}`}>
              {row.data[6] || "—"}
            </div>
            <div className="text-[10px] text-blue-400 dark:text-blue-500 font-bold truncate">
              {row.data[7] || "—"}
            </div>
          </div>

          <div className="flex-shrink-0 w-32 border-l border-blue-50 dark:border-blue-900/30 pl-4">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border ${currentStatus.color} text-[10px] font-black uppercase tracking-tight shadow-sm transition-all`}>
              {status === "IN" && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current opacity-70"></span>
              {currentStatus.label}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-1.5">
            {listActions.filter(a => availableActions.includes(a.key)).map(action => (
              <button
                key={action.key}
                onClick={(e) => { e.stopPropagation(); action.callback(row); }}
                className="w-8 h-8 rounded border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
              >
                {React.cloneElement(action.icon, { className: "h-3.5 w-3.5" })}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className={`${cardBgClass} rounded shadow-sm hover:shadow-xl transition-all duration-500 border-2 ${cardBorderClass} ${cardGlowClass} overflow-hidden group flex flex-col h-full cursor-pointer relative`}
      onDoubleClick={() => onDoubleClick(row)}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30"></div>

      <div className="px-5 py-4 flex items-center justify-between border-b border-blue-50 dark:border-blue-900/20 bg-blue-50/10">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 dark:bg-blue-500 text-white rounded px-2.5 py-1.5 text-xs font-black font-mono shadow-md border border-blue-400">
            T{row.data[0]}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-blue-400 dark:text-blue-500 uppercase tracking-widest">{row.data[1]}</p>
            {row.data[2] && <p className="text-[9px] font-bold text-blue-300 truncate">{row.data[2]}</p>}
          </div>
        </div>
        <div className={`px-2 py-1 rounded border ${currentStatus.color} text-[10px] font-black transition-all flex items-center gap-1.5`}>
          {status === "IN" && <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>}
          {currentStatus.label}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="space-y-3">
          {/* Giáp Đỏ */}
          <div className={`p-4 rounded border transition-all duration-300 ${status === "FIN" && winner === "RED" ? "bg-red-50 border-red-200 shadow-inner" : "bg-white dark:bg-blue-900/10 border-blue-50 dark:border-blue-800/40"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-3 bg-red-500 rounded-full"></div>
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{t("competition_detail.match_card.red")}</span>
            </div>
            <h4 className={`font-black leading-tight line-clamp-2 ${status === "FIN" && winner === "RED" ? "text-red-700 text-base" : "text-blue-900 dark:text-blue-100 text-sm"}`}>
              {row.data[3] || "—"}
            </h4>
            <p className="mt-1 text-[10px] font-bold text-blue-400 dark:text-blue-500 opacity-80">{row.data[4] || "—"}</p>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <span className="bg-white dark:bg-gray-800 px-3 text-[10px] font-black text-blue-200 dark:text-blue-900 italic">{t("competition_detail.match_card.versus")}</span>
          </div>

          {/* Giáp Xanh */}
          <div className={`p-4 rounded border transition-all duration-300 ${status === "FIN" && winner === "BLUE" ? "bg-blue-50 border-blue-200 shadow-inner" : "bg-white dark:bg-blue-900/10 border-blue-50 dark:border-blue-800/40"}`}>
            <div className="flex items-center justify-end gap-2 mb-2 text-right">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{t("competition_detail.match_card.blue")}</span>
              <div className="w-1.5 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <h4 className={`text-right font-black leading-tight line-clamp-2 ${status === "FIN" && winner === "BLUE" ? "text-blue-700 text-base" : "text-blue-900 dark:text-blue-100 text-sm"}`}>
              {row.data[6] || "—"}
            </h4>
            <p className="mt-1 text-[10px] font-bold text-blue-400 dark:text-blue-500 opacity-80 text-right">{row.data[7] || "—"}</p>
          </div>
        </div>

        {row.winner_text && (
          <div className="mt-2 p-3 bg-blue-600/5 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 flex items-center justify-between">
            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t("competition_detail.match_card.winner").toUpperCase()}:</span>
            <span className="text-xs font-black text-blue-900 dark:text-blue-100 truncate max-w-[140px]">{row.winner_text.split(" - ")[0]}</span>
          </div>
        )}

        <div className="pt-4 mt-auto border-t border-blue-50 dark:border-blue-900/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {listActions.filter(a => availableActions.includes(a.key)).map(action => (
            <button
              key={action.key}
              onClick={(e) => { e.stopPropagation(); action.callback(row); }}
              className="flex-1 min-w-[36px] h-10 rounded border border-blue-100 dark:border-blue-800 bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:scale-105 transition-all active:scale-95 shadow-sm"
              title={action.btnText}
            >
              {React.cloneElement(action.icon, { className: "h-4 w-4" })}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompetitionDataDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // State cho modal actions
  const [openActions, setOpenActions] = useState(null);

  // State cho filter và view
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, WAI, IN, FIN, CAN
  const [sortBy, setSortBy] = useState("match_no"); // match_no, status, name
  const [viewMode, setViewMode] = useState("list"); // grid, list
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("matches"); // matches, referrers
  const [availableReferees, setAvailableReferees] = useState([]);

  // Hook cho modal thông báo
  const { modalProps, showAlert, showError, showSuccess } = useConfirmModal();

  // Scroll to top handler
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ref để lưu hàm exportToExcel từ HistoryView
  const exportToExcelRef = React.useRef(null);

  // Load dữ liệu khi component mount
  const configSystem = useAppSelector((state) => state.configSystem);

  useEffect(() => {
    dispatch(fetchConfigSystem());
    fetchData();
    fetchAvailableReferees();
  }, [id]);

  const fetchAvailableReferees = async () => {
    try {
      const response = await axios.get("http://localhost:6789/api/referees");
      if (response.data.success) {
        setAvailableReferees(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching referees:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:6789/api/competition-dk/${id}`,
      );
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSheetData(data);

        if (data.data && data.data.length > 0) {
          data.data[0][0] = t("competition_detail.table.match_no");

          // Thêm cột "VĐV thắng" vào headers
          const headersWithWinner = [...data.data[0], t("competition_detail.match_card.winner")];
          console.log("headersWithWinner: ", headersWithWinner);
          setHeaders(headersWithWinner);

          // Lấy danh sách matches từ database
          const matchesResponse = await axios.get(
            `http://localhost:6789/api/competition-match/by-dk/${id}`,
          );
          const matches = matchesResponse.data.success
            ? matchesResponse.data.data
            : [];

          // Map matches với rows
          const rowsData = data.data.slice(1).map((row, index) => {
            const match = matches.find((m) => m.row_index === index);

            // Tạo text VĐV thắng (Tên - Đơn vị)
            let winnerText = "";
            if (match?.winner) {
              if (match.winner?.toUpperCase() === "RED") {
                // Giả sử cột 3 là tên Giáp Đỏ, cột 4 là đơn vị Giáp Đỏ
                winnerText = `${row[3] || ""} - ${row[4] || ""}`;
              } else if (match.winner?.toUpperCase() === "BLUE") {
                // Giả sử cột 6 là tên Giáp Xanh, cột 7 là đơn vị Giáp Xanh
                winnerText = `${row[6] || ""} - ${row[7] || ""}`;
              }
            }

            return {
              data: row, // Lưu array gốc vào property data
              match_id: match?.id,
              match_status: match?.match_status || "WAI",
              config_system: match?.config_system || {},
              winner: match?.winner || null,
              winner_text: winnerText,
            };
          });

          setRows(rowsData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(
        t("competition_detail.messages.load_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const handleSearch = (text) => {
    console.log("Tìm kiếm:", text);
    fetchData();
    // TODO: Implement search logic
  };

  // List actions - Tương tự MatchAthlete
  const listActions = [
    {
      key: Constants.ACTION_MATCH_START,
      btnText: t("competition_detail.actions.start_match"),
      color:
        "bg-blue-600 rounded text-white hover:bg-blue-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      description: t("competition_detail.action_descriptions.start_match"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_START,
          row: row,
        });
      },
    },
    // {
    //   key: Constants.ACTION_MATCH_RESULT,
    //   btnText: "Kết quả",
    //   color:
    //     "bg-yellow-600 text-white hover:bg-yellow-700",
    //   icon: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="h-4 w-4"
    //       viewBox="0 0 20 20"
    //       fill="currentColor"
    //     >
    //       <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    //     </svg>
    //   ),
    //   description: "Kết quả",
    //   callback: (row) => {
    //     setOpenActions({
    //       isOpen: true,
    //       key: Constants.ACTION_MATCH_RESULT,
    //       row: row,
    //     });
    //   },
    // },
    {
      key: Constants.ACTION_MATCH_CONFIG,
      btnText: t("competition_detail.actions.config"),
      color:
        "bg-purple-600 text-white hover:bg-purple-700",
      icon: (
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
      ),
      description: t("competition_detail.action_descriptions.config"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_CONFIG,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_MATCH_HISTORY,
      btnText: t("competition_detail.actions.history"),
      color:
        "bg-green-600 text-white hover:bg-green-700",
      icon: (
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
      ),
      description: t("competition_detail.action_descriptions.history"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_HISTORY,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: t("competition_detail.actions.update"),
      color:
        "bg-gray-600 text-white hover:bg-gray-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      description: t("competition_detail.action_descriptions.update"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_UPDATE,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: t("competition_detail.actions.delete"),
      color:
        "bg-red-600 text-white hover:bg-red-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      description: t("competition_detail.action_descriptions.delete"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_DELETE,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_MATCH_REPORT,
      btnText: t("competition_detail.actions.report"),
      color:
        "bg-orange-600 text-white hover:bg-orange-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      description: t("competition_detail.action_descriptions.report"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_REPORT,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_MATCH_LOGS,
      btnText: t("competition_detail.actions.logs"),
      color:
        "bg-purple-600 text-white hover:bg-purple-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      ),
      description: t("competition_detail.action_descriptions.logs"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_LOGS,
          row: row,
        });
      },
    },
  ];

  // Lấy actions theo status - Tương tự MatchAthlete
  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [
          Constants.ACTION_UPDATE,
          Constants.ACTION_MATCH_HISTORY,
          Constants.ACTION_MATCH_REPORT,
          // Constants.ACTION_MATCH_LOGS,
        ];
      case "IN": // Đang diễn ra
        return [
          Constants.ACTION_MATCH_START,
          // Constants.ACTION_MATCH_RESULT,
          Constants.ACTION_MATCH_HISTORY,
        ];
      case "WAI": // Chờ
        return [
          Constants.ACTION_MATCH_START,
          // Constants.ACTION_MATCH_RESULT,
          Constants.ACTION_UPDATE,
          Constants.ACTION_DELETE,
        ];
      default:
        return [Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
    }
  };

  // Tạo columns động từ headers
  const columns = [
    // {
    //   title: 'STT',
    //   key: 'order',
    //   align: 'center',
    // },
    ...headers
      ?.map((header, index) => {
        // Xác định style cho các cột
        let cellClassName = "";
        let customRender = null;

        // Cột 3 là Tên Giáp Đỏ - Nhập với cột 4 (Đơn vị) - Chữ đỏ bold
        if (index === 3) {
          cellClassName = "font-bold whitespace-pre-line min-w-[200px]";
          customRender = (row) => {
            const name = row.data[3] || "";
            const unit = row.data[4] || "";
            return (
              <div className="font-bold text-red-600 whitespace-pre-line min-w-[200px]">
                {name}
                {unit && `\n${unit}`}
              </div>
            );
          };
          return {
            title: t("competition_detail.table.red_team"), // Header mới
            key: `col_${index}`,
            className: cellClassName,
            render: customRender,
          };
        }
        // Cột 4 (Đơn vị Đỏ) - Ẩn vì đã nhập vào cột 3
        else if (index === 4 || index === 5) {
          return null; // Sẽ bị filter ra
        }
        // Cột 5 là Quốc kỳ Đỏ - Chữ đỏ bold
        // else if (index === 5) {
        //   cellClassName = 'font-bold text-red-600';
        //   customRender = (row) => (
        //     <span className="font-bold text-red-600">{row.data[index] || '-'}</span>
        //   );
        // }
        // Cột 6 là Tên Giáp Xanh - Nhập với cột 7 (Đơn vị) - Chữ xanh bold
        else if (index === 6) {
          cellClassName =
            "font-bold text-blue-600 whitespace-pre-line min-w-[200px]";
          customRender = (row) => {
            const name = row.data[6] || "";
            const unit = row.data[7] || "";
            return (
              <div className="font-bold text-blue-600 whitespace-pre-line min-w-[200px]">
                {name}
                {unit && `\n${unit}`}
              </div>
            );
          };
          return {
            title: t("competition_detail.table.blue_team"), // Header mới
            key: `col_${index}`,
            className: cellClassName,
            render: customRender,
          };
        }
        // Cột 7 (Đơn vị Xanh) - Ẩn vì đã nhập vào cột 6
        else if (index === 7 || index === 8 || index === 9) {
          return null; // Sẽ bị filter ra
        }
        // Cột 8 là Quốc kỳ Xanh - Chữ xanh bold
        // else if (index === 8) {
        //   cellClassName = 'font-bold text-blue-600';
        //   customRender = (row) => (
        //     <span className="font-bold text-blue-600">{row.data[index] || '-'}</span>
        //   );
        // }
        // Cột cuối cùng là VĐV thắng - Chữ vàng bold (không nền)
        else if (index === headers.length - 1) {
          cellClassName = "";
          customRender = (row) => (
            <span className="font-bold text-yellow-600">
              {row.data[index] || "-"}
            </span>
          );
        }

        return {
          title: header || `Cột ${index + 1}`,
          key: `col_${index}`,
          className: cellClassName,
          render: customRender || ((row) => row.data[index] || "-"),
        };
      })
      .filter((col) => col !== null), // Loại bỏ các cột null (đã ẩn)
    {
      title: t("competition_detail.table.status"),
      key: "match_status",
      align: "center",
      render: (row) => {
        const status = row.match_status || "WAI";
        const statusLabel =
          {
            WAI: t("competition_detail.match_status.waiting"),
            IN: t("competition_detail.match_status.ongoing"),
            FIN: t("competition_detail.match_status.finished"),
            CAN: t("competition_detail.match_status.cancelled"),
          }[status] || t("competition_detail.match_status.waiting");

        const statusColor =
          {
            WAI: "bg-gray-200 text-gray-800",
            IN: "bg-blue-200 text-blue-800",
            FIN: "bg-green-200 text-green-800",
            CAN: "bg-red-200 text-red-800",
          }[status] || "bg-gray-200 text-gray-800";

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}
          >
            {statusLabel}
          </span>
        );
      },
    },
    {
      title: t("competition_detail.table.actions"),
      align: "center",
      key: "action",
      width: "auto",
      render: (row) => {
        const availableActions = getActionsByStatus(row.match_status || "WAI");
        return (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <button
                  onClick={() => action.callback(row)}
                  key={action.key}
                  className={`
                    flex items-center gap-1.5
                    px-3 py-1.5
                    rounded
                    text-xs font-semibold
                    shadow-md hover:shadow-lg
                    transform hover:scale-105
                    transition-all duration-200
                    whitespace-nowrap
                    ${action.color}
                  `}
                >
                  {action.icon}
                  <span>{action.btnText}</span>
                </button>
              ))}
          </div>
        );
      },
    },
  ];

  // Chuyển đổi rows thành data cho CustomTable với match_status
  const tableData = rows.map((row, index) => {
    // Nếu row là object (đã có match_status)
    if (typeof row === "object" && !Array.isArray(row)) {
      // Lấy data gốc
      const rowData = Array.isArray(row) ? row : row.data || row;

      // Thêm cột VĐV thắng vào cuối
      const dataWithWinner = [...rowData, row.winner_text || ""];

      return {
        key: index,
        id: index,
        rowIndex: index,
        data: dataWithWinner,
        match_status: row.match_status || "WAI",
        match_id: row.match_id || null,
        config_system: row.config_system || {},
        winner: row.winner || null,
      };
    }
    // Nếu row là array (chưa có match_status)
    return {
      key: index,
      id: index,
      rowIndex: index,
      data: [...row, ""], // Thêm cột trống cho VĐV thắng
      match_status: "WAI",
      match_id: null,
      config_system: {},
      winner: null,
    };
  });

  // Filter data theo status
  const filteredData = tableData.filter((row) => {
    // Filter theo status
    if (filterStatus !== "ALL" && row.match_status !== filterStatus) {
      return false;
    }

    // Filter theo search
    if (search) {
      const searchLower = search.toLowerCase();
      const matchNo = String(row.data[0] || "").toLowerCase();
      const redName = String(row.data[3] || "").toLowerCase();
      const blueName = String(row.data[6] || "").toLowerCase();
      const redUnit = String(row.data[4] || "").toLowerCase();
      const blueUnit = String(row.data[7] || "").toLowerCase();

      return (
        matchNo.includes(searchLower) ||
        redName.includes(searchLower) ||
        blueName.includes(searchLower) ||
        redUnit.includes(searchLower) ||
        blueUnit.includes(searchLower)
      );
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "match_no":
        return Number(a.data[0] || 0) - Number(b.data[0] || 0);
      case "status":
        const statusOrder = { IN: 0, WAI: 1, FIN: 2, CAN: 3 };
        return (
          (statusOrder[a.match_status] || 99) -
          (statusOrder[b.match_status] || 99)
        );
      case "red_name":
        return String(a.data[3] || "").localeCompare(String(b.data[3] || ""));
      case "blue_name":
        return String(a.data[6] || "").localeCompare(String(b.data[6] || ""));
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset page khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [filterStatus, search, sortBy]);

  // Xử lý thêm mới
  const handleInsert = async (formData) => {
    try {
      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map(
        (_, index) => formData[`col_${index}`] || "",
      );

      // Tính toán text winner
      let winnerText = "";
      if (formData.winner === "red") {
        winnerText = formData.col_3 ? formData.col_3 + (formData.col_4 ? ` - ${formData.col_4}` : "") : t("competition_detail.round_history.red");
      } else if (formData.winner === "blue") {
        winnerText = formData.col_6 ? formData.col_6 + (formData.col_7 ? ` - ${formData.col_7}` : "") : t("competition_detail.round_history.blue");
      }
      rowData.push(winnerText);

      const newRowObject = {
        data: rowData,
        match_id: null,
        match_status: formData.match_status || "WAI",
        config_system: {},
        winner: null,
        winner_text: "",
      };

      const newRows = [...rows, newRowObject];
      const newData = [headersWithoutWinner, ...newRows.map((r) => r.data)];

      await saveDataToServer(newData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      showSuccess(t("competition_detail.messages.insert_success"));
    } catch (error) {
      console.error("Error inserting:", error);
      showError(
        t("competition_detail.messages.insert_error") + ": " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý cập nhật
  const handleUpdate = async (formData) => {
    try {
      const row = openActions.row;
      console.log("row: ", row, formData);

      // 1. Cập nhật dữ liệu Excel (các cột)
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map(
        (_, index) => formData[`col_${index}`] || "",
      );

      // Tính toán text winner
      let winnerText = row.data[row.data.length - 1] || "";
      if (formData.winner === "red") {
        winnerText = formData.col_3 ? formData.col_3 + (formData.col_4 ? ` - ${formData.col_4}` : "") : t("competition_detail.round_history.red");
      } else if (formData.winner === "blue") {
        winnerText = formData.col_6 ? formData.col_6 + (formData.col_7 ? ` - ${formData.col_7}` : "") : t("competition_detail.round_history.blue");
      } else if (formData.winner === "") {
        winnerText = "";
      }
      rowData.push(winnerText);

      // 2. Gọi API cập nhật row riêng lẻ
      await axios.put(
        `http://localhost:6789/api/competition-dk/${id}/row/${row.rowIndex}`,
        {
          data: rowData,
        },
      );

      // 3. Nếu có match_id, cập nhật match_status vào database
      if (row.match_id) {
        await axios.put(
          `http://localhost:6789/api/competition-match/${row.match_id}/status`,
          {
            status: formData.match_status,
          },
        );

        // 3b. Cập nhật winner
        if (formData.winner !== undefined) {
          await axios.put(
            `http://localhost:6789/api/competition-match/${row.match_id}/winner`,
            { winner: formData.winner }
          );
          if (formData.winner !== "") {
            await updateWinnerToNextMatches(row, formData.winner);
          }
        }
      }

      // 4. Cập nhật state local
      const newRows = rows.map((r, index) => {
        if (index === row.rowIndex) {
          return {
            ...r,
            data: rowData,
            match_status: formData.match_status || r.match_status,
          };
        }
        return r;
      });

      // 5. Cập nhật state và đóng modal
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });

      // 4. Reload data để đồng bộ
      await fetchData();

      showSuccess(t("competition_detail.messages.update_success"));
    } catch (error) {
      console.error("Error updating:", error);
      showError(
        t("competition_detail.messages.update_error") + ": " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý xóa
  const handleDelete = async () => {
    try {
      const newRows = rows.filter(
        (_, index) => index !== openActions.row.rowIndex,
      );

      // Cập nhật lại ID cho các row sau khi xóa
      const updatedRows = newRows.map((row, index) => ({
        ...row,
        data: row.data.map((cell, cellIndex) => {
          // Cột đầu tiên là ID, cập nhật lại theo index mới
          if (cellIndex === 0) {
            return index + 1;
          }
          return cell;
        }),
      }));

      // Loại bỏ cột VĐV thắng khỏi headers khi lưu
      const headersWithoutWinner = headers.slice(0, -1);
      const newData = [headersWithoutWinner, ...updatedRows.map((r) => r.data)];

      await saveDataToServer(newData);
      setRows(updatedRows);
      setOpenActions({ ...openActions, isOpen: false });
      showSuccess(t("competition_detail.messages.delete_success"));
    } catch (error) {
      console.error("Error deleting:", error);
      showError(
        t("competition_detail.messages.delete_error") + ": " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Gọi API để lưu dữ liệu
  const saveDataToServer = async (newData) => {
    await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
      sheet_name: sheetData.sheet_name,
      file_name: sheetData.file_name,
      data: newData,
    });
  };

  // Lưu phân bổ giám định
  const handleSaveReferrers = async (newReferrers) => {
    try {
      await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
        ...sheetData,
        referrers: newReferrers,
      });
      setSheetData({ ...sheetData, referrers: newReferrers });
      showSuccess(t("competition_detail.messages.save_referees_success"));
    } catch (error) {
      console.error("Error saving referrers:", error);
      showError(t("competition_detail.messages.save_referees_error", { error: error.message }));
    }
  };

  // Xử lý vào trận
  const handleMatchStart = async () => {
    try {
      const row = openActions.row;
      // Thực hiện chặn
      let isBlocked = !configSystem.data.ap_dung_vonhac;
      if (isBlocked) {
        await showError(t("competition_detail.messages.feature_locked"));
        return;
      }
      // Nếu chưa có match_id, tạo match mới
      if (!row.match_id) {
        const createResponse = await axios.post(
          "http://localhost:6789/api/competition-match",
          {
            competition_dk_id: id,
            match_no: row.data[0],
            row_index: row.rowIndex,
            red_name: row.data[3] || "",
            blue_name: row.data[6] || "",
            config_system: configSystem.data || {},
            referrers: sheetData.referrers || [],
          },
        );

        row.match_id = createResponse.data.data.id;
      }

      // Cập nhật status thành 'IN'
      await axios.put(
        `http://localhost:6789/api/competition-match/${row.match_id}/status`,
        {
          status: "IN",
        },
      );

      // Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // Chuẩn bị dữ liệu trận đấu

      const matchData = {
        match_id: row.match_id,
        match_no: row.data[0] || "",
        match_weight: row.data[1] || "",
        match_type: row.data[2] || "",
        match_level: row.data[9] || "",
        red: {
          name: row.data[3] || "",
          unit: row.data[4] || "",
          country: row.data[5] || "",
        },
        blue: {
          name: row.data[6] || "",
          unit: row.data[7] || "",
          country: row.data[8] || "",
        },
        match_status: "IN",
        ten_giai_dau: configSystem.data.ten_giai_dau || "",
        ten_mon_thi: configSystem.data.bo_mon || "",
        config_system: configSystem.data || {},
        competition_dk_id: id, // Thêm competition_dk_id để dùng cho handleNextMatch
        row_index: row.match_id, // Thêm row_index để tìm trận tiếp theo
        referrers: sheetData?.referrers || [],
      };
      // Chuyển sang màn hình thi đấu với state
      navigate("/bang-diem/doi-khang", {
        state: {
          matchData,
          returnUrl: `/management/competition-data/${id}`,
        },
      });
    } catch (error) {
      console.error("Error starting match:", error);
      showError(
        t("competition_detail.messages.start_match_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý kết quả
  const handleResult = async (formData) => {
    try {
      const row = openActions.row;

      // 1. Lưu kết quả vào history
      const historyData = {
        red_score: formData.red_score,
        blue_score: formData.blue_score,
        notes: formData.notes,
        status: "FIN",
      };
      // Nếu có match_id, thêm vào history
      if (row.match_id) {
        await axios.post(
          `http://localhost:6789/api/competition-match/${row.match_id}/history`,
          historyData,
        );
      }

      // 2. Cập nhật winner và status thành FIN
      if (row.match_id) {
        await axios.put(
          `http://localhost:6789/api/competition-match/${row.match_id}/winner`,
          {
            winner: formData.winner,
          },
        );
      }

      // 3. Tự động cập nhật VĐV thắng vào các trận tiếp theo
      const updateCount = await updateWinnerToNextMatches(row, formData.winner);

      // 4. Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // 5. Reload data để hiển thị cập nhật
      await fetchData();

      // 6. Thông báo thành công
      if (updateCount > 0) {
        showSuccess(
          `${t("competition_detail.messages.save_result_success")} ${updateCount} ${t("competition_detail.stats.matches")}.`,
        );
      } else {
        showSuccess(t("competition_detail.messages.save_result_success"));
      }
    } catch (error) {
      console.error("Error saving result:", error);
      showError(
        t("competition_detail.messages.save_result_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Hàm tự động cập nhật VĐV thắng vào các trận tiếp theo
  const updateWinnerToNextMatches = async (currentRow, winner) => {
    try {
      // Lấy số trận hiện tại (ví dụ: "1", "2", "3"...)
      const currentMatchNumber = parseFloat(currentRow.data[0]) || currentRow.data[0]; // Cột đầu tiên là "Trận số"
      console.log(
        "🔍 Search pattern win." + currentMatchNumber + " in list...",
      );

      // Xác định tên VĐV thắng
      let winnerName = "";
      let winnerUnit = "";
      if (winner?.toUpperCase() === "RED") {
        winnerName = currentRow.data[3] || ""; // Tên Giáp Đỏ
        winnerUnit = currentRow.data[4] || ""; // Đơn vị Giáp Đỏ
      } else if (winner?.toUpperCase() === "BLUE") {
        winnerName = currentRow.data[6] || ""; // Tên Giáp Xanh
        winnerUnit = currentRow.data[7] || ""; // Đơn vị Giáp Xanh
      }

      console.log("🏆 Winner:", { name: winnerName, unit: winnerUnit });

      // Nếu không có VĐV thắng, không cần cập nhật
      if (!winnerName) {
        console.log(" " + t("competition_detail.messages.no_winner_info"));
        return 0;
      }

      // Pattern để tìm: "win.1", "win.2", etc.
      const winPattern = `win.${currentMatchNumber}`;
      const updateRequests = [];
      let updateCount = 0;

      // Duyệt qua tất cả các hàng để tìm pattern
      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i].data;
        let needUpdate = false;
        let updatedRow = [...rowData];

        // Kiểm tra từng cell trong row
        for (let j = 0; j < rowData.length; j++) {
          const cellValue = String(rowData[j] || "")
            .toLowerCase()
            .trim();

          if (cellValue === winPattern.toLowerCase()) {
            // Tìm thấy pattern, cập nhật tên VĐV thắng
            console.log(
              ` Found "${winPattern}" at match ${updatedRow[0]}, column ${j}`,
            );

            updatedRow[j] = winnerName;
            needUpdate = true;

            // Nếu cột tiếp theo là đơn vị, cập nhật luôn
            if (j + 1 < rowData.length) {
              updatedRow[j + 1] = winnerUnit;
            }

            updateCount++;
          }
        }

        // Nếu có cập nhật, gọi API để lưu
        if (needUpdate) {
          console.log(
            `📝 Backend update - Match ${updatedRow[0]}: ${winnerName} (${winnerUnit})`,
          );

          updateRequests.push(
            axios
              .put(`http://localhost:6789/api/competition-dk/${id}/row/${i}`, {
                data: updatedRow,
              })
              .then(() => {
                console.log(` Backend updated - Match ${updatedRow[0]}`);
              })
              .catch((err) => {
                console.error(
                  ` Backend update error - Match ${updatedRow[0]}:`,
                  err,
                );
                throw err;
              }),
          );
        }
      }

      // Chờ tất cả requests hoàn thành
      if (updateRequests.length > 0) {
        console.log(
          t("competition_detail.messages.updating_backend", {
            count: updateRequests.length,
          }),
        );
        await Promise.all(updateRequests);
        console.log(
          ` ` +
          t("competition_detail.messages.winner_updated", {
            count: updateRequests.length,
          }),
        );
      } else {
        console.log(
          "ℹ️ " + t("competition_detail.messages.find_no_match_update"),
        );
      }

      return updateCount;
    } catch (error) {
      console.error(" Error updating winner to next matches:", error);
      throw error; // Throw để handleResult có thể catch
    }
  };

  // Xử lý cấu hình
  const handleConfig = async (configData) => {
    try {
      const row = openActions.row;

      if (row.match_id) {
        await axios.put(
          `http://localhost:6789/api/competition-match/${row.match_id}/config`,
          {
            config_system: configData,
          },
        );

        showSuccess(t("competition_detail.messages.config_save_success"));
        setOpenActions({ ...openActions, isOpen: false });
        fetchData(); // Reload data
      } else {
        showAlert(t("competition_detail.messages.no_match_id"));
      }
    } catch (error) {
      console.error("Error saving config:", error);
      showError(
        t("competition_detail.messages.config_save_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Render nội dung modal
  const renderContentModal = (openActions, modalProps) => {
    switch (openActions?.key) {
      case Constants.ACTION_MATCH_START:
        return (
          <ActionConfirm
            message={t("competition_detail.messages.start_match_confirm", { match: openActions.row?.data[0] })}
            onConfirm={handleMatchStart}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_MATCH_RESULT:
        return (
          <ResultForm
            row={openActions.row}
            onSubmit={handleResult}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            showAlert={showAlert}
          />
        );
      case Constants.ACTION_MATCH_CONFIG:
        return <ConfigSystem />;
      case Constants.ACTION_MATCH_HISTORY:
        return (
          <HistoryView
            row={openActions.row}
            onClose={() => setOpenActions({ ...openActions, isOpen: false })}
            exportToExcelRef={exportToExcelRef}
            showError={showError}
            modalProps={modalProps}
            setOpenActions={setOpenActions}
            openActions={openActions}
          />
        );
      case Constants.ACTION_UPDATE:
        return (
          <DataForm
            headers={headers}
            data={openActions.row?.data}
            row={openActions.row}
            onSubmit={handleUpdate}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            showAlert={showAlert}
          />
        );
      case Constants.ACTION_DELETE:
        return (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("competition_detail.messages.loading_data")}
          </p>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 shadow">
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("competition_detail.messages.no_data_found")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow-2xl rounded border border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() =>
            navigate("/management/general-setting/competition-management")
          }
          className="group mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all w-fit"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{t("competition_detail.buttons.back")}</span>
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {sheetData.sheet_name}
        </h2>
        <div className="flex items-center gap-1 mb-8 bg-blue-50/50 dark:bg-blue-900/10 p-1.5 rounded w-fit border border-blue-100 dark:border-blue-800/30">
          <button
            onClick={() => setActiveTab("matches")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "matches"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_detail.tabs.matches")}
          </button>
          <button
            onClick={() => setActiveTab("referrers")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "referrers"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_detail.tabs.referees")}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest">{t("competition_detail.stats.waiting").toUpperCase()}</span>
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-200">
              {tableData.filter((r) => r.match_status === "WAI").length}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">{t("competition_detail.stats.ongoing").toUpperCase()}</span>
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-200">
              {tableData.filter((r) => r.match_status === "IN").length}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest">{t("competition_detail.stats.finished").toUpperCase()}</span>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-200">
              {tableData.filter((r) => r.match_status === "FIN").length}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "matches" ? (
        <>
          {/* Toolbar - Filter, Sort, View Mode */}
          <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4 shadow-xl shadow-blue-500/5 border border-blue-50 dark:border-blue-900/30">
            <div className="flex flex-row items-center justify-between gap-4">
              {/* Left: Search & Filter */}
              <div className="flex flex-row items-center gap-3 flex-1 overflow-x-auto no-scrollbar">
                {/* Search */}
                <div className="min-w-[200px] flex-1 max-w-xs">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    onSearch={handleSearch}
                    placeholder={t("competition_detail.form.search_placeholder")}
                  />
                </div>

                <div className="flex flex-row items-center gap-3">
                  {/* Filter Status */}
                  <div className="relative group shrink-0">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-[11px] font-black text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-blue-50 appearance-none min-w-[150px]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
                    >
                      <option value="ALL">{t("competition_detail.filters.all_status")}</option>
                      <option value="WAI">{t("competition_detail.filters.status_waiting")}</option>
                      <option value="IN">{t("competition_detail.filters.status_ongoing")}</option>
                      <option value="FIN">{t("competition_detail.filters.status_finished")}</option>
                      <option value="CAN">{t("competition_detail.filters.status_cancelled")}</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="relative group shrink-0">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-[11px] font-black text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-blue-50 appearance-none min-w-[150px]"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
                    >
                      <option value="match_no">{t("competition_detail.filters.sort_by_match_no")}</option>
                      <option value="status">{t("competition_detail.filters.sort_by_status")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right: View Mode & Stats */}
              <div className="flex flex-row items-center gap-3 shrink-0">
                {/* Stats Counter */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded shadow-lg shadow-blue-500/20 text-white min-w-[100px] justify-center">
                  <span className="text-[10px] font-black uppercase opacity-80">{t("competition_detail.stats.match_count_label")}</span>
                  <span className="text-xs font-black">{filteredData.length}/{tableData.length}</span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 p-1 rounded border border-blue-100 dark:border-blue-900/50 shadow-inner">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center justify-center h-8 w-8 rounded transition-all ${viewMode === "grid"
                      ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md shadow-blue-500/20"
                      : "text-blue-400 hover:text-blue-600"
                      }`}
                    title={t("competition_detail.filters.grid_view_title")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center justify-center h-8 w-8 rounded transition-all ${viewMode === "list"
                      ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md shadow-blue-500/20"
                      : "text-blue-400 hover:text-blue-600"
                      }`}
                    title={t("competition_detail.filters.list_view_title")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("competition_detail.messages.loading_data")}
                </p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
                  {t("competition_detail.messages.no_matches_found")}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  {t("competition_detail.messages.try_filters")}
                </p>
              </div>
            ) : (
              <>
                {/* Cards Grid/List */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4"
                      : "space-y-3"
                  }
                >
                  {paginatedData.map((row) => (
                    <MatchCard
                      key={row.key}
                      row={row}
                      listActions={listActions}
                      getActionsByStatus={getActionsByStatus}
                      onDoubleClick={(row) => {
                        setOpenActions({
                          isOpen: true,
                          key: Constants.ACTION_UPDATE,
                          row: row,
                        });
                      }}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded text-sm font-medium transition-all ${page === i + 1
                              ? "bg-blue-600 text-white shadow-md scale-110"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-3 py-2 border min-w-[150px] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value={6}>{t("competition_detail.messages.per_page", { count: 6 })}</option>
                      <option value={12}>{t("competition_detail.messages.per_page", { count: 12 })}</option>
                      <option value={24}>{t("competition_detail.messages.per_page", { count: 24 })}</option>
                      <option value={48}>{t("competition_detail.messages.per_page", { count: 48 })}</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <RefereeAllocationSection
          availableReferees={availableReferees}
          initialReferrers={sheetData?.referrers || []}
          onSave={handleSaveReferrers}
          configSystem={configSystem}
        />
      )
      }

      {/* Scroll to Top Button */}
      {
        showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
            title={t("competition_detail.filters.scroll_to_top")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 group-hover:animate-bounce"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )
      }

      {/* Modal Cấu hình */}
      {openActions?.isOpen &&
        openActions?.key === Constants.ACTION_MATCH_CONFIG && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-6xl w-full mx-4 max-h-[92vh] overflow-hidden flex flex-col border-4 border-indigo-500/20 dark:border-indigo-600/30 animate-in zoom-in-95 duration-500">
              <div className="relative px-6 py-4 bg-blue-600 dark:bg-blue-800 overflow-hidden flex-shrink-0">

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur shadow-xl">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.config_subtitle")}</h2>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{t("competition_detail.modals.config_title")}</h3>
                    </div>
                  </div>
                  <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-950/50 p-5 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Kết quả */}
      {openActions?.isOpen &&
        openActions?.key === Constants.ACTION_MATCH_RESULT && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-7xl w-full mx-4 max-h-[92vh] overflow-hidden flex flex-col border-4 border-blue-500/20 dark:border-blue-600/30 animate-in zoom-in-95 duration-500">
              <div className="relative px-6 py-4 bg-blue-600 overflow-hidden flex-shrink-0">

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur shadow-xl">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.result_subtitle")}</h2>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{t("competition_detail.modals.result_title")}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { if (exportToExcelRef.current) exportToExcelRef.current(); }} className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xs transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20 border border-white/20">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> {t("competition_detail.buttons.export_excel")}
                    </button>
                    <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-950/50 p-6 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Lịch sử */}
      {openActions?.isOpen &&
        openActions?.key === Constants.ACTION_MATCH_HISTORY && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-7xl w-full mx-4 max-h-[92vh] overflow-hidden flex flex-col border-4 border-blue-500/20 dark:border-blue-600/30 animate-in zoom-in-95 duration-500">
              <div className="relative px-6 py-4 bg-blue-600 overflow-hidden flex-shrink-0">

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur shadow-xl">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.history_subtitle")}</h2>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{t("competition_detail.modals.history_title")}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { if (exportToExcelRef.current) exportToExcelRef.current(); }} className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xs transition-all active:scale-95 flex items-center gap-2 shadow-lg border border-white/20">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg> {t("competition_detail.buttons.export_excel")}
                    </button>
                    <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-950/50 p-5 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Cập nhật */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-7xl w-full mx-4 max-h-[92vh] overflow-hidden flex flex-col border-4 border-blue-500/20 dark:border-blue-600/30 animate-in zoom-in-95 duration-500">
            <div className="relative px-6 py-4 bg-blue-600 dark:bg-indigo-900 overflow-hidden flex-shrink-0">

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur shadow-xl">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.update_match_subtitle")}</h2>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{t("competition_detail.modals.update_match_title")}</h3>
                  </div>
                </div>
                <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-950/50 p-6 custom-scrollbar">
              {renderContentModal(openActions, modalProps)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Hồ sơ Trận đấu (Biên bản & Nhật ký) */}
      {openActions?.isOpen && (openActions?.key === Constants.ACTION_MATCH_REPORT || openActions?.key === Constants.ACTION_MATCH_LOGS) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-7xl w-full mx-4 max-h-[92vh] min-h-[85vh] overflow-hidden flex flex-col border-4 border-blue-500/20 dark:border-blue-600/30 animate-in zoom-in-95 duration-500">
            {/* Unified Header with Tabs */}
            <div className="relative bg-blue-600 dark:bg-blue-800 overflow-hidden flex-shrink-0">


              <div className="relative z-10 px-8 pt-6 pb-2">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur shadow-xl border border-white/20">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.match_documents_subtitle")}</h2>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">{t("competition_detail.modals.match_documents_title")}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="h-10 px-6 bg-white/15 hover:bg-white/25 text-white rounded-full font-bold text-[10px] tracking-widest uppercase transition-all active:scale-95 flex items-center gap-2 border border-white/20 backdrop-blur-md">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4" /></svg>
                      {openActions.key === Constants.ACTION_MATCH_REPORT ? t("competition_detail.modals.print_report") : t("competition_detail.modals.print_log")}
                    </button>
                    <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpenActions({ ...openActions, key: Constants.ACTION_MATCH_REPORT })}
                    className={`px-8 py-3 rounded-t-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${openActions.key === Constants.ACTION_MATCH_REPORT
                      ? "bg-white text-indigo-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
                  >
                    1. {t("competition_detail.modals.result_report")}
                  </button>
                  <button
                    onClick={() => setOpenActions({ ...openActions, key: Constants.ACTION_MATCH_LOGS })}
                    className={`px-8 py-3 rounded-t-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${openActions.key === Constants.ACTION_MATCH_LOGS
                      ? "bg-white text-indigo-700 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
                  >
                    2. {t("competition_detail.modals.match_log")}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-950/50 p-6 custom-scrollbar">
              <div className="max-w-none mx-auto bg-white dark:bg-gray-800 rounded-b-2xl rounded-tr-2xl shadow-xl overflow-hidden print:shadow-none">
                {openActions.key === Constants.ACTION_MATCH_REPORT ? (
                  <MatchReportView row={openActions.row} onClose={() => setOpenActions({ ...openActions, isOpen: false })} />
                ) : (
                  <MatchLogsReportView row={openActions.row} onClose={() => setOpenActions({ ...openActions, isOpen: false })} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal khác - Sử dụng Modal component cũ */}
      {
        openActions?.isOpen &&
        openActions?.key !== Constants.ACTION_MATCH_CONFIG &&
        openActions?.key !== Constants.ACTION_MATCH_RESULT &&
        openActions?.key !== Constants.ACTION_MATCH_HISTORY &&
        openActions?.key !== Constants.ACTION_MATCH_REPORT &&
        openActions?.key !== Constants.ACTION_MATCH_LOGS &&
        openActions?.key !== Constants.ACTION_UPDATE && (
          <Modal
            isOpen={true}
            onClose={() => setOpenActions({ ...openActions, isOpen: false })}
            title={
              listActions.find((e) => e.key === openActions?.key)?.description
            }
            headerClass={
              listActions.find((e) => e.key === openActions?.key)?.color
            }
          >
            {renderContentModal(openActions, modalProps)}
          </Modal>
        )
      }
    </div >
  );
}

// Component Form để thêm/sửa dữ liệu
function DataForm({
  headers,
  data = null,
  row = null,
  onSubmit,
  onCancel,
  showAlert,
}) {
  const { t } = useTranslation();

  // Loại bỏ cột VĐV thắng (cột cuối cùng) khỏi form
  const editableHeaders = headers.slice(0, -1);

  const [formData, setFormData] = React.useState(() => {
    const initialData = {};
    editableHeaders.forEach((_, index) => {
      initialData[`col_${index}`] = data ? data[index] || "" : "";
    });
    initialData.match_status = row?.match_status || "WAI";

    // Khởi tạo winner
    const existingWinner = data ? data[data.length - 1] : "";
    const redName = data ? data[3] : "";
    const blueName = data ? data[6] : "";

    let initialWinner = "";
    if (existingWinner && existingWinner !== "-") {
      if (redName && existingWinner.includes(redName)) initialWinner = "red";
      else if (blueName && existingWinner.includes(blueName)) initialWinner = "blue";
    }
    initialData.winner = initialWinner;

    return initialData;
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = ["col_0", "col_1", "col_2", "col_3", "col_6"]; // STT, Nội dung, Hạng cân, VĐV đỏ, VĐV xanh
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      showAlert(t("competition_detail.data_form.required_fields_error"));
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAI":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "IN":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "FIN":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
      case "CAN":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Thông tin chung & Đỏ */}
        <div className="space-y-5">
          {/* Thông tin chung & Trạng thái */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              {t("competition_detail.modals.general_info_status")}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {editableHeaders[0] || t("competition_detail.data_form.stt_label")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    disabled
                    type="text"
                    value={formData.col_0 || ""}
                    onChange={(e) => setFormData({ ...formData, col_0: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.stt_placeholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("competition_detail.data_form.status_label")}
                  </label>
                  <select
                    value={formData.match_status}
                    onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow ${getStatusColor(formData.match_status)}`}
                  >
                    <option value="WAI">{t("competition_detail.data_form.status_waiting")}</option>
                    <option value="IN">{t("competition_detail.data_form.status_ongoing")}</option>
                    <option value="FIN">{t("competition_detail.data_form.status_finished")}</option>
                    <option value="CAN">{t("competition_detail.data_form.status_cancelled")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {editableHeaders[1] || t("competition_detail.data_form.content_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_1 || ""}
                  onChange={(e) => setFormData({ ...formData, col_1: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.content_placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {editableHeaders[2] || t("competition_detail.data_form.weight_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_2 || ""}
                  onChange={(e) => setFormData({ ...formData, col_2: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.weight_placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between gap-2">
                  <span>{t("competition_detail.data_form.winner_label")}</span>
                  {formData.winner && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, winner: "" })}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {t("competition_detail.data_form.clear_winner")}
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, winner: "red" })}
                    className={`py-2 px-3 border rounded shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.winner === "red"
                      ? "bg-red-600 border-red-600 text-white ring-2 ring-red-500 ring-offset-1 dark:ring-offset-gray-900"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
                      }`}
                  >
                    {formData.winner === "red" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] border border-red-200 dark:border-red-800">{t("competition_detail.data_form.red_corner_icon")}</span>
                    )}
                    {t("competition_detail.data_form.red_wins")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, winner: "blue" })}
                    className={`py-2 px-3 border rounded shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.winner === "blue"
                      ? "bg-blue-600 border-blue-600 text-white ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    {formData.winner === "blue" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] border border-blue-200 dark:border-blue-800">{t("competition_detail.data_form.blue_corner_icon")}</span>
                    )}
                    {t("competition_detail.data_form.blue_wins")}
                  </button>
                </div>

                <select
                  value={formData.winner}
                  onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${formData.winner ? 'border-yellow-400 ring-1 ring-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-300 dark:border-gray-600'} rounded shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm font-semibold transition-shadow`}
                >
                  <option value="">{t("competition_detail.data_form.no_winner")}</option>
                  <option value="red">{t("competition_detail.data_form.red_athlete")}: {formData.col_3 || t("competition_detail.data_form.updating")}</option>
                  <option value="blue">{t("competition_detail.data_form.blue_athlete")}: {formData.col_6 || t("competition_detail.data_form.updating")}</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Cột phải: Các VĐV */}
        <div className="space-y-5">
          {/* VĐV ĐỎ */}
          <section>
            <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3 border-b border-red-100 dark:border-red-900/50 pb-2">
              {t("competition_detail.data_form.red_corner_label")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("competition_detail.data_form.name_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_3 || ""}
                  onChange={(e) => setFormData({ ...formData, col_3: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.red_athlete_name_placeholder")}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("competition_detail.data_form.unit_label")}
                  </label>
                  <input
                    type="text"
                    value={formData.col_4 || ""}
                    onChange={(e) => setFormData({ ...formData, col_4: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.unit_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {editableHeaders[5] || t("competition_detail.data_form.birth_year_label")}
                  </label>
                  <input
                    disabled
                    type="text"
                    value={formData.col_5 || ""}
                    onChange={(e) => setFormData({ ...formData, col_5: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.flag_placeholder")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* VĐV XANH */}
          <section>
            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 border-b border-blue-100 dark:border-blue-900/50 pb-2">
              {t("competition_detail.data_form.blue_corner_label")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("competition_detail.data_form.name_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_6 || ""}
                  onChange={(e) => setFormData({ ...formData, col_6: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.blue_athlete_name_placeholder")}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("competition_detail.data_form.unit_label")}
                  </label>
                  <input
                    type="text"
                    value={formData.col_7 || ""}
                    onChange={(e) => setFormData({ ...formData, col_7: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.unit_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {editableHeaders[8] || t("competition_detail.data_form.birth_year_label")}
                  </label>
                  <input
                    disabled
                    type="text"
                    value={formData.col_8 || ""}
                    onChange={(e) => setFormData({ ...formData, col_8: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.flag_placeholder")}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
        >
          {t("competition_detail.buttons.cancel")}
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {data ? t("competition_detail.confirm.update") : t("competition_detail.confirm.add_new")}
        </button>
      </div>
    </form>
  );
}

// Component xác nhận xóa
function DeleteConfirm({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 p-4 rounded">
      {/* Icon cảnh báo */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-600 dark:text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Nội dung */}
      <div className="text-center space-y-2">
        {/* <p className="text-xl font-bold text-gray-900 dark:text-white">{t("competition_detail.confirm.delete_title")}</p> */}
        <p className="text-base text-gray-700 dark:text-gray-300">
          {t("competition_detail.confirm.delete_message")}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          {t("competition_detail.confirm.delete_warning")}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px]"
        >
          {t("competition_detail.buttons.cancel")}
        </Button>
        <Button
          variant="none"
          className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 px-6 py-2.5 min-w-[120px] font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={onConfirm}
        >
          {t("competition_detail.actions.delete")}
        </Button>
      </div>
    </div>
  );
}

// Component xác nhận action
function ActionConfirm({ message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 p-4 rounded">
      {/* Icon xác nhận */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-blue-600 dark:text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Nội dung */}
      <div className="text-center">
        {/* <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xác nhận</p> */}
        <p className="text-base text-gray-700 dark:text-gray-300">{message}</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px]"
        >
          {t("competition_detail.buttons.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          className="px-6 py-2.5 min-w-[120px] font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {t("competition_detail.buttons.confirm")}
        </Button>
      </div>
    </div>
  );
}

// Component form kết quả
function ResultForm({ row, onSubmit, onCancel, showAlert }) {
  const { t } = useTranslation();
  // Lấy thông tin từ row
  const redName = row?.data[3] || "-";
  const redUnit = row?.data[4] || "";
  const blueName = row?.data[6] || "-";
  const blueUnit = row?.data[7] || "";
  const existingWinner = row?.data[row?.data?.length - 1] || ""; // Cột cuối là VĐV thắng

  // Xác định winner từ dữ liệu có sẵn
  const getInitialWinner = () => {
    if (!existingWinner || existingWinner === "-") return "";
    // So sánh tên để xác định winner
    if (existingWinner.includes(redName)) return "red";
    if (existingWinner.includes(blueName)) return "blue";
    return "";
  };
  // thông tin khởi tạo
  const initialData = {
    winner: getInitialWinner(),
    red_score: 0,
    blue_score: 0,
    notes: "",
  };

  const [formData, setFormData] = React.useState(initialData);

  const [isEditing, setIsEditing] = React.useState(
    !existingWinner || existingWinner === "-",
  );
  const [isUpdated, setIsUpdated] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.winner && !isUpdated) {
      showAlert(t("competition_detail.result_form.select_winner"));
      return;
    }
    if (!isUpdated) {
      onSubmit(formData);
      setIsUpdated(false);
    }
  };

  const handleSelectWinner = (winner) => {
    setIsUpdated(false);
    setFormData({ ...formData, winner });
  };

  const handleUpdate = () => {
    setIsUpdated(true);
    setIsEditing(true);
    setFormData({
      winner: "",
      red_score: 0,
      blue_score: 0,
      notes: "",
    });
  };
  const handleCancel = () => {
    setIsEditing(false);
    setIsUpdated(false);
    setFormData(initialData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      <div className="p-5 overflow-y-auto flex-1">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Hiển thị VĐV thắng phía trên */}
          {existingWinner && existingWinner !== "-" && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded text-center shadow-sm">
              <div className="text-yellow-600 dark:text-yellow-400 text-xs font-bold mb-2 uppercase tracking-wide flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .56-.062.818-.174L15 10.274z" clipRule="evenodd" /></svg>
                {t("competition_detail.result_form.winner_label")}
              </div>
              <div className="text-yellow-700 dark:text-yellow-500 text-3xl font-bold">
                {existingWinner}
              </div>
            </div>
          )}

          {/* Chọn người thắng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Giáp Đỏ */}
            <div className={`relative p-5 rounded border-2 transition-all duration-300 ${formData.winner === "red"
              ? "border-red-500 bg-red-50/50 dark:bg-red-900/10 shadow-md ring-4 ring-red-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-gray-800"
              } ${!isEditing ? "opacity-70 grayscale-[20%]" : ""}`}>
              {/* VĐV Đỏ Header */}
              <div className="flex flex-col items-center mb-4">
                <span className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold mb-2 border border-red-200 dark:border-red-800">
                  {t("competition_detail.result_form.red_corner")}
                </span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 text-center">{redName}</h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{redUnit || "—"}</p>
              </div>

              {/* Input Điểm */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">
                  {t("competition_detail.result_form.score_label")}
                </label>
                <input
                  type="text"
                  value={formData.red_score}
                  onChange={(e) => setFormData({ ...formData, red_score: e.target.value })}
                  disabled={!isEditing}
                  className="w-full text-center text-3xl font-black p-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-50 min-w-[14rem] shadow-inner font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Nút chọn */}
              <button
                type="button"
                onClick={() => handleSelectWinner("red")}
                disabled={!isEditing}
                className={`w-full py-3 px-4 rounded font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 ${formData.winner === "red"
                  ? "bg-red-600 text-white shadow-md hover:bg-red-700"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } disabled:cursor-not-allowed`}
              >
                {formData.winner === "red" ? t("competition_detail.modals.selected_winner") : t("competition_detail.modals.select_as_winner")}
              </button>
            </div>

            {/* Giáp Xanh */}
            <div className={`relative p-5 rounded border-2 transition-all duration-300 ${formData.winner === "blue"
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-md ring-4 ring-blue-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
              } ${!isEditing ? "opacity-70 grayscale-[20%]" : ""}`}>
              {/* VĐV Xanh Header */}
              <div className="flex flex-col items-center mb-4">
                <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-2 border border-blue-200 dark:border-blue-800">
                  {t("competition_detail.result_form.blue_corner")}
                </span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 text-center">{blueName}</h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{blueUnit || "—"}</p>
              </div>

              {/* Input Điểm */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">
                  {t("competition_detail.result_form.score_label")}
                </label>
                <input
                  type="text"
                  value={formData.blue_score}
                  onChange={(e) => setFormData({ ...formData, blue_score: e.target.value })}
                  disabled={!isEditing}
                  className="w-full text-center text-3xl font-black p-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50 min-w-[14rem] shadow-inner font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Nút chọn */}
              <button
                type="button"
                onClick={() => handleSelectWinner("blue")}
                disabled={!isEditing}
                className={`w-full py-3 px-4 rounded font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${formData.winner === "blue"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } disabled:cursor-not-allowed`}
              >
                {formData.winner === "blue" ? t("competition_detail.modals.selected_winner") : t("competition_detail.modals.select_as_winner")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        {!isEditing ? (
          // Khi không chỉnh sửa - Hiển thị button Cập nhật và Đóng
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
            >
              {t("competition_detail.modals.close")}
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {t("competition_detail.confirm.update")}
            </button>
          </>
        ) : (
          // Khi đang chỉnh sửa - Hiển thị button Hủy và Lưu
          <>
            <button
              type="button"
              onClick={() => {
                if (existingWinner && existingWinner !== "-") {
                  setIsEditing(false);
                } else {
                  onCancel();
                }
              }}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
            >
              {existingWinner && existingWinner !== "-" ? t("competition_detail.buttons.cancel_edit") : t("competition_detail.buttons.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded shadow transition-all focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {t("competition_detail.buttons.save_result")}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

// Component form cấu hình
function ConfigForm({ row, onSubmit, onCancel }) {
  const { t } = useTranslation();

  const [configData, setConfigData] = React.useState({
    // Cài đặt chung
    so_hiep: 3,
    so_hiep_phu: 1,
    so_giam_dinh: 3,
    he_diem: "10",

    // Thời gian
    thoi_gian_tinh_diem: 1000,
    thoi_gian_thi_dau: 120,
    thoi_gian_hiep: 90,
    thoi_gian_nghi: 30,
    thoi_gian_hiep_phu: 90,
    thoi_gian_y_te: 30,

    // Điểm áp dụng
    khoang_diem_tuyet_toi: 10,

    // Chế độ áp dụng
    cau_hinh_doi_khang_diem_thap: false,
    cau_hinh_quyen_tinh_tong: false,
    cau_hinh_y_te: false,
    cau_hinh_tinh_diem_tuyet_doi: false,
    cau_hinh_xoa_nhac_nho: false,
    cau_hinh_xoa_canh_cao: false,
  });

  React.useEffect(() => {
    // Load config từ row nếu có
    if (row?.config_system) {
      setConfigData((prev) => ({ ...prev, ...row.config_system }));
    }
  }, [row]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(configData);
  };

  const handleChange = (field, value) => {
    setConfigData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full">
      {/* Content - Scrollable */}
      <div className="p-6 overflow-y-auto max-h-[calc(70vh-140px)] bg-white dark:bg-gray-900 space-y-8">
        {/* Section: Thông tin chung về thể thức */}
        <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.modals.format_info")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hệ điểm */}
            <div className="bg-white dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-sm shadow-sm">
              {String(configData.he_diem) === "1" ? t("competition_detail.modals.system_1") : String(configData.he_diem) === "2" ? t("competition_detail.modals.system_2") : String(configData.he_diem) === "3" ? t("competition_detail.modals.system_3") : t("competition_detail.modals.system_2")}
            </div>

            {/* Số giám định */}
            <div className="bg-white dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-sm shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{t("competition_detail.modals.referee_count_label")}</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {t("competition_detail.modals.referees_count", { count: configData.so_giam_dinh || 3 })}
              </span>
            </div>

            {/* Tổng số hiệp */}
            <div className="bg-white dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-sm shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{t("competition_detail.modals.total_round_label")}</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {t("competition_detail.modals.rounds_count", { count: (configData.so_hiep || 3) + (configData.so_hiep_phu || 0) })}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Cấu hình hiệp */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.modals.round_config")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Số hiệp chính */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.main_rounds_label")}</label>
              <select
                value={configData.so_hiep || "3"}
                onChange={(e) => handleChange("so_hiep", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="1">{t("competition_detail.modals.rounds_count", { count: 1 })}</option>
                <option value="2">{t("competition_detail.modals.rounds_count", { count: 2 })}</option>
                <option value="3">{t("competition_detail.modals.rounds_count", { count: 3 })}</option>
              </select>
            </div>

            {/* Số hiệp phụ */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.extra_rounds_label")}</label>
              <select
                value={configData.so_hiep_phu || "0"}
                onChange={(e) => handleChange("so_hiep_phu", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="0">{t("competition_detail.modals.none")}</option>
                <option value="1">{t("competition_detail.modals.extra_round_count", { count: 1 })}</option>
                <option value="2">{t("competition_detail.modals.extra_round_count", { count: 2 })}</option>
                <option value="3">{t("competition_detail.modals.extra_round_count", { count: 3 })}</option>
              </select>
            </div>

            {/* Hệ điểm */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.score_system_label")}</label>
              <select
                value={configData.he_diem || "2"}
                onChange={(e) => handleChange("he_diem", e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="1">{t("competition_detail.modals.system_1")}</option>
                <option value="2">{t("competition_detail.modals.system_2")}</option>
                <option value="3">{t("competition_detail.modals.system_3")}</option>
              </select>
            </div>

            {/* Số giám định */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.referee_count_label")}</label>
              <select
                value={configData.so_giam_dinh || "3"}
                onChange={(e) => handleChange("so_giam_dinh", e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="3">{t("competition_detail.modals.referees_count", { count: 3 })}</option>
                <option value="5">{t("competition_detail.modals.referees_count", { count: 5 })}</option>
                <option value="10">{t("competition_detail.modals.referees_count", { count: 10 })}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Cấu hình thời gian */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.modals.time_config")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Thời gian tính điểm */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.score_point_ms")}</label>
              <input
                type="number"
                value={configData.thoi_gian_tinh_diem}
                onChange={(e) => handleChange("thoi_gian_tinh_diem", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian thi đấu */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.time_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_thi_dau}
                onChange={(e) => handleChange("thoi_gian_thi_dau", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian nghỉ */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.rest_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_nghi}
                onChange={(e) => handleChange("thoi_gian_nghi", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian hiệp phụ */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.extra_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_hiep_phu}
                onChange={(e) => handleChange("thoi_gian_hiep_phu", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian y tế */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.medical_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_y_te}
                onChange={(e) => handleChange("thoi_gian_y_te", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section: Điểm áp dụng & Chế độ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t("competition_detail.modals.max_score_rule")}
            </h3>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.max_score_gap")}</label>
              <div className="relative">
                <input
                  type="number"
                  value={configData.khoang_diem_tuyet_toi}
                  onChange={(e) => handleChange("khoang_diem_tuyet_toi", parseInt(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono font-medium pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{t("competition_detail.modals.points")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {t("competition_detail.modals.application_rule")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: "cau_hinh_doi_khang_diem_thap", label: t("competition_detail.modals.rule_low_score") },
                { key: "cau_hinh_quyen_tinh_tong", label: t("competition_detail.modals.rule_total_score") },
                { key: "cau_hinh_y_te", label: t("competition_detail.modals.rule_medical") },
                { key: "cau_hinh_tinh_diem_tuyet_doi", label: t("competition_detail.modals.rule_absolute_win") },
                { key: "cau_hinh_xoa_nhac_nho", label: t("competition_detail.modals.rule_clear_reminder") },
                { key: "cau_hinh_xoa_canh_cao", label: t("competition_detail.modals.rule_clear_warning") },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <input
                    type="checkbox"
                    id={key}
                    checked={configData[key] || false}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Giống Vovinam */}
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white px-6 py-2  font-semibold transition-colors rounded"
        >
          {t("competition_detail.buttons.cancel")}
        </button>
        <button
          type="submit"
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2  font-semibold transition-colors rounded shadow-sm"
        >
          {t("competition_detail.modals.save_changes")}
        </button>
      </div>
    </form>
  );
}

// Component xem lịch sử - Hiển thị giống màn hình Vovinam
// Component hiển thị Biên bản thi đấu chuyên nghiệp (A4 style)
function MatchReportView({ row, onClose }) {
  const [loading, setLoading] = React.useState(true);
  const [matchData, setMatchData] = React.useState(null);
  const [matchHistory, setMatchHistory] = React.useState(null);
  const configSystem = useAppSelector((state) => state.configSystem);
  const { t } = useTranslation();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (row.match_id) {
          // Lấy thông tin trận đấu
          const matchRes = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}`);
          if (matchRes?.data?.success) {
            setMatchData(matchRes.data.data);
          }

          // Lấy lịch sử trận đấu (chốt kết quả)
          const historyRes = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}/history`);
          if (historyRes?.data?.success) {
            const history = historyRes.data.data;
            // Lấy event history cuối cùng (là kết quả chốt)
            setMatchHistory(history.length > 0 ? history[history.length - 1] : null);
          }
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [row.match_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t("competition_detail.modals.preparing_report")}</p>
      </div>
    );
  }

  const redAthlete = {
    name: row.data[3] || "—",
    unit: row.data[4] || "—",
    country: row.data[5] || ""
  };
  const blueAthlete = {
    name: row.data[6] || "—",
    unit: row.data[7] || "—",
    country: row.data[8] || ""
  };

  const winner = matchHistory?.winner || matchData?.winner;
  const isRedWinner = winner?.toUpperCase() === "RED";
  const isBlueWinner = winner?.toUpperCase() === "BLUE";

  return (
    <div className="bg-white text-black p-0 sm:p-2 min-h-0 print:p-0 print:bg-white print:text-black font-serif">
      {/* Container A4 Style - 210mm x 297mm approx */}
      <div className="max-w-[210mm] mx-auto bg-white border border-gray-100 shadow-xl p-[10mm] sm:p-[20mm] print:border-0 print:shadow-none print:max-w-none print:p-[15mm] print:min-h-0">

        {/* Official Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center w-5/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wider">{configSystem.data?.don_vi_to_chuc || t("competition_detail.modals.organizing_committee")}</h4>
            <p className="text-[8pt] italic font-medium -mt-1">{t("competition_detail.modals.organizing_committee_en")}</p>
            <div className="h-[1.5px] bg-black w-20 mx-auto mt-2"></div>
          </div>
          <div className="text-center w-8/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wide">{t("competition_detail.modals.socialist_republic")}</h4>
            <p className="text-[8pt] -mt-1">{t("competition_detail.modals.socialist_republic_en")}</p>
            <h5 className="font-bold text-[10pt] mt-1">{t("competition_detail.modals.independence_freedom")}</h5>
            <p className="text-[8pt] italic -mt-1">{t("competition_detail.modals.independence_freedom_en")}</p>
            <div className="h-[1.5px] bg-black w-28 mx-auto mt-2"></div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-[20pt] font-black uppercase tracking-[0.1em] leading-tight">{t("competition_detail.modals.official_record_title")}</h1>
          <h2 className="text-[12pt] font-bold text-gray-500 uppercase tracking-widest -mt-1 italic">{t("competition_detail.modals.official_record_subtitle")}</h2>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[14pt] font-black text-gray-900 border-b-2 border-gray-100 pb-1 px-8">
              {configSystem.data?.ten_giai_dau || "—"}
            </p>
            <div className="flex gap-6 text-[10pt] font-bold text-gray-600">
              <div className="flex flex-col items-center">
                <span>{t("competition_detail.modals.venue")} / Venue: {configSystem.data?.dia_diem || "—"}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex flex-col items-center">
                <span>{t("competition_detail.modals.date")} / Date: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Minimalist */}
        <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black mb-8 bg-gray-50/50 uppercase font-black text-[9pt]">
          <div className="p-3 text-center">
            <span className="text-gray-400 block text-[7pt] mb-1">Mã Trận / Match No.</span>
            <span className="text-lg">{row.data[0]}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">Nội dung / Category</span>
            <span className="truncate">{row.data[2]}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">Hạng cân / Weight</span>
            <span className="truncate">{row.data[1]}</span>
          </div>
        </div>

        {/* Athlete Contrast - Black & White Professionalism */}
        <div className="grid grid-cols-2 gap-0 border-2 border-black divide-x-2 divide-black rounded overflow-hidden mb-8">
          {/* Red athlete (now as neutral) */}
          <div className={`p-6 flex flex-col items-center justify-center relative ${isRedWinner ? 'bg-gray-100' : 'bg-white'}`}>
            {isRedWinner && <div className="absolute top-2 right-2 text-[7pt] font-black bg-black text-white px-2 py-0.5 rounded shadow-sm">WINNER</div>}
            <span className="text-[7pt] font-black text-black uppercase mb-2 tracking-widest border-b border-black pb-0.5">GIÁP ĐỎ / RED CORNER</span>
            <h3 className="text-[16pt] font-black text-center text-black uppercase leading-none mt-2">{redAthlete.name}</h3>
            <p className="text-[9pt] font-bold text-gray-500 mt-2 uppercase">{redAthlete.unit}</p>
          </div>
          {/* Blue athlete (now as neutral) */}
          <div className={`p-6 flex flex-col items-center justify-center relative ${isBlueWinner ? 'bg-gray-200' : 'bg-white'}`}>
            {isBlueWinner && <div className="absolute top-2 left-2 text-[7pt] font-black bg-black text-white px-2 py-0.5 rounded shadow-sm">WINNER</div>}
            <span className="text-[7pt] font-black text-black uppercase mb-2 tracking-widest border-b border-black pb-0.5">GIÁP XANH / BLUE CORNER</span>
            <h3 className="text-[16pt] font-black text-center text-black uppercase leading-none mt-2">{blueAthlete.name}</h3>
            <p className="text-[9pt] font-bold text-gray-500 mt-2 uppercase">{blueAthlete.unit}</p>
          </div>
        </div>

        {/* Results Table - Concise & Black/White */}
        <table className="w-full border-collapse border-t-2 border-black mb-8 text-[9pt]">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="p-3 text-left w-20 border-r border-black">
                <p className="font-black uppercase">{t("competition_detail.round_history.round")}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Round</p>
              </th>
              <th className="p-3 text-left border-r border-black">
                <p className="font-black uppercase">{t("competition_detail.modals.technical_analysis")}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Technical Analysis</p>
              </th>
              <th className="p-3 text-center w-24 border-r border-black bg-gray-50">
                <p className="font-black text-black uppercase">{t("competition_detail.round_history.red")} (Red)</p>
              </th>
              <th className="p-3 text-center w-24 border-r border-black bg-gray-100">
                <p className="font-black text-black uppercase">{t("competition_detail.round_history.blue")} (Blue)</p>
              </th>
              <th className="p-3 text-center w-32">
                <p className="font-black uppercase">{t("competition_detail.modals.result")}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Result</p>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black border-b-2 border-black">
            {matchHistory?.round_history?.map((round, idx) => (
              <tr key={idx} className="h-16 group hover:bg-gray-50 transition-colors">
                <td className="p-3 text-center font-black text-lg italic border-r border-black">{round.round}</td>
                <td className="p-3 border-r border-black">
                  <div className="flex flex-col gap-1.5 text-[8pt] font-bold uppercase tracking-tight text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 border border-black bg-black rounded-sm"></span>
                      <span>{t("competition_detail.round_history.red")} / Red: <b className="text-black">{t("competition_detail.modals.fall")}: {round.red?.match?.fall || 0} | {t("competition_detail.modals.penalty_short")}: {round.red?.match?.penalty || 0}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 border border-black bg-gray-300 rounded-sm"></span>
                      <span>{t("competition_detail.round_history.blue")} / Blue: <b className="text-black">{t("competition_detail.modals.fall")}: {round.blue?.match?.fall || 0} | {t("competition_detail.modals.penalty_short")}: {round.blue?.match?.penalty || 0}</b></span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-black text-2xl text-black border-r border-black bg-gray-50">{round.red?.match?.score || 0}</td>
                <td className="p-3 text-center font-black text-2xl text-black border-r border-black bg-gray-100">{round.blue?.match?.score || 0}</td>
                <td className="p-3 text-center font-black uppercase italic text-[9pt]">
                  {round.red?.match?.win > round.blue?.match?.win ? t("competition_detail.modals.red_wins_round") : round.blue?.match?.win > round.red?.match?.win ? t("competition_detail.modals.blue_wins_round") : t("competition_detail.modals.draw")}
                </td>
              </tr>
            ))}
            <tr className="bg-black text-white h-12">
              <td colSpan={2} className="p-3 text-right font-black uppercase text-[10pt] tracking-widest italic pr-6 border-r border-white/20">
                {t("competition_detail.modals.final_total_score")} / FINAL TOTAL SCORE
              </td>
              <td className="p-3 text-center font-black text-2xl text-white border-r border-white/20">{matchHistory?.red_score || 0}</td>
              <td className="p-3 text-center font-black text-2xl text-white border-r border-white/20">{matchHistory?.blue_score || 0}</td>
              <td className="bg-gray-800 border-none"></td>
            </tr>
          </tbody>
        </table>

        {/* Official Declaration - Monochromatic */}
        <div className="p-4 border-2 border-black bg-gray-50 flex items-center justify-center gap-8 mb-12 shadow-sm">
          <div className="flex flex-col items-center">
            <p className="text-[8pt] font-black uppercase text-gray-500 tracking-widest mb-1 italic">Declaration of Victory</p>
            <h4 className="text-[11pt] font-black uppercase">NGƯỜI CHIẾN THẮNG / WINNER</h4>
          </div>
          <div className={`px-12 py-3 border-4 border-black text-[18pt] font-black uppercase tracking-tighter transform -rotate-1 shadow-sm ${isRedWinner || isBlueWinner ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>
            {isRedWinner ? redAthlete.name : isBlueWinner ? blueAthlete.name : "CHƯA XÁC ĐỊNH"}
          </div>
        </div>

        {/* Signature Box */}
        <div className="grid grid-cols-3 gap-10 mt-16 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t("competition_detail.modals.match_secretary")}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Match Secretary</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center border-x border-gray-100">
            <span className="text-[9pt] font-black uppercase">{t("competition_detail.modals.referee")}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Referee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t("competition_detail.modals.chief_referee")}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Chief Referee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
        </div>

        {/* Footer Technical Stamp */}
        {/* <div className="mt-16 pt-6 border-t border-gray-100 flex justify-between items-center opacity-30 grayscale hover:opacity-100 transition-opacity duration-500">
          <div className="font-mono text-[7pt] leading-tight font-bold">
            <p>AUTH: {row.match_id ? String(row.match_id).slice(-8) : "N/A"}-{new Date().getTime().toString().slice(-4)}</p>
            <p>SYSTEM GEN: SCOREBOARD_DIGITAL_V2.0.4</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-16 h-16 border-2 border-black rounded-full flex flex-col items-center justify-center font-black text-[8pt] leading-none transform rotate-12 bg-white">
              <span>OFFICIAL</span>
              <span className="mt-1">STAMP</span>
            </div>
          </div>
        </div> */}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; margin: 0; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  );
}

function MatchLogsReportView({ row }) {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState([]);
  const configSystem = useAppSelector(state => state.configSystem);
  const { t } = useTranslation();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (row.match_id) {
          const res = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}/history`);
          if (res?.data?.success) {
            const history = res.data.data;
            const latestHistory = history[history.length - 1];
            setLogs(latestHistory?.logs || []);
          }
        }
      } catch (error) {
        console.error("Fetch logs error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [row.match_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase text-[7pt] tracking-widest">Đang tải chi tiết diễn biến...</p>
      </div>
    );
  }

  const redAthlete = { name: row.data[3] || "—", unit: row.data[4] || "—" };
  const blueAthlete = { name: row.data[6] || "—", unit: row.data[7] || "—" };

  return (
    <div className="bg-white text-black min-h-0 font-serif p-0 print:p-0">
      <div className="max-w-[210mm] mx-auto bg-white p-[10mm] sm:p-[20mm] print:p-[15mm]">
        {/* Header */}
        <div className="flex justify-between items-start mb-10 border-b border-black pb-8">
          <div className="text-center w-5/12">
            <h4 className="font-bold text-[9pt] uppercase">{configSystem.data?.don_vi_to_chuc || "BAN TỔ CHỨC GIẢI"}</h4>
            <p className="text-[7pt] italic font-medium -mt-1">Organizing Committee</p>
          </div>
          <div className="text-center w-6/12">
            <h4 className="font-bold text-[9pt] uppercase leading-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
            <h5 className="font-bold text-[8pt]">Độc lập - Tự do - Hạnh phúc</h5>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[18pt] font-black uppercase leading-none">{t("competition_detail.modals.match_logs_title")}</h1>
          <h2 className="text-[10pt] font-bold text-gray-400 uppercase italic mt-1 tracking-widest">{t("competition_detail.modals.chronological_logs")}</h2>
          <p className="mt-4 text-[11pt] font-black uppercase underline decoration-1 underline-offset-4">{configSystem.data?.ten_giai_dau || "—"}</p>
        </div>

        <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black mb-8 bg-gray-50 uppercase font-black text-[8pt]">
          <div className="p-3 text-center flex flex-col items-center">
            <span className="text-[12pt] font-black">{redAthlete.name}</span>
            <span className="text-gray-400">ĐỎ (RED)</span>
          </div>
          <div className="p-3 text-center flex flex-col items-center justify-center">
            <span className="text-lg">#{row.data[0]}</span>
            <span className="text-gray-400">{t("competition_detail.modals.match_label")}</span>
          </div>
          <div className="p-3 text-center flex flex-col items-center">
            <span className="text-[12pt] font-black">{blueAthlete.name}</span>
            <span className="text-gray-400">XANH (BLUE)</span>
          </div>
        </div>

        <table className="w-full border-collapse border-b-2 border-black text-[8.5pt]">
          <thead>
            <tr className="bg-black text-white text-center font-black uppercase">
              <th className="p-2 w-12 border-r border-white/20">{t("competition_detail.round_history.round")}</th>
              <th className="p-2 w-20 border-r border-white/20">{t("competition_detail.round_history.time")}</th>
              <th className="p-2 w-24 border-r border-white/20">{t("competition_detail.round_history.team")}</th>
              <th className="p-2 border-r border-white/20 text-left pl-4">{t("competition_detail.round_history.description")}</th>
              <th className="p-2 w-24">{t("competition_detail.modals.score_column") || "Tỷ số"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {logs.map((log, idx) => (
              <tr key={idx} className="h-10 text-center font-medium">
                <td className="p-2 border-r border-gray-200 font-black italic">H{log.round}</td>
                <td className="p-2 border-r border-gray-200 font-mono text-[8pt]">
                  {Math.floor((log.current_time || 0) / 60)}:{((log.current_time || 0) % 60).toString().padStart(2, '0')}
                </td>
                <td className="p-2 border-r border-gray-200">
                  <span className={`inline-block border border-black px-2 py-0.5 rounded-sm font-black text-[6pt] uppercase ${log.side?.toUpperCase() === 'RED' ? 'bg-black text-white' : log.side?.toUpperCase() === 'BLUE' ? 'bg-gray-200 text-black' : 'bg-white text-gray-400'}`}>
                    {log.side || 'SYS'}
                  </span>
                </td>
                <td className="p-2 text-left pl-4 border-r border-gray-200 italic text-[8pt]">
                  {log.description || '—'}
                </td>
                <td className="p-2 font-black tabular-nums border-r border-black">
                  {log.redScore || 0} - {log.blueScore || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <div className="mt-12 flex justify-between items-end opacity-40 italic font-bold text-[7pt]">
          <div>
            Printed on: {new Date().toLocaleString('vi-VN')}<br />
            Record ID: {row.match_id ? String(row.match_id).slice(-8) : 'N/A'}
          </div>
          <div className="text-[14pt] transform -rotate-2 border-2 border-black px-4 font-black not-italic opacity-100 uppercase">LOGS RECORD</div>
        </div> */}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }` }} />
    </div>
  );
}

function HistoryView({
  row,
  onClose,
  exportToExcelRef,
  showError,
  modalProps,
}) {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [matchInfo, setMatchInfo] = React.useState(null);
  const [expandedRow, setExpandedRow] = React.useState(null);
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
          const actionMap = {
            SCORE_1: "Điểm 1",
            SCORE_2: "Điểm 2",
            SCORE_3: "Điểm 3",
            SCORE_5: "Điểm 5",
            SCORE_10: "Điểm 10",
            WIN: "Thắng",
            FALL: "Ngã",
            OUT: "Biên",
            WARNING: "Nhắc nhở",
            PENALTY: "Cảnh cáo",
            MEDICAL: "Y tế",
            ROUND_END: "Kết thúc hiệp",
            MATCH_END: "Kết thúc trận",
          };

          logData.push([
            index + 1,
            log.timestamp || "",
            log.round || "",
            actionMap[log.action] || log.action,
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

  // Hàm xuất Excel khổ A5 với template đối kháng
  const exportToExcelA5 = () => {
    try {
      const latestHistoryItem =
        history.length > 0 ? history[history.length - 1] : null;
      const allLogs = latestHistoryItem?.logs || [];
      const roundHistory = latestHistoryItem?.round_history || [];

      // Tạo workbook
      const wb = XLSX.utils.book_new();

      // Template đối kháng theo hình ảnh
      const templateData = [
        [t("competition_detail.modals.official_record_title")],
        [],
        [t("competition_detail.config_system.competition_name"), "", "", "", ""],
        [t("competition_detail.modals.date"), new Date().toLocaleDateString("vi-VN"), "", "", ""],
        [t("competition_detail.modals.category"), "", "", "", ""],
        [t("competition_detail.data_form.unit_label"), "", "", "", ""],
        [],
        ["", "", t("competition_detail.modals.total_result"), "", ""],
        [t("competition_detail.referee_allocation.referee"), "1", "2", "3", "4", "5"],
        [t("competition_detail.modals.points"), redScore || 0, blueScore || 0, "", "", ""],
        [t("competition_detail.modals.final_total_score"), "", "", "255", "", ""],
        [],
        ["", "", t("competition_detail.referee_allocation.technical_support"), "", ""],
        [t("competition_detail.referee_allocation.referee"), "", t("competition_detail.data_form.name_label"), "", t("competition_detail.data_form.unit_label")],
        ["1", "", "", "", ""],
        ["2", "", "", "", ""],
        ["3", "", "", "", ""],
        ["4", "", "", "", ""],
        ["5", "", "", "", ""],
        ["6", "", "", "", ""],
        [],
        ["", "", t("competition_detail.modals.preparing_report"), "", ""],
        [t("competition_detail.modals.preparing_report"), "", t("competition_detail.data_form.name_label"), "", t("competition_detail.data_form.unit_label")],
        ["1", "", redName, "", redUnit],
        ["2", "", blueName, "", blueUnit],
        ["3", "", "", "", ""],
        ["4", "", "", "", ""],
        ["5", "", "", "", ""],
        ["6", "", "", "", ""],
        ["7", "", "", "", ""],
        ["8", "", "", "", ""],
        ["9", "", "", "", ""],
        ["10", "", "", "", ""],
        ["11", "", "", "", ""],
        ["12", "", "", "", ""],
        ["13", "", "", "", ""],
        ["14", "", "", "", ""],
      ];

      const ws = XLSX.utils.aoa_to_sheet(templateData);

      // Thiết lập khổ A5 và styling
      ws["!cols"] = [
        { wch: 8 }, // Cột A
        { wch: 8 }, // Cột B
        { wch: 20 }, // Cột C
        { wch: 8 }, // Cột D
        { wch: 15 }, // Cột E
      ];

      // Merge cells cho header
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // BIÊN BẢN NỘI DUNG DỰ THI
        { s: { r: 7, c: 2 }, e: { r: 7, c: 4 } }, // KẾT QUẢ NỘI DUNG DỰ THI
        { s: { r: 12, c: 2 }, e: { r: 12, c: 4 } }, // THÔNG TIN GIÁM ĐỊNH
        { s: { r: 21, c: 2 }, e: { r: 21, c: 4 } }, // THÔNG TIN VĐV
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Đối Kháng A5");

      // Xuất file với tên phù hợp
      const fileName = `DoiKhang_A5_${redName}_vs_${blueName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log("Xuất Excel A5 thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất Excel A5:", error);
      showError("Có lỗi xảy ra khi xuất file Excel A5!");
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
          Đang tải lịch sử...
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
                      Tỷ số
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

      {/* Action Buttons */}
      {/* <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <button
          onClick={() => {
            setOpenActions({
              isOpen: true,
              key: Constants.ACTION_MATCH_LOGS,
              row: row
            });
          }}
          className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Template Logs
        </button>

        <button
          onClick={exportToExcelA5}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel A5
        </button>
      </div> */}

      {/* Modal thông báo chung */}
      <ConfirmModal {...modalProps} />
    </div>
  );
}
// Component Phân bổ giám định
function RefereeAllocationSection({
  availableReferees,
  initialReferrers,
  onSave,
  configSystem,
}) {
  const { t } = useTranslation();
  const [selectedReferrers, setSelectedReferrers] = React.useState(() => {
    const roles = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "machine", "court"];
    const initial = {};
    roles.forEach((role) => {
      const existing = (initialReferrers || []).find((ref) => ref.role === role);
      initial[role] = existing ? existing.referee_id : "";
    });
    return initial;
  });

  const [isSkipped, setIsSkipped] = React.useState(false);

  // Lấy số lượng giám định từ configSystem
  const maxReferees = parseInt(configSystem?.data?.so_giam_dinh || 7);

  const handleRefereeChange = (role, refereeId) => {
    setSelectedReferrers((prev) => ({ ...prev, [role]: refereeId }));
  };

  const handleClearAll = () => {
    const cleared = {};
    Object.keys(selectedReferrers).forEach(k => cleared[k] = "");
    setSelectedReferrers(cleared);
  };

  const handleSaveReferrers = () => {
    if (isSkipped) {
      onSave([]); // Save empty if skipped
      return;
    }

    const referrers = Object.entries(selectedReferrers)
      .filter(([role, id]) => {
        // Chỉ lưu những GD trong phạm vi config
        if (role.startsWith("r")) {
          const idx = parseInt(role.substring(1));
          if (idx > maxReferees) return false;
        }
        return id !== "";
      })
      .map(([role, id]) => {
        const refObj = availableReferees.find((r) => r.id === parseInt(id));
        return {
          role,
          referee_id: parseInt(id),
          full_name: refObj?.full_name || "",
        };
      });
    onSave(referrers);
  };

  // Lấy danh sách ID đã được chọn để kiểm tra trùng
  const usedRefereeIds = Object.values(selectedReferrers)
    .filter(id => id !== "")
    .map(id => parseInt(id));

  return (
    <div className="bg-white dark:bg-gray-900 rounded shadow-2xl border border-blue-100 dark:border-blue-900/40 overflow-hidden">
      {/* Header Section - Light Blue Theme */}
      <div className="relative bg-blue-50/80 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800/50">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-600/10 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-blue-900 dark:text-blue-100 tracking-tight">{t("competition_detail.referee_allocation.title")}</h3>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-semibold italic opacity-80">
                {maxReferees} {t("competition_detail.referee_allocation.referee")}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 px-4 py-2 bg-blue-600/5 hover:bg-blue-600/10 rounded-full border border-blue-200 dark:border-blue-800/50 cursor-pointer transition-all group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSkipped}
                  onChange={(e) => setIsSkipped(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-blue-200 dark:bg-blue-800 rounded-full peer-checked:bg-blue-600 transition-colors shadow-inner"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </div>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-100">{t("competition_detail.referee_allocation.reset")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-6 transition-all duration-500 ${isSkipped ? "opacity-30 blur-[1px] pointer-events-none grayscale" : "opacity-100"}`}>

        {/* Section: Giám định */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
              <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-[0.2em]">
                {t("competition_detail.referee_allocation.council")} ({maxReferees})
              </h4>
            </div>
            <button
              onClick={handleClearAll}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 rounded transition-all border border-rose-100 dark:border-rose-900/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t("competition_detail.referee_allocation.clear_all")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {["r1", "r2", "r3", "r4", "r5", "r6", "r7"]
              .slice(0, maxReferees)
              .map((role, idx) => {
                let roleLabel = `${t("competition_detail.referee_allocation.referee")} ${idx + 1}`;
                let roleSub = t("competition_detail.referee_allocation.referee");
                let iconColor = "bg-blue-50 text-blue-500 shadow-inner border border-blue-100 dark:border-blue-800";

                return (
                  <div key={role} className="group flex flex-col p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded border border-blue-100/50 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded ${iconColor} flex items-center justify-center font-bold text-sm shadow-sm`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none mb-1">{roleSub}</p>
                        <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">{roleLabel}</h5>
                      </div>
                    </div>

                    <select
                      value={selectedReferrers[role]}
                      onChange={(e) => handleRefereeChange(role, e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 rounded text-sm font-bold text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-400 outline-none transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                    >
                      <option value="">-- {t("competition_detail.referee_allocation.select_referee")} --</option>
                      {availableReferees
                        .filter((ref) => ref[role] === 1)
                        .map((ref) => {
                          const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers[role] !== String(ref.id);
                          return (
                            <option key={ref.id} value={ref.id} disabled={isUsed}>
                              {ref.full_name} {isUsed ? ` (${t("competition_detail.referee_allocation.no_referee")})` : ""}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Section: Trọng tài Điều hàn */}
        <div>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-blue-100 dark:border-blue-900/30">
            <span className="w-1.5 h-6 bg-blue-400 rounded-full opacity-60"></span>
            <h4 className="text-[11px] font-black text-blue-950 dark:text-blue-400 uppercase tracking-[0.2em]">
              {t("competition_detail.referee_allocation.operational_referee")}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Trọng tài Máy */}
            <div className="flex gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-blue-900 rounded shadow-sm border border-blue-100 dark:border-blue-700 flex items-center justify-center text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">{t("competition_detail.referee_allocation.technical_support")}</p>
                <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100">{t("competition_detail.referee_allocation.machine_referee")}</h5>
                <select
                  value={selectedReferrers.machine}
                  onChange={(e) => handleRefereeChange("machine", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                >
                  <option value="">{t("competition_detail.referee_allocation.empty_option")}</option>
                  {availableReferees
                    .filter((r) => r.is_ref_machine === 1)
                    .map((ref) => {
                      const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.machine !== String(ref.id);
                      return (
                        <option key={ref.id} value={ref.id} disabled={isUsed}>
                          {ref.full_name} {isUsed ? ` (${t("competition_detail.referee_allocation.already_selected")})` : ""}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            {/* Trọng tài Sân */}
            <div className="flex gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-blue-900 rounded shadow-sm border border-blue-100 dark:border-blue-700 flex items-center justify-center text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">{t("competition_detail.referee_allocation.court_management")}</p>
                <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100">{t("competition_detail.referee_allocation.field_referee")}</h5>
                <select
                  value={selectedReferrers.court}
                  onChange={(e) => handleRefereeChange("court", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                >
                  <option value="">{t("competition_detail.referee_allocation.empty_option")}</option>
                  {availableReferees
                    .filter((r) => r.is_ref_court === 1)
                    .map((ref) => {
                      const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.court !== String(ref.id);
                      return (
                        <option key={ref.id} value={ref.id} disabled={isUsed}>
                          {ref.full_name} {isUsed ? ` (${t("competition_detail.referee_allocation.already_selected")})` : ""}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-blue-400 dark:text-blue-500 italic">
            {t("competition_detail.referee_allocation.priority_note")}
          </p>
          <button
            onClick={handleSaveReferrers}
            className="w-full sm:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded shadow-[0_10px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 border-b-4 border-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.buttons.confirm").toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
