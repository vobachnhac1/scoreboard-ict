// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { Constants } from "../../../../common/Constants";

export default function ChampionEventForm({ type, data = null, onAgree, onGoBack }) {
  const [loadingButton, setLoadingButton] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: data,
  });

  const onSubmit = (formData) => {
    setLoadingButton(true);
    console.log("Dữ liệu gửi đi:", formData);
    if (type === Constants.ACCTION_INSERT) {
      console.log("Thêm mới hạng cân:", formData);
    } else if (type === Constants.ACCTION_UPDATE) {
      console.log("Cập nhật hạng cân:", formData);
    }
    setTimeout(() => {
      setLoadingButton(false);
      onAgree(formData);
    }, 1500);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Tên hạng cân */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="event_name" className="text-sm font-medium text-gray-700">
            Tên hạng cân
          </label>
          <input
            id="event_name"
            disabled={loadingButton}
            {...register("event_name", { required: "Tên hạng cân là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập tên hạng cân"
          />
          {errors.event_name && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.event_name.message)}</p>}
        </div>

        {/* Số thành viên */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="num_member" className="text-sm font-medium text-gray-700">
            Số thành viên
          </label>
          <input
            id="num_member"
            disabled={loadingButton}
            {...register("num_member", {
              required: "Số thành viên là bắt buộc",
              valueAsNumber: true,
              min: { value: 1, message: "Tối thiểu là 1 thành viên" },
            })}
            type="number"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập số lượng thành viên"
          />
          {errors.num_member && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.num_member.message)}</p>}
        </div>

        {/* Mã hình thức thi */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="category_key" className="text-sm font-medium text-gray-700">
            Mã hình thức thi
          </label>
          <input
            id="category_key"
            disabled={loadingButton}
            {...register("category_key", { required: "Mã hình thức thi là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="VD: DK, QUN"
          />
          {errors.category_key && <p className="text-red-500 text-sm col-span-2 col-start-2">{String(errors.category_key.message)}</p>}
        </div>

        {/* Loại quyền (qu_type) */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="qu_type" className="text-sm font-medium text-gray-700">
            Loại quyền
          </label>
          <input
            id="qu_type"
            disabled={loadingButton}
            {...register("qu_type")}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập loại quyền (nếu có)"
          />
        </div>

        {/* Mô tả */}
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            id="description"
            disabled={loadingButton}
            {...register("description")}
            className="form-textarea col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            rows={3}
            placeholder="Nhập mô tả"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2 !mt-4">
          <Button disabled={loadingButton} type="button" className="min-w-32" variant="secondary" onClick={onGoBack}>
            Quay lại
          </Button>
          <Button loading={loadingButton} type="submit" className="min-w-32" variant="primary">
            Đồng ý
          </Button>
        </div>
      </form>
    </Fragment>
  );
}
