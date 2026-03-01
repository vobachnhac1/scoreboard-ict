import React from "react";

import { CONFIG_PRESETS } from "../keyboardConfig";

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
  keyboardMode,
}) => {
  const currentModeConfig = CONFIG_PRESETS[keyboardMode] || CONFIG_PRESETS.vovinam;
  const hiddenFields = currentModeConfig.hiddenFields || [];
  const disabledFields = currentModeConfig.disabledFields || [];
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-1.5 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span>Quyền hiển thị phím nhấn</span>
        </h3>
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Phím nhấn điểm số */}
        <div className="md:col-span-5 lg:col-span-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <h4 className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold mb-2 text-[11px] uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Phím nhấn điểm số
          </h4>
          <div className="space-y-1">
            {[
              { key: 'hien_thi_button_diem_1', label: 'Điểm +1/-1' },
              { key: 'hien_thi_button_diem_2', label: 'Điểm +2/-2' },
              { key: 'hien_thi_button_diem_3', label: 'Điểm +3/-3' },
              { key: 'hien_thi_button_diem_5', label: 'Điểm +5/-5' },
              { key: 'hien_thi_button_diem_10', label: 'Điểm +10/-10' },
            ].filter(item => !hiddenFields.includes(item.key)).map(item => {
              const isDisabled = disabledFields.includes(item.key);
              return (
                <label key={item.key} className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 text-[11px] cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-1.5 rounded transition-colors border border-transparent ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-200 dark:hover:border-gray-600"}`}>
                  <input type="checkbox" disabled={isDisabled} checked={buttonPermissions[item.key]} onChange={(e) => setButtonPermissions({ ...buttonPermissions, [item.key]: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50" />
                  <span className="font-medium">{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Phím nhấn hành động */}
        <div className="md:col-span-7 lg:col-span-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <h4 className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold mb-2 text-[11px] uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Phím nhấn hành động
          </h4>
          <div className="grid grid-cols-2 gap-1 gap-y-1.5">
            {[
              { key: 'hien_thi_button_nhac_nho', label: 'Nhắc nhở' },
              { key: 'hien_thi_button_canh_cao', label: 'Cảnh cáo' },
              { key: 'hien_thi_button_don_chan', label: 'Đòn chân' },
              { key: 'hien_thi_button_bien', label: 'Biên' },
              { key: 'hien_thi_button_nga', label: 'Ngã' },
              { key: 'hien_thi_button_y_te', label: 'Y tế' },
              { key: 'hien_thi_button_thang', label: 'Thắng' },
            ].filter(item => !hiddenFields.includes(item.key)).map(item => {
              const isDisabled = disabledFields.includes(item.key);
              return (
                <label key={item.key} className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 text-[11px] cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-1.5 rounded transition-colors border border-transparent ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-200 dark:hover:border-gray-600"}`}>
                  <input type="checkbox" disabled={isDisabled} checked={buttonPermissions[item.key]} onChange={(e) => setButtonPermissions({ ...buttonPermissions, [item.key]: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50" />
                  <span className="font-medium">{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Phím nhấn điều khiển */}
        <div className="md:col-span-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <h4 className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold mb-2 text-[11px] uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Phím nhấn điều khiển
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'hien_thi_button_quay_lai', label: 'Thoát' },
              { key: 'hien_thi_button_reset', label: 'Reset' },
              { key: 'hien_thi_button_lich_su', label: 'Lịch sử' },
              { key: 'hien_thi_button_cau_hinh', label: 'Cấu hình' },
              { key: 'hien_thi_button_ket_thuc', label: 'Kết thúc' },
              { key: 'hien_thi_button_tran_tiep_theo', label: 'Trận sau' },
              { key: 'hien_thi_button_tran_truoc', label: 'Trận trước' },
              { key: 'hien_thi_button_hiep_phu', label: 'Hiệp phụ' },
            ].filter(item => !hiddenFields.includes(item.key)).map(item => {
              const isDisabled = disabledFields.includes(item.key);
              return (
                <label key={item.key} className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 text-[11px] cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-1.5 rounded transition-colors border border-transparent ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-200 dark:hover:border-gray-600"}`}>
                  <input type="checkbox" disabled={isDisabled} checked={buttonPermissions[item.key]} onChange={(e) => setButtonPermissions({ ...buttonPermissions, [item.key]: e.target.checked })} className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50" />
                  <span className="font-medium">{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Vô hiệu hóa buttons */}
        <div className="md:col-span-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded">
          <h4 className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-bold mb-2 text-[11px] uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
            Vô hiệu hóa buttons
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-3 text-gray-800 dark:text-gray-200 text-xs cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 p-2.5 rounded transition-all border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Vô hiệu hóa tất cả buttons ĐỎ
              </span>
              <input type="checkbox" checked={disableRedButtons} onChange={(e) => setDisableRedButtons(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700" />
            </label>
            <label className="flex items-center justify-between gap-3 text-gray-800 dark:text-gray-200 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 p-2.5 rounded transition-all border border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Vô hiệu hóa tất cả buttons XANH
              </span>
              <input type="checkbox" checked={disableBlueButtons} onChange={(e) => setDisableBlueButtons(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
            </label>
          </div>
          <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800/80 border-l-2 border-gray-400 dark:border-gray-600 rounded">
            <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Khi bật, tất cả các nút điều khiển của đội tương ứng sẽ bị vô hiệu hóa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonPermissionsSection;
