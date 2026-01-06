import React, { useState } from "react";

/**
 * ConnectionManagerModal Component
 * Modal quản lý kết nối giám định khi nhấn F1
 * Thiết kế giống ManagementConnectionSocket với table layout
 * @param {boolean} isOpen - Show/hide modal
 * @param {function} onClose - Close handler
 * @param {Array} devices - Array of device objects [{referrer, device_name, device_code, device_ip, connected}, ...]
 * @param {function} onReconnect - Reconnect handler (device) => {}
 * @param {function} onDisconnect - Disconnect handler (device) => {}
 * @param {function} onRefresh - Refresh handler () => {}
 * @param {function} onInitSocket - Khởi tại lại socket () => {}
 * @param {function} onGenegrateQR - Tạo QR kết nối () => {}
 * @param {function} onSetPermissionRef - Chọn quyền giám định () => {}
 */
export default function ConnectionManagerModal({ 
  isOpen = false,
  onClose,
  devices = [],
  onReconnect,
  onDisconnect,
  onInitSocket,
  onGenerateQR,
  onRefresh,
  onSetPermissionRef,
  configSystem

}) {
  const so_giam_dinh = configSystem.so_giam_dinh || 3;
  const [testingJudge, setTestingJudge] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleReconnect = async (device) => {
    if (onReconnect) {
      await onReconnect(device);
    }
  };

  const handleDisconnect = async (device) => {
    if (onSetPermissionRef) {
      const { socket_id, room_id  } = device;
      onSetPermissionRef({ referrer: 0, socket_id, room_id });

    }
  };

  const handleReconnectAll = async () => {
    if (onReconnect) {
      for (const device of devices) {
        if (!device.connected) {
          await onReconnect(device);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  const handleGenerateQR = async () =>{
    if (onGenerateQR) {
      
      const base64 = await onGenerateQR();
      if(base64) {
        setQrCodeUrl(base64);
        setShowQR(true); // Show QR modal
      }
    }
  };

  const handleSetPermissionRef = (device, refNum) =>{
    if (onSetPermissionRef) {
      const { socket_id, room_id  } = device;
      // kiểm tra trong list có giám định 2 thì thông báo bỏ qua
      const check = devices.find(ele=> ele.referrer == refNum && ele.socket_id != device.socket_id);
      if(check){
        alert(`Giám định ${refNum} đã có thiết bị kết nối. Vui lòng chọn giám định khác.`);
        return;
      }
      onSetPermissionRef({ referrer: refNum, socket_id, room_id });
    }
  }
  
  // Calculate statistics
  const connectedCount = devices.filter(d => d.connected).length;
  const disconnectedCount = devices.filter(d => !d.connected).length;
  const setPermissionCount = devices.filter(d => d.referrer !=0 &&  d.connected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-7xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Main Card */}
        <div className="bg-white !rounded shadow-2xl p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Quản lý kết nối giám định
                </h2>
                <p className="text-gray-500 text-sm">
                  Kiểm tra và quản lý kết nối với thiết bị giám định
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 !rounded bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all flex items-center justify-center text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Connection Status Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 !rounded p-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {connectedCount}
                </div>
                <div className="text-sm text-green-700 mt-1 font-medium">
                  Đã kết nối
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 !rounded p-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600">
                  {setPermissionCount}
                </div>
                <div className="text-sm text-yellow-700 mt-1 font-medium">
                  Đã phân quyền
                </div>
              </div>
            </div>
            {/* <div className="bg-red-50 border border-red-200 !rounded p-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">
                  {disconnectedCount}
                </div>
                <div className="text-sm text-red-700 mt-1 font-medium">
                  Mất kết nối
                </div>
              </div>
            </div> */}
            <div className="bg-blue-50 border border-blue-200 !rounded p-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {devices.length}
                </div>
                <div className="text-sm text-blue-700 mt-1 font-medium">
                  Tổng số
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={handleReconnectAll}
                disabled={disconnectedCount === 0}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white !rounded font-medium text-sm transition-all"
              >
                Kết nối lại tất cả ({disconnectedCount})
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onInitSocket}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white !rounded font-medium text-sm transition-all"
              >
                Reset Kết nối
              </button>
              <button
                onClick={handleGenerateQR}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white !rounded font-medium text-sm transition-all"
              >
                ScanQR
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white !rounded font-medium text-sm transition-all"
              >
                Làm mới
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white !rounded font-medium text-sm transition-all"
              >
                Đóng (F1)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 !rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên thiết bị</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Giám định</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP thiết bị</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Quyền GĐ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      Không có thiết bị nào
                    </td>
                  </tr>
                ) : (
                  devices.map((device, index) => {
                    const isTesting = testingJudge === device.referrer;

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{device.device_name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 !rounded bg-blue-100 text-blue-700 font-bold text-sm">
                            {device.referrer}
                          </span>
                        </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{device.device_ip}</td>
                        <td className="px-4 py-3 text-center">
                          {device.connected ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Đã kết nối
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              Mất kết nối
                            </span>
                          )}
                        </td>

                        {/* Quyền Giám Định Dropdown */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {Array.from({ length: so_giam_dinh }, (_, index) => {
                              const refNum = index + 1;
                              const isActive = device.referrer == refNum;
                              let bgColor = isActive? 'bg-red-500' : 'bg-blue-600'
                              let textColor = isActive? 'bg-red-500' : 'bg-blue-600'
                              let borderColor = isActive? 'bg-red-40' : 'border-blue-40'

                                console.log('device.referrer: ', device.referrer);

                              if(device.referrer == 0){ 
                                bgColor =  'bg-blue-600'
                                textColor = 'bg-blue-600'
                                borderColor = 'border-blue-40'
                              }
                              return (
                                <button
                                  key={refNum}
                                  onClick={() =>handleSetPermissionRef(device, refNum)}
                                  className={`px-2 py-1 text-xs font-bold ${bgColor} ${textColor}  ${borderColor} hover:bg-yellow-500 hover:text-white border !rounded transition-all`}
                                >
                                  REF{refNum}
                                </button>
                              );
                            })}
                          </div> 
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                          {/* Reconnect Button */}
                            {!device.connected ||  device.referrer ==0 && (
                              <button
                                onClick={() => handleReconnect(device)}
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 transition-all"
                              >
                                Cấp Quyền
                              </button>
                            )}

                            {/* Disconnect Button */}
                            {device.connected && device.referrer !=0  && (
                              <button
                                onClick={() => handleDisconnect(device)}
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition-all"
                              >
                                Xoá Quyền
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && qrCodeUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative bg-white !rounded shadow-2xl p-8 max-w-md w-full mx-4">
            {/* Close Button */}
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 w-10 h-10 !rounded bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all flex items-center justify-center text-xl font-bold"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Quét mã QR để kết nối
              </h3>
              <p className="text-gray-500 text-sm">
                Sử dụng thiết bị giám định để quét mã QR này
              </p>
            </div>

            {/* QR Code Image */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 !rounded border-4 border-gray-200 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 !rounded p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                Hướng dẫn:
              </h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Mở ứng dụng giám định trên thiết bị di động</li>
                <li>Nhấn vào nút "Scan QR" hoặc biểu tượng camera</li>
                <li>Hướng camera vào mã QR trên màn hình</li>
                <li>Chờ thiết bị kết nối tự động</li>
              </ol>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowQR(false)}
              className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white !rounded font-medium transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

