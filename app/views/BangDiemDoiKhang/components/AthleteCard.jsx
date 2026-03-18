import React from 'react';

const AthleteCard = ({
    team,
    matchInfo,
    uiTheme = 'default',
    score,
    announcedWinner,
    showKickIndicator,
    getFlagImage,
    getDefaultFlag,
    formatMatchName,
    t,
    children
}) => {
    const isRed = team === "red";
    const athleteInfo = isRed ? matchInfo.red : matchInfo.blue;

    // --- 1. THEME MẶC ĐỊNH (Khôi phục theo code cũ) ---
    if (uiTheme === 'default') {
        const bgGradient = isRed
            ? "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)"
            : "linear-gradient(135deg, #0000FF 0%, #00008B 100%)";

        const shadowColor = isRed ? "rgba(255, 0, 0, 0.4)" : "rgba(0, 0, 255, 0.4)";

        return (
            <div className="flex-1 flex flex-col">
                <div
                    className={`text-white p-6 rounded flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden relative ${announcedWinner === team ? "victory-animation scale-[1.02]" : ""}`}
                    style={{
                        background: bgGradient,
                        boxShadow: `0 10px 40px ${shadowColor}, inset 0 -5px 20px rgba(0, 0, 0, 0.2)`,
                    }}
                >
                    {/* Score Display */}
                    <div
                        className="text-[200px] font-black leading-none w-full text-center relative z-10"
                        style={{
                            lineHeight: "320px",
                            textShadow: "0 8px 16px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
                            fontFamily: "'Arial Black', sans-serif",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {score}
                    </div>

                    {/* Kick Indicator */}
                    {showKickIndicator && matchInfo.config_system?.hien_thi_thong_tin_don_chan && (
                        <div className={`absolute bottom-4 ${isRed ? 'right-4' : 'left-4'} z-50 animate-in zoom-in fade-in duration-300`}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                                <img
                                    src={matchInfo.config_system?.[isRed ? 'kick_logo_red' : 'kick_logo_blue'] || "/assets/image_donchan.jpg"}
                                    alt="Don chan"
                                    className="w-12 h-12 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] object-cover relative z-10"
                                    onError={(e) => { e.target.src = "/assets/image_donchan.jpg"; }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Athlete Footer Info */}
                    <div className={`flex items-center w-full mt-4 ${!isRed ? 'flex-row-reverse text-right' : ''}`}>
                        <div
                            className={`h-20 w-20 flex justify-center items-center overflow-hidden rounded relative z-10 ${isRed ? 'mr-4' : 'ml-4'}`}
                            style={{
                                background: bgGradient,
                                border: "1px solid rgba(255, 255, 255, 1)",
                            }}
                        >
                            <img
                                src={getFlagImage(athleteInfo?.country)}
                                alt={athleteInfo?.country || "Vietnam"}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = getDefaultFlag(team); }}
                            />
                        </div>
                        <div className="flex-1 text-white relative z-10">
                            <p
                                className="text-xl font-black mb-1 uppercase tracking-wide leading-tight py-1"
                                style={{
                                    textShadow: "0 4px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)",
                                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                                    fontWeight: "900",
                                }}
                            >
                                {athleteInfo?.name || (isRed ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team"))}
                            </p>
                            <p
                                className="text-lg font-semibold opacity-95"
                                style={{
                                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                                }}
                            >
                                {athleteInfo?.unit || ""}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Render cụm đèn giám định */}
                <div className="mt-2">
                    {children}
                </div>
            </div>
        );
    }

    // --- 2. THEME CUSTOM 1 (High-Tech, Hiện đại) ---
    const teamColor = isRed ? "red" : "blue";
    const cardBgClass = isRed
        ? "bg-red-950/20 shadow-[inset_0_0_80px_rgba(220,38,38,0.15)] border-red-500/30"
        : "bg-blue-950/20 shadow-[inset_0_0_80px_rgba(37,99,235,0.15)] border-blue-500/30";

    const scoreGradient = isRed
        ? "from-red-400 via-white to-red-400"
        : "from-blue-400 via-white to-blue-400";

    return (
        <div className={`flex-1 flex flex-col group relative transition-all duration-700 ${announcedWinner === team ? 'scale-[1.02]' : ''}`}>
            {/* Athlete Name & Country Header */}
            <div className={`mb-4 flex items-center gap-4 min-h-[60px] ${!isRed ? 'flex-row-reverse text-right' : ''}`}>
                <div className="relative shrink-0">
                    <img
                        src={getFlagImage(athleteInfo?.country) || getDefaultFlag(team)}
                        alt={athleteInfo?.country}
                        className="w-16 h-10 object-cover rounded shadow-2xl border border-white/20"
                    />
                    <div className="absolute -inset-1 bg-white/5 blur-sm -z-10"></div>
                </div>
                <div className="flex-1">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight py-1">
                        {athleteInfo?.name || (isRed ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team"))}
                    </h2>
                    <p className="text-sm font-bold text-white/40 tracking-[0.2em]">{athleteInfo?.unit || "VIET NAM"}</p>
                </div>
            </div>

            {/* Main Information Card */}
            <div className={`relative min-h-[380px] rounded-2xl border-2 overflow-hidden backdrop-blur-3xl transition-all duration-500 group-hover:border-white/30 ${cardBgClass} flex flex-col shadow-2xl`}>
                <div className={`absolute top-0 ${isRed ? 'left-0' : 'right-0'} w-full h-full bg-gradient-to-br ${isRed ? 'from-red-500/5 to-transparent' : 'from-blue-500/5 to-transparent'} pointer-events-none`}></div>

                {/* Match Information */}
                <div className={`p-4 border-b border-white/5 flex justify-between items-center bg-black/20 ${!isRed ? 'flex-row-reverse' : ''}`}>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-white italic tracking-tight">{formatMatchName(matchInfo.match_name)}</span>
                    </div>
                </div>

                {/* Score Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative px-6 py-8">
                    <div className="relative">
                        <div className={`absolute inset-0 bg-${teamColor}-600/20 blur-[80px] opacity-100`}></div>
                        <div className="relative flex flex-col items-center">
                            <div className={`text-[180px] font-black leading-none bg-gradient-to-b ${scoreGradient} bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] tabular-nums`}>
                                {score}
                            </div>
                        </div>
                    </div>

                    {/* Kick Indicator (Dùng logo giống default - Vị trí mép trong phía dưới) */}
                    {showKickIndicator && matchInfo.config_system?.hien_thi_thong_tin_don_chan && (
                        <div className={`absolute bottom-6 ${isRed ? 'right-6' : 'left-6'} z-50 animate-pulse`}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                                <img
                                    src={matchInfo.config_system?.[isRed ? 'kick_logo_red' : 'kick_logo_blue'] || "/assets/image_donchan.jpg"}
                                    alt="Don chan"
                                    className="w-14 h-14 rounded-full border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] object-cover relative z-10"
                                    onError={(e) => { e.target.src = "/assets/image_donchan.jpg"; }}
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-white uppercase tracking-tighter bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 z-20">
                                    KICK POINT
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Winner Overlay */}
                    {announcedWinner === team && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-fadeIn">
                            <div className="w-32 h-32 bg-yellow-400 text-black flex items-center justify-center rounded-2xl shadow-[0_0_80px_rgba(250,204,21,0.6)] rotate-3 border-4 border-white/50">
                                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="mt-8 text-5xl font-black text-yellow-400 uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] italic">WINNER</span>
                        </div>
                    )}
                </div>

                <div className="h-2 w-full flex opacity-50">
                    <div className={`h-full ${isRed ? 'w-32 bg-red-500' : 'w-full bg-white/5'}`}></div>
                    <div className={`h-full ${isRed ? 'flex-1 bg-white/5' : 'w-32 bg-blue-500'}`}></div>
                </div>
            </div>

            {/* Render children (JudgeScoreBlock horizontal) */}
            <div className="mt-4">
                {children}
            </div>
        </div>
    );
};

export default AthleteCard;
