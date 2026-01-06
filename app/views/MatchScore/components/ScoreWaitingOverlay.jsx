import React, { useState, useEffect } from "react";

/**
 * ScoreWaitingOverlay Component
 * Full-screen overlay với animation đẹp khi chờ nhập điểm
 * @param {boolean} show - Show/hide overlay
 * @param {string} message - Custom message
 * @param {number} judgeCount - Số lượng giám định (3 hoặc 5)
 * @param {Array} receivedScores - Array of received judge scores [1, 2, 3, ...]
 */
export default function ScoreWaitingOverlay({ 
  show = false, 
  message = "Đang chờ nhập điểm từ giám định",
  judgeCount = 5,
  receivedScores = []
}) {
  const [dots, setDots] = useState("");

  // Animated dots
  useEffect(() => {
    if (!show) return;
    
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-2xl w-full mx-4">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-yellow-500/50 p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {message}{dots}
            </h2>
            <p className="text-yellow-300 text-lg">
              Vui lòng chờ giám định nhập điểm
            </p>
          </div>

          {/* Judge Status Grid */}
          <div className={`grid grid-cols-${judgeCount} gap-4 mb-8`}>
            {Array.from({ length: judgeCount }).map((_, index) => {
              const judgeNum = index + 1;
              const hasScore = receivedScores.includes(judgeNum);

              return (
                <div
                  key={judgeNum}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-500
                    ${hasScore 
                      ? 'bg-green-500/20 border-green-500 scale-105' 
                      : 'bg-gray-700/50 border-gray-600 animate-pulse'
                    }
                  `}
                >
                  {/* Judge Icon */}
                  <div className="text-center mb-2">
                    <div className={`
                      w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl
                      ${hasScore 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-600 text-gray-400'
                      }
                    `}>
                      {hasScore ? '✓' : '⏱️'}
                    </div>
                  </div>

                  {/* Judge Label */}
                  <p className={`
                    text-center font-bold
                    ${hasScore ? 'text-green-400' : 'text-gray-400'}
                  `}>
                    GĐ {judgeNum}
                  </p>

                  {/* Status */}
                  <p className={`
                    text-xs text-center mt-1
                    ${hasScore ? 'text-green-300' : 'text-gray-500'}
                  `}>
                    {hasScore ? 'Đã nhập' : 'Chờ...'}
                  </p>

                  {/* Pulse animation for waiting */}
                  {!hasScore && (
                    <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/30 animate-ping"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Tiến độ</span>
              <span>{receivedScores.length}/{judgeCount} giám định</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-500 rounded-full"
                style={{ width: `${(receivedScores.length / judgeCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Central Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Outer ring */}
              <div className="absolute inset-0 w-32 h-32 bg-yellow-400/10 rounded-full animate-ping"></div>
              {/* Middle ring */}
              <div className="absolute inset-0 w-32 h-32 bg-yellow-400/20 rounded-full animate-pulse"></div>
              {/* Inner circle */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-6xl">⏱️</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Hệ thống sẽ tự động cập nhật khi nhận được điểm
            </p>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg"></div>
      </div>
    </div>
  );
}

