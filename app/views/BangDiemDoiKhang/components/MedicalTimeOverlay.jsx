import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MedicalTimeOverlay({
    isMedicalTime,
    medicalTeam,
    medicalTimeLeft,
    currentRound,
    matchInfo,
    formatTime,
    uiTheme = 'default'
}) {
    const { t } = useTranslation();

    if (!isMedicalTime) return null;

    const teamName = medicalTeam === 'red'
        ? (matchInfo?.athlete_red_name || 'ĐỎ')
        : (matchInfo?.athlete_blue_name || 'XANH');

    const teamColor = medicalTeam === 'red' ? 'text-red-500' : 'text-blue-500';
    const bgColor = medicalTeam === 'red' ? 'from-red-950/90 to-black/95' : 'from-blue-950/90 to-black/95';
    const accentColor = medicalTeam === 'red' ? 'bg-red-500' : 'bg-blue-500';
    const shadowColor = medicalTeam === 'red' ? 'shadow-red-500/20' : 'shadow-blue-500/20';

    const time = formatTime(medicalTimeLeft);

    return (
        <div className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-b ${bgColor} backdrop-blur-3xl animate-in fade-in duration-500`}>
            {/* Background Ambience */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${accentColor} opacity-5 blur-[150px] rounded-full`} />

            {/* Medical Icon with pulsing ring */}
            <div className="relative mb-12">
                <div className={`absolute inset-0 rounded-full ${accentColor} opacity-20 animate-ping`} />
                <div className={`relative w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-2xl ${shadowColor}`}>
                    <svg className={`w-16 h-16 ${teamColor}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="text-center z-10 space-y-8">
                <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-white/40 mb-4">
                    {t('scoreboard.overlay.medical_timeout')}
                </h2>

                <div className="flex flex-col items-center">
                    <span className={`text-6xl font-black uppercase tracking-tight mb-2 ${teamColor} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                        {teamName}
                    </span>
                    <div className={`h-1.5 w-48 rounded-full ${accentColor} shadow-lg ${shadowColor}`} />
                </div>

                {/* Time Display */}
                <div className="flex flex-col items-center py-10">
                    <div className="relative px-16 py-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                        <div className="flex items-baseline font-mono">
                            <span className="text-[12rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                                {time.main}
                            </span>
                            <span className={`text-6xl font-bold ml-2 ${teamColor} opacity-80`}>
                                {time.decimal}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden rounded-b-[2.5rem]">
                            <div
                                className={`h-full ${accentColor} transition-all duration-100 ease-linear`}
                                style={{ width: `${(medicalTimeLeft / (matchInfo?.config_system?.thoi_gian_y_te * 10 || 600)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <p className="text-lg font-bold text-white/30 uppercase tracking-[0.5em] animate-pulse">
                        Waiting for medical attention
                    </p>
                </div>
            </div>

            {/* Technical Labels */}
            <div className="absolute bottom-12 left-12 flex gap-4">
                <div className="px-5 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Round {currentRound}</span>
                </div>
                <div className="px-5 py-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{matchInfo?.match_name || 'Tournament'}</span>
                </div>
            </div>
        </div>
    );
}
