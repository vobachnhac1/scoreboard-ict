import React from 'react';

const RefereeStatusBoard = ({
    matchInfo,
    referrerDevices,
    showCompetitionBoard,
    setShowCompetitionBoard,
    showControlBar,
    setShowControlBar,
    setShowConnectionModal,
    t
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 ">
            <div className="max-w-[1920px] mx-auto px-2 p-3">
                <div className="flex items-center justify-between text-xs">
                    {/* Left: Statistics */}
                    <div className="flex items-center gap-6">
                        <span className="text-gray-400">
                            {t("scoreboard.doikhang.statistics_total")}:{" "}
                            <span className="text-white font-bold text-sm">
                                {matchInfo.config_system?.so_giam_dinh || 3}
                            </span>
                        </span>
                        <span className="text-gray-400">
                            {t("scoreboard.doikhang.statistics_ready")}:{" "}
                            <span className="text-green-400 font-bold text-sm">
                                {referrerDevices.filter((s) => s.ready).length}
                            </span>
                        </span>
                        <span className="text-gray-400">
                            {t("scoreboard.doikhang.statistics_connected")}:{" "}
                            <span className="text-yellow-400 font-bold text-sm">
                                {referrerDevices.filter((s) => s.connected && !s.ready).length}
                            </span>
                        </span>

                        {/* Layout Switch - Independent Buttons */}
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-700">
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
                                <button
                                    onClick={() => setShowCompetitionBoard(!showCompetitionBoard)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${showCompetitionBoard
                                        ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-[0_4px_15px_rgba(0,0,255,0.3)] scale-100"
                                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${showCompetitionBoard ? "bg-white animate-pulse" : "bg-gray-600"}`}></div>
                                    {t("scoreboard.doikhang.competition_mode")}
                                </button>
                                <button
                                    onClick={() => setShowControlBar(!showControlBar)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${showControlBar
                                        ? "bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-[0_4px_15px_rgba(147,51,234,0.3)] scale-100"
                                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${showControlBar ? "bg-white animate-pulse" : "bg-gray-600"}`}></div>
                                    {t("scoreboard.doikhang.management_mode")}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Center: Individual GĐ Indicators */}
                    <div className="flex items-center gap-2">
                        {Array.from(
                            { length: matchInfo.config_system?.so_giam_dinh || 3 },
                            (_, index) => {
                                const gdNumber = index + 1;
                                const device = referrerDevices.find((d) => Number(d.referrer) === gdNumber);
                                const isReady = device?.ready || false;
                                const bgColor = isReady ? "bg-green-500" : "bg-red-500";
                                const textColor = "text-white";

                                return (
                                    <div
                                        key={gdNumber}
                                        className={`${bgColor} ${textColor} font-bold px-3 py-1.5 rounded text-sm min-w-[50px] text-center `}
                                        title={
                                            isReady
                                                ? `${t('scoreboard.doikhang.referrer_name')}${gdNumber}: ${t("scoreboard.doikhang.referee_ready")}`
                                                : `${t('scoreboard.doikhang.referrer_name')}${gdNumber}: ${t("scoreboard.doikhang.referee_not_ready")}`
                                        }
                                    >
                                        {t('scoreboard.doikhang.referrer_name')}{gdNumber}
                                    </div>
                                );
                            },
                        )}
                    </div>

                    {/* Right: Ready Indicator & Connection Button */}
                    <div className="flex items-center gap-4">
                        {referrerDevices.filter((s) => s.ready).length === (matchInfo.config_system?.so_giam_dinh || 3) ? (
                            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500 rounded px-4 py-2">
                                <span className="text-green-400 font-bold text-sm">{t("scoreboard.doikhang.all_ready")}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded px-4 py-2 animate-pulse">
                                <span className="text-yellow-400 font-bold text-sm">{t("scoreboard.doikhang.waiting_referees")}</span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowConnectionModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm font-bold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            {t("scoreboard.doikhang.connection_status")} ({referrerDevices.filter((s) => s.ready).length}/{matchInfo.config_system?.so_giam_dinh || 3})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefereeStatusBoard;
