import React from "react";

/**
 * Section: Thông tin trận đấu
 * Hiển thị thông tin cơ bản về trận đấu (Hệ điểm, Số giám định, Tổng số hiệp)
 */
const MatchInfoSection = ({ matchInfo }) => {
  return (
    <div className="bg-white rounded shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>Thông tin trận đấu</span>
        </h3>
      </div>

      <div className="p-6 grid grid-cols-3 gap-5">
        {/* Hệ điểm */}
        <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-500 p-1.5 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <label className="text-blue-700 text-sm font-bold uppercase tracking-wide">
              Hệ điểm
            </label>
          </div>
          <div className="text-3xl font-black text-blue-900">
            Hệ điểm {matchInfo.he_diem || "2"}
          </div>
          <p className="text-blue-600 text-xs mt-1 font-medium">
            Theo Quản lý cài đặt
          </p>
        </div>

        {/* Số giám định */}
        <div className="group bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-200 p-5 rounded hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-500 p-1.5 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <label className="text-blue-700 text-sm font-bold uppercase tracking-wide">
              Số giám định
            </label>
          </div>
          <div className="text-3xl font-black text-blue-900">
            {matchInfo.so_giam_dinh || "3"} GĐ
          </div>
          <p className="text-blue-600 text-xs mt-1 font-medium">
            Theo Quản lý cài đặt
          </p>
        </div>

        {/* Tổng số hiệp */}
        <div className="group bg-gradient-to-br from-blue-50 to-blue-50 border-2 border-blue-200 p-5 rounded hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-500 p-1.5 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <label className="text-blue-700 text-sm font-bold uppercase tracking-wide">
              Tổng số hiệp
            </label>
          </div>
          <div className="text-3xl font-black text-blue-900">
            {(matchInfo.so_hiep || 3) + (matchInfo.so_hiep_phu || 0)} hiệp
          </div>
          <p className="text-blue-600 text-xs mt-1 font-medium">
            {matchInfo.so_hiep || 3} chính + {matchInfo.so_hiep_phu || 0} phụ
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchInfoSection;
