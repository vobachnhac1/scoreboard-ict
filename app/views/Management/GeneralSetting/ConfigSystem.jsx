import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/Button";
import { SwitchField } from "../../../components/SwitchField";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import {
  fetchConfigSystem,
  updateConfigSystem,
} from "../../../config/redux/controller/configSystemSlice";
import axios from "axios";

const inputFields = {
  "Thông tin giải đấu": [
    // { name: "ten_giai_dau", label: "Tên giải đấu", placeholder: "Nhập tên giải đấu" },
    { name: "bo_mon", label: "Bộ môn", placeholder: "Nhập bộ môn" },
    {
      name: "thoi_gian_bat_dau",
      label: "Thời gian bắt đầu",
      placeholder: "DD/MM/YYYY",
      type: "date",
    },
    {
      name: "thoi_gian_ket_thuc",
      label: "Thời gian kết thúc",
      placeholder: "DD/MM/YYYY",
      type: "date",
    },
  ],
  "Cài đặt chung": [
    {
      name: "thoi_gian_tinh_diem",
      label: "Thời gian tính điểm",
      placeholder: "giây",
    },
    {
      name: "thoi_gian_thi_dau",
      label: "Thời gian thi đấu",
      placeholder: "giây",
    },
    { name: "thoi_gian_nghi", label: "Thời gian nghỉ", placeholder: "giây" },
    {
      name: "thoi_gian_hiep_phu",
      label: "Thời gian hiệp phụ",
      placeholder: "giây",
    },
    { name: "thoi_gian_y_te", label: "Thời gian y tế", placeholder: "giây" },
    {
      name: "khoang_diem_tuyet_toi",
      label: "Khoảng điểm tuyệt đối",
      placeholder: "điểm",
    },
  ],
  "Cài đặt điểm số": [
    {
      name: "diem_don_chan",
      label: "Điểm đòn chân",
      placeholder: "điểm",
    },
    {
      name: "diem_nga",
      label: "Điểm ngã",
      placeholder: "điểm",
    },
    {
      name: "diem_bien_tru",
      label: "Điểm biên (trừ điểm)",
      placeholder: "điểm",
    },
    {
      name: "diem_bien_cong",
      label: "Điểm biên (cộng điểm)",
      placeholder: "điểm",
    },
  ],
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
      ],
    },
    {
      name: "so_giam_dinh",
      label: "Số giám định",
      options: [
        { value: "3", label: "3 giám định" },
        { value: "5", label: "5 giám định" },
        { value: "10", label: "10 giám định" },
      ],
    },
    {
      name: "so_hiep",
      label: "Số hiệp",
      options: [
        { value: "1", label: "1 hiệp" },
        { value: "2", label: "2 hiệp" },
        { value: "3", label: "3 hiệp" },
      ],
    },
    {
      name: "so_hiep_phu",
      label: "Số hiệp phụ",
      options: [
        { value: "0", label: "Không có" },
        { value: "1", label: "1 hiệp phụ" },
        { value: "2", label: "2 hiệp phụ" },
        { value: "3", label: "3 hiệp phụ" },
      ],
    },
  ],
};

const textareaFields = {
  "Mô tả giải đấu": [
    {
      name: "ten_giai_dau",
      label: "Tên giải đấu",
      placeholder: "Nhập tên giải đấu",
    },
    {
      name: "mo_ta_giai_dau",
      label: "Mô tả chi tiết",
      placeholder: "Nhập mô tả chi tiết về giải đấu...",
      rows: 4,
    },
  ],
};

