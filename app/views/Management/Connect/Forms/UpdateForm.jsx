// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";

export default function UpdateForm({ data, onSuccess, onGoBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: data?.name || "",
      ip: data?.ip || "",
      permission: data?.permission || "GD1",
      status: data?.status || "active",
      approved: data?.approved || "pending",
    },
  });

  const LIST_PRORMISSION = [
    { key: "GD1", label: "Giám định 1" },
    { key: "GD2", label: "Giám định 2" },
    { key: "GD3", label: "Giám định 3" },
    { key: "GD4", label: "Giám định 4" },
    { key: "GD5", label: "Giám định 5" },
    { key: "GD6", label: "Giám định 6" },
    { key: "GD7", label: "Giám định 7" },
  ];

  const LIST_STATUS = [
    { key: "active", label: "Hoạt động" },
    { key: "inactive", label: "Không hoạt động" },
  ];

  const LIST_APPROVAL_STATUS = [
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Từ chối" },
    { key: "pending", label: "Chờ duyệt" },
  ];

  const onSubmit = (formData) => {
    console.log("Dữ liệu gửi đi:", formData);
    setTimeout(() => {
      onSuccess(formData);
    }, 1500);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Tên thiết bị
          </label>
          <input
            id="name"
            {...register("name", { required: "Tên thiết bị là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập tên thiết bị"
          />
          {errors.name && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="ip" className="text-sm font-medium text-gray-700">
            IP
          </label>
          <input
            id="ip"
            {...register("ip", { required: "IP là bắt buộc" })}
            type="text"
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Nhập địa chỉ IP"
          />
          {errors.ip && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.ip.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="permission" className="text-sm font-medium text-gray-700">
            Quyền giám định
          </label>
          <select
            id="permission"
            {...register("permission", { required: "Quyền giám định là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_PRORMISSION.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.permission && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.permission.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
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

        <div className="grid grid-cols-3 gap-4 items-center">
          <label htmlFor="approved" className="text-sm font-medium text-gray-700">
            Chấp thuận
          </label>
          <select
            id="approved"
            {...register("approved", { required: "Chấp thuận là bắt buộc" })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            {LIST_APPROVAL_STATUS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {errors.approved && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors.approved.message}</p>}
        </div>

        <div className="flex items-center justify-center mt-6">
          <Button type="button" className="min-w-32 mr-2" variant="secondary" onClick={onGoBack}>
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
