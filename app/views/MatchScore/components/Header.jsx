import React from "react";

export default function Header({ title, desc, logos }) {
  return (
    <div className="text-center text-white mb-8 w-full max-w-6xl">
      {/* Logo Vovinam - 6 ô vuông */}
      {/* <div className="flex justify-center items-center gap-3 mb-6">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg transform rotate-45 border-2 border-yellow-300 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400">
          <span className="text-2xl font-black text-white">V</span>
        </div>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg transform rotate-45 border-2 border-blue-300 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div> */}
      {/* Thiết kế hiển thị danh sách Logo - Căn giữa hàng ngang */}
      {logos.length > 0 && (
        <div className="w-full max-w-7xl mx-auto mb-6 mt-6">
          <div className="flex justify-center items-center gap-8 px-8">
            {logos.map((logo, index) => (
              <div
                key={logo.id || index}
                className="flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow"
                style={{ minWidth: "75px", maxWidth: "75px" }}
              >
                <img
                  src={logo.url}
                  alt={`Logo ${index + 1}`}
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="bg-gradient-to-r from-transparent via-white/10 to-transparent py-4 px-6 rounded-xl backdrop-blur-sm">
        <h1 className="text-4xl font-black tracking-wider mb-2 bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl">
          {title}
        </h1>
        <p className="text-xl font-bold tracking-wide text-yellow-300 drop-shadow-lg">
          {desc}
        </p>
      </div>

      {/* Decorative line */}
      <div className="mt-4 flex justify-center gap-2">
        <div className="h-1 w-20 bg-gradient-to-r from-transparent to-yellow-500 rounded-full"></div>
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 via-red-500 to-blue-500 rounded-full"></div>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
      </div>
    </div>
  );
}
