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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto py-2">
      {/* 1. General Info Section */}
      <section className="bg-white dark:bg-gray-800/40 p-6 rounded border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {t("competition_detail.modals.general_info_status")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
              {editableHeaders[0] || t("competition_detail.data_form.stt_label")} <span className="text-red-500">*</span>
            </label>
            <input
              disabled
              type="text"
              value={formData.col_0 || ""}
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded text-sm font-bold border-none ring-1 ring-gray-100 dark:ring-gray-800 text-gray-400"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
              {t("competition_detail.data_form.status_label")}
            </label>
            <div className="relative">
              <select
                value={formData.match_status}
                onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900 rounded text-sm font-bold transition-all appearance-none ring-1 ${formData.match_status === "IN" ? "ring-blue-500/50 text-blue-600" :
                  formData.match_status === "FIN" ? "ring-emerald-500/50 text-emerald-600" :
                    "ring-gray-200 dark:ring-gray-800"
                  }`}
              >
                <option value="WAI">{t("competition_detail.data_form.status_waiting")}</option>
                <option value="IN">{t("competition_detail.data_form.status_ongoing")}</option>
                <option value="FIN">{t("competition_detail.data_form.status_finished")}</option>
                <option value="CAN">{t("competition_detail.data_form.status_cancelled")}</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
              {editableHeaders[1] || t("competition_detail.data_form.content_label")}
            </label>
            <input
              type="text"
              value={formData.col_1 || ""}
              onChange={(e) => setFormData({ ...formData, col_1: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder={t("competition_detail.data_form.content_placeholder")}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
              {editableHeaders[2] || t("competition_detail.data_form.weight_label")}
            </label>
            <input
              type="text"
              value={formData.col_2 || ""}
              onChange={(e) => setFormData({ ...formData, col_2: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none ring-1 ring-gray-200 dark:ring-gray-800 rounded text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all uppercase"
              placeholder={t("competition_detail.data_form.weight_placeholder")}
            />
          </div>
        </div>
      </section>

      {/* 2. Athletes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RED ATHLETE */}
        <section className="bg-red-50/30 dark:bg-red-950/20 p-6 rounded border border-red-100/50 dark:border-red-900/30">
          <h3 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            {t("competition_detail.data_form.red_corner_label")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-red-400 dark:text-red-600/50 uppercase tracking-widest mb-2 px-1">
                {t("competition_detail.data_form.name_label")}
              </label>
              <input
                type="text"
                value={formData.col_3 || ""}
                onChange={(e) => setFormData({ ...formData, col_3: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none ring-1 ring-red-200 dark:ring-red-900/50 rounded text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all uppercase"
                placeholder={t("competition_detail.data_form.red_athlete_name_placeholder")}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-red-400 dark:text-red-600/50 uppercase tracking-widest mb-2 px-1">
                {t("competition_detail.data_form.unit_label")}
              </label>
              <input
                type="text"
                value={formData.col_4 || ""}
                onChange={(e) => setFormData({ ...formData, col_4: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none ring-1 ring-red-200 dark:ring-red-900/50 rounded text-sm font-bold focus:ring-2 focus:ring-red-500 transition-all"
                placeholder={t("competition_detail.data_form.unit_placeholder")}
              />
            </div>
          </div>
        </section>

        {/* BLUE ATHLETE */}
        <section className="bg-blue-50/30 dark:bg-blue-950/20 p-6 rounded border border-blue-100/50 dark:border-blue-900/30">
          <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {t("competition_detail.data_form.blue_corner_label")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-blue-400 dark:text-blue-600/50 uppercase tracking-widest mb-2 px-1">
                {t("competition_detail.data_form.name_label")}
              </label>
              <input
                type="text"
                value={formData.col_6 || ""}
                onChange={(e) => setFormData({ ...formData, col_6: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none ring-1 ring-blue-200 dark:ring-blue-900/50 rounded text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                placeholder={t("competition_detail.data_form.blue_athlete_name_placeholder")}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-blue-400 dark:text-blue-600/50 uppercase tracking-widest mb-2 px-1">
                {t("competition_detail.data_form.unit_label")}
              </label>
              <input
                type="text"
                value={formData.col_7 || ""}
                onChange={(e) => setFormData({ ...formData, col_7: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none ring-1 ring-blue-200 dark:ring-blue-900/50 rounded text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={t("competition_detail.data_form.unit_placeholder")}
              />
            </div>
          </div>
        </section>
      </div>

      {/* 3. Result Section */}
      <section className="bg-amber-50/30 dark:bg-amber-950/20 p-6 rounded border border-amber-100/50 dark:border-amber-900/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            {t("competition_detail.data_form.winner_label")}
          </h3>
          {formData.winner && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, winner: "" })}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
            >
              {t("competition_detail.data_form.clear_winner")}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, winner: "red" })}
            className={`flex items-center justify-center gap-3 p-4 rounded font-black text-[11px] uppercase tracking-widest transition-all ${formData.winner === "red"
              ? "bg-red-600 text-white shadow-xl shadow-red-500/30 scale-[1.02]"
              : "bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800"
              }`}
          >
            {t("competition_detail.data_form.red_wins")}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, winner: "blue" })}
            className={`flex items-center justify-center gap-3 p-4 rounded font-black text-[11px] uppercase tracking-widest transition-all ${formData.winner === "blue"
              ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]"
              : "bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800"
              }`}
          >
            {t("competition_detail.data_form.blue_wins")}
          </button>
        </div>
      </section>

      {/* Footer Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-8 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          {t("competition_detail.buttons.cancel")}
        </button>
        <button
          type="submit"
          className="flex- [2] px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {data ? t("competition_detail.confirm.update") : t("competition_detail.confirm.add_new")}
        </button>
      </div>
    </form>
  );
}
