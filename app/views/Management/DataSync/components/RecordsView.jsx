import React from "react";
import { useTranslation } from "react-i18next";
import CompetitionDKMultiView from "./CompetitionDKMultiView";
import { cleanObject } from "../utils/dataUtils";

/**
 * Render giá trị cell với logic đặc biệt cho từng bảng/cột
 */
export const renderCellValue = (record, col, tableName, selectedDataRows, setSelectedDataRows, t) => {
  const value = record[col];

  // Cột 'data' của competition_dk -> Render table preview
  if (tableName === "competition_dk" && col === "data") {
    if (!value) return <span className="text-gray-400 italic">{t("data_sync.no_data")}</span>;

    let parsedData;
    try {
      parsedData = typeof value === "string" ? JSON.parse(value) : value;
    } catch (e) {
      return <span className="text-red-500">{t("data_sync.invalid_data")}</span>;
    }

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return <span className="text-gray-400 italic">{t("data_sync.empty_data")}</span>;
    }

    const headers = parsedData[0] || [];
    const rows = parsedData.slice(1);
    const recordId = record.id;
    const selectedRows = (selectedDataRows || {})[recordId] || [];

    const toggleDataRow = (rowIndex) => {
      setSelectedDataRows((prev) => {
        const current = (prev || {})[recordId] || [];
        const isSelected = current.includes(rowIndex);
        return {
          ...(prev || {}),
          [recordId]: isSelected ? current.filter((i) => i !== rowIndex) : [...current, rowIndex],
        };
      });
    };

    const toggleAllDataRows = (checked) => {
      setSelectedDataRows((prev) => ({
        ...(prev || {}),
        [recordId]: checked ? rows.map((_, idx) => idx) : [],
      }));
    };

    return (
      <div className="max-w-full">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{t("data_sync.data_rows_count", { count: rows.length })}</span>
          {selectedRows.length > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {t("data_sync.selected_count", { count: selectedRows.length })}
            </span>
          )}
          <button
            onClick={() => toggleAllDataRows(selectedRows.length === 0)}
            className="ml-auto text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
          >
            {selectedRows.length === rows.length && rows.length > 0 ? t("data_sync.deselect_all") : t("data_sync.select_all")}
          </button>
        </div>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 rounded">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-[10px]">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-center w-8 border-r border-gray-200 dark:border-gray-600">
                    <input type="checkbox" checked={selectedRows.length === rows.length && rows.length > 0} onChange={(e) => toggleAllDataRows(e.target.checked)} className="w-3 h-3" />
                  </th>
                  {headers.map((header, idx) => (
                    <th key={idx} className="px-2 py-1 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer ${selectedRows.includes(rowIdx) ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`} onClick={() => toggleDataRow(rowIdx)}>
                    <td className="px-2 py-1 text-center border-r border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedRows.includes(rowIdx)} onChange={() => toggleDataRow(rowIdx)} className="w-3 h-3" />
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-2 py-1 text-gray-800 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                        <div className="max-w-[150px] truncate" title={String(cell)}>{cell || "-"}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Cột JSON object khác
  let parsedJsonValue = value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed !== null && typeof parsed === 'object') {
        parsedJsonValue = parsed;
      }
    } catch (e) { }
  }

  if (parsedJsonValue !== null && parsedJsonValue !== undefined && typeof parsedJsonValue === "object") {
    if (Array.isArray(parsedJsonValue) && parsedJsonValue.length > 0 && Array.isArray(parsedJsonValue[0])) {
      const headers = Math.max(...parsedJsonValue.map(row => row.length));
      return (
        <div className="max-w-[300px] max-h-[150px] overflow-auto border border-gray-200 dark:border-gray-700 rounded text-[10px] bg-white dark:bg-gray-800">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {parsedJsonValue.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-2 py-1 border-r border-gray-100 dark:border-gray-700 max-w-[100px] truncate" title={String(cell ?? "")}>
                      {String(cell ?? "")}
                    </td>
                  ))}
                  {/* Fill empty cells if row is shorter than max width */}
                  {Array.from({ length: headers - row.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="px-2 py-1 border-r border-gray-100 dark:border-gray-700"></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return <div className="max-w-xs truncate font-mono text-xs text-gray-600 dark:text-gray-400">{JSON.stringify(cleanObject(parsedJsonValue))}</div>;
  }

  // Giá trị bình thường
  if (value !== null && value !== undefined) {
    return <div className="max-w-xs truncate" title={String(value)}>{String(value)}</div>;
  }

  return <span className="text-gray-400">-</span>;
};

const RecordsView = ({
  availableTables = [],
  selectedTableForRecords,
  tableRecords,
  loadingRecords,
  selectedRecords,
  tableColumns,
  columnConfig,
  selectedDataRows,
  showCompDKMultiView,
  selectedCompDKRecords,
  isManualConnected,
  syncing,
  isRecordSelectorExpanded,
  expandedCards,
  handleBackToTableView,
  setColumnConfig,
  setTableColumns,
  handleSelectAllRecords,
  handleDeselectAllRecords,
  handleDeleteSelectedRecords,
  handleSyncSelectedDataRows,
  setSelectedDataRows,
  toggleCompDKMultiView,
  handleRecordToggle,
  setSelectedCompDKRecords,
  toggleCompDKRecord,
  setIsRecordSelectorExpanded,
  setExpandedCards,
  handleShowRecordDetail,
  handleDeleteRecord,
  handleSendToManualServer
}) => {
  const { t } = useTranslation();
  const totalSelectedRows = Object.values(selectedDataRows || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ===== VIEW HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 ">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white ">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{t("data_sync.system_data")}</h2>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-blue-950 dark:text-blue-100 tracking-tight">
                {availableTables.find(t => t.name === selectedTableForRecords)?.label || selectedTableForRecords}
              </span>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t("common.total")}: {tableRecords.length}</span>
                {selectedRecords[selectedTableForRecords]?.length > 0 && (
                  <>
                    <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t("common.selected")}: {selectedRecords[selectedTableForRecords].length}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleBackToTableView}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 border-2 border-blue-50 dark:border-blue-900/30 "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("data_sync.back_to_list")}
        </button>
      </div>

      {loadingRecords ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/30 dark:bg-gray-800/20 rounded border border-blue-50 dark:border-blue-900/30">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.extracting_data")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ===== ACTION TOOLBAR - Premium Pill Design ===== */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 ">
            <div className="flex items-center gap-2 p-1.5 bg-blue-50 dark:bg-gray-900 rounded border border-blue-100 dark:border-blue-900/30">
              <button
                onClick={() => handleSelectAllRecords(selectedTableForRecords)}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded text-[10px] font-black uppercase tracking-widest hover:border-blue-300 border-2 border-transparent transition-all  active:scale-95"
              >
                {t("data_sync.select_all")}
              </button>
              <button
                onClick={() => handleDeselectAllRecords(selectedTableForRecords)}
                className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {t("data_sync.deselect_all")}
              </button>
            </div>

            <div className="h-8 w-px bg-blue-100 dark:bg-blue-900/30 mx-2" />

            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={handleDeleteSelectedRecords}
                disabled={!selectedRecords[selectedTableForRecords] || selectedRecords[selectedTableForRecords].length === 0}
                className="px-6 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 disabled:opacity-30 disabled:grayscale rounded text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
              >
                {t("data_sync.delete_selected_count", { count: selectedRecords[selectedTableForRecords]?.length || 0 })}
              </button>

              <button
                onClick={handleSendToManualServer}
                disabled={!selectedRecords[selectedTableForRecords] || selectedRecords[selectedTableForRecords].length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded text-[10px] font-black uppercase tracking-widest  transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {t("data_sync.send_to_target")}
              </button>
            </div>

            {selectedTableForRecords === "competition_dk" && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-px bg-blue-100 dark:bg-blue-900/30" />
                <button
                  onClick={handleSyncSelectedDataRows}
                  disabled={!isManualConnected || totalSelectedRows === 0 || syncing}
                  className={`px-8 py-3 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 active:scale-95 ${isManualConnected && totalSelectedRows > 0 ? "bg-emerald-600 text-white  hover:scale-105" : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-800"}`}
                >
                  {syncing ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t("data_sync.sending")}</>
                  ) : (
                    <>
                      {t("data_sync.ready_to_sync")}
                      {totalSelectedRows > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px]">{totalSelectedRows}</span>}
                    </>
                  )}
                </button>
                {totalSelectedRows > 0 && (
                  <button onClick={() => setSelectedDataRows({})} className="p-3 text-gray-400 hover:text-rose-500 transition-colors" title={t("data_sync.deselect_all_rows")}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Records table */}
          <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left w-12 border-r border-gray-300 dark:border-gray-600">
                      <input type="checkbox" checked={selectedRecords[selectedTableForRecords]?.length === tableRecords.length && tableRecords.length > 0} onChange={(e) => { if (e.target.checked) handleSelectAllRecords(selectedTableForRecords); else handleDeselectAllRecords(selectedTableForRecords); }} className="w-4 h-4" />
                    </th>
                    {tableColumns.map((col) => (
                      <th key={col} className="p-2 text-left border-r border-gray-300 dark:border-gray-600 whitespace-nowrap">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">{columnConfig[col]?.displayName || col}</div>
                        {/* {columnConfig[col]? .displayName && columnConfig[col].displayName !== col && <div className="text-[10px] font-normal text-gray-400 dark:text-gray-500 font-mono mt-0.5">{col}</div>} */}
                      </th>
                    ))}
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-40 sticky right-0 bg-gray-100 dark:bg-gray-700">{t("data_sync.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRecords.map((record) => (
                    <tr key={record.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <td className="p-2 border-r border-gray-300 dark:border-gray-600">
                        <input type="checkbox" checked={selectedRecords[selectedTableForRecords]?.includes(record.id) || false} onChange={() => handleRecordToggle(selectedTableForRecords, record.id)} className="w-4 h-4" />
                      </td>
                      {tableColumns.map((col) => (
                        <td key={col} className="p-2 text-gray-800 dark:text-white border-r border-gray-300 dark:border-gray-600 align-top">
                          {showCompDKMultiView && selectedTableForRecords === "competition_dk" && col === "data" ? (() => {
                            let rowCount = 0;
                            try { const d = typeof record[col] === "string" ? JSON.parse(record[col]) : record[col]; if (Array.isArray(d)) rowCount = Math.max(0, d.length - 1); } catch { }
                            const isInMultiView = selectedCompDKRecords.includes(record.id);
                            return (
                              <button onClick={() => { if (!isInMultiView) setSelectedCompDKRecords((prev) => [...prev, record.id]); else toggleCompDKRecord(record.id); }} className={`flex w-36 items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-colors ${isInMultiView ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400"}`}>
                                {isInMultiView ? t("data_sync.viewing") : t("data_sync.view")} <span className={`px-1.5 py-0.5 rounded text-[10px] ${isInMultiView ? "bg-white/25" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>{t("data_sync.rows_count", { count: rowCount })}</span>
                              </button>
                            );
                          })() : renderCellValue(record, col, selectedTableForRecords, selectedDataRows, setSelectedDataRows, t)}
                        </td>
                      ))}
                      <td className="p-2 text-center sticky right-0 bg-white dark:bg-gray-800">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleShowRecordDetail(record)} className="px-2 py-1 w-20 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded">{t("data_sync.detail")}</button>
                          <button onClick={() => handleDeleteRecord(selectedTableForRecords, record.id)} className="px-2 py-1 w-20 text-xs bg-red-500 hover:bg-red-600 text-white rounded">{t("data_sync.delete")}</button>
                          {/* <button onClick={() => {console.log('-----------> ',selectedTableForRecords, record.id)}} className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Xóa</button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-view component */}
          {selectedTableForRecords === "competition_dk" && showCompDKMultiView && !loadingRecords && (
            <CompetitionDKMultiView
              tableRecords={tableRecords}
              selectedDataRows={selectedDataRows}
              setSelectedDataRows={setSelectedDataRows}
              selectedCompDKRecords={selectedCompDKRecords}
              setSelectedCompDKRecords={setSelectedCompDKRecords}
              isRecordSelectorExpanded={isRecordSelectorExpanded}
              setIsRecordSelectorExpanded={setIsRecordSelectorExpanded}
              expandedCards={expandedCards}
              setExpandedCards={setExpandedCards}
              isManualConnected={isManualConnected}
              syncing={syncing}
              handleSyncSelectedDataRows={handleSyncSelectedDataRows}
              toggleCompDKRecord={toggleCompDKRecord}
              toggleCompDKMultiView={toggleCompDKMultiView}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RecordsView;

