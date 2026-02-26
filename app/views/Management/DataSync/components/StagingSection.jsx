import React from "react";
import IpMasker from "../../../../common/IpMasker";
import { META_FIELDS_NAME, HIDDEN_DETAIL_KEYS } from "../constants";

const TAB_NAME = {
  competition_dk: "Danh sách tổng",
  competition_match: "Đối kháng",
  competition_match_team: "Quyền"

}

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
  /// Thực hiện mapping key table thành tên 
  console.log('---------------------------------------------------')
  console.log('stagingMappings: ', stagingMappings)
  console.log('stagingSessions: ', stagingSessions)
  console.log('stagingData: ', stagingData)
  console.log('stagingTableFilter: ', stagingTableFilter)
  console.log('localRecords: ', localRecords)
  console.log('stagingDetailRecord: ', stagingDetailRecord)
  console.log('---------------------------------------------------\n\n\n')


  return (
    < >
      {/* Header */}
      <div className='h-12 border-b border-gray-200 dark:border-gray-700 items-center flex justify-between mb-2'>
        <div className="flex justify-center items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Dữ liệu tạm nhận được: </h2>
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">Xem xét và áp dụng dữ liệu từ máy khác gửi đến</p> */}
          {stagingSessions.length > 0 && (
            <span className="ml-1 p-2 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 rounded text-xs font-bold">
              {stagingSessions.length} phiên chờ
            </span>
          )}
        </div>
        <div className="flex justify-center items-center">
          {stagingView === "review" && (
            <button onClick={handleCloseReview} className="px-3 py-1.5 w-28 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 mr-2">
              ← Danh sách
            </button>
          )}
          <button onClick={loadStagingSessions} className="px-3 py-1.5 w-28 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200">
            Tải lại
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {stagingView === "sessions" && (
        <div className="">
          {stagingSessions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p>Chưa có dữ liệu tạm nào. Khi máy khác gửi dữ liệu, nó sẽ hiện ở đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stagingSessions.map((session) => (
                <div key={session.session_id} className="flex items-center gap-4 p-4 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-gray-800 dark:text-white">
                        {IpMasker?.mask(session.source_ip, "hash", null, "sync")?.display || "Không rõ IP"}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs">
                        {session.total_tables} bảng · {session.total_records} danh sách
                      </span>
                      {session.pending_count > 0 && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 rounded text-xs font-semibold">
                          {session.pending_count} chờ duyệt
                        </span>
                      )}
                      {session.meta_sample?.type === "partial_rows" && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded text-xs font-semibold">
                          Từng dòng
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      Nhận lúc: {new Date(session.received_at).toLocaleString("vi-VN")}
                      {" - "}
                      {IpMasker?.mask(localIP, "hash", null, "sync")?.display ?? session.session_id}
                      {session.meta_sample?.type === "partial_rows" && session.meta_sample?.file_name && (
                        <span className="ml-2 text-blue-500 dark:text-blue-400">
                          · {session.meta_sample.file_name}
                          {session.meta_sample.sheet_name && ` / ${session.meta_sample.sheet_name}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleOpenSession(session)} className="px-4 py-2 w-28 bg-blue-500 hover:bg-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-white rounded text-sm font-semibold">
                      Xem xét
                    </button>
                    <button onClick={() => handleDeleteSession(session.session_id)} className="px-4 py-2 w-28 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded text-sm font-semibold">
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review View */}
      {stagingView === "review" && activeSession && (
        <div className="">
          {loadingStaging ? (
            <div className="text-center py-10 text-gray-400">
              <div className="animate-spin text-4xl mb-3">⚙️</div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* Review Header */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Từ máy <span className="font-mono font-bold text-gray-800 dark:text-white">{activeSession.source_ip}</span>
                    {" · "}{stagingData.length} danh sách · {[...new Set(stagingData.map((r) => r.table_name))].length} bảng
                  </p>
                </div>
                {/* Table filter tabs */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setStagingTableFilter(null)} className={`px-3 py-1 rounded text-xs font-semibold border ${!stagingTableFilter ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 text-gray-600 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                    Tất cả
                  </button>
                  {[...new Set(stagingData.map((r) => r.table_name))].map((t) => (
                    <button key={t} onClick={() => setStagingTableFilter(t)} className={`px-3 py-1 rounded text-xs font-semibold border ${stagingTableFilter === t ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 text-gray-600 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                      {TAB_NAME[t]}({stagingData.filter((r) => r.table_name === t).length})
                    </button>
                  ))}
                </div>
                <button onClick={handleApplyStaging} disabled={applyingStaging} className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded font-bold flex items-center gap-2">
                  {applyingStaging ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang áp dụng...</>
                  ) : <>Duyệt</>}
                </button>
              </div>

              {/* Records comparison table */}
              <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-semibold w-28">Bảng</th>
                      <th className="px-3 py-2 text-left text-blue-700 dark:text-blue-300 font-semibold w-[38%]">Dữ liệu từ máy gửi</th>
                      <th className="px-3 py-2 text-left text-green-700 dark:text-green-300 font-semibold w-[38%]">Dữ liệu hiện tại</th>
                      <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 font-semibold">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagingData
                      .filter((r) => !stagingTableFilter || r.table_name === stagingTableFilter)
                      .map((staging) => {
                        const mapping = stagingMappings[staging.id] || { action: "insert", mapping_to_id: null };
                        const localList = localRecords[staging.table_name] || [];
                        const incomingData = staging.record_data;
                        const matchedLocal = mapping.mapping_to_id ? localList.find((r) => r.id === mapping.mapping_to_id) : null;

                        // Extract all keys but filter out hidden ones like 'data', 'match_detail', etc.
                        const keys = Object.keys(incomingData).filter(
                          (k) => !HIDDEN_DETAIL_KEYS.includes(k) && k !== "id" && k !== "data" && k !== "items"
                        );

                        return (
                          <tr key={staging.id} className={`border-t border-gray-100 dark:border-gray-700 ${staging.meta?.type === "partial_rows"
                            ? mapping.action === "skip" ? "opacity-40 bg-blue-50/30 dark:bg-blue-900/5" : "bg-blue-50/40 dark:bg-blue-900/10"
                            : mapping.action === "skip" ? "opacity-40"
                              : mapping.action === "update" ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-blue-50/30 dark:bg-blue-900/10"
                            }`}>
                            {/* Table name cell */}
                            <td className="px-3 py-2 align-top">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs font-mono">{TAB_NAME[staging.table_name]}</span>
                                {staging.meta?.type === "partial_rows" && (
                                  <div className="text-[10px] text-blue-600 dark:text-blue-400 space-y-0.5">
                                    <div className="font-semibold">Từng dòng</div>
                                    {staging.meta.file_name && <div>📁 {staging.meta.file_name}</div>}
                                    {staging.meta.sheet_name && <div> {staging.meta.sheet_name}</div>}
                                    {staging.meta.selected_rows && <div>✓ {staging.meta.selected_rows.length} được chọn</div>}
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Incoming data */}
                            <td className="px-3 py-3 align-top">
                              <div className="space-y-1.5 font-mono text-xs">
                                {keys.map((k) => (
                                  <div key={k} className="flex flex-col sm:flex-row gap-1 sm:gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-1 last:border-0 last:pb-0">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[90px] font-semibold shrink-0">
                                      {META_FIELDS_NAME[k] || k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ")}:
                                    </span>
                                    <span className="text-blue-700 dark:text-blue-300 break-words whitespace-pre-wrap max-h-32 overflow-y-auto" title={String(incomingData[k] ?? "")}>
                                      {String(incomingData[k] ?? "—")}
                                    </span>
                                  </div>
                                ))}
                                <button onClick={() => setStagingDetailRecord({ type: "incoming", data: incomingData })} className="mt-2 text-blue-500 hover:text-blue-600 underline font-semibold text-xs flex items-center gap-1">
                                  <span>Tất cả dữ liệu & bảng chi tiết →</span>
                                </button>
                              </div>
                            </td>

                            {/* Local data */}
                            <td className="px-3 py-3 align-top border-l border-gray-100 dark:border-gray-700/50">
                              {mapping.action === "insert" ? (
                                <div className="h-full flex items-center justify-center p-4">
                                  <span className="text-sm font-semibold text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">Thêm mới bản ghi</span>
                                </div>
                              ) : mapping.action === "skip" ? (
                                <div className="h-full flex items-center justify-center p-4">
                                  <span className="text-sm font-semibold text-gray-400 italic">✕ Bỏ qua</span>
                                </div>
                              ) : matchedLocal ? (
                                <div className="space-y-1.5 font-mono text-xs">
                                  {keys.map((k) => {
                                    const isDiff = String(matchedLocal[k] ?? "") !== String(incomingData[k] ?? "");

                                    return (
                                      <div key={k} className={`flex flex-col sm:flex-row gap-1 sm:gap-2 pb-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0 last:pb-0 ${isDiff ? "bg-orange-50/50 dark:bg-orange-900/10 -mx-1 px-1 rounded" : ""}`}>
                                        <span className="text-gray-500 dark:text-gray-400 min-w-[90px] font-semibold shrink-0">
                                          {META_FIELDS_NAME[k] || k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ")}:
                                        </span>
                                        <span className={`break-words whitespace-pre-wrap max-h-32 overflow-y-auto ${isDiff ? "text-orange-600 dark:text-orange-400 font-bold" : "text-green-700 dark:text-green-300"}`} title={String(matchedLocal[k] ?? "")}>
                                          {String(matchedLocal[k] ?? "—")}
                                        </span>
                                        {isDiff && <span className="text-[10px] text-orange-500 shrink-0 ml-auto self-start bg-orange-100/50 dark:bg-orange-900/30 px-1 rounded">khác</span>}
                                      </div>
                                    );
                                  })}
                                  <button onClick={() => setStagingDetailRecord({ type: "local", data: matchedLocal })} className="mt-2 text-green-600 hover:text-green-700 underline font-semibold text-xs flex items-center gap-1">
                                    <span>Tương quan thẻ hiện tại →</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center p-4">
                                  <span className="text-sm font-semibold text-red-400 italic bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/30">⚠ Chưa chọn dữ liệu</span>
                                </div>
                              )}
                            </td>

                            {/* Action controls */}
                            <td className="px-3 py-2 align-top">
                              <div className="flex flex-col gap-1.5 items-center min-w-[130px]">
                                {staging.meta?.type === "partial_rows" ? (
                                  <div className="flex flex-col gap-1 items-center w-full">
                                    <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-semibold">Gộp vào danh sách</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">ID: {staging.meta.record_id}</span>
                                    <button
                                      onClick={() => handleUpdateMapping(staging.id, mapping.action === "skip" ? "update" : "skip", staging.meta.record_id)}
                                      className={`mt-1 px-2 py-0.5 rounded text-xs font-semibold border ${mapping.action === "skip" ? "bg-gray-400 text-white border-gray-400" : "border-gray-300 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-400"}`}
                                    >
                                      {mapping.action === "skip" ? "↩ Khôi phục" : "✕ Bỏ qua"}
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex gap-1 flex-wrap justify-center">
                                      {[{ value: "insert", label: "Thêm", color: "blue" }, { value: "update", label: "Cập nhật", color: "yellow" }, { value: "skip", label: "Bỏ qua", color: "gray" }].map((opt) => (
                                        <button key={opt.value} onClick={() => handleUpdateMapping(staging.id, opt.value, mapping.mapping_to_id)} className={`px-2 py-0.5 rounded text-xs font-semibold border ${mapping.action === opt.value ? opt.color === "blue" ? "bg-blue-500 text-white border-blue-500" : opt.color === "yellow" ? "bg-yellow-400 text-gray-900 border-yellow-400" : "bg-gray-400 text-white border-gray-400" : "border-gray-300 text-gray-600 dark:text-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                    {mapping.action === "update" && (
                                      <select className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-2 py-1" value={mapping.mapping_to_id ?? ""} onChange={(e) => handleUpdateMapping(staging.id, "update", e.target.value ? parseInt(e.target.value) : null)}>
                                        <option value="">-- Chọn dữ liệu hiện tại --</option>
                                        {localList.map((r) => (
                                          <option key={r.id} value={r.id}>ID {r.id}: {Object.values(r).slice(1, 3).join(" | ")}</option>
                                        ))}
                                      </select>
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default StagingSection;

