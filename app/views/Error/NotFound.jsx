import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 animate-pulse">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl mb-8">
          <svg
            className="w-16 h-16 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          {t("page_not_found")}
        </h2>

        {/* Description */}
        <div className="bg-white rounded shadow-xl p-8 mb-8 border-2 border-purple-200">
          <p className="text-gray-600 text-lg mb-4">
            {t("page_not_found_desc")}
          </p>
          <p className="text-gray-500 text-sm">
            {t("check_url")}
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded shadow-xl p-6 mb-8 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {t("popular_pages")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() =>
                navigate("/management/general-setting/competition-management")
              }
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-purple-700">
                  {t("competition_management")}
                </p>
                <p className="text-xs text-gray-500">{t("create_manage_competition")}</p>
              </div>
            </button>

            <button
              onClick={() =>
                navigate("/management/general-setting/config-system")
              }
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-green-700">
                  {t("config_management")}
                </p>
                <p className="text-xs text-gray-500">{t("system_setup")}</p>
              </div>
            </button>

            {/* <button
              onClick={() => navigate('/scoreboard')}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xl"></span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-orange-700">Bảng điểm</p>
                <p className="text-xs text-gray-500">Xem kết quả thi đấu</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/bang-diem/quyen')}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xl">✍️</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">Chấm điểm</p>
                <p className="text-xs text-gray-500">Nhập điểm trận đấu</p>
              </div>
            </button> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t("go_home")}
            </div>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white text-gray-900 font-bold rounded shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-200 w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t("back")}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
