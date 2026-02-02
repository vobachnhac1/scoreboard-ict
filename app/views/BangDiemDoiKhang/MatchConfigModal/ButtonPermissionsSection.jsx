import React from "react";

/**
 * Section: Quyền hiển thị buttons
 * Quản lý permissions cho tất cả các buttons trong scoreboard
 */
const ButtonPermissionsSection = ({
  buttonPermissions,
  setButtonPermissions,
  disableRedButtons,
  setDisableRedButtons,
  disableBlueButtons,
  setDisableBlueButtons,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 dark:from-blue-600 dark:via-blue-700 dark:to-blue-700 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm p-2 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span>Quyền hiển thị buttons</span>
        </h3>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900 grid grid-cols-2 gap-6">
        {/* Buttons điểm số */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-200 dark:border-blue-700 p-5 rounded">
          <h4 className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-4 text-base uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            Buttons điểm số
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_diem_1}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_diem_1: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
              />
              <span className="font-semibold">Điểm +1/-1</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_diem_2}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_diem_2: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
              />
              <span className="font-semibold">Điểm +2/-2</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_diem_3}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_diem_3: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
              />
              <span className="font-semibold">Điểm +3/-3</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_diem_5}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_diem_5: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
              />
              <span className="font-semibold">Điểm +5/-5</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_diem_10}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_diem_10: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
              />
              <span className="font-semibold">Điểm +10/-10</span>
            </label>
          </div>
        </div>

        {/* Buttons hành động */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-2 border-green-200 dark:border-green-700 p-5 rounded">
          <h4 className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-4 text-base uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Buttons hành động
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_nhac_nho}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_nhac_nho: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Nhắc nhở</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_canh_cao}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_canh_cao: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Cảnh cáo</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_don_chan}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_don_chan: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Đòn chân</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_bien}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_bien: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Biên</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_nga}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_nga: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Ngã</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_y_te}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_y_te: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Y tế</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_thang}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_thang: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-green-400 dark:border-green-600 text-green-600 dark:text-green-500 focus:ring-2 focus:ring-green-300 dark:focus:ring-green-600"
              />
              <span className="font-semibold">Thắng</span>
            </label>
          </div>
        </div>

        {/* Buttons điều khiển */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 border-2 border-amber-200 dark:border-amber-700 p-5 rounded col-span-2">
          <h4 className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold mb-4 text-base uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Buttons điều khiển
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_quay_lai}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_quay_lai: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Thoát</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_reset}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_reset: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Reset</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_lich_su}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_lich_su: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Lịch sử</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_cau_hinh}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_cau_hinh: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Cấu hình</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_ket_thuc}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_ket_thuc: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Kết thúc</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_tran_tiep_theo}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_tran_tiep_theo: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Trận sau</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_tran_truoc}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_tran_truoc: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Trận trước</span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded transition-all">
              <input
                type="checkbox"
                checked={buttonPermissions.hien_thi_button_hiep_phu}
                onChange={(e) =>
                  setButtonPermissions({
                    ...buttonPermissions,
                    hien_thi_button_hiep_phu: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-amber-400 dark:border-amber-600 text-amber-600 dark:text-amber-500 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
              <span className="font-semibold">Hiệp phụ</span>
            </label>
          </div>
        </div>

        {/* Vô hiệu hóa buttons */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900 dark:to-pink-900 border-2 border-rose-200 dark:border-rose-700 p-5 rounded col-span-2">
          <h4 className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold mb-4 text-base uppercase tracking-wide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
            Vô hiệu hóa buttons
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-3 rounded transition-all border-2 border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/30">
              <input
                type="checkbox"
                checked={disableRedButtons}
                onChange={(e) => setDisableRedButtons(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-red-400 dark:border-red-600 text-red-600 dark:text-red-500 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600"
              />
              <span className="font-bold text-red-700 dark:text-red-300">
                🔴 Vô hiệu hóa tất cả buttons ĐỎ
              </span>
            </label>
            <label className="flex items-center gap-3 text-gray-800 dark:text-gray-200 text-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-700/50 p-3 rounded transition-all border-2 border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/30">
              <input
                type="checkbox"
                checked={disableBlueButtons}
                onChange={(e) => setDisableBlueButtons(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
              />
              <span className="font-bold text-blue-700 dark:text-blue-300">
                🔵 Vô hiệu hóa tất cả buttons XANH
              </span>
            </label>
          </div>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 dark:border-amber-600 rounded-r">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Khi bật, tất cả các nút điều khiển của đội tương ứng sẽ bị vô hiệu
              hóa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonPermissionsSection;