const switchFields = {
  "Chế độ áp dụng": [
    { name: "cau_hinh_doi_khang_diem_thap", label: "Đối kháng tính điểm thấp" },
    { name: "cau_hinh_quyen_tinh_tong", label: "Quyền tính điểm tổng" },
    { name: "cau_hinh_y_te", label: "Tính thời gian y tế" },
    {
      name: "cau_hinh_tinh_diem_tuyet_doi",
      label: "Tính điểm thắng tuyệt đối",
    },
    { name: "cau_hinh_xoa_nhac_nho", label: "Xoá nhắc nhở" },
    { name: "cau_hinh_xoa_canh_cao", label: "Xoá cảnh cáo" },
    { name: "cau_hinh_hinh_thuc_quyen", label: "Cấu hình hình thức quyền" },
  ],
  "Chế độ bảng điểm": [
    { name: "ap_dung_doikhang", label: "Bật/tắt chế độ Đối kháng" },
    { name: "ap_dung_quyen", label: "Bật/tắt chế độ Quyền" },
    { name: "ap_dung_vonhac", label: "Bật/tắt chế độ Võ Nhạc" },
  ],
  "Chế độ áp dụng điểm biên": [
    { name: "ap_dung_diem_bien_tru", label: "Áp dụng điểm biên (trừ điểm)" },
    { name: "ap_dung_diem_bien_cong", label: "Áp dụng điểm biên (cộng điểm)" },
  ],
  "Cài đặt âm thanh": [{ name: "bat_am_thanh", label: "Bật âm thanh" }],
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
    {
      name: "hien_thi_button_tran_tiep_theo",
      label: "Hiển thị button Trận tiếp theo",
    },
    { name: "hien_thi_button_tran_truoc", label: "Hiển thị button Trận trước" },
    { name: "hien_thi_button_hiep_phu", label: "Hiển thị button Hiệp phụ" },
  ],
  "Quyền hiển thị thông tin trận đấu": [
    {
      name: "hien_thi_thong_tin_nhac_nho",
      label: "Hiển thị thông tin Nhắc nhở",
    },
    {
      name: "hien_thi_thong_tin_canh_cao",
      label: "Hiển thị thông tin Cảnh cáo",
    },
    {
      name: "hien_thi_thong_tin_don_chan",
      label: "Hiển thị thông tin Đòn chân",
    },
    { name: "hien_thi_thong_tin_y_te", label: "Hiển thị thông tin Y tế" },
  ],
};

