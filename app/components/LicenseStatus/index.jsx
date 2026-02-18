import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  checkLicenseStatus,
  setLicenseStatus,
} from "../../config/redux/controller/licenseSlice";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ClockIcon,
  KeyIcon,
  WifiIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";

/**
 * LicenseStatus Component
 * Hiển thị trạng thái license với thông tin chi tiết
 * Có button để vào màn hình activation
 */
export default function LicenseStatus({ compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    valid,
    requireActivation,
    daysRemaining,
    expirationDate,
    activationDate,
    packageName,
    licenseKey,
    loading,
    online,
  } = useSelector((state) => state.license);

  // Listen to license status from Electron
  useEffect(() => {
    if (window.electron && window.electron.onLicenseStatus) {
      window.electron.onLicenseStatus((data) => {
        console.log("📡 License status update:", data);
        dispatch(setLicenseStatus(data));
      });
    }

    // Initial check
    dispatch(checkLicenseStatus());

    // Cleanup
    return () => {
      if (window.electron && window.electron.removeLicenseListeners) {
        window.electron.removeLicenseListeners();
      }
    };
  }, [dispatch]);

  const handleActivate = () => {
    navigate("/license-activation");
  };

  const handleRefresh = () => {
    dispatch(checkLicenseStatus());
    // Thực hiện gọi emit không
  };

  // Compact version - for sidebar or header
  if (compact) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 rounded   border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {valid ? (
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ShieldExclamationIcon className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {valid ? "Đã kích hoạt" : "Chưa kích hoạt"}
              </p>
              {valid && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Còn {daysRemaining} ngày
                </p>
              )}
            </div>
          </div>
          {!valid && (
            <button
              onClick={handleActivate}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded   hover:bg-blue-700 transition-colors"
            >
              Kích hoạt
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full version - for dashboard or dedicated page
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className={`p-6 ${valid ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {valid ? (
              <ShieldCheckIcon className="w-12 h-12 text-white" />
            ) : (
              <ShieldExclamationIcon className="w-12 h-12 text-white" />
            )}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {valid ? "Bản quyền hợp lệ" : "Chưa kích hoạt bản quyền"}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {valid
                  ? `Phần mềm đã được kích hoạt và sẵn sàng sử dụng`
                  : "Vui lòng kích hoạt bản quyền để sử dụng đầy đủ tính năng"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded   transition-colors disabled:opacity-50"
            >
              {loading ? "Đang kiểm tra..." : "Làm mới"}
            </button>
            {!valid && (
              <button
                onClick={handleActivate}
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded   hover:bg-gray-100 transition-colors shadow-lg"
              >
                Kích hoạt ngay
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body - License Details */}
      {valid ? (
        <div className="p-6 space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded  ">
            {online !== undefined && (
              <>
                {online ? (
                  <WifiIcon className="w-6 h-6 text-green-500" />
                ) : (
                  <ServerIcon className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Trạng thái kiểm tra
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {online
                      ? "Đã kiểm tra online"
                      : "Kiểm tra offline (từ cache)"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* License Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Days Remaining */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded  ">
              <ClockIcon className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Thời gian còn lại
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {daysRemaining} ngày
                </p>
              </div>
            </div>

            {/* License Key */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded  ">
              <KeyIcon className="w-6 h-6 text-purple-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Mã bản quyền
                </p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                  {licenseKey || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activation Date */}
            {activationDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded  ">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Ngày kích hoạt
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(activationDate).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Expiration Date */}
            {expirationDate && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded  ">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Ngày hết hạn
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(expirationDate).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Package Name */}
          {packageName && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded   border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Gói dịch vụ
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {packageName}
              </p>
            </div>
          )}

          {/* Warning if expiring soon */}
          {daysRemaining <= 30 && daysRemaining > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded  ">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                ⚠️ Bản quyền sắp hết hạn
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Vui lòng gia hạn bản quyền để tiếp tục sử dụng dịch vụ
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6">
          <div className="text-center py-8">
            <ShieldExclamationIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chưa có bản quyền
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vui lòng kích hoạt bản quyền để sử dụng đầy đủ tính năng của phần
              mềm
            </p>
            <button
              onClick={handleActivate}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded  hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105"
            >
              Kích hoạt bản quyền ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
