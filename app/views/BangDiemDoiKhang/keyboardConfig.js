/**
 * Keyboard Configuration for BangDiemDoiKhang
 * 
 * 2 chế độ phím tắt:
 * - "default": Chế độ mặc định (layout hiện tại)
 * - "custom": Chế độ tuỳ chỉnh (có thể thay đổi mapping)
 * 
 * Có thể switch qua lại bằng phím F8
 */

// ========== PHÍM HỆ THỐNG (Luôn hoạt động, không đổi theo chế độ) ==========
import { PACKAGE_OVERRIDES } from "../../config/constants/packageFeatures";
import { getPackageTier } from "../../components/FeatureLock";

export const SYSTEM_KEYS = {
    TOGGLE_CONNECTION_MODAL: "F1",
    TOGGLE_SECONDARY_DISPLAY: "F2",
    TOGGLE_CONFIG_MODAL: "F3",
    TOGGLE_HISTORY_MODAL: "F4",
    TOGGLE_CONTROL_BAR: "F5",
    TOGGLE_MATCH_LIST: "F6",      // Danh sách trận đấu
    SWITCH_KEYBOARD_MODE: "F8",    // Phím chuyển chế độ
    TOGGLE_SOUND: "F9",           // Bật/Tắt âm thanh
    TOGGLE_FULLSCREEN: "F11",     // Toàn màn hình
    GO_BACK: "Escape",
};

// ========== CHẾ ĐỘ MẶC ĐỊNH ==========
const DEFAULT_KEYMAP = {
    // --- Điều khiển chính ---
    TOGGLE_TIMER: " ",           // Space
    UNDO: "ctrl+z",              // Ctrl+Z
    RESET: "g",                  // Reset trận

    // --- Điều hướng ---
    PREVIOUS_MATCH: "ArrowLeft",
    NEXT_MATCH: "ArrowRight",

    // --- Điểm số ĐỎ ---
    RED_SCORE_PLUS_1: "q",
    RED_SCORE_PLUS_2: "w",
    RED_SCORE_PLUS_3: "e",
    RED_SCORE_PLUS_5: "5",
    RED_SCORE_PLUS_10: "6",
    RED_SCORE_MINUS_1: "a",
    RED_SCORE_MINUS_2: "s",
    RED_SCORE_MINUS_3: "d",

    // --- Nhắc nhở / Cảnh cáo ĐỎ ---
    RED_REMIND_PLUS: "r",
    RED_REMIND_MINUS: "f",
    RED_WARN_PLUS: "z",
    RED_WARN_MINUS: "x",

    // --- Hành động ĐỎ ---
    RED_WINNER: "t",
    RED_MEDICAL: "c",

    // --- Điểm số XANH ---
    BLUE_SCORE_PLUS_1: "p",
    BLUE_SCORE_PLUS_2: "o",
    BLUE_SCORE_PLUS_3: "i",
    BLUE_SCORE_PLUS_5: "m",
    BLUE_SCORE_PLUS_10: "y",
    BLUE_SCORE_MINUS_1: "l",
    BLUE_SCORE_MINUS_2: "k",
    BLUE_SCORE_MINUS_3: "j",

    // --- Nhắc nhở / Cảnh cáo XANH ---
    BLUE_REMIND_PLUS: "u",
    BLUE_REMIND_MINUS: "h",
    BLUE_WARN_PLUS: "m",
    BLUE_WARN_MINUS: "n",

    // --- Hành động XANH ---
    BLUE_WINNER: "y",
    BLUE_MEDICAL: "b",

    // --- QUYỀN / VÕ NHẠC ---
    TOGGLE_ACTION_BUTTONS: "v",
    TOGGLE_ATHLETES: "b",
    TOGGLE_REF_CONNECTION: "n",
    TOGGLE_WAITING_OVERLAY: "F10",
    CALCULATE_SCORE: "Enter",
};

// ========== CHẾ ĐỘ VOVINAM ==========
const VOVINAM_KEYMAP = {
    // --- Điều khiển chính ---
    TOGGLE_TIMER: " ",           // Space
    UNDO: "ctrl+z",              // Ctrl+Z
    RESET: "g",                  // Reset trận

    // --- Điều hướng ---
    PREVIOUS_MATCH: "ArrowLeft",
    NEXT_MATCH: "ArrowRight",

    // --- Điểm số ĐỎ ---
    RED_SCORE_PLUS_1: "q",
    RED_SCORE_PLUS_2: "w",
    // RED_SCORE_PLUS_3: "e",

    RED_SCORE_MINUS_1: "ctrl+q",
    RED_SCORE_MINUS_2: "ctrl+w",
    // RED_SCORE_MINUS_3: "d",

    // --- Nhắc nhở / Cảnh cáo ĐỎ ---
    RED_REMIND_PLUS: "a",
    RED_REMIND_MINUS: "ctrl+a",
    RED_WARN_PLUS: "s",
    RED_WARN_MINUS: "ctrl+s",

    // --- Hành động ĐỎ ---
    RED_WINNER: "f",
    RED_WINNER_MINUS: "ctrl+f",
    RED_MEDICAL: "x",
    RED_MEDICAL_MINUS: "ctrl+x",

    // --- ĐÒN CHÂN ĐỎ ---
    RED_KICK: "d",
    RED_KICK_MINUS: "ctrl+d",

    // --- Điểm số XANH ---
    BLUE_SCORE_PLUS_1: "i",
    BLUE_SCORE_PLUS_2: "o",
    BLUE_SCORE_PLUS_3: "8",
    BLUE_SCORE_PLUS_5: "9",
    BLUE_SCORE_PLUS_10: "0",
    // BLUE_SCORE_PLUS_3: "i",
    BLUE_SCORE_MINUS_1: "ctrl+i",
    BLUE_SCORE_MINUS_2: "ctrl+o",
    // BLUE_SCORE_MINUS_3: "j",

    // --- Nhắc nhở / Cảnh cáo XANH ---
    BLUE_REMIND_PLUS: "j",
    BLUE_REMIND_MINUS: "ctrl+j",
    BLUE_WARN_PLUS: "k",
    BLUE_WARN_MINUS: "ctrl+k",

    // --- Hành động XANH ---
    BLUE_WINNER: "h",
    BLUE_WINNER_MINUS: "ctrl+h",
    BLUE_MEDICAL: "m",
    BLUE_MEDICAL_MINUS: "ctrl+m",

    // --- ĐÒN CHÂN XANH ---
    BLUE_KICK: "l",
    BLUE_KICK_MINUS: "ctrl+l",

    // --- Hành động Phím F ---
    // SETUP_CONNECT: "F1",
    // SETUP_CONFIG: "F5",
    // SETUP_HISTORY: "F6",
    // SETUP_CONTROL_BAR: "F7",
    // SETUP_LIST_MATCH: "F7",
    // SETUP_SWITCH_KEYBOARD_MODE: "F8",
    // SETUP_SECONDARY_DISPLAY: "F2",
    // SETUP_FULL_SCREEN: "F11",

    SETUP_GO_BACK: "Escape",

};

