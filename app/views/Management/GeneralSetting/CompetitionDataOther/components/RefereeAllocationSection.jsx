import React from "react";
import { useTranslation } from "react-i18next";

export default function RefereeAllocationSection({
  availableReferees,
  initialReferrers,
  onSave,
  configSystem,
  formatType,
}) {
  const { t } = useTranslation();

  const [selectedReferrers, setSelectedReferrers] = React.useState(() => {
    const roles = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "machine", "court"];
    const initial = {};
    roles.forEach((role) => {
      const existing = (initialReferrers || []).find((ref) => ref.role === role);
      initial[role] = existing ? existing.referee_id : "";
    });
    return initial;
  });

  const [isSkipped, setIsSkipped] = React.useState(false);

  // Lấy số lượng giám định từ configSystem hoặc mặc định 7 cho VON
  const maxReferees = formatType === "VON"
    ? 7
    : parseInt(configSystem?.data?.so_giam_dinh || 5);

  const handleRefereeChange = (role, refereeId) => {
    setSelectedReferrers((prev) => ({ ...prev, [role]: refereeId }));
  };

  const handleClearAll = () => {
    const cleared = {};
    Object.keys(selectedReferrers).forEach(k => cleared[k] = "");
    setSelectedReferrers(cleared);
  };

  const handleSaveReferrers = () => {
    if (isSkipped) {
      onSave([]); // Save empty if skipped
      return;
    }

    const referrers = Object.entries(selectedReferrers)
      .filter(([role, id]) => {
        // Chỉ lưu những GD trong phạm vi config
        if (role.startsWith("r")) {
          const idx = parseInt(role.substring(1));
          if (idx > maxReferees) return false;
        }
        return id !== "";
      })
      .map(([role, id]) => {
        const refObj = availableReferees.find((r) => r.id === parseInt(id));
        return {
          role,
          referee_id: parseInt(id),
          full_name: refObj?.full_name || "",
        };
      });
    onSave(referrers);
  };

  // Lấy danh sách ID đã được chọn để kiểm tra trùng
  const usedRefereeIds = Object.values(selectedReferrers)
    .filter(id => id !== "")
    .map(id => parseInt(id));

  return (
    <div className="bg-white dark:bg-gray-900 rounded shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] border border-blue-100 dark:border-blue-900/40 overflow-hidden animate-in fade-in zoom-in duration-700">
      <div className="relative bg-blue-50 dark:bg-blue-900/10 px-10 py-12 border-b border-blue-100 dark:border-blue-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('competition_data_other.referee_allocation')}</h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg">{t('competition_data_other.referee_allocation_desc')}</p>
          </div>

          <label className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-3xl border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:bg-white transition-all">
            <input
              type="checkbox"
              checked={isSkipped}
              onChange={(e) => setIsSkipped(e.target.checked)}
              className="w-6 h-6 rounded-lg border-2 border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <span className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">{t('competition_data_other.skip_setup')}</span>
          </label>
        </div>
      </div>

      <div className={`p-10 transition-all duration-500 ${isSkipped ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t('competition_data_other.judging_council')} ({maxReferees})</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {Array.from({ length: maxReferees }).map((_, idx) => {
                const role = `r${idx + 1}`;
                let roleLabel = `${t('competition_data_other.form_judge')} ${idx + 1}`;
                let roleSub = t('competition_data_other.direct_scoring');
                let iconColor = "bg-blue-600 text-white";

                if (formatType === "VON") {
                  if (idx === 0 || idx === 1) { roleLabel = `${t('competition_data_other.form_judge_short')} ${idx + 1} ${t('competition_data_other.von_expertise')}`; iconColor = "bg-blue-600 text-white"; }
                  else if (idx === 2 || idx === 3) { roleLabel = `${t('competition_data_other.form_judge_short')} ${idx + 1} ${t('competition_data_other.von_artistry')}`; iconColor = "bg-indigo-600 text-white"; }
                  else if (idx === 4 || idx === 5) { roleLabel = `${t('competition_data_other.form_judge_short')} ${idx + 1} ${t('competition_data_other.von_execution')}`; iconColor = "bg-emerald-600 text-white"; }
                  else if (idx === 6) { roleLabel = t('competition_data_other.chief_referee_full'); iconColor = "bg-amber-500 text-white"; roleSub = t('competition_data_other.final_confirmation'); }
                }

                return (
                  <div key={role} className="group flex flex-col p-5 bg-gray-50 dark:bg-gray-800/40 rounded border-2 border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 flex-shrink-0 rounded ${iconColor} flex items-center justify-center font-black text-xs`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{roleSub}</p>
                        <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">{roleLabel}</h5>
                      </div>
                    </div>

                    <select
                      value={selectedReferrers[role]}
                      onChange={(e) => handleRefereeChange(role, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-950/50 border-2 border-transparent focus:border-blue-500 rounded text-xs font-bold text-gray-900 dark:text-white outline-none transition-all cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}
                    >
                      <option value="">-- {t('competition_data_other.empty')} --</option>
                      {availableReferees
                        .filter((ref) => ref[role] || formatType === "VON")
                        .map((ref) => {
                          const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers[role] !== String(ref.id);
                          return (
                            <option key={ref.id} value={ref.id} disabled={isUsed}>
                              {ref.full_name} {isUsed ? ` (${t('competition_data_other.already_selected')})` : ""}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t('competition_data_other.operational_referee')}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Machine Referee */}
              <div className="group flex gap-5 p-6 bg-gray-50 dark:bg-gray-800/40 rounded border-2 border-transparent hover:border-amber-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all">
                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-700 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">{t('competition_data_other.technician')}</p>
                    <h5 className="text-lg font-black text-gray-900 dark:text-white">{t('competition_data_other.machine_referee')}</h5>
                  </div>
                  <select
                    value={selectedReferrers.machine}
                    onChange={(e) => handleRefereeChange("machine", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-950/50 border-2 border-transparent focus:border-amber-500 rounded text-sm font-bold text-gray-900 dark:text-white outline-none transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f59e0b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    <option value="">-- {t('competition_data_other.empty')} --</option>
                    {availableReferees
                      .filter((r) => r.is_ref_machine === 1)
                      .map((ref) => {
                        const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.machine !== String(ref.id);
                        return (
                          <option key={ref.id} value={ref.id} disabled={isUsed}>
                            {ref.full_name} {isUsed ? ` (${t('competition_data_other.already_selected')})` : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Court Referee */}
              <div className="group flex gap-5 p-6 bg-gray-50 dark:bg-gray-800/40 rounded border-2 border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all">
                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-700 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{t('competition_data_other.court_operator')}</p>
                    <h5 className="text-lg font-black text-gray-900 dark:text-white">{t('competition_data_other.court_referee')}</h5>
                  </div>
                  <select
                    value={selectedReferrers.court}
                    onChange={(e) => handleRefereeChange("court", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-950/50 border-2 border-transparent focus:border-blue-500 rounded text-sm font-bold text-gray-900 dark:text-white outline-none transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    <option value="">-- {t('competition_data_other.empty')} --</option>
                    {availableReferees
                      .filter((r) => r.is_ref_court === 1)
                      .map((ref) => {
                        const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.court !== String(ref.id);
                        return (
                          <option key={ref.id} value={ref.id} disabled={isUsed}>
                            {ref.full_name} {isUsed ? ` (${t('competition_data_other.already_selected')})` : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
            <button
              onClick={handleSaveReferrers}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-[11px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {t('competition_data_other.confirm_allocation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
