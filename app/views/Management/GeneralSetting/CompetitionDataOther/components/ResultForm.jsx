import React from "react";
import { useTranslation } from "react-i18next";

export default function ResultForm({ row, onCancel, soGiamDinh = 5, referrers = [] }) {
  const { t } = useTranslation();

  const scores = row?.scores || {};
  const currentTotalJudges = soGiamDinh || 5;
  const judgeScores = [];
  for (let j = 1; j <= currentTotalJudges; j++) {
    judgeScores.push(Number(scores[`judge${j}`] || 0));
  }

  const minScore = Math.min(...judgeScores);
  const maxScore = Math.max(...judgeScores);
  const totalCalc = judgeScores.reduce((a, b) => a + b, 0) - (currentTotalJudges === 5 ? (minScore + maxScore) : 0);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900/40 p-4 rounded border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center md:text-left">
          <div className="md:col-span-1 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.match_code')}</p>
            <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{row?.match_no}</p>
          </div>
          <div className="md:col-span-3 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.referee_team')}</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{t('competition_data_other.score_determination')} ({currentTotalJudges} {t('competition_data_other.form_judge')})</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-7 space-y-3">
          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{t('competition_data_other.detailed_analysis_table')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {judgeScores.map((score, i) => {
              let isExcluded = false;
              if (currentTotalJudges === 5) {
                if (score === minScore && !judgeScores.slice(0, i).includes(minScore)) isExcluded = true;
                else if (score === maxScore && !judgeScores.slice(0, i).includes(maxScore)) isExcluded = true;
              }

              return (
                <div key={i} className={`relative p-3 rounded border-2 transition-all duration-300 ${isExcluded ? 'bg-gray-50 dark:bg-gray-800/20 border-gray-200/50 opacity-40 grayscale' : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'}`}>
                  {isExcluded && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gray-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{t('competition_data_other.excluded')}</span>
                  )}
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{t('competition_data_other.form_judge')} {i + 1}</p>
                  <p className={`text-xl font-black ${isExcluded ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{score.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          {currentTotalJudges === 5 && (
            <p className="text-[8px] font-black text-amber-600 dark:text-amber-500/60 uppercase tracking-widest px-2 italic">* {t('competition_data_other.auto_exclude_note')}</p>
          )}
        </div>

        <div className="md:col-span-5">
          <div className="bg-blue-600 p-5 rounded relative overflow-hidden group">
            <div className="relative z-10 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Final Summary</p>
                  <h4 className="text-base font-black uppercase tracking-widest">{t('competition_data_other.total_score')}</h4>
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[4.5rem] font-black leading-none tracking-tighter">{(scores.total ?? totalCalc).toFixed(2)}</span>
                <span className="text-lg font-black text-white/40 uppercase tracking-widest">PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referrers Section */}
      {referrers && referrers.length > 0 && (
        <div className="bg-white dark:bg-gray-900/40 p-4 rounded border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">{t('competition_data_other.form_referee_council')}</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {referrers.map((ref, idx) => {
              let roleLabel = ref.role;
              let iconColor = "bg-purple-600";

              if (ref.role.startsWith("r")) {
                const num = ref.role.substring(1);
                roleLabel = `${t('competition_data_other.form_judge_short')} ${num}`;
                iconColor = "bg-blue-600";
              } else if (ref.role === "machine") {
                roleLabel = t('competition_data_other.machine_referee_short');
                iconColor = "bg-amber-500";
              } else if (ref.role === "court") {
                roleLabel = t('competition_data_other.court_referee_short');
                iconColor = "bg-emerald-600";
              }

              return (
                <div key={`ref-${idx}`} className="flex flex-col gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 flex-shrink-0 ${iconColor} rounded flex items-center justify-center text-white font-black text-[9px]`}>
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{roleLabel}</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{ref.full_name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
        >
          {t('competition_data_other.close_window')}
        </button>
      </div>
    </div>
  );
}
