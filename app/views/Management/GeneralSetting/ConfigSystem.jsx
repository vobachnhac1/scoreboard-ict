import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Button from "../../../components/Button";
import { SwitchField } from "../../../components/SwitchField";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import {
  fetchConfigSystem,
  updateConfigSystem,
} from "../../../config/redux/controller/configSystemSlice";
import axios from "axios";
import { KEYBOARD_MODES, CONFIG_PRESETS } from "../../BangDiemDoiKhang/keyboardConfig";

// Moved to function to support i18n
const getInputFields = (t) => ({
  [t("config_system.competition_info")]: [
    // { name: "ten_giai_dau", label: t("config_system.competition_name"), placeholder: t("config_system.enter") + " " + t("config_system.competition_name") },
    { name: "bo_mon", label: t("config_system.sport_type"), placeholder: t("config_system.enter_sport_type") },
    {
      name: "thoi_gian_bat_dau",
      label: t("config_system.start_time"),
      placeholder: "DD/MM/YYYY",
      type: "date",
    },
    {
      name: "thoi_gian_ket_thuc",
      label: t("config_system.end_time"),
      placeholder: "DD/MM/YYYY",
      type: "date",
    },
  ],
  [t("config_system.general_settings")]: [
    {
      name: "thoi_gian_tinh_diem",
      label: t("config_system.scoring_time"),
      placeholder: t("config_system.seconds"),
    },
    {
      name: "thoi_gian_thi_dau",
      label: t("config_system.match_duration"),
      placeholder: t("config_system.seconds"),
    },
    { name: "thoi_gian_nghi", label: t("config_system.rest_time"), placeholder: t("config_system.seconds") },
    {
      name: "thoi_gian_hiep_phu",
      label: t("config_system.extra_time"),
      placeholder: t("config_system.seconds"),
    },
    { name: "thoi_gian_y_te", label: t("config_system.medical_time"), placeholder: t("config_system.seconds") },
    {
      name: "khoang_diem_tuyet_toi",
      label: t("config_system.absolute_score_gap"),
      placeholder: t("config_system.points"),
    },
  ],
  [t("config_system.score_settings")]: [
    {
      name: "diem_don_chan",
      label: t("config_system.leg_kick_score"),
      placeholder: t("config_system.points"),
    },
    {
      name: "diem_nga",
      label: t("config_system.fall_score"),
      placeholder: t("config_system.points"),
    },
    {
      name: "diem_bien_tru",
      label: t("config_system.boundary_minus_score"),
      placeholder: t("config_system.points"),
    },
    {
      name: "diem_bien_cong",
      label: t("config_system.boundary_plus_score"),
      placeholder: t("config_system.points"),
    },
  ],
});

const getSelectFields = (t) => ({
  [t("config_system.quantity_settings")]: [
    {
      name: "keyboard_mode",
      label: t("config_system.keyboard_mode"),
      options: Object.entries(KEYBOARD_MODES).map(([key, mode]) => ({
        value: key,
        label: `${mode.description}`,
      })),
    },
    {
      name: "he_diem",
      label: t("config_system.score_settings"),
      options: [
        { value: "1", label: t("config_system.score_settings") + " 1" },
        { value: "2", label: t("config_system.score_settings") + " 2" },
        { value: "3", label: t("config_system.score_settings") + " 3" },
      ],
    },
    {
      name: "so_giam_dinh",
      label: t("config_system.referee_number"),
      options: [
        { value: "3", label: "3 " + t("config_system.referee_count") },
        { value: "5", label: "5 " + t("config_system.referee_count") },
        { value: "10", label: "10 " + t("config_system.referee_count") },
      ],
    },
    {
      name: "so_hiep",
      label: t("config_system.round_number"),
      options: [
        { value: "1", label: t("config_system.round_1") },
        { value: "2", label: t("config_system.round_2") },
        { value: "3", label: t("config_system.round_3") },
      ],
    },
    {
      name: "so_hiep_phu",
      label: t("config_system.extra_round_number"),
      options: [
        { value: "0", label: t("config_system.extra_round_0") },
        { value: "1", label: t("config_system.extra_round_1") },
        { value: "2", label: t("config_system.extra_round_2") },
        { value: "3", label: t("config_system.extra_round_3") },
      ],
    },
  ],
});