// Background configuration for 3 screens
const backgroundScreens = [
  { key: "quyen", label: "Màn hình Quyền" },
  { key: "doikhang", label: "Màn hình Đối kháng" },
  { key: "vonhac", label: "Màn hình Võ Nhạc" },
];

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
  const [logoInput, setLogoInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // 'url' hoặc 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // State cho quản lý background images
  const [bgQuyenFile, setBgQuyenFile] = useState(null);
  const [bgDoikhangFile, setBgDoikhangFile] = useState(null);
  const [bgVonhacFile, setBgVonhacFile] = useState(null);
  const [uploadingBg, setUploadingBg] = useState(null); // 'quyen', 'doikhang', 'vonhac'
  const bgQuyenInputRef = useRef(null);
  const bgDoikhangInputRef = useRef(null);
  const bgVonhacInputRef = useRef(null);

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
      const response = await axios.get(
        "http://localhost:6789/api/config/logos",
      );
      console.log("📥 Fetched logos:", response.data.data);
      if (response.data.success) {
        setLogos(response.data.data || []);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách logos:", error);
    } finally {
      setLoadingLogos(false);
    }
  };

  // Xử lý chọn file
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra loại file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp, svg)");
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  // Thêm logo mới (URL hoặc File)
  const handleAddLogo = async () => {
    try {
      if (uploadMode === "url") {
        // Upload bằng URL
        if (!logoInput.trim()) {
          alert("Vui lòng nhập URL hình ảnh");
          return;
        }

        const response = await axios.post(
          "http://localhost:6789/api/config/logos",
          {
            url: logoInput,
            position: logos.length,
          },
        );

        if (response.data.success) {
          await fetchLogos();
          setLogoInput("");
        }
      } else {
        // Upload bằng file
        if (!selectedFile) {
          alert("Vui lòng chọn file ảnh");
          return;
        }

        const formData = new FormData();
        formData.append("logo", selectedFile);
        formData.append("position", logos.length);

        const response = await axios.post(
          "http://localhost:6789/api/config/logos/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (response.data.success) {
          await fetchLogos();
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi thêm logo:", error);
      alert(error.response?.data?.message || "Lỗi khi thêm logo");
    }
  };

  // Cập nhật logo
  const handleUpdateLogo = async (id, newUrl) => {
    try {
      const response = await axios.put(
        `http://localhost:6789/api/config/logos/${id}`,
        {
          url: newUrl,
        },
      );

      if (response.data.success) {
        await fetchLogos();
        setEditingIndex(null);
        setLogoInput("");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật logo:", error);
      alert("Lỗi khi cập nhật logo");
    }
  };

  // Xóa logo
  const handleDeleteLogo = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa logo này?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:6789/api/config/logos/${id}`,
      );

      if (response.data.success) {
        await fetchLogos();
      }
    } catch (error) {
      console.error("Lỗi khi xóa logo:", error);
      alert("Lỗi khi xóa logo");
    }
  };

  // Sắp xếp lại vị trí logo
  const handleReorderLogos = async (fromIndex, toIndex) => {
    console.log("🔄 Reorder from", fromIndex, "to", toIndex);
    const newLogos = [...logos];
    const [movedItem] = newLogos.splice(fromIndex, 1);
    newLogos.splice(toIndex, 0, movedItem);

    // Cập nhật UI ngay lập tức (optimistic update)
    const updatedLogos = newLogos.map((logo, index) => ({
      ...logo,
      position: index,
    }));
    setLogos(updatedLogos);

    // Cập nhật position cho tất cả logos trên server
    try {
      const updates = newLogos.map((logo, index) => ({
        id: logo.id,
        position: index,
      }));

      console.log("📤 Sending updates:", updates);

      const response = await axios.put(
        "http://localhost:6789/api/config/logos/reorder",
        {
          logos: updates,
        },
      );

      console.log("📥 Response:", response.data);

      if (response.data.success) {
        console.log("✅ Logos reordered successfully");
        // Không cần fetchLogos() nữa vì đã update UI rồi
      }
    } catch (error) {
      console.error("❌ Lỗi khi sắp xếp logos:", error);
      // Nếu lỗi, fetch lại để đồng bộ với server
      await fetchLogos();
      alert(
        "Lỗi khi sắp xếp logos: " +
          (error.response?.data?.message || error.message),
      );
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

  // Upload background image
  const handleUploadBackgroundImage = async (screenKey, file) => {
    if (!file) return;

    setUploadingBg(screenKey);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        "http://localhost:6789/api/config/upload/background",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        const imageUrl = response.data.url;
        setValue(`bg_${screenKey}_image`, imageUrl);
        setValue(`bg_${screenKey}_type`, "image");

        // Clear file input
        if (screenKey === "quyen") setBgQuyenFile(null);
        if (screenKey === "doikhang") setBgDoikhangFile(null);
        if (screenKey === "vonhac") setBgVonhacFile(null);

        console.log(`✅ Background ${screenKey} uploaded:`, imageUrl);
      }
    } catch (error) {
      console.error(`❌ Lỗi khi upload background ${screenKey}:`, error);
      alert(
        `Lỗi khi upload hình nền: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setUploadingBg(null);
    }
  };

  // Handle file selection
  const handleBgFileChange = (screenKey, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Set file to state
    if (screenKey === "quyen") setBgQuyenFile(file);
    if (screenKey === "doikhang") setBgDoikhangFile(file);
    if (screenKey === "vonhac") setBgVonhacFile(file);

    // Auto upload
    handleUploadBackgroundImage(screenKey, file);
  };

  const renderInputGroup = (title, fields, index) => (
    <div
      key={index}
      className="col-span-1 p-5 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg rounded  transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-blue-300 dark:border-blue-600">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="font-bold text-blue-700 dark:text-blue-300 text-base">
          {title}
        </span>
      </div>
      <div className="space-y-3">
        {fields.map(({ name, label, placeholder, type = "text" }, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 items-center">
            <label
              htmlFor={name}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
            <div className="col-span-2">
              <input
                id={name}
                readOnly={loading}
                {...register(name, { required: `${label} là bắt buộc` })}
                type={type}
                placeholder={placeholder}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded  text-sm transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors[name] && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                  {errors[name].message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSelectGroup = (title, fields, index) => (
    <div
      key={index}
      className="col-span-1 p-5 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg rounded  transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-blue-300 dark:border-blue-600">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <span className="font-bold text-blue-700 dark:text-blue-300 text-base">
          {title}
        </span>
      </div>
      <div className="space-y-3">
        {fields.map(({ name, label, options }, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 items-center">
            <label
              htmlFor={name}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
            <div className="col-span-2">
              <select
                id={name}
                disabled={loading}
                {...register(name, { required: `${label} là bắt buộc` })}
                className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded  text-sm transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">-- Chọn {label.toLowerCase()} --</option>
                {options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors[name] && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                  {errors[name].message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTextareaGroup = (title, fields, index) => (
    <div
      key={index}
      className="col-span-1 lg:col-span-2 xl:col-span-3 p-5 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg rounded  transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-blue-300 dark:border-blue-600">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span className="font-bold text-blue-700 dark:text-blue-300 text-base">
          {title}
        </span>
      </div>
      <div className="space-y-4">
        {fields.map(({ name, label, placeholder, rows = 3 }, i) => (
          <div key={i}>
            <label
              htmlFor={name}
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2"
            >
              {label}
            </label>
            <textarea
              id={name}
              readOnly={loading}
              {...register(name)}
              rows={rows}
              placeholder={placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded  text-sm resize-none transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors[name] && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                {errors[name].message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSwitchGroup = (title, fields, index) => (
    <div
      key={index}
      className="col-span-1 p-5 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg rounded  transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-blue-300 dark:border-blue-600">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <span className="font-bold text-blue-700 dark:text-blue-300 text-base">
          {title}
        </span>
      </div>
      <div className="space-y-2">
        {fields.map(({ name, label }, i) => (
          <SwitchField
            key={i}
            id={name}
            disabled={loading}
            label={label}
            value={watch(name) === 1}
            onChange={(val) => setValue(name, val ? 1 : 0)}
          />
        ))}
      </div>
    </div>
  );

  // Render Background Settings Section
  const renderBackgroundSettings = () => (
    <div className="col-span-1 lg:col-span-2 xl:col-span-3 p-5 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg rounded transition-all duration-200">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-blue-300 dark:border-blue-600">
        <svg
          className="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">
          Cài đặt Background Màn hình
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {backgroundScreens.map(({ key, label }) => {
          const bgType = watch(`bg_${key}_type`) || "color";
          const bgColor = watch(`bg_${key}_color`) || "#1a1a2e";
          const bgOpacity = watch(`bg_${key}_opacity`) || 100;
          const bgImage = watch(`bg_${key}_image`) || "";

          return (
            <div
              key={key}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-600 shadow-sm"
            >
              <h3 className="text-base font-bold text-blue-700 dark:text-blue-300 mb-4">
                {label}
              </h3>

              {/* Background Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Loại Background
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="color"
                      checked={bgType === "color"}
                      onChange={(e) =>
                        setValue(`bg_${key}_type`, e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium dark:text-gray-300">
                      Màu sắc
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="image"
                      checked={bgType === "image"}
                      onChange={(e) =>
                        setValue(`bg_${key}_type`, e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium dark:text-gray-300">
                      Hình ảnh
                    </span>
                  </label>
                </div>
              </div>

              {/* Color Picker (if type is color) */}
              {bgType === "color" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Chọn màu
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) =>
                        setValue(`bg_${key}_color`, e.target.value)
                      }
                      className="w-16 h-10 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) =>
                        setValue(`bg_${key}_color`, e.target.value)
                      }
                      placeholder="#1a1a2e"
                      className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload (if type is image) */}
              {bgType === "image" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Upload hình ảnh
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={
                        key === "quyen"
                          ? bgQuyenInputRef
                          : key === "doikhang"
                            ? bgDoikhangInputRef
                            : bgVonhacInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => handleBgFileChange(key, e)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (key === "quyen") bgQuyenInputRef.current?.click();
                        if (key === "doikhang")
                          bgDoikhangInputRef.current?.click();
                        if (key === "vonhac") bgVonhacInputRef.current?.click();
                      }}
                      disabled={uploadingBg === key}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      {uploadingBg === key ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Đang upload...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Chọn hình ảnh</span>
                        </>
                      )}
                    </button>
                    {bgImage && (
                      <button
                        type="button"
                        onClick={() => setValue(`bg_${key}_image`, "")}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
                        title="Xóa hình ảnh"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {bgImage && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {bgImage}
                    </p>
                  )}
                </div>
              )}

              {/* Opacity Slider */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Độ trong suốt: {bgOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgOpacity}
                  onChange={(e) =>
                    setValue(`bg_${key}_opacity`, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Preview */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Xem trước
                </label>
                <div
                  className="w-full h-24 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden relative"
                  style={{
                    backgroundColor:
                      bgType === "color" ? bgColor : "transparent",
                    backgroundImage:
                      bgType === "image" && bgImage
                        ? `url(${bgImage})`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: bgOpacity / 100,
                  }}
                >
                  {bgType === "image" && !bgImage && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Logo Management Section
  const renderLogoManagement = () => (
    <div className="col-span-1 lg:col-span-2 xl:col-span-3 p-5 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg rounded  transition-all duration-200">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-blue-300 dark:border-blue-600">
        <svg
          className="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">
          Quản lý Logo/Hình ảnh
        </span>
      </div>

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
          <span className="text-sm font-medium dark:text-gray-300">Nhập URL</span>
        </label> */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="uploadMode"
            value="file"
            checked={uploadMode === "file"}
            onChange={(e) => setUploadMode(e.target.value)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium dark:text-gray-300">
            Upload từ thiết bị
          </span>
        </label>
      </div>

      {/* Input thêm logo mới */}
      <div className="mb-5 bg-white dark:bg-gray-800 rounded  p-4 border-2 border-gray-200 dark:border-gray-600">
        {uploadMode === "url" ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              placeholder="Nhập URL hình ảnh..."
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 focus:border-rose-500 dark:focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 rounded  text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddLogo}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Thêm Logo</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleFileSelect}
                className="flex-1 px-3 py-2 border-2 border-gray-300 focus:border-rose-500 rounded  text-sm file:mr-4 file:py-2 file:px-4 file:rounded  file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-rose-500 file:to-rose-600 file:text-white hover:file:from-rose-600 hover:file:to-rose-700 file:shadow-md file:cursor-pointer transition-all duration-200"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 border-2 border-blue-300 rounded ">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}{" "}
                    KB)
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddLogo}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload Logo</span>
            </button>
          </div>
        )}
      </div>

      {/* Danh sách logos */}
      <div className="space-y-3">
        {loadingLogos ? (
          <div className="flex items-center justify-center py-8 bg-white dark:bg-gray-800 rounded  border-2 border-gray-200 dark:border-gray-600">
            <svg
              className="w-8 h-8 text-rose-500 dark:text-rose-400 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="ml-3 text-gray-600 dark:text-gray-300 font-medium">
              Đang tải...
            </span>
          </div>
        ) : logos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded  border-2 border-dashed border-gray-300 dark:border-gray-600">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Chưa có logo nào
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Upload logo đầu tiên của bạn
            </span>
          </div>
        ) : (
          logos.map((logo, index) => (
            <div
              key={logo.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded  border-2 border-gray-200 dark:border-gray-600 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-lg transition-all duration-200"
            >
              {/* Số thứ tự & Reorder buttons */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() =>
                    index > 0 && handleReorderLogos(index, index - 1)
                  }
                  disabled={index === 0}
                  className="px-2 py-1 text-xs bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded  disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-bold"
                >
                  ↑
                </button>
                <div className="px-2 py-1 text-sm font-bold text-center bg-gradient-to-r from-rose-100 to-pink-100 rounded  text-rose-700">
                  {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    index < logos.length - 1 &&
                    handleReorderLogos(index, index + 1)
                  }
                  disabled={index === logos.length - 1}
                  className="px-2 py-1 text-xs bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded  disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-bold"
                >
                  ↓
                </button>
              </div>

              {/* Preview ảnh */}
              <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded  border-2 border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src={
                    logo.url.startsWith("http")
                      ? logo.url
                      : `http://localhost:6789${logo.url.startsWith("/") ? logo.url : "/" + logo.url}`
                  }
                  alt={`Logo ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    console.log(
                      "Image load error for logo:",
                      logo.url,
                      "Full URL:",
                      e.target.src,
                    );
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
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
                    if (e.key === "Enter") {
                      handleUpdateLogo(logo.id, e.target.value);
                    }
                  }}
                  className="flex-1 px-4 py-2 border-2 border-rose-500 dark:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-800 rounded  text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              ) : (
                <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-mono bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded ">
                  {logo.url}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingIndex(editingIndex === index ? null : index)
                  }
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {editingIndex === index ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    )}
                  </svg>
                  <span>{editingIndex === index ? "Hủy" : "Sửa"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLogo(logo.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview danh sách logos */}
      {logos.length > 0 && (
        <div className="mt-5 p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded  border-2 border-gray-300 dark:border-gray-600 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-5 h-5 text-rose-600 dark:text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="font-bold text-gray-700 dark:text-gray-300 text-base">
              Preview Logo
            </span>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 font-medium">
              {logos.length} logo(s)
            </span>
          </div>
          <div className="flex justify-center items-center gap-6 flex-wrap p-4 bg-white dark:bg-gray-800 rounded  border-2 border-dashed border-gray-300 dark:border-gray-600">
            {logos.map((logo, index) => (
              <div key={logo.id} className="group relative">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded  border-2 border-gray-300 group-hover:border-rose-400 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200">
                  <img
                    src={
                      logo.url.startsWith("http")
                        ? logo.url
                        : `http://localhost:6789${logo.url.startsWith("/") ? logo.url : "/" + logo.url}`
                    }
                    alt={`Logo ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.log(
                        "Preview image load error for logo:",
                        logo.url,
                        "Full URL:",
                        e.target.src,
                      );
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg rounded ">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header with Action Buttons */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded  p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded  flex items-center justify-center shadow-md">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Quản lý cài đặt
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Quản lý các thiết lập chung của hệ thống
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Reload Button */}
              <button
                type="button"
                onClick={handleReload}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Tải lại</span>
              </button>

              {/* Reset Button */}
              {/* <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                <span>Đặt lại</span>
              </button> */}

              {/* Save Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white rounded  font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>{loading ? "Đang lưu..." : "Lưu cấu hình"}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(inputFields).map(([groupTitle, fields], index) =>
            renderInputGroup(groupTitle, fields, index),
          )}
          {Object.entries(selectFields).map(([groupTitle, fields], index) =>
            renderSelectGroup(groupTitle, fields, index),
          )}
          {Object.entries(textareaFields).map(([groupTitle, fields], index) =>
            renderTextareaGroup(groupTitle, fields, index),
          )}
          {Object.entries(switchFields).map(([groupTitle, fields], index) =>
            renderSwitchGroup(groupTitle, fields, index),
          )}

          {/* Background Settings Section */}
          {renderBackgroundSettings()}

          {/* Logo Management Section */}
          {renderLogoManagement()}
        </div>
      </form>
    </div>
  );
}
