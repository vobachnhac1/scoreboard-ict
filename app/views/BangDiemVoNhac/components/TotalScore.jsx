import React from "react";

export default function TotalScore({ total, ...props }) {
  return (
    <div className="relative group" {...props}>
      {/* Main card */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 rounded-2xl w-40 h-36 flex flex-col items-center justify-center text-white shadow-2xl border-4 border-yellow-400 transform transition-all duration-300 hover:scale-110 hover:shadow-orange-500/60">
        {/* Total label */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-600 px-5 py-1.5 rounded-full border-2 border-yellow-300 shadow-lg">
          <p className="text-sm font-black tracking-widest">TỔNG ĐIỂM</p>
        </div>

        {/* Total score */}
        <p className="text-7xl font-black mt-4 drop-shadow-2xl animate-pulse">{total}</p>

        {/* Decorative stars */}
        <div className="absolute top-2 left-2 text-yellow-300 text-xl">⭐</div>
        <div className="absolute top-2 right-2 text-yellow-300 text-xl">⭐</div>
        <div className="absolute bottom-2 left-2 text-yellow-300 text-xl">⭐</div>
        <div className="absolute bottom-2 right-2 text-yellow-300 text-xl">⭐</div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
    </div>
  );
}