const getTextareaFields = (t) => ({
  [t("config_system.competition_description")]: [
    {
      name: "ten_giai_dau",
      label: t("config_system.competition_name_label"),
      placeholder: t("config_system.competition_name_placeholder"),
    },
    {
      name: "mo_ta_giai_dau",
      label: t("config_system.detailed_description"),
      placeholder: t("config_system.detailed_description_placeholder"),
      rows: 4,
    },
  ],
});

const getSwitchFields = (t) => ({
  [t("config_system.application_mode")]: [
    { name: "cau_hinh_doi_khang_diem_thap", label: t("config_system.combat_low_score") },
    { name: "cau_hinh_quyen_tinh_tong", label: t("config_system.form_total_score") },
    { name: "cau_hinh_y_te", label: t("config_system.medical_time_calculation") },
    {
      name: "cau_hinh_tinh_diem_tuyet_doi",
      label: t("config_system.absolute_win_score"),
    },
    { name: "cau_hinh_xoa_nhac_nho", label: t("config_system.delete_reminder") },
    { name: "cau_hinh_xoa_canh_cao", label: t("config_system.delete_warning") },
    { name: "cau_hinh_hinh_thuc_quyen", label: t("config_system.form_config") },
  ],
  [t("config_system.scoreboard_mode")]: [
    { name: "ap_dung_doikhang", label: t("config_system.toggle_combat") },
    { name: "ap_dung_quyen", label: t("config_system.toggle_form") },
    { name: "ap_dung_vonhac", label: t("config_system.toggle_music") },
    { name: "bat_am_thanh", label: t("config_system.enable_sound") },
    { name: "ap_dung_diem_bien_tru", label: t("config_system.apply_boundary_minus") },
    { name: "ap_dung_diem_bien_cong", label: t("config_system.apply_boundary_plus") },
  ],
  [t("config_system.button_display_score")]: [
    { name: "hien_thi_button_diem_1", label: t("config_system.show_button_1") },
    { name: "hien_thi_button_diem_2", label: t("config_system.show_button_2") },
    { name: "hien_thi_button_diem_3", label: t("config_system.show_button_3") },
    { name: "hien_thi_button_diem_5", label: t("config_system.show_button_5") },
    { name: "hien_thi_button_diem_10", label: t("config_system.show_button_10") },
  ],
  [t("config_system.button_display_action")]: [
    { name: "hien_thi_button_nhac_nho", label: t("config_system.show_button_reminder") },
    { name: "hien_thi_button_canh_cao", label: t("config_system.show_button_warning") },
    { name: "hien_thi_button_don_chan", label: t("config_system.show_button_leg_kick") },
    { name: "hien_thi_button_bien", label: t("config_system.show_button_boundary") },
    { name: "hien_thi_button_nga", label: t("config_system.show_button_fall") },
    { name: "hien_thi_button_y_te", label: t("config_system.show_button_medical") },
    { name: "hien_thi_button_thang", label: t("config_system.show_button_win") },
  ],
  [t("config_system.button_display_control")]: [
    { name: "hien_thi_button_quay_lai", label: t("config_system.show_button_back") },
    { name: "hien_thi_button_reset", label: t("config_system.show_button_reset") },
    { name: "hien_thi_button_lich_su", label: t("config_system.show_button_history") },
    { name: "hien_thi_button_cau_hinh", label: t("config_system.show_button_config") },
    { name: "hien_thi_button_ket_thuc", label: t("config_system.show_button_end") },
    {
      name: "hien_thi_button_tran_tiep_theo",
      label: t("config_system.show_button_next_match"),
    },
    { name: "hien_thi_button_tran_truoc", label: t("config_system.show_button_prev_match") },
    { name: "hien_thi_button_hiep_phu", label: t("config_system.show_button_extra_round") },
  ],
  [t("config_system.match_info_display")]: [
    {
      name: "hien_thi_thong_tin_nhac_nho",
      label: t("config_system.show_info_reminder"),
    },
    {
      name: "hien_thi_thong_tin_canh_cao",
      label: t("config_system.show_info_warning"),
    },
    {
      name: "hien_thi_thong_tin_don_chan",
      label: t("config_system.show_info_leg_kick"),
    },
    { name: "hien_thi_thong_tin_y_te", label: t("config_system.show_info_medical") },
  ],
});

