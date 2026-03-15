// @ts-nocheck
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../components/Button";
import { LIST_APPROVAL_STATUS, LIST_JUDGE_PRORMISSION, LIST_STATUS } from "../../../../common/Constants";

export default function UpdateForm({ data, onAgree, onGoBack }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { ...data, judge_permission: data?.referrer ?? 1 } || null,
  });

  const acceptedValue = watch("accepted");

  const onSubmit = (formData) => {
    // Xử lý dữ liệu gửi đi
    console.log("Dữ liệu gửi đi:", formData);
    onAgree(formData);
  };

  return (
    <div className="p-2 pt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tên thiết bị */}
        <div className="space-y-2">
          <label htmlFor="device_name" className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1">
            Tên thiết bị <span className="text-rose-500">*</span>
          </label>
          <input
            id="device_name"
            {...register("device_name", { required: "Tên thiết bị là bắt buộc" })}
            type="text"
            className="w-full px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 outline-none rounded text-sm font-bold text-blue-900 dark:text-blue-100 transition-all shadow-inner"
            placeholder="Nhập tên thiết bị"
          />
          {errors.device_name && <p className="text-rose-500 text-[10px] font-bold px-1">{errors.device_name.message}</p>}
        </div>

        {/* IP */}
        <div className="space-y-2">
          <label htmlFor="device_ip" className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1">
            Địa chỉ IP <span className="text-rose-500">*</span>
          </label>
          <input
            id="device_ip"
            {...register("device_ip", { required: "IP là bắt buộc" })}
            type="text"
            className="w-full px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 outline-none rounded text-sm font-bold text-blue-900 dark:text-blue-100 transition-all shadow-inner font-mono"
            placeholder="Nhập địa chỉ IP"
          />
          {errors.device_ip && <p className="text-rose-500 text-[10px] font-bold px-1">{errors.device_ip.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quyền giám định */}
          <div className="space-y-2">
            <label htmlFor="judge_permission" className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1">
              Quyền giám định
            </label>
            <select
              id="judge_permission"
              {...register("judge_permission", { required: "Quyền giám định là bắt buộc" })}
              className="w-full px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 outline-none rounded text-sm font-bold text-blue-900 dark:text-blue-100 appearance-none transition-all shadow-inner"
            >
              {LIST_JUDGE_PRORMISSION.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <label htmlFor="status" className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1">
              Trạng thái kết nối
            </label>
            <select
              id="status"
              {...register("status", { required: "Trạng thái là bắt buộc" })}
              className="w-full px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 outline-none rounded text-sm font-bold text-blue-900 dark:text-blue-100 appearance-none transition-all shadow-inner"
            >
              {LIST_STATUS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chấp thuận */}
        <div className="space-y-2">
          <label htmlFor="accepted" className="text-[10px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest block px-1">
            Mức độ phê duyệt
          </label>
          <div className="flex flex-wrap gap-3 p-1">
            {LIST_APPROVAL_STATUS.map((item) => (
              <label key={item.key} className="flex-1 min-w-[120px] cursor-pointer group">
                <input
                  type="radio"
                  value={item.key}
                  {...register("accepted")}
                  className="hidden"
                />
                <div className={`px-4 py-3 rounded border-2 text-center transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-sm
                  ${acceptedValue === item.key
                    ? 'bg-blue-600 border-blue-700 text-white shadow-blue-500/20 scale-105'
                    : 'bg-white dark:bg-gray-800 border-blue-50 dark:border-blue-900/30 text-blue-400 dark:text-blue-600 hover:border-blue-200'}
                `}>
                  {item.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-blue-50 dark:border-blue-900/30">
          <Button type="button" className="min-w-32 py-3.5 !rounded" variant="secondary" onClick={onGoBack}>
            <span className="text-[10px] font-black uppercase tracking-widest">Hủy bỏ</span>
          </Button>
          <Button type="submit" className="min-w-48 py-3.5 !rounded shadow-xl shadow-blue-500/20" variant="primary">
            <span className="text-[10px] font-black uppercase tracking-widest">Lưu thay đổi</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
