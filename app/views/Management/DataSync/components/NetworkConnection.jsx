import React from "react";
import IpMasker from "../../../../common/IpMasker";
import useConfirmModal from "../../../../hooks/useConfirmModal";

const NetworkConnection = ({
  localIP,
  iplocalRef,
  manualServerIP,
  setManualServerIP,
  isManualConnected,
  manualServerInfo,
  isScanning,
  scannedServers,
  scanDone,
  loading,
  handleManualConnect,
  handleManualDisconnect,
  handleScanNetwork,
  handleConnectScanned,
  showAlert
}) => {
  return (
    <div >
      <div className ='h-12 border-b border-gray-200 dark:border-gray-700 items-center flex mb-2'> 
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Kết nối trực tiếp (Thủ công)
        </h2>
      </div>
      {/* Server Code */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded border-2 border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mã kết nối Máy chủ
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {IpMasker?.mask(localIP, "hash", null, "sync")?.display ?? "Đang tải..."}
                </span>
                {localIP && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(iplocalRef.current);
                      showAlert("Đã copy vào clipboard!");
                    }}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                    title="Copy IP"
                  >
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IP thực</div>
            <div className="text-sm font-mono text-gray-700 dark:text-gray-300">{localIP || "N/A"}</div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-300">
          <strong>Hướng dẫn:</strong> Copy mã này và gửi cho máy khác để họ kết nối vào máy bạn.
        </div>
      </div>

      {/* Connection Status */}
      {isManualConnected && manualServerInfo && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Đã kết nối
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                IP: <span className="font-mono">{manualServerInfo.ip}</span>
              </div>
            </div>
            <button
              onClick={handleManualDisconnect}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Ngắt kết nối
            </button>
          </div>
        </div>
      )}

      {/* Manual Connect Form */}
      {!isManualConnected && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhập địa chỉ IP hoặc mã hash của máy khác:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualServerIP}
                onChange={(e) => setManualServerIP(e.target.value)}
                placeholder="VD: IP máy chủ hoặc dán mã hash"
                disabled={loading}
                className="flex-1 px-2 py-2 text-sm  border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                onClick={handleManualConnect}
                disabled={loading || !manualServerIP.trim()}
                className="px-2 py-2 w-32  bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-sm rounded font-semibold"
              >
                {loading ? "Đang kết nối..." : "Kết nối"}
              </button>
            </div>
          </div>
 
          {/* Network Scan */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hoặc tìm kiếm máy chủ:
              </span>
              <button
                onClick={handleScanNetwork}
                disabled={isScanning}
                className="px-2 py-2  w-32  bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-sm font-semibold"
              >
                {isScanning ? "Đang tìm kiếm..." : "Tìm kiếm"}
              </button>
            </div> */}

            {scanDone && (
              <div className="mt-3">
                {scannedServers.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    Không tìm thấy máy nào trên mạng.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scannedServers.map((server, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        <div>
                          <div className="font-mono text-sm text-gray-800 dark:text-white">
                            {server.ip}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Port: {server.port} | Remote IP: {server.remoteIP}
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnectScanned(server)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold"
                        >
                          Kết nối
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkConnection;

