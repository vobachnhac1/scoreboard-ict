import React from 'react';

const JudgeScoreBlock = ({ colors = [[]], team, matchInfo, teamFlashing, displayMode: propDisplayMode, heDiem: propHeDiem, uiTheme = 'default' }) => {
    const displayMode = propDisplayMode || matchInfo.config_system?.gd_display_mode || "vertical";
    const heDiem = Number(propHeDiem || matchInfo.config_system?.he_diem || 2);
    const isRed = team === "red";
    const numJudges = Number(colors[0]?.length || matchInfo.config_system?.so_giam_dinh || 3);
    const judgeOrder = Array.from({ length: numJudges }).map((_, i) => !isRed ? (numJudges - 1 - i) : i);

    const isCustom = uiTheme === 'custom1';

    // --- LOGIC MÀU SẮC THEO THEME ---
    const getPointStyle = (pointIdx, isFlashing, isHorizontal = false) => {
        if (!isCustom) {
            // THEME MẶC ĐỊNH: Ô vuông đơn giản, màu rực
            const size = isHorizontal ? "w-10 h-10" : "w-12 h-12";
            const bgNone = "bg-gray-800/40 text-white/20 border-white/10";
            let bgActive = "";
            let textColor = "text-white";

            if (pointIdx === 0) bgActive = "bg-yellow-400 text-black";
            else if (pointIdx === 1) bgActive = "bg-green-500 text-white";
            else bgActive = "bg-red-600 text-white";

            return {
                baseClass: `${isFlashing ? bgActive : bgNone} ${size} text-2xl font-black flex items-center justify-center border-2`,
                isFlashing
            };
        }

        // THEME CUSTOM 1: High-Tech (Hiện tại đang đúng)
        // Nếu là dọc (vertical), người dùng muốn "chiều cao dài hơn" (h-14 thay vì h-11)
        const size = isHorizontal ? "w-10 h-10" : "w-10 h-14";
        const fontSize = isHorizontal ? "text-lg" : "text-xl";
        const rounded = isHorizontal ? "rounded-xl" : "rounded-none";

        if (pointIdx === 0) { // Vàng
            return {
                baseClass: !isFlashing
                    ? `bg-amber-950/40 text-amber-500/30 border-amber-500/10 ${size} ${fontSize} ${rounded}`
                    : `bg-gradient-to-br from-amber-300 to-amber-500 text-black border-white shadow-[0_0_20px_rgba(251,191,36,0.8)] ${size} ${fontSize} ${rounded}`,
                isFlashing
            };
        } else if (pointIdx === 1) { // Xanh lá
            return {
                baseClass: !isFlashing
                    ? `bg-emerald-950/40 text-emerald-500/30 border-emerald-500/10 ${size} ${fontSize} ${rounded}`
                    : `bg-gradient-to-br from-emerald-300 to-emerald-500 text-black border-white shadow-[0_0_20px_rgba(52,211,153,0.8)] ${size} ${fontSize} ${rounded}`,
                isFlashing
            };
        } else { // Đỏ
            return {
                baseClass: !isFlashing
                    ? `bg-rose-950/40 text-rose-500/30 border-rose-500/10 ${size} ${fontSize} ${rounded}`
                    : `bg-gradient-to-br from-rose-400 to-rose-600 text-white border-white shadow-[0_0_20px_rgba(239,68,68,0.8)] ${size} ${fontSize} ${rounded}`,
                isFlashing
            };
        }
    };

    // --- CHẾ ĐỘ NGANG (Dưới thẻ VĐV) ---
    if (displayMode === "horizontal") {
        return (
            <div className={`flex flex-col gap-2 mt-[10px] w-full animate-fadeIn ${isRed ? 'items-start' : 'items-end'}`}>
                <div className={`flex gap-2 ${!isRed ? 'flex-row-reverse' : ''}`}>
                    {judgeOrder.map((actualIdx) => (
                        <div key={actualIdx} className="w-10 text-center text-[12px] font-black uppercase text-white/40 leading-tight">
                            {colors[0] && colors[0][actualIdx]
                                ? colors[0][actualIdx].replace(/[^0-9]/g, '').length > 0
                                    ? `RF${colors[0][actualIdx].replace(/[^0-9]/g, '')}`
                                    : colors[0][actualIdx]
                                : `RF${actualIdx + 1}`}
                        </div>
                    ))}
                </div>

                {Array.from({ length: heDiem }).map((_, pointIdx) => (
                    <div key={pointIdx} className={`flex gap-2 ${!isRed ? 'flex-row-reverse' : ''}`}>
                        {judgeOrder.map((actualIdx) => {
                            const isFlashing = teamFlashing[actualIdx] === pointIdx;
                            const style = getPointStyle(pointIdx, isFlashing, true);
                            return (
                                <div
                                    key={actualIdx}
                                    className={`flex items-center justify-center font-black transition-all duration-200 ${style.baseClass} ${isFlashing ? 'scale-110 z-10' : ''}`}
                                >
                                    {pointIdx + 1}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }

    // --- CHẾ ĐỘ DỌC (Absolute bám hai biên) ---
    // Độ rộng ô điểm: Default là w-12 (48px), Custom là w-10 (40px). Gap-2 (8px). Label RF w-8 (32px).
    const cellWidth = isCustom ? 40 : 48;
    const judgeBlockWidth = 32 + 8 + (heDiem * cellWidth + (heDiem - 1) * 8);
    const positionOffset = 6 - judgeBlockWidth;
    const styleCoord = isRed ? { left: `${positionOffset}px` } : { right: `${positionOffset}px` };

    return (
        <div
            className="absolute top-1/3 -translate-y-1/2 z-50 flex flex-col gap-4 transition-all duration-500"
            style={{ ...styleCoord, perspective: '1000px' }}
        >
            {Array.from({ length: numJudges }).map((_, judgeIdx) => (
                <div
                    key={judgeIdx}
                    className={`flex items-stretch gap-2 transition-all duration-300 hover:scale-105 ${isRed ? 'flex-row' : 'flex-row-reverse'}`}
                >
                    <div className={`w-8 flex items-center justify-center text-[12px] font-black uppercase text-white/50 ${isRed ? 'text-left' : 'text-right'}`}>
                        {colors[0] && colors[0][judgeIdx]
                            ? colors[0][judgeIdx].replace(/[^0-9]/g, '').length > 0
                                ? `RF${colors[0][judgeIdx].replace(/[^0-9]/g, '')}`
                                : colors[0][judgeIdx]
                            : `RF${judgeIdx + 1}`}
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: heDiem }).map((_, pointIdx) => {
                            const isFlashing = teamFlashing[judgeIdx] === pointIdx;
                            const style = getPointStyle(pointIdx, isFlashing, false);
                            return (
                                <div
                                    key={pointIdx}
                                    className={`flex items-center justify-center font-black transition-all duration-200 ${style.baseClass} ${isFlashing ? 'scale-110 z-10' : ''}`}
                                >
                                    {pointIdx + 1}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default JudgeScoreBlock;
