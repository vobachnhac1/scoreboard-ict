import React from "react";
import { useTranslation } from "react-i18next";
import { formatMatchName } from "../../../../../utils/nameFormatter";

// Component Card cho mỗi trận đấu
export default function MatchCard({
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
              {formatMatchName(row.data[3], t) || "—"}
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
              {React.cloneElement(action.icon, { className: "h-4 w-4" })}{' '}
              <span className="ml-2 text-[10px] font-bold uppercase tracking-tight">{action.btnText}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
