import React from "react";
import { getFlagImage, getDefaultFlag } from "../../utils/flagManager";

/**
 * DoiKhangDisplay - Hiển thị màn hình Đối kháng cho Secondary Display
 * Optimized for 1920x1080
 */
export default function DoiKhangDisplay({
  matchInfo,
  redScore,
  blueScore,
  timeLeft,
  currentRound,
  isRunning,
  isBreakTime,
  breakTimeLeft,
  isMedicalTime,
  medicalTimeLeft = 0,
  medicalTeam = null,
  ready = true,
  pauseMatch = false,
  lsLogo = [],
  flashingRefs = { red: {}, blue: {} },
  remindRed = 0,
  remindBlue = 0,
  warnRed = 0,
  warnBlue = 0,
  kickRed = 0,
  kickBlue = 0,
  medicalRed = 0,
  medicalBlue = 0,
  buttonPermissions = {},
  configSystem,
}) {
  // Use config from prop or from matchInfo
  const currentConfig = configSystem || matchInfo?.config_system || {};

  // Color values
  const titleColor = currentConfig.header_title_color_doikhang || '#FBBF24';
  const descColor = currentConfig.header_desc_color_doikhang || '#D1D5DB';

  // Format time helper
  const formatTime = (time) => {
    const totalSeconds = Math.floor(time / 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const deciseconds = time % 10;
    return {
      main: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      decimal: `.${deciseconds}`,
    };
  };

  // Generate GD data structure
  const generateGdData = () => {
    const soGiamDinh = matchInfo?.so_giam_dinh || 3;
    const heDiem = matchInfo?.he_diem || 2;
    const gdData = [];
    for (let i = 0; i < heDiem; i++) {
      const row = [];
      for (let j = 0; j < soGiamDinh; j++) {
        row.push(`GĐ${j + 1}`);
      }
      gdData.push(row);
    }
    return gdData;
  };

  // Render GD scores with flashing effect
  const renderGDScores = (colors, team) => {
    const teamFlashing = flashingRefs[team] || {};
    const justifyClass = team === "red" ? "justify-start" : "justify-end";
    return (
      <div className="flex flex-col gap-1 mt-2 text-white text-center text-xs font-bold">
        {colors.map((colorRow, rowIndex) => {
          const displayRow =
            team === "blue" ? [...colorRow].reverse() : colorRow;
          return (
            <div key={rowIndex} className={`flex gap-1 ${justifyClass}`}>
              {displayRow.map((gd, i) => {
                const actualIndex =
                  team === "blue" ? colorRow.length - 1 - i : i;
                const isFlashing = teamFlashing[actualIndex] === rowIndex;
                let baseColor = "";
                if (rowIndex === 0) {
                  baseColor = !isFlashing ? "bg-yellow-800" : "bg-yellow-200";
                } else if (rowIndex === 1) {
                  baseColor = !isFlashing ? "bg-green-800" : "bg-green-200";
                } else {
                  baseColor = !isFlashing ? "bg-rose-800" : "bg-rose-200";
                }
                return (
                  <div
                    key={`${rowIndex}-${actualIndex}`}
                    className={`w-8 h-8 flex items-center justify-center ${baseColor} rounded`}
                  >
                    {gd}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* CSS Animations cho hiệu ứng chiến thắng */}
      <style>{`
        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
          }
          50% {
            transform: scale(1.15);
            filter: brightness(1.3) drop-shadow(0 0 80px rgba(255, 215, 0, 1));
          }
        }

        @keyframes victoryGlow {
          0%, 100% {
            box-shadow:
              0 0 40px rgba(255, 215, 0, 0.9),
              0 0 80px rgba(255, 215, 0, 0.7),
              0 0 120px rgba(255, 215, 0, 0.5),
              inset 0 0 60px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow:
              0 0 60px rgba(255, 255, 0, 1),
              0 0 120px rgba(255, 215, 0, 0.9),
              0 0 180px rgba(255, 215, 0, 0.7),
              inset 0 0 80px rgba(255, 215, 0, 0.5);
          }
        }

        @keyframes victoryShine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes victoryBorder {
          0%, 100% {
            border-color: rgba(255, 215, 0, 1);
            border-width: 4px;
          }
          50% {
            border-color: rgba(255, 255, 0, 1);
            border-width: 8px;
          }
        }

        @keyframes victoryOverlay {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .victory-animation {
          animation:
            victoryPulse 1.2s ease-in-out infinite,
            victoryGlow 1.5s ease-in-out infinite,
            victoryBorder 1s ease-in-out infinite;
          border: 6px solid gold !important;
          position: relative;
          z-index: 100;
        }

        .victory-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 215, 0, 0.15) 0%,
            rgba(255, 255, 0, 0.35) 50%,
            rgba(255, 215, 0, 0.15) 100%
          );
          background-size: 200% auto;
          animation: victoryShine 2s linear infinite;
          border-radius: inherit;
          pointer-events: none;
          z-index: 1;
        }

        .victory-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(
            circle at center,
            rgba(255, 215, 0, 0.4) 0%,
            rgba(255, 215, 0, 0.2) 30%,
            transparent 70%
          );
          animation: victoryOverlay 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 90;
        }
      `}</style>

      {/* Victory Overlay - Toàn màn hình khi có winner */}
      {announcedWinner && <div className="victory-overlay"></div>}

      {/* Logos */}
      {lsLogo.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto mb-3 mt-3">
          <div className="flex justify-center items-center gap-8 px-8">
            {lsLogo.map((logo, index) => (
              <div
                key={logo.id || index}
                className="flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow rounded-lg"
                style={{ minWidth: "50px", maxWidth: "50px" }}
              >
                <img
                  src={
                    logo.url.startsWith("http")
                      ? logo.url
                      : `http://localhost:6789${logo.url}`
                  }
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
      ) : (
        <div className="w-full max-w-7xl mx-auto mb-6 mt-6" />
      )}

      <div className="text-center mb-8 max-w-7xl mx-auto">
        <h1
          className="text-4xl font-black leading-tight uppercase"
          style={{
            color: titleColor
          }}
        >
          {matchInfo?.ten_giai_dau?.split("\n").map((word, index) => (
            <React.Fragment key={index}>
              {word}
              {index <
                (matchInfo?.ten_giai_dau?.split(" ").length || 0) - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <div
          className="h-1 w-48 mx-auto my-4"
          style={{
            backgroundColor: titleColor
          }}
        ></div>
        <p
          className="text-3xl mt-3 font-bold uppercase tracking-wider"
          style={{
            color: descColor
          }}
        >
          {matchInfo?.ten_mon_thi}
        </p>
      </div>

      {/* Scoreboard - Optimized for 1920x1080 */}
      <div className="flex w-full max-w-7xl mx-auto justify-between items-start px-4 gap-3">
        {/* Đỏ */}
        <div className="flex-1">
          <div
            className={`text-white p-6 rounded flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden relative ${announcedWinner?.team === "red" ? "victory-animation" : ""
              }`}
            style={{
              background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
              boxShadow:
                "0 10px 40px rgba(255, 0, 0, 0.4), inset 0 -5px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded pointer-events-none"></div>

            <div
              className="text-[200px] font-black leading-none w-full text-center relative z-10"
              style={{
                lineHeight: "320px",
                textShadow:
                  "0 8px 16px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
                fontFamily: "'Arial Black', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {redScore}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <div
                className="h-20 w-20 mr-4 flex justify-center items-center overflow-hidden rounded shadow-lg relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                  border: "1px solid rgba(255, 255, 255, 1)",
                }}
              >
                <img
                  src={getFlagImage(matchInfo?.red?.country)}
                  alt={matchInfo?.red?.country || "Vietnam"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultFlag();
                  }}
                />
              </div>
              <div className="flex-1 text-left text-white relative z-10">
                <p
                  className="text-xl font-black mb-1 uppercase tracking-wide"
                  style={{
                    textShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {matchInfo?.red?.name || "VĐV ĐỎ"}
                </p>
                <p
                  className="text-lg font-semibold opacity-95"
                  style={{
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                  }}
                >
                  {matchInfo?.red?.unit || ""}
                </p>
              </div>
            </div>
          </div>
          {/* GD Scores for Red */}
          {renderGDScores(generateGdData(), "red")}
        </div>

        {/* Giữa */}
        <div
          className="flex flex-col items-center justify-center space-y-4 px-4 flex-shrink-0"
          style={{ minWidth: "300px" }}
        >
          <p className="font-bold text-2xl">
            TRẬN SỐ {matchInfo?.match_no || "---"}
          </p>
          <p className="text-xl font-bold">{matchInfo?.match_type || "---"}</p>
          <p className="text-xl font-bold">
            {matchInfo?.match_weight || "---"}
          </p>

          {/* Timer display */}
          <div className="bg-yellow-300 text-black font-bold text-2xl px-6 py-3 rounded shadow-lg min-w-[250px] text-center">
            {currentRound > (matchInfo?.so_hiep || 3)
              ? `HIỆP PHỤ ${currentRound - (matchInfo?.so_hiep || 3)}`
              : `HIỆP ${currentRound}`}
          </div>
          <div
            className={`font-bold px-10 py-4 rounded shadow-lg min-w-[300px] text-center ${!isRunning && !isBreakTime
              ? "bg-green-500 text-white"
              : "bg-white text-black"
              }`}
          >
            {(() => {
              const time = formatTime(timeLeft);
              return (
                <>
                  <span className="text-6xl">{time.main}</span>
                  <span className="text-3xl">{time.decimal}</span>
                </>
              );
            })()}
          </div>

          {/* Information Display - Nhắc nhở, Cảnh cáo, Đòn chân, Y tế - Giữa màn hình */}
          <div className="mt-6 space-y-2 w-full max-w-md">
            {/* Nhắc nhở */}
            {buttonPermissions.hien_thi_thong_tin_nhac_nho && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {remindRed}
                </div>
                <div className="text-yellow-400 font-bold text-base uppercase flex-1 text-center">
                  Nhắc nhở
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {remindBlue}
                </div>
              </div>
            )}

            {/* Cảnh cáo */}
            {buttonPermissions.hien_thi_thong_tin_canh_cao && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {warnRed}
                </div>
                <div className="text-orange-400 font-bold text-base uppercase flex-1 text-center">
                  Cảnh cáo
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {warnBlue}
                </div>
              </div>
            )}

            {/* Đòn chân */}
            {buttonPermissions.hien_thi_thong_tin_don_chan && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {kickRed}
                </div>
                <div className="text-cyan-400 font-bold text-base uppercase flex-1 text-center">
                  Đòn chân
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {kickBlue}
                </div>
              </div>
            )}

            {/* Y tế */}
            {buttonPermissions.hien_thi_thong_tin_y_te && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {medicalRed}
                </div>
                <div className="text-red-400 font-bold text-base uppercase flex-1 text-center">
                  Y tế
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {medicalBlue}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Xanh */}
        <div className="flex-1">
          <div
            className={`text-white p-6 rounded flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden relative ${announcedWinner?.team === "blue" ? "victory-animation" : ""
              }`}
            style={{
              background: "linear-gradient(135deg, #0000FF 0%, #0000CC 100%)",
              boxShadow:
                "0 10px 40px rgba(0, 0, 255, 0.4), inset 0 -5px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded pointer-events-none"></div>

            <div
              className="text-[200px] font-black leading-none w-full text-center relative z-10"
              style={{
                lineHeight: "320px",
                textShadow:
                  "0 8px 16px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
                fontFamily: "'Arial Black', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {blueScore}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <div className="flex-1 text-right text-white relative z-10">
                <p
                  className="text-xl font-black mb-1 uppercase tracking-wide"
                  style={{
                    textShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {matchInfo?.blue?.name || "VĐV XANH"}
                </p>
                <p
                  className="text-lg font-semibold opacity-95"
                  style={{
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                  }}
                >
                  {matchInfo?.blue?.unit || ""}
                </p>
              </div>
              <div
                className="h-20 w-20 ml-4 flex justify-center items-center overflow-hidden rounded shadow-lg relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #0000FF 0%, #0000CC 100%)",
                  border: "1px solid rgba(255, 255, 255, 1)",
                }}
              >
                <img
                  src={getFlagImage(matchInfo?.blue?.country)}
                  alt={matchInfo?.blue?.country || "Vietnam"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getDefaultFlag();
                  }}
                />
              </div>
            </div>
          </div>
          {/* GD Scores for Blue */}
          {renderGDScores(generateGdData(), "blue")}
        </div>
      </div>

      {/* Medical Time Overlay */}
      {isMedicalTime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center">
            <div className="mb-3">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-1 rounded-full">
                <p className="text-2xl font-bold">
                  {currentRound > (matchInfo?.so_hiep || 3)
                    ? `HIỆP PHỤ ${currentRound - (matchInfo?.so_hiep || 3)}`
                    : `HIỆP ${currentRound}`}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-2 rounded-full">
                <p className="text-3xl font-bold tracking-wider">
                  THỜI GIAN Y TẾ
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div
                className={`inline-block px-10 py-3 rounded-2xl ${medicalTeam === "red" ? "bg-red-700" : "bg-blue-700"} shadow-lg`}
              >
                <p className="text-4xl font-black">
                  {medicalTeam === "red"
                    ? matchInfo?.red?.name || "VĐV ĐỎ"
                    : matchInfo?.blue?.name || "VĐV XANH"}
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-center bg-black/20 backdrop-blur-sm rounded-2xl px-12 py-6">
              <span className="text-8xl font-black tabular-nums">
                {formatTime(medicalTimeLeft).main}
              </span>
              <span className="text-5xl font-bold text-blue-200 tabular-nums">
                {formatTime(medicalTimeLeft).decimal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Break Time Overlay - Nghỉ giữa hiệp */}
      {isBreakTime && !isMedicalTime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="text-center">
            <div className="mb-3">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-1 rounded-full">
                <p className="text-2xl font-bold">
                  {currentRound > (matchInfo?.so_hiep || 3)
                    ? `HIỆP PHỤ ${currentRound - (matchInfo?.so_hiep || 3)}`
                    : `HIỆP ${currentRound}`}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-2 rounded-full">
                <p className="text-3xl font-bold tracking-wider">
                  NGHỈ GIỮA HIỆP
                </p>
              </div>
            </div>
            <div className="flex items-baseline justify-center bg-black/20 backdrop-blur-sm rounded-2xl px-12 py-6">
              <span className="text-8xl font-black tabular-nums">
                {formatTime(breakTimeLeft).main}
              </span>
              <span className="text-5xl font-bold text-blue-200 tabular-nums">
                {formatTime(breakTimeLeft).decimal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Banner tạm ngưng giữa trận - chỉ hiển thị trong hiệp thi đấu */}
      {!pauseMatch &&
        !isRunning &&
        !isBreakTime &&
        !isMedicalTime &&
        !ready && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white px-16 py-10 rounded-3xl shadow-2xl border-4 border-yellow-300">
              <div className="text-center">
                <div className="mb-3">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-1 rounded-full">
                    <p className="text-2xl font-bold">
                      {currentRound > (matchInfo?.so_hiep || 3)
                        ? `HIỆP PHỤ ${currentRound - (matchInfo?.so_hiep || 3)}`
                        : `HIỆP ${currentRound}`}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-2 rounded-full">
                    <p className="text-3xl font-bold tracking-wider">
                      TẠM NGƯNG
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline justify-center bg-black/20 backdrop-blur-sm rounded-2xl px-12 py-6">
                  <span className="text-8xl font-black tabular-nums">
                    {formatTime(timeLeft).main}
                  </span>
                  <span className="text-5xl font-bold text-blue-200 tabular-nums">
                    {formatTime(timeLeft).decimal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
