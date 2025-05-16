// @ts-nocheck
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import Utils from "../../../../common/Utils";

export default function MatchForm({ type, data = {}, onAgree, onGoBack }) {
  const getWinnerTypeFromId = (ath_win_id, redId, blueId) => {
    if (!ath_win_id) return "";
    if (ath_win_id === redId) return "red";
    if (ath_win_id === blueId) return "blue";
    return "";
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      ...data,
      ath_win_type: getWinnerTypeFromId(data.ath_win_id, data.ath_red_id, data.ath_blue_id),
    },
  });

  // Xử lý lấy id của VĐV thắng cuộc
  const winner = watch("ath_win_type");
  const redId = watch("ath_red_id");
  const blueId = watch("ath_blue_id");
  useEffect(() => {
    if (winner === "red") {
      setValue("ath_win_id", redId);
    } else if (winner === "blue") {
      setValue("ath_win_id", blueId);
    } else {
      setValue("ath_win_id", "");
    }
  }, [winner, redId, blueId, setValue]);
  //---------------------

  const onSubmit = (formData) => {
    console.log("MatchForm formData: ", formData);

    // onAgree(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <p className="text-lg font-semibold">
        Trạng thái: <span className="text-green-600">{Utils.getAthleteStatusLabel(data?.match_status)}</span>
      </p>

      <div className="grid grid-cols-2 gap-1 mt-4">
        <div className="bg-red-100 p-2 font-bold text-center">VĐV Giáp Đỏ</div>
        <div className="bg-blue-100 p-2 font-bold text-center">VĐV Giáp Xanh</div>

        <input {...register("ath_red_id", { required: "Mã hình thức thi là bắt buộc" })} placeholder="Họ tên VĐV" className="border border-gray-300 p-2" />
        <input {...register("ath_blue_id")} placeholder="Họ tên VĐV" className="border border-gray-300 p-2" />

        <input {...register("team_red_id")} placeholder="Đơn vị Đỏ" className="border border-gray-300 p-2" />
        <input {...register("team_blue_id")} placeholder="Đơn vị Xanh" className="border border-gray-300 p-2" />

        <div className="font-bold p-2 border border-gray-200">Thắng cuộc</div>
        <select {...register("ath_win_type")} className="p-2 border border-gray-300">
          <option value="">Bỏ qua</option>
          <option value="red">Đỏ</option>
          <option value="blue">Xanh</option>
        </select>
        {/* Hidden field chứa ID thực tế */}
        <input type="hidden" {...register("ath_win_id")} />

        <div className="font-bold p-2 border border-gray-200">Hiệp</div>
        <select {...register("round")} className="p-2 border border-gray-300">
          {[1, 2, 3].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <div className="font-bold p-2 border border-gray-200">Thời gian</div>
        <input {...register("time")} placeholder="Thời gian" className="border border-gray-300 p-2" />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="col-span-1 gap-2 flex">
          <Button type="button" className="bg-red-100 hover:bg-red-200 text-red-800 min-w-24" onClick={() => reset()}>
            Thi lại
          </Button>
          <Button type="submit" className="bg-green-200 hover:bg-green-300 text-green-900 min-w-24">
            Lưu
          </Button>
        </div>
        <div className="col-span-1 flex justify-end">
          <Button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-800 min-w-24" onClick={onGoBack}>
            Quay lại
          </Button>
        </div>
      </div>
    </form>
  );
}
