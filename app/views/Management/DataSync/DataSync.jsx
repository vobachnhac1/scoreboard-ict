import React from "react";
import { useDataSync } from "./hooks/useDataSync";
import NetworkConnection from "./components/NetworkConnection";
import RecordsView from "./components/RecordsView";
import StagingSection from "./components/StagingSection";
import DatabaseCleanupModal from "./components/DatabaseCleanupModal";
import RecordDetailModal from "./components/RecordDetailModal";
import ConfirmModal from "../../../components/ConfirmModal";
import { META_FIELDS_NAME, HIDDEN_DETAIL_KEYS } from "./constants";

const DataSync = () => {
  const {
    iplocalRef,
    availableTables, selectedTables, metadata, syncing, syncProgress,
    incomingRequest, isRefreshing, loading,
    viewMode, selectedTableForRecords, tableRecords, selectedRecords,
    loadingRecords, tableColumns, setTableColumns, columnConfig, setColumnConfig,
    showRecordDetail, detailRecord,
    selectedDataRows, setSelectedDataRows,
    selectedCompDKRecords, setSelectedCompDKRecords,
    showCompDKMultiView, isRecordSelectorExpanded, setIsRecordSelectorExpanded,
    expandedCards, setExpandedCards,
    localIP, manualServerIP, setManualServerIP,
    isManualConnected, manualServerInfo,
    isScanning, scannedServers, scanDone,
    stagingSessions, activeSession, stagingData, localRecords,
    stagingTableFilter, setStagingTableFilter,
    stagingView, loadingStaging, applyingStaging,
    stagingMappings, setStagingMappings,
    stagingDetailRecord, setStagingDetailRecord,
    allDatabaseTables, selectedTablesToDelete,
    showCleanupModal, setShowCleanupModal, loadingCleanup,
    handleRefreshAll, handleTableToggle, handleRecordToggle,
    handleSelectAllRecords, handleDeselectAllRecords,
    handleBackToTableView, handleShowRecordDetail, handleCloseRecordDetail,
    handleDeleteRecord, handleDeleteSelectedRecords,
    toggleCompDKMultiView, toggleCompDKRecord,
    handleManualConnect, handleManualDisconnect, handleScanNetwork, handleConnectScanned,
    handleSendToManualServer, handleSyncSelectedDataRows,
    handleAcceptRequest, handleRejectRequest,
    loadTableRecords, loadStagingSessions,
    handleOpenSession, handleCloseReview, handleDeleteSession, handleApplyStaging,
    handleUpdateMapping,
    handleOpenCleanupModal, handleTableDeleteToggle, handleDeleteTables,
    modalProps, showAlert
  } = useDataSync();

  // Xử lý tabar
  const [activeTab, setActiveTab] = React.useState("connect"); // send / receive / connect / clean


  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* ===== HEADER ===== */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            ĐỒNG BỘ DỮ LIỆU MÁY CHỦ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 italic">
            Đồng bộ dữ liệu giữa các máy tính trên cùng mạng WiFi
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Làm mới toàn bộ dữ liệu trang"
        >
          <svg
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* TẠO TAB HIỂN THỊ DANH SÁCH GỬI / HIỂN THỊ DANH SÁCH NHẬN */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 mb-2">
        {/* TAB HEADER */}
        <div className="flex items-center gap-0 px-4 pt-3 pb-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <button
            onClick={() => setActiveTab("connect")}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors mb-1 ${activeTab === "connect"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          > KẾT NỐI MÁY CHỦ </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors mb-1 ${activeTab === "send"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          > DỮ LIỆU GỬI </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`px-4 py-2.5 text-sm border-b-2 mb-1 transition-colors ${activeTab === "receive"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          > DỮ LIỆU NHẬN </button>
          <button
            onClick={() => setActiveTab("clean")}
            className={`px-4 py-2.5 text-sm border-b-2 mb-1 transition-colors ${activeTab === "clean"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          > DỌN DẸP DỮ LIỆU</button>
        </div>
        {/* TAB CONTENT */}
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded shadow">
          {/* ===== NETWORK CONNECTION SECTION ===== */}
          {activeTab === "connect" && (<NetworkConnection
            localIP={localIP}
            iplocalRef={iplocalRef}
            manualServerIP={manualServerIP}
            setManualServerIP={setManualServerIP}
            isManualConnected={isManualConnected}
            manualServerInfo={manualServerInfo}
            isScanning={isScanning}
            scannedServers={scannedServers}
            scanDone={scanDone}
            loading={loading}
            handleManualConnect={handleManualConnect}
            handleManualDisconnect={handleManualDisconnect}
            handleScanNetwork={handleScanNetwork}
            handleConnectScanned={handleConnectScanned}
            showAlert={showAlert}
          />)}
          {/* ===== SEND DATA SECTION ===== */}
          {activeTab === "send" && viewMode === "table" && (
            <div className="mb-4 ">
              <div className='h-12 border-b border-gray-200 dark:border-gray-700 items-center flex mb-2'>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white ">
                  Chọn dữ liệu cần gửi:
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableTables
                  .sort((a, b) => b.priority - a.priority)
                  .map((table) => (
                    <div
                      key={table.name}
                      className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTables.includes(table.name)}
                        onChange={() => handleTableToggle(table.name)}
                        disabled={syncing}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white">
                          {table.label}
                        </div>
                        {metadata[table.name] && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {metadata[table.name].count} records
                            {selectedRecords[table.name]?.length > 0 && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400">
                                ({selectedRecords[table.name].length} đã chọn)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => loadTableRecords(table.name)}
                        disabled={syncing}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ))}
              </div>

              {isManualConnected && selectedTables.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSendToManualServer}
                    disabled={syncing}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded font-semibold"
                  >
                    {syncing
                      ? "Đang gửi..."
                      : `Gửi toàn bộ dữ liệu: ${selectedTables.length} bảng`}
                  </button>
                </div>
              )}
            </div>)}
          {activeTab === "send" && viewMode !== "table" && (<RecordsView
            selectedTableForRecords={selectedTableForRecords}
            tableRecords={tableRecords}
            loadingRecords={loadingRecords}
            selectedRecords={selectedRecords}
            tableColumns={tableColumns}
            columnConfig={columnConfig}
            setTableColumns={setTableColumns}
            setColumnConfig={setColumnConfig}
            selectedDataRows={selectedDataRows}
            setSelectedDataRows={setSelectedDataRows}
            selectedCompDKRecords={selectedCompDKRecords}
            setSelectedCompDKRecords={setSelectedCompDKRecords}
            showCompDKMultiView={showCompDKMultiView}
            expandedCards={expandedCards}
            setExpandedCards={setExpandedCards}
            isManualConnected={isManualConnected}
            syncing={syncing}
            isRecordSelectorExpanded={isRecordSelectorExpanded}
            setIsRecordSelectorExpanded={setIsRecordSelectorExpanded}
            handleRecordToggle={handleRecordToggle}
            handleSelectAllRecords={handleSelectAllRecords}
            handleDeselectAllRecords={handleDeselectAllRecords}
            handleDeleteSelectedRecords={handleDeleteSelectedRecords}
            handleSyncSelectedDataRows={handleSyncSelectedDataRows}
            handleShowRecordDetail={handleShowRecordDetail}
            handleDeleteRecord={handleDeleteRecord}
            handleBackToTableView={handleBackToTableView}
            toggleCompDKMultiView={toggleCompDKMultiView}
            toggleCompDKRecord={toggleCompDKRecord}
            handleSendToManualServer={handleSendToManualServer}
          />)}
          {/* ===== RECEIVE DATA SECTION ===== */}
          {activeTab === "receive" && (<StagingSection
            stagingSessions={stagingSessions}
            stagingView={stagingView}
            activeSession={activeSession}
            stagingData={stagingData}
            stagingMappings={stagingMappings}
            setStagingMappings={setStagingMappings}
            stagingTableFilter={stagingTableFilter}
            setStagingTableFilter={setStagingTableFilter}
            localRecords={localRecords}
            loadingStaging={loadingStaging}
            applyingStaging={applyingStaging}
            localIP={localIP}
            stagingDetailRecord={stagingDetailRecord}
            setStagingDetailRecord={setStagingDetailRecord}
            loadStagingSessions={loadStagingSessions}
            handleOpenSession={handleOpenSession}
            handleDeleteSession={handleDeleteSession}
            handleApplyStaging={handleApplyStaging}
            handleUpdateMapping={handleUpdateMapping}
            handleCloseReview={handleCloseReview}
          />)}
          {/* ===== CLEANUP SECTION ===== */}
          {activeTab === "clean" && (
            <div className=" bg-white dark:bg-gray-800">
              <div className='h-12 border-b border-gray-200 dark:border-gray-700 items-center flex mb-2'>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white ">
                  Dọn dữ liệu
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Xóa các bảng không cần thiết trong database để giải phóng dung lượng
              </p>
              <button
                onClick={handleOpenCleanupModal}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded font-semibold"
              >
                Quản lý bảng dữ liệu
              </button>
            </div>)}
        </div>
      </div>
      {/* ===== SYNC PROGRESS ===== */}
      {syncing && Object.keys(syncProgress).length > 0 && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Tiến trình đồng bộ
          </h2>
          <div className="space-y-4">
            {Object.entries(syncProgress).map(([table, progress]) => (
              <div key={table}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {availableTables.find((t) => t.name === table)?.label || table}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {progress.current}/{progress.total} ({progress.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== STAGING DETAIL RECORD MODAL ===== */}
      {stagingDetailRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stagingDetailRecord.type === "incoming" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                    {stagingDetailRecord.type === "incoming" ? "Chi tiết dữ liệu máy gửi" : "Chi tiết dữ liệu hiện tại"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {stagingDetailRecord.type === "incoming" ? "Dữ liệu đang chờ duyệt để đồng bộ vào hệ thống" : "Dữ liệu đang có sẵn trong cơ sở dữ liệu"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStagingDetailRecord(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors focus:outline-none"
                title="Đóng (Esc)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto p-6 flex-1 bg-gray-50/30 dark:bg-gray-900/30">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 w-1/3">Trường dữ liệu</th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {Object.entries(stagingDetailRecord.data || {}).map(([key, value]) => {
                      let isObject = value !== null && typeof value === 'object';
                      let parsedValue = value;
                      let isArrayOfArrays = false;

                      if (typeof value === 'string') {
                        try {
                          const parsed = JSON.parse(value);
                          if (parsed !== null && typeof parsed === 'object') {
                            parsedValue = parsed;
                            isObject = true;
                          }
                        } catch (e) { }
                      }

                      if (Array.isArray(parsedValue) && parsedValue.length > 0 && Array.isArray(parsedValue[0])) {
                        isArrayOfArrays = true;
                      }

                      const displayValue = isObject ? JSON.stringify(parsedValue, null, 2) : String(parsedValue ?? "—");
                      // Bỏ qua các field dài/cấu trúc json phức tạp nội bộ
                      if (HIDDEN_DETAIL_KEYS.includes(key)) return null;

                      return (
                        <tr key={key} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3 align-top break-words w-[30%]">
                            <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                              {META_FIELDS_NAME[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                            </div>
                            <div className="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {key}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200 align-top">
                            {isArrayOfArrays ? (
                              <div className="max-h-[300px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-sm">
                                <table className="w-full text-[11px] text-left">
                                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                      <th className="px-2 py-1.5 border-r border-gray-200 dark:border-gray-600 text-center w-8 text-gray-500 dark:text-gray-400">#</th>
                                      {parsedValue[0].map((h, i) => (
                                        <th key={i} className="px-3 py-1.5 font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 whitespace-nowrap">{String(h ?? "")}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {parsedValue.slice(1).map((row, rowIdx) => (
                                      <tr key={rowIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-2 py-1 text-center text-gray-400 border-r border-gray-100 dark:border-gray-700">{rowIdx + 1}</td>
                                        {row.map((cell, cellIdx) => (
                                          <td key={cellIdx} className="px-3 py-1 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">
                                            <div className="max-w-[200px] truncate" title={String(cell ?? "")}>{String(cell ?? "-")}</div>
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : isObject || displayValue.length > 50 ? (
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                                <pre className="text-[11px] font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                  {displayValue}
                                </pre>
                              </div>
                            ) : (
                              <span className={value == null ? "text-gray-400 italic" : "font-medium"}>
                                {displayValue}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setStagingDetailRecord(null)}
                className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== INCOMING REQUEST MODAL ===== */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-blue-500 dark:border-blue-600">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Yêu cầu đồng bộ dữ liệu
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Máy {incomingRequest.source_device} muốn gử i dữ liệu:
            </p>
            <ul className="mb-4 space-y-2">
              {incomingRequest.tables.map((table) => (
                <li key={table} className="text-gray-600 dark:text-gray-400">
                  ✓ {incomingRequest.metadata[table]?.label || table}:{" "}
                  {incomingRequest.metadata[table]?.count || 0} records
                </li>
              ))}
            </ul>
            <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Cảnh báo: Dữ liệu hiện tại sẽ bị ghi đè. Nên backup database trước khi nhọn.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptRequest}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold"
              >
                Chấp nhọn
              </button>
              <button
                onClick={handleRejectRequest}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RECORD DETAIL MODAL ===== */}
      <RecordDetailModal
        show={showRecordDetail}
        record={detailRecord}
        onClose={handleCloseRecordDetail}
      />

      {/* ===== DATABASE CLEANUP MODAL ===== */}
      <DatabaseCleanupModal
        show={showCleanupModal}
        allDatabaseTables={allDatabaseTables}
        selectedTablesToDelete={selectedTablesToDelete}
        loadingCleanup={loadingCleanup}
        handleTableDeleteToggle={handleTableDeleteToggle}
        handleDeleteTables={handleDeleteTables}
        onClose={() => setShowCleanupModal(false)}
      />

      {/* ===== CONFIRM/ALERT MODAL ===== */}
      <ConfirmModal {...modalProps} />
    </div>
  );
};

export default DataSync;
