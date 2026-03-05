import React from "react";
import { useTranslation } from "react-i18next";

const CompetitionDKMultiView = ({
  tableRecords,
  selectedDataRows,
  setSelectedDataRows,
  selectedCompDKRecords,
  setSelectedCompDKRecords,
  isRecordSelectorExpanded,
  setIsRecordSelectorExpanded,
  expandedCards,
  setExpandedCards,
  isManualConnected,
  syncing,
  handleSyncSelectedDataRows,
  toggleCompDKRecord,
  toggleCompDKMultiView,
}) => {
  const totalSelectedRows = Object.values(selectedDataRows || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const { t } = useTranslation();

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ===== STICKY TOOLBAR - Floating Design ===== */}
      <div className="sticky top-4 z-40 bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900/30 mb-8 p-5 rounded-[2.5rem]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">{t("data_sync.merged_view_mode")}</h3>
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-black text-blue-950 dark:text-blue-100 uppercase tracking-tight">{t("data_sync.advanced_management")}</h4>
                <div className="h-4 w-px bg-blue-100 dark:bg-blue-900/30 mx-1"></div>
                {totalSelectedRows > 0 ? (
                  <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    {t("data_sync.selected_count", { count: totalSelectedRows })}
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">{t("data_sync.no_content_selected")}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {totalSelectedRows > 0 && (
              <button
                onClick={() => setSelectedDataRows({})}
                className="px-6 py-3 bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-rose-50 dark:border-rose-900/30 hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                {t("data_sync.deselect_all")}
              </button>
            )}
            <button
              onClick={handleSyncSelectedDataRows}
              disabled={!isManualConnected || totalSelectedRows === 0 || syncing}
              className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3  transition-all active:scale-95 ${isManualConnected && totalSelectedRows > 0 ? "bg-emerald-600 text-white scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"}`}
            >
              {syncing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t("data_sync.sending")}</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  {t("data_sync.send_sync")} {totalSelectedRows > 0 && `(+${totalSelectedRows})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== DATA TABLE CARDS ===== */}
      {
        selectedCompDKRecords.length > 0 && (
          <div className="grid grid-cols-1 gap-8 pb-10">
            {tableRecords
              .filter((r) => selectedCompDKRecords.includes(r.id))
              .map((record) => {
                let parsedData;
                try { parsedData = typeof record.data === "string" ? JSON.parse(record.data) : record.data; } catch { parsedData = null; }
                const headers = Array.isArray(parsedData) && parsedData.length > 0 ? parsedData[0] : [];
                const rows = Array.isArray(parsedData) && parsedData.length > 1 ? parsedData.slice(1) : [];
                const recordId = record.id;
                const selectedRows = selectedDataRows[recordId] || [];
                const isCardExpanded = expandedCards[recordId] ?? false;

                const toggleRow = (rowIndex) => {
                  setSelectedDataRows((prev) => {
                    const current = (prev || {})[recordId] || [];
                    const isSelected = current?.includes(rowIndex);
                    if (!current) return prev || {};

                    if (rowIndex % 2 === 0 && ['SOL', 'TUV']?.includes(rows[rowIndex]?.[1])) {
                      return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex && i != rowIndex + 1) : [...current, rowIndex, rowIndex + 1] };
                    }
                    if (rowIndex % 4 === 0 && ['DAL']?.includes(rows[rowIndex]?.[1])) {
                      return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex && i != rowIndex + 1 && i != rowIndex + 2 && i != rowIndex + 3) : [...current, rowIndex, rowIndex + 1, rowIndex + 2, rowIndex + 3] };
                    }
                    if (rows[rowIndex]?.[1] === 'VON') {
                      const count = rows[rowIndex][5];
                      const countArray = Array.from({ length: count }, (_, i) => i + rowIndex);
                      return { ...prev, [recordId]: isSelected ? current.filter((i) => !countArray.includes(i)) : [...current, ...countArray] };
                    }
                    if (rows[rowIndex]?.[1] === 'DOL' || rows[rowIndex]?.[0] != null) {
                      return { ...(prev || {}), [recordId]: isSelected ? current.filter((i) => i !== rowIndex) : [...current, rowIndex] };
                    }
                    return { ...prev };
                  });
                };

                const toggleAll = (checked) => {
                  setSelectedDataRows((prev) => ({ ...prev, [recordId]: checked ? rows.map((_, i) => i) : [] }));
                };

                const toggleCard = () => {
                  setExpandedCards((prev) => ({ ...prev, [recordId]: !prev[recordId] }));
                };

                return (
                  <div key={recordId} className={`bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${isCardExpanded ? 'border-blue-100 dark:border-blue-900/50 ring-4 ring-blue-500/5' : 'border-blue-50 dark:border-blue-900/20'}`}>
                    {/* Card Header */}
                    <div className={`px-8 py-6 flex items-center justify-between transition-colors ${isCardExpanded ? 'bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-50 dark:border-blue-900/30' : 'bg-white dark:bg-gray-900'}`}>
                      <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={toggleCard}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isCardExpanded ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-400'}`}>
                          <svg className={`w-6 h-6 transition-transform duration-500 ${isCardExpanded ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h5 className="text-sm font-black text-blue-950 dark:text-blue-100 uppercase tracking-tight">{record.file_name || t("data_sync.data_record_label", { id: recordId })}</h5>
                            {record.sheet_name && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-800">{record.sheet_name}</span>}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> {t("data_sync.rows_count", { count: rows.length })}</span>
                            {selectedRows.length > 0 && (
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                {t("data_sync.selected_count", { count: selectedRows.length })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleAll(selectedRows.length < rows.length); }}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${selectedRows.length === rows.length && rows.length > 0 ? "bg-white dark:bg-gray-800 text-rose-600 border-rose-50 dark:border-rose-900/30" : "bg-white dark:bg-gray-800 text-blue-600 border-blue-50 dark:border-blue-900/30"}`}
                        >
                          {selectedRows.length === rows.length && rows.length > 0 ? t("data_sync.deselect_all") : t("data_sync.select_all")}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCompDKRecord(recordId); }}
                          className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90"
                          title={t("data_sync.hide_this_record")}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Card Content - Table */}
                    {isCardExpanded && (
                      <div className="p-8 bg-gray-50/30 dark:bg-gray-900/40 animate-in slide-in-from-top-4 duration-500">
                        {headers.length === 0 ? (
                          <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-3xl mx-auto flex items-center justify-center text-blue-200 dark:text-blue-800 mb-4">
                              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest italic">{t("data_sync.invalid_record_data")}</p>
                          </div>
                        ) : (
                          <div className="rounded-[2rem] border border-blue-50 dark:border-blue-900/30 bg-white dark:bg-gray-800 overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar">
                              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                  <thead className="sticky top-0 z-20">
                                    <tr className="bg-blue-50/80 dark:bg-blue-900/40 border-b border-blue-50 dark:border-blue-900/30">
                                      <th className="px-4 py-4 w-12 text-center border-r border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center justify-center">
                                          <input
                                            type="checkbox"
                                            checked={selectedRows.length === rows.length && rows.length > 0}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                            className="w-4 h-4 rounded-lg border-2 border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                          />
                                        </div>
                                      </th>
                                      <th className="px-4 py-4 w-12 text-center text-[10px] font-black uppercase text-blue-400 tracking-widest border-r border-blue-100 dark:border-blue-800">#</th>
                                      {headers.map((h, i) => (
                                        <th key={i} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-900/60 dark:text-blue-100/60 border-r border-blue-100 dark:border-blue-800 whitespace-nowrap">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-blue-50/50 dark:divide-blue-900/10">
                                    {
                                      (() => {
                                        const formatTableData = () => {
                                          const type = headers[0];
                                          const formatted = [];
                                          if (type === "DK" || type === "DOL" || (!['TUV', 'SOL', 'DAL', 'VON'].includes(type) && !['TUV', 'SOL', 'DAL', 'VON'].includes(rows[0]?.[1]))) return rows;
                                          const checkType = ['TUV', 'SOL', 'DAL', 'VON'].includes(type) ? type : rows[0]?.[1];
                                          if (checkType === "TUV" || checkType === "SOL") {
                                            for (let i = 0; i < rows.length; i += 2) formatted.push([rows[i], rows[i + 1]]);
                                          } else if (checkType === "DAL") {
                                            for (let i = 0; i < rows.length; i += 4) formatted.push([rows[i], rows[i + 1], rows[i + 2], rows[i + 3]]);
                                          } else if (checkType === "VON") {
                                            let offset = 0;
                                            while (offset < rows.length) {
                                              let count = 1;
                                              if (rows[offset][1] == "VON" && rows[offset][5] != null) count = Math.max(1, Number(rows[offset][5]));
                                              formatted.push(rows.slice(offset, offset + count));
                                              offset += count;
                                            }
                                          } else return rows;
                                          return formatted;
                                        };

                                        let cumulativeIdx = 0;
                                        return formatTableData().map((item, groupIdx) => {
                                          const isGrouped = Array.isArray(item) && item.length > 0 && Array.isArray(item[0]);
                                          const displayRow = isGrouped ? item[0] : item;
                                          const rowIdx = cumulativeIdx;
                                          cumulativeIdx += isGrouped ? item.length : 1;

                                          const isRowSelected = selectedRows.includes(rowIdx);
                                          let isHeader = false;
                                          if (!isGrouped) {
                                            if (rowIdx % 2 == 0 && ['SOL', 'TUV']?.includes(item[1])) isHeader = true;
                                            else if (rowIdx % 4 == 0 && ['DAL']?.includes(item[1])) isHeader = true;
                                            else if (['VON']?.includes(item[1]) && item[5] != null) isHeader = true;
                                            else if (item[0] != null) isHeader = true;
                                          } else isHeader = true;

                                          return (
                                            <tr key={groupIdx} onClick={() => toggleRow(rowIdx)} className={`group cursor-pointer transition-all duration-300 ${isRowSelected ? "bg-blue-600/[0.03] dark:bg-blue-500/[0.05]" : "hover:bg-blue-50/30 dark:hover:bg-blue-900/10"}`}>
                                              <td className="px-4 py-3 text-center border-r border-blue-50 dark:border-blue-900/10" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center">
                                                  <input
                                                    disabled={!isHeader}
                                                    type="checkbox"
                                                    checked={isRowSelected}
                                                    onChange={() => toggleRow(rowIdx)}
                                                    className="w-4 h-4 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-500 disabled:opacity-0"
                                                  />
                                                </div>
                                              </td>
                                              <td className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 font-mono border-r border-blue-50 dark:border-blue-900/10 group-hover:text-blue-500 transition-colors">{groupIdx + 1}</td>
                                              {headers.map((headerStr, cellIdx) => {
                                                if (!isGrouped) {
                                                  const cell = displayRow[cellIdx];
                                                  return (
                                                    <td key={cellIdx} className="px-6 py-3 border-r border-blue-50 dark:border-blue-900/10 group-hover:border-blue-100 dark:group-hover:border-blue-900/30">
                                                      <div className="text-xs font-bold text-gray-700 dark:text-gray-200 max-w-[200px] truncate" title={String(cell ?? "")}>{cell ?? <span className="text-gray-200 dark:text-gray-800 italic">-</span>}</div>
                                                    </td>
                                                  );
                                                }

                                                const val1 = displayRow[cellIdx];
                                                const headerLower = String(headerStr).toLowerCase();
                                                const nameVariants = t("data_sync.name_column_variants").split(",").map(v => v.trim().toLowerCase());
                                                let isNameCol = nameVariants.some(v => headerLower.includes(v)) || cellIdx === 2;
                                                if (headers[0] == 'VON') isNameCol = nameVariants.some(v => headerLower.includes(v)) || cellIdx === 3;

                                                if (isNameCol) {
                                                  return (
                                                    <td key={cellIdx} className="px-6 py-2 border-r border-blue-50 dark:border-blue-900/10 align-middle bg-blue-50/20 dark:bg-blue-900/10 w-[200px] max-w-[250px]">
                                                      <div className="flex flex-col gap-1.5 py-1">
                                                        {item.map((r, subIdx) => (
                                                          <React.Fragment key={subIdx}>
                                                            <div className="flex items-center gap-2 group/item">
                                                              <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[8px] font-black text-blue-600 shrink-0">{subIdx + 1}</span>
                                                              <div className="text-xs font-black text-blue-800 dark:text-blue-300 truncate" title={String(r[cellIdx] ?? "")}>
                                                                {r[cellIdx] !== null && r[cellIdx] !== undefined ? String(r[cellIdx]) : <span className="opacity-20 italic">-</span>}
                                                              </div>
                                                            </div>
                                                            {subIdx < item.length - 1 && <div className="h-px bg-blue-100/50 dark:bg-blue-900/20 w-full"></div>}
                                                          </React.Fragment>
                                                        ))}
                                                      </div>
                                                    </td>
                                                  );
                                                }

                                                let isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 3 || cellIdx === 4;
                                                if (headers[0] == "VON") isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 2 || cellIdx === 4 || cellIdx === 5;

                                                if (isStaticCol) {
                                                  return (
                                                    <td key={cellIdx} className="px-6 py-3 border-r border-blue-50 dark:border-blue-900/10 align-middle">
                                                      <div className="text-xs font-black text-gray-900 dark:text-white max-w-[180px] truncate" title={String(val1 ?? "")}>{val1 ?? "-"}</div>
                                                    </td>
                                                  );
                                                }

                                                const allSame = item.every((r) => r && String(r[cellIdx] || "") === String(val1 || ""));
                                                if (allSame) {
                                                  return (
                                                    <td key={cellIdx} className="px-6 py-3 border-r border-blue-50 dark:border-blue-900/10 align-middle">
                                                      <div className="text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[180px] truncate opacity-60" title={String(val1 ?? "")}>{val1 ?? "-"}</div>
                                                    </td>
                                                  );
                                                }

                                                return (
                                                  <td key={cellIdx} className="px-6 py-2 border-r border-blue-50 dark:border-blue-900/10 align-middle">
                                                    <div className="flex flex-col gap-1.5 py-1">
                                                      {item.map((r, subIdx) => (
                                                        <React.Fragment key={subIdx}>
                                                          <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate max-w-[180px]" title={String(r?.[cellIdx] ?? "")}>
                                                            {r?.[cellIdx] ?? <span className="opacity-20">-</span>}
                                                          </div>
                                                          {subIdx < item.length - 1 && <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>}
                                                        </React.Fragment>
                                                      ))}
                                                    </div>
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          );
                                        });
                                      })()
                                    }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )
      }
    </div >
  );
};

export default CompetitionDKMultiView;

