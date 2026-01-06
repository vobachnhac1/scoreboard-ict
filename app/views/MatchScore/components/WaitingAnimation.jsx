import React from "react";

/**
 * WaitingAnimation Component
 * Animation hiển thị khi đang chờ nhập điểm
 * @param {string} message - Message to display (default: "Đang chờ nhập điểm...")
 * @param {string} variant - Animation variant: "pulse", "dots", "spinner", "wave" (default: "pulse")
 * @param {string} size - Size: "sm", "md", "lg" (default: "md")
 */
export default function WaitingAnimation({ 
  message = "Đang chờ nhập điểm...", 
  variant = "pulse",
  size = "md" 
}) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl"
  };

  const renderAnimation = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );

      case "spinner":
        return (
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-yellow-400/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin"></div>
          </div>
        );

      case "wave":
        return (
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-3 h-12 bg-gradient-to-t from-yellow-400 to-red-500 rounded-full animate-wave"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case "pulse":
      default:
        return (
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 w-24 h-24 bg-yellow-400/20 rounded-full animate-ping"></div>
            {/* Middle ring */}
            <div className="absolute inset-0 w-24 h-24 bg-yellow-400/30 rounded-full animate-pulse"></div>
            {/* Inner circle */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-4xl">⏱️</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Animation */}
      <div className="flex items-center justify-center">
        {renderAnimation()}
      </div>

      {/* Message */}
      <div className="text-center">
        <p className={`${sizeClasses[size]} font-bold text-white drop-shadow-lg animate-pulse`}>
          {message}
        </p>
        <p className="text-lg text-yellow-300 mt-2">
          Vui lòng nhập điểm từ thiết bị giám định
        </p>
      </div>

      {/* Decorative elements */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