// ========== CHẾ ĐỘ PENCAK ==========
const PENCAK_KEYMAP = {
    // --- Điều khiển chính ---
    TOGGLE_TIMER: " ",           // Space
    UNDO: "ctrl+z",              // Ctrl+Z
    RESET: "g",                  // Reset trận

    // --- Điều hướng ---
    PREVIOUS_MATCH: "ArrowLeft",
    NEXT_MATCH: "ArrowRight",

    // --- Điểm số ĐỎ ---
    RED_SCORE_PLUS_1: "q",
    RED_SCORE_PLUS_2: "w",
    RED_SCORE_PLUS_3: "e",
    RED_SCORE_PLUS_5: "5",
    RED_SCORE_PLUS_10: "6",
    RED_SCORE_MINUS_1: "a",
    RED_SCORE_MINUS_2: "s",
    RED_SCORE_MINUS_3: "d",

    // --- Nhắc nhở / Cảnh cáo ĐỎ ---
    RED_REMIND_PLUS: "r",
    RED_REMIND_MINUS: "f",
    RED_WARN_PLUS: "z",
    RED_WARN_MINUS: "x",

    // --- Hành động ĐỎ ---
    RED_WINNER: "t",
    RED_MEDICAL: "c",

    // --- Điểm số XANH ---
    BLUE_SCORE_PLUS_1: "p",
    BLUE_SCORE_PLUS_2: "o",
    BLUE_SCORE_PLUS_3: "i",
    BLUE_SCORE_PLUS_5: "9",
    BLUE_SCORE_PLUS_10: "0",
    BLUE_SCORE_MINUS_1: "l",
    BLUE_SCORE_MINUS_2: "k",
    BLUE_SCORE_MINUS_3: "j",

    // --- Nhắc nhở / Cảnh cáo XANH ---
    BLUE_REMIND_PLUS: "u",
    BLUE_REMIND_MINUS: "h",
    BLUE_WARN_PLUS: "m",
    BLUE_WARN_MINUS: "n",

    // --- Hành động XANH ---
    BLUE_WINNER: "y",
    BLUE_MEDICAL: "b",
};

// ========== CHẾ ĐỘ VOHIENDAI ==========
const VOHIENDAI_KEYMAP = {
    // --- Điều khiển chính ---
    TOGGLE_TIMER: " ",           // Space
    UNDO: "ctrl+z",              // Ctrl+Z
    RESET: "g",                  // Reset trận

    // --- Điều hướng ---
    PREVIOUS_MATCH: "ArrowLeft",
    NEXT_MATCH: "ArrowRight",

    // --- Điểm số ĐỎ ---
    RED_SCORE_PLUS_1: "q",
    RED_SCORE_PLUS_2: "w",
    RED_SCORE_PLUS_3: "e",
    RED_SCORE_MINUS_1: "a",
    RED_SCORE_MINUS_2: "s",
    RED_SCORE_MINUS_3: "d",

    // --- Nhắc nhở / Cảnh cáo ĐỎ ---
    RED_REMIND_PLUS: "r",
    RED_REMIND_MINUS: "f",
    RED_WARN_PLUS: "z",
    RED_WARN_MINUS: "x",

    // --- Hành động ĐỎ ---
    RED_WINNER: "t",
    RED_MEDICAL: "c",

    // --- Điểm số XANH ---
    BLUE_SCORE_PLUS_1: "p",
    BLUE_SCORE_PLUS_2: "o",
    BLUE_SCORE_PLUS_3: "i",
    BLUE_SCORE_MINUS_1: "l",
    BLUE_SCORE_MINUS_2: "k",
    BLUE_SCORE_MINUS_3: "j",

    // --- Nhắc nhở / Cảnh cáo XANH ---
    BLUE_REMIND_PLUS: "u",
    BLUE_REMIND_MINUS: "h",
    BLUE_WARN_PLUS: "m",
    BLUE_WARN_MINUS: "n",

    // --- Hành động XANH ---
    BLUE_WINNER: "y",
    BLUE_MEDICAL: "b",
};

// ========== CHẾ ĐỘ CUSTOM ==========
const CUSTOM_KEYMAP = {
    // --- Điều khiển chính ---
    TOGGLE_TIMER: " ",           // Space
    UNDO: "ctrl+z",              // Ctrl+Z
    RESET: "g",                  // Reset trận

    // --- Điều hướng ---
    PREVIOUS_MATCH: "ArrowLeft",
    NEXT_MATCH: "ArrowRight",

    // --- Điểm số ĐỎ (NumPad / Bàn phím số) ---
    RED_SCORE_PLUS_1: "1",
    RED_SCORE_PLUS_2: "2",
    RED_SCORE_PLUS_3: "3",
    RED_SCORE_PLUS_5: "5",
    RED_SCORE_PLUS_10: "6",
    RED_SCORE_MINUS_1: "4",
    RED_SCORE_MINUS_2: "5",
    RED_SCORE_MINUS_3: "6",

    // --- Nhắc nhở / Cảnh cáo ĐỎ ---
    RED_REMIND_PLUS: "7",
    RED_REMIND_MINUS: "8",
    RED_WARN_PLUS: "9",
    RED_WARN_MINUS: "0",

    // --- Hành động ĐỎ ---
    RED_WINNER: "-",
    RED_MEDICAL: "=",

    // --- Điểm số XANH ---
    BLUE_SCORE_PLUS_1: "q",
    BLUE_SCORE_PLUS_2: "w",
    BLUE_SCORE_PLUS_3: "e",
    BLUE_SCORE_MINUS_1: "a",
    BLUE_SCORE_MINUS_2: "s",
    BLUE_SCORE_MINUS_3: "d",

    // --- Nhắc nhở / Cảnh cáo XANH ---
    BLUE_REMIND_PLUS: "r",
    BLUE_REMIND_MINUS: "f",
    BLUE_WARN_PLUS: "z",
    BLUE_WARN_MINUS: "x",

    // --- Hành động XANH ---
    BLUE_WINNER: "t",
    BLUE_MEDICAL: "c",
};

// ========== REGISTRY: Tất cả các chế độ ==========
export const KEYBOARD_MODES = {
    default: {
        label: "Mặc định",
        description: "Đầy đủ chức năng",
        keymap: DEFAULT_KEYMAP,
    },
    vovinam: {
        label: "Vovinam",
        description: "Vovinam - Việt Võ Đạo",
        keymap: VOVINAM_KEYMAP,
    },
    pencak: {
        label: "Pencak",
        description: "Pencak Silat",
        keymap: PENCAK_KEYMAP,
    },
    vohiendai: {
        label: "Vohiendai",
        description: "Võ Hiện Đại - Môn Phái",
        keymap: VOHIENDAI_KEYMAP,
    }
};

