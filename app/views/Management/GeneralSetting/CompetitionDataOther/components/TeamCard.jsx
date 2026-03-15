import React from "react";
import { useTranslation } from "react-i18next";
import { Constants } from "../../../../../common/Constants";

// Component Card cho mỗi đội/VĐV thi đấu
export default function TeamCard({
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
      label: t("competition_data_other.status_waiting"),
      color:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
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
    },
    IN: {
      label: t("competition_data_other.status_in_progress"),
      color:
        "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
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
    },
    FIN: {
      label: t("competition_data_other.status_finished"),
      color:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    CAN: {
      label: t("competition_data_other.status_cancelled"),
      color:
        "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const typeColors = {
    DOL: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-300 dark:border-purple-700",
      name: t("competition_data_other.type_doi_luyen"),
    },
    SOL: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-300 dark:border-green-700",
      name: t("competition_data_other.type_song_luyen"),
    },
    TUV: {
      bg: "bg-orange-100 dark:bg-orange-900",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
      name: t("competition_data_other.type_tu_ve"),
    },
    DAL: {
      bg: "bg-pink-100 dark:bg-pink-900",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-300 dark:border-pink-700",
      name: t("competition_data_other.type_da_luyen"),
    },
    VON: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-300 dark:border-yellow-700",
      name: t("competition_data_other.type_vo_nhac"),
    },
  };

  const currentStatus = statusConfig[status] || statusConfig["WAI"];
  const typeColor = typeColors[row.match_type] || typeColors["DOL"];
  const availableActions = getActionsByStatus(status, row.match_type);

  // List View - Compact horizontal layout
  if (viewMode === "list") {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden group relative flex h-full"
        onDoubleClick={() => onDoubleClick(row)}
      >
        <div className="flex items-center gap-4 p-4 w-full">
          {/* STT */}
          <div className="flex-shrink-0">
            <div
              className={`${typeColor.bg} ${typeColor.text} ${typeColor.border} border-1 rounded px-4 py-2 font-bold text-base min-w-[50px] text-center`}
            >
              {Number(row.match_no)}
            </div>
          </div>

          {/* Nội dung thi */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div
              className={`px-3 py-1.5 rounded font-bold text-xs ${typeColor.bg} ${typeColor.text} border-1 ${typeColor.border}`}
            >
              {row.match_name || typeColor.name}
            </div>
          </div>

          {/* VĐV tham gia */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t("competition_data_other.athletes_participating")}:
            </div>
            {row.athletes && row.athletes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {row.athletes.slice(0, 3).map((athlete, idx) => (
                  <div
                    key={`${row.match_id || row.match_no || "match"}-athlete-${idx}`}
                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm truncate max-w-[150px]">
                      {athlete.athlete_name}
                    </span>
                  </div>
                ))}
                {row.athletes.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                    +{row.athletes.length - 3} {t("competition_data_other.others")}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                {t("competition_data_other.no_athletes")}
              </span>
            )}
          </div>

          {/* Đơn vị */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t("competition_data_other.unit")}:
            </div>
            <div
              className={`px-3 py-1 rounded font-semibold text-sm ${typeColor.bg} ${typeColor.text}`}
            >
              {row.team_name || "-"}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="flex-shrink-0 flex items-center justify-center w-28">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {status === "IN" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "IN" ? "bg-blue-500" : status === "FIN" ? "bg-green-500" : status === "WAI" ? "bg-amber-500" : "bg-gray-400"}`}></span>
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{currentStatus.label}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2 border-l border-gray-100 dark:border-gray-700/60 pl-4 ml-2">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => {
                let actionStyle = "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700";

                if (action.key === Constants.ACTION_MATCH_START) actionStyle = "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50";
                if (action.key === Constants.ACTION_MATCH_RESULT) actionStyle = "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/50";
                if (action.key === Constants.ACTION_DELETE) actionStyle = "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50";

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      action.callback(row);
                    }}
                    key={action.key}
                    title={action.btnText}
                    className={`
                      flex items-center justify-center
                      h-8 w-8 rounded
                      border
                      transition-colors duration-200
                      ${actionStyle}
                    `}
                  >
                    {React.cloneElement(action.icon, { className: "h-3.5 w-3.5" })}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Card layout
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden group relative flex flex-col h-full"
      onDoubleClick={() => onDoubleClick(row)}
    >
      {/* Header - STT và Trạng thái */}
      <div
        className={`${typeColor.bg} px-4 py-3 border-b-2 ${typeColor.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`${typeColor.bg} ${typeColor.text} border-2 ${typeColor.border} rounded px-3 py-1.5 font-bold text-sm`}
            >
              {Number(row.match_no)}
            </div>
            <div
              className={`px-3 py-1 rounded font-bold text-xs ${typeColor.bg} ${typeColor.text}`}
            >
              {row.match_name || typeColor.name}
            </div>
          </div>
        </div>
      </div>

      {/* Body - Thông tin VĐV và Đơn vị */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-auto">
          {/* Đơn vị */}
          <div
            className={`${typeColor.bg} rounded p-4 border-2 ${typeColor.border} mb-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${typeColor.text}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <h3
                className={`text-sm font-bold ${typeColor.text} uppercase tracking-wide`}
              >
                {t("competition_data_other.unit")}
              </h3>
            </div>
            <div className={`font-bold ${typeColor.text} text-lg`}>
              {row.team_name || "-"}
            </div>
          </div>

          {/* VĐV tham gia */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded p-4 border-2 border-blue-200 dark:border-blue-700 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-700 dark:text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                {t("competition_data_other.athletes_participating")}
              </h3>
              {row.athletes && row.athletes.length > 0 && (
                <span className="ml-auto bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {row.athletes.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {row.athletes && row.athletes.length > 0 ? (
                row.athletes.map((athlete, idx) => (
                  <div
                    key={`${row.match_id || row.match_no || "match"}-athlete-card-${idx}`}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded p-2"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-blue-900 dark:text-blue-200 truncate">
                        {athlete.athlete_name || "-"}
                      </div>
                      {athlete.athlete_unit && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {athlete.athlete_unit}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 py-2">
                  {t("competition_data_other.no_athletes")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trạng thái Mini */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {status === "IN" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "IN" ? "bg-blue-500" : status === "FIN" ? "bg-green-500" : status === "WAI" ? "bg-amber-500" : "bg-gray-400"}`}></span>
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currentStatus.label}</span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="border-t border-gray-100 dark:border-gray-700/60 pt-3 mt-1 pl-1">
          <div className="flex items-center gap-2 flex-wrap">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => {
                let actionStyle = "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700";

                if (action.key === Constants.ACTION_MATCH_START) actionStyle = "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50";
                if (action.key === Constants.ACTION_MATCH_RESULT) actionStyle = "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/50";
                if (action.key === Constants.ACTION_DELETE) actionStyle = "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50";

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onDoubleClick
                      action.callback(row);
                    }}
                    key={action.key}
                    title={action.btnText}
                    className={`
                      flex items-center justify-center
                      h-8 w-8 rounded
                      border
                      transition-colors duration-200
                      ${actionStyle}
                    `}
                  >
                    {React.cloneElement(action.icon, { className: "h-3.5 w-3.5" })}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
