import React from "react";

export default function JudgeScore({ judge, score, isHighest = false, isLowest = false }) {
  // Xác định màu sắc dựa trên điểm cao nhất/thấp nhất
  const isGrayed = isHighest || isLowest;

  // Màu cho card
  const cardBgColor = isGrayed
    ? "bg-gradient-to-br from-gray-400 to-gray-600"
    : "bg-gradient-to-br from-sky-400 to-sky-600";

  const borderColor = isGrayed
    ? "border-gray-300"
    : "border-sky-300";

  const hoverShadow = isGrayed
    ? "hover:shadow-gray-500/50"
    : "hover:shadow-sky-500/50";

  // Màu cho label
  const labelBgColor = isGrayed
    ? "bg-gray-700"
    : "bg-sky-700";

  const labelBorderColor = isGrayed
    ? "border-gray-300"
    : "border-sky-300";

  // Màu cho glow effect
  const glowColor = isGrayed
    ? "bg-gray-400"
    : "bg-sky-400";

  return (
    <div className="relative group">
      {/* Main card */}
      <div className={`${cardBgColor} rounded-2xl w-40 h-40 flex flex-col items-center justify-center text-white shadow-2xl border-4 ${borderColor} transform transition-all duration-300 hover:scale-105 ${hoverShadow}`}>
        {/* Judge label */}
        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${labelBgColor} px-4 py-1 rounded-full border-2 ${labelBorderColor}`}>
          <p className="text-xs font-bold tracking-wider text-center">GIÁM ĐỊNH {judge}</p>
        </div>

        {/* Score */}
        <p className="text-6xl font-black mt-4 drop-shadow-lg">{score}</p>

        {/* Decorative corner - Chỉ hiện khi không bị gạch */}
        {!isGrayed && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        )}

        {/* Badge cho điểm cao nhất/thấp nhất */}
        {/* {isHighest && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 px-3 py-1 rounded-full border-2 border-red-300 shadow-lg">
            <p className="text-xs font-black text-white">CAO NHẤT</p>
          </div>
        )} */}
        {/* {isLowest && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 px-3 py-1 rounded-full border-2 border-red-300 shadow-lg">
            <p className="text-xs font-black text-white">THẤP NHẤT</p>
          </div>
        )} */}
      </div>

      {/* Glow effect on hover */}
      <div className={`absolute inset-0 ${glowColor} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`}></div>
    </div>
  );
}