// ========== CẤU HÌNH MẶC ĐỊNH CONFIGSYSTEM THEO CHẾ ĐỘ ==========
export const CONFIG_PRESETS = {
    default: {
        // Thông tin giải đấu
        bo_mon: "Vovinam",

        // Danh sách fields bị khoá (không cho thay đổi)
        disabledFields: [
            // "bo_mon",
            // "keyboard_mode",
            // "he_diem",
            // "diem_bien_cong",
            // "diem_bien_tru",
            // "hien_thi_button_diem_3",
            // "hien_thi_button_diem_5",
            // "ap_dung_diem_bien_tru",
            // "ap_dung_diem_bien_cong",
            // "cau_hinh_doi_khang_diem_thap",
            // "cau_hinh_quyen_tinh_tong",
            // "cau_hinh_y_te",
            // "cau_hinh_tinh_diem_tuyet_doi",
            // "cau_hinh_xoa_nhac_nho",
            // "cau_hinh_xoa_canh_cao",
            // "cau_hinh_hinh_thuc_quyen",

        ],

        // Danh sách fields ẩn hoàn toàn (không hiển thị trên UI)
        hiddenFields: [
            // "hien_thi_button_diem_3",
            // "hien_thi_button_diem_5",
            // "hien_thi_button_diem_10",
            // "hien_thi_button_bien",
            // "hien_thi_button_bien",
            // "hien_thi_button_nga",
            // "diem_bien_cong",
            // "ap_dung_diem_bien_cong",
            // "ap_dung_diem_bien_tru",
            // "cau_hinh_doi_khang_diem_thap",
            // "cau_hinh_quyen_tinh_tong",
            // "cau_hinh_y_te",
            // "cau_hinh_tinh_diem_tuyet_doi",
            // "cau_hinh_xoa_nhac_nho",
            // "cau_hinh_xoa_canh_cao",
            // "cau_hinh_hinh_thuc_quyen",

        ],

        // Danh sách nhóm (group key) ẩn hoàn toàn
        hiddenGroups: [
            // "Chế độ áp dụng",
        ],
        allowedOptions: {
            // he_diem: ["2"],
            // so_giam_dinh: ["3", "5"],
            // so_hiep: ["2", "3"],
            // so_hiep_phu: ["0", "1"],
        },

        // Cài đặt điểm số
        diem_don_chan: 2,
        diem_nga: 0,
        diem_bien_tru: 1,
        diem_bien_cong: 0,

        // Cài đặt số lượng
        he_diem: "2",
        so_giam_dinh: "3",
        so_hiep: "3",
        so_hiep_phu: "1",

        // Chế độ bàn phím
        keyboard_mode: "default",

        // Chế độ áp dụng
        cau_hinh_doi_khang_diem_thap: 1,
        cau_hinh_quyen_tinh_tong: 1,
        cau_hinh_y_te: 1,
        cau_hinh_tinh_diem_tuyet_doi: 1,
        cau_hinh_xoa_nhac_nho: 1,
        cau_hinh_xoa_canh_cao: 1,
        cau_hinh_hinh_thuc_quyen: 1,

        // Chế độ bảng điểm
        ap_dung_doikhang: 1,
        ap_dung_quyen: 1,
        ap_dung_vonhac: 1,

        // Điểm biên
        ap_dung_diem_bien_tru: 1,
        ap_dung_diem_bien_cong: 0,

        // Âm thanh
        bat_am_thanh: 1,

        // Quyền hiển thị buttons - Điểm số
        hien_thi_button_diem_1: 1,
        hien_thi_button_diem_2: 1,
        hien_thi_button_diem_3: 0,
        hien_thi_button_diem_5: 0,
        hien_thi_button_diem_10: 0,

        // Quyền hiển thị buttons - Hành động
        hien_thi_button_nhac_nho: 1,
        hien_thi_button_canh_cao: 1,
        hien_thi_button_don_chan: 1,
        hien_thi_button_bien: 0,
        hien_thi_button_nga: 0,
        hien_thi_button_y_te: 1,
        hien_thi_button_thang: 1,

        // Quyền hiển thị buttons - Điều khiển
        hien_thi_button_quay_lai: 1,
        hien_thi_button_reset: 1,
        hien_thi_button_lich_su: 1,
        hien_thi_button_cau_hinh: 1,
        hien_thi_button_ket_thuc: 1,
        hien_thi_button_tran_tiep_theo: 1,
        hien_thi_button_tran_truoc: 1,
        hien_thi_button_hiep_phu: 1,

        // Quyền hiển thị thông tin
        hien_thi_thong_tin_nhac_nho: 1,
        hien_thi_thong_tin_canh_cao: 1,
        hien_thi_thong_tin_don_chan: 1,
        hien_thi_thong_tin_y_te: 1,

        // Cấu hình nền
        bg_quyen_type: "color",
        bg_quyen_image: "",
        bg_quyen_opacity: 40,
        bg_doikhang_type: "color",
        bg_doikhang_image: "",
        bg_doikhang_opacity: 40,
        bg_vonhac_type: "color",
        bg_vonhac_image: "",
        bg_vonhac_opacity: 40,

        // Cấu hình màu sắc header
        header_title_color_quyen: "#FFFFFF",
        header_desc_color_quyen: "#FFFFFF",
        header_title_color_doikhang: "#FFFFFF",
        header_desc_color_doikhang: "#FFFFFF",
        header_title_color_vonhac: "#FFFFFF",
        header_desc_color_vonhac: "#FFFFFF",
    },


    vovinam: {
        // Thông tin giải đấu
        bo_mon: "Vovinam",

        // Danh sách fields bị khoá (không cho thay đổi)
        disabledFields: [
            // "bo_mon",
            // "keyboard_mode",
            // "he_diem",
            // "diem_bien_cong",
            // "diem_bien_tru",
            // "hien_thi_button_diem_3",
            // "hien_thi_button_diem_5",
            // "ap_dung_diem_bien_tru",
            // "ap_dung_diem_bien_cong",
            // "cau_hinh_doi_khang_diem_thap",
            // "cau_hinh_quyen_tinh_tong",
            // "cau_hinh_y_te",
            // "cau_hinh_tinh_diem_tuyet_doi",
            // "cau_hinh_xoa_nhac_nho",
            // "cau_hinh_xoa_canh_cao",
            // "cau_hinh_hinh_thuc_quyen",

        ],

        // Danh sách fields ẩn hoàn toàn (không hiển thị trên UI)
        hiddenFields: [
            // "hien_thi_button_diem_3",
            // "hien_thi_button_diem_5",
            // "hien_thi_button_diem_10",
            // "hien_thi_button_bien",
            // "hien_thi_button_bien",
            // "hien_thi_button_nga",
            // "diem_bien_cong",
            // "ap_dung_diem_bien_cong",
            // "ap_dung_diem_bien_tru",
            // "cau_hinh_doi_khang_diem_thap",
            // "cau_hinh_quyen_tinh_tong",
            // "cau_hinh_y_te",
            // "cau_hinh_tinh_diem_tuyet_doi",
            // "cau_hinh_xoa_nhac_nho",
            // "cau_hinh_xoa_canh_cao",
            // "cau_hinh_hinh_thuc_quyen",

        ],

        // Danh sách nhóm (group key) ẩn hoàn toàn
        hiddenGroups: [
            // "Chế độ áp dụng",
        ],
        allowedOptions: {
            he_diem: ["2"],
            so_giam_dinh: ["3", "5"],
            so_hiep: ["2", "3"],
            so_hiep_phu: ["0", "1"],
        },

        // Cài đặt điểm số
        diem_don_chan: 2,
        diem_nga: 0,
        diem_bien_tru: 1,
        diem_bien_cong: 0,

        // Cài đặt số lượng
        he_diem: "2",
        so_giam_dinh: "3",
        so_hiep: "3",
        so_hiep_phu: "1",

        // Chế độ bàn phím
        keyboard_mode: "vovinam",

        // Chế độ áp dụng
        cau_hinh_doi_khang_diem_thap: 1,
        cau_hinh_quyen_tinh_tong: 1,
        cau_hinh_y_te: 1,
        cau_hinh_tinh_diem_tuyet_doi: 1,
        cau_hinh_xoa_nhac_nho: 1,
        cau_hinh_xoa_canh_cao: 1,
        cau_hinh_hinh_thuc_quyen: 1,

        // Chế độ bảng điểm
        ap_dung_doikhang: 1,
        ap_dung_quyen: 1,
        ap_dung_vonhac: 1,

        // Điểm biên
        ap_dung_diem_bien_tru: 1,
        ap_dung_diem_bien_cong: 0,

        // Âm thanh
        bat_am_thanh: 1,

        // Quyền hiển thị buttons - Điểm số
        hien_thi_button_diem_1: 1,
        hien_thi_button_diem_2: 1,
        hien_thi_button_diem_3: 0,
        hien_thi_button_diem_5: 0,
        hien_thi_button_diem_10: 0,

        // Quyền hiển thị buttons - Hành động
        hien_thi_button_nhac_nho: 1,
        hien_thi_button_canh_cao: 1,
        hien_thi_button_don_chan: 1,
        hien_thi_button_bien: 0,
        hien_thi_button_nga: 0,
        hien_thi_button_y_te: 1,
        hien_thi_button_thang: 1,

        // Quyền hiển thị buttons - Điều khiển
        hien_thi_button_quay_lai: 1,
        hien_thi_button_reset: 1,
        hien_thi_button_lich_su: 1,
        hien_thi_button_cau_hinh: 1,
        hien_thi_button_ket_thuc: 1,
        hien_thi_button_tran_tiep_theo: 1,
        hien_thi_button_tran_truoc: 1,
        hien_thi_button_hiep_phu: 1,

        // Quyền hiển thị thông tin
        hien_thi_thong_tin_nhac_nho: 1,
        hien_thi_thong_tin_canh_cao: 1,
        hien_thi_thong_tin_don_chan: 1,
        hien_thi_thong_tin_y_te: 1,
    },

    pencak: {
        // Thông tin giải đấu
        bo_mon: "Pencak Silat",

        // Danh sách fields bị khoá (không cho thay đổi)
        disabledFields: [
            "bo_mon", "keyboard_mode",
            "he_diem", "so_giam_dinh",
            "diem_don_chan", "diem_nga",
            "hien_thi_button_diem_5", "hien_thi_button_diem_10",
            "hien_thi_button_don_chan",
            "hien_thi_button_bien", "hien_thi_button_nga",
            "hien_thi_thong_tin_don_chan",
            "ap_dung_quyen", "ap_dung_vonhac",
            "ap_dung_diem_bien_tru", "ap_dung_diem_bien_cong",
        ],

        // Danh sách fields ẩn hoàn toàn (không hiển thị trên UI)
        hiddenFields: [
            "hien_thi_button_diem_5",
            "hien_thi_button_diem_10",
            "hien_thi_button_don_chan",
            "hien_thi_button_bien",
            "hien_thi_button_nga",
            "hien_thi_thong_tin_don_chan",
            "diem_don_chan",
            "diem_nga",
            "diem_bien_tru",
            "diem_bien_cong",
        ],

        // Danh sách nhóm (group key) ẩn hoàn toàn
        hiddenGroups: [
            // "Cài đặt điểm số",
            // "Mô tả giải đấu",
        ],

        // Giá trị được phép hiển thị cho select fields
        allowedOptions: {
            he_diem: ["1"],
            so_giam_dinh: ["3", "5"],
            so_hiep: ["3"],
            so_hiep_phu: ["0", "1"],
        },

        // Cài đặt chung
        thoi_gian_tinh_diem: 1000,
        thoi_gian_thi_dau: 180,
        thoi_gian_nghi: 60,
        thoi_gian_hiep_phu: 120,
        thoi_gian_y_te: 60,
        khoang_diem_tuyet_toi: 15,

        // Cài đặt điểm số
        diem_don_chan: 0,
        diem_nga: 0,
        diem_bien_tru: 0,
        diem_bien_cong: 0,

        // Cài đặt số lượng
        he_diem: "1",
        so_giam_dinh: "3",
        so_hiep: "3",
        so_hiep_phu: "1",

        // Chế độ bàn phím
        keyboard_mode: "pencak",

        // Chế độ áp dụng
        cau_hinh_doi_khang_diem_thap: 0,
        cau_hinh_quyen_tinh_tong: 0,
        cau_hinh_y_te: 1,
        cau_hinh_tinh_diem_tuyet_doi: 1,
        cau_hinh_xoa_nhac_nho: 0,
        cau_hinh_xoa_canh_cao: 0,
        cau_hinh_hinh_thuc_quyen: 0,

        // Chế độ bảng điểm
        ap_dung_doikhang: 1,
        ap_dung_quyen: 0,
        ap_dung_vonhac: 0,

        // Điểm biên
        ap_dung_diem_bien_tru: 0,
        ap_dung_diem_bien_cong: 0,

        // Âm thanh
        bat_am_thanh: 1,

        // Quyền hiển thị buttons - Điểm số
        hien_thi_button_diem_1: 1,
        hien_thi_button_diem_2: 1,
        hien_thi_button_diem_3: 1,
        hien_thi_button_diem_5: 0,
        hien_thi_button_diem_10: 0,

        // Quyền hiển thị buttons - Hành động
        hien_thi_button_nhac_nho: 1,
        hien_thi_button_canh_cao: 1,
        hien_thi_button_don_chan: 0,
        hien_thi_button_bien: 0,
        hien_thi_button_nga: 0,
        hien_thi_button_y_te: 1,
        hien_thi_button_thang: 1,

        // Quyền hiển thị buttons - Điều khiển
        hien_thi_button_quay_lai: 1,
        hien_thi_button_reset: 1,
        hien_thi_button_lich_su: 1,
        hien_thi_button_cau_hinh: 1,
        hien_thi_button_ket_thuc: 1,
        hien_thi_button_tran_tiep_theo: 1,
        hien_thi_button_tran_truoc: 1,
        hien_thi_button_hiep_phu: 1,

        // Quyền hiển thị thông tin
        hien_thi_thong_tin_nhac_nho: 1,
        hien_thi_thong_tin_canh_cao: 1,
        hien_thi_thong_tin_don_chan: 0,
        hien_thi_thong_tin_y_te: 1,
    },

    vohiendai: {
        // Thông tin giải đấu
        bo_mon: "Võ Hiện Đại",

        // Danh sách fields bị khoá (không cho thay đổi)
        disabledFields: [
            "bo_mon", "keyboard_mode",
            "he_diem", "so_giam_dinh",
            "diem_don_chan", "diem_nga",
            "hien_thi_button_diem_5",
            "hien_thi_button_diem_10",
            "hien_thi_button_don_chan",
            "hien_thi_button_bien",
            "hien_thi_button_nga",
            "hien_thi_thong_tin_don_chan",
            "ap_dung_vonhac",
            "ap_dung_diem_bien_tru",
            "ap_dung_diem_bien_cong",
        ],

        // Danh sách fields ẩn hoàn toàn (không hiển thị trên UI)
        hiddenFields: [
            "hien_thi_button_diem_5",
            "hien_thi_button_diem_10",
            "hien_thi_button_don_chan",
            "hien_thi_button_bien",
            "hien_thi_button_nga",
            "hien_thi_thong_tin_don_chan",
            "diem_don_chan",
            "diem_nga",
            "diem_bien_tru",
            "diem_bien_cong",
        ],

        // Danh sách nhóm (group key) ẩn hoàn toàn
        hiddenGroups: [
            // "Cài đặt điểm số",
            // "Mô tả giải đấu",
        ],

        // Giá trị được phép hiển thị cho select fields
        allowedOptions: {
            he_diem: ["1", "2"],
            so_giam_dinh: ["3", "5"],
            so_hiep: ["2", "3"],
            so_hiep_phu: ["0", "1"],
        },

        // Cài đặt chung
        thoi_gian_tinh_diem: 1000,
        thoi_gian_thi_dau: 120,
        thoi_gian_nghi: 30,
        thoi_gian_hiep_phu: 90,
        thoi_gian_y_te: 30,
        khoang_diem_tuyet_toi: 12,

        // Cài đặt điểm số
        diem_don_chan: 0,
        diem_nga: 0,
        diem_bien_tru: 0,
        diem_bien_cong: 0,

        // Cài đặt số lượng
        he_diem: "1",
        so_giam_dinh: "3",
        so_hiep: "2",
        so_hiep_phu: "1",

        // Chế độ bàn phím
        keyboard_mode: "vohiendai",

        // Chế độ áp dụng
        cau_hinh_doi_khang_diem_thap: 0,
        cau_hinh_quyen_tinh_tong: 0,
        cau_hinh_y_te: 1,
        cau_hinh_tinh_diem_tuyet_doi: 1,
        cau_hinh_xoa_nhac_nho: 0,
        cau_hinh_xoa_canh_cao: 0,
        cau_hinh_hinh_thuc_quyen: 0,

        // Chế độ bảng điểm
        ap_dung_doikhang: 1,
        ap_dung_quyen: 1,
        ap_dung_vonhac: 0,

        // Điểm biên
        ap_dung_diem_bien_tru: 0,
        ap_dung_diem_bien_cong: 0,

        // Âm thanh
        bat_am_thanh: 1,

        // Quyền hiển thị buttons - Điểm số
        hien_thi_button_diem_1: 1,
        hien_thi_button_diem_2: 1,
        hien_thi_button_diem_3: 1,
        hien_thi_button_diem_5: 0,
        hien_thi_button_diem_10: 0,

        // Quyền hiển thị buttons - Hành động
        hien_thi_button_nhac_nho: 1,
        hien_thi_button_canh_cao: 1,
        hien_thi_button_don_chan: 0,
        hien_thi_button_bien: 0,
        hien_thi_button_nga: 0,
        hien_thi_button_y_te: 1,
        hien_thi_button_thang: 1,

        // Quyền hiển thị buttons - Điều khiển
        hien_thi_button_quay_lai: 1,
        hien_thi_button_reset: 1,
        hien_thi_button_lich_su: 1,
        hien_thi_button_cau_hinh: 1,
        hien_thi_button_ket_thuc: 1,
        hien_thi_button_tran_tiep_theo: 1,
        hien_thi_button_tran_truoc: 1,
        hien_thi_button_hiep_phu: 1,

        // Quyền hiển thị thông tin
        hien_thi_thong_tin_nhac_nho: 1,
        hien_thi_thong_tin_canh_cao: 1,
        hien_thi_thong_tin_don_chan: 0,
        hien_thi_thong_tin_y_te: 1,
    },
};

