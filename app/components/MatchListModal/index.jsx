import React, { useState, useEffect } from "react";
import { getFlagImage } from "../../utils/flagManager";

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
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-700 dark:text-yellow-300",
        label: "Chờ thi đấu",
      },
      WAI: {
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-700 dark:text-yellow-300",
        label: "Chờ thi đấu",
      },
      ONGOING: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-700 dark:text-green-300",
        label: "Đang thi đấu",
      },
      IN: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-700 dark:text-green-300",
        label: "Đang thi đấu",
      },
      FINISHED: {
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-700 dark:text-gray-300",
        label: "Đã kết thúc",
      },
      FIN: {
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-700 dark:text-gray-300",
        label: "Đã kết thúc",
      },
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-t-xl">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
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
            <div>
              <h2 className="text-2xl font-bold text-white">
                Danh sách trận đấu
              </h2>
              <p className="text-sm text-blue-100">
                Tổng số: {filteredMatches.length} trận
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số trận, tên VĐV, đội..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "PENDING", label: "Chờ thi đấu" },
                { key: "ONGOING", label: "Đang thi đấu" },
                { key: "FINISHED", label: "Đã kết thúc" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === filter.key
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto p-4">
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
              <p className="text-lg font-semibold">Không tìm thấy trận đấu</p>
              <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </div>
          ) : (
            <div className="space-y-3">
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMatch ? (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Đã chọn: Trận {selectedMatch.match_no}
                </span>
              ) : (
                <span>Chọn một trận để xem chi tiết</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
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
  const redFlag = getFlagImage(match.red_country || "vietnam");
  const blueFlag = getFlagImage(match.blue_country || "vietnam");

  // Nếu là team match, hiển thị danh sách VĐV
  if (isTeamMatch) {
    return (
      <div
        onClick={onSelect}
        className={`group relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
          isSelected
            ? "border-blue-500 shadow-lg"
            : isCurrent
              ? "border-green-500 shadow-md"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
        }`}
      >
        {/* Current Match Badge */}
        {isCurrent && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
            Đang thi đấu
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Match Number */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-lg px-4 py-2 font-bold text-lg shadow-md">
                Trận {match.match_no}
              </div>
              {getStatusBadge(match.status)}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {(match.status === "PENDING" || match.status === "WAI") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Bắt đầu
                </button>
              )}
              {(match.status === "ONGOING" || match.status === "IN") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  Xem
                </button>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="mb-3">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {match.team_name || "Đội"}
            </div>
            {match.match_name && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {match.match_name}
              </div>
            )}
            {match.match_type && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Loại: {match.match_type}
              </div>
            )}
          </div>

          {/* Athletes List */}
          {match.athletes && match.athletes.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Danh sách VĐV ({match.athletes.length})
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
      className={`group relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
        isSelected
          ? "border-blue-500 shadow-lg"
          : isCurrent
            ? "border-green-500 shadow-md"
            : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
      }`}
    >
      {/* Current Match Badge */}
      {isCurrent && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          Đang thi đấu
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Match Number */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-lg px-4 py-2 font-bold text-lg shadow-md">
              Trận {match.match_no}
            </div>
            {getStatusBadge(match.status)}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {match.status === "PENDING" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Bắt đầu
              </button>
            )}
            {match.status === "ONGOING" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                Xem
              </button>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Red Corner */}
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <img
              src={redFlag}
              alt="Red flag"
              className="w-8 h-6 object-cover rounded shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-1">
                Đỏ
              </div>
              <div className="font-bold text-gray-900 dark:text-white truncate">
                {match.red_name || "-"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {match.red_unit || match.team_name || "-"}
              </div>
            </div>
            {match.winner === "RED" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>

          {/* Blue Corner */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <img
              src={blueFlag}
              alt="Blue flag"
              className="w-8 h-6 object-cover rounded shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
                Xanh
              </div>
              <div className="font-bold text-gray-900 dark:text-white truncate">
                {match.blue_name || "-"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {match.blue_unit || match.team_name || "-"}
              </div>
            </div>
            {match.winner === "BLUE" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-500"
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
