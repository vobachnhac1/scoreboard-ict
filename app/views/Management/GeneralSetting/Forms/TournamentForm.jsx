// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants, LIST_TOURNAMENT_STATUS } from "../../../../common/Constants";

export default function TournamentForm({ type, data = null, onAgree, onGoBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: data,
  });

  const onSubmit = (formData) => {
    console.log("Dữ liệu gửi đi:", formData);
    if (type === Constants.ACCTION_INSERT) {
      // Xử lý thêm mới
      console.log("Thêm mới giải đấu:", formData);
    } else if (type === Constants.ACCTION_UPDATE) {
      // Xử lý cập nhật
      console.log("Cập nhật giải đấu:", formData);
    }
    setTimeout(() => {
      onAgree(formData);
    }, 1500);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Tên giải */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="tournament_name" className="text-sm font-medium text-gray-700">
            Tên giải
          </label>
          <input
            id="tournament_name"
            {...register("tournament_name", { required: "Tên giải là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập tên giải"
          />
          {errors.tournament_name && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.tournament_name.message}</p>}
        </div>

        {/* Ngày bắt đầu */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="start_date" className="text-sm font-medium text-gray-700">
            Ngày bắt đầu
          </label>
          <input
            id="start_date"
            {...register("start_date", { required: "Ngày bắt đầu là bắt buộc" })}
            type="date"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.start_date && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.start_date.message}</p>}
        </div>

        {/* Ngày kết thúc */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="end_date" className="text-sm font-medium text-gray-700">
            Ngày kết thúc
          </label>
          <input
            id="end_date"
            {...register("end_date", { required: "Ngày kết thúc là bắt buộc" })}
            type="date"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.end_date && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.end_date.message}</p>}
        </div>

        {/* Địa điểm */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="location" className="text-sm font-medium text-gray-700">
            Địa điểm
          </label>
          <input
            id="location"
            {...register("location", { required: "Địa điểm là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.location && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.location.message}</p>}
        </div>

        {/* Số lượng trọng tài */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="num_judges" className="text-sm font-medium text-gray-700">
            Số lượng trọng tài
          </label>
          <input
            id="num_judges"
            {...register("num_judges", { required: "Bắt buộc", valueAsNumber: true })}
            type="number"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.num_judges && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.num_judges.message}</p>}
        </div>

        {/* Số lượng vận động viên */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="num_athletes" className="text-sm font-medium text-gray-700">
            Số lượng VĐV
          </label>
          <input
            id="num_athletes"
            {...register("num_athletes", { required: "Bắt buộc", valueAsNumber: true })}
            type="number"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors.num_athletes && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.num_athletes.message}</p>}
        </div>

        {/* Trạng thái */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            id="status"
            {...register("status", { required: "Trạng thái là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_TOURNAMENT_STATUS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.status.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2 !mt-4">
          <Button type="button" className="min-w-32" variant="secondary" onClick={onGoBack}>
            Quay lại
          </Button>
          <Button type="submit" className="min-w-32" variant="primary">
            Đồng ý
          </Button>
        </div>
      </form>
    </Fragment>
  );
}
