import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  emitSocketEvent,
  useSocketEvent,
} from "../../../../config/hooks/useSocketEvents";
import socketClient from "../../../../config/socket/SocketClient";
import IpMasker from "../../../../common/IpMasker";
import { getColumnConfig, buildColumnConfig, filterColumns } from "../utils/columnConfig";
import useConfirmModal from "../../../../hooks/useConfirmModal";

const API = "http://localhost:6789/api/sync";

export const useDataSync = () => {
  const { data: configSystem } = useSelector((state) => state.configSystem);
  const socketState = useSelector((state) => state.socket);

  // --- Confirm/Alert Modal chung ---
  const { modalProps, showAlert, showConfirm, showError, showSuccess, showWarning } = useConfirmModal();

  // --- Tables & Sync ---
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({});
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Record View ---
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'record'
  const [selectedTableForRecords, setSelectedTableForRecords] = useState(null);
  const [tableRecords, setTableRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState({});
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [tableColumns, setTableColumns] = useState([]);
  const [columnConfig, setColumnConfig] = useState({});

  // --- Record Detail Modal ---
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  // --- competition_dk Nested Row Selection ---
  const [selectedDataRows, setSelectedDataRows] = useState({}); // {recordId: [rowIndex...]}

  // --- competition_dk Multi-Record View ---
  const [selectedCompDKRecords, setSelectedCompDKRecords] = useState([]);
  const [showCompDKMultiView, setShowCompDKMultiView] = useState(true);
  const [isRecordSelectorExpanded, setIsRecordSelectorExpanded] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  // --- Network ---
  const [localIP, setLocalIP] = useState(null);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [manualServerIP, setManualServerIP] = useState("");
  const [isManualConnected, setIsManualConnected] = useState(false);
  const [manualServerInfo, setManualServerInfo] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedServers, setScannedServers] = useState([]);
  const [scanDone, setScanDone] = useState(false);

  // --- Staging ---
  const [stagingSessions, setStagingSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [stagingData, setStagingData] = useState([]);
  const [localRecords, setLocalRecords] = useState({});
  const [stagingTableFilter, setStagingTableFilter] = useState(null);
  const [stagingView, setStagingView] = useState("sessions"); // 'sessions' | 'review'
  const [loadingStaging, setLoadingStaging] = useState(false);
  const [applyingStaging, setApplyingStaging] = useState(false);
  const [stagingMappings, setStagingMappings] = useState({});
  const [stagingDetailRecord, setStagingDetailRecord] = useState(null);

  // --- DB Cleanup ---
  const [allDatabaseTables, setAllDatabaseTables] = useState([]);
  const [selectedTablesToDelete, setSelectedTablesToDelete] = useState([]);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [loadingCleanup, setLoadingCleanup] = useState(false);

  const iplocalRef = useRef(IpMasker.encodeIP(localIP));
  useEffect(() => {
    iplocalRef.current = IpMasker.encodeIP(localIP);
  }, [localIP]);

  // ========== LOAD FUNCTIONS ==========

  const loadAvailableTables = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/tables`);
      if (res.data.success) setAvailableTables(res.data.data);
    } catch (e) {
      console.error("Error loading tables:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalIP = async () => {
    try {
      const res = await axios.get(`${API}/local-ip`);
      if (res.data.success) setLocalIP(res.data.data.ip);
    } catch (e) {
      console.error("Error loading local IP:", e);
    }
  };

  const loadMetadata = async () => {
    try {
      const url =
        selectedTables.length > 0
          ? `${API}/metadata?tables=${selectedTables.join(",")}`
          : `${API}/metadata`;
      const res = await axios.get(url);
      if (res.data.success) setMetadata(res.data.data);
    } catch (e) {
      console.error("Error loading metadata:", e);
    }
  };

  const loadStagingSessions = async () => {
    try {
      setLoadingStaging(true);
      const res = await axios.get(`${API}/staging/sessions`);
      if (res.data.success) setStagingSessions(res.data.data);
    } catch (e) {
      console.error("Error loading staging sessions:", e);
    } finally {
      setLoadingStaging(false);
    }
  };

  const loadTableRecords = async (tableName) => {
    try {
      setLoadingRecords(true);
      setSelectedTableForRecords(tableName);
      setViewMode("record");

      const res = await axios.get(`${API}/records/${tableName}`);
      if (res.data.success) {
        const records = res.data.data.records;
        setTableRecords(records);

        const config = getColumnConfig(tableName);
        const { columnNameMap, visibleColumns, hiddenColumns } = config;

        if (records.length > 0) {
          const allColumns = Object.keys(records[0]);
          const displayColumns = filterColumns(allColumns, visibleColumns, hiddenColumns);
          setTableColumns(displayColumns);
          setColumnConfig(buildColumnConfig(displayColumns, columnNameMap));
        } else {
          setTableColumns([]);
          setColumnConfig({});
        }

        setSelectedRecords((prev) => ({ ...prev, [tableName]: [] }));
      }
    } catch (e) {
      console.error("Error loading table records:", e);
      showError("Lỗi khi tải dữ liệu bảng");
    } finally {
      setLoadingRecords(false);
    }
  };

  const loadAllDatabaseTables = async () => {
    try {
      setLoadingCleanup(true);
      const res = await axios.get(`${API}/all-tables`);
      if (res.data.success) setAllDatabaseTables(res.data.data);
    } catch (e) {
      console.error("Error loading all database tables:", e);
      showError("Lỗi khi tải danh sách bảng");
    } finally {
      setLoadingCleanup(false);
    }
  };

  // ========== INIT ==========

  useEffect(() => {
    loadAvailableTables();
    loadLocalIP();
    loadStagingSessions();
    loadMetadata();
    handleScanNetwork();
  }, []);

  useEffect(() => {
    if (selectedTables.length > 0) loadMetadata();
  }, [selectedTables]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadAvailableTables(),
        loadLocalIP(),
        loadStagingSessions(),
        loadMetadata(),
        handleScanNetwork(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ========== SOCKET EVENTS ==========

  useSocketEvent("RES_ROOM_ADMIN", (response) => {
    if (response.data?.ls_conn) {
      const devices = Object.values(response.data.ls_conn).filter(
        (conn) =>
          conn.register_status_code === "ADMIN" &&
          conn.socket_id !== socketClient.getSocketId(),
      );
      setConnectedDevices(devices);
    }
  });

  useSocketEvent("SYNC_OFFER", (response) => {
    setIncomingRequest(response.data);
  });

  useSocketEvent("SYNC_READY", (response) => {
    startSendingData(response.data.target_socket_id);
  });

  useSocketEvent("SYNC_REJECTED", (response) => {
    showWarning(`Máy đích đã từ chối: ${response.data.reason}`, { title: "Bị từ chối", showCancel: false });
    setSyncing(false);
  });

  useSocketEvent("SYNC_DATA", (response) => {
    handleReceiveData(response.data);
  });

  useSocketEvent("SYNC_COMPLETE", async (response) => {
    setSyncing(false);
    setSyncProgress({});

    // Reload toàn bộ dữ liệu sau khi nhận xong
    try {
      await Promise.all([
        loadAvailableTables(),
        loadMetadata(),
        loadStagingSessions(),
      ]);
    } catch (error) {
      console.error("Error reloading data after sync:", error);
    }

    showSuccess(response.message || "Đồng bộ hoàn tất!");
  });

  useSocketEvent("SYNC_ERROR", (response) => {
    setSyncing(false);
    showError(`Lỗi đồng bộ: ${response.data.error}`);
  });

  // Lắng nghe khi có dữ liệu staging mới từ máy khác
  useSocketEvent("STAGING_DATA_RECEIVED", async (response) => {
    console.log("📥 Nhận dữ liệu staging mới:", response.data);

    // Reload staging sessions để hiển thị data mới
    try {
      await loadStagingSessions();

      // Hiển thị notification cho user
      const { table, count, source_ip } = response.data;
      showSuccess(
        `Đã nhận ${count} bản ghi từ ${source_ip}\\nBảng: ${table}\\n\\nVui lòng kiểm tra và áp dụng.`,
        { title: "Có dữ liệu mới!" }
      );
    } catch (error) {
      console.error("Error reloading staging after receive:", error);
    }
  });

  // ========== TABLE SELECTION ==========

  const handleTableToggle = (tableName) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName],
    );
  };

  // ========== RECORD VIEW ==========

  const handleRecordToggle = (tableName, recordId) => {
    setSelectedRecords((prev) => {
      const current = prev[tableName] || [];
      const isSelected = current.includes(recordId);
      return {
        ...prev,
        [tableName]: isSelected ? current.filter((id) => id !== recordId) : [...current, recordId],
      };
    });
  };

  const handleSelectAllRecords = (tableName) => {
    setSelectedRecords((prev) => ({ ...prev, [tableName]: tableRecords.map((r) => r.id) }));
  };

  const handleDeselectAllRecords = (tableName) => {
    setSelectedRecords((prev) => ({ ...prev, [tableName]: [] }));
  };

  const handleBackToTableView = () => {
    setViewMode("table");
    setSelectedTableForRecords(null);
    setTableRecords([]);
    setTableColumns([]);
    setSelectedDataRows({});
    // setShowCompDKMultiView(false);
    setSelectedCompDKRecords([]);
    setIsRecordSelectorExpanded(false);
    setExpandedCards({});
  };

  const handleShowRecordDetail = (record) => {
    setDetailRecord(record);
    setShowRecordDetail(true);
  };

  const handleCloseRecordDetail = () => {
    setShowRecordDetail(false);
    setDetailRecord(null);
  };

  // ========== COMPETITION_DK MULTI-VIEW ==========

  const toggleCompDKMultiView = () => {
    if (!showCompDKMultiView) {
      setIsRecordSelectorExpanded(false);
      setExpandedCards({});
    } else {
      setSelectedCompDKRecords([]);
      setIsRecordSelectorExpanded(false);
      setExpandedCards({});
    }
    // setShowCompDKMultiView((v) => !v);
  };

  const toggleCompDKRecord = (recordId) => {
    setSelectedCompDKRecords((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId],
    );
  };

  const toggleCardExpand = (recordId) => {
    setExpandedCards((prev) => ({ ...prev, [recordId]: !prev[recordId] }));
  };

  // ========== NETWORK ==========

  const resolveIP = (input) => {
    const trimmed = input.trim();
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(trimmed)) return { ip: trimmed, wasEncoded: false };
    const decoded = IpMasker.decodeIP(trimmed);
    if (decoded) return { ip: decoded, wasEncoded: true };
    return { ip: null, wasEncoded: false };
  };

  const handleManualConnect = async () => {
    if (!manualServerIP.trim()) {
      showAlert("Vui lòng nhập địa chỉ IP hoặc mã hash của máy khác", { title: "Thiếu thông tin" });
      return;
    }
    try {
      setLoading(true);
      const { ip: resolvedIP, wasEncoded } = resolveIP(manualServerIP);
      if (!resolvedIP) {
        showAlert("Địa chỉ không hợp lệ!\n\nNhập một trong hai:\n• IP thường: 192.168.1.100\n• Mã hash: dán trực tiếp vào đây", { title: "Địa chỉ không hợp lệ" });
        return;
      }
      const targetURL = `http://${resolvedIP}:6789`;
      const res = await axios.get(`${targetURL}/api/sync/local-ip`, { timeout: 5000 });
      if (res.data.success) {
        setIsManualConnected(true);
        setManualServerInfo({
          ip: resolvedIP,
          url: targetURL,
          encodedIP: IpMasker.encodeIP(resolvedIP),
          remoteIP: res.data.data.ip,
        });
        const label = wasEncoded ? `mã hash: ${manualServerIP.trim().substring(0, 16)}...` : `IP: ${resolvedIP}`;
        showSuccess(`Kết nối thành công!\n\nMáy đích (${label})\n\nBây giờ bạn có thể chọn bảng và gửi dữ liệu.`, { title: "Kết nối thành công" });
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") showError("Kết nối timeout!\n\nKiểm tra IP/hash và đảm bảo máy đích đang chạy.", { title: "Timeout" });
      else if (error.code === "ERR_NETWORK") showError("Không thể kết nối!\n\nKiểm tra cùng WiFi và firewall.", { title: "Lỗi mạng" });
      else showError(`Lỗi kết nối: ${error.message}`, { title: "Lỗi kết nối" });
    } finally {
      setLoading(false);
    }
  };

  const handleManualDisconnect = () => {
    setIsManualConnected(false);
    setManualServerInfo(null);
    setManualServerIP("");
  };

  const handleScanNetwork = async () => {
    setIsScanning(true);
    setScanDone(false);
    setScannedServers([]);
    try {
      const res = await axios.get(`${API}/scan-network`, { timeout: 60000 });
      setScannedServers(res.data.success ? res.data.data.servers || [] : []);
    } catch {
      setScannedServers([]);
    } finally {
      setIsScanning(false);
      setScanDone(true);
    }
  };

  const handleConnectScanned = (server) => {
    setIsManualConnected(true);
    setManualServerInfo({ ip: server.ip, url: server.url, remoteIP: server.remoteIP });
    setManualServerIP(server.ip);
  };

  // ========== SEND DATA ==========

  const handleSendToManualServer = async () => {
    if (!isManualConnected || !manualServerInfo) { showAlert("Vui lòng kết nối đến máy khác trước", { title: "Chưa kết nối" }); return; }
    if (selectedTables.length === 0) { showAlert("Vui lòng chọn ít nhất 1 bảng dữ liệu", { title: "Chưa chọn bảng" }); return; }
    try {
      setSyncing(true);
      const res = await axios.get(`${API}/export?tables=${selectedTables.join(",")}`);
      if (!res.data.success) throw new Error("Export failed");
      const exportData = res.data.data;

      for (const table of selectedTables) {
        let tableData = exportData[table];
        if (!tableData || tableData.error) continue;
        if (selectedRecords[table]?.length > 0 && Array.isArray(tableData)) {
          tableData = tableData.filter((r) => selectedRecords[table].includes(r.id));
        }
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < tableData.length; i += chunkSize) chunks.push(tableData.slice(i, i + chunkSize));
        for (let i = 0; i < chunks.length; i++) {
          const sessionId = `sync_${Date.now()}_${IpMasker.mask(localIP, "hash", 999, "sync")?.display}`;
          await axios.post(`${manualServerInfo.url}/api/sync/import-staging`, { table, data: chunks[i], session_id: sessionId, source_ip: localIP }, { timeout: 30000 });
          setSyncProgress((prev) => ({ ...prev, [table]: { current: i + 1, total: chunks.length, percentage: Math.round(((i + 1) / chunks.length) * 100) } }));
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      setSyncing(false);
      setSyncProgress({});
      const totalRecords = Object.values(exportData).reduce((sum, d) => sum + (Array.isArray(d) ? d.length : 0), 0);
      showSuccess(`Đã gửi ${selectedTables.length} bảng (${totalRecords} danh sách)!\nDữ liệu đang ở trạng thái "Chờ duyệt".`, { title: "Gửi thành công" });
    } catch (error) {
      setSyncing(false);
      setSyncProgress({});
      showError(`Lỗi khi gửi dữ liệu: ${error.message}`, { title: "Lỗi gửi dữ liệu" });
    }
  };

  const handleSyncSelectedDataRows = async () => {
    // THÊM TRƯỜNG HỢP QUYỀN/ VÕ NHẠC

    if (!isManualConnected || !manualServerInfo) { showAlert("Vui lòng kết nối đến máy khác trước", { title: "Chưa kết nối" }); return; }
    const hasSelectedRows = Object.keys(selectedDataRows).some((id) => selectedDataRows[id]?.length > 0);
    if (!hasSelectedRows) { showAlert("Vui lòng chọn ít nhất 1 dòng dữ liệu", { title: "Chưa chọn dòng" }); return; }
    try {
      setSyncing(true);
      for (const record of tableRecords) {
        const rowIndices = selectedDataRows[record.id] || [];
        if (rowIndices.length === 0) continue;
        let parsedData;
        try { parsedData = typeof record.data === "string" ? JSON.parse(record.data) : record.data; } catch { continue; }
        if (!Array.isArray(parsedData) || parsedData.length < 2) continue;
        const headers = parsedData[0];
        const selectedRowsData = rowIndices.map((idx) => parsedData[idx + 1]);
        const slicedData = [headers, ...selectedRowsData];
        const slicedRecord = { ...record, data: JSON.stringify(slicedData), _original_record_id: record.id, _selected_rows: rowIndices, _total_rows: parsedData.length - 1 };
        const sessionId = `sync_rows_${Date.now()}_${record.id}`;
        if (['DOL', 'DAL', 'SOL', 'TUV', 'VON'].includes(slicedData[0][0])) {
          console.log("QUYỀN: ", slicedData);
          //TODO: 21.02.2026 THỰC HIỆN LẤY THÔNG TIN TIẾP
          // api/competition-match-team/by-dk/40
          const competition_dk_id = record.id ?? ''
          const matchesQuyenResponse = await axios.get(
            `http://localhost:6789/api/competition-match-team/by-dk/${competition_dk_id}`,
          );
          const sendBody = {
            table: "competition_dk",
            session_id: sessionId,
            source_ip: localIP,
            partial_rows: true, // chọn từng dữ liệu -> update không dùng để insert 
            data: {
              sheet_name: record.sheet_name,
              file_name: record.file_name,
              file_type: slicedData[0][0] ?? 'DK',
              items: slicedData.slice(1),
              match_detail: null,
            },
            meta: {
              sheet_name: record.sheet_name,
              file_name: record.file_name,
              file_type: slicedData[0][0] ?? 'DK',
              type: "partial_rows", // chọn từng dữ liệu -> update không dùng để insert 
              ids: slicedData.slice(1).map((r) => r[0]),
              items: slicedData.slice(1),
              match_detail: null,
            }
          }
          if (matchesQuyenResponse.data.success) {
            const matchesQuyen = matchesQuyenResponse.data.data;
            // lấy lịch sử 
            // for(let i = 0; i < matchesQuyen.length; i++){
            //    const historyResponse = await axios.get(
            //   `http://localhost:6789/api/competition-match-team/${matchesQuyen[0].id}/history`,)
            // }        

            // gáng chi tiết 
            sendBody.data.match_detail = matchesQuyen;
            sendBody.meta.match_detail = matchesQuyen;
          }
          console.log("QUYỀN | Sliced Data: ", slicedData);
          // await axios.post(`${manualServerInfo.url}/api/sync/import-staging`, sendBody, { timeout: 30000 });
          // THỰC HIỆN DEVELOP
          await axios.post(`http://localhost:6789/api/sync/import-staging`, sendBody, { timeout: 30000 });
        } else {
          // lấy danh sách match | match_history
          const competition_dk_id = record.id ?? ''
          const matchesResponse = await axios.get(
            `http://localhost:6789/api/competition-match/by-dk/${competition_dk_id}`,
          );
          const matchDetails = [];
          if (matchesResponse.data.success) {
            // danh sách trận 
            const matches = matchesResponse.data.data;
            let macthIds = slicedData.slice(1).map((r) => r[0]);
            matches.forEach((match) => {
              if (macthIds.includes(match.row_index + 1)) {
                matchDetails.push(match);
              }
            });

            // Lấy history theo match
            for (let i = 0; i < matchDetails.length; i++) {
              const historyResponse = await axios.get(
                `http://localhost:6789/api/competition-match/${matchDetails[i].id}/history`,
              );
              if (historyResponse.data.success) {
                matchDetails[i].history = historyResponse.data.data;
              }
            }
          }

          // Cải thiện input
          const sendBody = {
            table: "competition_dk",
            session_id: sessionId,
            source_ip: localIP,
            partial_rows: true, // chọn từng dữ liệu -> update không dùng để insert 
            data: {
              sheet_name: record.sheet_name,
              file_name: record.file_name,
              file_type: slicedData[0][0] ?? 'DK',
              items: slicedData.slice(1),
              match_detail: matchDetails,
            },
            meta: {
              sheet_name: record.sheet_name,
              file_name: record.file_name,
              file_type: slicedData[0][0] ?? 'DK',
              type: "partial_rows", // chọn từng dữ liệu -> update không dùng để insert 
              ids: slicedData.slice(1).map((r) => r[0]),
              items: slicedData.slice(1),
              match_detail: matchDetails,
            }
          }

          // await axios.post(`${manualServerInfo.url}/api/sync/import-staging`, sendBody, { timeout: 30000 });
          // THỰC HIỆN DEVELOP
          await axios.post(`http://localhost:6789/api/sync/import-staging`, sendBody, { timeout: 30000 });
        }
      }
      setSyncing(false);
      const totalRows = Object.values(selectedDataRows).reduce((sum, arr) => sum + arr.length, 0);
      const totalRecs = Object.keys(selectedDataRows).filter((id) => selectedDataRows[id]?.length > 0).length;
      showSuccess(`Đã gửi ${totalRows} dòng từ ${totalRecs} bản ghi!\nDữ liệu đang ở trạng thái "Chờ duyệt"!`, { title: "Gửi thành công" })
      setSelectedDataRows({});
    } catch (error) {
      setSyncing(false);
      showError(`Lỗi khi gửi dữ liệu: ${error.message}`, { title: "Lỗi gửi dữ liệu" });
    }
  };

  const handleSendRequest = () => {
    if (selectedTables.length === 0) { showAlert("Vui lòng chọn ít nhất 1 bảng dữ liệu", { title: "Chưa chọn bảng" }); return; }
    if (!selectedDevice) { showAlert("Vui lòng chọn máy đích", { title: "Chưa chọn máy đích" }); return; }
    setSyncing(true);
    emitSocketEvent("SYNC_REQUEST", { room_id: configSystem.room_code, source_device: socketClient.getSocketId(), tables: selectedTables, metadata, target_socket_id: selectedDevice });
  };

  const startSendingData = async (targetSocketId) => {
    try {
      const res = await axios.get(`${API}/export?tables=${selectedTables.join(",")}`);
      if (!res.data.success) throw new Error("Export failed");
      const exportData = res.data.data;
      for (const table of selectedTables) {
        let tableData = exportData[table];
        if (!tableData || tableData.error) continue;
        if (selectedRecords[table]?.length > 0) {
          tableData = tableData.filter((r) => selectedRecords[table].includes(r.id));
        }
        if (tableData.length === 0) continue;
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < tableData.length; i += chunkSize) chunks.push(tableData.slice(i, i + chunkSize));
        for (let i = 0; i < chunks.length; i++) {
          emitSocketEvent("SYNC_DATA", { target_socket_id: targetSocketId, table, chunk_index: i, total_chunks: chunks.length, data: chunks[i] });
          setSyncProgress((prev) => ({ ...prev, [table]: { current: i + 1, total: chunks.length, percentage: Math.round(((i + 1) / chunks.length) * 100) } }));
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      emitSocketEvent("SYNC_COMPLETE", { target_socket_id: targetSocketId, success: true, imported_records: Object.values(exportData).reduce((sum, d) => sum + (d.length || 0), 0) });
      setSyncing(false);
      showSuccess("Đồng bộ dữ liệu thành công!");
    } catch (error) {
      emitSocketEvent("SYNC_ERROR", { target_socket_id: targetSocketId, error: error.message });
      setSyncing(false);
    }
  };

  const handleReceiveData = async (data) => {
    const { table, chunk_index, total_chunks, data: records } = data;
    try {
      const res = await axios.post(`${API}/import`, { table, data: records, strategy: chunk_index === 0 ? "overwrite" : "merge" });
      if (res.data.success) {
        setSyncProgress((prev) => ({ ...prev, [table]: { current: chunk_index + 1, total: total_chunks, percentage: Math.round(((chunk_index + 1) / total_chunks) * 100) } }));
      }
    } catch (e) { console.error("Error importing data:", e); }
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    setSyncing(true);
    setIncomingRequest(null);
    emitSocketEvent("SYNC_ACCEPT", { source_socket_id: incomingRequest.source_socket_id, target_device: socketClient.getSocketId() });
  };

  const handleRejectRequest = () => {
    if (!incomingRequest) return;
    emitSocketEvent("SYNC_REJECT", { source_socket_id: incomingRequest.source_socket_id, target_device: socketClient.getSocketId(), reason: "Người dùng từ chối" });
    setIncomingRequest(null);
  };

  // ========== STAGING ==========

  const loadStagingData = async (sessionId) => {
    try {
      setLoadingStaging(true);
      const res = await axios.get(`${API}/staging/${sessionId}`);
      if (res.data.success) {
        setStagingData(res.data.data);
        const tables = [...new Set(res.data.data.map((r) => r.table_name))];
        const localRes = {};
        for (const table of tables) {
          const lr = await axios.get(`${API}/records/${table}`);
          if (lr.data.success) localRes[table] = lr.data.data.records;
        }
        setLocalRecords(localRes);
        const mappings = {};
        for (const row of res.data.data) {
          const meta = row.meta;
          if (meta?.type === "partial_rows") {
            mappings[row.id] = { action: "update", mapping_to_id: meta.record_id };
          } else {
            mappings[row.id] = { action: row.action || "insert", mapping_to_id: row.mapping_to_id || null };
          }
        }
        setStagingMappings(mappings);
      }
    } catch (e) {
      console.error("Error loading staging data:", e);
    } finally {
      setLoadingStaging(false);
    }
  };

  const handleOpenSession = async (session) => {
    try {
      setLoadingStaging(true);
      setActiveSession(session);
      setStagingView("review");
      setStagingTableFilter(null);
      setStagingMappings({});

      const stagingRes = await axios.get(`${API}/staging/${session.session_id}`);
      if (!stagingRes.data.success) return;
      const rawStaging = stagingRes.data.data;
      setStagingData(rawStaging);

      const tables = [...new Set(rawStaging.map((r) => r.table_name))];
      const localRes = {};
      for (const table of tables) {
        const lr = await axios.get(`${API}/records/${table}`);
        if (lr.data.success) localRes[table] = lr.data.data.records;
      }
      setLocalRecords(localRes);

      const mappings = {};
      for (const row of rawStaging) {
        const meta = row.meta;
        if (meta?.type === "partial_rows") {
          mappings[row.id] = { action: "update", mapping_to_id: meta.record_id };
        } else {
          mappings[row.id] = { action: row.action || "insert", mapping_to_id: row.mapping_to_id || null };
        }
      }
      setStagingMappings(mappings);
    } catch (e) {
      console.error("Error loading staging data:", e);
    } finally {
      setLoadingStaging(false);
    }
  };

  const handleUpdateMapping = (stagingId, action, mappingToId = null) => {
    setStagingMappings((prev) => ({
      ...prev,
      [stagingId]: { action, mapping_to_id: mappingToId },
    }));
  };

  const handleCloseReview = () => {
    setStagingView("sessions");
    setActiveSession(null);
    setStagingData([]);
    setStagingMappings({});
    setStagingDetailRecord(null);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/staging/${sessionId}`);
      await loadStagingSessions();
      if (activeSession?.session_id === sessionId) {
        setStagingView("sessions");
        setActiveSession(null);
      }
    } catch (e) {
      showError("Lỗi khi xóa: " + e.message, { title: "Lỗi xóa phiên" });
    }
  };

  const handleApplyStaging = async () => {
    if (!activeSession) return;
    try {
      setApplyingStaging(true);
      for (const [stagingId, mapping] of Object.entries(stagingMappings)) {
        await axios.put(`${API}/staging/${stagingId}/mapping`, { mapping_to_id: mapping.mapping_to_id, action: mapping.action });
      }
      const res = await axios.post(`${API}/staging/${activeSession.session_id}/apply`);
      if (res.data.success) {
        showSuccess(`Áp dụng thành công!\n${res.data.data?.applied || 0} records đã được cập nhật.`, { title: "Áp dụng thành công" });
        await loadStagingSessions();
        handleCloseReview();
      }
    } catch (e) {
      showError("Lỗi khi áp dụng: " + e.message, { title: "Lỗi áp dụng" });
    } finally {
      setApplyingStaging(false);
    }
  };

  // ========== CLEANUP ==========

  const handleOpenCleanupModal = () => {
    setShowCleanupModal(true);
    loadAllDatabaseTables();
  };

  const handleTableDeleteToggle = (tableName) => {
    setSelectedTablesToDelete((prev) =>
      prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName],
    );
  };

  const handleDeleteTables = async () => {
    if (selectedTablesToDelete.length === 0) { showAlert("Vui lòng chọn ít nhất 1 bảng để xóa", { title: "Chưa chọn bảng" }); return; }
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa ${selectedTablesToDelete.length}bảng?\n\nKHÔNG THỂ HOÀN TÁC!`, { title: "Xác nhận xóa bảng", confirmText: "Xóa", cancelText: "Hủy" });
    if (!confirmed) return;
    try {
      setLoadingCleanup(true);
      const res = await axios.post(`${API}/delete-tables`, { tables: selectedTablesToDelete });
      if (res.data.success) {
        const { success, failed } = res.data.data;
        let msg = `Đã xóa thành công ${success.length} bảng`;
        if (failed.length > 0) msg += `\n\nKhông thể xóa ${failed.length}bảng:\n${failed.map((f) => `- ${f.table}: ${f.error}`).join("\n")}`;
        showSuccess(msg, { title: "Xóa bảng thành công" });
        await loadAllDatabaseTables();
        setSelectedTablesToDelete([]);
      }
    } catch (e) {
      showError("Lỗi khi xóa bảng: " + (e.response?.data?.message || e.message), { title: "Lỗi xóa bảng" });
    } finally {
      setLoadingCleanup(false);
    }
  };

  const handleDeleteRecord = async (tableName, recordId) => {
    if (!tableName || !recordId) return;
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa record ID ${recordId}?`, { title: "Xác nhận xóa record", confirmText: "Xóa", cancelText: "Hủy" });
    if (!confirmed) return;
    try {
      const res = await axios.delete(`${API}/record/${tableName}/${recordId}`);
      if (res.data.success) {
        await showSuccess("Đã xóa record thành công", { title: "Thành công" });
        await loadTableRecords(tableName);
      }
    } catch (e) {
      await showError("Lỗi khi xóa record: " + (e.response?.data?.message || e.message), { title: "Lỗi xóa record" });
    }
  };

  const handleDeleteSelectedRecords = async () => {
    const recordIds = selectedRecords[selectedTableForRecords] || [];
    if (recordIds.length === 0) { showAlert("Vui lòng chọn ít nhất 1 record để xóa", { title: "Chưa chọn record" }); return; }
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa ${recordIds.length}records?\n\nKHÔNG THỂ HOÀN TÁC!`, { title: "Xác nhận xóa records", confirmText: "Xóa", cancelText: "Hủy" });
    if (!confirmed) return;
    try {
      const res = await axios.post(`${API}/delete-records`, { tableName: selectedTableForRecords, recordIds });
      if (res.data.success) {
        const { success, failed } = res.data.data;
        let msg = `Đã xóa thành công ${success.length} records`;
        if (failed.length > 0) msg += `\n\nKhông thể xóa ${failed.length} records:\n${failed.map((f) => `- ID ${f.recordId}: ${f.error}`).join("\n")}`;
        showSuccess(msg, { title: "Xóa records thành công" });
        await loadTableRecords(selectedTableForRecords);
        setSelectedRecords((prev) => ({ ...prev, [selectedTableForRecords]: [] }));
      }
    } catch (e) {
      showError("Lỗi khi xóa records: " + (e.response?.data?.message || e.message), { title: "Lỗi xóa records" });
    }
  };

  return {
    // Refs
    iplocalRef,
    // State - Tables & Sync
    availableTables, selectedTables, metadata, connectedDevices, selectedDevice, setSelectedDevice,
    loading, syncing, syncProgress, incomingRequest, isRefreshing,
    // State - Record View
    viewMode, selectedTableForRecords, tableRecords, selectedRecords, loadingRecords,
    tableColumns, setTableColumns, columnConfig, setColumnConfig,
    // State - Modal
    showRecordDetail, detailRecord,
    // State - competition_dk
    selectedDataRows, setSelectedDataRows,
    selectedCompDKRecords, setSelectedCompDKRecords,
    showCompDKMultiView, isRecordSelectorExpanded, setIsRecordSelectorExpanded,
    expandedCards, setExpandedCards,
    // State - Network
    localIP, showNetworkInfo, setShowNetworkInfo,
    manualServerIP, setManualServerIP,
    isManualConnected, manualServerInfo,
    isScanning, scannedServers, scanDone,
    // State - Staging
    stagingSessions, activeSession, stagingData, localRecords,
    stagingTableFilter, setStagingTableFilter,
    stagingView, loadingStaging, applyingStaging,
    stagingMappings, setStagingMappings,
    stagingDetailRecord, setStagingDetailRecord,
    // State - Cleanup
    allDatabaseTables, selectedTablesToDelete,
    showCleanupModal, setShowCleanupModal,
    loadingCleanup,
    // Handlers
    handleRefreshAll, handleTableToggle,
    handleRecordToggle, handleSelectAllRecords, handleDeselectAllRecords,
    handleBackToTableView, handleShowRecordDetail, handleCloseRecordDetail,
    toggleCompDKMultiView, toggleCompDKRecord, toggleCardExpand,
    handleManualConnect, handleManualDisconnect, handleScanNetwork, handleConnectScanned,
    handleSendToManualServer, handleSyncSelectedDataRows, handleSendRequest,
    handleAcceptRequest, handleRejectRequest,
    loadTableRecords, loadStagingSessions,
    handleOpenSession, handleCloseReview, handleDeleteSession, handleApplyStaging,
    handleUpdateMapping,
    handleOpenCleanupModal, handleTableDeleteToggle, handleDeleteTables,
    handleDeleteRecord, handleDeleteSelectedRecords,
    // Redux
    configSystem, socketState,
    // Modal
    modalProps, showAlert
  };
};

