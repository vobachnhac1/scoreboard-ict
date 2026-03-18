import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PauseMatchOverlay({
    pauseMatch,
    isRunning,
    isBreakTime,
    isMedicalTime,
    ready,
    currentRound,
    matchInfo,
    timeLeft,
    formatTime,
    uiTheme = 'default'
}) {
    const { t } = useTranslation();

    // ONLY SHOW if explicitly paused AND game is NOT Running, AND NOT in break or medical time
    if (!pauseMatch || isRunning || isBreakTime || isMedicalTime) return null;

    const time = formatTime(timeLeft);

    return (
        <div className="fixed inset-0 z-[888] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl animate-in fade-in zoom-in duration-500 overflow-hidden">
            {/* Dynamic Background Noise/Ambience */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent pointer-events-none" />

            {/* Central Core */}
            <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto p-12 rounded-[5rem] border border-white/5 bg-white/5 backdrop-blur-md shadow-[0_0_100px_rgba(255,165,0,0.05)]">

                <div className="flex flex-col items-center gap-6 mb-12">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
                        <div className="relative w-20 h-20 rounded-full border border-orange-500/30 flex items-center justify-center bg-orange-500/10">
                            <svg className="w-10 h-10 text-orange-500 drop-shadow-[0_0_10px_orange]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-orange-500/90 drop-shadow-lg">
                        {t('scoreboard.overlay.match_paused')}
                    </h2>
                </div>

                <div className="space-y-4">
                    <p className="text-xl font-black text-white px-10 py-4 bg-white/5 rounded-2xl border border-white/10 uppercase tracking-widest inline-block shadow-lg">
                        {matchInfo?.match_name || 'ICT Tournament'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <span className="px-6 py-2 bg-slate-800/80 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest border border-slate-700">ROUND {currentRound}</span>
                        <span className="px-6 py-2 bg-slate-800/80 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest border border-slate-700">TIME REMAINING</span>
                    </div>
                </div>

                {/* Frozen Timer */}
                <div className="py-12 flex items-baseline justify-center font-mono opacity-60 grayscale-[0.5]">
                    <span className="text-[12rem] leading-none font-black text-white/90 tracking-tighter drop-shadow-2xl">
                        {time.main}
                    </span>
                    <span className="text-6xl font-black text-orange-500/80 ml-4">
                        {time.decimal}
                    </span>
                </div>

                {/* Connection Info */}
                <div className="pt-8 flex flex-col items-center gap-6">
                    <div className="h-px w-32 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white tracking-widest uppercase mb-1">
                            Ready Status:
                        </span>
                        <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 ${ready ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${ready ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-xs font-black uppercase tracking-widest">{ready ? 'READY TO START' : 'NOT READY'}</span>
                        </div>
                    </div>

                    <p className="text-xs font-bold text-white/20 uppercase tracking-[0.4em] mt-4">
                        {t('scoreboard.overlay.press_space_to_resume')}
                    </p>
                </div>
            </div>

            {/* Side Decorative Tech Info */}
            <div className="absolute top-1/2 -left-12 -translate-y-1/2 vertical-text overflow-hidden">
                <span className="text-[10rem] font-black text-white opacity-[0.02] tracking-tighter select-none pointer-events-none">PAUSE</span>
            </div>
            <div className="absolute top-1/2 -right-12 -translate-y-1/2 vertical-text overflow-hidden rotate-180">
                <span className="text-[10rem] font-black text-white opacity-[0.02] tracking-tighter select-none pointer-events-none">PAUSE</span>
            </div>
        </div>
    );
}
