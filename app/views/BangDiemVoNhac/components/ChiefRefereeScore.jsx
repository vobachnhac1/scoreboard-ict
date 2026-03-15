import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Component hiển thị điểm Trọng tài trưởng (1 giám định)
 * @param {number} judge - Số thứ tự giám định
 * @param {number} score - Điểm
 */
export default function ChiefRefereeScore({ judge, score }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center">
      {/* Tiêu đề */}
      <div className="bg-blue-700 px-4 py-1.5 w-full shadow-lg">
        <p className="text-xs font-black tracking-[0.1em] text-center text-white drop-shadow-md">
          {/* TRỌNG TÀI TRƯỞNG */}
          {t("scoreboard.score_form.chief_referee").toUpperCase()}
        </p>
      </div>

      {/* Container điểm */}
      <div className="bg-slate-200 dark:slate-900 p-2 w-full h-full flex flex-col items-center shadow-[0_5px_20px_rgba(0,0,0,0.2)]">
        {/* Điểm */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-700  p-1 w-full h-full flex items-center justify-center ">
          <p className="text-[80px] font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-white">
            {score}
          </p>
        </div>
      </div>
    </div>
  );
}