/**
 * Lấy cấu hình mặc định tương ứng với môn phái và gói cước (Tier)
 * Nếu người dùng dùng gói Basic, một số option như Võ nhạc sẽ bị loại bỏ
 * Trộn thêm cấu hình trả về trực tiếp từ Online License Server (onlineFeatures)
 * 
 * @param {string} packageName - Tên gói cước từ redux `state.license.packageName`
 * @param {string} mode - "vovinam" | "pencak" | "vohiendai"
 * @param {Object} onlineFeatures - JSON features từ license server (`state.license.features`)
 * @returns {Object} Config Object hoàn chỉnh
 */
export const getConfigPresetsByTier = (packageName, mode = "default", onlineFeatures = {}) => {

    // 1. Lấy thông tin gói cước và config override tương ứng
    const currentTier = getPackageTier(packageName);
    const overrides = JSON.parse(JSON.stringify(PACKAGE_OVERRIDES[currentTier] || {}));

    // Áp phích ghi đè phân quyền (disabled_configs) từ kênh Online (nếu có)
    if (onlineFeatures && Array.isArray(onlineFeatures.disabled_configs)) {
        overrides.disabledOptions = overrides.disabledOptions || {};
        onlineFeatures.disabled_configs.forEach(configKey => {
            overrides.disabledOptions[configKey] = 1;
        });
    }

    // 2. Clone preset gốc tránh mutate source
    const basePreset = JSON.parse(JSON.stringify(CONFIG_PRESETS[mode] || CONFIG_PRESETS.vovinam));
    // 3. Hoà trộn (merge) danh sách ẩn / khoá field
    if (overrides.disabledOptions) {
        Object.keys(overrides.disabledOptions).forEach(key => {
            // Đẩy key vào danh sách disable nếu chưa có
            if (!basePreset.disabledFields.includes(key)) {
                basePreset.disabledFields.push(key);
            }
            // Thiết lập giá trị của field đó về 0 (VD: tắt ap_dung_vonhac)
            basePreset[key] = 0;
        });
    }
    if (overrides.hiddenGroups && overrides.hiddenGroups.length > 0) {
        basePreset.hiddenGroups = [...new Set([...basePreset.hiddenGroups, ...overrides.hiddenGroups])];
    }

    // 4. Áp dụng config_presets từ Online Server (ghi đè tất cả giá trị của preset theo mode)
    //    Ví dụ: onlineFeatures.config_presets.pencak = { so_hiep: "5", thoi_gian_thi_dau: 120 }
    const onlinePresetOverride = onlineFeatures?.config_presets?.[mode];
    if (onlinePresetOverride && typeof onlinePresetOverride === 'object') {
        Object.entries(onlinePresetOverride).forEach(([key, value]) => {
            // Merge các giá trị đặc biệt (mảng)
            if (key === 'disabledFields' && Array.isArray(value)) {
                basePreset.disabledFields = [...new Set([...basePreset.disabledFields, ...value])];
            } else if (key === 'hiddenFields' && Array.isArray(value)) {
                basePreset.hiddenFields = [...new Set([...basePreset.hiddenFields, ...value])];
            } else if (key === 'hiddenGroups' && Array.isArray(value)) {
                basePreset.hiddenGroups = [...new Set([...basePreset.hiddenGroups, ...value])];
            } else if (key === 'allowedOptions' && typeof value === 'object') {
                basePreset.allowedOptions = { ...basePreset.allowedOptions, ...value };
            } else {
                // Ghi đè trực tiếp các giá trị số/string
                basePreset[key] = value;
            }
        });
    }

    return basePreset;
};

