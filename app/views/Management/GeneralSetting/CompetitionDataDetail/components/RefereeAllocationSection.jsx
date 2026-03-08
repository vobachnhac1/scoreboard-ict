import React from "react";
import { useTranslation } from "react-i18next";

export default function RefereeAllocationSection({
  availableReferees,
  initialReferrers,
  onSave,
  configSystem,
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

  // Lấy số lượng giám định từ configSystem
  const maxReferees = parseInt(configSystem?.data?.so_giam_dinh || 7);

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
    <div className="bg-white dark:bg-gray-900 rounded shadow-2xl border border-blue-100 dark:border-blue-900/40 overflow-hidden">
      {/* Header Section - Light Blue Theme */}
      <div className="relative bg-blue-50/80 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800/50">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-600/10 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-blue-900 dark:text-blue-100 tracking-tight">{t("competition_detail.referee_allocation.title")}</h3>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1 font-semibold italic opacity-80">
                {maxReferees} {t("competition_detail.referee_allocation.referee")}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 px-4 py-2 bg-blue-600/5 hover:bg-blue-600/10 rounded-full border border-blue-200 dark:border-blue-800/50 cursor-pointer transition-all group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSkipped}
                  onChange={(e) => setIsSkipped(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-blue-200 dark:bg-blue-800 rounded-full peer-checked:bg-blue-600 transition-colors shadow-inner"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </div>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300 group-hover:text-blue-900 dark:group-hover:text-blue-100">{t("competition_detail.referee_allocation.reset")}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`p-6 transition-all duration-500 ${isSkipped ? "opacity-30 blur-[1px] pointer-events-none grayscale" : "opacity-100"}`}>

        {/* Section: Giám định */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
              <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-[0.2em]">
                {t("competition_detail.referee_allocation.council")} ({maxReferees})
             </h4>
            </div>
            <button
              onClick={handleClearAll}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 rounded transition-all border border-rose-100 dark:border-rose-900/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {t("competition_detail.referee_allocation.clear_all")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {["r1", "r2", "r3", "r4", "r5", "r6", "r7"]
              .slice(0, maxReferees)
              .map((role, idx) => {
                let roleLabel = `${t("competition_detail.referee_allocation.referee")} ${idx + 1}`;
                let roleSub = t("competition_detail.referee_allocation.referee");
                let iconColor = "bg-blue-50 text-blue-500 shadow-inner border border-blue-100 dark:border-blue-800";

                return (
                  <div key={role} className="group flex flex-col p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded border border-blue-100/50 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded ${iconColor} flex items-center justify-center font-bold text-sm shadow-sm`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none mb-1">{roleSub}</p>
                        <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">{roleLabel}</h5>
                      </div>
                    </div>

                    <select
                      value={selectedReferrers[role]}
                      onChange={(e) => handleRefereeChange(role, e.target.value)}
                      className="w-full px-3 py-2.5 bg-white dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 rounded text-sm font-bold text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-400 outline-none transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                    >
                      <option value="">-- {t("competition_detail.referee_allocation.select_referee")} --</option>
                      {availableReferees
                        .filter((ref) => ref[role] === 1)
                        .map((ref) => {
                          const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers[role] !== String(ref.id);
                          return (
                            <option key={ref.id} value={ref.id} disabled={isUsed}>
                              {ref.full_name} {isUsed ? ` (${t("competition_detail.referee_allocation.no_referee")})` : ""}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Section: Trọng tài Điều hàn */}
        <div>
          <div className="flex items-center gap-3 mb-6 pb-2 border-b border-blue-100 dark:border-blue-900/30">
            <span className="w-1.5 h-6 bg-blue-400 rounded-full opacity-60"></span>
            <h4 className="text-[11px] font-black text-blue-950 dark:text-blue-400 uppercase tracking-[0.2em]">
              {t("competition_detail.referee_allocation.operational_referee")}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Trọng tài Máy */}
            <div className="flex gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-blue-900 rounded shadow-sm border border-blue-100 dark:border-blue-700 flex items-center justify-center text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">{t("competition_detail.referee_allocation.technical_support")}</p>
                <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100">{t("competition_detail.referee_allocation.machine_referee")}</h5>
                <select
                  value={selectedReferrers.machine}
                  onChange={(e) => handleRefereeChange("machine", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                >
                  <option value="">{t("competition_detail.referee_allocation.empty_option")}</option>
                  {availableReferees
                    .filter((r) => r.is_ref_machine === 1)
                    .map((ref) => {
                      const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.machine !== String(ref.id);
                      return (
                        <option key={ref.id} value={ref.id} disabled={isUsed}>
                          {ref.full_name} {isUsed ? ` (${t("competition_detail.referee_allocation.already_selected")})` : ""}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            {/* Trọng tài Sân */}
            <div className="flex gap-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-blue-900 rounded shadow-sm border border-blue-100 dark:border-blue-700 flex items-center justify-center text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">{t("competition_detail.referee_allocation.court_management")}</p>
                <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100">{t("competition_detail.referee_allocation.field_referee")}</h5>
                <select
                  value={selectedReferrers.court}
                  onChange={(e) => handleRefereeChange("court", e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-400 outline-none transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '16px' }}
                >
                  <option value="">{t("competition_detail.referee_allocation.empty_option")}</option>
                  {availableReferees
                    .filter((r) => r.is_ref_court === 1)
                    .map((ref) => {
                      const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.court !== String(ref.id);
                      return (
                        <option key={ref.id} value={ref.id} disabled={isUsed}>
                          {ref.full_name} {isUsed ? ` (${t("competition_detail.referee_allocation.already_selected")})` : ""}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-blue-400 dark:text-blue-500 italic">
            {t("competition_detail.referee_allocation.priority_note")}
          </p>
          <button
            onClick={handleSaveReferrers}
            className="w-full sm:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded shadow-[0_10px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 border-b-4 border-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.buttons.confirm").toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
