import React from "react";
import { useTranslation } from "react-i18next";

export default function DataForm({
  headers,
  data = null,
  row = null,
  onSubmit,
  onCancel,
  showAlert,
}) {
  const { t } = useTranslation();

  // Loại bỏ cột VĐV thắng (cột cuối cùng) khỏi form
  const editableHeaders = headers.slice(0, -1);

  const [formData, setFormData] = React.useState(() => {
    const initialData = {};
    editableHeaders.forEach((_, index) => {
      initialData[`col_${index}`] = data ? data[index] || "" : "";
    });
    initialData.match_status = row?.match_status || "WAI";

    // Khởi tạo winner
    const existingWinner = data ? data[data.length - 1] : "";
    const redName = data ? data[3] : "";
    const blueName = data ? data[6] : "";

    let initialWinner = "";
    if (existingWinner && existingWinner !== "-") {
      if (redName && existingWinner.includes(redName)) initialWinner = "red";
      else if (blueName && existingWinner.includes(blueName)) initialWinner = "blue";
    }
    initialData.winner = initialWinner;

    return initialData;
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = ["col_0", "col_1", "col_2", "col_3", "col_6"]; // STT, Nội dung, Hạng cân, VĐV đỏ, VĐV xanh
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      showAlert(t("competition_detail.data_form.required_fields_error"));
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAI":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "IN":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "FIN":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
      case "CAN":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Thông tin chung & Đỏ */}
        <div className="space-y-5">
          {/* Thông tin chung & Trạng thái */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              {t("competition_detail.modals.general_info_status")}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {editableHeaders[0] || t("competition_detail.data_form.stt_label")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    disabled
                    type="text"
                    value={formData.col_0 || ""}
                    onChange={(e) => setFormData({ ...formData, col_0: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.stt_placeholder")}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("competition_detail.data_form.status_label")}
                  </label>
                  <select
                    value={formData.match_status}
                    onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow ${getStatusColor(formData.match_status)}`}
                  >
                    <option value="WAI">{t("competition_detail.data_form.status_waiting")}</option>
                    <option value="IN">{t("competition_detail.data_form.status_ongoing")}</option>
                    <option value="FIN">{t("competition_detail.data_form.status_finished")}</option>
                    <option value="CAN">{t("competition_detail.data_form.status_cancelled")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {editableHeaders[1] || t("competition_detail.data_form.content_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_1 || ""}
                  onChange={(e) => setFormData({ ...formData, col_1: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.content_placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {editableHeaders[2] || t("competition_detail.data_form.weight_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_2 || ""}
                  onChange={(e) => setFormData({ ...formData, col_2: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.weight_placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between gap-2">
                  <span>{t("competition_detail.data_form.winner_label")}</span>
                  {formData.winner && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, winner: "" })}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {t("competition_detail.data_form.clear_winner")}
                    </button>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, winner: "red" })}
                    className={`py-2 px-3 border rounded shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.winner === "red"
                      ? "bg-red-600 border-red-600 text-white ring-2 ring-red-500 ring-offset-1 dark:ring-offset-gray-900"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400"
                      }`}
                  >
                    {formData.winner === "red" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px] border border-red-200 dark:border-red-800">{t("competition_detail.data_form.red_corner_icon")}</span>
                    )}
                    {t("competition_detail.data_form.red_wins")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, winner: "blue" })}
                    className={`py-2 px-3 border rounded shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.winner === "blue"
                      ? "bg-blue-600 border-blue-600 text-white ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    {formData.winner === "blue" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] border border-blue-200 dark:border-blue-800">{t("competition_detail.data_form.blue_corner_icon")}</span>
                    )}
                    {t("competition_detail.data_form.blue_wins")}
                  </button>
                </div>

                <select
                  value={formData.winner}
                  onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${formData.winner ? 'border-yellow-400 ring-1 ring-yellow-400 dark:border-yellow-500 text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-300 dark:border-gray-600'} rounded shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm font-semibold transition-shadow`}
                >
                  <option value="">{t("competition_detail.data_form.no_winner")}</option>
                  <option value="red">{t("competition_detail.data_form.red_athlete")}: {formData.col_3 || t("competition_detail.data_form.updating")}</option>
                  <option value="blue">{t("competition_detail.data_form.blue_athlete")}: {formData.col_6 || t("competition_detail.data_form.updating")}</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Cột phải: Các VĐV */}
        <div className="space-y-5">
          {/* VĐV ĐỎ */}
          <section>
            <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-3 border-b border-red-100 dark:border-red-900/50 pb-2">
              {t("competition_detail.data_form.red_corner_label")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("competition_detail.data_form.name_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_3 || ""}
                  onChange={(e) => setFormData({ ...formData, col_3: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.red_athlete_name_placeholder")}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("competition_detail.data_form.unit_label")}
                  </label>
                  <input
                    type="text"
                    value={formData.col_4 || ""}
                    onChange={(e) => setFormData({ ...formData, col_4: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.unit_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {editableHeaders[5] || t("competition_detail.data_form.birth_year_label")}
                  </label>
                  <input
                    disabled
                    type="text"
                    value={formData.col_5 || ""}
                    onChange={(e) => setFormData({ ...formData, col_5: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.flag_placeholder")}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* VĐV XANH */}
          <section>
            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 border-b border-blue-100 dark:border-blue-900/50 pb-2">
              {t("competition_detail.data_form.blue_corner_label")}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("competition_detail.data_form.name_label")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.col_6 || ""}
                  onChange={(e) => setFormData({ ...formData, col_6: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder={t("competition_detail.data_form.blue_athlete_name_placeholder")}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t("competition_detail.data_form.unit_label")}
                  </label>
                  <input
                    type="text"
                    value={formData.col_7 || ""}
                    onChange={(e) => setFormData({ ...formData, col_7: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.unit_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {editableHeaders[8] || t("competition_detail.data_form.birth_year_label")}
                  </label>
                  <input
                    disabled
                    type="text"
                    value={formData.col_8 || ""}
                    onChange={(e) => setFormData({ ...formData, col_8: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder={t("competition_detail.data_form.flag_placeholder")}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
        >
          {t("competition_detail.buttons.cancel")}
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {data ? t("competition_detail.confirm.update") : t("competition_detail.confirm.add_new")}
        </button>
      </div>
    </form>
  );
}