// ========== LABELS: Mô tả từng action (cho UI hiển thị) ==========
export const ACTION_LABELS = {
    TOGGLE_TIMER: "Bắt đầu / Tạm dừng",
    UNDO: "Hoàn tác",
    RESET: "Reset trận",
    PREVIOUS_MATCH: "Trận trước",
    NEXT_MATCH: "Trận sau",

    RED_SCORE_PLUS_1: "Đỏ +1 điểm",
    RED_SCORE_PLUS_2: "Đỏ +2 điểm",
    RED_SCORE_PLUS_3: "Đỏ +3 điểm",
    RED_SCORE_PLUS_5: "Đỏ +5 điểm",
    RED_SCORE_PLUS_10: "Đỏ +10 điểm",
    RED_SCORE_MINUS_1: "Đỏ -1 điểm",
    RED_SCORE_MINUS_2: "Đỏ -2 điểm",
    RED_SCORE_MINUS_3: "Đỏ -3 điểm",
    RED_REMIND_PLUS: "Đỏ Nhắc nhở +1",
    RED_REMIND_MINUS: "Đỏ Nhắc nhở -1",
    RED_WARN_PLUS: "Đỏ Cảnh cáo +1",
    RED_WARN_MINUS: "Đỏ Cảnh cáo -1",
    RED_WINNER: "Đỏ Thắng",
    RED_MEDICAL: "Đỏ Y tế",

    BLUE_SCORE_PLUS_1: "Xanh +1 điểm",
    BLUE_SCORE_PLUS_2: "Xanh +2 điểm",
    BLUE_SCORE_PLUS_3: "Xanh +3 điểm",
    BLUE_SCORE_PLUS_5: "Xanh +5 điểm",
    BLUE_SCORE_PLUS_10: "Xanh +10 điểm",
    BLUE_SCORE_MINUS_1: "Xanh -1 điểm",
    BLUE_SCORE_MINUS_2: "Xanh -2 điểm",
    BLUE_SCORE_MINUS_3: "Xanh -3 điểm",
    BLUE_REMIND_PLUS: "Xanh Nhắc nhở +1",
    BLUE_REMIND_MINUS: "Xanh Nhắc nhở -1",
    BLUE_WARN_PLUS: "Xanh Cảnh cáo +1",
    BLUE_WARN_MINUS: "Xanh Cảnh cáo -1",
    BLUE_WINNER: "Xanh Thắng",
    BLUE_MEDICAL: "Xanh Y tế",
    BLUE_MEDICAL_MINUS: "Xanh Y tế -1",
    RED_KICK: "Đỏ Đòn chân",
    RED_KICK_MINUS: "Đỏ Đòn chân -1",
    BLUE_KICK: "Xanh Đòn chân",
    BLUE_KICK_MINUS: "Xanh Đòn chân -1",
    RED_MEDICAL_MINUS: "Đỏ Y tế -1",
    RED_SCORE_MINUS_5: "Đỏ -5 điểm",
    RED_SCORE_MINUS_10: "Đỏ -10 điểm",
    BLUE_SCORE_MINUS_5: "Xanh -5 điểm",
    BLUE_SCORE_MINUS_10: "Xanh -10 điểm",

    // --- QUYỀN / VÕ NHẠC Specific ---
    TOGGLE_ACTION_BUTTONS: "Ẩn/Hiện nút hành động",
    TOGGLE_ATHLETES: "Ẩn/Hiện thông tin VĐV",
    TOGGLE_REF_CONNECTION: "Xem trạng thái kết nối giám định",
    TOGGLE_WAITING_OVERLAY: "Bật/Tắt màn hình chờ điểm",
    CALCULATE_SCORE: "Tính điểm trung bình",
};

