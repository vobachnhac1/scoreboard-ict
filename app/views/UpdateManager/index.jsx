import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function UpdateManager() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentVersion, setCurrentVersion] = useState("1.0.0");
  const [latestVersion, setLatestVersion] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("idle"); // idle, checking, downloading, installing, success, error
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Kiểm tra phiên bản mới
  const checkForUpdates = async () => {
    setUpdateStatus("checking");
    setErrorMessage("");

    try {
      if (window.electron && window.electron.checkForUpdates) {
        const result = await window.electron.checkForUpdates();
        if (result && result.error) {
          throw new Error(result.error);
        }
        // Update info will come via event listener
      } else {
        throw new Error(t("update_manager.electron_api_unavailable"));
      }
    } catch (error) {
      console.error("Check for updates error:", error);
      setErrorMessage(t("update_manager.cannot_check_update"));
      setUpdateStatus("error");
    }
  };

  // Tải và cài đặt bản cập nhật
  const downloadAndInstall = async () => {
    setUpdateStatus("downloading");
    setDownloadProgress(0);
    setErrorMessage("");

    try {
      if (window.electron && window.electron.downloadUpdate) {
        const result = await window.electron.downloadUpdate();
        if (result && result.error) {
          throw new Error(result.error);
        }
        // Progress will come via event listener
      } else {
        throw new Error(t("update_manager.electron_api_unavailable"));
      }
    } catch (error) {
      console.error("Download update error:", error);
      setErrorMessage(t("update_manager.download_install_error"));
      setUpdateStatus("error");
    }
  };

  // Cài đặt và khởi động lại
  const installUpdate = () => {
    if (window.electron && window.electron.quitAndInstall) {
      window.electron.quitAndInstall();
    }
  };

  useEffect(() => {
    // Get current version
    if (window.electron && window.electron.getCurrentVersion) {
      window.electron.getCurrentVersion().then((version) => {
        setCurrentVersion(version);
      });
    }

    // Setup event listeners
    if (window.electron) {
      // Update available
      if (window.electron.onUpdateAvailable) {
        window.electron.onUpdateAvailable((info) => {
          console.log("Update available:", info);
          setLatestVersion(info.version);
          setUpdateInfo({
            version: info.version,
            releaseDate:
              info.releaseDate || new Date().toISOString().split("T")[0],
            size: info.files && info.files[0] ? info.files[0].size : "Unknown",
            changelog: info.releaseNotes
              ? typeof info.releaseNotes === "string"
                ? info.releaseNotes.split("\n").filter(Boolean)
                : info.releaseNotes
              : [],
            downloadUrl: info.files && info.files[0] ? info.files[0].url : "",
          });
          setUpdateStatus("idle");
        });
      }

      // Update not available
      if (window.electron.onUpdateNotAvailable) {
        window.electron.onUpdateNotAvailable((info) => {
          console.log("Update not available:", info);
          setUpdateStatus("idle");
        });
      }

      // Download progress
      if (window.electron.onDownloadProgress) {
        window.electron.onDownloadProgress((progress) => {
          console.log("Download progress:", progress.percent);
          setDownloadProgress(progress.percent);
          setUpdateStatus("downloading");
        });
      }

      // Update downloaded
      if (window.electron.onUpdateDownloaded) {
        window.electron.onUpdateDownloaded((info) => {
          console.log("Update downloaded:", info);
          setUpdateStatus("success");
        });
      }

      // Update error
      if (window.electron.onUpdateError) {
        window.electron.onUpdateError((error) => {
          console.error("Update error:", error);
          setErrorMessage(error.message || t("update_manager.update_error_occurred"));
          setUpdateStatus("error");
        });
      }
    }

    // Tự động kiểm tra cập nhật khi vào trang
    setTimeout(() => {
      checkForUpdates();
    }, 1000);

    // Cleanup
    return () => {
      if (window.electron && window.electron.removeUpdateListeners) {
        window.electron.removeUpdateListeners();
      }
    };
  }, []);

  const isUpdateAvailable = latestVersion && latestVersion !== currentVersion;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded   transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    {t("update_manager.title")}
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("update_manager.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Current Version Card */}
          <div className="bg-white dark:bg-gray-800 rounded   shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t("update_manager.current_version")}
                </h2>
                <p className="text-3xl font-black text-blue-600">
                  v{currentVersion}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Update Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded   shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("update_manager.check_for_updates")}
              </h2>
              <button
                onClick={checkForUpdates}
                disabled={
                  updateStatus === "checking" ||
                  updateStatus === "downloading" ||
                  updateStatus === "installing"
                }
                className="px-4 py-2 bg-blue-600 text-white rounded   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg
                  className={`w-5 h-5 ${updateStatus === "checking" ? "animate-spin" : ""}`}
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
                {updateStatus === "checking"
                  ? t("update_manager.checking")
                  : t("update_manager.check_now")}
              </button>
            </div>

            {/* Status Messages */}
            {updateStatus === "checking" && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded  ">
                <svg
                  className="w-5 h-5 text-blue-600 animate-spin"
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
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  {t("update_manager.checking_new_version")}
                </p>
              </div>
            )}

            {updateStatus === "idle" && !isUpdateAvailable && latestVersion && (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded  ">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  {t("update_manager.using_latest_version")}
                </p>
              </div>
            )}

            {updateStatus === "error" && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded  ">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 dark:text-red-300 font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {updateStatus === "success" && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded  ">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      {t("update_manager.update_downloaded_success")}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {t("update_manager.click_to_install_restart")}
                    </p>
                    <button
                      onClick={installUpdate}
                      className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded   font-medium transition-colors"
                    >
                      {t("update_manager.install_and_restart")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Update Available Card */}
          {isUpdateAvailable && updateInfo && (
            <div className="bg-white dark:bg-gray-800 rounded   shadow-sm border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("update_manager.new_version_available")}
                    </h2>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded">
                      NEW
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-600">
                    v{updateInfo.version}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("update_manager.release_date")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {updateInfo.releaseDate}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("update_manager.size")}: {updateInfo.size}
                  </p>
                </div>
              </div>

              {/* Changelog */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  {t("update_manager.update_content")}:
                </h3>
                <ul className="space-y-2">
                  {updateInfo.changelog.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download Progress */}
              {(updateStatus === "downloading" ||
                updateStatus === "installing") && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {updateStatus === "downloading"
                        ? t("update_manager.downloading")
                        : t("update_manager.installing")}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {updateStatus === "downloading"
                        ? `${downloadProgress}%`
                        : ""}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{
                        width:
                          updateStatus === "downloading"
                            ? `${downloadProgress}%`
                            : "100%",
                      }}
                    >
                      {updateStatus === "installing" && (
                        <div className="w-full h-full bg-blue-600 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={downloadAndInstall}
                  disabled={
                    updateStatus === "downloading" ||
                    updateStatus === "installing"
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {updateStatus === "downloading"
                    ? t("update_manager.downloading_short")
                    : updateStatus === "installing"
                      ? t("update_manager.installing_short")
                      : t("update_manager.download_and_install")}
                </button>
              </div>
            </div>
          )}

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded   shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t("update_manager.system_info")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("update_manager.operating_system")}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {navigator.platform}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("update_manager.browser")}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {navigator.userAgent.split(" ").slice(-1)[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
