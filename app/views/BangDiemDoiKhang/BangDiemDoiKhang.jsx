import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatMatchName } from "../../utils/nameFormatter";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal";
import useConfirmModal from "../../hooks/useConfirmModal";
import ConnectionManagerModal from "../BangDiemQuyen/components/ConnectionManagerModal";

import {
    useSocketEvent,
    emitSocketEvent,
} from "../../config/hooks/useSocketEvents";
import {
    createKeyDownHandler,
    getNextMode,
    KEYBOARD_MODES,
} from "./keyboardConfig";
import { MSG_TP_CLIENT } from "../../common/Constants";
import {
    connectSocket,
    disconnectSocket,
} from "../../config/redux/reducers/socket-reducer";
import { initSocket as initSocketUtil } from "../../utils/socketUtils";
import IpMasker from "../../common/IpMasker";

// Import flag manager utility
import { getFlagImage, getDefaultFlag } from "../../utils/flagManager";

// Import Match Config Modal
import MatchConfigModal from "./MatchConfigModal";
import HistoryModal from "./HistoryModal";
import WinnerSelectionModal from "./WinnerSelectionModal";
import WinnerAnnouncementModal from "./WinnerAnnouncementModal";
import MatchListModal from "../../components/MatchListModal";

// Sub-components for better maintainability
import CompetitionScoreboard from "./components/CompetitionScoreboard";
import JudgeScoreBlock from "./components/JudgeScoreBlock";
import ControlDashboard from "./components/ControlDashboard";
import ManagementBar from "./components/ManagementBar";
import RefereeStatusBoard from "./components/RefereeStatusBoard";
import ScoreboardHeader from "./components/ScoreboardHeader";

// Import helpers
import "./index.scss";

// Tạo Audio object một lần duy nhất để tránh lỗi autoplay
let bellAudio = null;
let victoryAudio = null;
let scoreAudios = {
    red_1: null,
    red_2: null,
    red_3: null,
    blue_1: null,
    blue_2: null,
    blue_3: null,
};
let actionAudios = {
    red_down: null,
    red_outline: null,
    red_remind: null,
    red_warn: null,
    blue_down: null,
    blue_outline: null,
    blue_remind: null,
    blue_warn: null,
};

// Biến global để lưu trạng thái âm thanh
let globalSoundEnabled = true;

