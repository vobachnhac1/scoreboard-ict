import React from "react";
import CompetitionDKMultiView from "./CompetitionDKMultiView";

/**
 * Render giá trị cell với logic đặc biệt cho từng bảng/cột
 */
export const renderCellValue = (record, col, tableName, selectedDataRows, setSelectedDataRows) => {
  const value = record[col];

  // Cột 'data' của competition_dk -> Render table preview
  if (tableName === "competition_dk" && col === "data") {
    if (!value) return <span className="text-gray-400 italic">Không có dữ liệu</span>;

    let parsedData;
    try {
      parsedData = typeof value === "string" ? JSON.parse(value) : value;
    } catch (e) {
      return <span className="text-red-500">Dữ liệu không hợp lệ</span>;
    }

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return <span className="text-gray-400 italic">Dữ liệu rỗng</span>;
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
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{rows.length}dòng dữ liệu</span>
          {selectedRows.length > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              {selectedRows.length}đã chọn
            </span>
          )}
          <button
            onClick={() => toggleAllDataRows(selectedRows.length === 0)}
            className="ml-auto text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
          >
            {selectedRows.length === rows.length && rows.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
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
    return <div className="max-w-xs truncate font-mono text-xs text-gray-600 dark:text-gray-400">{JSON.stringify(parsedJsonValue)}</div>;
  }

  // Giá trị bình thường
  if (value !== null && value !== undefined) {
    return <div className="max-w-xs truncate" title={String(value)}>{String(value)}</div>;
  }

  return <span className="text-gray-400">-</span>;
};

const RecordsView = ({
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
  const totalSelectedRows = Object.values(selectedDataRows || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          {/* <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{selectedTableForRecords}</h3> */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tổng: {tableRecords.length}
            {selectedRecords[selectedTableForRecords] && <span className="ml-2 text-blue-600 dark:text-blue-400">- Đã chọn: {selectedRecords[selectedTableForRecords].length}</span>}
          </p>
        </div>
        <button onClick={handleBackToTableView} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded">← Quay lại</button>
      </div>

      {loadingRecords ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Column config UI */}
          {/* {Object.keys(columnConfig).length > 0 && (
            <div className="mb-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tùy chỉnh cột:</span>
                <div className="flex gap-2">
                  <button onClick={() => { const all = {}; Object.keys(columnConfig).forEach((c) => { all[c] = { ...columnConfig[c], visible: true }; }); setColumnConfig(all); setTableColumns(Object.keys(columnConfig)); }} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 rounded">Hiện tất cả</button>
                  <button onClick={() => { const all = {}; const first = Object.keys(columnConfig)[0]; Object.keys(columnConfig).forEach((c) => { all[c] = { ...columnConfig[c], visible: c === first }; }); setColumnConfig(all); setTableColumns(first ? [first] : []); }}className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded">Ẩn tất cả</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(columnConfig).map((col) => (
                  <div key={col}className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${columnConfig[col]?.visible ? "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50"}`}>
                    <input type="checkbox" checked={columnConfig[col]?.visible ?? true} onChange={(e) => { const n = { ...columnConfig }; n[col] = { ...n[col], visible: e.target.checked }; setColumnConfig(n); if (e.target.checked) setTableColumns((p) => [...p, col]); else setTableColumns((p) => p.filter((c) => c !== col)); }} className="w-3 h-3 cursor-pointer" />
                    <input type="text" value={columnConfig[col]?.displayName || col} onChange={(e) => { const n = { ...columnConfig }; n[col] = { ...n[col], displayName: e.target.value }; setColumnConfig(n); }} className="text-xs w-28 border-0 bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-0.5" title={`Tên gốc: ${col}`} />
                    // <span className="text-[9px] font-mono text-gray-400 dark:text-gray-600">({col})</span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Action buttons */}
          <div className="mb-3 flex flex-wrap gap-2 items-center">
            <button onClick={() => handleSelectAllRecords(selectedTableForRecords)} className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded">Chọn tất cả</button>
            <button onClick={() => handleDeselectAllRecords(selectedTableForRecords)} className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded">Bỏ chọn tất cả</button>
            <button onClick={handleDeleteSelectedRecords} disabled={!selectedRecords[selectedTableForRecords] || selectedRecords[selectedTableForRecords].length === 0} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded font-semibold">Xóa đã chọn ({selectedRecords[selectedTableForRecords]?.length || 0})</button>
            <button onClick={handleSendToManualServer} disabled={!selectedRecords[selectedTableForRecords] || selectedRecords[selectedTableForRecords].length === 0} className="px-3 py-1 text-sm bg-green-500 hover:green-red-600 disabled:bg-gray-400 text-white rounded font-semibold">{'Gửi Danh sách đến máy khác'}</button>
            {selectedTableForRecords === "competition_dk" && (
              <>
                <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
                {/* <button onClick={toggleCompDKMultiView} className={`px-3 py-1 text-sm rounded font-semibold flex items-center gap-1.5 ${showCompDKMultiView ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300"}`}>
                   {showCompDKMultiView ? "Đang xem nhiều danh sách" : "Xem nhiều danh sách"}
                  {showCompDKMultiView && selectedCompDKRecords.length > 0 && <span className="bg-white/30 dark:bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{selectedCompDKRecords.length}</span>}
                </button> */}
                {/* <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" /> */}
                <button onClick={handleSyncSelectedDataRows} disabled={!isManualConnected || totalSelectedRows === 0 || syncing} className={`px-3 py-1 text-sm rounded font-semibold flex items-center gap-1.5 ${isManualConnected && totalSelectedRows > 0 ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"}`} title={!isManualConnected ? "Cần kết nối đến máy khác trước" : totalSelectedRows === 0 ? "Chọn ít nhất 1 dòng dữ liệu" : `Đồng bộ ${totalSelectedRows}dòng đến máy đích`}>
                  {syncing ? <><span className="animate-spin">⏳</span>Đang gửi...</> : <> Đồng bộ dữ liệu đã chọn {totalSelectedRows > 0 && <span className="bg-white/30 dark:bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{totalSelectedRows}</span>}</>}
                </button>
                {totalSelectedRows > 0 && <button onClick={() => setSelectedDataRows({})} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded">✕ Bỏ chọn</button>}
              </>
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
                    <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-40 sticky right-0 bg-gray-100 dark:bg-gray-700">Thao tác</th>
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
                                {isInMultiView ? "Đang xem" : "Xem"} <span className={`px-1.5 py-0.5 rounded text-[10px] ${isInMultiView ? "bg-white/25" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>{rowCount}  dòng</span>
                              </button>
                            );
                          })() : renderCellValue(record, col, selectedTableForRecords, selectedDataRows, setSelectedDataRows)}
                        </td>
                      ))}
                      <td className="p-2 text-center sticky right-0 bg-white dark:bg-gray-800">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleShowRecordDetail(record)} className="px-2 py-1 w-20 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded">Chi tiết</button>
                          <button onClick={() => handleDeleteRecord(selectedTableForRecords, record.id)} className="px-2 py-1 w-20 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Xóa</button>
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
        </>
      )}
    </div>
  );
};

export default RecordsView;

