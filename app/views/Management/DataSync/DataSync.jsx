import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  emitSocketEvent,
  useSocketEvent,
} from "../../../config/hooks/useSocketEvents";
import socketClient from "../../../config/socket/SocketClient";

const DataSync = () => {
  const { data: configSystem } = useSelector((state) => state.configSystem);
  const socketState = useSelector((state) => state.socket);

  // State
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({});
  const [incomingRequest, setIncomingRequest] = useState(null);

  // New states for record selection
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'record'
  const [selectedTableForRecords, setSelectedTableForRecords] = useState(null);
  const [tableRecords, setTableRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState({});
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Record detail modal
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  // Table columns (dynamic)
  const [tableColumns, setTableColumns] = useState([]);

  // States for database cleanup
  const [allDatabaseTables, setAllDatabaseTables] = useState([]);
  const [selectedTablesToDelete, setSelectedTablesToDelete] = useState([]);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [loadingCleanup, setLoadingCleanup] = useState(false);

  // Load available tables
  useEffect(() => {
    loadAvailableTables();
  }, []);

  // Load metadata when tables selected
  useEffect(() => {
    if (selectedTables.length > 0) {
      loadMetadata();
    }
  }, [selectedTables]);

  // Listen for connected devices
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

  // Listen for sync offer
  useSocketEvent("SYNC_OFFER", (response) => {
    console.log(" Received SYNC_OFFER:", response);
    setIncomingRequest(response.data);
  });

  // Listen for sync ready
  useSocketEvent("SYNC_READY", (response) => {
    console.log(" SYNC_READY:", response);
    startSendingData(response.data.target_socket_id);
  });

  // Listen for sync rejected
  useSocketEvent("SYNC_REJECTED", (response) => {
    console.log(" SYNC_REJECTED:", response);
    alert(`Máy đích đã từ chối: ${response.data.reason}`);
    setSyncing(false);
  });

  // Listen for sync data
  useSocketEvent("SYNC_DATA", (response) => {
    console.log(" SYNC_DATA:", response.data);
    handleReceiveData(response.data);
  });

  // Listen for sync complete
  useSocketEvent("SYNC_COMPLETE", (response) => {
    console.log(" SYNC_COMPLETE:", response);
    setSyncing(false);
    setSyncProgress({});
    alert(response.message);
  });

  // Listen for sync error
  useSocketEvent("SYNC_ERROR", (response) => {
    console.error(" SYNC_ERROR:", response);
    setSyncing(false);
    alert(`Lỗi: ${response.data.error}`);
  });

  const loadAvailableTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:6789/api/sync/tables");
      if (response.data.success) {
        setAvailableTables(response.data.data);
      }
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      // Nếu không có bảng nào được chọn, lấy tất cả
      const url =
        selectedTables.length > 0
          ? `http://localhost:6789/api/sync/metadata?tables=${selectedTables.join(",")}`
          : `http://localhost:6789/api/sync/metadata`;

      const response = await axios.get(url);
      if (response.data.success) {
        setMetadata(response.data.data);
      }
    } catch (error) {
      console.error("Error loading metadata:", error);
    }
  };

  const handleTableToggle = (tableName) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName],
    );
  };

  // Load records of a specific table
  const loadTableRecords = async (tableName) => {
    try {
      setLoadingRecords(true);
      setSelectedTableForRecords(tableName);
      setViewMode("record");

      const response = await axios.get(
        `http://localhost:6789/api/sync/records/${tableName}`,
      );

      if (response.data.success) {
        const records = response.data.data.records;
        setTableRecords(records);

        // Extract columns from first record
        if (records.length > 0) {
          const columns = Object.keys(records[0]);
          setTableColumns(columns);
        } else {
          setTableColumns([]);
        }

        // Initialize selected records for this table
        setSelectedRecords((prev) => ({
          ...prev,
          [tableName]: [],
        }));
      }
    } catch (error) {
      console.error("Error loading table records:", error);
      alert("Lỗi khi tải dữ liệu bảng");
    } finally {
      setLoadingRecords(false);
    }
  };

  // Toggle record selection
  const handleRecordToggle = (tableName, recordId) => {
    setSelectedRecords((prev) => {
      const tableRecords = prev[tableName] || [];
      const isSelected = tableRecords.includes(recordId);

      return {
        ...prev,
        [tableName]: isSelected
          ? tableRecords.filter((id) => id !== recordId)
          : [...tableRecords, recordId],
      };
    });
  };

  // Select all records in current table
  const handleSelectAllRecords = (tableName) => {
    const allIds = tableRecords.map((record) => record.id);
    setSelectedRecords((prev) => ({
      ...prev,
      [tableName]: allIds,
    }));
  };

  // Deselect all records in current table
  const handleDeselectAllRecords = (tableName) => {
    setSelectedRecords((prev) => ({
      ...prev,
      [tableName]: [],
    }));
  };

  // Back to table view
  const handleBackToTableView = () => {
    setViewMode("table");
    setSelectedTableForRecords(null);
    setTableRecords([]);
    setTableColumns([]);
  };

  // Show record detail
  const handleShowRecordDetail = (record) => {
    setDetailRecord(record);
    setShowRecordDetail(true);
  };

  // Close record detail
  const handleCloseRecordDetail = () => {
    setShowRecordDetail(false);
    setDetailRecord(null);
  };

  // Load all database tables for cleanup
  const loadAllDatabaseTables = async () => {
    try {
      setLoadingCleanup(true);
      const response = await axios.get(
        "http://localhost:6789/api/sync/all-tables",
      );

      if (response.data.success) {
        setAllDatabaseTables(response.data.data);
      }
    } catch (error) {
      console.error("Error loading all database tables:", error);
      alert("Lỗi khi tải danh sách bảng");
    } finally {
      setLoadingCleanup(false);
    }
  };

  // Toggle table selection for deletion
  const handleTableDeleteToggle = (tableName) => {
    setSelectedTablesToDelete((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName],
    );
  };

  // Delete selected tables
  const handleDeleteTables = async () => {
    if (selectedTablesToDelete.length === 0) {
      alert("Vui lòng chọn ít nhất 1 bảng để xóa");
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedTablesToDelete.length} bảng?\n\nDanh sách:\n${selectedTablesToDelete.join("\n")}\n\n CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoadingCleanup(true);
      const response = await axios.post(
        "http://localhost:6789/api/sync/delete-tables",
        {
          tables: selectedTablesToDelete,
        },
      );

      if (response.data.success) {
        const { success, failed } = response.data.data;

        let message = ` Đã xóa thành công ${success.length} bảng`;
        if (failed.length > 0) {
          message += `\n\n Không thể xóa ${failed.length} bảng:\n${failed.map((f) => `- ${f.table}: ${f.error}`).join("\n")}`;
        }

        alert(message);

        // Reload tables
        await loadAllDatabaseTables();
        setSelectedTablesToDelete([]);
      }
    } catch (error) {
      console.error("Error deleting tables:", error);
      alert(
        "Lỗi khi xóa bảng: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoadingCleanup(false);
    }
  };

  // Delete single record
  const handleDeleteRecord = async (tableName, recordId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa record ID ${recordId}?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:6789/api/sync/record/${tableName}/${recordId}`,
      );

      if (response.data.success) {
        alert("Đã xóa record thành công");
        // Reload records
        await loadTableRecords(tableName);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(
        "Lỗi khi xóa record: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Delete multiple records
  const handleDeleteSelectedRecords = async () => {
    const recordIds = selectedRecords[selectedTableForRecords] || [];

    if (recordIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 record để xóa");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${recordIds.length} records?\n\n CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!`,
      )
    ) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:6789/api/sync/delete-records",
        {
          tableName: selectedTableForRecords,
          recordIds: recordIds,
        },
      );

      if (response.data.success) {
        const { success, failed } = response.data.data;
        let message = ` Đã xóa thành công ${success.length} records`;
        if (failed.length > 0) {
          message += `\n\n Không thể xóa ${failed.length} records:\n${failed.map((f) => `- ID ${f.recordId}: ${f.error}`).join("\n")}`;
        }
        alert(message);

        // Reload records and clear selection
        await loadTableRecords(selectedTableForRecords);
        setSelectedRecords((prev) => ({
          ...prev,
          [selectedTableForRecords]: [],
        }));
      }
    } catch (error) {
      console.error("Error deleting records:", error);
      alert(
        "Lỗi khi xóa records: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Open cleanup modal
  const handleOpenCleanupModal = () => {
    setShowCleanupModal(true);
    loadAllDatabaseTables();
  };

  const handleSendRequest = () => {
    if (selectedTables.length === 0) {
      alert("Vui lòng chọn ít nhất 1 bảng dữ liệu");
      return;
    }

    if (!selectedDevice) {
      alert("Vui lòng chọn máy đích");
      return;
    }

    setSyncing(true);

    // Send sync request
    emitSocketEvent("SYNC_REQUEST", {
      room_id: configSystem.room_code,
      source_device: socketClient.getSocketId(),
      tables: selectedTables,
      metadata: metadata,
      target_socket_id: selectedDevice,
    });
  };

  const startSendingData = async (targetSocketId) => {
    try {
      // Export data from selected tables
      const tables = selectedTables.join(",");
      const response = await axios.get(
        `http://localhost:6789/api/sync/export?tables=${tables}`,
      );

      if (!response.data.success) {
        throw new Error("Export failed");
      }

      const exportData = response.data.data;

      // Send data in chunks (table by table)
      for (const table of selectedTables) {
        let tableData = exportData[table];
        if (!tableData || tableData.error) {
          continue;
        }

        // Filter by selected records if any
        if (selectedRecords[table] && selectedRecords[table].length > 0) {
          const selectedIds = selectedRecords[table];
          tableData = tableData.filter((record) =>
            selectedIds.includes(record.id),
          );

          console.log(
            ` Table ${table}: Filtered ${tableData.length}/${exportData[table].length} records`,
          );
        }

        // Skip if no data to send
        if (tableData.length === 0) {
          console.log(` Table ${table}: No records to send`);
          continue;
        }

        // Split into chunks of 100 records
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < tableData.length; i += chunkSize) {
          chunks.push(tableData.slice(i, i + chunkSize));
        }

        // Send each chunk
        for (let i = 0; i < chunks.length; i++) {
          emitSocketEvent("SYNC_DATA", {
            target_socket_id: targetSocketId,
            table,
            chunk_index: i,
            total_chunks: chunks.length,
            data: chunks[i],
          });

          // Update progress
          setSyncProgress((prev) => ({
            ...prev,
            [table]: {
              current: i + 1,
              total: chunks.length,
              percentage: Math.round(((i + 1) / chunks.length) * 100),
            },
          }));

          // Small delay between chunks
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Send complete signal
      emitSocketEvent("SYNC_COMPLETE", {
        target_socket_id: targetSocketId,
        success: true,
        imported_records: Object.values(exportData).reduce(
          (sum, data) => sum + (data.length || 0),
          0,
        ),
      });

      setSyncing(false);
      alert("Đồng bộ dữ liệu thành công!");
    } catch (error) {
      console.error("Error sending data:", error);
      emitSocketEvent("SYNC_ERROR", {
        target_socket_id: targetSocketId,
        error: error.message,
      });
      setSyncing(false);
    }
  };

  const handleReceiveData = async (data) => {
    const { table, chunk_index, total_chunks, data: records } = data;

    try {
      // Import data to database
      const response = await axios.post(
        "http://localhost:6789/api/sync/import",
        {
          table,
          data: records,
          strategy: chunk_index === 0 ? "overwrite" : "merge",
        },
      );

      if (response.data.success) {
        // Update progress
        setSyncProgress((prev) => ({
          ...prev,
          [table]: {
            current: chunk_index + 1,
            total: total_chunks,
            percentage: Math.round(((chunk_index + 1) / total_chunks) * 100),
          },
        }));
      }
    } catch (error) {
      console.error("Error importing data:", error);
    }
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;

    setSyncing(true);
    setIncomingRequest(null);

    emitSocketEvent("SYNC_ACCEPT", {
      source_socket_id: incomingRequest.source_socket_id,
      target_device: socketClient.getSocketId(),
    });
  };

  const handleRejectRequest = () => {
    if (!incomingRequest) return;

    emitSocketEvent("SYNC_REJECT", {
      source_socket_id: incomingRequest.source_socket_id,
      target_device: socketClient.getSocketId(),
      reason: "Người dùng từ chối",
    });

    setIncomingRequest(null);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Đồng bộ dữ liệu
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Đồng bộ dữ liệu giữa các máy tính trên cùng mạng WiFi
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Trạng thái kết nối
        </h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${socketState.connected ? "bg-green-500" : "bg-red-500"}`}
          ></div>
          <span className="text-gray-700 dark:text-gray-300">
            {socketState.connected ? "Đã kết nối" : "Chưa kết nối"}
          </span>
          {socketState.connected && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              - Room: {configSystem.room_code}
            </span>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Thiết bị trong phòng: {connectedDevices.length} máy
        </div>
      </div>

      {/* Incoming Request Modal */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Yêu cầu đồng bộ dữ liệu
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Máy {incomingRequest.source_device} muốn gửi dữ liệu:
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
                Cảnh báo: Dữ liệu hiện tại sẽ bị ghi đè. Nên backup database
                trước khi nhận.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptRequest}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold"
              >
                Chấp nhận
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

      {/* Send Data Section */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Gửi dữ liệu đến máy khác
        </h2>

        {/* Table Selection */}
        {viewMode === "table" ? (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chọn dữ liệu cần gửi:
            </h3>
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
                          {selectedRecords[table.name] &&
                            selectedRecords[table.name].length > 0 && (
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
          </div>
        ) : (
          /* Record Selection View */
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {availableTables.find(
                    (t) => t.name === selectedTableForRecords,
                  )?.label || selectedTableForRecords}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tổng: {tableRecords.length} records
                  {selectedRecords[selectedTableForRecords] && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      - Đã chọn:{" "}
                      {selectedRecords[selectedTableForRecords].length}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleBackToTableView}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
              >
                ← Quay lại
              </button>
            </div>

            {loadingRecords ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Đang tải dữ liệu...
              </div>
            ) : (
              <>
                {/* Select All / Deselect All */}
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() =>
                      handleSelectAllRecords(selectedTableForRecords)
                    }
                    className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() =>
                      handleDeselectAllRecords(selectedTableForRecords)
                    }
                    className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded"
                  >
                    Bỏ chọn tất cả
                  </button>
                  <button
                    onClick={handleDeleteSelectedRecords}
                    disabled={
                      !selectedRecords[selectedTableForRecords] ||
                      selectedRecords[selectedTableForRecords].length === 0
                    }
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded font-semibold"
                  >
                    Xóa đã chọn (
                    {selectedRecords[selectedTableForRecords]?.length || 0})
                  </button>
                </div>

                {/* Records Table - Dynamic Columns */}
                <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                        <tr>
                          <th className="p-2 text-left w-12 border-r border-gray-300 dark:border-gray-600">
                            <input
                              type="checkbox"
                              checked={
                                selectedRecords[selectedTableForRecords]
                                  ?.length === tableRecords.length &&
                                tableRecords.length > 0
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleSelectAllRecords(
                                    selectedTableForRecords,
                                  );
                                } else {
                                  handleDeselectAllRecords(
                                    selectedTableForRecords,
                                  );
                                }
                              }}
                              className="w-4 h-4"
                            />
                          </th>
                          {tableColumns.map((col) => (
                            <th
                              key={col}
                              className="p-2 text-left text-gray-700 dark:text-gray-300 font-semibold border-r border-gray-300 dark:border-gray-600 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                          <th className="p-2 text-center text-gray-700 dark:text-gray-300 font-semibold w-40 sticky right-0 bg-gray-100 dark:bg-gray-700">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRecords.map((record) => (
                          <tr
                            key={record.id}
                            className="border-t border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <td className="p-2 border-r border-gray-300 dark:border-gray-600">
                              <input
                                type="checkbox"
                                checked={
                                  selectedRecords[
                                    selectedTableForRecords
                                  ]?.includes(record.id) || false
                                }
                                onChange={() =>
                                  handleRecordToggle(
                                    selectedTableForRecords,
                                    record.id,
                                  )
                                }
                                className="w-4 h-4"
                              />
                            </td>
                            {tableColumns.map((col) => (
                              <td
                                key={col}
                                className="p-2 text-gray-800 dark:text-white border-r border-gray-300 dark:border-gray-600"
                              >
                                <div
                                  className="max-w-xs truncate"
                                  title={String(record[col])}
                                >
                                  {record[col] !== null &&
                                  record[col] !== undefined
                                    ? typeof record[col] === "object"
                                      ? JSON.stringify(record[col])
                                      : String(record[col])
                                    : "-"}
                                </div>
                              </td>
                            ))}
                            <td className="p-2 text-center sticky right-0 bg-white dark:bg-gray-800">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleShowRecordDetail(record)}
                                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                                  title="Xem chi tiết"
                                >
                                   Chi tiết
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteRecord(
                                      selectedTableForRecords,
                                      record.id,
                                    )
                                  }
                                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                                  title="Xóa record này"
                                >
                                   Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Device Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Chọn máy đích:
          </h3>
          <div className="space-y-2">
            {connectedDevices.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                Không có máy nào khác trong phòng
              </p>
            ) : (
              connectedDevices.map((device) => (
                <label
                  key={device.socket_id}
                  className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="device"
                    checked={selectedDevice === device.socket_id}
                    onChange={() => setSelectedDevice(device.socket_id)}
                    disabled={syncing}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      Máy {device.device_name || device.socket_id}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {device.client_ip || device.admin_ip}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendRequest}
          disabled={syncing || selectedTables.length === 0 || !selectedDevice}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg"
        >
          {syncing ? "Đang đồng bộ..." : "Gửi dữ liệu"}
        </button>
      </div>

      {/* Progress Section */}
      {syncing && Object.keys(syncProgress).length > 0 && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Tiến trình đồng bộ
          </h2>
          <div className="space-y-4">
            {Object.entries(syncProgress).map(([table, progress]) => (
              <div key={table}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {availableTables.find((t) => t.name === table)?.label ||
                      table}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {progress.current}/{progress.total} ({progress.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receive Data Section */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Nhận dữ liệu từ máy khác
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {syncing ? " Đang nhận dữ liệu..." : "Đang chờ yêu cầu đồng bộ..."}
        </p>
      </div>

      {/* Database Cleanup Section */}
      <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Dọn dẹp Database
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Xóa các bảng không cần thiết trong database để giải phóng dung lượng
        </p>
        <button
          onClick={handleOpenCleanupModal}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
        >
          Quản lý bảng dữ liệu
        </button>
      </div>

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Quản lý bảng dữ liệu
              </h3>
              <button
                onClick={() => {
                  setShowCleanupModal(false);
                  setSelectedTablesToDelete([]);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                CẢNH BÁO
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                Chỉ xóa các bảng bạn chắc chắn không cần thiết. Các bảng quan
                trọng của hệ thống sẽ không thể xóa.
              </p>
            </div>

            {loadingCleanup ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Đang tải danh sách bảng...
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Tổng số bảng: <strong>{allDatabaseTables.length}</strong>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Bảng quan trọng (không thể xóa):{" "}
                    <strong>
                      {allDatabaseTables.filter((t) => t.isSyncable).length}
                    </strong>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Bảng có thể xóa:{" "}
                    <strong>
                      {allDatabaseTables.filter((t) => !t.isSyncable).length}
                    </strong>
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 mb-2">
                    Đã chọn: <strong>{selectedTablesToDelete.length}</strong>{" "}
                    bảng
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="p-2 text-left w-12"></th>
                        <th className="p-2 text-left text-gray-700 dark:text-gray-300">
                          Tên bảng
                        </th>
                        <th className="p-2 text-left text-gray-700 dark:text-gray-300">
                          Mô tả
                        </th>
                        <th className="p-2 text-left text-gray-700 dark:text-gray-300">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDatabaseTables.map((table) => (
                        <tr
                          key={table.name}
                          className={`border-t border-gray-200 dark:border-gray-700 ${
                            table.isSyncable
                              ? "bg-green-50 dark:bg-green-900/10"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <td className="p-2">
                            {table.isSyncable ? (
                              <span className="text-green-600 dark:text-green-400 text-xl">
                                🔒
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selectedTablesToDelete.includes(
                                  table.name,
                                )}
                                onChange={() =>
                                  handleTableDeleteToggle(table.name)
                                }
                                className="w-4 h-4"
                              />
                            )}
                          </td>
                          <td className="p-2 text-gray-800 dark:text-white font-mono">
                            {table.name}
                          </td>
                          <td className="p-2 text-gray-600 dark:text-gray-400">
                            {table.label}
                          </td>
                          <td className="p-2">
                            {table.isSyncable ? (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                                Quan trọng
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-xs">
                                Có thể xóa
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowCleanupModal(false);
                      setSelectedTablesToDelete([]);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteTables}
                    disabled={
                      selectedTablesToDelete.length === 0 || loadingCleanup
                    }
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded font-semibold"
                  >
                    {loadingCleanup
                      ? "Đang xóa..."
                      : `Xóa ${selectedTablesToDelete.length} bảng`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {showRecordDetail && detailRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                 Chi tiết Record (ID: {detailRecord.id})
              </h3>
              <button
                onClick={handleCloseRecordDetail}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(detailRecord).map(([key, value]) => (
                <div
                  key={key}
                  className="border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <div className="flex items-start gap-4">
                    <div className="font-semibold text-blue-600 dark:text-blue-400 min-w-[150px]">
                      {key}:
                    </div>
                    <div className="flex-1 text-gray-800 dark:text-white font-mono text-sm break-all">
                      {value !== null && value !== undefined ? (
                        typeof value === "object" ? (
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )
                      ) : (
                        <span className="text-gray-400 italic">null</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(detailRecord, null, 2),
                  );
                  alert("Đã copy JSON vào clipboard!");
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                📋 Copy JSON
              </button>
              <button
                onClick={handleCloseRecordDetail}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSync;
