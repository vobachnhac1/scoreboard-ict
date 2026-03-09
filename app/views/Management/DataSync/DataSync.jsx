import React from "react";
import { useTranslation } from "react-i18next";
import { useDataSync } from "./hooks/useDataSync";
import NetworkConnection from "./components/NetworkConnection";
import RecordsView from "./components/RecordsView";
import StagingSection from "./components/StagingSection";
import DatabaseCleanupModal from "./components/DatabaseCleanupModal";
import RecordDetailModal from "./components/RecordDetailModal";
import BackupSection from "./components/BackupSection";
import ProcessingControlModal from "./components/ProcessingControlModal";
import ConfirmModal from "../../../components/ConfirmModal";
import { META_FIELDS_NAME, HIDDEN_DETAIL_KEYS } from "./constants";

const DataSync = () => {
  const { t } = useTranslation();
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
    editingMappingRecord, setEditingMappingRecord,
    allDatabaseTables, selectedTablesToDelete,
    showCleanupModal, setShowCleanupModal, loadingCleanup,
    handleRefreshAll, handleTableToggle, handleRecordToggle,
    handleSelectAllRecords, handleDeselectAllRecords,
    handleBackToTableView, handleShowRecordDetail, handleCloseRecordDetail,
    handleDeleteRecord, handleDeleteSelectedRecords,
    toggleCompDKMultiView, toggleCompDKRecord,
    handleManualConnect, handleManualDisconnect, handleScanNetwork, handleConnectScanned,
    handleSendToManualServer, handleSyncSelectedDataRows, handleQuickSyncAll,
    handleAcceptRequest, handleRejectRequest,
    loadTableRecords, loadStagingSessions,
    handleOpenSession, handleCloseReview, handleDeleteSession, handleApplyStaging,
    handleUpdateMapping,
    handleOpenCleanupModal, handleTableDeleteToggle, handleDeleteTables,
    modalProps, showAlert, showConfirm, showError, showSuccess, showWarning
  } = useDataSync();

  // Xử lý tabar
  const [activeTab, setActiveTab] = React.useState("connect"); // send / receive / connect / clean
  const [cloudBackups, setCloudBackups] = React.useState([]);
  const [isLoadingCloud, setIsLoadingCloud] = React.useState(false);
  const [isCloudConnected, setIsCloudConnected] = React.useState(false);
  const [authUrl, setAuthUrl] = React.useState(null);
  const [authCode, setAuthCode] = React.useState("");
  const [authMode, setAuthMode] = React.useState("service_account");

  // FTP State
  const [ftpBackups, setFtpBackups] = React.useState([]);
  const [isLoadingFtp, setIsLoadingFtp] = React.useState(false);

  const checkCloudStatus = async () => {
    try {
      const res = await fetch("http://localhost:6789/api/sync/cloud/status");
      const data = await res.json();
      if (data.success) {
        setIsCloudConnected(data.data.isAuthenticated);
        setAuthUrl(data.data.authUrl);
        setAuthMode(data.data.authMode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloudAuthorize = async () => {
    if (!authCode.trim()) return showAlert("Vui lòng nhập mã xác thực từ Google");
    setIsLoadingCloud(true);
    try {
      const res = await fetch("http://localhost:6789/api/sync/cloud/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Kết nối Google Drive thành công!");
        setIsCloudConnected(true);
        setAuthCode("");
        refreshCloudBackups();
      } else {
        showError("Lỗi: " + data.message);
      }
    } catch (err) {
      showError("Lỗi xác thực: " + err.message);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const refreshCloudBackups = async () => {
    setIsLoadingCloud(true);
    try {
      await checkCloudStatus();
      const res = await fetch("http://localhost:6789/api/sync/cloud/backups");
      const data = await res.json();
      if (data.success) {
        setCloudBackups(data.data);
      } else if (data.isAuthError) {
        setIsCloudConnected(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const handleCloudBackup = async () => {
    const confirm = await showConfirm("Bạn có muốn sao lưu dữ liệu hiện tại lên Google Drive?");
    if (!confirm) return;
    setIsLoadingCloud(true);
    try {
      const res = await fetch("http://localhost:6789/api/sync/cloud/backup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showSuccess("Sao lưu Cloud thành công!");
        refreshCloudBackups();
      } else {
        showError("Lỗi: " + data.message);
      }
    } catch (err) {
      showError("Lỗi kết nối: " + err.message);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const handleCloudRestore = async (fileId) => {
    const confirm = await showConfirm("CẢNH BÁO: Thao tác này sẽ GHI ĐÈ dữ liệu hiện tại từ bản sao lưu Cloud và KHỞI ĐỘNG LẠI phần mềm. Tiếp tục?");
    if (!confirm) return;
    setIsLoadingCloud(true);
    try {
      const res = await fetch("http://localhost:6789/api/sync/cloud/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Khôi phục thành công! Ứng dụng sẽ reload.");
        window.location.reload();
      } else {
        showError("Lỗi: " + data.message);
      }
    } catch (err) {
      showError("Lỗi: " + err.message);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  // FTP Handlers
  const refreshFtpBackups = async () => {
    setIsLoadingFtp(true);
    try {
      const res = await fetch("http://localhost:6789/api/sync/ftp/backups");
      const data = await res.json();
      if (data.success) {
        setFtpBackups(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  const handleFtpBackup = async () => {
    const confirm = await showConfirm(t("data_sync.confirm_backup_ftp", "Bạn có muốn sao lưu dữ liệu hiện tại lên máy chủ FTP?"));
    if (!confirm) return;
    setIsLoadingFtp(true);
    try {
      const res = await fetch("http://localhost:6789/api/sync/ftp/backup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showSuccess(t("data_sync.backup_success", "Sao lưu thành công!"));
        refreshFtpBackups();
      } else {
        showError(t("common.error", "Lỗi") + ": " + data.message);
      }
    } catch (err) {
      showError(t("common.error", "Lỗi") + " " + t("common.connection", "kết nối") + " FTP: " + err.message);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  const handleFtpRestore = async (filePath) => {
    const confirm = await showConfirm(t("data_sync.confirm_restore_ftp", "CẢNH BÁO: Thao tác này sẽ GHI ĐÈ dữ liệu hiện tại từ bản sao lưu FTP và KHỞI ĐỘNG LẠI phần mềm. Tiếp tục?"));
    if (!confirm) return;
    setIsLoadingFtp(true);
    try {
      const res = await fetch("http://localhost:6789/api/sync/ftp/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(t("data_sync.restore_success", "Khôi phục thành công! Ứng dụng sẽ reload."));
        // window.location.reload(); // Server will restart electron app
      } else {
        showError(t("common.error", "Lỗi") + ": " + data.message);
      }
    } catch (err) {
      showError(t("common.error", "Lỗi") + ": " + err.message);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  const handleTestFtpConnection = async () => {
    setIsLoadingFtp(true);
    try {
      console.log('Testing FTP connection...');
      const res = await fetch("http://localhost:6789/api/sync/ftp/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showSuccess("Kết nối FTP SUCCESS! \n\n" + data.message);
      } else {
        showError("Kết nối FTP FAILED! \n\n" + data.message);
      }
    } catch (err) {
      showError("Lỗi kiểm tra kết nối: " + err.message);
    } finally {
      setIsLoadingFtp(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === "backup") {
      refreshCloudBackups();
      refreshFtpBackups();
    }
  }, [activeTab]);


  return (
    <div className="p-8 bg-blue-50/30 dark:bg-gray-900 min-h-screen">

      {/* ===== HEADER - Premium Design ===== */}
      <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 py-4 pb-12 border-b border-blue-100 dark:border-blue-900/30 min-h-[120px]">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 flex-shrink-0">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-blue-700 dark:text-blue-400 tracking-tight leading-tight py-1 ">
              {t("data_sync.title").toUpperCase()}
            </h1>
            <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest opacity-80 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              {t("data_sync.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="group flex items-center gap-4 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded border-0 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <div className={`p-1.5 rounded-xl bg-white/20 group-hover:rotate-180 transition-transform duration-700 ${isRefreshing ? "animate-spin" : ""}`}>
              <svg className="w-5 h-5 text-white text-sm font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">
              {isRefreshing ? t("data_sync.processing") : t("data_sync.refresh_data")}
            </span>
          </button>
        </div>
      </div>

      {/* ===== TABS - Modern Pill Style ===== */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 mb-8">
        <div className="flex flex-wrap items-center gap-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border-2 border-blue-50 dark:border-blue-900/30 w-fit mb-8">
          <button
            onClick={() => setActiveTab("connect")}
            className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "connect"
              ? "bg-blue-600 text-white shadow-blue-500/30 scale-105"
              : "text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
              }`}
          > {t("data_sync.connect_server")} </button>

          <div className="w-px h-6 bg-blue-100 dark:bg-blue-900/50 mx-1"></div>

          <button
            onClick={() => setActiveTab("send")}
            className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "send"
              ? "bg-blue-600 text-white scale-105"
              : "text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
              }`}
          > {t("data_sync.send_data")} </button>

          <button
            onClick={() => setActiveTab("receive")}
            className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "receive"
              ? "bg-blue-600 text-white scale-105"
              : "text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40"
              }`}
          > {t("data_sync.receive_data")} </button>

          <div className="w-px h-6 bg-blue-100 dark:bg-blue-900/50 mx-1"></div>

          <button
            onClick={() => setActiveTab("clean")}
            className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "clean"
              ? "bg-rose-600 text-white shadow-rose-500/30 scale-105"
              : "text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40"
              }`}
          > {t("data_sync.clean_data")} </button>

          <div className="w-px h-6 bg-blue-100 dark:bg-blue-900/50 mx-1"></div>

          <button
            onClick={() => setActiveTab("backup")}
            className={`m-1 px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === "backup"
              ? "bg-amber-600 text-white shadow-amber-500/30 scale-105"
              : "text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/40"
              }`}
          > {t("data_sync.backup_restore", { defaultValue: "SAO LƯU & KHÔI PHỤC" })} </button>
        </div>

        {/* TAB CONTENT - Premium Card Layout */}
        <div className="mb-0 bg-transparent">
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
            handleQuickSyncAll={handleQuickSyncAll}
            syncing={syncing}
            showAlert={showAlert}
          />)}
          {/* ===== SEND DATA SECTION - Table Grid Design ===== */}
          {activeTab === "send" && viewMode === "table" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.system_database_category")}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {availableTables
                  .sort((a, b) => b.priority - a.priority)
                  .map((table) => (
                    <div
                      key={table.name}
                      onClick={() => handleTableToggle(table.name)}
                      className={`group relative p-5 rounded border-2 transition-all duration-300 cursor-pointer overflow-hidden ${selectedTables.includes(table.name)
                        ? "bg-blue-600 border-blue-600 shadow-blue-500/20"
                        : "bg-white dark:bg-gray-800 border-blue-50 dark:border-blue-900/30 hover:border-blue-200 hover:shadow-lg shadow-blue-500/5"}`}
                    >
                      {selectedTables.includes(table.name) && (
                        <div className="absolute top-0 right-0 p-4">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        </div>
                      )}

                      <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${selectedTables.includes(table.name) ? "bg-white/10 border-white/20 text-white" : "bg-blue-50 dark:bg-blue-900/50 border-blue-100 dark:border-blue-800 text-blue-600"}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                          </div>
                          <span className={`text-sm font-black uppercase tracking-tight ${selectedTables.includes(table.name) ? "text-white" : "text-blue-950 dark:text-blue-100"}`}>
                            {table.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-2">
                          {metadata[table.name] && (
                            <div className={`text-[10px] font-black uppercase tracking-widest ${selectedTables.includes(table.name) ? "text-white/60" : "text-gray-400 dark:text-gray-500"}`}>
                              {t("data_sync.records_count", { count: metadata[table.name].count })}
                              {selectedRecords[table.name]?.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-blue-900/10 rounded dark:bg-blue-100/10">
                                  ✓ {t("data_sync.items_selected", { count: selectedRecords[table.name].length })}
                                </span>
                              )}
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); loadTableRecords(table.name); }}
                            disabled={syncing}
                            className={`px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all ${selectedTables.includes(table.name)
                              ? "bg-white text-blue-600 hover:bg-blue-50"
                              : "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white shadow-inner"}`}
                          >
                            {t("data_sync.detail")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {isManualConnected && selectedTables.length > 0 && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSendToManualServer}
                    disabled={syncing}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-4"
                  >
                    {syncing ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {t("data_sync.processing").toUpperCase()}</>
                    ) : (
                      <>
                        {t("data_sync.send_data_package", { count: selectedTables.length })}
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>)}

          {activeTab === "send" && viewMode !== "table" && (<RecordsView
            availableTables={availableTables}
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
            handleCloseReview={handleCloseReview}
            handleDeleteSession={handleDeleteSession}
            handleApplyStaging={handleApplyStaging}
            handleUpdateMapping={handleUpdateMapping}
            setEditingMappingRecord={setEditingMappingRecord}
          />)}

          {/* ===== CLEANUP SECTION - Modern Control Card ===== */}
          {activeTab === "clean" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative p-10 bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 shadow-2xl shadow-blue-500/5 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <svg className="w-40 h-40 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>

                <div className="relative z-10 max-w-xl">
                  <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 rounded flex items-center justify-center text-rose-500 mb-8 border border-rose-100 dark:border-rose-800">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>

                  <h2 className="text-[11px] font-black text-rose-400 dark:text-rose-500 uppercase tracking-[0.3em] mb-4">{t("data_sync.maintenance_process")}</h2>
                  <h3 className="text-3xl font-black text-blue-950 dark:text-blue-100 tracking-tight mb-6">{t("data_sync.cleanup_free_database")}</h3>

                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed mb-10">
                    {t("data_sync.maintenance_desc")}
                    <span className="text-rose-500 block mt-2 animate-pulse">{t("data_sync.maintenance_warning")}</span>
                  </p>

                  <button
                    onClick={handleOpenCleanupModal}
                    className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-black uppercase tracking-[0.2em] shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-4"
                  >
                    {t("data_sync.start_cleanup")}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                </div>
              </div>
            </div>)}

          {/* ===== BACKUP & RESTORE DASHBOARD ===== */}
          {activeTab === "backup" && (
            <BackupSection
              t={t}
              ftpBackups={ftpBackups}
              isLoadingFtp={isLoadingFtp}
              handleFtpBackup={handleFtpBackup}
              handleFtpRestore={handleFtpRestore}
              handleTestFtpConnection={handleTestFtpConnection}
              refreshFtpBackups={refreshFtpBackups}
              showConfirm={showConfirm}
              showError={showError}
              showSuccess={showSuccess}
            />
          )}

        </div>
      </div>

      {/* ===== SYNC PROGRESS - Premium Overlay ===== */}
      {syncing && Object.keys(syncProgress).length > 0 && (
        <div className="fixed bottom-10 right-10 z-[70] w-96 p-8 bg-white/90 dark:bg-gray-800/90 rounded border border-blue-50 dark:border-blue-900/30 shadow-2xl shadow-blue-500/20 animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">{t("data_sync.processing_status")}</h2>
              <div className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tighter">{t("data_sync.data_sync_pipeline")}</div>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
          </div>

          <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(syncProgress).map(([table, progress]) => (
              <div key={table} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-blue-950 dark:text-blue-200 uppercase tracking-tight">
                    {availableTables.find((t) => t.name === table)?.label || table}
                  </span>
                  <div className="text-[11px] font-mono font-bold text-blue-600">
                    {progress.current}/{progress.total} <span className="text-gray-400 text-[9px] font-light">[{progress.percentage}%]</span>
                  </div>
                </div>
                <div className="relative h-2 bg-blue-50 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute inset-0 bg-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-blue-50 dark:border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{t("data_sync.active_connection")}</span>
            </div>
            <span className="text-[9px] font-black text-blue-900 dark:text-blue-100 uppercase bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">{t("data_sync.encrypted_transfer")}</span>
          </div>
        </div>
      )}

      {/* ===== STAGING DETAIL RECORD MODAL - Premium Layout ===== */}
      {stagingDetailRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-blue-950/40" onClick={() => setStagingDetailRecord(null)}></div>

          <div className="relative bg-white dark:bg-gray-800 rounded shadow-2xl shadow-blue-500/10 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-blue-50 dark:border-blue-900/30">
            {/* Modal Header */}
            <div className={`px-10 py-8 flex items-center justify-between border-b ${stagingDetailRecord.type === "incoming" ? "bg-blue-600 border-blue-500" : "bg-blue-600 border-blue-500"}`}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center text-white border border-white/30">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-1">{t("data_sync.data_details_check")}</h2>
                  <h3 className="text-3xl font-black text-white tracking-tight uppercase">
                    {stagingDetailRecord.type === "incoming" ? t("data_sync.source_machine_data") : t("data_sync.target_machine_data")}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setStagingDetailRecord(null)}
                className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 border border-white/20"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto p-10 flex-1 bg-gray-50/10 dark:bg-gray-900/40 custom-scrollbar">
              <div className="rounded border-2 border-blue-50/50 dark:border-blue-900/20 bg-white dark:bg-gray-800 shadow-2xl shadow-blue-500/5 overflow-hidden">
                <div className="overflow-x-auto w-full custom-scrollbar">
                  <table className="w-full min-w-max text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-50 dark:border-blue-900/30">
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/50 dark:text-blue-100/50 border-r border-blue-50 dark:border-blue-900/20 max-w-[150px] ">{t("data_sync.data_field")}</th>
                        <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-900/50 dark:text-blue-100/50">{t("data_sync.detail_value")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50/50 dark:divide-blue-900/10">
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
                        if (HIDDEN_DETAIL_KEYS.includes(key)) return null;

                        return (
                          <tr key={key} className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                            <td className="px-8 py-6 align-top border-r border-blue-50 dark:border-blue-900/10">
                              <div className="text-[11px] font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-1">
                                {t(`data_sync.meta_labels.${key}`, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ') })}
                              </div>
                              {/* <div className="font-mono text-[9px] text-blue-400 dark:text-blue-500 uppercase tracking-widest font-black opacity-60">
                                {key}
                              </div> */}
                            </td>
                            <td className="px-8 py-6 align-top">
                              {isArrayOfArrays ? (
                                <div className="rounded border-2 border-blue-50 dark:border-blue-900/30 overflow-hidden shadow-lg shadow-blue-500/5">
                                  <div className="max-h-[400px] overflow-auto custom-scrollbar">
                                    <table className="w-full min-w-max text-left border-collapse">
                                      <thead className="sticky top-0 z-10">
                                        <tr className="bg-blue-50/80 dark:bg-blue-900/60">
                                          <th className="px-3 py-2 border-r border-blue-100 dark:border-blue-800 text-center w-10 text-[9px] font-black text-blue-400 uppercase tracking-widest">#</th>
                                          {parsedValue[0].map((h, i) => (
                                            <th key={i} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-blue-900/60 dark:text-blue-100/60 border-r border-blue-100 dark:border-blue-800 whitespace-nowrap">{String(h ?? "")}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-blue-50/50 dark:divide-blue-900/20">
                                        {parsedValue.slice(1).map((row, rowIdx) => (
                                          <tr key={rowIdx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                                            <td className="px-3 py-1.5 text-center text-[10px] font-mono text-gray-400 border-r border-blue-50 dark:border-blue-900/10 font-bold">{rowIdx + 1}</td>
                                            {row.map((cell, cellIdx) => (
                                              <td key={cellIdx} className="px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 border-r border-blue-50 dark:border-blue-900/10">
                                                <div className="max-w-[250px] truncate" title={String(cell ?? "")}>{String(cell ?? "-")}</div>
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : key === 'referrers' && isObject ? (() => {
                                const refData = Array.isArray(parsedValue) ? parsedValue : Object.values(parsedValue);
                                if (refData.length === 0) return <div className="text-gray-400 italic">No referrers</div>;
                                const cols = Object.keys(refData[0]).filter(c => c?.toUpperCase() !== 'REFEREE_ID');
                                return (
                                  <div className="rounded border-2 border-blue-50 dark:border-blue-900/30 overflow-hidden shadow-lg shadow-blue-500/5">
                                    <div className="max-h-[400px] overflow-auto custom-scrollbar">
                                      <table className="w-full min-w-max text-left border-collapse">
                                        <thead className="sticky top-0 z-10">
                                          <tr className="bg-blue-50/80 dark:bg-blue-900/60">
                                            <th className="px-3 py-2 border-r border-blue-100 dark:border-blue-800 text-center w-10 text-[9px] font-black text-blue-400 uppercase tracking-widest">#</th>
                                            {cols.map((col) => (
                                              <th key={col} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-blue-900/60 dark:text-blue-100/60 border-r border-blue-100 dark:border-blue-800 whitespace-nowrap">{t(`data_sync.meta_labels.${col}`, { defaultValue: col })}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-50/50 dark:divide-blue-900/20">
                                          {refData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                                              <td className="px-3 py-1.5 text-center text-[10px] font-mono text-gray-400 border-r border-blue-50 dark:border-blue-900/10 font-bold">{idx + 1}</td>
                                              {cols.map((col) => (
                                                <td key={col} className="px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 border-r border-blue-50 dark:border-blue-900/10">
                                                  <div className="max-w-[250px] truncate" title={String(row[col] ?? "")}>
                                                    {col === 'role' ? (t(`data_sync.role_labels.${row[col]}`, { defaultValue: row[col] })) : String(row[col] ?? "-")}
                                                  </div>
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              })() : isObject || displayValue.length > 50 ? (
                                <div className="bg-blue-50/30 dark:bg-black/30 p-5 rounded border-2 border-blue-50 dark:border-blue-900/30 shadow-inner">
                                  <pre className="text-[11px] font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {displayValue}
                                  </pre>
                                </div>
                              ) : (
                                <div className={`text-sm font-black tracking-tight ${value == null ? "text-gray-300 italic opacity-50" : "text-gray-800 dark:text-blue-100"}`}>
                                  {displayValue}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-blue-50 dark:border-blue-900/30 bg-gray-50/30 dark:bg-gray-900 flex justify-end">
              <button
                onClick={() => setStagingDetailRecord(null)}
                className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-blue-50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-blue-500/5 active:scale-95 transition-all"
              >
                {t("data_sync.close_details")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== INCOMING REQUEST MODAL ===== */}
      {incomingRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-blue-950/60"></div>

          <div className="relative bg-white dark:bg-gray-900 rounded p-12 max-w-xl w-full mx-4 shadow-[0_32px_128px_-16px_rgba(59,130,246,0.25)] border-4 border-blue-500 dark:border-blue-600 animate-in zoom-in-95 duration-500">
            {/* Pulsing Indicator Icon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25"></div>
                <div className="w-24 h-24 bg-blue-600 rounded-full border-8 border-white dark:border-gray-900 shadow-2xl flex items-center justify-center text-white relative z-10">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 mb-10">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-3">{t("data_sync.system_notification")}</h3>
              <h2 className="text-4xl font-black text-blue-950 dark:text-blue-100 tracking-tight leading-none mb-4 uppercase">
                {t("data_sync.sync_request")}
              </h2>
              <div className="flex items-center justify-center gap-2 group">
                <div className="w-10 h-0.5 bg-blue-100 dark:bg-blue-900 rounded-full transition-all group-hover:w-16"></div>
                <div className="text-sm font-bold text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: t("data_sync.device_sending_data", { device: incomingRequest.source_device }) }} />
                <div className="w-10 h-0.5 bg-blue-100 dark:bg-blue-900 rounded-full transition-all group-hover:w-16"></div>
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded p-8 border-2 border-blue-100/50 dark:border-blue-800/30 mb-8 max-h-[250px] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {incomingRequest.tables.map((table) => (
                  <div key={table} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded shadow-sm border border-blue-50 dark:border-blue-900/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      </div>
                      <span className="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">
                        {incomingRequest.metadata[table]?.label || table}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">
                      {t("data_sync.records_count", { count: incomingRequest.metadata[table]?.count || 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-900/30 rounded border-2 border-amber-200 dark:border-amber-800/50 mb-10">
              <div className="w-10 h-10 bg-amber-200 dark:bg-amber-900 flex items-center justify-center rounded text-amber-700 dark:text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 leading-relaxed pt-1">
                {t("data_sync.overwrite_warning")}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAcceptRequest}
                className="flex-[2] px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {t("data_sync.accept_sync")}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button
                onClick={handleRejectRequest}
                className="flex-1 px-8 py-5 bg-white dark:bg-gray-800 border-2 border-rose-50 dark:border-rose-900/30 hover:bg-rose-50 text-rose-600 dark:text-rose-400 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {t("data_sync.reject")}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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

      {/* ===== PROCESSING CONTROL MODAL ===== */}
      <ProcessingControlModal
        show={!!editingMappingRecord}
        staging={editingMappingRecord}
        mapping={editingMappingRecord ? stagingMappings[editingMappingRecord.id] : null}
        localList={editingMappingRecord ? localRecords[editingMappingRecord.table_name] || [] : []}
        handleUpdateMapping={handleUpdateMapping}
        tableName={editingMappingRecord?.table_name}
        t_name={editingMappingRecord ? (editingMappingRecord.table_name === 'competition_dk' ? t("data_sync.total_list") : editingMappingRecord.table_name === 'competition_match' ? t("data_sync.combat") : editingMappingRecord.table_name === 'competition_match_team' ? t("data_sync.quyen") : editingMappingRecord.table_name) : ""}
        onClose={() => setEditingMappingRecord(null)}
      />

      {/* ===== CONFIRM/ALERT MODAL ===== */}
      <ConfirmModal {...modalProps} />
    </div>
  );
};

export default DataSync;
