import React from "react";

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

  return (
    <div className="mt-4">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm mb-4 p-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Chế độ xem nhiều</span>
            {totalSelectedRows > 0 ? (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                ✓ {totalSelectedRows} danh sách được chọn
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">Chưa chọn danh sách nào</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSyncSelectedDataRows}
              disabled={!isManualConnected || totalSelectedRows === 0 || syncing}
              className={`px-4 py-2 text-sm rounded font-semibold flex items-center gap-1.5 shadow-md transition-all ${isManualConnected && totalSelectedRows > 0 ? "bg-green-500 hover:bg-green-600 text-white scale-105" : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"}`}
              title={!isManualConnected ? "Cần kết nối đến máy khác trước" : totalSelectedRows === 0 ? "Chọn ít nhất 1 dòng dữ liệu từ các table bên dưới" : `Đồng bộ ${totalSelectedRows} dòng đến máy đích`}
            >
              {syncing ? <>Đang gửi...</> : <> Đồng bộ {totalSelectedRows > 0 && `(${totalSelectedRows})`}</>}
            </button>
            {totalSelectedRows > 0 && (
              <button onClick={() => setSelectedDataRows({})} className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded font-semibold">
                ✕ Bỏ chọn tất cả
              </button>
            )}
            {/* <button onClick={toggleCompDKMultiView}className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
              ← Tắt chế độ này
            </button> */}
          </div>
        </div>
      </div>

      {/* Record Selector - Expandable */}
      {/* <div className="mb-4 border border-blue-200 dark:border-blue-700 rounded overflow-hidden">
        <button
          onClick={() => setIsRecordSelectorExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Chọn danh sách để xem</span>
            {!isRecordSelectorExpanded && (
              <span className="flex flex-wrap gap-1">
                {selectedCompDKRecords.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">Chưa chọn danh sách nào</span>
                ) : (
                  tableRecords
                    .filter((r) => selectedCompDKRecords.includes(r.id))
                    .map((r) => (
                      <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        {r.file_name || r.sheet_name || `#${r.id}`}
                      </span>
                    ))
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-500 dark:text-blue-400">{selectedCompDKRecords.length}/{tableRecords.length}</span>
            <span className="text-blue-500 dark:text-blue-400 text-sm transition-transform duration-200" style={{ display: "inline-block", transform: isRecordSelectorExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
          </div>
        </button>
        {isRecordSelectorExpanded && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-700">
            <div className="flex gap-2 mb-2">
              <button onClick={() => setSelectedCompDKRecords(tableRecords.map((r) => r.id))} className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded">✓ Chọn tất cả</button>
              <button onClick={() => setSelectedCompDKRecords([])}className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">✕ Bỏ chọn</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tableRecords.map((record) => {
                const isSelected = selectedCompDKRecords.includes(record.id);
                const label = record.file_name || record.sheet_name || `Record #${record.id}`;
                let count = 0;
                try {
                  const d = typeof record.data === "string" ? JSON.parse(record.data) : record.data;
                  if (Array.isArray(d)) count = Math.max(0, d.length - 1);
                } catch {}
                return (
                  <button key={record.id} onClick={() => toggleCompDKRecord(record.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${isSelected ? "bg-blue-500 text-white border-blue-500 shadow-sm" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"}`}>
                    <span className="text-xs">{isSelected ? "✓" : "○"}</span>
                    <span className="max-w-[200px] truncate" title={label}>{label}</span>
                    {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/25 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>{count}dòng</span>}
                  </button>
                );
              })}
            </div>
            {selectedCompDKRecords.length === 0 && <p className="mt-2 text-xs text-gray-400 italic">Chọn ít nhất 1 record để xem dữ liệu bên dưới</p>}
          </div>
        )}
      </div> */}

      {/* Data Table Cards */}
      {selectedCompDKRecords.length > 0 && (
        <div className="space-y-4">
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
                console.log('rowIndex', rowIndex);
                setSelectedDataRows((prev) => {
                  const current = (prev || {})[recordId] || [];
                  console.log('current', current);
                  const isSelected = current?.includes(rowIndex);
                  if (!current) return prev || {};
                  console.log('isSelected', isSelected);
                  // Trường hợp SOL/TUV
                  if (rowIndex % 2 === 0 && ['SOL', 'TUV']?.includes(rows[rowIndex][1])) {
                    console.log('SOL/TUV', rowIndex, rows[rowIndex]);
                    // return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex) : [...current, rowIndex] };
                    return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex && i != rowIndex + 1) : [...current, rowIndex, rowIndex + 1] };
                  }
                  // Trường hợp DAL
                  if (rowIndex % 4 === 0 && ['DAL']?.includes(rows[rowIndex][1])) {
                    // return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex) : [...current, rowIndex] };
                    return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex && i != rowIndex + 1 && i != rowIndex + 2 && i != rowIndex + 3) : [...current, rowIndex, rowIndex + 1, rowIndex + 2, rowIndex + 3] };
                  }
                  // VON
                  if (rows[rowIndex][1] === 'VON') {
                    // lấy số lượng ở cột số 5
                    const count = rows[rowIndex][5];
                    // tạo 1 mảng từ 0 đến count
                    const countArray = Array.from({ length: count }, (_, i) => i);
                    // cộng thêm rowIndex vào mỗi phần tử
                    const countArrayWithIndex = countArray.map((i) => i + rowIndex);
                    // return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex) : [...current, rowIndex] };
                    return { ...prev, [recordId]: isSelected ? current.filter((i) => i !== rowIndex && !countArrayWithIndex.includes(i)) : [...current, rowIndex, ...countArrayWithIndex] };
                  }
                  if (rows[rowIndex][1] === 'DOL') {
                    return { ...(prev || {}), [recordId]: isSelected ? current.filter((i) => i !== rowIndex) : [...current, rowIndex] };
                  }
                  if (rows[rowIndex][0] != null) {
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
                <div key={recordId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={toggleCard} className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm transition-transform duration-200" style={{ display: "inline-block", transform: isCardExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">{record.file_name || `Record #${recordId}`}</span>
                        {record.sheet_name && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs"> {record.sheet_name}</span>}
                        <span className="text-xs text-gray-500 dark:text-gray-400">{rows.length} dòng</span>
                        {selectedRows.length > 0 && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-xs font-semibold">✓ {selectedRows.length} đã chọn</span>}
                      </div>
                      <span className="text-xs text-gray-400 italic">{isCardExpanded ? "Click để thu gọn" : "Click để mở rộng"}</span>
                    </button>
                    <div className="flex items-center justify-end gap-2 px-4 pb-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleAll(selectedRows.length < rows.length); }} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded">
                        {selectedRows.length === rows.length && rows.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleCompDKRecord(recordId); }} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded">✕ Ẩn</button>
                    </div>
                  </div>
                  {isCardExpanded && (
                    headers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400 italic">Không có dữ liệu</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <div className="max-h-[320px] overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                              <tr>
                                <th className="px-2 py-1.5 text-center w-8 border-r border-gray-200 dark:border-gray-600">
                                  <input type="checkbox" checked={selectedRows.length === rows.length && rows.length > 0} onChange={(e) => toggleAll(e.target.checked)} className="w-3 h-3" />
                                </th>
                                <th className="px-2 py-1.5 text-center text-gray-500 dark:text-gray-400 w-8 border-r border-gray-200 dark:border-gray-600">#</th>
                                {headers.map((h, i) => <th key={i} className="px-3 py-1.5 text-left font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 whitespace-nowrap">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {
                                (() => {
                                  const formatTableData = () => {
                                    const type = headers[0];
                                    const formatted = [];
                                    if (type === "DK" || type === "DOL" || (!['TUV', 'SOL', 'DAL', 'VON'].includes(type) && !['TUV', 'SOL', 'DAL', 'VON'].includes(rows[0]?.[1]))) return rows;

                                    const checkType = ['TUV', 'SOL', 'DAL', 'VON'].includes(type) ? type : rows[0]?.[1];
                                    if (checkType === "TUV" || checkType === "SOL") {
                                      for (let i = 0; i < rows.length; i += 2) {
                                        formatted.push([rows[i], rows[i + 1]]);
                                      }
                                    } else if (checkType === "DAL") {
                                      for (let i = 0; i < rows.length; i += 4) {
                                        formatted.push([rows[i], rows[i + 1], rows[i + 2], rows[i + 3]]);
                                      }
                                    } else if (checkType === "VON") {
                                      let count = 0;
                                      for (let i = 0; i < rows.length; i += count) {
                                        let arrRow = []
                                        if (rows[i][1] == "VON" && rows[i][5] != null) {
                                          count = Number(rows[i][5]) > 1 ? Number(rows[i][5]) : 1;
                                        }
                                        for (let j = 0; j < count; j++) {
                                          arrRow.push(rows[i + j]);
                                        }
                                        formatted.push(arrRow);
                                      }
                                    } else {
                                      return rows;
                                    }
                                    return formatted;
                                  };

                                  let cumulativeIdx = 0;
                                  return formatTableData().map((item, groupIdx) => {
                                    const isGrouped = Array.isArray(item) && item.length > 0 && Array.isArray(item[0]);
                                    const displayRow = isGrouped ? item[0] : item;
                                    const rowIdx = cumulativeIdx; // Real index mapped to `rows` original indices
                                    cumulativeIdx += isGrouped ? item.length : 1;

                                    const isRowSelected = selectedRows.includes(rowIdx);
                                    let isHeader = false;

                                    if (!isGrouped) {
                                      if (rowIdx % 2 == 0 && ['SOL', 'TUV']?.includes(item[1])) isHeader = true;
                                      else if (rowIdx % 4 == 0 && ['DAL']?.includes(item[1])) isHeader = true;
                                      else if (['VON']?.includes(item[1]) && item[5] != null) isHeader = true;
                                    } else {
                                      isHeader = true; // For grouped rows, the first row checkbox can control the group
                                    }

                                    return (
                                      <tr key={groupIdx} className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${isRowSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/60"}`} onClick={() => toggleRow(rowIdx)}>
                                        <td className="px-2 py-1.5 text-center border-r border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                                          <input disabled={!isHeader} type="checkbox" checked={isRowSelected} onChange={() => toggleRow(rowIdx)} className="w-3 h-3" />
                                        </td>
                                        <td className="px-2 py-1.5 text-center text-gray-400 dark:text-gray-500 border-r border-gray-100 dark:border-gray-700 select-none">{groupIdx + 1}</td>
                                        {headers.map((headerStr, cellIdx) => {
                                          if (!isGrouped) {
                                            const cell = displayRow[cellIdx];
                                            return (
                                              <td key={cellIdx} className="px-3 py-1.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">
                                                <div className="max-w-[180px] truncate" title={String(cell ?? "")}>{cell ?? "-"}</div>
                                              </td>
                                            );
                                          }

                                          const val1 = displayRow[cellIdx];
                                          const headerLower = String(headerStr).toLowerCase();
                                          let isNameCol = headerLower.includes('họ tên') || headerLower.includes('họ và tên') || headerLower === 'tên' || cellIdx === 2;
                                          if (headers[0] == 'VON') {
                                            isNameCol = headerLower.includes('họ tên') || headerLower.includes('họ và tên') || headerLower === 'tên' || cellIdx === 3;
                                          }

                                          if (isNameCol) {
                                            return (
                                              <td key={cellIdx} className="px-3 py-1.5 text-gray-800 dark:text-gray-200 border-r border-b border-gray-100 dark:border-gray-700 align-middle bg-blue-50/30 dark:bg-blue-900/10 z-10 w-[180px] max-w-[200px]">
                                                <div className="flex flex-col gap-1.5 leading-none">
                                                  {item.map((r, subIdx) => {
                                                    if (!r) return null;
                                                    const dotColors = ["bg-blue-500", "bg-indigo-500", "bg-green-500", "bg-orange-500"];
                                                    const textColors = ["text-blue-700 dark:text-blue-400", "text-indigo-700 dark:text-indigo-400", "text-green-700 dark:text-green-400", "text-orange-700 dark:text-orange-400"];
                                                    return (
                                                      <React.Fragment key={subIdx}>
                                                        {subIdx > 0 && <div className="w-full h-px bg-blue-200 dark:bg-blue-800"></div>}
                                                        <div className={`truncate flex items-center gap-1.5`} title={String(r[cellIdx] ?? "")}>
                                                          <span className="truncate">
                                                            {r[cellIdx] !== null && r[cellIdx] !== undefined
                                                              ? subIdx + 1 + ". " + String(r[cellIdx])
                                                              : <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                                                          </span>
                                                        </div>
                                                      </React.Fragment>
                                                    )
                                                  })}
                                                </div>
                                              </td>
                                            );
                                          }

                                          let isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 3 || cellIdx === 4;
                                          if (headers[0] == "VON") {
                                            isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 2 || cellIdx === 4 || cellIdx === 5;
                                          }

                                          if (isStaticCol) {
                                            return (
                                              <td key={cellIdx} className="px-3 py-1.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 align-middle">
                                                <div className="max-w-[180px] truncate font-medium text-gray-900 dark:text-white" title={String(val1 ?? "")}>{val1 ?? "-"}</div>
                                              </td>
                                            );
                                          }

                                          const allSame = item.every((r) => r && String(r[cellIdx] || "") === String(val1 || ""));
                                          if (allSame) {
                                            return (
                                              <td key={cellIdx} className="px-3 py-1.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 align-middle">
                                                <div className="max-w-[180px] truncate" title={String(val1 ?? "")}>{val1 ?? "-"}</div>
                                              </td>
                                            );
                                          }

                                          return (
                                            <td key={cellIdx} className="px-3 py-1.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 align-middle">
                                              <div className="flex flex-col gap-1.5 leading-none">
                                                {item.map((r, subIdx) => (
                                                  <React.Fragment key={subIdx}>
                                                    {subIdx > 0 && <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>}
                                                    <div className="truncate max-w-[180px]" title={String(r?.[cellIdx] ?? "")}>{r?.[cellIdx] ?? "-"}</div>
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
                    )
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CompetitionDKMultiView;

