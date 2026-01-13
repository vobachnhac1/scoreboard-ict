import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/Button";
import { SwitchField } from "../../../components/SwitchField";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchConfigSystem, updateConfigSystem } from "../../../config/redux/controller/configSystemSlice";
import axios from "axios";

const inputFields = {
  "Thông tin giải đấu": [
    // { name: "ten_giai_dau", label: "Tên giải đấu", placeholder: "Nhập tên giải đấu" },
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
    { name: "ten_giai_dau", label: "Tên giải đấu", placeholder: "Nhập tên giải đấu" },
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
  "Quyền hiển thị buttons - Điểm số": [
    { name: "hien_thi_button_diem_1", label: "Hiển thị button +1/-1 điểm" },
    { name: "hien_thi_button_diem_2", label: "Hiển thị button +2/-2 điểm" },
    { name: "hien_thi_button_diem_3", label: "Hiển thị button +3/-3 điểm" },
    { name: "hien_thi_button_diem_5", label: "Hiển thị button +5/-5 điểm" },
    { name: "hien_thi_button_diem_10", label: "Hiển thị button +10/-10 điểm" },
  ],
  "Quyền hiển thị buttons - Hành động": [
    { name: "hien_thi_button_nhac_nho", label: "Hiển thị button Nhắc nhở" },
    { name: "hien_thi_button_canh_cao", label: "Hiển thị button Cảnh cáo" },
    { name: "hien_thi_button_don_chan", label: "Hiển thị button Đòn chân" },
    { name: "hien_thi_button_bien", label: "Hiển thị button Biên" },
    { name: "hien_thi_button_nga", label: "Hiển thị button Ngã" },
    { name: "hien_thi_button_y_te", label: "Hiển thị button Y tế" },
    { name: "hien_thi_button_thang", label: "Hiển thị button Thắng" },
  ],
  "Quyền hiển thị buttons - Điều khiển": [
    { name: "hien_thi_button_quay_lai", label: "Hiển thị button Quay lại" },
    { name: "hien_thi_button_reset", label: "Hiển thị button Reset" },
    { name: "hien_thi_button_lich_su", label: "Hiển thị button Lịch sử" },
    { name: "hien_thi_button_cau_hinh", label: "Hiển thị button Cấu hình" },
    { name: "hien_thi_button_ket_thuc", label: "Hiển thị button Kết thúc" },
    { name: "hien_thi_button_tran_tiep_theo", label: "Hiển thị button Trận tiếp theo" },
    { name: "hien_thi_button_tran_truoc", label: "Hiển thị button Trận trước" },
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

  // State cho quản lý logos
  const [logos, setLogos] = useState([]);
  const [logoInput, setLogoInput] = useState('');  
  const [editingIndex, setEditingIndex] = useState(null);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'url' hoặc 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConfigSystem());
    fetchLogos();
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  // Fetch logos từ API
  const fetchLogos = async () => {
    try {
      setLoadingLogos(true);
      const response = await axios.get('http://localhost:6789/api/config/logos');
      if (response.data.success) {
        setLogos(response.data.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách logos:', error);
    } finally {
      setLoadingLogos(false);
    }
  };

  // Xử lý chọn file
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp, svg)');
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  // Thêm logo mới (URL hoặc File)
  const handleAddLogo = async () => {
    try {
      if (uploadMode === 'url') {
        // Upload bằng URL
        if (!logoInput.trim()) {
          alert('Vui lòng nhập URL hình ảnh');
          return;
        }

        const response = await axios.post('http://localhost:6789/api/config/logos', {
          url: logoInput,
          position: logos.length
        });

        if (response.data.success) {
          await fetchLogos();
          setLogoInput('');
        }
      } else {
        // Upload bằng file
        if (!selectedFile) {
          alert('Vui lòng chọn file ảnh');
          return;
        }

        const formData = new FormData();
        formData.append('logo', selectedFile);
        formData.append('position', logos.length);

        const response = await axios.post('http://localhost:6789/api/config/logos/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          await fetchLogos();
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi thêm logo:', error);
      alert(error.response?.data?.message || 'Lỗi khi thêm logo');
    }
  };

  // Cập nhật logo
  const handleUpdateLogo = async (id, newUrl) => {
    try {
      const response = await axios.put(`http://localhost:6789/api/config/logos/${id}`, {
        url: newUrl
      });

      if (response.data.success) {
        await fetchLogos();
        setEditingIndex(null);
        setLogoInput('');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật logo:', error);
      alert('Lỗi khi cập nhật logo');
    }
  };

  // Xóa logo
  const handleDeleteLogo = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa logo này?')) return;

    try {
      const response = await axios.delete(`http://localhost:6789/api/config/logos/${id}`);

      if (response.data.success) {
        await fetchLogos();
      }
    } catch (error) {
      console.error('Lỗi khi xóa logo:', error);
      alert('Lỗi khi xóa logo');
    }
  };

  // Sắp xếp lại vị trí logo
  const handleReorderLogos = async (fromIndex, toIndex) => {
    const newLogos = [...logos];
    const [movedItem] = newLogos.splice(fromIndex, 1);
    newLogos.splice(toIndex, 0, movedItem);

    // Cập nhật position cho tất cả logos
    try {
      const updates = newLogos.map((logo, index) => ({
        id: logo.id,
        position: index
      }));

      const response = await axios.put('http://localhost:6789/api/config/logos/reorder', {
        logos: updates
      });

      if (response.data.success) {
        await fetchLogos();
      }
    } catch (error) {
      console.error('Lỗi khi sắp xếp logos:', error);
      alert('Lỗi khi sắp xếp logos');
    }
  };

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

  // Render Logo Management Section
  const renderLogoManagement = () => (
    <div className="col-span-1 lg:col-span-2 xl:col-span-3 p-4 bg-primary/10 shadow-md rounded-lg">
      <div className="font-bold text-primary mb-4">Quản lý Logo/Hình ảnh</div>

      {/* Chọn chế độ upload */}
      <div className="mb-4 flex gap-4">
        {/* <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="uploadMode"
            value="url"
            checked={uploadMode === 'url'}
            onChange={(e) => setUploadMode(e.target.value)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Nhập URL</span>
        </label> */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="uploadMode"
            value="file"
            checked={uploadMode === 'file'}
            onChange={(e) => setUploadMode(e.target.value)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Upload từ thiết bị</span>
        </label>
      </div>

      {/* Input thêm logo mới */}
      <div className="mb-4">
        {uploadMode === 'url' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              placeholder="Nhập URL hình ảnh..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Button
              type="button"
              onClick={handleAddLogo}
              variant="primary"
              className="min-w-32"
            >
              Thêm Logo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleFileSelect}
                className="flex-1 px-3 py-2 border rounded-md text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              )}
            </div>
            <Button
              type="button"
              onClick={handleAddLogo}
              variant="primary"
              className="min-w-32"
              disabled={!selectedFile}
            >
              Upload Logo
            </Button>
          </div>
        )}
      </div>

      {/* Danh sách logos */}
      <div className="space-y-2">
        {loadingLogos ? (
          <div className="text-center py-4">Đang tải...</div>
        ) : logos.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Chưa có logo nào</div>
        ) : (
          logos.map((logo, index) => (
            <div
              key={logo.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              {/* Số thứ tự */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => index > 0 && handleReorderLogos(index, index - 1)}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  ↑
                </button>
                <span className="text-sm font-bold text-center">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => index < logos.length - 1 && handleReorderLogos(index, index + 1)}
                  disabled={index === logos.length - 1}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                  ↓
                </button>
              </div>

              {/* Preview ảnh */}
              <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                <img
                  src={logo.url}
                  alt={`Logo ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                  }}
                />
              </div>

              {/* URL */}
              {editingIndex === index ? (
                <input
                  type="text"
                  defaultValue={logo.url}
                  onBlur={(e) => handleUpdateLogo(logo.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateLogo(logo.id, e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  autoFocus
                />
              ) : (
                <div className="flex-1 text-sm text-gray-700 truncate">
                  {logo.url}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingIndex === index ? 'Hủy' : 'Sửa'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLogo(logo.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview danh sách logos */}
      {logos.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <div className="font-semibold mb-2 text-sm">Preview:</div>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            {logos.map((logo, index) => (
              <div key={logo.id} className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <img
                  src={logo.url}
                  alt={`Logo ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
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

          {/* Logo Management Section */}
          {renderLogoManagement()}
        </div>
      </form>
    </div>
  );
}
