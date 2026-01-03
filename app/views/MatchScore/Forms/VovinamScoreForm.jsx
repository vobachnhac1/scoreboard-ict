import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../config/redux/store";
import Button from "../../../components/Button";

export default function VovinamScoreForm({ type, data = null, matchData = null, onAgree, onGoBack, soGiamDinh = 3, scores ={} }) {
  const dispatch = useAppDispatch();
  const [loadingButton, setLoadingButton] = useState(false);
  const defaultValues = scores;
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

  // Render Judge Input
  const JudgeInput = ({ judgeNumber, label }) => (
    <div className="relative group">
      <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-xl border-2 border-sky-300 hover:border-sky-500 transition-all duration-300 shadow-md hover:shadow-lg">
        <label htmlFor={`judge${judgeNumber}`} className="text-sm font-bold text-sky-800 mb-2 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">
            {judgeNumber}
          </span>
          {label}
        </label>
        <input
          readOnly={loadingButton}
          id={`judge${judgeNumber}`}
          {...register(`judge${judgeNumber}`, {
            required: "Điểm giám định là bắt buộc",
            min: { value: 0, message: "Điểm phải từ 0-100" },
            max: { value: 100, message: "Điểm phải từ 0-100" },
            pattern: { value: /^[0-9]*\.?[0-9]+$/, message: "Chỉ được nhập số" }
          })}
          type="number"
          step="1"
          min="0"
          max="100"
          className="w-full px-4 py-3 border-2 border-sky-300 rounded-lg text-center text-2xl font-bold text-sky-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          placeholder="0"
        />
        {errors[`judge${judgeNumber}`] && (
          <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
            <span>⚠️</span>
            {String(errors[`judge${judgeNumber}`].message)}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Match Info */}
        {matchData && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-xl shadow-lg border-2 border-blue-400 mb-4">
            <div className="text-white space-y-2">
              <p className="text-center font-bold text-lg">
                {matchData.match_name || matchData.match_type}
              </p>
              <p className="text-center font-semibold">
                {matchData.team_name}
              </p>
            </div>
          </div>
        )}

        {/* Judge Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
          {Array.from({ length: soGiamDinh }).map((_, index) => (
            <JudgeInput key={index} judgeNumber={index + 1} label={`GIÁM ĐỊNH ${index + 1}`} />
          ))}
        </div> 

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 !mt-6 pt-4 border-t-2 border-gray-200">
          <Button
            disabled={loadingButton}
            type="button"
            className="min-w-32 bg-gray-600 hover:bg-gray-600"
            variant="secondary"
            onClick={onGoBack}
          >
            Hủy
          </Button>
          <Button
            loading={loadingButton}
            type="submit"
            className="min-w-32 bg-gradient-to-r from-green-700 to-green-700 hover:from-green-600 hover:to-green-800"
            variant="primary"
          >
            Xác nhận
          </Button>
        </div>
      </form>
    </Fragment>
  );
}
