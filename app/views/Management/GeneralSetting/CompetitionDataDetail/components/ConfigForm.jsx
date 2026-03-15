import React from "react";
import { useTranslation } from "react-i18next";

export default function ConfigForm({ row, onSubmit, onCancel }) {
  const { t } = useTranslation();

  const [configData, setConfigData] = React.useState({
    // Cài đặt chung
    so_hiep: 3,
    so_hiep_phu: 1,
    so_giam_dinh: 3,
    he_diem: "10",

    // Thời gian
    thoi_gian_tinh_diem: 1000,
    thoi_gian_thi_dau: 120,
    thoi_gian_hiep: 90,
    thoi_gian_nghi: 30,
    thoi_gian_hiep_phu: 90,
    thoi_gian_y_te: 30,

    // Điểm áp dụng
    khoang_diem_tuyet_toi: 10,

    // Chế độ áp dụng
    cau_hinh_doi_khang_diem_thap: false,
    cau_hinh_quyen_tinh_tong: false,
    cau_hinh_y_te: false,
    cau_hinh_tinh_diem_tuyet_doi: false,
    cau_hinh_xoa_nhac_nho: false,
    cau_hinh_xoa_canh_cao: false,
  });

  React.useEffect(() => {
    // Load config từ row nếu có
    if (row?.config_system) {
      setConfigData((prev) => ({ ...prev, ...row.config_system }));
    }
  }, [row]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(configData);
  };

  const handleChange = (field, value) => {
    setConfigData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full">
      {/* Content - Scrollable */}
      <div className="p-6 overflow-y-auto max-h-[calc(70vh-140px)] bg-white dark:bg-gray-900 space-y-8">
        {/* Section: Thông tin chung về thể thức */}
        <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.modals.format_info")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hệ điểm */}
            <div className="bg-white dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-sm shadow-sm">
              {String(configData.he_diem) === "1" ? t("competition_detail.modals.system_1") : String(configData.he_diem) === "2" ? t("competition_detail.modals.system_2") : String(configData.he_diem) === "3" ? t("competition_detail.modals.system_3") : t("competition_detail.modals.system_2")}
            </div>

            {/* Số giám định */}
            <div className="bg-white dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-sm shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{t("competition_detail.modals.referee_count_label")}</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {t("competition_detail.modals.referees_count", { count: configData.so_giam_dinh || 3 })}
              </span>
            </div>

            {/* Tổng số hiệp */}
            <div className="bg-white dark:bg-gray-800/80 rounded border border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center text-sm shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{t("competition_detail.modals.total_round_label")}</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {t("competition_detail.modals.rounds_count", { count: (configData.so_hiep || 3) + (configData.so_hiep_phu || 0) })}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Cấu hình hiệp */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.modals.round_config")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Số hiệp chính */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.main_rounds_label")}</label>
              <select
                value={configData.so_hiep || "3"}
                onChange={(e) => handleChange("so_hiep", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="1">{t("competition_detail.modals.rounds_count", { count: 1 })}</option>
                <option value="2">{t("competition_detail.modals.rounds_count", { count: 2 })}</option>
                <option value="3">{t("competition_detail.modals.rounds_count", { count: 3 })}</option>
              </select>
            </div>

            {/* Số hiệp phụ */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.extra_rounds_label")}</label>
              <select
                value={configData.so_hiep_phu || "0"}
                onChange={(e) => handleChange("so_hiep_phu", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="0">{t("competition_detail.modals.none")}</option>
                <option value="1">{t("competition_detail.modals.extra_round_count", { count: 1 })}</option>
                <option value="2">{t("competition_detail.modals.extra_round_count", { count: 2 })}</option>
                <option value="3">{t("competition_detail.modals.extra_round_count", { count: 3 })}</option>
              </select>
            </div>

            {/* Hệ điểm */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.score_system_label")}</label>
              <select
                value={configData.he_diem || "2"}
                onChange={(e) => handleChange("he_diem", e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="1">{t("competition_detail.modals.system_1")}</option>
                <option value="2">{t("competition_detail.modals.system_2")}</option>
                <option value="3">{t("competition_detail.modals.system_3")}</option>
              </select>
            </div>

            {/* Số giám định */}
            <div className="group flex flex-col pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.referee_count_label")}</label>
              <select
                value={configData.so_giam_dinh || "3"}
                onChange={(e) => handleChange("so_giam_dinh", e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              >
                <option value="3">{t("competition_detail.modals.referees_count", { count: 3 })}</option>
                <option value="5">{t("competition_detail.modals.referees_count", { count: 5 })}</option>
                <option value="10">{t("competition_detail.modals.referees_count", { count: 10 })}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Cấu hình thời gian */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {t("competition_detail.modals.time_config")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Thời gian tính điểm */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.score_point_ms")}</label>
              <input
                type="number"
                value={configData.thoi_gian_tinh_diem}
                onChange={(e) => handleChange("thoi_gian_tinh_diem", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian thi đấu */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.time_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_thi_dau}
                onChange={(e) => handleChange("thoi_gian_thi_dau", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian nghỉ */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.rest_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_nghi}
                onChange={(e) => handleChange("thoi_gian_nghi", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian hiệp phụ */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.extra_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_hiep_phu}
                onChange={(e) => handleChange("thoi_gian_hiep_phu", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-medium"
              />
            </div>

            {/* Thời gian y tế */}
            <div className="flex flex-col group pt-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.medical_seconds")}</label>
              <input
                type="number"
                value={configData.thoi_gian_y_te}
                onChange={(e) => handleChange("thoi_gian_y_te", parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section: Điểm áp dụng & Chế độ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t("competition_detail.modals.max_score_rule")}
            </h3>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t("competition_detail.modals.max_score_gap")}</label>
              <div className="relative">
                <input
                  type="number"
                  value={configData.khoang_diem_tuyet_toi}
                  onChange={(e) => handleChange("khoang_diem_tuyet_toi", parseInt(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded border border-gray-200 dark:border-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono font-medium pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{t("competition_detail.modals.points")}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              {t("competition_detail.modals.application_rule")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { key: "cau_hinh_doi_khang_diem_thap", label: t("competition_detail.modals.rule_low_score") },
                { key: "cau_hinh_quyen_tinh_tong", label: t("competition_detail.modals.rule_total_score") },
                { key: "cau_hinh_y_te", label: t("competition_detail.modals.rule_medical") },
                { key: "cau_hinh_tinh_diem_tuyet_doi", label: t("competition_detail.modals.rule_absolute_win") },
                { key: "cau_hinh_xoa_nhac_nho", label: t("competition_detail.modals.rule_clear_reminder") },
                { key: "cau_hinh_xoa_canh_cao", label: t("competition_detail.modals.rule_clear_warning") },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <input
                    type="checkbox"
                    id={key}
                    checked={configData[key] || false}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Giống Vovinam */}
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white px-6 py-2  font-semibold transition-colors rounded"
        >
          {t("competition_detail.buttons.cancel")}
        </button>
        <button
          type="submit"
          className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2  font-semibold transition-colors rounded shadow-sm"
        >
          {t("competition_detail.modals.save_changes")}
        </button>
      </div>
    </form>
  );
}
