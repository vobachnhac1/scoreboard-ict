import React from "react";
import { useTranslation } from "react-i18next";

export default function VonResultForm({ row, onCancel, referrers = [] }) {
  const { t } = useTranslation();

  const scores = row?.scores || {};
  const j1 = Number(scores.judge1 || 0);
  const j2 = Number(scores.judge2 || 0);
  const j3 = Number(scores.judge3 || 0);
  const j4 = Number(scores.judge4 || 0);
  const j5 = Number(scores.judge5 || 0);
  const j6 = Number(scores.judge6 || 0);
  const j7 = Number(scores.judge7 || 0);

  const avgCM = (j1 + j2) / 2;
  const avgNT = (j3 + j4) / 2;
  const avgTH = (j5 + j6) / 2;
  const totalCalc = (avgCM * 0.3 + avgNT * 0.3 + avgTH * 0.3 + j7 * 0.1);

  const sections = [
    { label: t('competition_data_other.von_expertise'), weight: '30%', icon: 'M13 10V3L4 14h7v7l9-11h-7z', judges: [{ l: `${t('competition_data_other.form_judge_short')} 1`, s: j1 }, { l: `${t('competition_data_other.form_judge_short')} 2`, s: j2 }], avg: avgCM },
    { label: t('competition_data_other.von_artistry'), weight: '30%', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z', judges: [{ l: `${t('competition_data_other.form_judge_short')} 3`, s: j3 }, { l: `${t('competition_data_other.form_judge_short')} 4`, s: j4 }], avg: avgNT },
    { label: t('competition_data_other.von_execution'), weight: '30%', icon: 'M9 12l2 2 4-4M7.835 4.697a.75.75 0 001.061 0l.53-.53a.75.75 0 000-1.06L8.365 2.047a.75.75 0 00-1.06 0l-.53.53a.75.75 0 000 1.061l1.06 1.06zM6 6a2 2 0 012 2v1h5V8a2 2 0 012-2h1a2 2 0 012 2v10a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1H8v1a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1z', judges: [{ l: `${t('competition_data_other.form_judge_short')} 5`, s: j5 }, { l: `${t('competition_data_other.form_judge_short')} 6`, s: j6 }], avg: avgTH }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900/40 p-4 rounded border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.match_code')}</p>
            <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{row?.match_no}</p>
          </div>
          <div className="md:col-span-3 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.match_content')}</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{row?.match_name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sections.map((sec, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/40 p-4 rounded border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d={sec.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="text-[8px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase">{sec.weight}</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-2">{sec.label}</h4>
                <div className="space-y-1.5">
                  {sec.judges.map((j, k) => (
                    <div key={k} className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{j.l}</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{j.s.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[8px] font-black text-gray-400 uppercase">{t('competition_data_other.average')}</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{sec.avg.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 bg-white dark:bg-gray-900/40 p-4 rounded border border-gray-100 dark:border-gray-800">
          <h4 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('competition_data_other.chief_referee')} (10%)</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white font-black text-xs">7</div>
              <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('competition_data_other.form_judge_short')} 7</span>
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{j7.toFixed(2)}</span>
          </div>
        </div>

        <div className="md:col-span-8 bg-blue-600 p-5 rounded relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-center text-white">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">{t('competition_data_other.official_final_result')}</span>
              <div className="h-px flex-1 bg-white/20"></div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-[4.5rem] font-black leading-none">{(scores.total || totalCalc).toFixed(2)}</span>
              <span className="text-lg font-black text-white/40 uppercase tracking-widest">{t('competition_data_other.points')}</span>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                    <div className={`w-6 h-6 flex-shrink-0 ${iconColor} rounded-md flex items-center justify-center text-white font-black text-[9px]`}>
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
    </div>
  );
}
