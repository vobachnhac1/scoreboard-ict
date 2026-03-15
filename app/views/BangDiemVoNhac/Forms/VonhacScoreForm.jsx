import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../config/redux/store";

export default function VonhacScoreForm({
  type,
  data = null,
  matchData = null,
  onAgree,
  onGoBack,
  soGiamDinh = 7,
  scores = {},
  scoresRef,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loadingButton, setLoadingButton] = useState(false);
  const defaultValues = scores?.judge1 ? scores : scoresRef?.current;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: defaultValues,
  });

  const watchedJudges = watch();

  // Tính tổng điểm mỗi khi thay đổi
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  useEffect(() => {
    // Array to store current valid judge scores
    const currentScores = [];

    // Safely collect scores from watch object based on number of judges
    if (soGiamDinh && soGiamDinh > 0) {
      for (let i = 1; i <= soGiamDinh; i++) {
        const val = watchedJudges[`judge${i}`];
        if (val !== undefined && val !== '') {
          currentScores.push(Number(val));
        } else {
          currentScores.push(0);
        }
      }
    }

    let calculatedTotal = 0;

    if (currentScores.length > 0) {
      if (soGiamDinh === 7) {
        // Công thức tính điểm Võ Nhạc
        const chuyenMonAvg = (currentScores[0] + currentScores[1]) / 2;
        const ngheThuatAvg = (currentScores[2] + currentScores[3]) / 2;
        const thucHienAvg = (currentScores[4] + currentScores[5]) / 2;
        const trongTaiTruong = currentScores[6];
        calculatedTotal = chuyenMonAvg * 0.3 + ngheThuatAvg * 0.3 + thucHienAvg * 0.3 + trongTaiTruong * 0.1;
      } else {
        calculatedTotal = currentScores.reduce((acc, curr) => acc + curr, 0);
      }
    }

    setTotalScore(Number(calculatedTotal.toFixed(2)));
  }, [watchedJudges, soGiamDinh]);

  const onSubmit = (formData) => {
    // Đính kèm điểm tổng vào payload gửi đi
    const finalData = { ...formData, total: totalScore };
    onAgree(finalData);
  };

  // Render Judge Input Grid Node
  const renderJudgeInput = (judgeNumber) => {
    let judgeLabel = `${t('scoreboard.quyen.referee_scores')} ${judgeNumber}`;
    if (soGiamDinh === 7) {
      if (judgeNumber === 1 || judgeNumber === 2) judgeLabel = `${t('scoreboard.quyen.referee_scores')} ${judgeNumber} (${t("scoreboard.score_form.specialty")})`;
      else if (judgeNumber === 3 || judgeNumber === 4) judgeLabel = `${t('scoreboard.quyen.referee_scores')} ${judgeNumber} (${t("scoreboard.score_form.artistic")})`;
      else if (judgeNumber === 5 || judgeNumber === 6) judgeLabel = `${t('scoreboard.quyen.referee_scores')} ${judgeNumber} (${t("scoreboard.score_form.execution")})`;
      else if (judgeNumber === 7) judgeLabel = `${t('scoreboard.quyen.referee_scores')} ${judgeNumber} (${t("scoreboard.score_form.chief_referee")})`;
    }

    return (
      <div className="space-y-1.5 w-full">
        <label
          htmlFor={`judge${judgeNumber}`}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {judgeLabel} <span className="text-red-500">*</span>
        </label>
        <input
          readOnly={loadingButton}
          id={`judge${judgeNumber}`}
          {...register(`judge${judgeNumber}`, {
            min: { value: 0, message: t("scoreboard.score_form.score_range_error") },
            max: { value: 100, message: t("scoreboard.score_form.score_range_error") },
          })}
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow disabled:bg-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-900"
          placeholder={t("scoreboard.score_form.enter_score")}
        />
        {errors[`judge${judgeNumber}`] && (
          <p className="text-red-500 text-xs mt-1 font-medium">
            {String(errors[`judge${judgeNumber}`].message)}
          </p>
        )}
      </div>
    );
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Match Info */}
        {matchData && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-5 rounded shadow-sm">
            <div className="text-white space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-center font-bold text-lg">
                  {matchData.match_name || matchData.match_type}
                </p>
              </div>
              <p className="text-center font-medium text-blue-100 dark:text-blue-200 text-sm">
                {matchData.team_name}
              </p>
            </div>
          </div>
        )}

        {/* Judge Scores Input Grid */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-visible">
          <div className="space-y-6">
            {soGiamDinh === 7 ? (
              <>
                {/* Chuyên môn */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    1. {t("scoreboard.score_form.specialty")}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {renderJudgeInput(1)}
                    {renderJudgeInput(2)}
                    <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-900/30">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{t("scoreboard.score_form.average")}</span>
                      <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                        {(((Number(watchedJudges.judge1) || 0) + (Number(watchedJudges.judge2) || 0)) / 2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nghệ thuật */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    2. {t("scoreboard.score_form.artistic")}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {renderJudgeInput(3)}
                    {renderJudgeInput(4)}
                    <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-900/30">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{t("scoreboard.score_form.average")}</span>
                      <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                        {(((Number(watchedJudges.judge3) || 0) + (Number(watchedJudges.judge4) || 0)) / 2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thực hiện */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    3. {t("scoreboard.score_form.execution")}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {renderJudgeInput(5)}
                    {renderJudgeInput(6)}
                    <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-900/30">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{t("scoreboard.score_form.average")}</span>
                      <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                        {(((Number(watchedJudges.judge5) || 0) + (Number(watchedJudges.judge6) || 0)) / 2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trọng tài trưởng */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-4">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                    4. {t("scoreboard.score_form.chief_referee")}
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {renderJudgeInput(7)}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: soGiamDinh }).map((_, index) => (
                  <React.Fragment key={index}>
                    {renderJudgeInput(index + 1)}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {soGiamDinh === 7 ? (
                <span dangerouslySetInnerHTML={{ __html: t("scoreboard.score_form.note_vonhac_formula") }} />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: t("scoreboard.score_form.note_sum_all") }} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">{t("scoreboard.score_form.total_score")}:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded border border-blue-200 dark:border-blue-800">
                {totalScore}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            disabled={loadingButton}
            type="button"
            onClick={onGoBack}
            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all shadow-sm"
          >
            {t("scoreboard.score_form.cancel")}
          </button>
          <button
            disabled={loadingButton}
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {loadingButton ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("scoreboard.score_form.saving")}
              </>
            ) : (
              <>
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
                {t("scoreboard.score_form.confirm")}
              </>
            )}
          </button>
        </div>
      </form>
    </Fragment>
  );
}