// Hàm dừng tất cả audio đang phát
const stopAllAudios = () => {
    try {
        // Dừng bell audio
        if (bellAudio && !bellAudio.paused) {
            bellAudio.pause();
            bellAudio.currentTime = 0;
        }

        // Dừng victory audio
        if (victoryAudio && !victoryAudio.paused) {
            victoryAudio.pause();
            victoryAudio.currentTime = 0;
        }

        // Dừng tất cả score audios
        Object.values(scoreAudios).forEach((audio) => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        // Dừng tất cả action audios
        Object.values(actionAudios).forEach((audio) => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    } catch (error) {
        console.warn("Lỗi khi dừng audio:", error);
    }
};

// Hàm khởi tạo audio (gọi khi có tương tác người dùng)
const initBellAudio = () => {
    if (!bellAudio) {
        bellAudio = new Audio("/assets/rengreng.wav");
        bellAudio.volume = 1.0;
        bellAudio.load(); // Preload audio
    }
};

// Hàm khởi tạo audio chiến thắng
const initVictoryAudio = () => {
    if (!victoryAudio) {
        victoryAudio = new Audio("/assets/sounds/victory.mp3");
        victoryAudio.volume = 0.8; // Âm lượng 80%
        victoryAudio.load(); // Preload audio
    }
};

// Hàm khởi tạo audio điểm số
const initScoreAudios = () => {
    if (!scoreAudios.red_1) {
        scoreAudios.red_1 = new Audio("/assets/sounds/red_score_1.mp3");
        scoreAudios.red_1.volume = 0.9;
        scoreAudios.red_1.load();
    }
    if (!scoreAudios.red_2) {
        scoreAudios.red_2 = new Audio("/assets/sounds/red_score_2.mp3");
        scoreAudios.red_2.volume = 0.9;
        scoreAudios.red_2.load();
    }
    if (!scoreAudios.red_3) {
        scoreAudios.red_3 = new Audio("/assets/sounds/red_score_3.mp3");
        scoreAudios.red_3.volume = 0.9;
        scoreAudios.red_3.load();
    }
    if (!scoreAudios.blue_1) {
        scoreAudios.blue_1 = new Audio("/assets/sounds/blue_score_1.mp3");
        scoreAudios.blue_1.volume = 0.9;
        scoreAudios.blue_1.load();
    }
    if (!scoreAudios.blue_2) {
        scoreAudios.blue_2 = new Audio("/assets/sounds/blue_score_2.mp3");
        scoreAudios.blue_2.volume = 0.9;
        scoreAudios.blue_2.load();
    }
    if (!scoreAudios.blue_3) {
        scoreAudios.blue_3 = new Audio("/assets/sounds/blue_score_3.mp3");
        scoreAudios.blue_3.volume = 0.9;
        scoreAudios.blue_3.load();
    }
};

// Hàm khởi tạo audio hành động (Ngã, Biên, Nhắc nhở, Cảnh cáo)
const initActionAudios = () => {
    if (!actionAudios.red_down) {
        actionAudios.red_down = new Audio("/assets/sounds/red_down.mp3");
        actionAudios.red_down.volume = 0.9;
        actionAudios.red_down.load();
    }
    if (!actionAudios.red_outline) {
        actionAudios.red_outline = new Audio("/assets/sounds/red_outline.mp3");
        actionAudios.red_outline.volume = 0.9;
        actionAudios.red_outline.load();
    }
    if (!actionAudios.red_remind) {
        actionAudios.red_remind = new Audio("/assets/sounds/red_remind.mp3");
        actionAudios.red_remind.volume = 0.9;
        actionAudios.red_remind.load();
    }
    if (!actionAudios.red_warn) {
        actionAudios.red_warn = new Audio("/assets/sounds/red_warn.mp3");
        actionAudios.red_warn.volume = 0.9;
        actionAudios.red_warn.load();
    }
    if (!actionAudios.blue_down) {
        actionAudios.blue_down = new Audio("/assets/sounds/blue_down.mp3");
        actionAudios.blue_down.volume = 0.9;
        actionAudios.blue_down.load();
    }
    if (!actionAudios.blue_outline) {
        actionAudios.blue_outline = new Audio("/assets/sounds/blue_outline.mp3");
        actionAudios.blue_outline.volume = 0.9;
        actionAudios.blue_outline.load();
    }
    if (!actionAudios.blue_remind) {
        actionAudios.blue_remind = new Audio("/assets/sounds/blue_remind.mp3");
        actionAudios.blue_remind.volume = 0.9;
        actionAudios.blue_remind.load();
    }
    if (!actionAudios.blue_warn) {
        actionAudios.blue_warn = new Audio("/assets/sounds/blue_warn.mp3");
        actionAudios.blue_warn.volume = 0.9;
        actionAudios.blue_warn.load();
    }
};

const BangDiemDoiKhang = () => {
    const { t } = useTranslation();

    // Các hàm phát âm thanh dời vào trong component để dùng t()
    const playBell = useCallback(() => {
        if (!globalSoundEnabled) return;

        try {
            stopAllAudios();
            if (!bellAudio) initBellAudio();

            bellAudio.currentTime = 0;
            bellAudio.play().catch((error) => {
                console.warn(
                    t("scoreboard.doikhang.audio_play_error", { name: "bell" }),
                    error.message,
                );
            });
        } catch (error) {
            console.error(t("scoreboard.doikhang.audio_error", { name: "bell" }), error);
        }
    }, [t]);

    const playVictory = useCallback(() => {
        if (!globalSoundEnabled) return;

        try {
            stopAllAudios();
            if (!victoryAudio) initVictoryAudio();

            victoryAudio.currentTime = 0;
            victoryAudio.play().catch((error) => {
                console.warn(
                    t("scoreboard.doikhang.audio_play_error", { name: "victory" }),
                    error.message,
                );
            });
        } catch (error) {
            console.error(t("scoreboard.doikhang.audio_error", { name: "victory" }), error);
        }
    }, [t]);

    const playScoreSound = useCallback((team, point) => {
        if (!globalSoundEnabled) return;

        try {
            stopAllAudios();
            if (!scoreAudios.red_1) initScoreAudios();

            let audio = null;
            if (team === "red" && point === 1) audio = scoreAudios.red_1;
            else if (team === "red" && point === 2) audio = scoreAudios.red_2;
            else if (team === "red" && point === 3) audio = scoreAudios.red_3;
            else if (team === "blue" && point === 1) audio = scoreAudios.blue_1;
            else if (team === "blue" && point === 2) audio = scoreAudios.blue_2;
            else if (team === "blue" && point === 3) audio = scoreAudios.blue_3;

            if (audio) {
                audio.currentTime = 0;
                audio.play().catch((error) => {
                    console.warn(
                        t("scoreboard.doikhang.audio_play_error", { name: `score_${team}_${point} ` }),
                        error.message,
                    );
                });
            }
        } catch (error) {
            console.error(t("scoreboard.doikhang.audio_error", { name: "score" }), error);
        }
    }, [t]);

    const playActionSound = useCallback((team, action) => {
        if (!globalSoundEnabled) return;

        try {
            stopAllAudios();
            if (!actionAudios.red_down) initActionAudios();

            let audio = null;
            if (team === "red" && action === "down") audio = actionAudios.red_down;
            else if (team === "red" && action === "outline") audio = actionAudios.red_outline;
            else if (team === "red" && action === "remind") audio = actionAudios.red_remind;
            else if (team === "red" && action === "warn") audio = actionAudios.red_warn;
            else if (team === "blue" && action === "down") audio = actionAudios.blue_down;
            else if (team === "blue" && action === "outline") audio = actionAudios.blue_outline;
            else if (team === "blue" && action === "remind") audio = actionAudios.blue_remind;
            else if (team === "blue" && action === "warn") audio = actionAudios.blue_warn;

            if (audio) {
                audio.currentTime = 0;
                audio.play().catch((error) => {
                    console.warn(
                        t("scoreboard.doikhang.audio_play_error", { name: `action_${team}_${action} ` }),
                        error.message,
                    );
                });
            }
        } catch (error) {
            console.error(t("scoreboard.doikhang.audio_error", { name: "action" }), error);
        }
    }, [t]);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const socket = useSelector((state) => state.socket);
    const { features } = useSelector((state) => state.license);

    // Lấy dữ liệu từ state
    const matchData = location.state?.matchData || {};
    const returnUrl = location.state?.returnUrl || "/management/competition-data";
    const showPreviousResult = location.state?.showPreviousResult || true;

    // set state cho những thông tin chung
    const [matchInfo, setMatchInfo] = useState({
        // Thông tin trận đấu
        match_id: matchData.match_id,
        match_no: matchData.match_no,
        match_type: matchData.match_type,
        match_status: matchData.match_status ?? matchData.status ?? "WAI",
        match_weight: matchData.match_weight || "",
        match_level: matchData.match_level,
        // weight_class: matchData.weight_class,

        // Thông tin VĐV
        red: matchData.red || {},
        blue: matchData.blue || {},

        // red_athlete_id: matchData.red_athlete_id,
        // red_athlete_name: matchData.red_athlete_name,
        // blue_athlete_id: matchData.blue_athlete_id,
        // blue_athlete_name: matchData.blue_athlete_name,

        // Thông tin giải đấu
        // competition_id: matchData.competition_id,
        competition_dk_id: matchData?.competition_dk_id,
        // category_id: matchData.category_id,
        ten_giai_dau:
            matchData?.config_system?.ten_giai_dau ||
            matchData?.ten_giai_dau ||
            "GIẢI VÔ ĐỊCH DIGISPORTS",
        ten_mon_thi: matchData?.ten_mon_thi || "DIGISPORTS",

        // Cấu hình hiệp
        so_hiep: matchData?.config_system?.so_hiep || 3,
        so_hiep_phu: matchData?.config_system?.so_hiep_phu || 1,
        so_giam_dinh: matchData?.config_system?.so_giam_dinh || 3,
        he_diem: matchData?.config_system?.he_diem || 2,

        // Cấu hình thời gian
        thoi_gian_tinh_diem: matchData?.config_system?.thoi_gian_tinh_diem || 1000,
        thoi_gian_thi_dau: matchData?.config_system?.thoi_gian_thi_dau || 90,
        thoi_gian_nghi: matchData?.config_system?.thoi_gian_nghi || 30,
        thoi_gian_hiep_phu: matchData?.config_system?.thoi_gian_hiep_phu || 60,
        thoi_gian_y_te: matchData?.config_system?.thoi_gian_y_te || 120,

        // Thông tin kết quả trận trước (nếu có)
        previous_status: matchData?.previous_status,
        previous_winner: matchData?.previous_winner,
        previous_scores: matchData?.previous_scores,
        winner: matchData?.winner,

        // Thông tin khác
        row_index: matchData?.row_index,
        config_system: matchData?.config_system || {},
    });

    // State cho button permissions
    const [buttonPermissions, setButtonPermissions] = useState({
        hien_thi_button_diem_1:
            matchData?.config_system?.hien_thi_button_diem_1 == 1 ? true : false,
        hien_thi_button_diem_2: matchData?.config_system?.hien_thi_button_diem_2
            ? true
            : false,
        hien_thi_button_diem_3: matchData?.config_system?.hien_thi_button_diem_3
            ? true
            : false,
        hien_thi_button_diem_5: matchData?.config_system?.hien_thi_button_diem_5
            ? true
            : false,
        hien_thi_button_diem_10: matchData?.config_system?.hien_thi_button_diem_10
            ? true
            : false,
        // Hành động
        hien_thi_button_nhac_nho: matchData?.config_system?.hien_thi_button_nhac_nho
            ? true
            : false,
        hien_thi_button_canh_cao: matchData?.config_system?.hien_thi_button_canh_cao
            ? true
            : false,
        hien_thi_button_don_chan: matchData?.config_system?.hien_thi_button_don_chan
            ? true
            : false,
        hien_thi_button_bien: matchData?.config_system?.hien_thi_button_bien
            ? true
            : false,
        hien_thi_button_nga: matchData?.config_system?.hien_thi_button_nga
            ? true
            : false,
        hien_thi_button_y_te: matchData?.config_system?.hien_thi_button_y_te
            ? true
            : false,
        hien_thi_button_thang: matchData?.config_system?.hien_thi_button_thang
            ? true
            : false,
        // Điều khiển
        hien_thi_button_quay_lai: matchData?.config_system?.hien_thi_button_quay_lai
            ? true
            : false,
        hien_thi_button_reset: matchData?.config_system?.hien_thi_button_reset
            ? true
            : false,
        hien_thi_button_lich_su: matchData?.config_system?.hien_thi_button_lich_su
            ? true
            : false,
        hien_thi_button_cau_hinh: matchData?.config_system?.hien_thi_button_cau_hinh
            ? true
            : false,
        hien_thi_button_ket_thuc: matchData?.config_system?.hien_thi_button_ket_thuc
            ? true
            : false,
        hien_thi_button_tran_tiep_theo: matchData?.config_system
            ?.hien_thi_button_tran_tiep_theo
            ? true
            : false,
        hien_thi_button_tran_truoc: matchData?.config_system
            ?.hien_thi_button_tran_truoc
            ? true
            : false,
        hien_thi_button_hiep_phu: matchData?.config_system?.hien_thi_button_hiep_phu
            ? true
            : false,
        // Thông tin trận đấu
        hien_thi_thong_tin_nhac_nho: matchData?.config_system
            ?.hien_thi_thong_tin_nhac_nho
            ? true
            : false,
        hien_thi_thong_tin_canh_cao: matchData?.config_system
            ?.hien_thi_thong_tin_canh_cao
            ? true
            : false,
        hien_thi_thong_tin_don_chan: matchData?.config_system
            ?.hien_thi_thong_tin_don_chan
            ? true
            : false,
        hien_thi_thong_tin_y_te: matchData?.config_system?.hien_thi_thong_tin_y_te
            ? true
            : false,
        hien_thi_thong_tin_penalty: matchData?.config_system?.hien_thi_thong_tin_penalty
            ? true
            : false,
        hien_thi_thong_tin_absolute_win: matchData?.config_system?.hien_thi_thong_tin_absolute_win
            ? true
            : false,
        hien_thi_medical_time_overlay: matchData?.config_system?.hien_thi_medical_time_overlay
            ? true
            : false,
        hien_thi_break_time_overlay: matchData?.config_system?.hien_thi_break_time_overlay
            ? true
            : false,
        hien_thi_pause_match_overlay: matchData?.config_system?.hien_thi_pause_match_overlay
            ? true
            : false,
    });

    // Custom hook cho modal
    const {
        modalProps,
        showConfirm,
        showAlert,
        showWarning,
        showError,
        showSuccess,
    } = useConfirmModal();

    // Connection manager states
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [referrerDevices, setReferrerDevices] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);

    // Fetch button permissions từ API

    // Quản lý lịch sử hiệp thi đấu
    // nội dung gồm match_id, round, red_score, blue_score, red_remind, blue_remind, red_warn, blue_warn, red_mins, blue_mins, red_incr, blue_incr, round_type, confirm_attack, status
    const [roundHistory, setRoundHistory] = useState([]);

    const [ready, setReady] = useState(true);
    const [remindRed, setRemindRed] = useState(0);
    const [remindBlue, setRemindBlue] = useState(0);
    const [warnRed, setWarnRed] = useState(0);
    const [warnBlue, setWarnBlue] = useState(0);
    const [kickRed, setKickRed] = useState(0); // Công nhận đòn chân
    const [kickBlue, setKickBlue] = useState(0);
    const [medicalRed, setMedicalRed] = useState(0); // Y tế
    const [medicalBlue, setMedicalBlue] = useState(0);
    const [showRedKickIndicator, setShowRedKickIndicator] = useState(false);
    const [showBlueKickIndicator, setShowBlueKickIndicator] = useState(false);
    const redKickIndicatorTimer = useRef(null);
    const blueKickIndicatorTimer = useRef(null);

    const triggerKickIndicator = useCallback((team, show = true) => {
        // Ưu tiên settings từ config_system nếu có, mặc định là BẬT (true)
        const isEnabled = matchInfo.config_system?.hien_thi_thong_tin_don_chan !== undefined
            ? !!matchInfo.config_system.hien_thi_thong_tin_don_chan
            : true;

        if (!isEnabled && show) return;

        if (team === 'red') {
            if (redKickIndicatorTimer.current) {
                clearTimeout(redKickIndicatorTimer.current);
                redKickIndicatorTimer.current = null;
            }
            setShowRedKickIndicator(show);
        } else if (team === 'blue') {
            if (blueKickIndicatorTimer.current) {
                clearTimeout(blueKickIndicatorTimer.current);
                blueKickIndicatorTimer.current = null;
            }
            setShowBlueKickIndicator(show);
        }
    }, [matchInfo.config_system?.hien_thi_thong_tin_don_chan]);


    // State cho logos
    const [lsLogo, setLsLogo] = useState([]);

    // State cho tracking actions
    const [actionHistory, setActionHistory] = useState([]);

    // State cho modal
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false); // 'KẾT THÚC' -> HIỂN THỊ MODAL CHỌN ĐỎ/XANH
    const [selectedWinner, setSelectedWinner] = useState(null); //
    const [isFinishingMatch, setIsFinishingMatch] = useState(false); // Phân biệt giữa "Thắng" và "Kết thúc"
    const [announcedWinner, setAnnouncedWinner] = useState(null); // {team: 'red'|'blue', name: string, score: number} | Người thắng đang hiển thị hiệu ứng trên bảng điểm
    const [showWinnerAnnouncementModal, setShowWinnerAnnouncementModal] =
        useState(false); // HIỂN THỊ HIỆU ỨNG CHIẾN THẮNG
    const [showMatchListModal, setShowMatchListModal] = useState(false); // HIỂN THỊ DANH SÁCH TRẬN ĐẤU
    const [matchesList, setMatchesList] = useState([]); // DANH SÁCH TRẬN ĐẤU

    // Chế độ Test kết nối - giả lập điểm từ giám định
    const [isTestMode, setIsTestMode] = useState(false);
    const [isTestModePanel, setIsTestModePanel] = useState(false);
    // Vị trí của Test Panel (Draggable)
    const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 }); // Offset từ vị trí mặc định
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });

    // Vị trí của Floating Control Board (khi showControlBar == false)
    const [controlBoardPosition, setControlBoardPosition] = useState({ x: 0, y: 0 });
    const [isDraggingControl, setIsDraggingControl] = useState(false);
    const dragStartPosControl = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        // Chỉ kéo khi nhấn vào header bar
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - panelPosition.x,
            y: e.clientY - panelPosition.y
        };
    };

    const handleMouseDownControl = (e) => {
        // Chỉ kéo khi nhấn vào header bar
        setIsDraggingControl(true);
        dragStartPosControl.current = {
            x: e.clientX - controlBoardPosition.x,
            y: e.clientY - controlBoardPosition.y
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                setPanelPosition({
                    x: e.clientX - dragStartPos.current.x,
                    y: e.clientY - dragStartPos.current.y
                });
            }
            if (isDraggingControl) {
                setControlBoardPosition({
                    x: e.clientX - dragStartPosControl.current.x,
                    y: e.clientY - dragStartPosControl.current.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsDraggingControl(false);
        };

        if (isDragging || isDraggingControl) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, isDraggingControl]);

    // Auto scale logic cho Dashboard theo tỉ lệ màn hình
    const [dashboardScale, setDashboardScale] = useState(1);
    useEffect(() => {
        const handleResize = () => {
            // Scale dựa trên chiều rộng màn hình, lấy chuẩn Full HD là 1920px
            // Giới hạn scale tối thiểu 0.4 và tối đa 1.1 để không quá to trên màn hình 4K hoặc quá nhỏ
            const baseWidth = 1920;
            const currentWidth = window.innerWidth;
            const scale = Math.min(Math.max(currentWidth / baseWidth, 0.4), 1.1);
            setDashboardScale(scale);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // Secondary display popup state (F2 hotkey)
    const [showSecondaryDisplay, setShowSecondaryDisplay] = useState(false);

    // State vô hiệu hóa button
    const [disableRedButtons, setDisableRedButtons] = useState(false);
    const [disableBlueButtons, setDisableBlueButtons] = useState(false);

    // State hiển thị controls (toggle bằng F6)
    const [showControls, setShowControls] = useState(false);

    // State cho hiệu ứng nháy RF khi nhận tín hiệu từ giám định
    // Structure: { red: { 0: false, 1: false, ... }, blue: { 0: false, 1: false, ... } }
    // index tương ứng với RF (0 = RF1, 1 = RF2, ...)
    const [flashingRefs, setFlashingRefs] = useState({ red: {}, blue: {} });



    // Background style từ config
    const getBackgroundStyle = () => {
        const configSystem = matchInfo.config_system || {};

        const type = configSystem.bg_doikhang_type || 'color';
        const color = configSystem.bg_doikhang_color || '#1e3a8a';
        const image = configSystem.bg_doikhang_image || '';
        const opacity = configSystem.bg_doikhang_opacity ?? 100;

        if (type === 'image' && image) {
            const imageUrl = image.startsWith('http') ? image : `http://localhost:6789${image}`;
            return {
                backgroundImage: `linear-gradient(rgba(0,0,0,${1 - opacity / 100}), rgba(0,0,0,${1 - opacity / 100})), url("${imageUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#000000'
            };
        }
        return {
            backgroundColor: color,
        };
    };

    // Sync config_system when location state changes
    useEffect(() => {
        if (location.state?.matchData?.config_system) {
            setMatchInfo(prev => ({
                ...prev,
                config_system: location.state.matchData.config_system
            }));
        }
    }, [location.state?.matchData?.config_system]);

    // State cho điểm số
    const [redScore, setRedScore] = useState(0);
    const [blueScore, setBlueScore] = useState(0);

    // Refs để lưu điểm số mới nhất (tránh stale closure)
    const redScoreRef = useRef(0);
    const blueScoreRef = useRef(0);

    // Timer states (từ Timer.jsx cũ)
    const [timeLeft, setTimeLeft] = useState(
        (matchData?.config_system?.thoi_gian_thi_dau || 180) * 10,
    ); // Lưu theo 0.1s
    const [isRunning, setIsRunning] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [isBreakTime, setIsBreakTime] = useState(false);
    const [breakTimeLeft, setBreakTimeLeft] = useState(0);
    const [isMedicalTime, setIsMedicalTime] = useState(false); // Thời gian y tế
    const [medicalTimeLeft, setMedicalTimeLeft] = useState(0); // Thời gian y tế còn lại
    const [medicalTeam, setMedicalTeam] = useState(null); // 'red' hoặc 'blue'
    const [showControlBar, setShowControlBar] = useState(true); // Control Bar (Management)
    const [showCompetitionBoard, setShowCompetitionBoard] = useState(false); // Grid 2 cột (Competition)
    const timerRef = useRef(null);
    const medicalTimerRef = useRef(null);
    const wasRunningBeforeMedical = useRef(false);
    const isHandlingRound = useRef(false);
    const isTogglingTimer = useRef(false);

    // Tạm ngừng công bố kết quả
    const [pauseMatch, setPauseMatch] = useState(false);

    // State cho âm thanh (lấy từ config_system)
    const [isSoundEnabled, setIsSoundEnabled] = useState(
        matchData?.config_system?.bat_am_thanh !== 0,
    );

    // Đồng bộ refs với state khi component mount hoặc state thay đổi
    useEffect(() => {
        redScoreRef.current = redScore;
        blueScoreRef.current = blueScore;
    }, [redScore, blueScore]);

    // Đồng bộ globalSoundEnabled với state
    useEffect(() => {
        globalSoundEnabled = isSoundEnabled;
    }, [isSoundEnabled]);
    // thực listen
    useSocketEvent(MSG_TP_CLIENT.SCORE_RED, (response) => {
        if (!isRunning || isBreakTime) {
            // Lưu tracking
            if (response?.data?.score && response?.data?.referrer) {
                // Lưu lịch sử
                addActionToHistory(
                    "score-miss",
                    "red",
                    response.data.score,
                    `[MISS] Điểm đỏ +${response.data.score} (Giám định: ${response.data.referrer})`,
                );
            }
            return;
        } else {
            // Lưu lịch sử
            if (response?.data?.score && response?.data?.referrer) {
                // Lưu lịch sử
                addActionToHistory(
                    "score",
                    "red",
                    response.data.score,
                    `[REF] Điểm đỏ +${response.data.score} (Giám định: ${response.data.referrer})`,
                );
            }
        }
        // Trigger hiệu ứng nháy cho RF tương ứng
        if (response && typeof response.data.referrer !== "undefined") {
            const { score, referrer } = response.data;

            const refIndex = Number(referrer) - 1; // 0 = RF1, 1 = RF2, ...

            // Bật hiệu ứng nháy
            setFlashingRefs((prev) => ({
                ...prev,
                red: { ...prev.red, [refIndex]: Number(score) - 1 },
            }));

            // Tắt hiệu ứng sau thời gian tính điểm
            const thoiGianTinhDiem = matchInfo.thoi_gian_tinh_diem || 1000; // ms
            setTimeout(() => {
                setFlashingRefs((prev) => ({
                    ...prev,
                    red: { ...prev.red, [refIndex]: -1 },
                }));
            }, thoiGianTinhDiem);
        }
    });

    useSocketEvent(MSG_TP_CLIENT.SCORE_BLUE, (response) => {
        if (!isRunning || isBreakTime) {
            // Lưu tracking
            if (response?.data?.score && response?.data?.referrer) {
                // Lưu lịch sử
                addActionToHistory(
                    "score-miss",
                    "blue",
                    response.data.score,
                    `[MISS] Điểm xanh +${response.data.score} (Giám định: ${response.data.referrer})`,
                );
            }
            return;
        } else {
            // Lưu lịch sử
            if (response?.data?.score && response?.data?.referrer) {
                // Lưu lịch sử
                addActionToHistory(
                    "score",
                    "blue",
                    response.data.score,
                    `[REF] Điểm xanh +${response.data.score} (Giám định: ${response.data.referrer})`,
                );
            }
        }
        // Trigger hiệu ứng nháy cho RF tương ứng
        if (response && typeof response.data.referrer !== "undefined") {
            const { score, referrer } = response.data;
            const refIndex = Number(response.data.referrer) - 1; // 0 = RF1, 1 = RF2, ...
            // score => 1: nhảy vàng | 2: nhảy xanh lá | 3: nhảy đỏ

            // Bật hiệu ứng nháy
            setFlashingRefs((prev) => ({
                ...prev,
                blue: { ...prev.blue, [refIndex]: Number(score) - 1 },
            }));

            // Tắt hiệu ứng sau thời gian tính điểm
            const thoiGianTinhDiem = matchInfo.thoi_gian_tinh_diem || 1000; // ms
            setTimeout(() => {
                setFlashingRefs((prev) => ({
                    ...prev,
                    blue: { ...prev.blue, [refIndex]: -1 },
                }));
            }, thoiGianTinhDiem);
        }
    });
    // SCORE_RESULT
    useSocketEvent(MSG_TP_CLIENT.SCORE_RESULT, (response) => {
        //  Không nhận event khi đang nghỉ giải lao hoặc không chạy
        if (!isRunning || isBreakTime) {
            // tracking
            if (response?.data?.team == "red") {
                addActionToHistory(
                    "score-miss",
                    "red",
                    response.data.point,
                    `[SYS] Điểm đỏ +${response.data.point}) không hợp lệ`,
                );
            } else if (response?.data?.team == "blue") {
                addActionToHistory(
                    "score-miss",
                    "blue",
                    response.data.point,
                    `[SYS] Điểm xanh +${response.data.point}) không hợp lệ`,
                );
            }
            return;
        }
        if (response?.data?.team == "red") {
            redScoreRef.current += response.data.point;
            setRedScore(redScoreRef.current);

            // Phát âm thanh điểm số
            playScoreSound("red", response.data.point);

            // Nếu là điểm 3 (đòn chân) -> Hiển thị indicator
            if (response.data.point === 3) {
                triggerKickIndicator("red");
            }

            addActionToHistory(
                "score",
                "red",
                response.data.point,
                `[SYS] Điểm đỏ +${response.data.point}) hợp lệ`,
            );

            // Kiểm tra điểm tuyệt đối sau khi cập nhật điểm
            setTimeout(() => checkAbsoluteScore(), 100);
        } else if (response?.data?.team == "blue") {
            blueScoreRef.current += response.data.point;
            setBlueScore(blueScoreRef.current);

            // Phát âm thanh điểm số
            playScoreSound("blue", response.data.point);

            // Nếu là điểm 3 (đòn chân) -> Hiển thị indicator
            if (response.data.point === 3) {
                triggerKickIndicator("blue");
            }

            addActionToHistory(
                "score",
                "blue",
                response.data.point,
                `[SYS] Điểm xanh +${response.data.point}) hợp lệ`,
            );

            // Kiểm tra điểm tuyệt đối sau khi cập nhật điểm
            setTimeout(() => checkAbsoluteScore(), 100);
        }
    });

    // ========== Audio Initialization ==========

    // Khởi tạo audio khi component mount và khi có tương tác người dùng
    useEffect(() => {
        // Khởi tạo audio khi có click/keydown đầu tiên
        const handleUserInteraction = () => {
            initBellAudio();
            initVictoryAudio();
            initScoreAudios();
            initActionAudios();
            // Chỉ cần khởi tạo một lần
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
        };

        document.addEventListener("click", handleUserInteraction);
        document.addEventListener("keydown", handleUserInteraction);

        return () => {
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
        };
    }, []);

    // ========== Socket Connection Management ==========

    // Hàm khởi tạo socket connection
    const initSocket = async (forceReConnection = false) => {
        const connected = await initSocketUtil({
            dispatch,
            connectSocket,
            socket,
            role: "admin",
            onSuccess: () => {
                console.log(" Socket initialized successfully in Vovinam");
            },
            onError: (error) => {
                console.error(" Socket initialization failed:", error);
                showError(t("scoreboard.doikhang.socket_connection_error"));
            },
            forceReConnection: forceReConnection,
            disconnectSocket: disconnectSocket,
        });

        if (connected) {
            try {
                const savedRoom = localStorage.getItem("admin_room");
                if (savedRoom) {
                    const roomData = JSON.parse(savedRoom);
                    setCurrentRoom(roomData);
                    console.log("Loaded room from localStorage:", roomData);

                    await new Promise((resolve) => setTimeout(resolve, 300));

                    emitSocketEvent("REGISTER_ROOM_ADMIN", {
                        room_id: roomData.room_id,
                        uuid_desktop: roomData.uuid_desktop,
                        permission: 9,
                    });
                }
            } catch (error) {
                console.error("Error loading saved room:", error);
            }
        }
    };

    // Lắng nghe response từ server khi fetch danh sách thiết bị
    const serverIpHash = useRef();
    useSocketEvent("RES_ROOM_ADMIN", (response) => {
        if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
            const devices = Object.values(response.data.ls_conn);

            // Tìm admin_ip từ item có register_status_code === "ADMIN"
            const adminItem = devices.find(
                (ele) => ele?.register_status_code === "ADMIN",
            );
            const serverIp = adminItem?.admin_ip || "N/A";
            serverIpHash.current = IpMasker.mask(serverIp, "hash", 999, "Server");

            const transformedDevices = devices
                .filter(
                    (device) =>
                        device.register_status_code !== "ADMIN" ||
                        device?.client_ip != "::1",
                ) // Only judge devices
                .map((device, index) => ({
                    referrer: device.referrer,
                    device_name: device.device_name,
                    device_ip: device.client_ip || "N/A",
                    server_ip: serverIp, // Thêm server IP
                    server_ip_hash: serverIpHash.current, // Thêm server IP hash
                    connected: device.connect_status_code === "CONNECTED",
                    socket_id: device.socket_id,
                    room_id: device.room_id,
                    ready:
                        device.referrer != 0 && device.register_status_code === "CONNECTED",
                }));

            setReferrerDevices(transformedDevices);
        }
    });

    // Fetch devices khi mở Connection Manager Modal
    useEffect(() => {
        if (showConnectionModal) {
            console.log("Connection Manager Modal opened, fetching devices...");
            handleRefreshDevices();
        }
    }, [showConnectionModal]);

    // Connection Manager handlers
    const handleRefreshDevices = () => {
        console.log("Refreshing devices...");
        emitSocketEvent("ADMIN_FETCH_CONN", {});
    };

    const handleReconnect = (device) => {
        console.log("Reconnecting device:", device);
        // Implement reconnect logic if needed
    };

    const handleDisconnect = (device) => {
        console.log("Disconnecting device:", device);
        // Implement disconnect logic if needed
    };

    const generateQR = async () => {
        try {
            const savedRoom = localStorage.getItem("admin_room");
            if (!savedRoom) {
                showError(t("scoreboard.doikhang.room_not_found"));
                return null;
            }
            let roomData;
            try {
                roomData = JSON.parse(savedRoom);
            } catch (e) {
                console.error("Failed to parse admin_room from localStorage in QR method:", e);
                localStorage.removeItem("admin_room");
                showError(t("scoreboard.doikhang.connection_data_error"));
                return null;
            }

            let config = {
                method: "get",
                maxBodyLength: Infinity,
                baseURL: "http://localhost:6789/api/config/get-qr-active",
                params: {
                    room_id: roomData.room_id,
                },
            };

            const response = await axios.request(config);
            if (response.status == 200) {
                console.log("QR Code generated successfully");
                return response.data.data.base64QR;
            }
        } catch (error) {
            console.error("Error generating QR code:", error);
            showError(t("scoreboard.doikhang.qr_generation_error"));
            return null;
        }
    };

    const handleReConnectionSocket = async () => {
        const confirmReconnect = await showConfirm(
            t("scoreboard.doikhang.confirm_reconnect_socket"),
            {
                confirmText: t('common.confirm'),
                cancelText: t('common.cancel'),
            }
        );
        if (confirmReconnect) {
            await initSocket(true);
        }
    };

    const onSetPermissionRef = (input) => {
        const { referrer, socket_id, room_id } = input;
        emitSocketEvent("SET_PERMISSION_REF", {
            room_id: room_id ?? currentRoom.room_id,
            socket_id: socket_id,
            referrer: referrer.toString(),
            accepted: referrer == 0 ? "pending" : "approved",
            status: "active",
        });
    };

    // ========== End Socket Connection Management ==========

    // Function để lưu button permissions về server
    const saveButtonPermissions = async () => {
        try {
            const params = {
                hien_thi_button_ket_thuc: buttonPermissions?.hien_thi_button_ket_thuc
                    ? 1
                    : 0,
                hien_thi_button_diem_1: buttonPermissions?.hien_thi_button_diem_1
                    ? 1
                    : 0,
                hien_thi_button_diem_2: buttonPermissions?.hien_thi_button_diem_2
                    ? 1
                    : 0,
                hien_thi_button_diem_3: buttonPermissions?.hien_thi_button_diem_3
                    ? 1
                    : 0,
                hien_thi_button_diem_5: buttonPermissions?.hien_thi_button_diem_5
                    ? 1
                    : 0,
                hien_thi_button_diem_10: buttonPermissions?.hien_thi_button_diem_10
                    ? 1
                    : 0,
                hien_thi_button_nhac_nho: buttonPermissions?.hien_thi_button_nhac_nho
                    ? 1
                    : 0,
                hien_thi_button_canh_cao: buttonPermissions?.hien_thi_button_canh_cao
                    ? 1
                    : 0,
                hien_thi_button_don_chan: buttonPermissions?.hien_thi_button_don_chan
                    ? 1
                    : 0,
                hien_thi_button_bien: buttonPermissions?.hien_thi_button_bien ? 1 : 0,
                hien_thi_button_nga: buttonPermissions?.hien_thi_button_nga ? 1 : 0,
                hien_thi_button_y_te: buttonPermissions?.hien_thi_button_y_te ? 1 : 0,
                hien_thi_button_thang: buttonPermissions?.hien_thi_button_thang ? 1 : 0,
                hien_thi_button_quay_lai: buttonPermissions?.hien_thi_button_quay_lai
                    ? 1
                    : 0,
                hien_thi_button_reset: buttonPermissions?.hien_thi_button_reset ? 1 : 0,
                hien_thi_button_lich_su: buttonPermissions?.hien_thi_button_lich_su
                    ? 1
                    : 0,
                hien_thi_button_cau_hinh: buttonPermissions?.hien_thi_button_cau_hinh
                    ? 1
                    : 0,
                hien_thi_button_ket_thuc: buttonPermissions?.hien_thi_button_ket_thuc
                    ? 1
                    : 0,
                hien_thi_button_tran_tiep_theo:
                    buttonPermissions?.hien_thi_button_tran_tiep_theo ? 1 : 0,
                hien_thi_button_tran_truoc:
                    buttonPermissions?.hien_thi_button_tran_truoc ? 1 : 0,
                hien_thi_button_hiep_phu: buttonPermissions?.hien_thi_button_hiep_phu
                    ? 1
                    : 0,
                hien_thi_thong_tin_nhac_nho:
                    buttonPermissions?.hien_thi_thong_tin_nhac_nho ? 1 : 0,
                hien_thi_thong_tin_canh_cao:
                    buttonPermissions?.hien_thi_thong_tin_canh_cao ? 1 : 0,
                hien_thi_thong_tin_don_chan:
                    buttonPermissions?.hien_thi_thong_tin_don_chan ? 1 : 0,
                hien_thi_thong_tin_y_te: buttonPermissions?.hien_thi_thong_tin_y_te
                    ? 1
                    : 0,
                ui_theme: matchInfo.config_system?.ui_theme || 'default',
            };

            const response = await axios.post(
                "http://localhost:6789/api/config/update-config-system",
                params,
            );
            if (response.data.success) {
                console.log("Lưu button permissions thành công");
                addActionToHistory(
                    "config",
                    null,
                    0,
                    t("scoreboard.doikhang.update_config"),
                );
                return true;
            }
        } catch (error) {
            console.error("Lỗi khi lưu button permissions:", error);
            await showError(t("scoreboard.doikhang.save_config_error"));
            return false;
        }
    };

    // Hàm fetch dữ liệu competition để cập nhật VĐV thắng
    const fetchCompetitionData = useCallback(async () => {
        try {
            if (!matchInfo.competition_dk_id) return;

            const response = await axios.get(
                `http://localhost:6789/api/competition-dk/${matchInfo.competition_dk_id}`,
            );
            if (response?.data?.success && response?.data?.data) {
                const competitionData = response.data.data;

                // Tìm row tương ứng với trận đấu hiện tại
                if (competitionData.data && matchInfo.row_index !== undefined) {
                    const rowIndex = matchInfo.row_index + 1; // +1 vì row 0 là header
                    const rowData = competitionData.data[rowIndex];

                    if (rowData) {
                        // Cập nhật thông tin VĐV nếu có thay đổi
                        const newRedName = rowData[3] || "";
                        const newRedUnit = rowData[4] || "";
                        const newBlueName = rowData[6] || "";
                        const newBlueUnit = rowData[7] || "";

                        // Chỉ cập nhật nếu có thay đổi
                        setMatchInfo((prev) => {
                            const currentRedName = prev.red?.name || "";
                            const currentRedUnit = prev.red?.unit || "";
                            const currentBlueName = prev.blue?.name || "";
                            const currentBlueUnit = prev.blue?.unit || "";

                            if (
                                newRedName !== currentRedName ||
                                newRedUnit !== currentRedUnit ||
                                newBlueName !== currentBlueName ||
                                newBlueUnit !== currentBlueUnit
                            ) {
                                console.log("Đã cập nhật thông tin VĐV từ backend:", {
                                    red: { name: newRedName, unit: newRedUnit },
                                    blue: { name: newBlueName, unit: newBlueUnit },
                                });

                                return {
                                    ...prev,
                                    red: {
                                        ...prev.red,
                                        name: newRedName,
                                        unit: newRedUnit,
                                    },
                                    blue: {
                                        ...prev.blue,
                                        name: newBlueName,
                                        unit: newBlueUnit,
                                    },
                                };
                            }

                            return prev;
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching competition data:", error);
        } finally {
        }
    }, [matchInfo.competition_dk_id, matchInfo.row_index]);

    // Debug log và setup polling
    useEffect(() => {
        // Initialize socket connection
        initSocket();

        // Fetch logos và config từ API
        fetchLogos();

        // Fetch dữ liệu competition lần đầu
        fetchCompetitionData();

        // TODO: Gửi thông tin về server
        emitSocketEvent("DK_INFO", {
            match_id: matchData.match_id,
            match_no: t("scoreboard.doikhang.match_no") + " " + matchData.match_no,
            ten_giai_dau: matchData.ten_giai_dau,
            ten_mon_thi: matchData.ten_mon_thi,
            match_name: matchData.match_name,
            red: matchInfo?.red ?? { name: "", unit: "" },
            blue: matchInfo?.blue ?? { name: "", unit: "" },
            round:
                currentRound > (matchInfo.so_hiep || 3)
                    ? `Hiệp phụ ${currentRound - (matchInfo.so_hiep || 3)}`
                    : `Hiệp ${currentRound}`,
        });

        // Load current room with try/catch for safety
        const savedRoom = localStorage.getItem("admin_room");
        if (savedRoom) {
            try {
                const roomData = JSON.parse(savedRoom);
                setCurrentRoom(roomData);
            } catch (error) {
                console.error("Failed to parse admin_room from localStorage:", error);
                localStorage.removeItem("admin_room"); // clear corrupted data
            }
        }

        // Fetch devices list
        emitSocketEvent("ADMIN_FETCH_CONN", {});

        // Setup polling để cập nhật dữ liệu mỗi 5 giây
        const pollingInterval = setInterval(() => {
            fetchCompetitionData();
        }, 5000); // 5 giây

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            clearInterval(pollingInterval);
        };
    }, []);

    // F2 hotkey listener - Toggle secondary display window (Electron)
    useEffect(() => {
        const handleKeyPress = async (event) => {
            if (event.key === "F2") {
                event.preventDefault();

                // Toggle secondary display window
                if (!showSecondaryDisplay) {
                    // Mở cửa sổ mới
                    if (window.electron && window.electron.openSecondaryDisplay) {
                        const result = await window.electron.openSecondaryDisplay({
                            matchInfo: matchInfo,
                            redScore: redScore,
                            blueScore: blueScore,
                            timeLeft: timeLeft,
                            currentRound: currentRound,
                            isRunning: isRunning,
                            isBreakTime: isBreakTime,
                            isMedicalTime: isMedicalTime,
                            lsLogo: lsLogo,
                            flashingRefs: flashingRefs,
                            remindRed: remindRed,
                            remindBlue: remindBlue,
                            warnRed: warnRed,
                            warnBlue: warnBlue,
                            kickRed: kickRed,
                            kickBlue: kickBlue,
                            medicalRed: medicalRed,
                            medicalBlue: medicalBlue,
                            medicalBlue: medicalBlue,
                            buttonPermissions: buttonPermissions,
                            configSystem: matchInfo.config_system, // Gửi configSystem riêng biệt
                            showRedKickIndicator: showRedKickIndicator,
                            showBlueKickIndicator: showBlueKickIndicator,
                            screenType: "doikhang",
                        });
                        console.log("🖥️ Secondary display opened:", result);
                        setShowSecondaryDisplay(true);
                    }
                } else {
                    // Đóng cửa sổ
                    if (window.electron && window.electron.closeSecondaryDisplay) {
                        const result = await window.electron.closeSecondaryDisplay();
                        console.log("🖥️ Secondary display closed:", result);
                        setShowSecondaryDisplay(false);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [
        showSecondaryDisplay,
        matchInfo,
        redScore,
        blueScore,
        timeLeft,
        currentRound,
        isRunning,
        isBreakTime,
        isMedicalTime,
        lsLogo,
        flashingRefs,
        remindRed,
        remindBlue,
        warnRed,
        warnBlue,
        kickRed,
        kickBlue,
        medicalRed,
        medicalBlue,
        buttonPermissions,
    ]);

    // Update secondary display when data changes
    useEffect(() => {
        if (
            showSecondaryDisplay &&
            window.electron &&
            window.electron.updateSecondaryDisplay
        ) {
            const dataToUpdate = {
                matchInfo: matchInfo,
                redScore: redScore,
                blueScore: blueScore,
                timeLeft: timeLeft,
                currentRound: currentRound,
                isRunning: isRunning,
                isBreakTime: isBreakTime,
                breakTimeLeft: breakTimeLeft,
                isMedicalTime: isMedicalTime,
                medicalTimeLeft: medicalTimeLeft,
                medicalTeam: medicalTeam,
                ready: ready,
                pauseMatch: pauseMatch,
                lsLogo: lsLogo,
                flashingRefs: flashingRefs,
                remindRed: remindRed,
                remindBlue: remindBlue,
                warnRed: warnRed,
                warnBlue: warnBlue,
                kickRed: kickRed,
                kickBlue: kickBlue,
                medicalRed: medicalRed,
                medicalBlue: medicalBlue,
                buttonPermissions: buttonPermissions,
                configSystem: matchInfo.config_system, // Gửi configSystem riêng biệt
                announcedWinner: announcedWinner,
                showRedKickIndicator: showRedKickIndicator,
                showBlueKickIndicator: showBlueKickIndicator,
                screenType: "doikhang",
            };
            console.log("🔄 [DoiKhang] Updating secondary display:", dataToUpdate);
            window.electron.updateSecondaryDisplay(dataToUpdate);
        }
    }, [
        showSecondaryDisplay,
        matchInfo,
        redScore,
        blueScore,
        timeLeft,
        currentRound,
        isRunning,
        isBreakTime,
        breakTimeLeft,
        isMedicalTime,
        medicalTimeLeft,
        medicalTeam,
        ready,
        pauseMatch,
        lsLogo,
        flashingRefs,
        remindRed,
        remindBlue,
        warnRed,
        warnBlue,
        kickRed,
        kickBlue,
        medicalRed,
        medicalBlue,
        buttonPermissions,
        announcedWinner,
        showRedKickIndicator,
        showBlueKickIndicator,
    ]);

    // Ref để lưu các handlers (tránh stale closure)
    const handlersRef = useRef({});

    // Update handlers ref mỗi khi các function thay đổi
    useEffect(() => {
        handlersRef.current = {
            toggleTimer,
            undoLastAction,
            handleScoreChange,
            handleRemind,
            handleWarn,
            handleWinner,
            handleMedical,
            resetTimer,
            setRedScore,
            setBlueScore,
            isBreakTime,
            btnPreviousMatch,
            btnNextMatch,
            handleKick,
            handleStopMedical,
        };
    });

    // Tự động tạm dừng timer khi mở modal hoặc đã chọn winner
    useEffect(() => {
        const shouldPause =
            showConnectionModal ||
            showConfigModal ||
            showHistoryModal ||
            showWinnerModal ||
            announcedWinner !== null;

        // CHỈ TẠM DỪNG, KHÔNG TỰ ĐỘNG RESUME
        if (shouldPause && isRunning && !isMedicalTime) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            console.log("⏸️ Timer tạm dừng do mở modal hoặc đã chọn winner");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showConfigModal, showHistoryModal, showWinnerModal, announcedWinner]);

    // State cho chế độ bàn phím — đọc từ configSystem đã lưu
    const [keyboardMode, setKeyboardMode] = useState(
        matchInfo.config_system?.keyboard_mode || "vovinam"
    );
    const [showKeyboardModeToast, setShowKeyboardModeToast] = useState(false);

    // Sync keyboardMode khi config_system thay đổi (ví dụ chuyển trận)
    useEffect(() => {
        const savedMode = matchInfo.config_system?.keyboard_mode;
        if (savedMode && KEYBOARD_MODES[savedMode]) {
            setKeyboardMode(savedMode);
        }
    }, [matchInfo.config_system?.keyboard_mode]);

    // Hotkey handler - sử dụng keyboardConfig
    useEffect(() => {
        const handleKeyDown = createKeyDownHandler({
            mode: keyboardMode,
            onlineFeatures: features,
            localConfig: matchInfo.config_system, // Ghi đè phím từ config_system
            handlers: handlersRef,
            showConfirm,
            btnGoBack,
            setShowConnectionModal,
            setShowConfigModal,
            setShowHistoryModal,
            setShowControlBar,
            onSwitchMode: () => {
                setKeyboardMode((prev) => {
                    const next = getNextMode(prev);
                    console.log(`⌨️ Chuyển chế độ bàn phím: ${prev} → ${next}`);
                    // Hiện toast thông báo
                    setShowKeyboardModeToast(true);
                    setTimeout(() => setShowKeyboardModeToast(false), 2000);
                    return next;
                });
            },
            showConfigModal,
            showHistoryModal,
            showConnectionModal,
            setShowMatchListModal,
            setIsSoundEnabled,
            setShowSecondaryDisplay,
        });

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showConfigModal, showHistoryModal, showConnectionModal, keyboardMode]);

    // Hiển thị kết quả khi quay lại trận đã kết thúc
    useEffect(() => {
        if (
            showPreviousResult &&
            matchInfo.previous_status === "FIN" &&
            matchInfo.previous_winner
        ) {
            // Delay để đảm bảo component đã render xong
            const timer = setTimeout(() => {
                const winner = matchInfo.previous_winner;
                const scores = matchInfo.previous_scores || { red: 0, blue: 0 };

                // Set điểm số
                setRedScore(scores.red);
                setBlueScore(scores.blue);
                redScoreRef.current = scores.red;
                blueScoreRef.current = scores.blue;

                // Tạo winner data
                const winnerData = {
                    team: winner,
                    name: winner === "red" ? matchInfo.red.name : matchInfo.blue.name,
                    score: winner === "red" ? scores.red : scores.blue,
                    teamName: winner === "red" ? matchInfo.red.unit : matchInfo.blue.unit,
                };

                // Hiển thị animation thắng
                setAnnouncedWinner(winnerData);

                console.log(" Hiển thị kết quả trận đã kết thúc:", winnerData);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [
        showPreviousResult,
        matchInfo.previous_status,
        matchInfo.previous_winner,
        matchInfo.previous_scores,
    ]);

    // Update time when config changes
    useEffect(() => {
        setTimeLeft((matchInfo.thoi_gian_thi_dau || 180) * 10);
    }, [matchInfo.thoi_gian_thi_dau]);

    // Reset if rounds exceed config
    useEffect(() => {
        if (currentRound > (matchInfo.so_hiep || 3)) {
            setCurrentRound(1);
            resetTimer();
        }
    }, [matchInfo.so_hiep]);

    // TẮT BUTTON ĐIỂM KHI isBreakTime = true
    useEffect(() => {
        if (isBreakTime) {
            // thực hiện vô hiệu hoá nút
            setDisableRedButtons(true);
            setDisableBlueButtons(true);
        } else {
            setDisableRedButtons(false);
            setDisableBlueButtons(false);
        }
    }, [isBreakTime]);

    // Hotkeys (từ Timer.jsx) - Đã chuyển vào useEffect handleKeyDown bên dưới
    // useHotkeys("space", (e) => {
    //   e.preventDefault();
    //   if (isBreakTime) return;
    //   toggleTimer();
    // });

    // // Hotkey Ctrl+Z để undo
    // useHotkeys("ctrl+z", (e) => {
    //   e.preventDefault();
    //   if (isBreakTime) return;
    //   undoLastAction();
    // });

    // Hotkey F7 để hiển thị danh sách trận đấu
    // useHotkeys("f7", (e) => {
    //   e.preventDefault();
    //   fetchMatchesList();
    //   setShowMatchListModal(true);
    // });

    // Fetch danh sách trận đấu
    const fetchMatchesList = async () => {
        try {
            const competition_dk_id =
                matchInfo.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
            if (!competition_dk_id) {
                console.warn("Không tìm thấy competition_dk_id");
                return;
            }

            const response = await axios.get(
                `http://localhost:6789/api/competition-match/by-dk/${competition_dk_id}`,
            );

            if (response.data.success) {
                const matches = response.data.data.map((match) => ({
                    id: match.id,
                    match_no: match.match_no,
                    red_name: match.red_name,
                    red_unit: match.red_unit || "",
                    red_country: match.red_country || "vietnam",
                    blue_name: match.blue_name,
                    blue_unit: match.blue_unit || "",
                    blue_country: match.blue_country || "vietnam",
                    status: match.status || "PENDING", // PENDING, ONGOING, FINISHED
                    match_name: match.match_name || "",
                    team_name: match.team_name || "",
                    winner: match.winner || null, // "RED" | "BLUE" | null
                }));
                setMatchesList(matches);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách trận đấu:", error);
        }
    };

    // Handler khi chọn trận từ modal
    const handleSelectMatch = (match) => {
        console.log("Đã chọn trận:", match);
    };

    // Handler khi bắt đầu/xem trận từ modal
    const handleStartMatch = async (match) => {
        try {
            console.log("Bắt đầu trận:", match);

            // Cập nhật trạng thái trong modal ngay lập tức
            setMatchesList((prevMatches) =>
                prevMatches.map((m) =>
                    m.id === match.id ? { ...m, status: "ONGOING" } : m,
                ),
            );

            // Cập nhật status trong database
            await axios.put(
                `http://localhost:6789/api/competition-match/${match.id}/status`,
                { status: "ONGOING" },
            );

            // Lấy competition_dk_id
            const competition_dk_id =
                matchInfo.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
            if (!competition_dk_id) {
                await showError(t("scoreboard.doikhang.competition_not_found"));
                return;
            }

            // Lấy dữ liệu sheet
            const sheetResponse = await axios.get(
                `http://localhost:6789/api/competition-dk/${competition_dk_id}`,
            );
            const competitionDkData = sheetResponse?.data?.data;
            if (!sheetResponse?.data?.success || !competitionDkData) {
                await showError(t("scoreboard.doikhang.load_match_data_error"));
                return;
            }

            // Tìm row tương ứng với match_no
            const targetRow = competitionDkData?.data[match.match_no];
            if (!targetRow) {
                await showError(t("scoreboard.doikhang.match_data_not_found"));
                return;
            }

            // Lấy thông tin match từ database để có config_system
            const matchResponse = await axios.get(
                `http://localhost:6789/api/competition-match/${match.id}`,
            );
            const matchFromDB = matchResponse?.data?.data;

            // Lấy config_system mặc định từ hệ thống nếu cần
            let configSystem = matchFromDB?.config_system || matchData.config_system;

            // Nếu không có config_system, lấy từ API
            if (!configSystem || Object.keys(configSystem).length === 0) {
                try {
                    const configResponse = await axios.post(
                        "http://localhost:6789/api/config/get-config-system",
                    );
                    if (configResponse?.data) {
                        configSystem = configResponse.data;
                        console.log(" Loaded default config_system from API");
                    }
                } catch (configError) {
                    console.warn(" Could not load default config_system:", configError);
                    configSystem = {}; // Fallback to empty object
                }
            }

            // Tạo matchData mới với đầy đủ thông tin
            const newMatchData = {
                match_id: match.id,
                match_no: match.match_no,
                competition_dk_id: competition_dk_id,
                ten_giai_dau: competitionDkData.ten_giai_dau,
                ten_mon_thi: competitionDkData.ten_mon_thi,
                match_name: match.match_name,
                match_type: targetRow[2] || "DK",
                match_weight: targetRow[1] || "",
                match_level: targetRow[9] || "",
                red: {
                    name: match.red_name || targetRow[3] || "",
                    unit: match.red_unit || targetRow[4] || "",
                    country: match.red_country || targetRow[5] || "vietnam",
                },
                blue: {
                    name: match.blue_name || targetRow[6] || "",
                    unit: match.blue_unit || targetRow[7] || "",
                    country: match.blue_country || targetRow[8] || "vietnam",
                },
                // Sử dụng config_system đã lấy được
                config_system: configSystem,
                match_status: "ONGOING", // Đã cập nhật status
                row_index: match.match_no,
            };

            console.log("🚀 Navigating to match with data:", newMatchData);

            // Navigate với state mới
            navigate("/bang-diem/doi-khang", {
                state: { matchData: newMatchData, returnUrl },
                replace: true,
            });

            // Reload trang để load trận mới
            window.location.reload();
        } catch (error) {
            console.error("Lỗi khi chuyển trận:", error);
            await showError(t("scoreboard.doikhang.switch_match_error"));
        }
    };

    // Fetch logos từ API
    const fetchLogos = async () => {
        try {
            const response = await axios.get(
                "http://localhost:6789/api/config/logos",
            );
            if (response.data.success) {
                setLsLogo(response.data.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách logos:", error);
            // Fallback về logos mặc định nếu API lỗi
            setLsLogo([
                {
                    id: 1,
                    url: "https://vovinambinhtan.com/upload/hinhanh/logovovi-1486.png",
                    position: 0,
                },
            ]);
        }
    };

    // tạo gdData từ cấu hình hệ điểm và số giám định
    const generateGdData = () => {
        const soGiamDinh = matchInfo.config_system?.so_giam_dinh || matchInfo.so_giam_dinh || 3;
        const heDiem = matchInfo.config_system?.he_diem || matchInfo.he_diem || 2;
        const gdData = [];
        for (let i = 0; i < heDiem; i++) {
            const row = [];
            for (let j = 0; j < soGiamDinh; j++) {
                row.push(`${t('scoreboard.doikhang.referrer_name')}${j + 1}`);
            }
            gdData.push(row);
        }
        return gdData;
    };

    // Format time với 0.1 giây - trả về object để hiển thị với font size khác nhau
    const formatTime = (timeInTenths) => {
        const totalSeconds = Math.floor(timeInTenths / 10);
        const tenths = timeInTenths % 10;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return {
            main: `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`,
            decimal: `.${tenths}`,
        };
    };

    // Start break time (từ Timer.jsx)
    const startBreakTime = () => {
        setIsBreakTime(true);
        setBreakTimeLeft((matchInfo.thoi_gian_nghi || 60) * 10); // Lưu theo 0.1s
        setIsRunning(true);

        timerRef.current = setInterval(() => {
            setBreakTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIsBreakTime(false);
                    setIsRunning(false);

                    // Hết thời gian giải lao - Phát chuông
                    playBell();

                    setCurrentRound(currentRound + 1);
                    setShowRedKickIndicator(false);
                    setShowBlueKickIndicator(false);

                    const totalMainRounds = matchInfo.so_hiep || 3;
                    const nextRound = currentRound + 1;

                    // Set thời gian cho hiệp tiếp theo (theo 0.1s)
                    if (nextRound > totalMainRounds) {
                        setTimeLeft((matchInfo.thoi_gian_hiep_phu || 60) * 10);
                    } else {
                        setTimeLeft((matchInfo.thoi_gian_thi_dau || 180) * 10);
                    }

                    isHandlingRound.current = false;
                    return 0;
                }
                return prev - 1;
            });
        }, 100); // 100ms = 0.1s
    };

    // Hanlde history
    const handleSaveHistory = () => {
        setReady(true);
        // Sử dụng refs để lấy điểm số mới nhất
        const currentRedScore = redScoreRef.current;
        const currentBlueScore = blueScoreRef.current;

        // TODO: Gọi API để lưu history
        const item_round = {
            match_id: matchInfo.match_id,
            round: currentRound,
            round_type: currentRound <= (matchInfo.so_hiep || 3) ? "main" : "extra",
            blue: {
                ten: matchInfo.blue?.name || "VĐV XANH",
                don_vi: matchInfo.blue?.unit || "",
                quoc_gia: matchInfo.blue?.country || "vietname",
                round: {
                    score: currentBlueScore, // điểm
                    remind: remindBlue, // nhác nhở
                    warn: warnBlue, // cảnh cáo
                    mins: 0, // trừ điểm
                    incr: 0, // cộng điểm
                    ref_log: [],
                },
                match: {
                    score: currentBlueScore,
                    remind: 0,
                    warn: 0,
                },
            },
            red: {
                ten: matchInfo.red?.name || "VĐV ĐỎ",
                don_vi: matchInfo.red?.unit || "",
                quoc_gia: matchInfo.red?.country || "vietname",
                round: {
                    score: currentRedScore, // điểm
                    remind: remindRed, // nhác nhở
                    warn: warnRed, // cảnh cáo
                    mins: 0, // trừ điểm
                    incr: 0, // cộng điểm
                    ref_log: [],
                },
                match: {
                    score: currentRedScore,
                    remind: 0,
                    warn: 0,
                },
            },
        };
        setRoundHistory([...roundHistory, item_round]);
    };

    // Handle round complete (từ Timer.jsx)
    const handleRoundComplete = () => {
        if (isHandlingRound.current) return;

        isHandlingRound.current = true;

        clearInterval(timerRef.current);

        // Kết thúc hiệp - Phát chuông
        playBell();

        const totalMainRounds = matchInfo.so_hiep || 3;
        const extraRounds = matchInfo.so_hiep_phu || 0;
        const totalRounds = totalMainRounds + extraRounds;

        // Lưu history sau mỗi hiệp
        handleSaveHistory();

        // Sử dụng refs để lấy điểm số mới nhất
        const currentRedScore = redScoreRef.current;
        const currentBlueScore = blueScoreRef.current;
        if (currentRound < totalMainRounds) {
            // Vẫn còn hiệp chính -> nghỉ giữa hiệp
            startBreakTime();
        } else if (currentRound === totalMainRounds && extraRounds > 0) {
            // Kết thúc hiệp chính, có hiệp phụ
            //  FIX: Kiểm tra điểm trước khi quyết định chạy hiệp phụ
            if (currentRedScore === currentBlueScore) {
                // Điểm hòa -> Chạy hiệp phụ
                console.log(
                    `Kết thúc hiệp ${currentRound}: Điểm hòa ${currentRedScore}-${currentBlueScore} -> Chạy hiệp phụ`,
                );
                startBreakTime();
            } else {
                // Đã có người thắng -> Kết thúc trận luôn
                console.log(
                    `${t("scoreboard.doikhang.end_match")} ${currentRound}: ${currentRedScore > currentBlueScore ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team")} ${t("scoreboard.doikhang.winner")} ${currentRedScore}-${currentBlueScore}`,
                );
                setIsRunning(false);
                isHandlingRound.current = false;
                btnFinishMatch(currentRedScore, currentBlueScore);
            }
        } else if (currentRound < totalRounds) {
            // Đang trong hiệp phụ (không phải hiệp phụ cuối) -> nghỉ giữa các hiệp phụ
            startBreakTime();
        } else {
            // Kết thúc tất cả hiệp
            setIsRunning(false);
            isHandlingRound.current = false;
            btnFinishMatch(currentRedScore, currentBlueScore);
        }
        // TODO: Gửi thông tin về server
        emitSocketEvent("DK_INFO", {
            match_id: matchData.match_id,
            match_no: "Trận " + matchData.match_no,
            ten_giai_dau: matchData.ten_giai_dau,
            ten_mon_thi: matchData.ten_mon_thi,
            match_name: matchData.match_name,
            red: matchInfo?.red ?? { name: "", unit: "" },
            blue: matchInfo?.blue ?? { name: "", unit: "" },
            round:
                currentRound > (matchInfo.so_hiep || 3)
                    ? `Hiệp phụ ${currentRound - (matchInfo.so_hiep || 3)}`
                    : `Hiệp ${currentRound}`,
        });
    };

    // Toggle timer (từ Timer.jsx)
    const toggleTimer = async () => {
        // Tránh gọi trùng lặp
        if (isTogglingTimer.current) return;
        isTogglingTimer.current = true;

        try {
            // Không cho phép start/pause khi đang trong thời gian y tế
            if (isMedicalTime) {
                await showError(
                    t("scoreboard.doikhang.medical_error"),
                );
                return;
            }

            // kiếm tra có vận động viên thắng không nếu có thì hiển thị thông báo
            if (announcedWinner) {
                const confirmed = await showConfirm(
                    t("scoreboard.doikhang.continue_match_with_result"),
                    {
                        title: t("scoreboard.doikhang.notification"),
                        confirmText: t('common.confirm'),
                        cancelText: t('common.cancel'),
                    },
                );
                if (confirmed === false) return;
                setAnnouncedWinner(null);
                // cập nhật lại thông trạng thái
                const currentStatus = matchInfo.match_status;
                if (currentStatus === "FIN") {
                    try {
                        // xoá history trước đó
                        // tạo thông tin trận
                        console.log("🔄 Cập nhật trạng thái từ FIN → IN");
                        await axios.put(
                            `http://localhost:6789/api/competition-match/${matchInfo.match_id}/status`,
                            {
                                status: "IN",
                                winner: "none",
                            },
                        );
                        // Cập nhật matchInfo
                        setMatchInfo({ ...matchInfo, match_status: "IN" });
                        console.log(" Đã cập nhật trạng thái thành IN");
                    } catch (error) {
                        console.error(" Lỗi khi cập nhật trạng thái:", error);
                        await showError(
                            "Lỗi khi cập nhật trạng thái trận đấu: " +
                            (error.response?.data?.message || error.message),
                        );
                        return; // Dừng lại nếu lỗi
                    }
                }
            }
            setReady(false);
            setPauseMatch(false);
            const totalMainRounds = matchInfo.so_hiep || 3;
            const extraRounds = matchInfo.so_hiep_phu || 0;
            const totalRounds = totalMainRounds + extraRounds;
            if (currentRound === totalRounds && timeLeft === 0) {
                return;
            }

            // Kiểm tra match_status nếu trạng thái = 'WAI' thì gọi API cập nhật trạng thái 'IN'
            if (!isRunning && !isBreakTime) {
                const currentStatus = matchInfo.match_status;
                if (currentStatus === "WAI") {
                    try {
                        console.log("🔄 Cập nhật trạng thái từ WAI → IN");
                        await axios.put(
                            `http://localhost:6789/api/competition-match/${matchInfo.match_id}/status`,
                            {
                                status: "IN",
                            },
                        );
                        // Cập nhật matchInfo
                        setMatchInfo({ ...matchInfo, match_status: "IN" });
                        console.log(" Đã cập nhật trạng thái thành IN");
                    } catch (error) {
                        console.error(" Lỗi khi cập nhật trạng thái:", error);
                        await showError(
                            "Lỗi khi cập nhật trạng thái trận đấu: " +
                            (error.response?.data?.message || error.message),
                        );
                        return; // Dừng lại nếu lỗi
                    }
                }
            }

            if (isBreakTime) {
                if (isRunning) {
                    clearInterval(timerRef.current);
                    setIsRunning(false);
                } else {
                    setIsRunning(true);
                    timerRef.current = setInterval(() => {
                        setBreakTimeLeft((prev) => {
                            if (prev <= 1) {
                                clearInterval(timerRef.current);
                                setIsBreakTime(false);
                                setIsRunning(false);

                                // Hết thời gian giải lao - Phát chuông
                                playBell();

                                const nextRound = currentRound + 1;
                                setCurrentRound(nextRound);

                                // Nếu hiệp tiếp theo là hiệp phụ (> so_hiep), dùng thời gian hiệp phụ (theo 0.1s)
                                if (nextRound > totalMainRounds) {
                                    setTimeLeft((matchInfo.thoi_gian_hiep_phu || 60) * 10);
                                } else {
                                    setTimeLeft((matchInfo.thoi_gian_thi_dau || 180) * 10);
                                }

                                isHandlingRound.current = false;
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 100); // 100ms = 0.1s
                }
            } else {
                if (isRunning) {
                    clearInterval(timerRef.current);
                    setIsRunning(false);
                } else {
                    // Bắt đầu hiệp - Chỉ phát chuông khi mới bắt đầu hiệp đấu
                    const rMaxTime =
                        currentRound > totalMainRounds
                            ? (matchInfo.thoi_gian_hiep_phu || 60) * 10
                            : (matchInfo.thoi_gian_thi_dau || 180) * 10;
                    if (timeLeft === rMaxTime) {
                        playBell();
                    }

                    setIsRunning(true);
                    timerRef.current = setInterval(() => {
                        setTimeLeft((prev) => {
                            if (prev <= 1) {
                                handleRoundComplete();
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 100); // 100ms = 0.1s
                }
            }
        } finally {
            isTogglingTimer.current = false;
        }
    };

    // Get status text (từ Timer.jsx)
    const getStatusText = () => {
        const totalMainRounds = matchInfo.so_hiep || 3;
        const extraRounds = matchInfo.so_hiep_phu || 0;
        const totalRounds = totalMainRounds + extraRounds;

        if (currentRound === totalRounds && timeLeft === 0) {
            return t("scoreboard.doikhang.match_finished");
        }
        if (isBreakTime) {
            return t("scoreboard.common.rest_period");
        }
        return isRunning ? t("scoreboard.doikhang.match_in_progress") : t("scoreboard.doikhang.match_paused");
    };

    // Hàm tracking action
    const addActionToHistory = (actionType, team, value, description) => {
        const action = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            time: formatTime(timeLeft).main + formatTime(timeLeft).decimal,
            round: currentRound,
            actionType, // 'score', 'remind', 'warn', 'kick', 'medical', 'timer', 'winner'
            team, // 'red', 'blue', 'both', null
            value, // số điểm thay đổi
            description, // mô tả chi tiết
            redScore,
            blueScore,
            remindRed,
            remindBlue,
            warnRed,
            warnBlue,
            kickRed,
            kickBlue,
        };
        setActionHistory((prev) => [action, ...prev]);
    };

    // Hàm undo action cuối
    const undoLastAction = () => {
        if (actionHistory.length === 0) return;

        const lastAction = actionHistory[0];

        // Restore state từ action trước đó
        if (lastAction.actionType === "score") {
            if (lastAction.team === "red") {
                setRedScore((prev) => {
                    const newScore = prev - lastAction.value;
                    redScoreRef.current = newScore;
                    return newScore;
                });
            } else {
                setBlueScore((prev) => {
                    const newScore = prev - lastAction.value;
                    blueScoreRef.current = newScore;
                    return newScore;
                });
            }
        } else if (lastAction.actionType === "remind") {
            if (lastAction.team === "red") {
                setRemindRed((prev) => Math.max(0, prev - lastAction.value));
            } else {
                setRemindBlue((prev) => Math.max(0, prev - lastAction.value));
            }
        } else if (lastAction.actionType === "warn") {
            if (lastAction.team === "red") {
                setWarnRed((prev) => Math.max(0, prev - lastAction.value));
            } else {
                setWarnBlue((prev) => Math.max(0, prev - lastAction.value));
            }
        } else if (lastAction.actionType === "kick") {
            if (lastAction.team === "red") {
                setKickRed((prev) => Math.max(0, prev - lastAction.value));
            } else {
                setKickBlue((prev) => Math.max(0, prev - lastAction.value));
            }
        }

        // Xóa action khỏi history
        setActionHistory((prev) => prev.slice(1));
    };

    // Hàm kiểm tra điểm tuyệt đối
    const checkAbsoluteScore = () => {
        // Kiểm tra cấu hình có bật tính điểm tuyệt đối không
        const isAbsoluteScoreEnabled =
            matchInfo.config_system?.cau_hinh_tinh_diem_tuyet_doi;
        if (!isAbsoluteScoreEnabled) {
            return; // Không bật tính năng này
        }

        const khoangDiemTuyetToi =
            matchInfo.config_system?.khoang_diem_tuyet_toi || 10;
        const currentRedScore = redScoreRef.current;
        const currentBlueScore = blueScoreRef.current;
        const scoreDiff = Math.abs(currentRedScore - currentBlueScore);

        // Nếu chênh lệch điểm >= khoang_diem_tuyet_toi
        if (scoreDiff >= khoangDiemTuyetToi) {
            const winner = currentRedScore > currentBlueScore ? "red" : "blue";
            const winnerName =
                winner === "red" ? matchInfo.red.name : matchInfo.blue.name;
            const winnerScore = winner === "red" ? currentRedScore : currentBlueScore;
            const winnerTeamName =
                winner === "red" ? matchInfo.red.unit : matchInfo.blue.unit;

            console.log(
                `🏆 ĐIỂM TUYỆT ĐỐI: Chênh lệch ${scoreDiff} điểm >= ${khoangDiemTuyetToi} → ${winnerName} thắng tuyệt đối!`,
            );

            // Dừng timer
            if (isRunning) {
                clearInterval(timerRef.current);
                setIsRunning(false);
            }

            // Tạo winner data
            const winnerData = {
                team: winner,
                name: winnerName,
                score: winnerScore,
                teamName: winnerTeamName,
            };

            // Phát âm thanh chiến thắng
            playVictory();

            // Hiển thị modal công bố người thắng
            setAnnouncedWinner(winnerData);
            setShowWinnerAnnouncementModal(true);
            setPauseMatch(true);

            // Lưu lịch sử
            addActionToHistory(
                "winner",
                winner,
                0,
                `[SYS] ${winnerName} thắng tuyệt đối (chênh lệch ${scoreDiff} điểm)`,
            );
        }
    };

    // Hàm xử lý điểm số
    const handleScoreChange = (team, value) => {
        const teamName = team === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        const action = value > 0 ? `+${value}` : `${value}`;

        if (team === "red") {
            setRedScore((prev) => {
                const newScore = Math.max(-99, prev + value);
                redScoreRef.current = newScore; // Cập nhật ref
                return newScore;
            });
        } else {
            setBlueScore((prev) => {
                const newScore = Math.max(-99, prev + value);
                blueScoreRef.current = newScore; // Cập nhật ref
                return newScore;
            });
        }

        addActionToHistory("score", team, value, `[BTN] ${teamName} ${action}`);

        // Kiểm tra điểm tuyệt đối sau khi cập nhật điểm
        setTimeout(() => checkAbsoluteScore(), 100);
    };

    // Hàm xử lý nhắc nhở
    const handleRemind = (team, value) => {
        const teamName = team === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        const action = value > 0 ? "+" : "-";

        // Phát âm thanh Nhắc nhở (chỉ khi +1)
        if (value > 0) {
            playActionSound(team, "remind");
        }

        if (team === "red") {
            setRemindRed((prev) => Math.max(0, prev + value));
        } else {
            setRemindBlue((prev) => Math.max(0, prev + value));
        }

        addActionToHistory(
            "remind",
            team,
            value,
            `[BTN] ${teamName} Nhắc nhở ${action}1`,
        );
    };

    // Hàm xử lý cảnh cáo
    const handleWarn = (team, value) => {
        const teamName = team === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        const action = value > 0 ? "+" : "-";

        // Phát âm thanh Cảnh cáo (chỉ khi +1)
        if (value > 0) {
            playActionSound(team, "warn");
        }

        if (team === "red") {
            setWarnRed((prev) => Math.max(0, prev + value));
        } else {
            setWarnBlue((prev) => Math.max(0, prev + value));
        }

        addActionToHistory(
            "warn",
            team,
            value,
            `[BTN] ${teamName} Cảnh cáo ${action}1`,
        );
    };

    // Hàm xử lý công nhận đòn chân
    const handleKick = (team, value) => {
        const teamName = team === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        const action = value > 0 ? "+" : "-";

        if (team === "red") {
            setKickRed((prev) => Math.max(0, prev + value));
        } else {
            setKickBlue((prev) => Math.max(0, prev + value));
        }

        if (value > 0) {
            triggerKickIndicator(team, true);
        } else if (value < 0) {
            triggerKickIndicator(team, false);
        }

        addActionToHistory(
            "kick",
            team,
            value,
            `[BTN] ${teamName} Đòn chân ${action}1`,
        );
    };

    // Hàm xử lý Biên (áp dụng theo cấu hình)
    const handleBien = (team) => {
        const teamName = team === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        const opponentTeam = team === "red" ? "blue" : "red";
        const opponentTeamName = opponentTeam === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");

        // Phát âm thanh Biên
        playActionSound(team, "outline");

        // Lấy cấu hình điểm biên
        const apDungDiemBienTru = matchInfo.config_system?.ap_dung_diem_bien_tru;
        const apDungDiemBienCong = matchInfo.config_system?.ap_dung_diem_bien_cong;
        const diemBienTru = parseInt(matchInfo.config_system?.diem_bien_tru || 1);
        const diemBienCong = parseInt(matchInfo.config_system?.diem_bien_cong || 1);

        let historyMessage = "";

        // TH1: Ưu tiên điểm trừ nếu cả 2 cùng bật
        if (apDungDiemBienTru) {
            // Trừ điểm VĐV ra biên
            if (team === "red") {
                setRedScore((prev) => {
                    const newScore = Math.max(-99, prev - diemBienTru);
                    redScoreRef.current = newScore;
                    return newScore;
                });
            } else {
                setBlueScore((prev) => {
                    const newScore = Math.max(-99, prev - diemBienTru);
                    blueScoreRef.current = newScore;
                    return newScore;
                });
            }
            historyMessage = `[BTN] ${teamName} Biên: -${diemBienTru} điểm ${teamName}`;
        }
        // TH2: Chỉ cộng điểm cho đối thủ (khi trừ điểm tắt)
        else if (apDungDiemBienCong) {
            // Cộng điểm cho đối thủ
            if (opponentTeam === "red") {
                setRedScore((prev) => {
                    const newScore = Math.max(-99, prev + diemBienCong);
                    redScoreRef.current = newScore;
                    return newScore;
                });
            } else {
                setBlueScore((prev) => {
                    const newScore = Math.max(-99, prev + diemBienCong);
                    blueScoreRef.current = newScore;
                    return newScore;
                });
            }
            historyMessage = `[BTN] ${teamName} Biên: +${diemBienCong} điểm ${opponentTeamName}`;
        }
        // TH3: Không áp dụng điểm biên
        else {
            historyMessage = `[BTN] ${teamName} Biên: Không áp dụng điểm`;
        }

        addActionToHistory("score", team, 0, historyMessage);

        // Kiểm tra điểm tuyệt đối sau khi cập nhật điểm
        setTimeout(() => checkAbsoluteScore(), 100);
    };

    // Hàm xử lý Ngã (team đối thủ được cộng điểm)
    const handleNga = (fallenTeam) => {
        const fallenTeamName = fallenTeam === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        const scoringTeam = fallenTeam === "red" ? "blue" : "red";
        const scoringTeamName = scoringTeam === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");

        // Phát âm thanh Ngã
        playActionSound(fallenTeam, "down");

        // Cộng điểm cho đội đối thủ
        if (scoringTeam === "red") {
            setRedScore((prev) => {
                const newScore = Math.max(-99, prev + 1);
                redScoreRef.current = newScore; // Cập nhật ref
                return newScore;
            });
        } else {
            setBlueScore((prev) => {
                const newScore = Math.max(-99, prev + 1);
                blueScoreRef.current = newScore; // Cập nhật ref
                return newScore;
            });
        }
        addActionToHistory(
            "score",
            scoringTeam,
            1,
            `[BTN] ${fallenTeamName} Ngã : +1 điểm ${scoringTeamName}`,
        );

        // Kiểm tra điểm tuyệt đối sau khi cập nhật điểm
        setTimeout(() => checkAbsoluteScore(), 100);
    };

    // Hàm xử lý y tế
    const handleMedical = (team, value) => {
        if (value) {
            // Tăng số lần gọi y tế
            if (team === "red") {
                setMedicalRed(medicalRed + value);
            } else {
                setMedicalBlue(medicalBlue + value);
            }
            return;
        }

        // nếu đang hoạt động thì gọi handleStopMedical (dùng ref để tránh stale closure)
        if (medicalTimerRef.current) {
            handleStopMedical();
            return;
        }

        const teamName = team === "red" ? t("scoreboard.doikhang.red_team") : t("scoreboard.doikhang.blue_team");
        setPauseMatch(false);
        // Lưu trạng thái timer chính và tạm dừng
        wasRunningBeforeMedical.current = isRunning;
        if (isRunning) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            console.log("⏸️ Tạm dừng timer chính do y tế");
        }

        // Kích hoạt thời gian y tế
        setIsMedicalTime(true);
        setMedicalTeam(team);
        setMedicalTimeLeft((matchInfo.thoi_gian_y_te || 120) * 10); // Lưu theo 0.1s


        // Tăng số lần gọi y tế
        if (team === "red") {
            setMedicalRed(medicalRed + 1);
        } else {
            setMedicalBlue(medicalBlue + 1);
        }

        addActionToHistory("medical", team, 0, `[BTN] ${teamName} ${t("scoreboard.doikhang.medical")}`);
        console.log(`🏥 Medical for ${team} - ${matchInfo.thoi_gian_y_te}s`);

        // Bắt đầu đếm ngược thời gian y tế (dùng ref riêng)
        if (medicalTimerRef.current) {
            clearInterval(medicalTimerRef.current);
        }
        medicalTimerRef.current = setInterval(() => {
            setMedicalTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(medicalTimerRef.current);
                    medicalTimerRef.current = null;
                    setIsMedicalTime(false);
                    setMedicalTeam(null);
                    wasRunningBeforeMedical.current = false;
                    console.log(" Hết thời gian y tế");
                    return 0;
                }
                return prev - 1;
            });
        }, 100); // 100ms = 0.1s
    };

    // Hàm render điểm giám định với hiệu ứng nháy - Thiết kế dọc nằm hai bên cạnh màn hình
    // Render GD scores with flashing effect
    // --- CHẾ ĐỘ GIÁM ĐỊNH (JUDGE SCORES) ---
    // --- CHẾ ĐỘ GIÁM ĐỊNH (JUDGE SCORES) ---
    const renderGDScores = (colors, team, forceMode = null) => {
        const displayMode = forceMode || matchInfo.config_system?.gd_display_mode || "vertical";
        const soGiamDinh = matchInfo.config_system?.so_giam_dinh || matchInfo.so_giam_dinh || 3;
        const heDiem = matchInfo.config_system?.he_diem || matchInfo.he_diem || 2;
        const uiTheme = matchInfo.config_system?.ui_theme || 'default';

        return (
            <JudgeScoreBlock
                colors={colors}
                team={team}
                matchInfo={matchInfo}
                displayMode={displayMode}
                soGiamDinh={soGiamDinh}
                heDiem={heDiem}
                uiTheme={uiTheme}
                teamFlashing={flashingRefs[team] || {}}
            />
        );
    };

    // --- TEST MODE: Vote accumulation refs (dùng ref để tránh stale closure trong setTimeout) ---
    const testRedSets = useRef({ 1: new Set(), 2: new Set(), 3: new Set() });
    const testBlueSets = useRef({ 1: new Set(), 2: new Set(), 3: new Set() });
    const isCountingTestRed = useRef(false);
    const isCountingTestBlue = useRef(false);

    /**
     * Tính điểm theo đa số — replicate logic calculateScore từ server/config/socket.js
     */
    const calculateTestScore = (scoreSets, soGiamDinh, cauHinhLayDiemThap) => {
        const size1 = scoreSets[1].size;
        const size2 = scoreSets[2].size;
        const size3 = scoreSets[3].size;
        let finalScore = 0;
        let finalRowIndex = -1;

        if (soGiamDinh >= 5) {
            // Đa số >= 3
            if (size1 >= 3) { finalScore = 1; finalRowIndex = 0; }
            else if (size2 >= 3) { finalScore = 2; finalRowIndex = 1; }
            else if (size3 >= 3) { finalScore = 3; finalRowIndex = 2; }
            // Điểm thấp (5 GĐ)
            if (cauHinhLayDiemThap && finalScore === 0 && (size1 + size2 + size3) >= 3) {
                if (size1 >= 1 && size2 >= 1) {
                    finalScore = 1; finalRowIndex = 0;
                }
            }
        } else {
            // Đa số >= 2 (mặc định 3 GĐ)
            if (size1 >= 2) { finalScore = 1; finalRowIndex = 0; }
            else if (size2 >= 2) { finalScore = 2; finalRowIndex = 1; }
            else if (size3 >= 2) { finalScore = 3; finalRowIndex = 2; }
            // Điểm thấp (3 GĐ): 1 GĐ cho h1 + 1 GĐ khác cho h2
            if (cauHinhLayDiemThap && finalScore === 0 && size1 === 1 && size2 === 1) {
                finalScore = 1; finalRowIndex = 0;
            }
        }

        return { point: finalScore, rowIndex: finalRowIndex };
    };

    /**
     * Giả lập điểm từ giám định (dành cho chế độ Test kết nối)
     * @param {string} team - 'red' | 'blue'
     * @param {number} refIndex - Chỉ số giám định (0-based)
     * @param {number} score - 1 (vàng) | 2 (xanh lá) | 3 (đỏ)
     * @param {boolean} liveScore - Nếu true → tính điểm cộng thật lên bảng sau cửa sổ tính điểm
     */
    const simulateRefereeScore = (team, refIndex, score, liveScore = false) => {
        const thoiGianTinhDiem = matchInfo.thoi_gian_tinh_diem || 1000;
        const soGiamDinh = matchInfo.so_giam_dinh || 3;
        const cauHinhLayDiemThap = matchInfo.config_system?.cau_hinh_lay_diem_thap ?? true;
        const teamLabel = team === "red" ? "Đỏ" : "Xanh";
        const scoreLabels = ["Vàng", "Xanh lá", "Đỏ"];

        // Flash ngay hiệu ứng GD tương ứng
        setFlashingRefs((prev) => ({
            ...prev,
            [team]: { ...prev[team], [refIndex]: Number(score) - 1 },
        }));
        setTimeout(() => {
            setFlashingRefs((prev) => ({
                ...prev,
                [team]: { ...prev[team], [refIndex]: -1 },
            }));
        }, thoiGianTinhDiem);

        if (!liveScore) {
            // Chế độ flash đơn giản (không tính điểm)
            addActionToHistory(
                "score",
                team,
                0,
                `[TEST] GĐ${refIndex + 1} → ${teamLabel} (${scoreLabels[score - 1] || score})`
            );
            return;
        }

        // --- Chế độ BẤMCÙNG NHẢY (liveScore = true) ---
        const sets = team === "red" ? testRedSets : testBlueSets;
        const isCounting = team === "red" ? isCountingTestRed : isCountingTestBlue;

        // Dùng refIndex+1 làm "fake socket id" để phân biệt GĐ
        const fakeId = `TEST_GD_${refIndex + 1}`;

        if (score >= 1 && score <= 3) {
            sets.current[score].add(fakeId);
        }

        if (!isCounting.current) {
            isCounting.current = true;

            setTimeout(() => {
                const result = calculateTestScore(sets.current, soGiamDinh, cauHinhLayDiemThap);

                if (result.point > 0) {
                    // Cộng điểm thật lên bảng
                    if (team === "red") {
                        setRedScore((prev) => {
                            const next = Math.max(-99, prev + result.point);
                            redScoreRef.current = next;
                            return next;
                        });
                    } else {
                        setBlueScore((prev) => {
                            const next = Math.max(-99, prev + result.point);
                            blueScoreRef.current = next;
                            return next;
                        });
                    }
                    // Phát âm thanh
                    playScoreSound(team, result.point);
                    addActionToHistory(
                        "score",
                        team,
                        result.point,
                        `[TEST★] Đa số → ${teamLabel} +${result.point} điểm`
                    );

                    // Nếu là điểm 3 (đòn chân) -> Hiển thị indicator
                    if (result.point === 3) {
                        triggerKickIndicator(team);
                    }

                    setTimeout(() => checkAbsoluteScore(), 100);
                } else {
                    addActionToHistory(
                        "score-miss",
                        team,
                        0,
                        `[TEST★] Không đủ đa số → ${teamLabel} 0 điểm`
                    );
                }

                // Reset sets
                sets.current[1].clear();
                sets.current[2].clear();
                sets.current[3].clear();
                isCounting.current = false;

            }, thoiGianTinhDiem);
        }
        // Nếu đang đếm, chỉ thêm vote (đã thêm ở trên), không khởi thêm timer
    };

    /**
     * Flash TẤT CẢ giám định của cả 2 đội với cùng một điểm (batch update)
     * @param {number} score - 1 | 2 | 3
     * @param {boolean} liveScore - có tính điểm thật không
     */
    const simulateAllReferees = (score, liveScore = false) => {
        const numJudges = matchInfo.so_giam_dinh || 3;
        const thoiGianTinhDiem = matchInfo.thoi_gian_tinh_diem || 1000;
        const flashValue = Number(score) - 1;

        // Batch flash tất cả GĐ cả 2 đội cùng lúc (1 setState duy nhất)
        setFlashingRefs(() => {
            const redFlash = {};
            const blueFlash = {};
            for (let i = 0; i < numJudges; i++) {
                redFlash[i] = flashValue;
                blueFlash[i] = flashValue;
            }
            return { red: redFlash, blue: blueFlash };
        });

        // Tắt flash sau thời gian tính điểm
        setTimeout(() => {
            setFlashingRefs(() => {
                const redOff = {};
                const blueOff = {};
                for (let i = 0; i < numJudges; i++) {
                    redOff[i] = -1;
                    blueOff[i] = -1;
                }
                return { red: redOff, blue: blueOff };
            });
        }, thoiGianTinhDiem);

        if (liveScore) {
            // Thêm vote cho tất cả GĐ vào cả 2 Set trước khi timer chạy
            const soGiamDinh = matchInfo.so_giam_dinh || 3;
            const cauHinhLayDiemThap = matchInfo.config_system?.cau_hinh_lay_diem_thap ?? true;

            for (let i = 0; i < numJudges; i++) {
                const fakeRedId = `TEST_GD_${i + 1}_red`;
                const fakeBlueId = `TEST_GD_${i + 1}_blue`;
                if (score >= 1 && score <= 3) {
                    testRedSets.current[score].add(fakeRedId);
                    testBlueSets.current[score].add(fakeBlueId);
                }
            }

            // Timer cho ĐỎ
            if (!isCountingTestRed.current) {
                isCountingTestRed.current = true;
                setTimeout(() => {
                    const result = calculateTestScore(testRedSets.current, soGiamDinh, cauHinhLayDiemThap);
                    if (result.point > 0) {
                        setRedScore((prev) => {
                            const next = Math.max(-99, prev + result.point);
                            redScoreRef.current = next;
                            return next;
                        });
                        playScoreSound("red", result.point);
                        addActionToHistory("score", "red", result.point, `[TEST★] All GĐ → Đỏ +${result.point}`);
                        setTimeout(() => checkAbsoluteScore(), 100);
                    }
                    testRedSets.current[1].clear();
                    testRedSets.current[2].clear();
                    testRedSets.current[3].clear();
                    isCountingTestRed.current = false;
                }, thoiGianTinhDiem);
            }

            // Timer cho XANH
            if (!isCountingTestBlue.current) {
                isCountingTestBlue.current = true;
                setTimeout(() => {
                    const result = calculateTestScore(testBlueSets.current, soGiamDinh, cauHinhLayDiemThap);
                    if (result.point > 0) {
                        setBlueScore((prev) => {
                            const next = Math.max(-99, prev + result.point);
                            blueScoreRef.current = next;
                            return next;
                        });
                        playScoreSound("blue", result.point);
                        addActionToHistory("score", "blue", result.point, `[TEST★] All GĐ → Xanh +${result.point}`);
                        setTimeout(() => checkAbsoluteScore(), 100);
                    }
                    testBlueSets.current[1].clear();
                    testBlueSets.current[2].clear();
                    testBlueSets.current[3].clear();
                    isCountingTestBlue.current = false;
                }, thoiGianTinhDiem);
            }
        } else {
            addActionToHistory("score", "red", 0, `[TEST] All GĐ → flash ${score}`);
        }
    };

    const saveMatchResult = async (winner, winnerText) => {
        try {
            // Chuẩn bị dữ liệu kết quả
            const matchResult = {
                match_id: matchInfo.match_id,
                status: "FIN", // Finished
                red_score: redScore,
                blue_score: blueScore,
                red_remind: remindRed,
                blue_remind: remindBlue,
                red_warn: warnRed,
                blue_warn: warnBlue,
                red_kick: kickRed,
                blue_kick: kickBlue,
                winner: winner, // 'red', 'blue', null (hòa)
                total_rounds: currentRound,
                final_time: formatTime(timeLeft).main + formatTime(timeLeft).decimal,
                action_history: actionHistory, // Lưu toàn bộ lịch sử thao tác
                round_history: roundHistory, // Lưu lịch sử từng hiệp
                finished_at: new Date().toISOString(),
                // Thông tin bổ sung
                match_no: matchInfo.match_no,
                // weight_class: matchInfo.weight_class,
                // red_athlete_id: matchInfo.red_athlete_id,
                // red_athlete_name: matchInfo.red_athlete_name,
                // blue_athlete_id: matchInfo.blue_athlete_id,
                // blue_athlete_name: matchInfo.blue_athlete_name,
                // competition_id: matchInfo.competition_id,
                // category_id: matchInfo.category_id,
            };

            console.log("Saving match result:", matchResult);

            // Gọi API lưu kết quả
            const response = await axios.post(
                "http://localhost:6789/api/matches/finish",
                matchResult,
            );

            if (response.data.success) {
                await showSuccess(t("scoreboard.doikhang.save_result_success"));

                // Tracking action
                addActionToHistory(
                    "finish",
                    winner,
                    0,
                    `Kết thúc trận đấu - ${winnerText} ${winner ? "THẮNG" : ""}`,
                );

                // Chuyển về màn hình quản lý
                navigate(returnUrl, {
                    state: {
                        message: t("scoreboard.doikhang.match_ended"),
                        matchResult: matchResult,
                    },
                });
            } else {
                throw new Error(response.data.message || t("scoreboard.doikhang.save_result_failed"));
            }
        } catch (error) {
            console.error("Error finishing match:", error);
            await showError(
                `${t("scoreboard.doikhang.save_result_error")}: ${error.message}\n\n${t("scoreboard.doikhang.error_detail")}`,
            );
        }
    };

    // Helper function để tạo className cho button với disabled state
    const getButtonClassName = (team, baseColor, isDisabled) => {
        const disabled = team === "red" ? disableRedButtons : disableBlueButtons;
        if (disabled || isDisabled) {
            return "bg-gray-400 cursor-not-allowed text-gray-600 font-bold py-1 text-sm transition-colors rounded";
        }
        return `${baseColor} font-bold py-1 text-sm transition-colors rounded`;
    };

    const getActionButtonClassName = (team, baseColor, isDisabled) => {
        const disabled = team === "red" ? disableRedButtons : disableBlueButtons;
        if (disabled || isDisabled) {
            return "bg-gray-400 cursor-not-allowed text-gray-600 font-bold py-1 transition-colors text-xs rounded";
        }
        return `${baseColor} font-bold py-1 transition-colors text-xs rounded`;
    };

    // Helper function để extract competition_dk_id từ returnUrl
    const extractCompetitionIdFromUrl = (url) => {
        // URL format: /management/competition-data/:id
        const match = url.match(/\/management\/competition-data\/(\d+)/);
        return match ? match[1] : null;
    };

    // ---------- Thao tác nút "KẾT THÚC" ----------- //
    // setAnnouncedWinner | setAnnouncedWinner | setIsFinishingMatch | setShowWinnerModal
    // Hàm kết thúc trận đấu
    const btnFinishMatch = async (
        finalRedScore = null,
        finalBlueScore = null,
    ) => {
        // TH1: nhấn nút Thắng -> Nhấn nút 'Kết thúc'
        // TH2: nhán nút 'Kết thúc'
        // TH3: Tự động gọi hàm khi kết thúc thời gian

        // Sử dụng điểm số được truyền vào hoặc điểm số hiện tại
        const currentRedScore = finalRedScore !== null ? finalRedScore : redScore;
        const currentBlueScore =
            finalBlueScore !== null ? finalBlueScore : blueScore;

        // 1. Đã xác định VĐV thắng
        if (announcedWinner) {
            btnNextMatch();
            return;
        }

        // 2. Chưa xác định nên tính toán điểm RED-BLUE
        if (currentRedScore > currentBlueScore) {
            const winnerData = {
                team: "red",
                name: matchInfo.red.name,
                score: currentRedScore,
                teamName: matchInfo.red.unit,
            };
            // Phát âm thanh chiến thắng
            playVictory();
            setAnnouncedWinner(winnerData);
        } else if (currentBlueScore > currentRedScore) {
            const winnerData = {
                team: "blue",
                name: matchInfo.blue.name,
                score: currentBlueScore,
                teamName: matchInfo.blue.unit,
            };
            // Phát âm thanh chiến thắng
            playVictory();
            setAnnouncedWinner(winnerData);
        } else {
            // Điểm bằng nhau - hiển thị modal chọn winner

            setIsFinishingMatch(true); // Đánh dấu đang kết thúc trận đấu
            setShowWinnerModal(true);
            return;
        }
        // Lưu kết quả
        // await saveMatchResult(winner, winnerText);
    };

    // [KHÔNG DÙNG] Hàm xử lý khi chọn winner từ modal Sau khi nhấn "btnFinishMatch"
    // Hiện tại khôg dùng
    const handleSelectWinner = async (winner) => {
        if (announcedWinner) {
            btnNextMatch();
            return;
        }
        setShowWinnerModal(false);
        const winnerText =
            winner === "red"
                ? matchInfo.red.name || t("scoreboard.doikhang.red_team").toUpperCase()
                : matchInfo.blue.name || t("scoreboard.doikhang.blue_team").toUpperCase();

        // Kiểm tra xem có đang kết thúc trận đấu không
        if (isFinishingMatch) {
            // hiệu ứng chiến thắng
            setAnnouncedWinner({
                team: winner,
                name: winnerText,
                score: winner === "red" ? redScore : blueScore,
                teamName: winner === "red" ? matchInfo.red.unit : matchInfo.blue.unit,
            });
        } else {
            // Chỉ hiển thị thông tin (từ nút "Thắng")
            const teamName =
                winner === "red" ? matchInfo.red.unit : matchInfo.blue.unit;
            // Hiển thị modal công bố thay vì alert
            setAnnouncedWinner({
                team: winner,
                name: winnerText,
                score: winner === "red" ? redScore : blueScore,
                teamName: teamName,
            });
            // Hiển thị hiệu ứng trên bảng điểm
            setShowWinnerAnnouncementModal(true);
            // Thêm vào lịch sử
            addActionToHistory(
                "winner",
                winner,
                0,
                `Chọn ${teamName} (${winnerText}) thắng`,
            );
            // Lưu trạn đấu
        }
    };

    // ---------- Thao tác nút "THẮNG"    ----------- //
    const handleWinner = (team, quick) => {
        const teamName = team === "red" ? matchInfo.red.unit : matchInfo.blue.unit;
        const athleteName =
            team === "red"
                ? matchInfo.red.name || t("scoreboard.doikhang.red_team").toUpperCase()
                : matchInfo.blue.name || t("scoreboard.doikhang.blue_team").toUpperCase();

        // Hiển thị modal công bố vận động viên thắng
        const winnerData = {
            team: team,
            name: athleteName,
            score: team === "red" ? redScore : blueScore,
            teamName: teamName,
        };

        // Phát âm thanh chiến thắng
        playVictory();

        // setReady | setIsRunning | setIsBreakTime
        setPauseMatch(true);
        if (!quick) {
            setAnnouncedWinner(winnerData);
            setShowWinnerAnnouncementModal(true);
            // Thêm vào lịch sử
        } else {
            setAnnouncedWinner(winnerData);
            setShowWinnerModal(false);
            setIsFinishingMatch(false);
        }
    };

    const btnClearWinner = () => {
        setAnnouncedWinner(null);
        setShowWinnerAnnouncementModal(false);
    };

    const btnReturnWinner = () => {
        setAnnouncedWinner(null);
        setShowWinnerAnnouncementModal(false);
    };

    const btnConfirmWinner = (reason) => {
        console.log("🏆 Xác nhận VĐV thắng với lý do:", reason);
        if (announcedWinner) {
            setAnnouncedWinner({
                ...announcedWinner,
                reason: reason
            });
        }
        setShowWinnerAnnouncementModal(false);
    };

    // Hàm tự động cập nhật VĐV thắng vào các trận tiếp theo
    const updateWinnerToNextMatches = async (
        currentMatchNo,
        winner,
        winnerName,
        winnerUnit,
    ) => {
        try {
            const competition_dk_id = matchInfo.competition_dk_id;
            if (!competition_dk_id) {
                console.log(" Không có competition_dk_id, bỏ qua cập nhật.");
                return 0;
            }

            console.log(
                "🔍 Tìm kiếm pattern win." + currentMatchNo + " trong danh sách...",
            );
            console.log("🏆 VĐV thắng:", { name: winnerName, unit: winnerUnit });

            // Nếu không có VĐV thắng, không cần cập nhật
            if (!winnerName) {
                console.log(" Không có thông tin VĐV thắng, bỏ qua cập nhật.");
                return 0;
            }

            // Lấy dữ liệu competition
            const response = await axios.get(
                `http://localhost:6789/api/competition-dk/${competition_dk_id}`,
            );
            if (!response?.data?.success || !response?.data?.data) {
                console.log(" Không thể lấy dữ liệu competition, bỏ qua cập nhật.");
                return 0;
            }

            const competitionData = response.data.data;
            const allRows = competitionData.data.slice(1); // Bỏ header

            // Pattern để tìm: "win.1", "win.2", etc.
            const winPattern = `win.${currentMatchNo}`;
            const updateRequests = [];
            let updateCount = 0;

            // Duyệt qua tất cả các hàng để tìm pattern
            for (let i = 0; i < allRows.length; i++) {
                const rowData = allRows[i];
                let needUpdate = false;
                let updatedRow = [...rowData];

                // Kiểm tra từng cell trong row
                for (let j = 0; j < rowData.length; j++) {
                    const cellValue = String(rowData[j] || "")
                        .toLowerCase()
                        .trim();

                    if (cellValue === winPattern.toLowerCase()) {
                        // Tìm thấy pattern, cập nhật tên VĐV thắng
                        console.log(
                            ` Tìm thấy "${winPattern}" tại trận ${updatedRow[0]}, cột ${j}`,
                        );

                        updatedRow[j] = winnerName;
                        needUpdate = true;

                        // Nếu cột tiếp theo là đơn vị, cập nhật luôn
                        if (j + 1 < rowData.length) {
                            updatedRow[j + 1] = winnerUnit;
                        }

                        updateCount++;
                    }
                }

                // Nếu có cập nhật, gọi API để lưu
                if (needUpdate) {
                    console.log(
                        `📝 Cập nhật backend - Trận ${updatedRow[0]}: ${winnerName} (${winnerUnit})`,
                    );

                    updateRequests.push(
                        axios
                            .put(
                                `http://localhost:6789/api/competition-dk/${competition_dk_id}/row/${i}`,
                                { data: updatedRow },
                            )
                            .then(() => {
                                console.log(` Đã cập nhật backend - Trận ${updatedRow[0]}`);
                            })
                            .catch((err) => {
                                console.error(
                                    ` Lỗi cập nhật backend - Trận ${updatedRow[0]}:`,
                                    err,
                                );
                                throw err;
                            }),
                    );
                }
            }

            // Chờ tất cả requests hoàn thành
            if (updateRequests.length > 0) {
                console.log(
                    `⏳ Đang cập nhật ${updateRequests.length} trận vào backend...`,
                );
                await Promise.all(updateRequests);
                console.log(
                    ` Đã cập nhật thành công ${updateRequests.length} trận vào backend!`,
                );
            } else {
                console.log("ℹ️ Không tìm thấy trận nào cần cập nhật.");
            }

            return updateCount;
        } catch (error) {
            console.error(" Error updating winner to next matches:", error);
            return 0;
        }
    };

    // ---------- Thao tác nút "T.TRƯỚC"  ----------- //
    // Hàm quay lại trận trước
    const btnPreviousMatch = async () => {
        try {
            // 1. Kiểm tra trận đang diễn ra - Hỏi xác nhận
            const currentStatus = matchInfo.match_status;
            // IN: đăng trong trận thì hỏi bỏ qua

            if (["IN"].includes(currentStatus)) {
                const confirmed = await showWarning(
                    t("scoreboard.doikhang.match_in_progress_warning") + "\n\n" + t("scoreboard.doikhang.data_will_not_be_saved"),
                    { title: t("scoreboard.doikhang.warning_title"), confirmText: t("common.yes") },
                );
                if (!confirmed) {
                    return; // User hủy
                }
            }

            // 2. Lấy competition_dk_id từ returnUrl hoặc matchInfo
            const competition_dk_id =
                matchInfo.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
            if (!competition_dk_id) {
                await showError(
                    "Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.",
                );
                navigate(returnUrl);
                return;
            }

            // 3. Lấy dữ liệu sheet
            const sheetResponse = await axios.get(
                `http://localhost:6789/api/competition-dk/${competition_dk_id}`,
            );
            const competitionDkData = sheetResponse?.data?.data;
            if (!sheetResponse?.data?.success || !sheetResponse?.data?.data) {
                await showError(t("scoreboard.doikhang.load_previous_match_error"));
                navigate(returnUrl);
                return;
            }

            // 4. Tìm trận trước
            const currentMatch = matchInfo.match_no;
            if (currentMatch <= 1) {
                await showAlert(t("scoreboard.doikhang.first_match"));
                return;
            }

            const previousRow = competitionDkData?.data[currentMatch - 1]; // -1 vì quay lại trận trước
            if (!previousRow) {
                await showError(t("scoreboard.doikhang.previous_match_not_found"));
                return;
            }

            // 5. Lấy danh sách matches và tìm match trước
            const matchesResponse = await axios.get(
                `http://localhost:6789/api/competition-match/by-dk/${competition_dk_id}`,
            );
            const allMatches = matchesResponse.data.success
                ? matchesResponse.data.data
                : [];
            const previousMatch = allMatches.find(
                (m) => m.match_no == previousRow[0],
            );
            console.log("previousMatch: ", previousMatch);
            let matchId = null;
            let matchStatus = "WAI";
            let winner = null;
            let finalScores = { red: 0, blue: 0 };

            if (!previousMatch) {
                // Tạo mới nếu chưa có
                const createResponse = await axios.post(
                    "http://localhost:6789/api/competition-match",
                    {
                        competition_dk_id: competition_dk_id,
                        match_no: previousRow[0] || "",
                        row_index: previousRow[0] || "",
                        red_name: previousRow[3] || "",
                        blue_name: previousRow[6] || "",
                        config_system: matchInfo.config_system || {},
                    },
                );
                matchId = createResponse.data.data?.id;
            } else {
                matchId = previousMatch.id;
                matchStatus = previousMatch.match_status;
                winner = previousMatch.winner;

                // Nếu trận đã kết thúc, lấy kết quả cuối cùng từ history
                if (matchStatus === "FIN") {
                    const historyResponse = await axios.get(
                        `http://localhost:6789/api/competition-match/${matchId}/history`,
                    );
                    if (
                        historyResponse.data.success &&
                        historyResponse.data.data.length > 0
                    ) {
                        const lastHistory = historyResponse.data.data[0]; // Đã sort DESC
                        finalScores.red = lastHistory.red_score || 0;
                        finalScores.blue = lastHistory.blue_score || 0;
                    }
                }
            }

            // 6. Cập nhật matchInfo
            setMatchInfo({
                ...matchInfo,
                match_id: matchId || "",
                match_no: previousRow[0] || "",
                match_weight: previousRow[1] || "",
                match_type: previousRow[2] || "",
                match_level: previousRow[9] || "",
                red: {
                    name: previousRow[3] || "",
                    unit: previousRow[4] || "",
                    country: previousRow[5] || "",
                },
                blue: {
                    name: previousRow[6] || "",
                    unit: previousRow[7] || "",
                    country: previousRow[8] || "",
                },
                row_index: previousRow[0] || "",
                match_status: matchStatus,
                winner: winner,
                // Thêm thông tin kết quả nếu trận đã kết thúc
                previous_status: matchStatus === "FIN" ? matchStatus : undefined,
                previous_winner: matchStatus === "FIN" ? winner : undefined,
                previous_scores: matchStatus === "FIN" ? finalScores : undefined,
            });

            console.log("Updated matchInfo: ", matchInfo);

            // 7. Navigate sang trận trước
            navigate("/bang-diem/doi-khang", {
                state: {
                    matchData: matchData,
                    returnUrl: returnUrl,
                    // Thêm flag để biết là quay lại trận đã kết thúc
                    showPreviousResult: matchStatus === "FIN" && winner ? true : false,
                },
                replace: true,
            });
            resetTimer();
        } catch (error) {
            console.error(" Lỗi khi quay lại trận trước:", error);
            await showError(
                "Lỗi khi quay lại trận trước: " +
                (error.response?.data?.message || error.message),
            );
        }
    };

    // ---------- Thao tác nút "T.SAU"    ----------- //
    const btnNextMatch = async () => {
        // Trạng thái trong trận 'IN' cần xác nhận trước khi thực thi
        try {
            // 1. Kiểm tra trạng thái trận hiện tại
            const currentStatus = matchInfo.match_status || "WAI";

            // Nếu trạng thái là FIN (đã kết thúc) -> Chuyển trận luôn, không cần lưu lại
            if (currentStatus === "FIN" || currentStatus === "WAI") {
                console.log(" Trận đã kết thúc, chuyển sang trận tiếp theo");
            } else {
                // Trạng thái WAI hoặc IN -> Cần lưu kết quả trước khi chuyển trận

                // Hỏi xác nhận
                const confirmed = await showWarning(
                    t("scoreboard.doikhang.confirm_finish_match"),
                    { title: t("scoreboard.doikhang.confirm_end_match"), confirmText: t("scoreboard.doikhang.end_match") },
                );
                if (!confirmed) {
                    return; // User hủy
                }

                // Kiểm tra đã chọn winner chưa
                if (!announcedWinner) {
                    // Mở modal chọn winner
                    btnFinishMatch();
                    return;
                }

                const winner = announcedWinner.team; // 'red' hoặc 'blue'

                console.log(
                    `🔄 Lưu kết quả trận đấu (status: ${currentStatus} -> FIN)`,
                );

                // Lưu winner và cập nhật status = FIN
                await axios.put(
                    `http://localhost:6789/api/competition-match/${matchInfo.match_id}/winner`,
                    {
                        winner: winner,
                    },
                );

                // Lưu history cuối cùng
                await axios.post(
                    `http://localhost:6789/api/competition-match/${matchInfo.match_id}/history`,
                    {
                        match_id: matchInfo.match_id,
                        red_score: redScore,
                        blue_score: blueScore,
                        red_remind: remindRed,
                        blue_remind: remindBlue,
                        red_warn: warnRed,
                        blue_warn: warnBlue,
                        red_mins: 0,
                        blue_mins: 0,
                        red_incr: 0,
                        blue_incr: 0,
                        round: currentRound,
                        round_type:
                            currentRound > (matchInfo.so_hiep || 3) ? "EXTRA" : "NORMAL",
                        confirm_attack: 0,
                        status: "FIN",
                        action_type: "finish",
                        action_by: winner,
                        notes: "Kết thúc trận đấu",
                        logs: actionHistory,
                        roundHistory: roundHistory,
                    },
                );
                console.log(" Đã lưu kết quả trận đấu vào database");

                // Tự động cập nhật VĐV thắng vào các trận tiếp theo
                const winnerName =
                    winner === "red" ? matchInfo.red?.name : matchInfo.blue?.name;
                const winnerUnit =
                    winner === "red" ? matchInfo.red?.unit : matchInfo.blue?.unit;
                const currentMatchNo = matchInfo.match_no;

                console.log("🔄 Bắt đầu cập nhật VĐV thắng vào các trận tiếp theo...");
                const updateCount = await updateWinnerToNextMatches(
                    currentMatchNo,
                    winner,
                    winnerName,
                    winnerUnit,
                );

                if (updateCount > 0) {
                    console.log(
                        ` Đã tự động cập nhật ${updateCount} trận tiếp theo với VĐV thắng: ${winnerName}`,
                    );
                }
            }

            // 2. Lấy competition_dk_id từ returnUrl hoặc matchInfo
            const competition_dk_id =
                matchInfo.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
            if (!competition_dk_id) {
                await showError(
                    "Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.",
                );
                navigate(returnUrl);
                return;
            }
            // 3. Lấy dữ liệu sheet để tạo matchData cho trận tiếp theo
            const sheetResponse = await axios.get(
                `http://localhost:6789/api/competition-dk/${competition_dk_id}`,
            );
            const competitionDkData = sheetResponse?.data?.data;
            if (!sheetResponse?.data?.success || !sheetResponse?.data?.data) {
                await showError(t("scoreboard.doikhang.load_next_match_error"));
                navigate(returnUrl);
                return;
            }

            const currentMatch = matchInfo.match_no;
            const nextRow = competitionDkData?.data[currentMatch + 1]; // +1 vì row 0 là header
            if (!nextRow) {
                await showAlert(t("scoreboard.doikhang.last_match"));
                navigate(returnUrl);
                return;
            }
            // kiểm tra nextRow có match_id không | nếu không có thì tạo mới
            // lấy danh sách match theo competition_dk_id và kiểm tra match_no có tồn tại không| nếu tồn tại thì lấy id = match_id | không tồn tại thì gọi API create match để lấy id
            // // 3. Lấy danh sách tất cả matches
            const matchesResponse = await axios.get(
                `http://localhost:6789/api/competition-match/by-dk/${competition_dk_id}`,
            );
            const allMatches = matchesResponse.data.success
                ? matchesResponse.data.data
                : [];
            const nextMatch = allMatches.find((m) => m.match_no == nextRow[0]);
            let matchId = null;
            if (!nextMatch) {
                // tạo mới
                const createResponse = await axios.post(
                    "http://localhost:6789/api/competition-match",
                    {
                        competition_dk_id: competition_dk_id,
                        match_no: nextRow[0] || "",
                        row_index: nextRow[0] || "",
                        red_name: nextRow[3] || "",
                        blue_name: nextRow[6] || "",
                        config_system: matchInfo.config_system || {},
                    },
                );
                matchId = createResponse.data.data?.id;
                // cập nhật status = IN
                // tạm tắt debug next/prev
                if (createResponse.data.data?.status == "WAI") {
                    await axios.put(
                        `http://localhost:6789/api/competition-match/${matchId}/status`,
                        {
                            status: "IN",
                        },
                    );
                }
            } else {
                matchId = nextMatch.id;
                // nextMatch.winner != null thì set winner
                // tạm tắt debug next/prev
                if (nextMatch?.status == "WAI") {
                    await axios.put(
                        `http://localhost:6789/api/competition-match/${matchId}/status`,
                        {
                            status: "IN",
                        },
                    );
                }
            }

            // 4. Cập nhật matchInfo
            setMatchInfo({
                ...matchInfo,
                match_id: matchId || "",
                match_no: nextRow[0] || "",
                match_weight: nextRow[1] || "",
                match_type: nextRow[2] || "",
                match_level: nextRow[9] || "",
                red: {
                    name: nextRow[3] || "",
                    unit: nextRow[4] || "",
                    country: nextRow[5] || "",
                },
                blue: {
                    name: nextRow[6] || "",
                    unit: nextRow[7] || "",
                    country: nextRow[8] || "",
                },
                match_status: nextMatch?.match_status || "IN",
                row_index: nextRow[0] || "",
                // Xóa thông tin kết quả cũ
                previous_status: undefined,
                previous_winner: undefined,
                previous_scores: undefined,
                winner: undefined,
            });

            navigate("/bang-diem/doi-khang", {
                state: {
                    matchData: matchData,
                    returnUrl: returnUrl,
                },
                replace: true, // Replace để không tạo history entry mới
            });

            // Không cần clear state ở đây vì component sẽ re-render với matchData mới
            setShowWinnerModal(false);
            setShowWinnerAnnouncementModal(false);
            isHandlingRound.current = false;
            setSelectedWinner(null);
            setIsRunning(false);
            setTimeLeft((matchInfo.thoi_gian_thi_dau || 180) * 10); // Reset theo 0.1s
            setCurrentRound(1);
            setIsBreakTime(false);
            setBreakTimeLeft(0);
            //
            resetTimer();

            // dùng khi trạng thái trấn trạn thi đấu sau có dữ liệu
            if (nextMatch.winner != null) {
                // tạo animation winner
                const winnerData = {
                    team: nextMatch.winner,
                    name: nextMatch.winner === "red" ? nextRow[3] : nextRow[6],
                    score:
                        nextMatch.winner === "red"
                            ? nextMatch.red_score
                            : nextMatch.blue_score,
                    teamName: nextMatch.winner === "red" ? nextRow[4] : nextRow[7],
                };
                setAnnouncedWinner(winnerData);
                setAnnouncedWinner(winnerData);
                console.log("winnerData: ", winnerData);
            }
        } catch (error) {
            console.error(" Lỗi khi chuyển trận:", error);
            await showError(
                "Lỗi khi chuyển sang trận tiếp theo: " +
                (error.response?.data?.message || error.message),
            );
        }
    };

    // ---------- Thao tác nút "Thoát"    ----------- //
    const btnGoBack = async () => {
        const confirmed = await showConfirm(
            t("scoreboard.doikhang.confirm_exit"),
            {
                title: t("scoreboard.doikhang.confirm_title"),
                confirmText: t('common.confirm'),
                cancelText: t('common.cancel'),
            },
        );
        if (confirmed) {
            navigate(returnUrl);
        }
    };

    // ---------- Thao tác nút "Reset"    ----------- //
    // Reset timer (từ Timer.jsx)
    const resetTimer = () => {
        clearInterval(timerRef.current);
        clearInterval(medicalTimerRef.current);
        medicalTimerRef.current = null;
        setIsRunning(false);
        setTimeLeft((matchInfo.thoi_gian_thi_dau || 180) * 10); // Reset theo 0.1s
        setCurrentRound(1);
        setIsBreakTime(false);
        setBreakTimeLeft(0);
        setIsMedicalTime(false); // Reset thời gian y tế
        setMedicalTimeLeft(0);
        setMedicalTeam(null);
        setRoundHistory([]);
        setActionHistory([]);
        setAnnouncedWinner(null);
        setReady(true);
        setIsFinishingMatch(false);
        setShowWinnerModal(false);
        setShowWinnerAnnouncementModal(false);
        isHandlingRound.current = false;
        setSelectedWinner(null);
        setDisableRedButtons(false);
        setDisableBlueButtons(false);
        setRemindRed(0);
        setRemindBlue(0);
        setWarnRed(0);
        setWarnBlue(0);
        setKickRed(0);
        setKickBlue(0);
        setMedicalRed(0);
        setMedicalBlue(0);
        setRedScore(0);
        setBlueScore(0);
        redScoreRef.current = 0;
        blueScoreRef.current = 0;
        setShowRedKickIndicator(false);
        setShowBlueKickIndicator(false);
    };

    // ---------- Thao tác nút "Lịch sử"  ----------- //
    const btnShowHistory = () => {
        setShowHistoryModal(true);
    };

    // ---------- Thao tác nút "Cấu hình" ----------- //
    const btnSetting = () => {
        setShowConfigModal(true);
    };
    // ---------- Thao tác nút "Hiệp phụ" ----------- //
    const btnExtraRound = () => {
        // Force chuyển sang thời gian nghỉ và sau đó chuyển qua hiệp phụ

        // 1. Dừng timer hiện tại nếu đang chạy
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // 2. Set currentRound = tổng số hiệp chính (để hiệp tiếp theo là hiệp phụ 1)
        const totalMainRounds = matchInfo.so_hiep || 3;
        setCurrentRound(totalMainRounds);

        // 3. Bắt đầu thời gian nghỉ giải lao
        setIsBreakTime(true);
        setBreakTimeLeft((matchInfo.thoi_gian_nghi || 60) * 10); // Lưu theo 0.1s
        setIsRunning(true);

        // 4. Chạy đếm ngược thời gian nghỉ
        timerRef.current = setInterval(() => {
            setBreakTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIsBreakTime(false);
                    setIsRunning(false);

                    // 5. Chuyển sang hiệp phụ 1
                    setCurrentRound(totalMainRounds + 1);

                    // 6. Set thời gian hiệp phụ
                    setTimeLeft((matchInfo.thoi_gian_hiep_phu || 60) * 10);

                    return 0;
                }
                return prev - 1;
            });
        }, 100); // 100ms = 0.1s
    };

    // ngưng thời gian y tế 
    const handleStopMedical = () => {
        clearInterval(medicalTimerRef.current);
        medicalTimerRef.current = null;
        setIsMedicalTime(false);
        setMedicalTeam(null);
        setMedicalTimeLeft(0);
        console.log(" Kết thúc thời gian y tế");
        if (wasRunningBeforeMedical.current) {
            console.log("▶️ Timer chính đã tạm dừng trước y tế - nhấn Space để tiếp tục");
            wasRunningBeforeMedical.current = false;
        }
    }

    return (
        <div
            className="h-screen w-screen text-white flex flex-col items-center justify-start relative overflow-hidden pb-20 transition-all duration-500"
            style={getBackgroundStyle()}
        >
            {/* Background overlay if needed (optional since we use linear-gradient) */}

            {/* CSS Animations cho hiệu ứng chiến thắng */}
            <style>{`
        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
          }
          50% {
            transform: scale(1.15);
            filter: brightness(1.3) drop-shadow(0 0 80px rgba(255, 215, 0, 1));
          }
        }

        @keyframes victoryGlow {
          0%, 100% {
            box-shadow:
              0 0 40px rgba(255, 215, 0, 0.9),
              0 0 80px rgba(255, 215, 0, 0.7),
              0 0 120px rgba(255, 215, 0, 0.5),
              inset 0 0 60px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow:
              0 0 60px rgba(255, 255, 0, 1),
              0 0 120px rgba(255, 215, 0, 0.9),
              0 0 180px rgba(255, 215, 0, 0.7),
              inset 0 0 80px rgba(255, 215, 0, 0.5);
          }
        }

        @keyframes victoryShine {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes victoryOverlay {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes victoryBorder {
          0%, 100% {
            border-color: rgba(255, 215, 0, 1);
            border-width: 4px;
          }
          50% {
            border-color: rgba(255, 255, 0, 1);
            border-width: 8px;
          }
        }

        .victory-animation {
          animation:
            victoryPulse 1.2s ease-in-out infinite,
            victoryGlow 1.5s ease-in-out infinite,
            victoryBorder 1s ease-in-out infinite;
          border: 6px solid gold !important;
          position: relative;
          z-index: 100;
        }

        .victory-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 215, 0, 0.15) 0%,
            rgba(255, 255, 0, 0.35) 50%,
            rgba(255, 215, 0, 0.15) 100%
          );
          background-size: 200% auto;
          animation: victoryShine 2s linear infinite;
          border-radius: inherit;
          pointer-events: none;
          z-index: 1;
        }

        .victory-animation::before {
          content: '';
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 60px;
          animation: victoryPulse 1s ease-in-out infinite;
          background: transparent;
        }

        .victory-overlay {
          position: fixed;
          top: 0;
          left: 0;
        .athlete-card-high-tech {
          background: rgba(15, 15, 20, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .athlete-card-high-tech:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .card-header-glass {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
        }

        .neon-glow-red {
          text-shadow: 0 0 20px rgba(255, 0, 0, 0.4), 0 0 40px rgba(255, 0, 0, 0.2);
        }

        .neon-glow-blue {
          text-shadow: 0 0 20px rgba(0, 0, 255, 0.4), 0 0 40px rgba(0, 0, 255, 0.2);
        }

        .score-display-huge {
          font-family: 'Inter', 'Arial Black', sans-serif;
          font-weight: 900;
          line-height: 0.8;
          letter-spacing: -0.05em;
        }

        @keyframes pulse-border-red {
          0% { border-color: rgba(255, 0, 0, 0.3); }
          50% { border-color: rgba(255, 0, 0, 0.8); }
          100% { border-color: rgba(255, 0, 0, 0.3); }
        }

        @keyframes pulse-border-blue {
          0% { border-color: rgba(0, 0, 255, 0.3); }
          50% { border-color: rgba(0, 0, 255, 0.8); }
          100% { border-color: rgba(0, 0, 255, 0.3); }
        }

        .active-red { animation: pulse-border-red 2s infinite; }
        .active-blue { animation: pulse-border-blue 2s infinite; }
      `}</style>

            {/* Victory Overlay - Toàn màn hình khi có winner */}
            {announcedWinner && <div className="victory-overlay"></div>}

            {/* Logo List and Header */}
            <ScoreboardHeader
                matchInfo={matchInfo}
                matchData={matchData}
                lsLogo={lsLogo}
            />

            {/* Scoreboard - Optimized for 1920x1080 */}
            <CompetitionScoreboard
                matchInfo={matchInfo}
                redScore={redScore}
                blueScore={blueScore}
                announcedWinner={announcedWinner}
                showRedKickIndicator={showRedKickIndicator}
                showBlueKickIndicator={showBlueKickIndicator}
                currentRound={currentRound}
                isMedicalTime={isMedicalTime}
                isBreakTime={isBreakTime}
                isRunning={isRunning}
                timeLeft={timeLeft}
                breakTimeLeft={breakTimeLeft}
                formatTime={formatTime}
                buttonPermissions={buttonPermissions}
                remindRed={remindRed}
                remindBlue={remindBlue}
                warnRed={warnRed}
                warnBlue={warnBlue}
                kickRed={kickRed}
                kickBlue={kickBlue}
                medicalRed={medicalRed}
                medicalBlue={medicalBlue}
                getFlagImage={getFlagImage}
                getDefaultFlag={getDefaultFlag}
                formatMatchName={formatMatchName}
                renderGDScores={renderGDScores}
                generateGdData={generateGdData}
                t={t}
            />
            {/* Panel Test Mode - Nằm ngang dưới bảng điểm - Draggable */}


            {/* Control Bar - Below Scoreboard */}
            <ManagementBar
                showControlBar={showControlBar}
                isMedicalTime={isMedicalTime}
                handleStopMedical={handleStopMedical}
                btnGoBack={btnGoBack}
                resetTimer={resetTimer}
                setShowHistoryModal={setShowHistoryModal}
                setShowConfigModal={setShowConfigModal}
                btnFinishMatch={btnFinishMatch}
                btnPreviousMatch={btnPreviousMatch}
                btnNextMatch={btnNextMatch}
                btnExtraRound={btnExtraRound}
                isSoundEnabled={isSoundEnabled}
                setIsSoundEnabled={setIsSoundEnabled}
                stopAllAudios={stopAllAudios}
                isTestModePanel={isTestModePanel}
                setIsTestModePanel={setIsTestModePanel}
                buttonPermissions={buttonPermissions}
                t={t}
            />

            {/* Control Dashboard */}
            <ControlDashboard
                showCompetitionBoard={showCompetitionBoard}
                setShowCompetitionBoard={setShowCompetitionBoard}
                controlBoardPosition={controlBoardPosition}
                dashboardScale={dashboardScale}
                handleMouseDownControl={handleMouseDownControl}
                redScore={redScore}
                blueScore={blueScore}
                handleScoreChange={handleScoreChange}
                handleMedical={handleMedical}
                handleWinner={handleWinner}
                handleRemind={handleRemind}
                handleWarn={handleWarn}
                handleKick={handleKick}
                handleBien={handleBien}
                handleNga={handleNga}
                disableRedButtons={disableRedButtons}
                disableBlueButtons={disableBlueButtons}
                buttonPermissions={buttonPermissions}
                t={t}
            />

            {/* Statistics and Ready Indicator - Below Scoreboard */}
            <RefereeStatusBoard
                matchInfo={matchInfo}
                referrerDevices={referrerDevices}
                showCompetitionBoard={showCompetitionBoard}
                setShowCompetitionBoard={setShowCompetitionBoard}
                showControlBar={showControlBar}
                setShowControlBar={setShowControlBar}
                setShowConnectionModal={setShowConnectionModal}
                t={t}
            />

            {/* Modal Lịch sử - Using HistoryModal Component */}
            <HistoryModal
                showHistoryModal={showHistoryModal}
                setShowHistoryModal={setShowHistoryModal}
                actionHistory={actionHistory}
                undoLastAction={undoLastAction}
            />

            {/* Modal Cấu hình - Using MatchConfigModal Component */}
            <MatchConfigModal
                showConfigModal={showConfigModal}
                setShowConfigModal={setShowConfigModal}
                matchInfo={matchInfo}
                setMatchInfo={setMatchInfo}
                buttonPermissions={buttonPermissions}
                setButtonPermissions={setButtonPermissions}
                disableRedButtons={disableRedButtons}
                setDisableRedButtons={setDisableRedButtons}
                disableBlueButtons={disableBlueButtons}
                setDisableBlueButtons={setDisableBlueButtons}
                saveButtonPermissions={saveButtonPermissions}
                currentRound={currentRound}
                setCurrentRound={setCurrentRound}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                totalRounds={(matchInfo.so_hiep || 3) + (matchInfo.so_hiep_phu || 0)}
                roundDuration={matchInfo.thoi_gian_thi_dau || 180}
                keyboardMode={keyboardMode}
            />

            {/* Modal chọn winner - Using WinnerSelectionModal Component */}
            <WinnerSelectionModal
                showWinnerModal={showWinnerModal}
                setShowWinnerModal={setShowWinnerModal}
                redScore={redScore}
                blueScore={blueScore}
                matchInfo={matchInfo}
                handleWinner={handleWinner}
                setIsFinishingMatch={setIsFinishingMatch}
            />

            {/* Modal công bố winner - Using WinnerAnnouncementModal Component */}
            <WinnerAnnouncementModal
                showWinnerAnnouncementModal={showWinnerAnnouncementModal}
                announcedWinner={announcedWinner}
                btnReturnWinner={btnReturnWinner}
                btnConfirmWinner={btnConfirmWinner}
            />

            {/* Match List Modal - Hiển thị danh sách trận đấu (F7) */}
            <MatchListModal
                isOpen={showMatchListModal}
                onClose={() => setShowMatchListModal(false)}
                matches={matchesList}
                onSelectMatch={handleSelectMatch}
                onStartMatch={handleStartMatch}
                currentMatchId={matchInfo?.match_id}
            />

            {/* Connection Manager Modal */}
            <ConnectionManagerModal
                isOpen={showConnectionModal}
                onClose={() => setShowConnectionModal(false)}
                devices={referrerDevices}
                configSystem={matchInfo.config_system || {}}
                onReconnect={handleReconnect}
                onDisconnect={handleDisconnect}
                onRefresh={handleRefreshDevices}
                onInitSocket={handleReConnectionSocket}
                onGenerateQR={generateQR}
                onSetPermissionRef={onSetPermissionRef}
                serverIpHash={serverIpHash.current}
            />

            {/* Modal thông báo chung */}
            <ConfirmModal {...modalProps} />
        </div >
    );
};

export default BangDiemDoiKhang;
