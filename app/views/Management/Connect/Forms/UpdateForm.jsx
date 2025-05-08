// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { LIST_APPROVAL_STATUS, LIST_JUDGE_PRORMISSION, LIST_STATUS } from "../../../../common/Constants";

export default function UpdateForm({ data, onAgree, onGoBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: data || null,
  });

  const onSubmit = (formData) => {
    // Xử lý dữ liệu gửi đi
    console.log("Dữ liệu gửi đi:", formData);
    setTimeout(() => {
      onAgree(formData);
    }, 1500);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="device_name" className="text-sm font-medium text-gray-700">
            Tên thiết bị
          </label>
          <input
            id="device_name"
            {...register("device_name", { required: "Tên thiết bị là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập tên thiết bị"
          />
          {errors.device_name && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.device_name.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="device_ip" className="text-sm font-medium text-gray-700">
            IP
          </label>
          <input
            id="device_ip"
            {...register("device_ip", { required: "IP là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập địa chỉ IP"
          />
          {errors.device_ip && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.device_ip.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="judge_permission" className="text-sm font-medium text-gray-700">
            Quyền giám định
          </label>
          <select
            id="judge_permission"
            {...register("judge_permission", { required: "Quyền giám định là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_JUDGE_PRORMISSION.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.judge_permission && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.judge_permission.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            id="status"
            {...register("status", { required: "Trạng thái là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_STATUS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.status.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-1 items-center">
          <label htmlFor="accepted" className="text-sm font-medium text-gray-700">
            Chấp thuận
          </label>
          <select
            id="accepted"
            {...register("accepted", { required: "Chấp thuận là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_APPROVAL_STATUS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.accepted && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.accepted.message}</p>}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
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
