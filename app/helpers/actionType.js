/**
 * Helper functions cho ActionType
 * Tái sử dụng cho Vovinam, CompetitionDataDetail, và các component khác
 */

/**
 * Lấy tên hiển thị của actionType
 * @param {string} type - Loại action
 * @returns {string} - Tên hiển thị
 */
export const getActionTypeLabel = (type) => {
  const types = {
    score: "Ghi điểm",
    remind: "Nhắc nhở",
    warn: "Cảnh cáo",
    kick: "Truất quyền",
    medical: "Y tế",
    timer: "Thời gian",
    winner: "Người thắng",
    fall: "Ngã",
    win: "Thắng",
    out: "Biên",
    reset: "Reset",
    finish: "Kết thúc",
  };
  return types[type] || type;
};

/**
 * Lấy class màu sắc cho actionType badge
 * @param {string} type - Loại action
 * @returns {string} - Tailwind CSS classes
 */
export const getActionTypeColorClass = (type) => {
  const colorClasses = {
    score: "bg-green-100 text-green-800",
    remind: "bg-blue-100 text-blue-800",
    warn: "bg-yellow-100 text-yellow-800",
    kick: "bg-red-100 text-red-800",
    medical: "bg-pink-100 text-pink-800",
    fall: "bg-orange-100 text-orange-800",
    out: "bg-indigo-100 text-indigo-800",
    win: "bg-purple-100 text-purple-800",
    winner: "bg-purple-100 text-purple-800",
    timer: "bg-cyan-100 text-cyan-800",
    finish: "bg-gray-100 text-gray-800",
    reset: "bg-gray-100 text-gray-800",
  };
  return colorClasses[type] || "bg-gray-100 text-gray-800";
};

/**
 * Lấy class màu sắc cho actionType badge với border
 * @param {string} type - Loại action
 * @returns {string} - Tailwind CSS classes với border
 */
export const getActionTypeColorClassWithBorder = (type) => {
  const colorClasses = {
    score: "bg-green-100 text-green-800 border border-green-200",
    remind: "bg-blue-100 text-blue-800 border border-blue-200",
    warn: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    kick: "bg-red-100 text-red-800 border border-red-200",
    medical: "bg-pink-100 text-pink-800 border border-pink-200",
    fall: "bg-orange-100 text-orange-800 border border-orange-200",
    out: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    win: "bg-purple-100 text-purple-800 border border-purple-200",
    winner: "bg-purple-100 text-purple-800 border border-purple-200",
    timer: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    finish: "bg-gray-100 text-gray-800 border border-gray-200",
    reset: "bg-gray-100 text-gray-800 border border-gray-200",
  };
  return colorClasses[type] || "bg-gray-100 text-gray-800 border border-gray-200";
};

/**
 * Danh sách tất cả các actionType
 */
export const ACTION_TYPES = {
  SCORE: "score",
  REMIND: "remind",
  WARN: "warn",
  KICK: "kick",
  MEDICAL: "medical",
  TIMER: "timer",
  WINNER: "winner",
  FALL: "fall",
  WIN: "win",
  OUT: "out",
  RESET: "reset",
  FINISH: "finish",
};

