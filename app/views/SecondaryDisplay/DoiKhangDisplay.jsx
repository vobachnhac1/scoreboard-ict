import React from "react";
import { useTranslation } from "react-i18next";
import { getFlagImage, getDefaultFlag } from "../../utils/flagManager";
import { formatMatchName } from "../../utils/nameFormatter";
import CompetitionScoreboard from "../BangDiemDoiKhang/components/CompetitionScoreboard";
import ScoreboardHeader from "../BangDiemDoiKhang/components/ScoreboardHeader";
import JudgeScoreBlock from "../BangDiemDoiKhang/components/JudgeScoreBlock";
import MedicalTimeOverlay from "../BangDiemDoiKhang/components/MedicalTimeOverlay";
import BreakTimeOverlay from "../BangDiemDoiKhang/components/BreakTimeOverlay";
import PauseMatchOverlay from "../BangDiemDoiKhang/components/PauseMatchOverlay";

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
  announcedWinner = null,
  showRedKickIndicator = false,
  showBlueKickIndicator = false,
}) {
  const { t } = useTranslation();

  // Combine matchInfo with configSystem if necessary
  const effectiveMatchInfo = {
    ...matchInfo,
    config_system: configSystem || matchInfo?.config_system || {}
  };

  const uiTheme = effectiveMatchInfo.config_system?.ui_theme || 'default';

  // Format time helper (Maintains object structure for component compatibility)
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
    const soGiamDinh = effectiveMatchInfo.config_system?.so_giam_dinh || effectiveMatchInfo?.so_giam_dinh || 3;
    const heDiem = effectiveMatchInfo.config_system?.he_diem || effectiveMatchInfo?.he_diem || 2;
    const gdData = [];
    for (let i = 0; i < heDiem; i++) {
      const row = [];
      for (let j = 0; j < soGiamDinh; j++) {
        row.push(`${t('scoreboard.doikhang.referrer_name')}${j + 1}`);
      }
      gdData.push(row);
    }
    return gdData;
  };

  // Render GD scores with flashing effect using JudgeScoreBlock
  const renderGDScores = (colors, team, forceMode = null) => {
    const displayMode = forceMode || effectiveMatchInfo.config_system?.gd_display_mode || "vertical";
    const soGiamDinh = effectiveMatchInfo.config_system?.so_giam_dinh || effectiveMatchInfo?.so_giam_dinh || 3;
    const heDiem = effectiveMatchInfo.config_system?.he_diem || effectiveMatchInfo?.he_diem || 2;
    const uiTheme = effectiveMatchInfo.config_system?.ui_theme || 'default';

    return (
      <JudgeScoreBlock
        colors={colors}
        team={team}
        matchInfo={effectiveMatchInfo}
        displayMode={displayMode}
        soGiamDinh={soGiamDinh}
        heDiem={heDiem}
        uiTheme={uiTheme}
        teamFlashing={flashingRefs[team] || {}}
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
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
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
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
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
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

      {/* Victory Overlay */}
      {announcedWinner && <div className="victory-overlay"></div>}

      {/* Logos and Header */}
      <ScoreboardHeader
        matchInfo={effectiveMatchInfo}
        matchData={null}
        lsLogo={lsLogo}
      />

      {/* Main Scoreboard Section */}
      <CompetitionScoreboard
        matchInfo={effectiveMatchInfo}
        redScore={redScore}
        blueScore={blueScore}
        announcedWinner={announcedWinner}
        showRedKickIndicator={showRedKickIndicator}
        showBlueKickIndicator={showBlueKickIndicator}
        currentRound={currentRound}
        isMedicalTime={isMedicalTime}
        isBreakTime={isBreakTime}
        isRunning={isRunning}
        timeLeft={timeLeft}
        breakTimeLeft={breakTimeLeft}
        formatTime={formatTime}
        buttonPermissions={buttonPermissions}
        remindRed={remindRed}
        remindBlue={remindBlue}
        warnRed={warnRed}
        warnBlue={warnBlue}
        kickRed={kickRed}
        kickBlue={kickBlue}
        medicalRed={medicalRed}
        medicalBlue={medicalBlue}
        getFlagImage={getFlagImage}
        getDefaultFlag={getDefaultFlag}
        formatMatchName={formatMatchName}
        renderGDScores={renderGDScores}
        generateGdData={generateGdData}
        t={t}
      />

      {/* Full-screen Overlays */}
      {effectiveMatchInfo.config_system?.hien_thi_medical_time_overlay && (
        <MedicalTimeOverlay
          isMedicalTime={isMedicalTime}
          medicalTeam={medicalTeam}
          medicalTimeLeft={medicalTimeLeft}
          currentRound={currentRound}
          matchInfo={effectiveMatchInfo}
          formatTime={formatTime}
          t={t}
          uiTheme={uiTheme}
        />
      )}

      {effectiveMatchInfo.config_system?.hien_thi_break_time_overlay && (
        <BreakTimeOverlay
          isBreakTime={isBreakTime}
          breakTimeLeft={breakTimeLeft}
          currentRound={currentRound}
          matchInfo={effectiveMatchInfo}
          formatTime={formatTime}
          t={t}
          uiTheme={uiTheme}
        />
      )}

      {effectiveMatchInfo.config_system?.hien_thi_pause_match_overlay && (
        <PauseMatchOverlay
          pauseMatch={pauseMatch}
          isRunning={isRunning}
          isBreakTime={isBreakTime}
          isMedicalTime={isMedicalTime}
          ready={ready}
          currentRound={currentRound}
          matchInfo={effectiveMatchInfo}
          timeLeft={timeLeft}
          formatTime={formatTime}
          t={t}
          uiTheme={uiTheme}
          announcedWinner={announcedWinner}
        />
      )}
    </div>
  );
}
