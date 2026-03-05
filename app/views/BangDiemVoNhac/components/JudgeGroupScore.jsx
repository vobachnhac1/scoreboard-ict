import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Component hiển thị điểm của một nhóm giám định (2 giám định)
 * @param {string} title - Tên nhóm (Chuyên môn, Nghệ thuật, Thực hiện)
 * @param {number} judge1 - Số thứ tự giám định 1
 * @param {number} judge2 - Số thứ tự giám định 2
 * @param {number} score1 - Điểm giám định 1
 * @param {number} score2 - Điểm giám định 2
 * @param {number} average - Điểm trung bình
 */
export default function JudgeGroupScore({
  title,
  judge1,
  judge2,
  score1,
  score2,
  average,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      {/* Tiêu đề nhóm */}
      <div className="bg-blue-700 px-4 py-1.5 w-full shadow-lg">
        <p className="text-xs font-black tracking-[0.15em] text-center text-white drop-shadow-md">
          {title}
        </p>
      </div>

      {/* Container điểm 2 giám định */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-2 w-full shadow-[0_5px_20px_rgba(0,0,0,0.2)]">
        {/* 2 điểm giám định */}
        <div className="flex justify-center gap-2 mb-2">
          {/* Giám định 1 */}
          <div className="flex flex-col items-center w-full">
            <p className="text-[16px] font-black text-sky-700">{t('scoreboard.quyen.referee_1')}</p>
            <div className="bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)] h-full w-full">
              <p className="text-4xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                {score1}
              </p>
            </div>
          </div>

          {/* Dấu gạch ngang */}
          <div className="flex items-center flex-col justify-center">
            <p className="text-xl font-black text-blue-700 dark:text-blue-300" />
          </div>

          {/* Giám định 2 */}
          <div className="flex flex-col items-center w-full h-full ">
            <p className="text-[16px] font-black text-sky-700">{t('scoreboard.quyen.referee_2')}</p>
            <div className="bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)] h-full w-full">
              <p className="text-4xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                {score2}
              </p>
            </div>
          </div>
        </div>

        {/* Điểm trung bình */}
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 px-3 py-1.5 shadow-[0_3px_12px_rgba(0,0,0,0.3)] ">
          <p className="text-6xl font-black text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            {average.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
