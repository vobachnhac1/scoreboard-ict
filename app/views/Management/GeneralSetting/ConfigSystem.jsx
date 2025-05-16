import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/Button";
import { SwitchField } from "../../../components/SwitchField";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchConfigSystem, updateConfigSystem } from "../../../config/redux/controller/configSystemSlice";

const inputFields = {
  "Cài đặt chung": [
    { name: "mon_thi", label: "Môn thi đấu" },
    { name: "so_giam_dinh", label: "Số giám định" },
    { name: "so_hiep", label: "Số hiệp" },
    { name: "so_hiep_phu", label: "Số hiệp phụ" },
    { name: "he_diem", label: "Hệ điểm" },
  ],
  "Cài đặt thời gian": [
    { name: "thoi_gian_tinh_diem", label: "Thời gian tính điểm", placeholder: "giây" },
    { name: "thoi_gian_thi_dau", label: "Thời gian thi đấu", placeholder: "giây" },
    { name: "thoi_gian_nghi", label: "Thời gian nghỉ", placeholder: "giây" },
    { name: "thoi_gian_hiep_phu", label: "Thời gian hiệp phụ", placeholder: "giây" },
    { name: "thoi_gian_y_te", label: "Thời gian y tế", placeholder: "giây" },
  ],
  "Điểm áp dụng": [{ name: "khoang_diem_tuyet_toi", label: "Khoảng điểm tuyệt đối", placeholder: "điểm" }],
};

const switchFields = {
  "Chế độ áp dụng": [
    { name: "cau_hinh_doi_khang_diem_thap", label: "Đối kháng tính điểm thấp" },
    { name: "cau_hinh_quyen_tinh_tong", label: "Quyền tính điểm tổng" },
    { name: "cau_hinh_y_te", label: "Tính thời gian y tế" },
    { name: "cau_hinh_tinh_diem_tuyet_doi", label: "Tính điểm thắng tuyệt đối" },
    { name: "cau_hinh_xoa_nhac_nho", label: "Xoá nhắc nhở" },
    { name: "cau_hinh_xoa_canh_cao", label: "Xoá cảnh cáo" },
    { name: "cau_hinh_hinh_thuc_quyen", label: "Cấu hình hình thức quyền" },
  ],
};

export default function ConfigSystem() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  const { data, loading } = useAppSelector((state) => state.configSystem);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: data,
  });

  useEffect(() => {
    dispatch(fetchConfigSystem());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    console.log(formData);

    if (!formData) return;
    dispatch(updateConfigSystem(formData))
      .unwrap()
      .then(() => {
        dispatch(fetchConfigSystem());
      })
      .catch((error) => {
        //
        console.error("Lỗi khi thêm mới:", error);
      });
  };

  const renderInputGroup = (title, fields, index) => (
    <div key={index} className="col-span-1 p-4 bg-primary/10 shadow-md rounded-lg">
      <div className="font-bold text-primary mb-2">{title}</div>
      {fields.map(({ name, label, placeholder }, i) => (
        <div key={i} className="grid grid-cols-3 gap-1 items-center mb-2">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            id={name}
            readOnly={loading}
            {...register(name, { required: `${label} là bắt buộc` })}
            type="text"
            placeholder={placeholder}
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors[name] && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors[name].message}</p>}
        </div>
      ))}
    </div>
  );

  const renderSwitchGroup = (title, fields, index) => (
    <div key={index} className="col-span-1 p-4 bg-primary/10 shadow-md rounded-lg">
      <div className="font-bold text-primary mb-2">{title}</div>
      {fields.map(({ name, label }, i) => (
        <SwitchField key={i} id={name} disabled={loading} label={label} value={watch(name) === 1} onChange={(val) => setValue(name, val ? 1 : 0)} />
      ))}
    </div>
  );

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex items-center gap-2">
          <Button disabled type="button" className="min-w-32" variant="secondary">
            Đặt lại
          </Button>
          <Button loading={loading} type="submit" className="min-w-32" variant="primary">
            Lưu
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(inputFields).map(([groupTitle, fields], index) => renderInputGroup(groupTitle, fields, index))}
          {Object.entries(switchFields).map(([groupTitle, fields], index) => renderSwitchGroup(groupTitle, fields, index))}
        </div>
      </form>
    </div>
  );
}
