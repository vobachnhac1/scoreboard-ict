import React from 'react';
import { useTranslation } from 'react-i18next';
// import classNames from 'classnames';
import { TabPanel } from "@headlessui/react";

export default function DataManagementPanel(props) {
  const { t } = useTranslation();
  const { viewMode, setViewMode, dataTypeFilter, setDataTypeFilter, savedData, memoizedSavedData, loadingData, fetchSavedData, handleDelete, handleReset, handleViewDetail } = props;
  return (
    <>
      <TabPanel>
        {/* Header với button refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">
                {t("competition_management.saved_data")}
              </h2>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-bold italic">
                {t("competition_management.saved_data_desc")}
              </p>
            </div>

            {/* Badge số lượng */}
            {!loadingData && savedData.length > 0 && (
              <div className="flex items-center gap-3 px-2 py-2 bg-blue-600 rounded shadow-lg   ">
                <svg
                  className="w-5 h-5 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-[10px] text-white/70 font-black uppercase leading-none">
                    {t("competition_management.total_files")}
                  </p>
                  <p className="text-xl font-black text-white leading-tight">
                    {savedData.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Data Type Filter Toggle */}
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/10 p-1 rounded border border-blue-100 dark:border-blue-800">
              <button
                onClick={() => setDataTypeFilter("all")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dataTypeFilter === "all"
                  ? "bg-blue-600 text-white shadow-md "
                  : "text-blue-400 hover:text-blue-600"
                  }`}
              >
                <span>{t("competition_management.filter_all")}</span>
              </button>
              <button
                onClick={() => setDataTypeFilter("excel")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dataTypeFilter === "excel"
                  ? "bg-blue-600 text-white shadow-md "
                  : "text-blue-400 hover:text-blue-600"
                  }`}
              >
                <span>{t("competition_management.filter_manual")}</span>
              </button>
              <button
                onClick={() => setDataTypeFilter("auto")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${dataTypeFilter === "auto"
                  ? "bg-blue-600 text-white shadow-md "
                  : "text-blue-400 hover:text-blue-600"
                  }`}
              >
                <span>{t("competition_management.filter_auto")}</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-blue-50 dark:bg-blue-900/10 p-1 rounded border border-blue-100 ">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-md "
                  : "text-blue-400 hover:text-blue-600"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>{t("competition_management.grid_view")}</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "list"
                  ? "bg-blue-600 text-white shadow-md "
                  : "text-blue-400 hover:text-blue-600"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>{t("competition_management.list_view")}</span>
              </button>
            </div>

            <button
              onClick={fetchSavedData}
              disabled={loadingData}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg  transition-all duration-300 active:scale-95 disabled:opacity-50  "
            >
              <svg
                className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>
                {loadingData ? t("common.loading") : t("common.refresh")}
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loadingData ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t("competition_management.loading_data")}
              </p>
            </div>
          ) : savedData.length === 0 ? (
            <div className="relative text-center py-16 bg-blue-50 dark:bg-blue-900 rounded border-2 border-dashed border-blue-200 dark:border-blue-700 overflow-hidden">
              {/* Animated background circles */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
              <div
                className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 dark:bg-blue-600 rounded-full mb-4 shadow-lg">
                  <svg
                    className="h-10 w-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
                  {t("competition_management.no_data")}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t("competition_management.no_data_desc")}
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {memoizedSavedData.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-800 rounded overflow-hidden shadow-xl shadow-blue-500/5 border border-blue-50 dark:border-blue-900/30 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-blue-50 dark:border-blue-900/10 bg-blue-50/30 dark:bg-blue-900/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase leading-tight mb-2 break-words">
                          {item.sheet_name}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-white px-2 py-0.5 bg-blue-600 rounded uppercase tracking-tighter">
                            ID: #{item.id}
                          </span>
                          <span className="text-[10px] font-bold text-blue-500 truncate max-w-[150px]">
                            {item.file_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-blue-900 rounded shadow-sm border border-blue-100 dark:border-blue-700 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-blue-600 leading-none">
                          {item.data?.length > 0
                            ? item.data?.length - 1
                            : 0}
                        </span>
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">
                          {t("competition_management.rows")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">
                          {t("competition_management.updated_at")}
                        </p>
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                          {new Date(item.created_at).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow hover:shadow-lg transition-all active:scale-95"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {t("competition_management.view_detail")}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border border-red-200 hover:border-red-600 transition-all active:scale-95"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        {t("competition_management.delete_data")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {memoizedSavedData.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-800 rounded overflow-hidden shadow-xl shadow-blue-500/5 border border-blue-50 dark:border-blue-900/30 hover:border-blue-500 transition-all duration-300"
                >
                  <div className="flex items-center gap-6 p-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center text-blue-600 shadow-inner">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">
                          {t("competition_management.competition_content")}
                        </p>
                        <h3 className="text-base font-black text-blue-900 dark:text-blue-100 uppercase truncate">
                          {item.sheet_name}
                        </h3>
                        <span className="inline-block mt-1 text-[9px] font-black text-white px-2 py-0.5 bg-blue-500 rounded uppercase tracking-tighter">
                          ID: #{item.id}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">
                          {t("competition_management.file_info")}
                        </p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">
                          {item.file_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-blue-600">
                            {item.data?.length > 0
                              ? item.data?.length - 1
                              : 0}
                          </span>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                            {t("competition_management.data_rows")}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">
                          {t("competition_management.last_updated")}
                        </p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                          {new Date(item.created_at).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-md transition-all active:scale-95"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {t("competition_management.view")}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded border border-red-200 hover:border-red-600 transition-all active:scale-95"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {t("competition_management.delete")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabPanel>
    </>
  );
}
