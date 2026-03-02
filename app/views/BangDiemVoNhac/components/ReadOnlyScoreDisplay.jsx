import React from "react";
import VoNhacScoreDisplay from "./VoNhacScoreDisplay";
import JudgeScore from "./JudgeScore";
import TotalScore from "./TotalScore";

/**
 * ReadOnlyScoreDisplay - Component hiển thị điểm ở chế độ read-only (không có action buttons)
 * Dùng cho popup window khi nhấn F2
 */
export default function ReadOnlyScoreDisplay({ scores, configSystem, matchData }) {
  const soGiamDinh = 7;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center p-8">
      {/* Header Info */}
      <div className="w-full max-w-7xl mb-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-wide uppercase">
            {matchData?.ten_giai_dau || "GIẢI ĐẤU"}
          </h1>
          <h2 className="text-3xl font-semibold">
            {matchData?.ten_mon_thi || "MÔN THI"}
          </h2>
          <p className="text-2xl font-bold tracking-wide">
            ĐƠN VỊ: {matchData?.team_name?.toUpperCase() || ""}
          </p>
          <p className="text-xl text-yellow-300 font-semibold">
            {matchData?.match_name || ""}
          </p>
        </div>
      </div>

      {/* Score Display */}
      <div className="w-full max-w-7xl">
        <VoNhacScoreDisplay scores={scores} />
      </div>

      {/* Read-only indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-lg px-4 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-yellow-300 font-semibold">
            Màn hình phụ - Chỉ hiển thị (Nhấn F2 để đóng)
          </span>
        </div>
      </div>
    </div>
  );
}

