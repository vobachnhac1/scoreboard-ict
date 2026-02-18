import React from "react";

export default function TotalScore({ total, main, ...props }) {
  if (main) {
    return (
      <div className="relative group" {...props}>
        {/* Main card - Tăng chiều ngang */}
        <div className="bg-orange-500 rounded w-[350px] h-[160px] flex flex-col items-center justify-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-[2px] border-yellow-400 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_50px_rgba(234,88,12,0.6)] ring-4 ring-yellow-500/30">
          {/* Total label */}
          <div className="absolute rounded -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 px-2 py-2  shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
            <p className="text-base font-black tracking-[0.3em] text-white drop-shadow-lg">
              TỔNG ĐIỂM
            </p>
          </div>

          {/* Total score */}
          <p className="text-[120px] font-black mt-2 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-tight">
            {total}
          </p>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
      </div>
    );
  }

  return (
    <div className="relative group" {...props}>
      {/* Main card - Tăng chiều ngang */}
      <div className="bg-orange-500 rounded w-[400px] flex flex-col items-center justify-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-[2px] border-yellow-400 transform transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_50px_rgba(234,88,12,0.6)] ring-4 ring-yellow-500/30">
        {/* Total label */}
        <div className="absolute rounded -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 px-2 py-2  shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
          <p className="text-base font-black tracking-[0.3em] text-white drop-shadow-lg">
            TỔNG ĐIỂM
          </p>
        </div>

        {/* Total score */}
        <p className="text-[150px] font-black mt-2 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-tight">
          {total}
        </p>

        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-4 border-l-4 border-yellow-300 rounded-tl"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-t-4 border-r-4 border-yellow-300 rounded-tr"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-4 border-l-4 border-yellow-300 rounded-bl"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-4 border-r-4 border-yellow-300 rounded-br"></div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
    </div>
  );
}
