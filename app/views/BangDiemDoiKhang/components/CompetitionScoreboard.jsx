import React from 'react';
import AthleteCard from './AthleteCard';
import MiddleColumn from './MiddleColumn';

const CompetitionScoreboard = ({
    matchInfo,
    redScore,
    blueScore,
    announcedWinner,
    showRedKickIndicator,
    showBlueKickIndicator,
    currentRound,
    isMedicalTime,
    isBreakTime,
    isRunning,
    timeLeft,
    breakTimeLeft,
    formatTime,
    buttonPermissions,
    remindRed,
    remindBlue,
    warnRed,
    warnBlue,
    kickRed,
    kickBlue,
    medicalRed,
    medicalBlue,
    getFlagImage,
    getDefaultFlag,
    formatMatchName,
    renderGDScores,
    generateGdData,
    t
}) => {
    const uiTheme = matchInfo.config_system?.ui_theme || 'default';
    const displayMode = matchInfo.config_system?.gd_display_mode || "vertical";

    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex w-full max-w-7xl justify-between items-stretch px-4 gap-3 relative">
                {/* Render Dọc (Absolute) - Đã đưa vào trong container relative để bám sát thẻ VĐV regardless of resolution */}
                {displayMode === 'vertical' && (
                    <>
                        {renderGDScores(generateGdData(), "red")}
                        {renderGDScores(generateGdData(), "blue")}
                    </>
                )}
                {/* RED ATHLETE CARD */}
                <AthleteCard
                    team="red"
                    matchInfo={matchInfo}
                    uiTheme={uiTheme}
                    score={redScore}
                    announcedWinner={announcedWinner}
                    showKickIndicator={showRedKickIndicator}
                    getFlagImage={getFlagImage}
                    getDefaultFlag={getDefaultFlag}
                    formatMatchName={formatMatchName}
                    t={t}
                >
                    {displayMode === 'horizontal' && renderGDScores(generateGdData(), "red")}
                </AthleteCard>

                {/* Giữa */}
                <MiddleColumn
                    uiTheme={uiTheme}
                    matchInfo={matchInfo}
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
                    t={t}
                />

                {/* BLUE ATHLETE CARD */}
                <AthleteCard
                    team="blue"
                    matchInfo={matchInfo}
                    uiTheme={uiTheme}
                    score={blueScore}
                    announcedWinner={announcedWinner}
                    showKickIndicator={showBlueKickIndicator}
                    getFlagImage={getFlagImage}
                    getDefaultFlag={getDefaultFlag}
                    formatMatchName={formatMatchName}
                    t={t}
                >
                    {displayMode === 'horizontal' && renderGDScores(generateGdData(), "blue")}
                </AthleteCard>
            </div>
        </div>
    );
};

export default CompetitionScoreboard;
