import React, { useState, useEffect } from "react";
import {
  LinkIcon,
  PhoneIcon,
  ClockIcon,
  RefreshIcon,
  PowerIcon,
  CloseIcon,
} from "../../../components/icons/ConnectionIcons";

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
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  // Auto generate QR when modal opens
  useEffect(() => {
    if (isOpen && !qrCodeUrl) {
      handleGenerateQR();
    }
  }, [isOpen]);

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

  const handleGenerateQR = async () => {
    if (onGenerateQR) {
      setIsLoadingQR(true);
      try {
        const base64 = await onGenerateQR();
        if (base64) {
          setQrCodeUrl(base64);
        }
      } catch (error) {
        console.error("Error generating QR:", error);
      } finally {
        setIsLoadingQR(false);
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
      <div className="relative max-w-[95vw] w-full mx-4 max-h-[95vh] overflow-auto">
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
              className="w-10 h-10 !rounded bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all flex items-center justify-center"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Main Content - 2 Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - QR Code Section */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 !rounded-lg p-6 sticky top-0">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                    Kết nối thiết bị
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Quét mã QR để kết nối
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center mb-4">
                  {isLoadingQR ? (
                    <div className="w-64 h-64 bg-white !rounded-lg border-4 border-blue-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-gray-600 text-sm">Đang tạo QR...</p>
                      </div>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="bg-white p-3 !rounded-lg border-4 border-blue-300 shadow-lg hover:shadow-xl transition-shadow">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-white !rounded-lg border-4 border-gray-300 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">Không có QR Code</p>
                    </div>
                  )}
                </div>

                {/* QR Instructions */}
                <div className="bg-white border border-blue-200 !rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5" />
                    Hướng dẫn:
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Mở ứng dụng giám định</li>
                    <li>Nhấn nút "Scan QR"</li>
                    <li>Quét mã QR trên màn hình</li>
                    <li>Chờ kết nối tự động</li>
                  </ol>
                </div>

                {/* Refresh QR Button */}
                <button
                  onClick={handleGenerateQR}
                  disabled={isLoadingQR}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white !rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isLoadingQR ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <RefreshIcon className="w-5 h-5" />
                      Tạo lại QR Code
                    </>
                  )}
                </button>

                {/* QR Info */}
                {qrCodeUrl && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      QR Code hết hạn sau <span className="font-bold text-red-600">5 phút</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Devices Table */}
            <div className="lg:col-span-2">
              <div className="bg-white !rounded-lg">
                {/* Connection Status Summary */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 border border-green-200 !rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {connectedCount}
                      </div>
                      <div className="text-xs text-green-700 mt-1 font-medium">
                        Đã kết nối
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 !rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {setPermissionCount}
                      </div>
                      <div className="text-xs text-yellow-700 mt-1 font-medium">
                        Đã phân quyền
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 !rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {devices.length}
                      </div>
                      <div className="text-xs text-blue-700 mt-1 font-medium">
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
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white !rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      Kết nối lại ({disconnectedCount})
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onInitSocket}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white !rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <PowerIcon className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white !rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <RefreshIcon className="w-4 h-4" />
                      Làm mới
                    </button>
                    <button
                      onClick={onClose}
                      className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white !rounded-lg font-medium text-sm transition-all flex items-center gap-2"
                    >
                      <CloseIcon className="w-4 h-4" />
                      Đóng (F1)
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 !rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên thiết bị</th>
                          <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">GĐ</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP</th>
                          <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Quyền GĐ</th>
                          <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {devices.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-lg font-medium">Chưa có thiết bị nào kết nối</p>
                                <p className="text-sm mt-1">Quét QR Code bên trái để kết nối thiết bị</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          devices.map((device, index) => {
                            const isTesting = testingJudge === device.referrer;

                            return (
                              <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-3 py-3 text-sm text-gray-900 font-medium">{index + 1}</td>
                                <td className="px-3 py-3 text-sm text-gray-900 font-medium">{device.device_name}</td>
                                <td className="px-3 py-3 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 !rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                    {device.referrer}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-600 font-mono">{device.device_ip}</td>
                                <td className="px-3 py-3 text-center">
                                  {device.connected ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                      Online
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                      Offline
                                    </span>
                                  )}
                                </td>

                                {/* Quyền Giám Định Dropdown */}
                                <td className="px-3 py-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {Array.from({ length: so_giam_dinh }, (_, index) => {
                                      const refNum = index + 1;
                                      const isActive = device.referrer == refNum;
                                      let bgColor = isActive ? 'bg-red-500 text-white' : 'bg-blue-600 text-white';

                                      if (device.referrer == 0) {
                                        bgColor = 'bg-blue-600 text-white';
                                      }
                                      return (
                                        <button
                                          key={refNum}
                                          onClick={() => handleSetPermissionRef(device, refNum)}
                                          className={`px-2 py-1 text-xs font-bold ${bgColor} hover:bg-yellow-500 hover:text-white !rounded transition-all`}
                                        >
                                          {refNum}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </td>

                                <td className="px-3 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Reconnect Button */}
                                    {(!device.connected || device.referrer == 0) && (
                                      <button
                                        onClick={() => handleReconnect(device)}
                                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 transition-all"
                                      >
                                        Cấp Quyền
                                      </button>
                                    )}

                                    {/* Disconnect Button */}
                                    {device.connected && device.referrer != 0 && (
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
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

