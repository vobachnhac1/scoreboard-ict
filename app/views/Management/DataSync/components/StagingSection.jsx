import React from "react";
import { useTranslation } from "react-i18next";
import IpMasker from "../../../../common/IpMasker";
import { META_FIELDS_NAME, HIDDEN_DETAIL_KEYS } from "../constants";

const StagingSection = ({
  stagingSessions,
  stagingView,
  activeSession,
  stagingData,
  stagingMappings,
  stagingTableFilter,
  setStagingTableFilter,
  localRecords,
  loadingStaging,
  applyingStaging,
  localIP,
  stagingDetailRecord,
  setStagingDetailRecord,
  loadStagingSessions,
  handleOpenSession,
  handleDeleteSession,
  handleApplyStaging,
  handleUpdateMapping,
  handleCloseReview,

  //
  setStagingMappings
}) => {
  const { t, i18n } = useTranslation();

  const TAB_NAME = {
    competition_dk: t("data_sync.total_list"),
    competition_match: t("data_sync.combat"),
    competition_match_team: t("data_sync.quyen")
  };



  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ===== SECTION HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-blue-50 dark:border-blue-900/30 ">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 ">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{t("data_sync.temporary_database")}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-blue-950 dark:text-blue-100 tracking-tight">{t("data_sync.data_review_area")}</span>
              {stagingSessions.length > 0 && (
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest ">
                  {t("data_sync.new_sessions_count", { count: stagingSessions.length })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stagingView === "review" && (
            <button
              onClick={handleCloseReview}
              className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-100 dark:border-blue-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("data_sync.back_to_list")}
            </button>
          )}
          <button
            onClick={loadStagingSessions}
            className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-300 transition-all border-2 border-blue-50 dark:border-blue-900/30  active:scale-95"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {t("data_sync.reload")}
          </button>
        </div>
      </div>

      {/* ===== SESSIONS LIST - Card Design ===== */}
      {stagingView === "sessions" && (
        <div className="space-y-4">
          {stagingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/30 dark:bg-gray-800/20 rounded-[3rem] border-2 border-dashed border-blue-100 dark:border-blue-900/30">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-300 dark:text-blue-700 mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest text-center max-w-xs">{t("data_sync.no_data_packages")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stagingSessions.map((session) => (
                <div key={session.session_id} className="group relative bg-white dark:bg-gray-800 border border-blue-50 dark:border-blue-900/30 rounded-[2.5rem] p-6 hover:border-blue-200 transition-all duration-300 overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900 rounded-3xl flex flex-col items-center justify-center border border-blue-100 dark:border-blue-800">
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">{t("data_sync.table")}</span>
                      <span className="text-xl font-black text-blue-600">{session.total_tables}</span>
                    </div>

                    <div className="flex-1 min-w-0 text-center lg:text-left">
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                        <span className="text-lg font-black text-blue-950 dark:text-blue-100 font-mono tracking-tight">
                          {t("data_sync.host_identifier")}: {IpMasker?.mask(session.source_ip, "hash", null, "sync")?.display}
                        </span>
                        <div className="flex items-center gap-2">
                          {session.pending_count > 0 && (
                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800">
                              {t("data_sync.records_pending", { count: session.pending_count })}
                            </span>
                          )}
                          {session.meta_sample?.type === "partial_rows" && (
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest ">
                              {t("data_sync.partial_sync")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center lg:justify-start gap-4">
                        <div className="flex items-center gap-1.5 grayscale opacity-60">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {new Date(session.received_at).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US")}
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {IpMasker?.mask(localIP, "hash", null, "sync")?.display ?? session.session_id}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full lg:w-fit">
                      <button
                        onClick={() => handleOpenSession(session)}
                        className="flex-1 lg:flex-none px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest  active:scale-95 transition-all"
                      >
                        {t("data_sync.view_details")}
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.session_id)}
                        className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all active:scale-95 border border-rose-100 dark:border-rose-900/30"
                        title={t("data_sync.clear_session")}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== REVIEW VIEW - Premium Detail Design ===== */}
      {stagingView === "review" && activeSession && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          {loadingStaging ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/30 dark:bg-gray-800/20 rounded-[3rem] border border-blue-50 dark:border-blue-900/30">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.loading_data_structure")}</p>
            </div>
          ) : (
            <>
              {/* Review Control Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white dark:bg-gray-800 rounded-[2rem] border border-blue-50 dark:border-blue-900/30 ">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-xl flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60">{t("data_sync.session_statistics")}</div>
                    <p className="text-sm font-black text-blue-950 dark:text-blue-100 tracking-tight">
                      {t("data_sync.records_and_modules", { records: stagingData.length, modules: [...new Set(stagingData.map((r) => r.table_name))].length })}
                    </p>
                  </div>
                </div>

                {/* Module Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setStagingTableFilter(null)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!stagingTableFilter ? "bg-blue-600 text-white " : "bg-blue-50 dark:bg-blue-900/30 text-blue-400 hover:text-blue-600"}`}
                  >
                    {t("data_sync.all")}
                  </button>
                  {[...new Set(stagingData.map((r) => r.table_name))].map((t) => (
                    <button
                      key={t}
                      onClick={() => setStagingTableFilter(t)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${stagingTableFilter === t ? "bg-blue-600 text-white " : "bg-blue-50 dark:bg-blue-900/30 text-blue-400 hover:text-blue-600"}`}
                    >
                      {TAB_NAME[t]} ({stagingData.filter((r) => r.table_name === t).length})
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleApplyStaging}
                  disabled={applyingStaging}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]  transition-all active:scale-95 flex items-center gap-3"
                >
                  {applyingStaging ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t("data_sync.processing").toUpperCase()}...</>
                  ) : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> {t("data_sync.apply_to_system").toUpperCase()}</>}
                </button>
              </div>

              {/* Records comparison matrix */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-blue-50 dark:border-blue-900/30  overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-50/50 dark:bg-gray-900/50 border-b border-blue-100 dark:border-blue-900/30">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest w-40">{t("data_sync.module")}</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-blue-600 uppercase tracking-widest w-[38%] border-x border-blue-100 dark:border-blue-900/30">{t("data_sync.source_machine_data")}</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-emerald-600 uppercase tracking-widest w-[38%]">{t("data_sync.target_machine_data")}</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.processing_flow")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 dark:divide-blue-900/20">
                      {stagingData
                        .filter((r) => !stagingTableFilter || r.table_name === stagingTableFilter)
                        .map((staging) => {
                          const mapping = stagingMappings[staging.id] || { action: "insert", mapping_to_id: null };
                          const localList = localRecords[staging.table_name] || [];
                          const incomingData = staging.record_data;
                          const matchedLocal = mapping.mapping_to_id ? localList.find((r) => r.id === mapping.mapping_to_id) : null;
                          const keys = Object.keys(incomingData).filter(
                            (k) => !HIDDEN_DETAIL_KEYS.includes(k) && k !== "id" && k !== "data" && k !== "items"
                          );

                          return (
                            <tr key={staging.id} className={`transition-colors ${mapping.action === "skip" ? "opacity-40 grayscale pointer-events-none" : "hover:bg-blue-50/30 dark:hover:bg-blue-900/5"}`}>
                              {/* Module Chip */}
                              <td className="px-6 py-6 align-top">
                                <div className="space-y-3">
                                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-[9px] font-black uppercase tracking-widest">{TAB_NAME[staging.table_name] || staging.table_name}</span>
                                  {staging.meta?.type === "partial_rows" && (
                                    <div className="flex flex-col gap-1.5 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t("data_sync.partial_sync")}</div>
                                      {staging.meta.file_name && <div className="text-[9px] text-blue-400 truncate">📁 {staging.meta.file_name}</div>}
                                      {staging.meta.selected_rows && <div className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">✓ {t("data_sync.items_selected", { count: staging.meta.selected_rows.length })}</div>}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Source Logic */}
                              <td className="px-6 py-6 align-top border-x border-blue-100 dark:border-blue-900/30">
                                <div className="space-y-2">
                                  {keys.map((k) => (
                                    <div key={k} className="flex gap-3 pb-2 border-b border-blue-50/50 dark:border-blue-900/10 last:border-0 last:pb-0">
                                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-24 shrink-0 pt-0.5">
                                        {t(`data_sync.meta_labels.${k}`, { defaultValue: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ') })}
                                      </span>
                                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 break-words line-clamp-2" title={String(incomingData[k] ?? "")}>
                                        {String(incomingData[k] ?? "—")}
                                      </span>
                                    </div>
                                  ))}
                                  <button onClick={() => setStagingDetailRecord({ type: "incoming", data: incomingData })} className="mt-4 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] hover:bg-blue-600 hover:text-white transition-colors">
                                    {t("data_sync.source_machine_detail_arrow")}
                                  </button>
                                </div>
                              </td>

                              {/* Target Comparison */}
                              <td className="px-6 py-6 align-top">
                                {mapping.action === "insert" ? (
                                  <div className="h-24 flex items-center justify-center p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border-2 border-dashed border-blue-100 dark:border-blue-800">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">{t("data_sync.add_new_data")}</span>
                                  </div>
                                ) : mapping.action === "skip" ? (
                                  <div className="h-24 flex items-center justify-center">
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">✕ {t("data_sync.skipped").toUpperCase()}</span>
                                  </div>
                                ) : matchedLocal ? (
                                  <div className="space-y-2 animate-in fade-in duration-300">
                                    {keys.map((k) => {
                                      const isDiff = String(matchedLocal[k] ?? "") !== String(incomingData[k] ?? "");
                                      return (
                                        <div key={k} className={`flex gap-3 pb-2 border-b border-blue-50/50 dark:border-blue-900/10 last:border-0 last:pb-0 ${isDiff ? "bg-amber-500/5 -mx-2 px-2 rounded-lg" : ""}`}>
                                          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest w-24 shrink-0 pt-0.5">
                                            {t(`data_sync.meta_labels.${k}`, { defaultValue: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ') })}
                                          </span>
                                          <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-bold break-words line-clamp-2 ${isDiff ? "text-amber-600 dark:text-amber-400 underline underline-offset-4 decoration-dotted" : "text-emerald-700 dark:text-emerald-400"}`}>
                                              {String(matchedLocal[k] ?? "—")}
                                            </div>
                                            {isDiff && <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">{t("data_sync.data_mismatch")}</span>}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <button onClick={() => setStagingDetailRecord({ type: "local", data: matchedLocal })} className="mt-4 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] hover:bg-emerald-600 hover:text-white transition-colors">
                                      {t("data_sync.target_machine_detail")} →
                                    </button>
                                  </div>
                                ) : (
                                  <div className="h-24 flex items-center justify-center p-4 bg-rose-50/30 dark:bg-rose-900/10 rounded-2xl border-2 border-dashed border-rose-100 dark:border-rose-900/30">
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">⚠ {t("data_sync.not_identified")}</span>
                                  </div>
                                )}
                              </td>

                              {/* Processing Controls */}
                              <td className="px-6 py-6 align-top">
                                <div className="flex flex-col gap-3 items-center">
                                  {staging.meta?.type === "partial_rows" ? (
                                    <div className="flex flex-col gap-2 items-center">
                                      <div className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.15em] ">{t("data_sync.merge_queue")}</div>
                                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono">ID: {staging.meta.record_id}</span>
                                      <button
                                        onClick={() => handleUpdateMapping(staging.id, mapping.action === "skip" ? "update" : "skip", staging.meta.record_id)}
                                        className={`mt-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mapping.action === "skip" ? "bg-blue-600 text-white" : "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white"}`}
                                      >
                                        {mapping.action === "skip" ? `↩ ${t("data_sync.restore").toUpperCase()}` : `✕ ${t("data_sync.ignore").toUpperCase()}`}
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="grid grid-cols-1 gap-2 w-32">
                                        {[
                                          { value: "insert", label: t("data_sync.insert"), color: "blue" },
                                          { value: "update", label: t("data_sync.update"), color: "amber" },
                                          { value: "skip", label: t("data_sync.skip"), color: "gray" }
                                        ].map((opt) => (
                                          <button
                                            key={opt.value}
                                            onClick={() => handleUpdateMapping(staging.id, opt.value, mapping.mapping_to_id)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${mapping.action === opt.value
                                              ? opt.color === "blue" ? "bg-blue-600 text-white border-blue-600 " : opt.color === "amber" ? "bg-amber-500 text-white border-amber-500 " : "bg-gray-600 text-white border-gray-600"
                                              : "bg-white dark:bg-gray-800 border-blue-50 dark:border-blue-900/30 text-blue-400 hover:border-blue-300"}`}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>
                                      {mapping.action === "update" && (
                                        <div className="w-full space-y-2 mt-2">
                                          <div className="text-[8px] font-black text-blue-400 uppercase tracking-tighter text-center">{t("data_sync.link_source_data")}</div>
                                          <select
                                            className="w-full text-[10px] font-bold border-2 border-blue-100 dark:border-blue-800 rounded-xl bg-blue-50/50 dark:bg-gray-900 text-blue-900 dark:text-blue-100 px-3 py-2 outline-none focus:border-blue-500 transition-all font-mono"
                                            value={mapping.mapping_to_id ?? ""}
                                            onChange={(e) => handleUpdateMapping(staging.id, "update", e.target.value ? parseInt(e.target.value) : null)}
                                          >
                                            <option value="">{localList.length === 0 ? t("data_sync.not_found") : t("data_sync.select_target")}</option>
                                            {localList.map((r) => (
                                              <option key={r.id} value={r.id}>ID {r.id}: {Object.values(r).slice(1, 4).join(" | ")}</option>
                                            ))}
                                          </select>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StagingSection;

