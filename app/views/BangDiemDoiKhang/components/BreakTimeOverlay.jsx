import React from 'react';
import { useTranslation } from 'react-i18next';

export default function BreakTimeOverlay({
    isBreakTime,
    breakTimeLeft,
    currentRound,
    matchInfo,
    formatTime,
    uiTheme = 'default'
}) {
    const { t } = useTranslation();

    if (!isBreakTime) return null;

    const time = formatTime(breakTimeLeft);

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-blue-500/10 h-px w-full"
                        style={{ top: `${(i * 100) / 15}%` }}
                    />
                ))}
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-blue-500/10 w-px h-full"
                        style={{ left: `${(i * 100) / 25}%` }}
                    />
                ))}
            </div>

            {/* Main Focus */}
            <div className="relative z-10 text-center space-y-12">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-black uppercase tracking-[0.5em] text-blue-500/80 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        {t('scoreboard.overlay.break_time')}
                    </h2>
                    <span className="text-xs font-black bg-blue-500/10 px-5 py-2 rounded-full border border-blue-500/20 text-blue-400 uppercase tracking-widest">
                        End of Round {currentRound}
                    </span>
                </div>

                {/* Time Container */}
                <div className="relative group">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-64 bg-blue-500/5 blur-[100px] rounded-full" />

                    <div className="relative flex flex-col items-center px-24 py-16 rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-baseline gap-4 font-mono">
                            <span className="text-[18rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                                {time.main}
                            </span>
                            <span className="text-8xl font-black text-blue-500/90 drop-shadow-lg scale-y-125 origin-bottom">
                                {time.decimal}
                            </span>
                        </div>

                        {/* Large Round Info */}
                        <div className="mt-8 flex gap-3 text-white/50 text-sm font-black uppercase tracking-[0.3em]">
                            {matchInfo?.match_name && <span>{matchInfo.match_name}</span>}
                            <span className="opacity-20">|</span>
                            <span>Tournament Management System</span>
                        </div>
                    </div>
                </div>

                <div className="pt-12">
                    <p className="text-2xl font-black text-white/20 uppercase tracking-[0.8em] animate-pulse">
                        Next Round Preparing
                    </p>
                </div>
            </div>

            {/* Modern UI Footer */}
            <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end border-t border-white/5 pt-8">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Tournament Info</span>
                    <span className="text-sm text-white/80 font-bold">{matchInfo?.competition_name || 'ICT Tournament'}</span>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col gap-1 text-right">
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Round Stats</span>
                        <span className="text-sm text-white/80 font-bold">MATCH COMPLETED</span>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
