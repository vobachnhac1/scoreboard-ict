import React from "react";

/**
 * RefereeStatusBar Component
 * Thanh trạng thái kết nối các thiết bị giám định
 * Hiển thị trạng thái ready/not ready dựa trên so_giam_dinh
 * 
 * @param {Array} devices - Array of referee devices
 * @param {Number} so_giam_dinh - Số lượng giám định (3, 5, 7, ...)
 */
export default function RefereeStatusBar({ devices = [], so_giam_dinh = 3 }) {
  
  // Tạo array các referee slots dựa trên so_giam_dinh
  const refereeSlots = Array.from({ length: so_giam_dinh }, (_, index) => {
    const refNum = index + 1;
    
    // Tìm device tương ứng với referrer number
    const device = devices.find(d => d.referrer ==  refNum);
    
    return {
      refNum,
      device,
      isReady: device?.ready || false,
      isConnected: device?.connected || false,
      deviceName: device?.device_name || `REF${refNum}`,
      deviceIp: device?.device_ip || 'N/A'
    };
  });

  return (
    <div className="w-full max-w-6xl mb-4">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-4 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">
              📡 Trạng thái kết nối giám định
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-300">Sẵn sàng</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-300">Đã kết nối</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-300">Chưa kết nối</span>
            </div>
          </div>
        </div>

        {/* Referee Status Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {refereeSlots.map((slot) => {
            // Determine status color
            let statusColor = 'bg-red-500'; // Not connected
            let borderColor = 'border-red-500';
            let textColor = 'text-red-300';
            let statusText = 'Chưa kết nối';
            
            if (slot.isReady) {
              statusColor = 'bg-green-500';
              borderColor = 'border-green-500';
              textColor = 'text-green-300';
              statusText = 'Sẵn sàng';
            } else if (slot.isConnected) {
              statusColor = 'bg-yellow-500';
              borderColor = 'border-yellow-500';
              textColor = 'text-yellow-300';
              statusText = 'Đã kết nối';
            }

            return (
              <div
                key={slot.refNum}
                className={`relative bg-gray-800 border-2 ${borderColor} rounded-lg p-3 transition-all hover:scale-105`}
              >
                {/* REF Number Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-lg">
                    Giám định {slot.refNum}
                  </span>
                  <span className={`w-3 h-3 ${statusColor} rounded-full ${slot.isReady ? 'animate-pulse' : ''}`}></span>
                </div>

                {/* Device Info */}
                <div className="text-xs space-y-1">
                  <div className={`${textColor} font-medium truncate`} title={slot.deviceName}>
                    {slot.device ? slot.deviceName : '---'}
                  </div>
                  {slot.device && (
                    <div className="text-gray-400 font-mono text-[10px] truncate" title={slot.deviceIp}>
                      {slot.deviceIp}
                    </div>
                  )}
                </div>

                {/* Status Text */}
                <div className={`mt-2 text-[10px] ${textColor} font-semibold uppercase`}>
                  {statusText}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Tổng số: <span className="text-white font-bold">{so_giam_dinh}</span>
            </span>
            <span className="text-gray-400">
              Sẵn sàng: <span className="text-green-400 font-bold">
                {refereeSlots.filter(s => s.isReady).length}
              </span>
            </span>
            <span className="text-gray-400">
              Đã kết nối: <span className="text-yellow-400 font-bold">
                {refereeSlots.filter(s => s.isConnected && !s.isReady).length}
              </span>
            </span>
            <span className="text-gray-400">
              Chưa kết nối: <span className="text-red-400 font-bold">
                {refereeSlots.filter(s => !s.isConnected).length}
              </span>
            </span>
          </div>
          
          {/* Ready Indicator */}
          {refereeSlots.filter(s => s.isReady).length === so_giam_dinh ? (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500 rounded px-3 py-1">
              <span className="text-green-400 font-bold">✓ Tất cả sẵn sàng</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded px-3 py-1">
              <span className="text-yellow-400 font-bold">⚠ Chưa đủ giám định</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

