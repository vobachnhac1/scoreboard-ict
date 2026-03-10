import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ResultForm({ row, onSubmit, onCancel, showAlert }) {
  const { t } = useTranslation();
  // Lấy thông tin từ row
  const redName = row?.data[3] || "-";
  const redUnit = row?.data[4] || "";
  const blueName = row?.data[6] || "-";
  const blueUnit = row?.data[7] || "";
  const existingWinner = row?.data[row?.data?.length - 1] || ""; // Cột cuối là VĐV thắng

  // Xác định winner từ dữ liệu có sẵn
  const getInitialWinner = () => {
    if (!existingWinner || existingWinner === "-") return "";
    // So sánh tên để xác định winner
    if (existingWinner.includes(redName)) return "red";
    if (existingWinner.includes(blueName)) return "blue";
    return "";
  };
  // thông tin khởi tạo
  const initialData = {
    winner: getInitialWinner(),
    red_score: 0,
    blue_score: 0,
    notes: "",
  };

  const [formData, setFormData] = React.useState(initialData);

  const [isEditing, setIsEditing] = React.useState(
    !existingWinner || existingWinner === "-",
  );
  const [isUpdated, setIsUpdated] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.winner && !isUpdated) {
      showAlert(t("competition_detail.result_form.select_winner"));
      return;
    }
    if (!isUpdated) {
      onSubmit(formData);
      setIsUpdated(false);
    }
  };

  const handleSelectWinner = (winner) => {
    setIsUpdated(false);
    setFormData({ ...formData, winner });
  };

  const handleUpdate = () => {
    setIsUpdated(true);
    setIsEditing(true);
    setFormData({
      winner: "",
      red_score: 0,
      blue_score: 0,
      notes: "",
    });
  };
  const handleCancel = () => {
    setIsEditing(false);
    setIsUpdated(false);
    setFormData(initialData);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      <div className="p-5 overflow-y-auto flex-1">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Hiển thị VĐV thắng phía trên */}
          {existingWinner && existingWinner !== "-" && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded text-center shadow-sm">
              <div className="text-yellow-600 dark:text-yellow-400 text-xs font-bold mb-2 uppercase tracking-wide flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .56-.062.818-.174L15 10.274z" clipRule="evenodd" /></svg>
                {t("competition_detail.result_form.winner_label")}
              </div>
              <div className="text-yellow-700 dark:text-yellow-500 text-3xl font-bold">
                {existingWinner}
              </div>
            </div>
          )}

          {/* Chọn người thắng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Giáp Đỏ */}
            <div className={`relative p-5 rounded border-2 transition-all duration-300 ${formData.winner === "red"
              ? "border-red-500 bg-red-50/50 dark:bg-red-900/10 shadow-md ring-4 ring-red-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-gray-800"
              } ${!isEditing ? "opacity-70 grayscale-[20%]" : ""}`}>
              {/* VĐV Đỏ Header */}
              <div className="flex flex-col items-center mb-4">
                <span className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold mb-2 border border-red-200 dark:border-red-800">
                  {t("competition_detail.result_form.red_corner")}
                </span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 text-center">{redName}</h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{redUnit || "—"}</p>
              </div>

              {/* Input Điểm */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">
                  {t("competition_detail.result_form.score_label")}
                </label>
                <input
                  type="text"
                  value={formData.red_score}
                  onChange={(e) => setFormData({ ...formData, red_score: e.target.value })}
                  disabled={!isEditing}
                  className="w-full text-center text-3xl font-black p-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 rounded focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:opacity-50 min-w-[14rem] shadow-inner font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Nút chọn */}
              <button
                type="button"
                onClick={() => handleSelectWinner("red")}
                disabled={!isEditing}
                className={`w-full py-3 px-4 rounded font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 ${formData.winner === "red"
                  ? "bg-red-600 text-white shadow-md hover:bg-red-700"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } disabled:cursor-not-allowed`}
              >
                {formData.winner === "red" ? t("competition_detail.modals.selected_winner") : t("competition_detail.modals.select_as_winner")}
              </button>
            </div>

            {/* Giáp Xanh */}
            <div className={`relative p-5 rounded border-2 transition-all duration-300 ${formData.winner === "blue"
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-md ring-4 ring-blue-500/10"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
              } ${!isEditing ? "opacity-70 grayscale-[20%]" : ""}`}>
              {/* VĐV Xanh Header */}
              <div className="flex flex-col items-center mb-4">
                <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-2 border border-blue-200 dark:border-blue-800">
                  {t("competition_detail.result_form.blue_corner")}
                </span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 text-center">{blueName}</h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{blueUnit || "—"}</p>
              </div>

              {/* Input Điểm */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">
                  {t("competition_detail.result_form.score_label")}
                </label>
                <input
                  type="text"
                  value={formData.blue_score}
                  onChange={(e) => setFormData({ ...formData, blue_score: e.target.value })}
                  disabled={!isEditing}
                  className="w-full text-center text-3xl font-black p-4 bg-gray-50 dark:bg-gray-950 border-2 border-gray-200 dark:border-gray-800 rounded focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50 min-w-[14rem] shadow-inner font-mono"
                  placeholder="0.00"
                />
              </div>

              {/* Nút chọn */}
              <button
                type="button"
                onClick={() => handleSelectWinner("blue")}
                disabled={!isEditing}
                className={`w-full py-3 px-4 rounded font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 ${formData.winner === "blue"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } disabled:cursor-not-allowed`}
              >
                {formData.winner === "blue" ? t("competition_detail.modals.selected_winner") : t("competition_detail.modals.select_as_winner")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        {!isEditing ? (
          // Khi không chỉnh sửa - Hiển thị button Cập nhật và Đóng
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
            >
              {t("competition_detail.modals.close")}
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {t("competition_detail.confirm.update")}
            </button>
          </>
        ) : (
          // Khi đang chỉnh sửa - Hiển thị button Hủy và Lưu
          <>
            <button
              type="button"
              onClick={() => {
                if (existingWinner && existingWinner !== "-") {
                  setIsEditing(false);
                } else {
                  onCancel();
                }
              }}
              className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
            >
              {existingWinner && existingWinner !== "-" ? t("competition_detail.buttons.cancel_edit") : t("competition_detail.buttons.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded shadow transition-all focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {t("competition_detail.buttons.save_result")}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
