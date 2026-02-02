import React, { useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import DoiKhangResultReport from "./DoiKhangResultReport";
import QuyenResultReport from "./QuyenResultReport";
import { combineReducers } from "@reduxjs/toolkit";
import JudgeScore from "../BangDiemQuyen/components/JudgeScore";
function ReportsHome() {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Quản lý Đối Kháng",
      description: "Tạo và quản lý template báo cáo kết quả thi đấu đối kháng",
      icon: "⚔️",
      href: "/reports/template-editor/doikhang",
      gradient: "from-red-500 to-red-600",
      stats: { label: "Template", value: "DK" },
    },
    {
      title: "Quản lý Quyền",
      description: "Tạo và quản lý template báo cáo kết quả thi đấu quyền",
      icon: "🥋",
      href: "/reports/template-editor/quyen",
      gradient: "from-blue-500 to-blue-600",
      stats: { label: "Template", value: "QY" },
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quản lý báo cáo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tạo và xuất các loại báo cáo từ dữ liệu hệ thống
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.href)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105 border border-gray-200 dark:border-gray-700"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              <div className="relative p-6">
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {card.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {card.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    {card.stats.label}
                  </span>
                  <span
                    className={`text-2xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                  >
                    {card.stats.value}
                  </span>
                </div>

                {/* Arrow icon */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-6 h-6 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mt-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-blue-900 dark:text-blue-100 font-semibold mb-2">
                Hướng dẫn sử dụng
              </h4>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                <li>• Chọn loại báo cáo muốn tạo từ các card bên trên</li>
                <li>• Upload file dữ liệu hoặc chọn từ hệ thống</li>
                <li>• Tùy chỉnh template và định dạng báo cáo</li>
                <li>• Xem trước và xuất file PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ReportsHome;
