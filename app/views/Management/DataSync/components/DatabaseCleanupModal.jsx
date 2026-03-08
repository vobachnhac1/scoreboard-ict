import React from "react";
import { useTranslation } from "react-i18next";

const DatabaseCleanupModal = ({
  show,
  allDatabaseTables,
  selectedTablesToDelete,
  loadingCleanup,
  handleTableDeleteToggle,
  handleDeleteTables,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-blue-950/40" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-900 rounded max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-rose-50 dark:border-rose-900/30">

        {/* ===== MODAL HEADER - Maintenance Gradient ===== */}
        <div className="px-10 py-8 bg-rose-600 border-b border-rose-500 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/20 rounded flex items-center justify-center text-white">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 0 00-1-1h-4a1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-1">{t("data_sync.maintenance_management")}</h2>
              <h3 className="text-3xl font-black text-blue-950 dark:text-blue-100 tracking-tight uppercase leading-none">
                {t("data_sync.table_cleanup_management")}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/40">
          {/* ===== WARNING PANEL ===== */}
          <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded flex items-start gap-5">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/50 rounded flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">{t("data_sync.system_warning")}</h4>
              <p className="text-[11px] font-bold text-amber-800/80 dark:text-amber-200/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("data_sync.cleanup_warning_desc") }} />
            </div>
          </div>

          {loadingCleanup ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin mb-4"></div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">{t("data_sync.loading_data_structure")}</div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ===== STATISTICS GRID ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                  { label: t("data_sync.total_tables"), val: allDatabaseTables.length, color: "blue" },
                  { label: t("data_sync.protected"), val: allDatabaseTables.filter((t) => t.isSyncable).length, color: "emerald" },
                  { label: t("data_sync.cleanable"), val: allDatabaseTables.filter((t) => !t.isSyncable).length, color: "amber" },
                  { label: t("data_sync.selected_to_delete"), val: selectedTablesToDelete.length, color: "indigo" }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded border-2 bg-white dark:bg-gray-800 ${stat.color === 'rose' && selectedTablesToDelete.length > 0 ? 'border-rose-100 dark:border-rose-900' : 'border-blue-50 dark:border-blue-900/30'}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1 text-${stat.color}-400`}>{stat.label}</div>
                    <div className={`text-2xl font-black text-${stat.color}-600`}>{stat.val}</div>
                  </div>
                ))}
              </div>

              {/* ===== TABLES LIST ===== */}
              <div className="bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-50 dark:border-blue-900/30">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-900/40 dark:text-blue-100/40 text-center w-16">#</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-900/40 dark:text-blue-100/40">{t("data_sync.table_id")}</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-900/40 dark:text-blue-100/40 text-right">{t("data_sync.classification_status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50/50 dark:divide-blue-900/10">
                    {allDatabaseTables.map((table) => (
                      <tr
                        key={table.name}
                        onClick={() => !table.isSyncable && handleTableDeleteToggle(table.name)}
                        className={`group transition-colors ${table.isSyncable ? "bg-emerald-50/10" : "hover:bg-blue-50/30 dark:hover:bg-blue-900/20 cursor-pointer"}`}
                      >
                        <td className="px-6 py-4">
                          {table.isSyncable ? (
                            <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${selectedTablesToDelete.includes(table.name) ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-transparent group-hover:border-rose-300'}`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-bold text-blue-950 dark:text-blue-100">{table.name}</div>
                          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1">{table.label}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {table.isSyncable ? (
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50">
                              {t("data_sync.fixed_system")}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[9px] font-black uppercase tracking-wider border border-amber-100 dark:border-amber-800/50">
                              {t("data_sync.can_be_cleaned")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ===== MODAL FOOTER - Action Panel ===== */}
        <div className="px-10 py-6 border-t border-blue-50 dark:border-blue-900/30 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-blue-50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            {t("data_sync.cancel_action")}
          </button>
          <button
            onClick={handleDeleteTables} // Assuming onConfirm is handleDeleteTables
            disabled={selectedTablesToDelete.length === 0 || loadingCleanup} // Assuming isProcessing is loadingCleanup
            className="px-10 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-3"
          >
            {loadingCleanup ? (
              <>{t("data_sync.processing").toUpperCase()}</>
            ) : (
              <>{t("data_sync.confirm_delete_tables", { count: selectedTablesToDelete.length })}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseCleanupModal;

