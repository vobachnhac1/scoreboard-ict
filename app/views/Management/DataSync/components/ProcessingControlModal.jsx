import React from "react";
import { useTranslation } from "react-i18next";

const ProcessingControlModal = ({
  show,
  onClose,
  staging,
  mapping,
  localList,
  handleUpdateMapping,
  tableName,
  t_name
}) => {
  const { t } = useTranslation();
  const [showTargetPicker, setShowTargetPicker] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  if (!show || !staging) return null;

  const incomingData = staging.record_data;
  const isPartialRows = staging.meta?.type === "partial_rows";

  const filteredLocalList = localList.filter((r) => {
    if (!searchTerm) return true;
    const searchString = Object.values(r).join(" ").toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const selectedLocal = localList.find((r) => r.id === mapping?.mapping_to_id);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-800 rounded shadow-2xl shadow-blue-500/10 max-w-2xl w-full flex flex-col overflow-hidden border border-blue-50 dark:border-blue-900/30 animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-blue-600 border-b border-blue-500 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/20 rounded flex items-center justify-center text-white border border-white/30 truncate">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-1">{t("data_sync.processing_flow")}</h2>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                {t_name || tableName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 border border-white/20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-10 space-y-8">
          {/* Action Selection */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.select_action")}</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "insert", label: t("data_sync.insert"), color: "blue", icon: <path d="M12 4v16m8-8H4" /> },
                { value: "update", label: t("data_sync.update"), color: "amber", icon: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
                { value: "skip", label: t("data_sync.skip"), color: "rose", icon: <path d="M6 18L18 6M6 6l12 12" /> }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdateMapping(staging.id, opt.value, mapping?.mapping_to_id)}
                  disabled={isPartialRows && opt.value === 'insert'}
                  className={`flex flex-col items-center justify-center gap-3 p-2 rounded border-2 transition-all duration-300 ${mapping?.action === opt.value
                    ? opt.color === 'blue' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-50 dark:ring-blue-900/20'
                      : opt.color === 'amber' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-50 dark:ring-amber-900/20'
                        : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30 ring-4 ring-rose-50 dark:ring-rose-900/20'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-blue-200 hover:bg-blue-50/30 grayscale opacity-80'
                    } ${isPartialRows && opt.value === 'insert' ? 'opacity-30 cursor-not-allowed hidden' : ''}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    {opt.icon}
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Record Selection (Only if Update) */}
          {mapping?.action === "update" && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.link_source_data")}</h4>
              <div className="relative">
                <button
                  onClick={() => setShowTargetPicker(true)}
                  className="w-full h-20 px-8 flex items-center justify-between border-2 border-blue-100 dark:border-blue-800 rounded bg-blue-50/20 dark:bg-gray-900/50 hover:border-blue-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      {selectedLocal ? (
                        <>
                          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">{t("data_sync.target_linked")}</div>
                          <div className="text-sm font-black text-blue-950 dark:text-blue-100 truncate max-w-[300px]">
                            ID {selectedLocal.id}: {Object.values(selectedLocal).slice(1, 4).filter(v => v !== null && v !== "").join(" | ")}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-black text-gray-400 uppercase tracking-widest">{t("data_sync.select_target_record")}</div>
                          <div className="text-[10px] font-bold text-blue-400/60 transition-colors group-hover:text-blue-500">{t("data_sync.click_to_browse_list")}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Partial Sync Info */}
          {isPartialRows && (
            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 rounded border-2 border-dashed border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">{t("data_sync.partial_sync_mode")}</div>
                  {/* <div className="text-xs font-bold text-gray-500 dark:text-gray-400">ID: {staging.meta.record_id}</div> */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[11px] font-black uppercase tracking-widest transition-all"
          >
            {t("data_sync.close")}
          </button>
          <button
            onClick={onClose}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {t("data_sync.confirm")}
          </button>
        </div>
      </div>
      {/* Target Picker Sub-Modal */}
      {showTargetPicker && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md" onClick={() => setShowTargetPicker(false)}></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-blue-200 dark:border-blue-900/50 animate-in zoom-in-95 duration-300">
            {/* Picker Header */}
            <div className="px-8 py-6 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-blue-950 dark:text-blue-100 tracking-tight">{t("data_sync.select_target_record")}</h3>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.module")}: {t_name || tableName}</p>
                </div>
                <button
                  onClick={() => setShowTargetPicker(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:bg-rose-500 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder={t("data_sync.search_records")}
                  className="w-full h-14 pl-12 pr-6 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-800 rounded outline-none focus:border-blue-500 text-sm font-bold transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-white dark:bg-gray-900">
              <div className="space-y-2">
                {filteredLocalList.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 mx-auto flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t("data_sync.no_matching_records")}</p>
                  </div>
                ) : (
                  filteredLocalList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        handleUpdateMapping(staging.id, "update", r.id);
                        setShowTargetPicker(false);
                      }}
                      className={`w-full p-2 text-left rounded border-2 transition-all flex items-center gap-6 group ${mapping?.mapping_to_id === r.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gray-50 dark:bg-gray-800 border-transparent hover:border-blue-300 hover:bg-white dark:hover:bg-gray-700"}`}
                    >
                      <div className={`w-12 h-12 rounded flex flex-col items-center justify-center shrink-0 border ${mapping?.mapping_to_id === r.id ? "bg-white/20 border-white/30 text-white" : "bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-blue-600 shadow-sm"}`}>
                        <span className="text-[8px] font-black uppercase opacity-60">ID</span>
                        <span className="text-lg font-black leading-none">{r.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-black tracking-tight truncate ${mapping?.mapping_to_id === r.id ? "text-white" : "text-blue-950 dark:text-blue-100"}`}>
                          {Object.values(r).slice(1, 2).filter(v => v !== null && v !== "").join(" | ") || "—"}
                        </div>
                        <div className={`text-[9px] font-bold uppercase tracking-widest opacity-60 truncate ${mapping?.mapping_to_id === r.id ? "text-blue-100" : "text-blue-400"}`}>
                          {Object.keys(r).slice(1, 2).join(" / ")}
                        </div>
                      </div>
                      {mapping?.mapping_to_id === r.id && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Picker Footer */}
            <div className="p-6 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t("data_sync.total_records_available", { count: localList.length })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingControlModal;
