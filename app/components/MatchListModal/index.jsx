import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getFlagImage } from "../../utils/flagManager";
import { formatMatchName } from "../../utils/nameFormatter";

/**
 * Modal hiển thị danh sách trận đấu
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {array} matches - Danh sách trận đấu
 * @param {function} onSelectMatch - Callback khi chọn trận
 * @param {function} onStartMatch - Callback khi bắt đầu trận
 * @param {number} currentMatchId - ID trận đang thi đấu
 * @param {boolean} isTeamMatch - True nếu là team match (SOL/TUV/DAL/DOL), false nếu là individual match (DK)
 */
const MatchListModal = ({
  isOpen,
  onClose,
  matches = [],
  onSelectMatch,
  onStartMatch,
  currentMatchId = null,
  isTeamMatch = false,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, ONGOING, FINISHED
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Filter matches based on search and status
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      searchTerm === "" ||
      match.match_no?.toString().includes(searchTerm) ||
      match.red_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.blue_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.match_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" &&
        (match.status === "PENDING" || match.status === "WAI")) ||
      (filterStatus === "ONGOING" &&
        (match.status === "ONGOING" || match.status === "IN")) ||
      (filterStatus === "FINISHED" &&
        (match.status === "FINISHED" || match.status === "FIN"));

    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: {
        bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
        label: t("match_list.status_pending"),
      },
      WAI: {
        bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
        label: t("match_list.status_pending"),
      },
      ONGOING: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
        label: t("match_list.status_ongoing"),
      },
      IN: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
        label: t("match_list.status_ongoing"),
      },
      FINISHED: {
        bg: "bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-500",
        label: t("match_list.status_finished"),
      },
      FIN: {
        bg: "bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20",
        text: "text-gray-600 dark:text-gray-400",
        dot: "bg-gray-500",
        label: t("match_list.status_finished"),
      },
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
        {badge.label}
      </span>
    );
  };

  // Handle select match
  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
    if (onSelectMatch) {
      onSelectMatch(match);
    }
  };

  // Handle start match
  const handleStartMatch = (match) => {
    if (onStartMatch) {
      onStartMatch(match);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header - Professional Minimalist */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("match_list.title")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t("match_list.total_matches", { count: filteredMatches.length })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-transparent focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("match_list.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-shadow placeholder-gray-400 dark:placeholder-gray-500"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg">
              {[
                { key: "ALL", label: t("match_list.filter_all") },
                { key: "PENDING", label: t("match_list.filter_pending") },
                { key: "ONGOING", label: t("match_list.filter_ongoing") },
                { key: "FINISHED", label: t("match_list.filter_finished") },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === filter.key
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-gray-900/30 p-4 md:p-6">
          {filteredMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4"
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
              <p className="text-lg font-semibold">{t("match_list.no_matches")}</p>
              <p className="text-sm">{t("match_list.try_filter")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMatches.map((match) => (
                <MatchCard
                  key={match.id || match.match_no}
                  match={match}
                  isSelected={selectedMatch?.id === match.id}
                  isCurrent={currentMatchId === match.id}
                  onSelect={() => handleSelectMatch(match)}
                  onStart={() => handleStartMatch(match)}
                  getStatusBadge={getStatusBadge}
                  isTeamMatch={isTeamMatch}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Professional Action Bar */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700/80">
          <div className="text-sm">
            {selectedMatch ? (
              <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                {t("match_list.selected_match", { number: selectedMatch.match_no })}
              </span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {t("match_list.click_to_view")}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
          >
            {t("match_list.close")}
          </button>
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// Match Card Component
const MatchCard = ({
  match,
  isSelected,
  isCurrent,
  onSelect,
  onStart,
  getStatusBadge,
  isTeamMatch = false,
}) => {
  const { t } = useTranslation();
  const redFlag = getFlagImage(match.red_country || "vietnam");
  const blueFlag = getFlagImage(match.blue_country || "vietnam");

  // Nếu là team match, hiển thị danh sách VĐV
  if (isTeamMatch) {
    return (
      <div
        onClick={onSelect}
        className={`group relative bg-white dark:bg-gray-800 rounded-xl border transition-all cursor-pointer ${isSelected
          ? "border-blue-500 shadow-md ring-1 ring-blue-500/20"
          : isCurrent
            ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/10"
            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/80"
          }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700/50 pb-3">
            {/* Match Number & Status */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-2.5 py-1 font-bold text-sm border border-gray-200 dark:border-gray-600">
                {t("match_list.match_number", { number: match.match_no })}
              </div>
              {getStatusBadge(match.status)}
              {isCurrent && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-emerald-200 dark:border-emerald-800/50">
                  {t("match_list.status_ongoing")}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {(match.status === "PENDING" || match.status === "WAI") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart();
                  }}
                  className="px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                >
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
                  {t("match_list.start")}
                </button>
              )}
              {(match.status === "ONGOING" || match.status === "IN") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart();
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("match_list.view")}
                </button>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {match.team_name || t("match_list.team")}
            </div>
            {match.match_name && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {match.match_name}
              </div>
            )}
            {match.match_type && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t("match_list.type")}: {match.match_type}
              </div>
            )}
          </div>

          {/* Athletes List */}
          {match.athletes && match.athletes.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {t("match_list.athletes_list", { count: match.athletes.length })}
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {match.athletes.map((athlete, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {index + 1}.
                    </span>
                    <span className="font-medium">
                      {athlete.name || athlete.athlete_name}
                    </span>
                    {(athlete.unit || athlete.athlete_unit) && (
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({athlete.unit || athlete.athlete_unit})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Individual match (DK) - hiển thị như cũ

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border transition-all cursor-pointer ${isSelected
        ? "border-blue-500 shadow-md ring-1 ring-blue-500/20"
        : isCurrent
          ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/10"
          : "border-gray-200 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-gray-600 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/80"
        }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700/50 pb-3">
          {/* Match Number & Status */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-2.5 py-1 font-bold text-sm border border-gray-200 dark:border-gray-600">
              Trận {match.match_no}
            </div>
            {getStatusBadge(match.status)}
            {isCurrent && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-emerald-200 dark:border-emerald-800/50">
                Đang đấu
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {match.status === "PENDING" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
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
                {t("match_list.start")}
              </button>
            )}
            {match.status === "ONGOING" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("match_list.view")}
              </button>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Red Corner */}
          <div className="flex items-center gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
            <img
              src={redFlag}
              alt={t("match_list.red_flag_alt")}
              className="w-7 h-5 object-cover rounded shadow-sm border border-black/5"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-red-600/80 dark:text-red-400/80 uppercase mb-0.5 tracking-wider">
                {t("match_list.red_corner")}
              </div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {formatMatchName(match.red_name, t) || "-"}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {match.red_unit || match.team_name || "-"}
              </div>
            </div>
            {match.winner === "RED" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>

          {/* Blue Corner */}
          <div className="flex items-center gap-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <img
              src={blueFlag}
              alt={t("match_list.blue_flag_alt")}
              className="w-7 h-5 object-cover rounded shadow-sm border border-black/5"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-blue-600/80 dark:text-blue-400/80 uppercase mb-0.5 tracking-wider">
                {t("match_list.blue_corner")}
              </div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {formatMatchName(match.blue_name, t) || "-"}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {match.blue_unit || match.team_name || "-"}
              </div>
            </div>
            {match.winner === "BLUE" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {match.match_name && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
            {match.match_name}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchListModal;
