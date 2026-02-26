import React, { useState, useEffect, useRef } from "react";
import VoNhacScoreDisplay from "../BangDiemVoNhac/components/VoNhacScoreDisplay";
import JudgeScore from "../BangDiemVoNhac/components/JudgeScore";
import TotalScore from "../BangDiemVoNhac/components/TotalScore";
import Header from "../BangDiemVoNhac/components/Header";
import DoiKhangDisplay from "./DoiKhangDisplay";

/**
 * SecondaryDisplay - Màn hình phụ hiển thị điểm (Electron BrowserWindow riêng)
 * Nhận dữ liệu từ main process qua IPC
 */
export default function SecondaryDisplay() {
  // State để lưu trữ dữ liệu điểm
  const scoreDataRef = useRef({
    scores: {},
    configSystem: { so_giam_dinh: 5 },
    matchData: {},
    screenType: "quyen", // 'quyen', 'vonhac', 'doikhang'
    // Đối kháng data
    matchInfo: {},
    redScore: 0,
    blueScore: 0,
    timeLeft: 0,
    currentRound: 1,
    isRunning: false,
    isBreakTime: false,
    breakTimeLeft: 0,
    isMedicalTime: false,
    medicalTimeLeft: 0,
    medicalTeam: null,
    ready: true,
    pauseMatch: false,
    flashingRefs: { red: {}, blue: {} },
    remindRed: 0,
    remindBlue: 0,
    warnRed: 0,
    warnBlue: 0,
    kickRed: 0,
    kickBlue: 0,
    medicalRed: 0,
    medicalBlue: 0,
    buttonPermissions: {},
    announcedWinner: null,
  });
  const soGiamDinhRef = useRef(5);

  const [lsLogo, setLsLogo] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Trigger re-render

  // Fetch logos
  const fetchLogos = async () => {
    try {
      const response = await fetch("http://localhost:6789/api/config/logos");
      const data = await response.json();
      if (data.success) {
        setLsLogo(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching logos:", error);
    }
  };

  useEffect(() => {
    // Fetch logos khi component mount
    fetchLogos();

    // Lắng nghe dữ liệu từ main process
    if (window.electron && window.electron.onUpdateScoreData) {
      console.log(" Setting up onUpdateScoreData listener");

      window.electron.onUpdateScoreData((data) => {
        console.log(" Received score data:", data);
        console.log(" screenType:", data?.screenType);
        console.log(" scores:", data?.scores);

        scoreDataRef.current = data;
        soGiamDinhRef.current =
          data.screenType == "vonhac" ? 7 : data?.configSystem?.so_giam_dinh;

        // Update logos if provided
        if (data.lsLogo) {
          setLsLogo(data.lsLogo);
        }

        // xoá key judge
        if (data.scores) {
          const newScores = {
            hidden: data?.scores?.hidden,
            total: data?.scores?.total,
          };
          Object.keys(data.scores).forEach((key) => {
            //  soGiamDinhRef.current =3 thì xoá 4 5 67 | soGiamDinhRef.current = 5xoá 6 7
            if (soGiamDinhRef.current === 3) {
              if (key.includes("judge")) {
                if (
                  key !== "judge4" &&
                  key !== "judge5" &&
                  key !== "judge6" &&
                  key !== "judge7"
                ) {
                  newScores[key] = data.scores[key];
                }
              }
            } else if (soGiamDinhRef.current === 5) {
              if (key.includes("judge")) {
                if (key !== "judge6" && key !== "judge7") {
                  newScores[key] = data.scores[key];
                }
              }
            } else {
              newScores[key] = data.scores[key];
            }
          });
          scoreDataRef.current.scores = newScores;
        }

        // Trigger re-render
        setUpdateTrigger((prev) => prev + 1);
        console.log(" Data updated, triggering re-render");
      });

      // Cleanup
      return () => {
        if (
          window.electron &&
          window.electron.removeSecondaryDisplayListeners
        ) {
          window.electron.removeSecondaryDisplayListeners();
        }
      };
    }
  }, []);

  const {
    scores,
    configSystem,
    matchData,
    screenType,
    matchInfo,
    redScore,
    blueScore,
    timeLeft,
    currentRound,
    isRunning,
    isBreakTime,
    breakTimeLeft,
    isMedicalTime,
    medicalTimeLeft,
    medicalTeam,
    ready,
    pauseMatch,
    flashingRefs,
    remindRed,
    remindBlue,
    warnRed,
    warnBlue,
    kickRed,
    kickBlue,
    medicalRed,
    medicalBlue,
    buttonPermissions,
    announcedWinner,
  } = scoreDataRef.current;

  // Không cần tính toán - nhận điểm đã tính từ màn hình chính
  // scores.total và scores.hidden (maxIndex, minIndex) đã được tính sẵn

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-900 to-blue-900 text-white flex flex-col items-center p-2">
      {screenType === "doikhang" ? (
        // Đối kháng layout - no header, just scoreboard
        <>
          <DoiKhangDisplay
            matchInfo={matchInfo}
            redScore={redScore}
            blueScore={blueScore}
            timeLeft={timeLeft}
            currentRound={currentRound}
            isRunning={isRunning}
            isBreakTime={isBreakTime}
            breakTimeLeft={breakTimeLeft}
            isMedicalTime={isMedicalTime}
            medicalTimeLeft={medicalTimeLeft}
            medicalTeam={medicalTeam}
            ready={ready}
            pauseMatch={pauseMatch}
            lsLogo={lsLogo}
            flashingRefs={flashingRefs}
            remindRed={remindRed}
            remindBlue={remindBlue}
            warnRed={warnRed}
            warnBlue={warnBlue}
            kickRed={kickRed}
            kickBlue={kickBlue}
            medicalRed={medicalRed}
            medicalBlue={medicalBlue}
            buttonPermissions={buttonPermissions}
            announcedWinner={announcedWinner}
          />
        </>
      ) : (
        // Quyền and Võ Nhạc layout - with header
        <>
          <Header
            title={matchData?.ten_giai_dau || "GIẢI VÔ ĐỊCH"}
            desc={matchData?.ten_mon_thi || "VÕ HIỆN ĐẠI"}
            logos={lsLogo}
          />

          {/* Match Name & Team Name */}
          <div className="w-full m-4 flex flex-row justify-center">
            <div className="px-6 py-4 shadow-2xl">
              <p className="text-start text-2xl font-bold tracking-wide">
                NỘI DUNG:{" "}
                {matchData?.match_name?.toUpperCase() ||
                  matchData?.match_type?.toUpperCase() ||
                  ""}
              </p>
            </div>
            <div className="px-6 py-4 shadow-2xl">
              <p className="text-start text-2xl font-bold tracking-wide">
                ĐƠN VỊ: {matchData?.team_name?.toUpperCase() || ""}
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="w-full max-w-7xl mt-6">
            {soGiamDinhRef.current === 7 ? (
              <VoNhacScoreDisplay scores={scores} />
            ) : (
              // Layout for 3 or 5 judges
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-wrap justify-center gap-8">
                  {Object.entries(scores)
                    .filter(([key]) => key.includes("judge"))
                    .map(([key, value], index) => {
                      // Kiểm tra xem điểm này có bị loại không (cao nhất hoặc thấp nhất)
                      const isHighest = scores.hidden?.maxIndex === index;
                      const isLowest = scores.hidden?.minIndex === index;
                      return (
                        <JudgeScore
                          key={key}
                          judge={key.replace("judge", "")}
                          score={value}
                          isHighest={isHighest}
                          isLowest={isLowest}
                        />
                      );
                    })}
                </div>
                <div className="flex justify-center mt-2">
                  <TotalScore total={scores.total || 0} />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 text-gray-400 text-sm opacity-50">
        Digisports - NhacVo
      </div>
    </div>
  );
}
