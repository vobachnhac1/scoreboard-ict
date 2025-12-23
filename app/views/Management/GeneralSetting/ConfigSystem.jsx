import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/Button";
import { SwitchField } from "../../../components/SwitchField";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchConfigSystem, updateConfigSystem } from "../../../config/redux/controller/configSystemSlice";

const inputFields = {
  "Thông tin giải đấu": [
    { name: "ten_giai_dau", label: "Tên giải đấu", placeholder: "Nhập tên giải đấu" },
    { name: "bo_mon", label: "Bộ môn", placeholder: "Nhập bộ môn" },
    { name: "thoi_gian_bat_dau", label: "Thời gian bắt đầu", placeholder: "DD/MM/YYYY", type: "date" },
    { name: "thoi_gian_ket_thuc", label: "Thời gian kết thúc", placeholder: "DD/MM/YYYY", type: "date" },
  ],
  "Cài đặt chung": [
    { name: "thoi_gian_tinh_diem", label: "Thời gian tính điểm", placeholder: "giây" },
    { name: "thoi_gian_thi_dau", label: "Thời gian thi đấu", placeholder: "giây" },
    { name: "thoi_gian_nghi", label: "Thời gian nghỉ", placeholder: "giây" },
    { name: "thoi_gian_hiep_phu", label: "Thời gian hiệp phụ", placeholder: "giây" },
    { name: "thoi_gian_y_te", label: "Thời gian y tế", placeholder: "giây" },
    { name: "khoang_diem_tuyet_toi", label: "Khoảng điểm tuyệt đối", placeholder: "điểm" }

  ],
  // "Điểm áp dụng": [
  //   { name: "khoang_diem_tuyet_toi", label: "Khoảng điểm tuyệt đối", placeholder: "điểm" }
  // ],
};

const selectFields = {
  "Cài đặt số lượng": [
    {
      name: "he_diem",
      label: "Hệ điểm",
      options: [
        { value: "1", label: "Hệ điểm 1" },
        { value: "2", label: "Hệ điểm 2" },
        { value: "3", label: "Hệ điểm 3" },
      ]
    },
    {
      name: "so_giam_dinh",
      label: "Số giám định",
      options: [
        { value: "3", label: "3 giám định" },
        { value: "5", label: "5 giám định" },
        { value: "10", label: "10 giám định" },
      ]
    },
    {
      name: "so_hiep",
      label: "Số hiệp",
      options: [
        { value: "1", label: "1 hiệp" },
        { value: "2", label: "2 hiệp" },
        { value: "3", label: "3 hiệp" },
      ]
    },
    {
      name: "so_hiep_phu",
      label: "Số hiệp phụ",
      options: [
        { value: "0", label: "Không có" },
        { value: "1", label: "1 hiệp phụ" },
        { value: "2", label: "2 hiệp phụ" },
        { value: "3", label: "3 hiệp phụ" },
      ]
    },
  ],
};

const textareaFields = {
  "Mô tả giải đấu": [
    { name: "mo_ta_giai_dau", label: "Mô tả chi tiết", placeholder: "Nhập mô tả chi tiết về giải đấu...", rows: 4 },
  ],
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

  // Hàm reload - gọi lại API fetchConfigSystem
  const handleReload = () => {
    dispatch(fetchConfigSystem())
      .unwrap()
      .then(() => {
        console.log("Reload config thành công");
      })
      .catch((error) => {
        console.error("Lỗi khi reload:", error);
      });
  };

  const renderInputGroup = (title, fields, index) => (
    <div key={index} className="col-span-1 p-4 bg-primary/10 shadow-md rounded-lg">
      <div className="font-bold text-primary mb-2">{title}</div>
      {fields.map(({ name, label, placeholder, type = "text" }, i) => (
        <div key={i} className="grid grid-cols-3 gap-1 items-center mb-2">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            id={name}
            readOnly={loading}
            {...register(name, { required: `${label} là bắt buộc` })}
            type={type}
            placeholder={placeholder}
            className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          />
          {errors[name] && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors[name].message}</p>}
        </div>
      ))}
    </div>
  );

  const renderSelectGroup = (title, fields, index) => (
    <div key={index} className="col-span-1 p-4 bg-primary/10 shadow-md rounded-lg">
      <div className="font-bold text-primary mb-2">{title}</div>
      {fields.map(({ name, label, options }, i) => (
        <div key={i} className="grid grid-cols-3 gap-1 items-center mb-2">
          <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          <select
            id={name}
            disabled={loading}
            {...register(name, { required: `${label} là bắt buộc` })}
            className="form-select col-span-2 w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">-- Chọn {label.toLowerCase()} --</option>
            {options.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[name] && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors[name].message}</p>}
        </div>
      ))}
    </div>
  );

  const renderTextareaGroup = (title, fields, index) => (
    <div key={index} className="col-span-1 lg:col-span-2 xl:col-span-3 p-4 bg-primary/10 shadow-md rounded-lg">
      <div className="font-bold text-primary mb-2">{title}</div>
      {fields.map(({ name, label, placeholder, rows = 3 }, i) => (
        <div key={i} className="mb-2">
          <label htmlFor={name} className="text-sm font-medium text-gray-700 block mb-1">
            {label}
          </label>
          <textarea
            id={name}
            readOnly={loading}
            {...register(name)}
            rows={rows}
            placeholder={placeholder}
            className="form-textarea w-full px-3 py-2 border rounded-md text-sm resize-none"
          />
          {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
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
          {/* Nút reload - gọi lại API fetchConfigSystem */}
          <Button
            type="button"
            className="min-w-32"
            variant="secondary"
            loading={loading}
            onClick={handleReload}
          >
            Reload
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(inputFields).map(([groupTitle, fields], index) => renderInputGroup(groupTitle, fields, index))}
          {Object.entries(selectFields).map(([groupTitle, fields], index) => renderSelectGroup(groupTitle, fields, index))}
          {Object.entries(textareaFields).map(([groupTitle, fields], index) => renderTextareaGroup(groupTitle, fields, index))}
          {Object.entries(switchFields).map(([groupTitle, fields], index) => renderSwitchGroup(groupTitle, fields, index))}
        </div>
      </form>
    </div>
  );
}
