import React from 'react';

const MiddleColumn = ({
    uiTheme,
    matchInfo,
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
    t
}) => {
    const isAtStart = timeLeft === (
        (currentRound > (matchInfo.so_hiep || 3)
            ? (matchInfo.thoi_gian_hiep_phu || 60)
            : (matchInfo.thoi_gian_thi_dau || 180)) * 10
    );

    if (uiTheme === 'custom1') {
        return (
            <div className="middle-column-high-tech flex flex-col items-center justify-center flex-shrink-0" style={{ minWidth: "320px" }}>
                {/* Match Info Header */}
                <div className="high-tech-match-info">
                    <div className="match-no">{t('scoreboard.doikhang.match_no').toUpperCase()} {matchInfo.match_no || "---"}</div>
                    <div className="match-meta">
                        <span>{matchInfo.match_type || "---"}</span>
                        <span>{matchInfo.match_weight || "---"}</span>
                    </div>
                </div>

                {/* Round Display */}
                <div className="high-tech-round-badge">
                    {currentRound > (matchInfo.so_hiep || 3)
                        ? `${t("scoreboard.doikhang.extra_round_label")} ${currentRound - (matchInfo.so_hiep || 3)}`
                        : `${t("scoreboard.doikhang.round")} ${currentRound}`}
                </div>

                {/* Status Indicator Badge */}
                <div className="flex justify-center mb-2">
                    {(() => {
                        if (isMedicalTime) return <div className="high-tech-status-badge medical">{t("scoreboard.doikhang.medical_timeout") || "Y TẾ"}</div>;
                        if (isBreakTime) return <div className="high-tech-status-badge break">{t("scoreboard.doikhang.break_time") || "NGHỈ HIỆP"}</div>;
                        if (isRunning) return <div className="high-tech-status-badge fighting">{t("scoreboard.doikhang.live") || "ĐANG THI ĐẤU"}</div>;
                        if (isAtStart) return <div className="high-tech-status-badge ready">{t("scoreboard.doikhang.ready") || "SẴN SÀNG"}</div>;
                        return <div className="high-tech-status-badge paused">{t("scoreboard.doikhang.paused") || "TẠM DỪNG"}</div>;
                    })()}
                </div>

                {/* High-Tech Timer */}
                <div className={`high-tech-timer ${isRunning ? "running" : ""} ${isBreakTime ? "break-mode" : ""}`}>
                    {(() => {
                        const time = isBreakTime ? formatTime(breakTimeLeft) : formatTime(timeLeft);
                        return (
                            <>
                                <span className="time-main">{time.main}</span>
                                <span className="time-decimal">{time.decimal}</span>
                            </>
                        );
                    })()}
                </div>

                {/* Penalties & Indicators */}
                <div className="high-tech-penalties">
                    {buttonPermissions.hien_thi_thong_tin_nhac_nho && (
                        <div className="penalty-row-high-tech">
                            <div className="penalty-value red-val">{remindRed}</div>
                            <div className="penalty-label">{t("scoreboard.doikhang.button_remind")}</div>
                            <div className="penalty-value blue-val">{remindBlue}</div>
                        </div>
                    )}
                    {buttonPermissions.hien_thi_thong_tin_canh_cao && (
                        <div className="penalty-row-high-tech">
                            <div className="penalty-value red-val">{warnRed}</div>
                            <div className="penalty-label">{t("scoreboard.doikhang.warning")}</div>
                            <div className="penalty-value blue-val">{warnBlue}</div>
                        </div>
                    )}
                    {buttonPermissions.hien_thi_thong_tin_don_chan && (
                        <div className="penalty-row-high-tech">
                            <div className="penalty-value red-val">{kickRed}</div>
                            <div className="penalty-label">{t("scoreboard.doikhang.kick")}</div>
                            <div className="penalty-value blue-val">{kickBlue}</div>
                        </div>
                    )}
                    {buttonPermissions.hien_thi_thong_tin_y_te && (
                        <div className="penalty-row-high-tech">
                            <div className="penalty-value red-val">{medicalRed}</div>
                            <div className="penalty-label">{t("scoreboard.doikhang.medical")}</div>
                            <div className="penalty-value blue-val">{medicalBlue}</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default design
    return (
        <div className="flex flex-col items-center justify-center space-y-4 px-4 flex-shrink-0" style={{ minWidth: "300px" }}>
            <p className="font-bold text-2xl">{t('scoreboard.doikhang.match_no').toUpperCase()} {matchInfo.match_no || "---"}</p>
            <p className="text-xl font-bold">{matchInfo.match_type || "---"}</p>
            <p className="text-xl font-bold">{matchInfo.match_weight || "---"}</p>
            <div className="bg-yellow-300 text-black font-bold text-2xl px-6 py-3 rounded min-w-[250px] text-center">
                {currentRound > (matchInfo.so_hiep || 3) ? `${t("scoreboard.doikhang.extra_round_label")} ${currentRound - (matchInfo.so_hiep || 3)}` : `${t("scoreboard.doikhang.round")} ${currentRound}`}
            </div>

            <div className="h-8 flex items-center justify-center">
                {(() => {
                    if (isMedicalTime) return <span className="text-red-500 font-black text-2xl animate-pulse tracking-widest">{t("scoreboard.doikhang.medical_timeout") || "Y TẾ"}</span>;
                    if (isBreakTime) return <span className="text-yellow-500 font-black text-2xl animate-pulse tracking-widest">{t("scoreboard.doikhang.break_time") || "NGHỈ GIỮA HIỆP"}</span>;
                    if (isRunning) return <span className="text-green-500 font-black text-2xl animate-bounce tracking-widest">{t("scoreboard.doikhang.live") || "ĐANG THI ĐẤU"}</span>;
                    if (isAtStart) return <span className="text-blue-500 font-black text-2xl tracking-widest">{t("scoreboard.doikhang.ready") || "SẴN SÀNG"}</span>;
                    return <span className="text-gray-500 font-black text-2xl tracking-widest">{t("scoreboard.doikhang.paused") || "TẠM DỪNG"}</span>;
                })()}
            </div>

            <div className={`font-bold px-10 py-4 rounded min-w-[300px] text-center ${!isRunning && !isBreakTime ? "bg-green-500 text-white" : "bg-white text-black"}`}>
                {(() => {
                    const time = isBreakTime ? formatTime(breakTimeLeft) : formatTime(timeLeft);
                    return (
                        <>
                            <span className="text-6xl">{time.main}</span>
                            <span className="text-3xl">{time.decimal}</span>
                        </>
                    );
                })()}
            </div>

            <div className="mt-6 space-y-2 w-full max-w-md">
                {buttonPermissions.hien_thi_thong_tin_nhac_nho && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{remindRed}</div>
                        <div className="text-yellow-400 font-bold text-base uppercase flex-1 text-center">{t("scoreboard.doikhang.button_remind")}</div>
                        <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{remindBlue}</div>
                    </div>
                )}
                {buttonPermissions.hien_thi_thong_tin_canh_cao && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{warnRed}</div>
                        <div className="text-orange-400 font-bold text-base uppercase flex-1 text-center">{t("scoreboard.doikhang.warning")}</div>
                        <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{warnBlue}</div>
                    </div>
                )}
                {buttonPermissions.hien_thi_thong_tin_don_chan && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{kickRed}</div>
                        <div className="text-cyan-400 font-bold text-base uppercase flex-1 text-center">{t("scoreboard.doikhang.kick")}</div>
                        <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{kickBlue}</div>
                    </div>
                )}
                {buttonPermissions.hien_thi_thong_tin_y_te && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{medicalRed}</div>
                        <div className="text-red-400 font-bold text-base uppercase flex-1 text-center">{t("scoreboard.doikhang.medical")}</div>
                        <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">{medicalBlue}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiddleColumn;
