import React from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/Button";
import { SwitchField } from "../../../components/SwitchField";

const inputFields = {
  "Cài đặt chung": [
    { name: "mon_thi", label: "Môn thi đấu" },
    { name: "so_giam_dinh", label: "Số giám định" },
    { name: "so_hiep", label: "Số hiệp" },
    { name: "so_hiep_phu", label: "Số hiệp phụ" },
    { name: "he_diem", label: "Hệ điểm" },
  ],
  "Cài đặt thời gian": [
    { name: "thoi_gian_tinh_diem", label: "Thời gian tính điểm", placeholder: "ms" },
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
  const [loadingButton, setLoadingButton] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      mon_thi: 3,
      so_giam_dinh: 3,
      so_hiep: 2,
      so_hiep_phu: 1,
      he_diem: 1,
      cau_hinh_doi_khang_diem_thap: 1,
      cau_hinh_quyen_tinh_tong: 0,
      cau_hinh_y_te: 1,
      cau_hinh_xoa_nhac_nho: 1,
      cau_hinh_xoa_canh_cao: 1,
      cau_hinh_tinh_diem_tuyet_doi: 1,
      cau_hinh_hinh_thuc_quyen: 1,
      thoi_gian_tinh_diem: 1000,
      thoi_gian_thi_dau: 90,
      thoi_gian_nghi: 30,
      thoi_gian_hiep_phu: 60,
      thoi_gian_y_te: 120,
      khoang_diem_tuyet_toi: 10,
      che_do_app: 0,
    },
  });

  const onSubmit = (formData) => {
    setLoadingButton(true);
    console.log("Dữ liệu gửi đi:", formData);
    setTimeout(() => setLoadingButton(false), 1500);
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
            readOnly={loadingButton}
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
        <SwitchField key={i} id={name} disabled={loadingButton} label={label} value={watch(name) === 1} onChange={(val) => setValue(name, val ? 1 : 0)} />
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
          <Button loading={loadingButton} type="submit" className="min-w-32" variant="primary">
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