// Background configuration for 3 screens
const getBackgroundScreens = (t) => [
  { key: "quyen", label: t("config_system.screen_form") },
  { key: "doikhang", label: t("config_system.screen_combat") },
  { key: "vonhac", label: t("config_system.screen_music") },
];

export default function ConfigSystem() {
  const { t } = useTranslation();
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
    defaultValues: { keyboard_mode: "vovinam", ...data },
  });

  // Get translated fields
  const inputFields = getInputFields(t);
  const selectFields = getSelectFields(t);
  const textareaFields = getTextareaFields(t);
  const switchFields = getSwitchFields(t);
  const backgroundScreens = getBackgroundScreens(t);

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

  const initialPresetApplied = useRef(false);

  useEffect(() => {
    if (data) {
      // Nếu server không có keyboard_mode, mặc định vovinam
      const mergedData = { keyboard_mode: "vovinam", ...data };
      reset(mergedData);

      // Apply preset lần đầu nếu chưa apply
      if (!initialPresetApplied.current) {
        const mode = mergedData.keyboard_mode;
        if (mode && CONFIG_PRESETS[mode]) {
          const preset = CONFIG_PRESETS[mode];
          Object.entries(preset).forEach(([key, value]) => {
            if (key !== "disabledFields") {
              setValue(key, value);
            }
          });
          console.log(`⚙️ Đã áp dụng preset cấu hình lần đầu: ${mode}`);
        }
        initialPresetApplied.current = true;
      }
    }
  }, [data, reset]);

  // Watch keyboard_mode để auto-fill preset khi thay đổi chế độ
  const selectedKeyboardMode = watch("keyboard_mode");
  const prevKeyboardMode = useRef(selectedKeyboardMode);

  useEffect(() => {
    // Chỉ apply khi user thực sự thay đổi chế độ (không phải lần đầu load)
    if (
      selectedKeyboardMode &&
      CONFIG_PRESETS[selectedKeyboardMode] &&
      prevKeyboardMode.current !== selectedKeyboardMode
    ) {
      const preset = CONFIG_PRESETS[selectedKeyboardMode];
      Object.entries(preset).forEach(([key, value]) => {
        if (key !== "disabledFields") {
          setValue(key, value);
        }
      });
      console.log(`⚙️ Đã áp dụng preset cấu hình: ${selectedKeyboardMode}`);
    }
    prevKeyboardMode.current = selectedKeyboardMode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeyboardMode]);

  // Danh sách fields bị khoá theo chế độ hiện tại
  const disabledFields = (selectedKeyboardMode && CONFIG_PRESETS[selectedKeyboardMode]?.disabledFields) || [];
  // Danh sách fields ẩn hoàn toàn theo chế độ hiện tại
  const hiddenFields = (selectedKeyboardMode && CONFIG_PRESETS[selectedKeyboardMode]?.hiddenFields) || [];
  // Giá trị được phép hiển thị cho select fields theo chế độ hiện tại
  const allowedOptions = (selectedKeyboardMode && CONFIG_PRESETS[selectedKeyboardMode]?.allowedOptions) || {};
  // Danh sách nhóm (group key) ẩn hoàn toàn theo chế độ hiện tại
  const hiddenGroups = (selectedKeyboardMode && CONFIG_PRESETS[selectedKeyboardMode]?.hiddenGroups) || [];

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
      console.error(" Lỗi khi lấy danh sách logos:", error);
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
        alert(t("config_system.error_image_type"));
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("config_system.error_file_size"));
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
          alert(t("config_system.error_enter_url"));
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
          alert(t("config_system.error_select_file"));
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
      console.error(t("config_system.error_add_logo"), error);
      alert(error.response?.data?.message || t("config_system.error_add_logo"));
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
      console.error(t("config_system.error_update_logo"), error);
      alert(t("config_system.error_update_logo"));
    }
  };

  // Xóa logo
  const handleDeleteLogo = async (id) => {
    if (!confirm(t("config_system.confirm_delete_logo"))) return;

    try {
      const response = await axios.delete(
        `http://localhost:6789/api/config/logos/${id}`,
      );

      if (response.data.success) {
        await fetchLogos();
      }
    } catch (error) {
      console.error(t("config_system.error_delete_logo"), error);
      alert(t("config_system.error_delete_logo"));
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

      console.log(" Sending updates:", updates);

      const response = await axios.put(
        "http://localhost:6789/api/config/logos/reorder",
        {
          logos: updates,
        },
      );

      console.log("📥 Response:", response.data);

      if (response.data.success) {
        console.log(" Logos reordered successfully");
        // Không cần fetchLogos() nữa vì đã update UI rồi
      }
    } catch (error) {
      console.error(" Lỗi khi sắp xếp logos:", error);
      // Nếu lỗi, fetch lại để đồng bộ với server
      await fetchLogos();
      alert(
        t("config_system.error_reorder_logo") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  const onSubmit = (formData) => {
    console.log(formData);

    if (!formData) return;

    // Đảm bảo keyboard_mode luôn có giá trị
    if (!formData.keyboard_mode) {
      formData.keyboard_mode = "vovinam";
    }

    dispatch(updateConfigSystem(formData))
      .unwrap()
      .then(() => {
        dispatch(fetchConfigSystem());
      })
      .catch((error) => {
        //
        console.error(t("config_system.error_save"), error);
      });
  };

  // Hàm reload - gọi lại API fetchConfigSystem
  const handleReload = () => {
    dispatch(fetchConfigSystem())
      .unwrap()
      .then(() => {
        console.log(t("config_system.reload_success"));
      })
      .catch((error) => {
        console.error(t("config_system."), error);
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

        console.log(` Background ${screenKey} uploaded:`, imageUrl);
      }
    } catch (error) {
      console.error(` Lỗi khi upload background ${screenKey}:`, error);
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
      alert(t("config_system.error_image_format"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t("config_system.error_file_size"));
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
        {fields.filter(f => !hiddenFields.includes(f.name)).map(({ name, label, placeholder, type = "text" }, i) => {
          const isDisabled = disabledFields.includes(name);
          return (
            <div key={i} className={`grid grid-cols-3 gap-2 items-center ${isDisabled ? 'opacity-60' : ''}`}>
              <label
                htmlFor={name}
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                {label}
                {isDisabled && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
              <div className="col-span-2">
                <input
                  id={name}
                  readOnly={loading || isDisabled}
                  {...register(name, { required: `${label} ${t("config_system.required")}` })}
                  type={type}
                  placeholder={placeholder}
                  className={`w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isDisabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
                {errors[name] && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">
                    {errors[name].message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
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
        {fields.filter(f => !hiddenFields.includes(f.name)).map(({ name, label, options }, i) => {
          // keyboard_mode không bị disable để user có thể chuyển chế độ
          const isDisabled = name !== "keyboard_mode" && disabledFields.includes(name);
          return (
            <div key={i} className={`grid grid-cols-3 gap-2 items-center ${isDisabled ? 'opacity-60' : ''}`}>
              <label
                htmlFor={name}
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                {label}
                {isDisabled && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
              <div className="col-span-2">
                <select
                  id={name}
                  disabled={loading || isDisabled}
                  {...register(name, { required: `${label} ${t("config_system.required")}` })}
                  className={`w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded text-sm transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${isDisabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- {t("config_system.select")} {label.toLowerCase()} --</option>
                  {options
                    .filter(option => {
                      if (allowedOptions[name]) {
                        return allowedOptions[name].includes(option.value);
                      }
                      return true;
                    })
                    .map((option, idx) => (
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
          );
        })}
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
        {fields.filter(f => !hiddenFields.includes(f.name)).map(({ name, label }, i) => {
          const isDisabled = disabledFields.includes(name);
          return (
            <div key={i} className={isDisabled ? 'opacity-60' : ''}>
              <SwitchField
                id={name}
                disabled={loading || isDisabled}
                label={
                  <span className="flex items-center gap-1">
                    {label}
                    {isDisabled && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                }
                value={watch(name) === 1}
                onChange={(val) => {
                  if (!isDisabled) setValue(name, val ? 1 : 0);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const effectiveBgForPreview = (bgColor, bgType) => {
    return bgType === 'image' ? '#1a1a2e' : (bgColor || '#1a1a2e');
  };

  // ===== Hàm đề xuất màu chữ Header dựa trên màu nền =====
  // Tính relative luminance theo chuẩn WCAG 2.x
  const getRelativeLuminance = (hex) => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return 0.5; // fallback nếu hex không hợp lệ
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  // Tính contrast ratio giữa 2 màu
  const getContrastRatio = (hex1, hex2) => {
    const l1 = getRelativeLuminance(hex1);
    const l2 = getRelativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Đề xuất màu chữ tương phản cao với background
  const suggestHeaderTextColor = (bgColor, bgType) => {
    // Nếu là hình ảnh → giả định nền tối
    const effectiveBg = bgType === 'image' ? '#1a1a2e' : (bgColor || '#1a1a2e');
    const lum = getRelativeLuminance(effectiveBg);

    // Bảng màu tổng hợp cực kỳ đa dạng
    const colorPool = [
      // Nhóm màu Sáng / Neon (cho nền tối)
      { hex: '#FFFFFF', name: 'Trắng tinh' },
      { hex: '#FDE047', name: 'Vàng chanh' },
      { hex: '#FFD700', name: 'Vàng Gold' },
      { hex: '#FACC15', name: 'Vàng rực' },
      { hex: '#38BDF8', name: 'Xanh Cyan' },
      { hex: '#00F5FF', name: 'Electric' },
      { hex: '#FB923C', name: 'Cam Neon' },
      { hex: '#F472B6', name: 'Pink Sport' },
      { hex: '#4ADE80', name: 'Xanh Mint' },
      { hex: '#A855F7', name: 'Tím Neon' },
      { hex: '#818CF8', name: 'Indigo' },
      { hex: '#E2E8F0', name: 'Xám khói' },
      { hex: '#FFF7ED', name: 'Kem nhạt' },
      { hex: '#22D3EE', name: 'Sky Tech' },
      { hex: '#F0ABFC', name: 'Lave' },
      { hex: '#6EE7B7', name: 'Emerald' },
      { hex: '#FDA4AF', name: 'Rose' },
      { hex: '#FDBA74', name: 'Cam đào' },
      { hex: '#93C5FD', name: 'Blue Sky' },
      { hex: '#C084FC', name: 'Purple' },
      { hex: '#B8860B', name: 'Đồng cổ' },
      { hex: '#FF7F50', name: 'San hô' },
      { hex: '#7FFF00', name: 'Chanh Neon' },

      // Nhóm màu Tối / Đậm (cho nền sáng)
      { hex: '#0F172A', name: 'Xanh đen' },
      { hex: '#1E3A8A', name: 'Royal Blue' },
      { hex: '#B91C1C', name: 'Đỏ chiến' },
      { hex: '#7C2D12', name: 'Nâu đỏ' },
      { hex: '#374151', name: 'Xám chì' },
      { hex: '#581C87', name: 'Tím thẫm' },
      { hex: '#064E3B', name: 'Emerald' },
      { hex: '#000000', name: 'Đen sâu' },
      { hex: '#4338CA', name: 'Indigo Bold' },
      { hex: '#BE185D', name: 'Rose Dark' },
      { hex: '#115E59', name: 'Teal Đậm' },
      { hex: '#92400E', name: 'Hổ phách' },
      { hex: '#701A75', name: 'Fuchsia' },
      { hex: '#4D7C0F', name: 'Lime đậm' },
      { hex: '#1E1B4B', name: 'Blue Black' },
    ];

    // Tính toán contrast cho toàn bộ pool dựa trên nền hiện tại
    const candidates = colorPool.map(c => ({
      ...c,
      contrast: getContrastRatio(effectiveBg, c.hex)
    }));

    // Lọc những màu đủ tiêu chuẩn contrast tốt
    const sorted = candidates.sort((a, b) => b.contrast - a.contrast);

    // Trả về top 16 màu để đa dạng sự lựa chọn
    return sorted.slice(0, 16);
  };

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
          {t("config_system.background_settings")}
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
                  {t("config_system.background_type")}
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
                      {t("config_system.color")}
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
                      {t("config_system.image")}
                    </span>
                  </label>
                </div>
              </div>

              {/* Color Picker (if type is color) */}
              {bgType === "color" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t("config_system.choose_color")}
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
                    {t("config_system.upload_image")}
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
                          <span>{t("config_system.uploading")}</span>
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
                          <span>{t("config_system.choose_image")}</span>
                        </>
                      )}
                    </button>
                    {bgImage && (
                      <button
                        type="button"
                        onClick={() => setValue(`bg_${key}_image`, "")}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
                        title={t("config_system.delete_image")}
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
                  {t("config_system.opacity")}: {bgOpacity}%
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

              {/* ===== Màu chữ Header ===== */}
              <div className="mb-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {t("config_system.header_text_color")}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const suggestions = suggestHeaderTextColor(bgColor, bgType);
                      if (suggestions.length >= 2) {
                        // Lấy ngẫu nhiên title từ top 6 màu tốt nhất để đảm bảo phong cách
                        const titleIdx = Math.floor(Math.random() * Math.min(6, suggestions.length));
                        setValue(`header_title_color_${key}`, suggestions[titleIdx].hex);

                        // Lấy ngẫu nhiên desc từ top 10 (tránh trùng title) để tạo sự khác biệt
                        let descIdx = Math.floor(Math.random() * Math.min(10, suggestions.length));
                        while (descIdx === titleIdx) {
                          descIdx = Math.floor(Math.random() * Math.min(10, suggestions.length));
                        }
                        setValue(`header_desc_color_${key}`, suggestions[descIdx].hex);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-bold rounded shadow transition-all"
                    title={t("config_system.auto_suggest_tooltip")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t("config_system.auto_suggest")}
                  </button>
                </div>

                {/* Title color */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {t("config_system.title_color")}
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={watch(`header_title_color_${key}`) || '#FFFFFF'}
                      onChange={(e) => setValue(`header_title_color_${key}`, e.target.value)}
                      className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      {...register(`header_title_color_${key}`)}
                      placeholder="#FFFFFF"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 focus:border-violet-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  {/* Palette gợi ý cho Title */}
                  <div className="flex flex-wrap gap-1">
                    {suggestHeaderTextColor(bgColor, bgType).slice(0, 8).map((s) => (
                      <button
                        key={s.hex}
                        type="button"
                        onClick={() => setValue(`header_title_color_${key}`, s.hex)}
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: s.hex }}
                        title={`${s.name} (${s.contrast.toFixed(1)}:1)`}
                      />
                    ))}
                  </div>
                </div>

                {/* Desc color */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {t("config_system.desc_color")}
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={watch(`header_desc_color_${key}`) || '#FDE047'}
                      onChange={(e) => setValue(`header_desc_color_${key}`, e.target.value)}
                      className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      {...register(`header_desc_color_${key}`)}
                      placeholder="#FDE047"
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 focus:border-violet-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  {/* Palette gợi ý cho Desc */}
                  <div className="flex flex-wrap gap-1">
                    {suggestHeaderTextColor(bgColor, bgType).slice(0, 16).map((s) => (
                      <button
                        key={s.hex}
                        type="button"
                        onClick={() => setValue(`header_desc_color_${key}`, s.hex)}
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: s.hex }}
                        title={`${s.name} (${s.contrast.toFixed(1)}:1)`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("config_system.preview")}
                </label>
                <div
                  className="w-full h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden relative flex flex-col items-center justify-center gap-1"
                  style={{
                    backgroundColor: "#000000",
                    backgroundImage: bgType === 'image' && bgImage
                      ? `linear-gradient(rgba(0,0,0,${1 - bgOpacity / 100}), rgba(0,0,0,${1 - bgOpacity / 100})), url(${bgImage.startsWith('http') ? bgImage : `http://localhost:6789${bgImage}`})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {bgType === 'color' && (
                    <div className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: bgOpacity / 100 }} />
                  )}
                  <p
                    className="relative z-10 text-lg font-black uppercase tracking-widest drop-shadow-lg"
                    style={{ color: watch(`header_title_color_${key}`) || '#FFFFFF' }}
                  >
                    TÊN GIẢI ĐẤU
                  </p>
                  <div className="relative z-10 h-0.5 w-20" style={{ backgroundColor: watch(`header_title_color_${key}`) || '#FFFFFF' }} />
                  <p
                    className="relative z-10 text-sm font-semibold uppercase tracking-wider drop-shadow"
                    style={{ color: watch(`header_desc_color_${key}`) || '#FDE047' }}
                  >
                    NỘI DUNG THI ĐẤU
                  </p>
                  {bgType === 'image' && !bgImage && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs bg-gray-900/50">
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
          {t("config_system.logo_management_title")}
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
            {t("config_system.upload_from_device")}
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
              placeholder={t("config_system.enter_url_placeholder")}
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
              <span>{t("config_system.add_logo")}</span>
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
              <span>{t("config_system.add_logo")}</span>
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
              {t("config_system.uploading")}
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
              {t("config_system.no_logos")}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {t("config_system.upload_image")}
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
                  <span>{editingIndex === index ? t("config_system.cancel") : t("config_system.edit")}</span>
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
                  <span>{t("config_system.delete")}</span>
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
              {t("config_system.preview")} Logo
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
                  {t("config_system.settings_management")}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t("config_system.settings_description")}
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
                <span>{t("config_system.reload")}</span>
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
                <span>{loading ? t("config_system.saving") : t("config_system.save_config")}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(inputFields)
            .filter(([groupTitle]) => !hiddenGroups.includes(groupTitle))
            .map(([groupTitle, fields], index) =>
              renderInputGroup(groupTitle, fields, index),
            )}
          {Object.entries(selectFields)
            .filter(([groupTitle]) => !hiddenGroups.includes(groupTitle))
            .map(([groupTitle, fields], index) =>
              renderSelectGroup(groupTitle, fields, index),
            )}
          {Object.entries(textareaFields)
            .filter(([groupTitle]) => !hiddenGroups.includes(groupTitle))
            .map(([groupTitle, fields], index) =>
              renderTextareaGroup(groupTitle, fields, index),
            )}
          {Object.entries(switchFields)
            .filter(([groupTitle]) => !hiddenGroups.includes(groupTitle))
            .map(([groupTitle, fields], index) =>
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