// ========== SYSTEM LABELS ==========
export const SYSTEM_LABELS = {
    TOGGLE_CONNECTION_MODAL: "Kết nối thiết bị",
    TOGGLE_SECONDARY_DISPLAY: "Màn hình phụ (F2)",
    TOGGLE_CONFIG_MODAL: "Cấu hình nhanh",
    TOGGLE_HISTORY_MODAL: "Lịch sử trận",
    TOGGLE_CONTROL_BAR: "Thanh điều khiển",
    TOGGLE_MATCH_LIST: "Danh sách trận đấu",
    SWITCH_KEYBOARD_MODE: "Chuyển nhanh chế độ phím",
    TOGGLE_SOUND: "Bật/Tắt âm thanh",
    TOGGLE_FULLSCREEN: "Toàn màn hình",
    GO_BACK: "Quay lại",
};

// ========== NHÓM ACTIONS (cho UI phân nhóm) ==========
export const ACTION_GROUPS = {
    "Điều khiển chính": ["TOGGLE_TIMER", "UNDO", "RESET"],
    "Điều hướng": ["PREVIOUS_MATCH", "NEXT_MATCH"],
    "Điểm số Đỏ": [
        "RED_SCORE_PLUS_1", "RED_SCORE_PLUS_2", "RED_SCORE_PLUS_3",
        "RED_SCORE_PLUS_5", "RED_SCORE_PLUS_10",
        "RED_SCORE_MINUS_1", "RED_SCORE_MINUS_2", "RED_SCORE_MINUS_3",
        "RED_SCORE_MINUS_5", "RED_SCORE_MINUS_10",
    ],
    "Nhắc nhở / Cảnh cáo Đỏ": [
        "RED_REMIND_PLUS", "RED_REMIND_MINUS",
        "RED_WARN_PLUS", "RED_WARN_MINUS",
    ],
    "Hành động Đỏ": ["RED_WINNER", "RED_MEDICAL", "RED_MEDICAL_MINUS", "RED_KICK", "RED_KICK_MINUS"],
    "Điểm số Xanh": [
        "BLUE_SCORE_PLUS_1", "BLUE_SCORE_PLUS_2", "BLUE_SCORE_PLUS_3",
        "BLUE_SCORE_PLUS_5", "BLUE_SCORE_PLUS_10",
        "BLUE_SCORE_MINUS_1", "BLUE_SCORE_MINUS_2", "BLUE_SCORE_MINUS_3",
        "BLUE_SCORE_MINUS_5", "BLUE_SCORE_MINUS_10",
    ],
    "Nhắc nhở / Cảnh cáo Xanh": [
        "BLUE_REMIND_PLUS", "BLUE_REMIND_MINUS",
        "BLUE_WARN_PLUS", "BLUE_WARN_MINUS",
    ],
    "Hành động Xanh": ["BLUE_WINNER", "BLUE_MEDICAL", "BLUE_MEDICAL_MINUS", "BLUE_KICK", "BLUE_KICK_MINUS"],
};

export const ACTION_GROUPS_QUYEN = {
    "Điều khiển chính": ["TOGGLE_TIMER", "RESET", "CALCULATE_SCORE"],
    "Hiển thị": ["TOGGLE_ACTION_BUTTONS", "TOGGLE_ATHLETES", "TOGGLE_REF_CONNECTION"],
    "Võ nhạc": ["TOGGLE_WAITING_OVERLAY"],
    "Điều hướng": ["PREVIOUS_MATCH", "NEXT_MATCH"],
};

