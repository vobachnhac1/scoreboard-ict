import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../config/redux/store";
import Button from "../../../components/Button";

export default function VovinamScoreForm({
  type,
  data = null,
  matchData = null,
  onAgree,
  onGoBack,
  soGiamDinh = 3,
  scores = {},
  scoresRef,
}) {
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

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    onAgree(formData);
  };

  // Render Judge Row
  const JudgeRow = ({ judgeNumber }) => (
    <tr className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors">
      {/* STT */}
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold shadow-sm">
          {judgeNumber}
        </span>
      </td>

      {/* Giám định */}
      <td className="px-6 py-4">
        <label
          htmlFor={`judge${judgeNumber}`}
          className="text-base font-semibold text-gray-800 cursor-pointer"
        >
          GIÁM ĐỊNH {judgeNumber}
        </label>
      </td>

      {/* Nhập điểm */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <input
            readOnly={loadingButton}
            id={`judge${judgeNumber}`}
            {...register(`judge${judgeNumber}`, {
              required: "Điểm giám định là bắt buộc",
              min: { value: 0, message: "Điểm phải từ 0-100" },
              max: { value: 100, message: "Điểm phải từ 0-100" },
              pattern: {
                value: /^[0-9]*\.?[0-9]+$/,
                message: "Chỉ được nhập số",
              },
            })}
            type="number"
            step="1"
            min="0"
            max="100"
            className="w-full px-4 py-3 border border-gray-300 rounded text-center text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-blue-400"
            placeholder="0"
          />
          {errors[`judge${judgeNumber}`] && (
            <p className="text-red-600 text-xs font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {String(errors[`judge${judgeNumber}`].message)}
            </p>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Match Info */}
        {matchData && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-lg shadow-md">
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
              <p className="text-center font-medium text-blue-100 text-sm">
                {matchData.team_name}
              </p>
            </div>
          </div>
        )}

        {/* Judge Scores Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
            <div className="flex items-center gap-2 text-white">
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
              <h3 className="font-bold text-base uppercase tracking-wide">
                Điểm giám định
              </h3>
            </div>
          </div>

          {/* Table */}
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-20">
                  STT
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Giám định
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nhập điểm
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: soGiamDinh }).map((_, index) => (
                <JudgeRow key={index} judgeNumber={index + 1} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            disabled={loadingButton}
            type="button"
            onClick={onGoBack}
            className="px-6 py-2.5 min-w-[120px] bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            disabled={loadingButton}
            type="submit"
            className="px-6 py-2.5 min-w-[120px] bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                Đang xử lý...
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
                Xác nhận
              </>
            )}
          </button>
        </div>
      </form>
    </Fragment>
  );
}