/**
 * Lấy keymap theo chế độ
 * @param {"default" | "custom" | "vovinam" | "pencak" | "vohiendai"} mode
 * @param {Object} onlineFeatures Tính năng online từ License Server
 * @param {Object} localConfig Cấu hình từ config_system (DB)
 * @returns {Object} keymap
 */
export function getKeymap(mode = "default", onlineFeatures = {}, localConfig = {}) {
    let baseMap = { ...(KEYBOARD_MODES[mode]?.keymap || DEFAULT_KEYMAP) };

    // 1. Áp dụng custom keymaps từ server (nếu có)
    const serverOverrides = onlineFeatures?.custom_keymaps?.[mode];
    if (serverOverrides && typeof serverOverrides === 'object') {
        baseMap = { ...baseMap, ...serverOverrides };
    }

    // 2. Áp dụng local config (kb_ keys từ ConfigSystem)
    // Ưu tiên cao nhất vì là do người dùng cấu hình trực tiếp
    if (localConfig && typeof localConfig === 'object') {
        Object.entries(localConfig).forEach(([key, value]) => {
            if (key.startsWith("kb_")) {
                const action = key.replace("kb_", "");
                // Nếu người dùng chọn "KHÔNG GÁN" (__disabled__), xóa khỏi map để phím mặc định không chạy
                if (value === "__disabled__") {
                    delete baseMap[action];
                } else if (value && !SYSTEM_LABELS[action]) {
                    baseMap[action] = value;
                }
            }
        });
    }

    return baseMap;
}

/**
 * Lấy system keys có ghi đè từ server và local
 * @param {Object} onlineFeatures Tính năng online từ License Server
 * @param {Object} localConfig Cấu hình từ config_system (DB)
 * @returns {Object} systemKeys
 */
export function getSystemKeys(onlineFeatures = {}, localConfig = {}) {
    let baseKeys = { ...SYSTEM_KEYS };

    // 1. Server overrides
    const serverOverrides = onlineFeatures?.custom_keymaps?.system;
    if (serverOverrides && typeof serverOverrides === 'object') {
        baseKeys = { ...baseKeys, ...serverOverrides };
    }

    // 2. Local overrides
    if (localConfig && typeof localConfig === 'object') {
        Object.entries(localConfig).forEach(([key, value]) => {
            if (key.startsWith("kb_")) {
                const action = key.replace("kb_", "");
                if (SYSTEM_LABELS[action]) {
                    if (value === "__disabled__") {
                        delete baseKeys[action];
                    } else if (value) {
                        baseKeys[action] = value;
                    }
                }
            }
        });
    }

    return baseKeys;
}

/**
 * Tạo reverse map: key -> action (để tra cứu nhanh khi nhấn phím)
 * @param {Object} keymap
 * @returns {Object} reverseMap  { "q": "RED_SCORE_PLUS_1", "w": "RED_SCORE_PLUS_2", ... }
 */
export function buildReverseKeymap(keymap) {
    const map = {};
    for (const [action, key] of Object.entries(keymap)) {
        if (key && key !== "__disabled__") {
            map[key] = action;
        }
    }
    return map;
}

/**
 * Tạo handler cho handleKeyDown dựa trên keymap + handlers
 * 
 * @param {Object} params
 * @param {"default" | "custom"} params.mode - Chế độ bàn phím
 * @param {Object} params.handlers - Các handler functions từ handlersRef
 * @param {Function} params.showConfirm - Hàm hiển thị confirm dialog
 * @param {Function} params.btnGoBack - Hàm quay lại
 * @param {Function} params.setShowConnectionModal - Setter
 * @param {Function} params.setShowConfigModal - Setter
 * @param {Function} params.setShowHistoryModal - Setter
 * @param {Function} params.setShowControlBar - Setter 
 * @param {Function} params.onSwitchMode - Callback khi switch chế độ
 * @param {boolean} params.showConfigModal
 * @param {boolean} params.showHistoryModal
 * @param {boolean} params.showConnectionModal
 * @param {Object} params.onlineFeatures Dữ liệu license tính năng
 * @returns {Function} handleKeyDown event handler
 */
export function createKeyDownHandler({
    mode = "default",
    onlineFeatures = {},
    localConfig = {}, // Thêm localConfig
    handlers,
    showConfirm,
    btnGoBack,
    setShowConnectionModal,
    setShowConfigModal,
    setShowHistoryModal,
    setShowControlBar,
    onSwitchMode,
    showConfigModal,
    showHistoryModal,
    showConnectionModal,
    setShowMatchListModal,
    setIsSoundEnabled,
    setShowSecondaryDisplay,
    // Bổ sung các setters cho Quyền/Võ nhạc
    setShowAthletes,
    setShowActionButtons,
    setShowRefConnectionState,
    setShowWaitingOverlay,
}) {
    const keymap = getKeymap(mode, onlineFeatures, localConfig);
    const systemKeys = getSystemKeys(onlineFeatures, localConfig);
    const reverseMap = buildReverseKeymap(keymap);

    return async (e) => {
        // handlers là ref object — đọc .current để lấy handlers mới nhất
        const h = handlers.current || handlers;

        console.log("e", e.code);
        // Bỏ qua phím lặp lại (giữ phím)
        if (e.repeat) return;

        // Bỏ qua nếu đang focus vào input/textarea
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            return;
        }

        const key = e.key.toLowerCase();
        const code = e.code?.toLowerCase();

        // ========== PHÍM HỆ THỐNG (Luôn hoạt động) ==========
        if (e.key === systemKeys.GO_BACK) { // Escape
            e.preventDefault();
            btnGoBack();
            return;
        }

        if (e.key === systemKeys.TOGGLE_CONNECTION_MODAL) { // F1
            e.preventDefault();
            setShowConnectionModal((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.TOGGLE_SECONDARY_DISPLAY) { // F2
            e.preventDefault();
            if (setShowSecondaryDisplay) setShowSecondaryDisplay((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.TOGGLE_CONFIG_MODAL) { // F3
            e.preventDefault();
            setShowConfigModal((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.TOGGLE_HISTORY_MODAL) { // F4
            e.preventDefault();
            setShowHistoryModal((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.TOGGLE_CONTROL_BAR) { // F5
            e.preventDefault();
            setShowControlBar((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.SWITCH_KEYBOARD_MODE) { // F8
            e.preventDefault();
            if (onSwitchMode) onSwitchMode();
            return;
        }

        if (e.key === systemKeys.TOGGLE_MATCH_LIST) { // F6
            e.preventDefault();
            if (setShowMatchListModal) setShowMatchListModal((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.TOGGLE_SOUND) { // F9
            e.preventDefault();
            if (setIsSoundEnabled) setIsSoundEnabled((prev) => !prev);
            return;
        }

        if (e.key === systemKeys.TOGGLE_FULLSCREEN) { // F11
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
            return;
        }

        // ========== TẮT TẤT CẢ HOTKEY KHÁC KHI ĐANG MỞ MODAL ==========
        if (showConfigModal || showHistoryModal || showConnectionModal) {
            return;
        }

        // ========== XỬ LÝ PHÍM THEO KEYMAP ==========

        // Ctrl+Z: Undo (đặc biệt, cần check trước reverseMap)
        if (e.ctrlKey && key === "z") {
            e.preventDefault();
            if (!h.isBreakTime) {
                h.undoLastAction();
            }
            return;
        }

        // Space: Toggle timer (start/pause/resume)
        if (code === "space") {
            e.preventDefault();
            if (h.isBreakTime) return;
            h.toggleTimer();
            return;
        }

        // Mũi tên trái/phải: Điều hướng trận
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            h.btnPreviousMatch();
            return;
        }
        if (e.key === "ArrowRight") {
            e.preventDefault();
            h.btnNextMatch();
            return;
        }

        // Tra cứu action từ reverse map
        // Xây dựng key combo đầy đủ (bao gồm ctrl+ nếu đang giữ Ctrl)
        let keyCombo = key;
        if (e.ctrlKey && key !== "z") {
            keyCombo = "ctrl+" + key;
        }
        console.log('keyCombo: ', keyCombo);
        const action = reverseMap[keyCombo] || (e.ctrlKey ? null : reverseMap[key]);
        if (!action) return;

        e.preventDefault();
        console.log('action: ', action);

        // Thực thi action
        switch (action) {
            // --- ĐỎ ---
            case "RED_SCORE_PLUS_1":
                h.handleScoreChange("red", 1);
                break;
            case "RED_SCORE_PLUS_2":
                h.handleScoreChange("red", 2);
                break;
            case "RED_SCORE_PLUS_3":
                h.handleScoreChange("red", 3);
                break;
            case "RED_SCORE_MINUS_1":
                h.handleScoreChange("red", -1);
                break;
            case "RED_SCORE_MINUS_2":
                h.handleScoreChange("red", -2);
                break;
            case "RED_SCORE_MINUS_3":
                h.handleScoreChange("red", -3);
                break;
            case "RED_SCORE_PLUS_5":
                h.handleScoreChange("red", 5);
                break;
            case "RED_SCORE_MINUS_5":
                h.handleScoreChange("red", -5);
                break;
            case "RED_SCORE_PLUS_10":
                h.handleScoreChange("red", 10);
                break;
            case "RED_SCORE_MINUS_10":
                h.handleScoreChange("red", -10);
                break;
            case "RED_REMIND_PLUS":
                h.handleRemind("red", 1);
                break;
            case "RED_REMIND_MINUS":
                h.handleRemind("red", -1);
                break;
            case "RED_WARN_PLUS":
                h.handleWarn("red", 1);
                break;
            case "RED_WARN_MINUS":
                h.handleWarn("red", -1);
                break;
            case "RED_WINNER":
                h.handleWinner("red");
                break;
            case "RED_MEDICAL":
                h.handleMedical("red");
                break;
            case "RED_KICK":
                h.handleKick("red", 1);
                break;
            case "RED_KICK_MINUS":
                h.handleKick("red", -1);
                break;
            case "RED_MEDICAL_MINUS":
                h.handleMedical("red", -1);
                break;

            // --- XANH ---
            case "BLUE_SCORE_PLUS_1":
                h.handleScoreChange("blue", 1);
                break;
            case "BLUE_SCORE_PLUS_2":
                h.handleScoreChange("blue", 2);
                break;
            case "BLUE_SCORE_PLUS_3":
                h.handleScoreChange("blue", 3);
                break;
            case "BLUE_SCORE_MINUS_1":
                h.handleScoreChange("blue", -1);
                break;
            case "BLUE_SCORE_MINUS_2":
                h.handleScoreChange("blue", -2);
                break;
            case "BLUE_SCORE_MINUS_3":
                h.handleScoreChange("blue", -3);
                break;
            case "BLUE_SCORE_PLUS_5":
                h.handleScoreChange("blue", 5);
                break;
            case "BLUE_SCORE_MINUS_5":
                h.handleScoreChange("blue", -5);
                break;
            case "BLUE_SCORE_PLUS_10":
                h.handleScoreChange("blue", 10);
                break;
            case "BLUE_SCORE_MINUS_10":
                h.handleScoreChange("blue", -10);
                break;
            case "BLUE_REMIND_PLUS":
                h.handleRemind("blue", 1);
                break;
            case "BLUE_REMIND_MINUS":
                h.handleRemind("blue", -1);
                break;
            case "BLUE_WARN_PLUS":
                h.handleWarn("blue", 1);
                break;
            case "BLUE_WARN_MINUS":
                h.handleWarn("blue", -1);
                break;
            case "BLUE_WINNER":
                h.handleWinner("blue");
                break;
            case "BLUE_MEDICAL":
                h.handleMedical("blue");
                break;
            case "BLUE_KICK":
                h.handleKick("blue", 1);
                break;
            case "BLUE_KICK_MINUS":
                h.handleKick("blue", -1);
                break;
            case "BLUE_MEDICAL_MINUS":
                h.handleMedical("blue", -1);
                break;
            // --- CHUNG ---


            case "RESET": {
                if (showConfirm) {
                    const confirmed = await showConfirm(
                        "Bạn có chắc chắn muốn bắt đầu lại trận đấu từ đầu không?",
                        { title: "Thông báo" }
                    );
                    if (confirmed === false) return;
                }
                h.resetTimer();
                break;
            }

            // --- QUYỀN / VÕ NHẠC ---
            case "TOGGLE_ACTION_BUTTONS":
                if (setShowActionButtons) setShowActionButtons(prev => !prev);
                break;
            case "TOGGLE_ATHLETES":
                if (setShowAthletes) setShowAthletes(prev => !prev);
                break;
            case "TOGGLE_REF_CONNECTION":
                if (setShowRefConnectionState) setShowRefConnectionState(prev => !prev);
                break;
            case "TOGGLE_WAITING_OVERLAY":
                if (setShowWaitingOverlay) {
                    if (h.playBell) h.playBell();
                    setShowWaitingOverlay(prev => !prev);
                }
                break;
            case "CALCULATE_SCORE":
                if (h.handleCaculator) h.handleCaculator();
                break;

            default:
                break;
        }
    };
}

/**
 * Lấy danh sách tên chế độ
 * @returns {string[]} ["default", "custom"]
 */
export function getModeNames() {
    return Object.keys(KEYBOARD_MODES);
}

/**
 * Chuyển sang chế độ tiếp theo (vòng tròn)
 * @param {string} currentMode
 * @returns {string} nextMode
 */
export function getNextMode(currentMode) {
    const modes = getModeNames();
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    return modes[nextIndex];
}

/**
 * Lấy label hiển thị cho phím
 * @param {string} key
 * @returns {string} ví dụ: "Space", "Q", "Ctrl+Z", "←", "→"
 */
export function getKeyDisplayLabel(key) {
    const specialKeys = {
        " ": "Space",
        "ctrl+z": "Ctrl+Z",
        "ArrowLeft": "←",
        "ArrowRight": "→",
        "-": "−",
        "=": "=",
    };
    return specialKeys[key] || key.toUpperCase();
}

export default {
    SYSTEM_KEYS,
    KEYBOARD_MODES,
    ACTION_LABELS,
    ACTION_GROUPS,
    getKeymap,
    buildReverseKeymap,
    createKeyDownHandler,
    getModeNames,
    getNextMode,
    getKeyDisplayLabel,
    CONFIG_PRESETS,
    getConfigPresetsByTier
};
