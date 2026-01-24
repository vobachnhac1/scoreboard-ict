import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import axios from "axios";
import ConfirmModal from "../../components/common/ConfirmModal";
import useConfirmModal from "../../hooks/useConfirmModal";
import ConnectionManagerModal from "../MatchScore/components/ConnectionManagerModal";
import RefereeStatusBar from "../MatchScore/components/RefereeStatusBar";

import {
  useSocketEvent,
  emitSocketEvent,
} from "../../config/hooks/useSocketEvents";
import { MSG_TP_CLIENT } from "../../common/Constants";
import {
  connectSocket,
  disconnectSocket,
} from "../../config/redux/reducers/socket-reducer";
import { initSocket as initSocketUtil } from "../../utils/socketUtils";

// Import flag manager utility
import { getFlagImage, getDefaultFlag } from "../../utils/flagManager";

// Import Match Config Modal
import MatchConfigModal from "./MatchConfigModal";
import HistoryModal from "./HistoryModal";
import WinnerSelectionModal from "./WinnerSelectionModal";
import WinnerAnnouncementModal from "./WinnerAnnouncementModal";

// Import helpers
import {
  getActionTypeLabel,
  getActionTypeColorClass,
} from "../../helpers/actionType";

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

// Hàm phát âm thanh chuông
const playBell = () => {
  if (!globalSoundEnabled) return; // Kiểm tra âm thanh có bật không

  try {
    // Dừng tất cả audio đang phát
    stopAllAudios();

    // Khởi tạo audio nếu chưa có
    if (!bellAudio) {
      initBellAudio();
    }

    // Reset về đầu và phát
    bellAudio.currentTime = 0;
    bellAudio.play().catch((error) => {
      console.warn(
        "Không thể phát âm thanh chuông (có thể do chính sách autoplay của trình duyệt):",
        error.message,
      );
    });
  } catch (error) {
    console.error("Lỗi khi phát âm thanh chuông:", error);
  }
};

// Hàm phát âm thanh chiến thắng
const playVictory = () => {
  if (!globalSoundEnabled) return; // Kiểm tra âm thanh có bật không

  try {
    // Dừng tất cả audio đang phát
    stopAllAudios();

    // Khởi tạo audio nếu chưa có
    if (!victoryAudio) {
      initVictoryAudio();
    }

    // Reset về đầu và phát
    victoryAudio.currentTime = 0;
    victoryAudio.play().catch((error) => {
      console.warn(
        "Không thể phát âm thanh chiến thắng (có thể do chính sách autoplay của trình duyệt):",
        error.message,
      );
    });
  } catch (error) {
    console.error("Lỗi khi phát âm thanh chiến thắng:", error);
  }
};

// Hàm phát âm thanh điểm số
const playScoreSound = (team, point) => {
  if (!globalSoundEnabled) return; // Kiểm tra âm thanh có bật không

  try {
    // Dừng tất cả audio đang phát
    stopAllAudios();

    // Khởi tạo audio nếu chưa có
    if (!scoreAudios.red_1) {
      initScoreAudios();
    }

    // Chọn audio phù hợp
    let audio = null;
    if (team === "red" && point === 1) {
      audio = scoreAudios.red_1;
    } else if (team === "red" && point === 2) {
      audio = scoreAudios.red_2;
    } else if (team === "red" && point === 3) {
      audio = scoreAudios.red_3;
    } else if (team === "blue" && point === 1) {
      audio = scoreAudios.blue_1;
    } else if (team === "blue" && point === 2) {
      audio = scoreAudios.blue_2;
    } else if (team === "blue" && point === 3) {
      audio = scoreAudios.blue_3;
    }

    if (audio) {
      // Reset về đầu và phát
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(
          `Không thể phát âm thanh điểm ${team} +${point}:`,
          error.message,
        );
      });
    }
  } catch (error) {
    console.error("Lỗi khi phát âm thanh điểm số:", error);
  }
};

// Hàm phát âm thanh hành động (Ngã, Biên, Nhắc nhở, Cảnh cáo)
const playActionSound = (team, action) => {
  if (!globalSoundEnabled) return; // Kiểm tra âm thanh có bật không

  try {
    // Dừng tất cả audio đang phát
    stopAllAudios();

    // Khởi tạo audio nếu chưa có
    if (!actionAudios.red_down) {
      initActionAudios();
    }

    // Chọn audio phù hợp
    let audio = null;
    if (team === "red" && action === "down") {
      audio = actionAudios.red_down;
    } else if (team === "red" && action === "outline") {
      audio = actionAudios.red_outline;
    } else if (team === "red" && action === "remind") {
      audio = actionAudios.red_remind;
    } else if (team === "red" && action === "warn") {
      audio = actionAudios.red_warn;
    } else if (team === "blue" && action === "down") {
      audio = actionAudios.blue_down;
    } else if (team === "blue" && action === "outline") {
      audio = actionAudios.blue_outline;
    } else if (team === "blue" && action === "remind") {
      audio = actionAudios.blue_remind;
    } else if (team === "blue" && action === "warn") {
      audio = actionAudios.blue_warn;
    }

    if (audio) {
      // Reset về đầu và phát
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(
          `Không thể phát âm thanh ${action} ${team}:`,
          error.message,
        );
      });
    }
  } catch (error) {
    console.error("Lỗi khi phát âm thanh hành động:", error);
  }
};

const Vovinam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.socket);

  // Lấy dữ liệu từ state
  const matchData = location.state?.matchData || {};
  const returnUrl = location.state?.returnUrl || "/management/competition-data";
  const showPreviousResult = location.state?.showPreviousResult || true;

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
  const [showRefConnectionState, setShowRefConnectionState] = useState(false);
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

  // State vô hiệu hóa button
  const [disableRedButtons, setDisableRedButtons] = useState(false);
  const [disableBlueButtons, setDisableBlueButtons] = useState(false);

  // State hiển thị controls (toggle bằng F6)
  const [showControls, setShowControls] = useState(false);

  // State cho hiệu ứng nháy RF khi nhận tín hiệu từ giám định
  // Structure: { red: { 0: false, 1: false, ... }, blue: { 0: false, 1: false, ... } }
  // index tương ứng với RF (0 = RF1, 1 = RF2, ...)
  const [flashingRefs, setFlashingRefs] = useState({ red: {}, blue: {} });

  // State cho button permissions
  const [buttonPermissions, setButtonPermissions] = useState({
    hien_thi_button_diem_1:
      matchData.config_system.hien_thi_button_diem_1 == 1 ? true : false,
    hien_thi_button_diem_2: matchData.config_system.hien_thi_button_diem_2
      ? true
      : false,
    hien_thi_button_diem_3: matchData.config_system.hien_thi_button_diem_3
      ? true
      : false,
    hien_thi_button_diem_5: matchData.config_system.hien_thi_button_diem_5
      ? true
      : false,
    hien_thi_button_diem_10: matchData.config_system.hien_thi_button_diem_10
      ? true
      : false,
    // Hành động
    hien_thi_button_nhac_nho: matchData.config_system.hien_thi_button_nhac_nho
      ? true
      : false,
    hien_thi_button_canh_cao: matchData.config_system.hien_thi_button_canh_cao
      ? true
      : false,
    hien_thi_button_don_chan: matchData.config_system.hien_thi_button_don_chan
      ? true
      : false,
    hien_thi_button_bien: matchData.config_system.hien_thi_button_bien
      ? true
      : false,
    hien_thi_button_nga: matchData.config_system.hien_thi_button_nga
      ? true
      : false,
    hien_thi_button_y_te: matchData.config_system.hien_thi_button_y_te
      ? true
      : false,
    hien_thi_button_thang: matchData.config_system.hien_thi_button_thang
      ? true
      : false,
    // Điều khiển
    hien_thi_button_quay_lai: matchData.config_system.hien_thi_button_quay_lai
      ? true
      : false,
    hien_thi_button_reset: matchData.config_system.hien_thi_button_reset
      ? true
      : false,
    hien_thi_button_lich_su: matchData.config_system.hien_thi_button_lich_su
      ? true
      : false,
    hien_thi_button_cau_hinh: matchData.config_system.hien_thi_button_cau_hinh
      ? true
      : false,
    hien_thi_button_ket_thuc: matchData.config_system.hien_thi_button_ket_thuc
      ? true
      : false,
    hien_thi_button_tran_tiep_theo: matchData.config_system
      .hien_thi_button_tran_tiep_theo
      ? true
      : false,
    hien_thi_button_tran_truoc: matchData.config_system
      .hien_thi_button_tran_truoc
      ? true
      : false,
    hien_thi_button_hiep_phu: matchData.config_system.hien_thi_button_hiep_phu
      ? true
      : false,
    // Thông tin trận đấu
    hien_thi_thong_tin_nhac_nho: matchData.config_system
      .hien_thi_thong_tin_nhac_nho
      ? true
      : false,
    hien_thi_thong_tin_canh_cao: matchData.config_system
      .hien_thi_thong_tin_canh_cao
      ? true
      : false,
    hien_thi_thong_tin_don_chan: matchData.config_system
      .hien_thi_thong_tin_don_chan
      ? true
      : false,
    hien_thi_thong_tin_y_te: matchData.config_system.hien_thi_thong_tin_y_te
      ? true
      : false,
  });

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
    red: matchData.red,
    blue: matchData.blue,

    // red_athlete_id: matchData.red_athlete_id,
    // red_athlete_name: matchData.red_athlete_name,
    // blue_athlete_id: matchData.blue_athlete_id,
    // blue_athlete_name: matchData.blue_athlete_name,

    // Thông tin giải đấu
    // competition_id: matchData.competition_id,
    competition_dk_id: matchData.competition_dk_id,
    // category_id: matchData.category_id,
    ten_giai_dau:
      matchData.config_system.ten_giai_dau ||
      matchData.ten_giai_dau ||
      "GIẢI VÔ ĐỊCH VÕ HIỆN ĐẠI",
    ten_mon_thi: matchData.ten_mon_thi || "VÕ HIỆN ĐẠI",

    // Cấu hình hiệp
    so_hiep: matchData.config_system.so_hiep || 3,
    so_hiep_phu: matchData.config_system.so_hiep_phu || 1,
    so_giam_dinh: matchData.config_system.so_giam_dinh || 3,
    he_diem: matchData.config_system.he_diem || 2,

    // Cấu hình thời gian
    thoi_gian_tinh_diem: matchData.config_system.thoi_gian_tinh_diem || 1000,
    thoi_gian_thi_dau: matchData.config_system.thoi_gian_thi_dau || 90,
    thoi_gian_nghi: matchData.config_system.thoi_gian_nghi || 30,
    thoi_gian_hiep_phu: matchData.config_system.thoi_gian_hiep_phu || 60,
    thoi_gian_y_te: matchData.config_system.thoi_gian_y_te || 120,

    // Thông tin kết quả trận trước (nếu có)
    previous_status: matchData.previous_status,
    previous_winner: matchData.previous_winner,
    previous_scores: matchData.previous_scores,
    winner: matchData.winner,

    // Thông tin khác
    row_index: matchData.row_index,
    config_system: matchData.config_system || {},
  });

  // State cho điểm số
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);

  // Refs để lưu điểm số mới nhất (tránh stale closure)
  const redScoreRef = useRef(0);
  const blueScoreRef = useRef(0);

  // Timer states (từ Timer.jsx cũ)
  const [timeLeft, setTimeLeft] = useState(
    (matchData.config_system.thoi_gian_thi_dau || 180) * 10,
  ); // Lưu theo 0.1s
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [isMedicalTime, setIsMedicalTime] = useState(false); // Thời gian y tế
  const [medicalTimeLeft, setMedicalTimeLeft] = useState(0); // Thời gian y tế còn lại
  const [medicalTeam, setMedicalTeam] = useState(null); // 'red' hoặc 'blue'
  const [showControlBar, setShowControlBar] = useState(true); // true = Control Bar, false = Grid 2 cột
  const timerRef = useRef(null);
  const isHandlingRound = useRef(false);

  // Tạm ngừng công bố kết quả
  const [pauseMatch, setPauseMatch] = useState(false);

  // State cho âm thanh (lấy từ config_system)
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    matchData.config_system?.bat_am_thanh !== 0,
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
    // ⚠️ Không nhận event khi đang nghỉ giải lao hoặc không chạy
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
        console.log("✅ Socket initialized successfully in Vovinam");
      },
      onError: (error) => {
        console.error("❌ Socket initialization failed:", error);
        showError("Không thể kết nối socket. Vui lòng thử lại.");
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
  useSocketEvent("RES_ROOM_ADMIN", (response) => {
    if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
      const devices = Object.values(response.data.ls_conn);
      const transformedDevices = devices
        .filter(
          (device) =>
            device.register_status_code !== "ADMIN" &&
            device?.client_ip != "::1",
        )
        .map((device, index) => ({
          referrer: device.referrer,
          device_name: device.device_name,
          device_ip: device.client_ip || "N/A",
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
        showError("Không tìm thấy thông tin phòng. Vui lòng kết nối lại.");
        return null;
      }
      const roomData = JSON.parse(savedRoom);

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
      showError("Không thể tạo mã QR. Vui lòng thử lại.");
      return null;
    }
  };

  const handleReConnectionSocket = async () => {
    const confirmReconnect = window.confirm(
      "Bạn có chắc chắn muốn tạo lại kết nối socket?\n\nSocket hiện tại sẽ bị ngắt và tạo lại kết nối mới.",
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
          "Cập nhật cấu hình hiển thị buttons",
        );
        return true;
      }
    } catch (error) {
      console.error("Lỗi khi lưu button permissions:", error);
      await showError("Lỗi khi lưu cấu hình. Vui lòng thử lại.");
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

    // Load current room
    const savedRoom = localStorage.getItem("admin_room");
    if (savedRoom) {
      const roomData = JSON.parse(savedRoom);
      setCurrentRoom(roomData);
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

  // Hotkey F6 để toggle hiển thị controls
  useEffect(() => {
    const handleKeyDown = async (e) => {
      console.log("e.key: ", e.key);

      // Bỏ qua nếu đang focus vào input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();
      const handlers = handlersRef.current;

      if (e.key === "Escape") {
        e.preventDefault();
        btnGoBack();
        return;
      }

      // ========== CHỈ CHO PHÉP F1, F5, F6, F7 KHI ĐANG MỞ MODAL ==========
      // F1: Connection Manager Modal
      if (e.key === "F1") {
        e.preventDefault();
        setShowConnectionModal((prev) => !prev);
        return;
      }
      // F5 và F6 luôn hoạt động để mở/đóng modal
      else if (e.key === "F5") {
        // Cấu hình
        e.preventDefault();
        setShowConfigModal((prev) => !prev);
        return;
      } else if (e.key === "F6") {
        // Lịch sử
        e.preventDefault();
        setShowHistoryModal((prev) => !prev);
        return;
      } else if (e.key === "F7") {
        // Toggle Referee Connection State
        e.preventDefault();
        setShowControlBar((prev) => !prev);
        return;
      }
      // thêm nút F10 để mở kết nối thử điểm
      // else if (e.key === "F10") {
      //   e.preventDefault();
      //   // setShowTestConnection((prev) => !prev);
      //   return;
      // }

      // ========== TẮT TẤT CẢ HOTKEY KHÁC KHI ĐANG MỞ MODAL ==========
      if (showConfigModal || showHistoryModal || showConnectionModal) {
        return;
      }

      // ========== PHÍM ĐIỀU KHIỂN CHÍNH ==========
      // Space: Start/Pause timer
      if (key === " ") {
        e.preventDefault();
        console.log("⌨️ Space pressed - isBreakTime:", handlers.isBreakTime);
        if (!handlers.isBreakTime) {
          console.log("🎬 Calling toggleTimer()");
          handlers.toggleTimer();
        }
        return;
      }

      // Ctrl+Z: Undo
      if (e.ctrlKey && key === "z") {
        e.preventDefault();
        console.log("⌨️ Ctrl+Z pressed - isBreakTime:", handlers.isBreakTime);
        if (!handlers.isBreakTime) {
          console.log("↩️ Calling undoLastAction()");
          handlers.undoLastAction();
        }
        return;
      }

      // F10: Hiển thị button
      // if (e.key === 'F10') {
      //   e.preventDefault();
      //   setShowControls(prev => !prev);
      //   return;
      // }

      // ========== PHÍM TẮT ĐỎ ==========
      // Điểm số ĐỎ
      else if (key === "q") {
        // Đỏ +1
        e.preventDefault();
        handlers.handleScoreChange("red", 1);
      } else if (key === "w") {
        // Đỏ +2
        e.preventDefault();
        handlers.handleScoreChange("red", 2);
      } else if (key === "e") {
        // Đỏ +3
        e.preventDefault();
        handlers.handleScoreChange("red", 3);
      } else if (key === "a") {
        // Đỏ -1
        e.preventDefault();
        handlers.handleScoreChange("red", -1);
      } else if (key === "s") {
        // Đỏ -2
        e.preventDefault();
        handlers.handleScoreChange("red", -2);
      } else if (key === "d") {
        // Đỏ -3
        e.preventDefault();
        handlers.handleScoreChange("red", -3);
      }
      // Nhắc nhở & Cảnh cáo ĐỎ
      else if (key === "r") {
        // Đỏ Nhắc nhở +1
        e.preventDefault();
        handlers.handleRemind("red", 1);
      } else if (key === "f") {
        // Đỏ Nhắc nhở -1
        e.preventDefault();
        handlers.handleRemind("red", -1);
      } else if (key === "z") {
        // Đỏ Cảnh cáo +1
        e.preventDefault();
        handlers.handleWarn("red", 1);
      } else if (key === "x") {
        // Đỏ Cảnh cáo -1
        e.preventDefault();
        handlers.handleWarn("red", -1);
      }
      // Hành động ĐỎ
      else if (key === "t") {
        // Đỏ Thắng
        e.preventDefault();
        handlers.handleWinner("red");
      } else if (key === "c") {
        // Đỏ Y tế
        e.preventDefault();
        handlers.handleMedical("red");
      }

      // ========== PHÍM TẮT XANH ==========
      // Điểm số XANH
      else if (key === "p") {
        // Xanh +1
        e.preventDefault();
        handlers.handleScoreChange("blue", 1);
      } else if (key === "o") {
        // Xanh +2
        e.preventDefault();
        handlers.handleScoreChange("blue", 2);
      } else if (key === "i") {
        // Xanh +3
        e.preventDefault();
        handlers.handleScoreChange("blue", 3);
      } else if (key === "l") {
        // Xanh -1
        e.preventDefault();
        handlers.handleScoreChange("blue", -1);
      } else if (key === "k") {
        // Xanh -2
        e.preventDefault();
        handlers.handleScoreChange("blue", -2);
      } else if (key === "j") {
        // Xanh -3
        e.preventDefault();
        handlers.handleScoreChange("blue", -3);
      }
      // Nhắc nhở & Cảnh cáo XANH
      else if (key === "u") {
        // Xanh Nhắc nhở +1
        e.preventDefault();
        handlers.handleRemind("blue", 1);
      } else if (key === "h") {
        // Xanh Nhắc nhở -1
        e.preventDefault();
        handlers.handleRemind("blue", -1);
      } else if (key === "m") {
        // Xanh Cảnh cáo +1
        e.preventDefault();
        handlers.handleWarn("blue", 1);
      } else if (key === "n") {
        // Xanh Cảnh cáo -1
        e.preventDefault();
        handlers.handleWarn("blue", -1);
      }
      // Hành động XANH
      else if (key === "y") {
        // Xanh Thắng
        e.preventDefault();
        handlers.handleWinner("blue");
      } else if (key === "b") {
        // Xanh Y tế
        e.preventDefault();
        handlers.handleMedical("blue");
      }

      // ========== PHÍM TẮT CHUNG ==========
      else if (key === "g") {
        // Reset
        e.preventDefault();
        const confirmed = await showConfirm(
          "Bạn có chắc chắn muốn bắt đầu lại trận đấu từ đầu không?",
          {
            title: "Thông báo",
          },
        );
        if (confirmed === false) return;
        handlers.resetTimer();
      } else if (e.key === "ArrowLeft") {
        // Trận trước (Mũi tên trái)
        e.preventDefault();
        handlers.btnPreviousMatch();
      } else if (e.key === "ArrowRight") {
        // Trận sau (Mũi tên phải)
        e.preventDefault();
        handlers.btnNextMatch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfigModal, showHistoryModal]);

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

        console.log("✅ Hiển thị kết quả trận đã kết thúc:", winnerData);
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

  // tạo gdData từ matchInfo.so_giam_dinh và matchInfo.he_diem
  const generateGdData = () => {
    const soGiamDinh = matchInfo.so_giam_dinh || 3;
    const heDiem = matchInfo.he_diem || 2;
    const gdData = [];
    for (let i = 0; i < heDiem; i++) {
      const row = [];
      for (let j = 0; j < soGiamDinh; j++) {
        row.push(`GĐ${j + 1}`);
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
      // ✅ FIX: Kiểm tra điểm trước khi quyết định chạy hiệp phụ
      if (currentRedScore === currentBlueScore) {
        // Điểm hòa -> Chạy hiệp phụ
        console.log(
          `Kết thúc hiệp ${currentRound}: Điểm hòa ${currentRedScore}-${currentBlueScore} -> Chạy hiệp phụ`,
        );
        startBreakTime();
      } else {
        // Đã có người thắng -> Kết thúc trận luôn
        console.log(
          `Kết thúc hiệp ${currentRound}: ${currentRedScore > currentBlueScore ? "ĐỎ" : "XANH"} thắng ${currentRedScore}-${currentBlueScore} -> Kết thúc trận`,
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
    // Không cho phép start/pause khi đang trong thời gian y tế
    if (isMedicalTime) {
      await showError(
        "Vui lòng kết thúc thời gian y tế trước khi tiếp tục trận đấu",
      );
      return;
    }

    // kiếm tra có vận động viên thắng không nếu có thì hiển thị thông báo
    if (announcedWinner) {
      const confirmed = await showConfirm(
        "Trận đấu đã có kết quả, bạn muốn tiếp tục trận đấu?",
        {
          title: "Thông báo",
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
          console.log("✅ Đã cập nhật trạng thái thành IN");
        } catch (error) {
          console.error("❌ Lỗi khi cập nhật trạng thái:", error);
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
          console.log("✅ Đã cập nhật trạng thái thành IN");
        } catch (error) {
          console.error("❌ Lỗi khi cập nhật trạng thái:", error);
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
        // Bắt đầu hiệp - Phát chuông
        playBell();
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
  };

  // Get status text (từ Timer.jsx)
  const getStatusText = () => {
    const totalMainRounds = matchInfo.so_hiep || 3;
    const extraRounds = matchInfo.so_hiep_phu || 0;
    const totalRounds = totalMainRounds + extraRounds;

    if (currentRound === totalRounds && timeLeft === 0) {
      return "Kết thúc trận đấu";
    }
    if (isBreakTime) {
      return "Thời gian nghỉ";
    }
    return isRunning ? "Đang chạy" : "Tạm dừng";
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
    const teamName = team === "red" ? "Đỏ" : "Xanh";
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
    const teamName = team === "red" ? "Đỏ" : "Xanh";
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
    const teamName = team === "red" ? "Đỏ" : "Xanh";
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
    const teamName = team === "red" ? "Đỏ" : "Xanh";
    const action = value > 0 ? "+" : "-";

    if (team === "red") {
      setKickRed((prev) => Math.max(0, prev + value));
    } else {
      setKickBlue((prev) => Math.max(0, prev + value));
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
    const teamName = team === "red" ? "Đỏ" : "Xanh";
    const opponentTeam = team === "red" ? "blue" : "red";
    const opponentTeamName = opponentTeam === "red" ? "Đỏ" : "Xanh";

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
    const fallenTeamName = fallenTeam === "red" ? "Đỏ" : "Xanh";
    const scoringTeam = fallenTeam === "red" ? "blue" : "red";
    const scoringTeamName = scoringTeam === "red" ? "Đỏ" : "Xanh";

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
  const handleMedical = (team) => {
    const teamName = team === "red" ? "Đỏ" : "Xanh";
    setPauseMatch(false);
    // Tạm dừng timer hiện tại
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
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

    addActionToHistory("medical", team, 0, `[BTN] ${teamName} Y tế`);
    console.log(`🏥 Medical for ${team} - ${matchInfo.thoi_gian_y_te}s`);

    // Bắt đầu đếm ngược thời gian y tế
    timerRef.current = setInterval(() => {
      setMedicalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsMedicalTime(false);
          setMedicalTeam(null);
          console.log("✅ Hết thời gian y tế");
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 100); // 100ms = 0.1s
  };

  // Hàm render điểm giám định với hiệu ứng nháy
  const renderGDScores = (colors, team) => {
    const teamFlashing = flashingRefs[team] || {};
    const justifyClass = team === "red" ? "justify-start" : "justify-end";
    return (
      <div className="flex flex-col gap-1 mt-2 text-white text-center text-xs font-bold">
        {colors.map((colorRow, rowIndex) => {
          // Đảo ngược thứ tự cho BLUE team
          const displayRow =
            team === "blue" ? [...colorRow].reverse() : colorRow;
          return (
            <div key={rowIndex} className={`flex gap-1 ${justifyClass}`}>
              {displayRow.map((gd, i) => {
                // Với BLUE team, index thực tế cần đảo ngược để kiểm tra flashing
                const actualIndex =
                  team === "blue" ? colorRow.length - 1 - i : i;
                // Kiểm tra xem RF này có đang nháy không
                const isFlashing = teamFlashing[actualIndex] === rowIndex;
                // Xác định màu nền base
                let baseColor = "";
                if (rowIndex === 0) {
                  baseColor = !isFlashing ? "bg-yellow-800" : "bg-yellow-200";
                } else if (rowIndex === 1) {
                  baseColor = !isFlashing ? "bg-green-800" : "bg-green-200";
                } else {
                  baseColor = !isFlashing ? "bg-rose-800" : "bg-rose-200";
                }
                return (
                  <div
                    key={`${rowIndex}-${actualIndex}`}
                    className={`w-8 h-8 flex items-center justify-center ${baseColor} rounded`}
                  >
                    {gd}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Hàm lưu kết quả trận đấu
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
        await showSuccess("Đã lưu kết quả trận đấu thành công!");

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
            message: "Trận đấu đã kết thúc",
            matchResult: matchResult,
          },
        });
      } else {
        throw new Error(response.data.message || "Lưu kết quả thất bại");
      }
    } catch (error) {
      console.error("Error finishing match:", error);
      await showError(
        `Lỗi khi lưu kết quả: ${error.message}\n\nVui lòng thử lại hoặc liên hệ quản trị viên.`,
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
        ? matchInfo.red.name || "ĐỎ"
        : matchInfo.blue.name || "XANH";

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
        ? matchInfo.red.name || "ĐỎ"
        : matchInfo.blue.name || "XANH";

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

  const btnConfirmWinner = () => {
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
        console.log("⚠️ Không có competition_dk_id, bỏ qua cập nhật.");
        return 0;
      }

      console.log(
        "🔍 Tìm kiếm pattern win." + currentMatchNo + " trong danh sách...",
      );
      console.log("🏆 VĐV thắng:", { name: winnerName, unit: winnerUnit });

      // Nếu không có VĐV thắng, không cần cập nhật
      if (!winnerName) {
        console.log("⚠️ Không có thông tin VĐV thắng, bỏ qua cập nhật.");
        return 0;
      }

      // Lấy dữ liệu competition
      const response = await axios.get(
        `http://localhost:6789/api/competition-dk/${competition_dk_id}`,
      );
      if (!response?.data?.success || !response?.data?.data) {
        console.log("⚠️ Không thể lấy dữ liệu competition, bỏ qua cập nhật.");
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
              `✅ Tìm thấy "${winPattern}" tại trận ${updatedRow[0]}, cột ${j}`,
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
                console.log(`✅ Đã cập nhật backend - Trận ${updatedRow[0]}`);
              })
              .catch((err) => {
                console.error(
                  `❌ Lỗi cập nhật backend - Trận ${updatedRow[0]}:`,
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
          `✅ Đã cập nhật thành công ${updateRequests.length} trận vào backend!`,
        );
      } else {
        console.log("ℹ️ Không tìm thấy trận nào cần cập nhật.");
      }

      return updateCount;
    } catch (error) {
      console.error("❌ Error updating winner to next matches:", error);
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
          "Trận đấu đang diễn ra. Bạn có chắc chắn muốn quay lại trận trước không?\n\n⚠️ Dữ liệu trận hiện tại sẽ không được lưu!",
          { title: "Cảnh báo", confirmText: "Đồng ý" },
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
        await showError("Không thể tải dữ liệu trận trước!");
        navigate(returnUrl);
        return;
      }

      // 4. Tìm trận trước
      const currentMatch = matchInfo.match_no;
      if (currentMatch <= 1) {
        await showAlert("Đây là trận đầu tiên!");
        return;
      }

      const previousRow = competitionDkData?.data[currentMatch - 1]; // -1 vì quay lại trận trước
      if (!previousRow) {
        await showError("Không tìm thấy trận trước!");
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
      navigate("/scoreboard/vovinam", {
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
      console.error("❌ Lỗi khi quay lại trận trước:", error);
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
        console.log("✅ Trận đã kết thúc, chuyển sang trận tiếp theo");
      } else {
        // Trạng thái WAI hoặc IN -> Cần lưu kết quả trước khi chuyển trận

        // Hỏi xác nhận
        const confirmed = await showWarning(
          "Bạn có chắc chắn muốn kết thúc trận này và chuyển sang trận tiếp theo không?",
          { title: "Xác nhận kết thúc trận", confirmText: "Kết thúc" },
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
        console.log("✅ Đã lưu kết quả trận đấu vào database");

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
            `✅ Đã tự động cập nhật ${updateCount} trận tiếp theo với VĐV thắng: ${winnerName}`,
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
        await showError("Không thể tải dữ liệu trận tiếp theo!");
        navigate(returnUrl);
        return;
      }

      const currentMatch = matchInfo.match_no;
      const nextRow = competitionDkData?.data[currentMatch + 1]; // +1 vì row 0 là header
      if (!nextRow) {
        await showAlert("Đã hết trận đấu! Quay về màn hình quản lý.");
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

      navigate("/scoreboard/vovinam", {
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
      console.error("❌ Lỗi khi chuyển trận:", error);
      await showError(
        "Lỗi khi chuyển sang trận tiếp theo: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // ---------- Thao tác nút "Thoát"    ----------- //
  const btnGoBack = async () => {
    const confirmed = await showConfirm(
      "Bạn có chắc muốn thoát khỏi trận đấu?",
      {
        title: "Xác nhận thoát",
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

  return (
    <div className="bg-black h-screen w-screen text-white flex flex-col items-center justify-start relative overflow-hidden pb-20">
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
          width: 100vw;
          height: 100vh;
          background: radial-gradient(
            circle at center,
            rgba(255, 215, 0, 0.4) 0%,
            rgba(255, 215, 0, 0.2) 30%,
            transparent 70%
          );
          animation: victoryOverlay 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 90;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti 3s linear infinite;
        }
      `}</style>

      {/* Victory Overlay - Toàn màn hình khi có winner */}
      {announcedWinner && <div className="victory-overlay"></div>}

      {/* Thiết kế hiển thị danh sách Logo - Căn giữa hàng ngang */}
      {lsLogo.length > 0 ? (
        <div className="w-full max-w-7xl mx-auto mb-3 mt-3">
          <div className="flex justify-center items-center gap-8 px-8">
            {lsLogo.map((logo, index) => (
              <div
                key={logo.id || index}
                className="flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow rounded-lg"
                style={{ minWidth: "50px", maxWidth: "50px" }}
              >
                <img
                  src={
                    logo.url.startsWith("http")
                      ? logo.url
                      : `http://localhost:6789${logo.url}`
                  }
                  alt={`Logo ${index + 1}`}
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto mb-6 mt-6" />
      )}

      {/* Header */}
      <div className="text-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-yellow-400 leading-tight uppercase">
          {/* Tự động xuống dòng mỗi từ */}
          {matchInfo.ten_giai_dau?.split("\n").map((word, index) => (
            <React.Fragment key={index}>
              {word}
              {index < matchInfo.ten_giai_dau.split(" ").length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>
        <div className="h-1 w-48 bg-yellow-400 mx-auto my-4"></div>
        <p className="text-3xl mt-3 font-bold text-gray-300 uppercase tracking-wider">
          {matchInfo.ten_mon_thi}
        </p>
      </div>

      {/* Scoreboard - Optimized for 1920x1080 */}
      <div className="flex w-full max-w-7xl justify-between items-start px-4 gap-3">
        {/* Đỏ */}
        <div className="flex-1">
          <div
            className={`text-white p-6 rounded flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden relative ${
              announcedWinner?.team === "red" ? "victory-animation" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
              boxShadow:
                "0 10px 40px rgba(255, 0, 0, 0.4), inset 0 -5px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded pointer-events-none"></div>

            <div
              className="text-[200px] font-black leading-none w-full text-center relative z-10"
              style={{
                lineHeight: "320px",
                textShadow:
                  "0 8px 16px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
                fontFamily: "'Arial Black', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {redScore}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <div
                className="h-20 w-20 mr-4 flex justify-center items-center overflow-hidden rounded shadow-lg relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                  border: "1px solid rgba(255, 255, 255, 1)",
                }}
              >
                <img
                  src={getFlagImage(matchInfo.red?.country)}
                  alt={matchInfo.red?.country || "Vietnam"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Nếu lỗi load ảnh, dùng fallback
                    console.error("Error loading flag for RED team");
                    e.target.src = getDefaultFlag();
                  }}
                />
              </div>
              <div className="flex-1 text-white relative z-10">
                <p
                  className="text-xl font-black mb-1 uppercase tracking-wide"
                  style={{
                    textShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {matchInfo.red?.name || "VĐV ĐỎ"}
                </p>
                <p
                  className="text-lg font-semibold opacity-95"
                  style={{
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                  }}
                >
                  {matchInfo.red?.unit || ""}
                </p>
              </div>
            </div>
          </div>
          {renderGDScores(generateGdData(), "red")}
        </div>

        {/* Giữa */}
        <div
          className="flex flex-col items-center justify-center space-y-4 px-4 flex-shrink-0"
          style={{ minWidth: "300px" }}
        >
          <p className="font-bold text-2xl">
            TRẬN SỐ {matchInfo.match_no || "---"}
          </p>
          <p className="text-xl font-bold">{matchInfo.match_type || "---"}</p>
          <p className="text-xl font-bold">{matchInfo.match_weight || "---"}</p>

          {/* Timer display */}
          <div className="bg-yellow-300 text-black font-bold text-2xl px-6 py-3 rounded shadow-lg min-w-[250px] text-center">
            {currentRound > (matchInfo.so_hiep || 3)
              ? `HIỆP PHỤ ${currentRound - (matchInfo.so_hiep || 3)}`
              : `HIỆP ${currentRound}`}
          </div>
          <div
            className={`font-bold px-10 py-4 rounded shadow-lg min-w-[300px] text-center ${
              !isRunning && !isBreakTime
                ? "bg-green-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {(() => {
              const time = isBreakTime
                ? formatTime(breakTimeLeft)
                : formatTime(timeLeft);
              return (
                <>
                  <span className="text-6xl">{time.main}</span>
                  <span className="text-3xl">{time.decimal}</span>
                </>
              );
            })()}
          </div>
          {/* <div className="text-center text-yellow-400 font-bold text-lg">
            {getStatusText()}
          </div> */}

          {/* Thông tin nhắc nhở, cảnh cáo, đòn chân, y tế - Giữa màn hình */}
          <div className="mt-6 space-y-2 w-full max-w-md">
            {/* Nhắc nhở */}
            {buttonPermissions.hien_thi_thong_tin_nhac_nho && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {remindRed}
                </div>
                <div className="text-yellow-400 font-bold text-base uppercase flex-1 text-center">
                  Nhắc nhở
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {remindBlue}
                </div>
              </div>
            )}

            {/* Cảnh cáo */}
            {buttonPermissions.hien_thi_thong_tin_canh_cao && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {warnRed}
                </div>
                <div className="text-orange-400 font-bold text-base uppercase flex-1 text-center">
                  Cảnh cáo
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {warnBlue}
                </div>
              </div>
            )}

            {/* Đòn chân */}
            {buttonPermissions.hien_thi_thong_tin_don_chan && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {kickRed}
                </div>
                <div className="text-cyan-400 font-bold text-base uppercase flex-1 text-center">
                  Đòn chân
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {kickBlue}
                </div>
              </div>
            )}

            {/* Y tế */}
            {buttonPermissions.hien_thi_thong_tin_y_te && (
              <div className="flex items-center justify-between gap-3">
                <div className="bg-red-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {medicalRed}
                </div>
                <div className="text-red-400 font-bold text-base uppercase flex-1 text-center">
                  Y tế
                </div>
                <div className="bg-blue-600 text-white font-bold px-4 py-2 rounded min-w-[60px] text-center text-lg">
                  {medicalBlue}
                </div>
              </div>
            )}
          </div>

          {/* Banner nghỉ giải lao */}
          {!pauseMatch && isBreakTime && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white px-16 py-10 rounded-3xl shadow-2xl border-4 border-yellow-300">
                {/* Decorative corners */}
                {/* <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div> */}

                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-2 rounded-full">
                      <p className="text-3xl font-bold tracking-wider">
                        NGHỈ GIẢI LAO
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-center bg-black/20 backdrop-blur-sm rounded-2xl px-12 py-6">
                    <span className="text-8xl font-black tabular-nums">
                      {formatTime(breakTimeLeft).main}
                    </span>
                    <span className="text-5xl font-bold text-yellow-200 tabular-nums">
                      {formatTime(breakTimeLeft).decimal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner Y TẾ */}
          {!pauseMatch && isMedicalTime && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white px-16 py-10 rounded-3xl shadow-2xl border-4 border-yellow-300">
                {/* Decorative corners */}
                {/* <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div> */}

                <div className="text-center">
                  <div className="mb-3">
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-1 rounded-full">
                      <p className="text-2xl font-bold">
                        {currentRound > (matchInfo.so_hiep || 3)
                          ? `HIỆP PHỤ ${currentRound - (matchInfo.so_hiep || 3)}`
                          : `HIỆP ${currentRound}`}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-2 rounded-full">
                      <p className="text-3xl font-bold tracking-wider">
                        THỜI GIAN Y TẾ
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div
                      className={`inline-block px-10 py-3 rounded-2xl ${medicalTeam === "red" ? "bg-red-700" : "bg-blue-700"} shadow-lg`}
                    >
                      <p className="text-4xl font-black">
                        {medicalTeam === "red"
                          ? matchInfo.red.name
                          : matchInfo.blue.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-center bg-black/20 backdrop-blur-sm rounded-2xl px-12 py-6">
                    <span className="text-8xl font-black tabular-nums">
                      {formatTime(medicalTimeLeft).main}
                    </span>
                    <span className="text-5xl font-bold text-red-200 tabular-nums">
                      {formatTime(medicalTimeLeft).decimal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner tạm ngưng giữa trận - chỉ hiển thị trong hiệp thi đấu - ẩn khi đã trọn VĐV  thắng */}
          {!pauseMatch &&
            !isRunning &&
            !isBreakTime &&
            !isMedicalTime &&
            !ready && (
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
                <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white px-16 py-10 rounded-3xl shadow-2xl border-4 border-yellow-300">
                  {/* Decorative corners */}
                  {/* <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div> */}

                  <div className="text-center">
                    <div className="mb-3">
                      <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-1 rounded-full">
                        <p className="text-2xl font-bold">
                          {currentRound > (matchInfo.so_hiep || 3)
                            ? `HIỆP PHỤ ${currentRound - (matchInfo.so_hiep || 3)}`
                            : `HIỆP ${currentRound}`}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="inline-block bg-white/20 backdrop-blur-sm px-8 py-2 rounded-full">
                        <p className="text-3xl font-bold tracking-wider">
                          TẠM NGƯNG
                        </p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-center bg-black/20 backdrop-blur-sm rounded-2xl px-12 py-6">
                      <span className="text-8xl font-black tabular-nums">
                        {formatTime(timeLeft).main}
                      </span>
                      <span className="text-5xl font-bold text-blue-200 tabular-nums">
                        {formatTime(timeLeft).decimal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Xanh */}
        <div className="flex-1">
          <div
            className={`text-white p-6 rounded flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden relative ${
              announcedWinner?.team === "blue" ? "victory-animation" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #0000FF 0%, #0000CC 100%)",
              boxShadow:
                "0 10px 40px rgba(0, 0, 255, 0.4), inset 0 -5px 20px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Glow effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded pointer-events-none"></div>

            <div
              className="text-[200px] font-black leading-none w-full text-center relative z-10"
              style={{
                lineHeight: "320px",
                textShadow:
                  "0 8px 16px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
                fontFamily: "'Arial Black', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {blueScore}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <div className="flex-1 text-right text-white relative z-10">
                <p
                  className="text-xl font-black mb-1 uppercase tracking-wide"
                  style={{
                    textShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                    fontWeight: "900",
                  }}
                >
                  {matchInfo.blue?.name || "VĐV XANH"}
                </p>
                <p
                  className="text-lg font-semibold opacity-95"
                  style={{
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
                  }}
                >
                  {matchInfo.blue?.unit || ""}
                </p>
              </div>
              <div
                className="h-20 w-20 ml-4 flex justify-center items-center overflow-hidden rounded shadow-lg relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #0000FF 0%, #0000CC 100%)",
                  border: "1px solid rgba(255, 255, 255, 1)",
                }}
              >
                <img
                  src={getFlagImage(matchInfo.blue?.country)}
                  alt={matchInfo.blue?.country || "Vietnam"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Nếu lỗi load ảnh, dùng fallback
                    console.error("Error loading flag for BLUE team");
                    e.target.src = getDefaultFlag();
                  }}
                />
              </div>
            </div>
          </div>
          {renderGDScores(generateGdData(), "blue")}
        </div>
      </div>

      {/* Control Bar - Below Scoreboard */}
      {showControlBar && (
        <div className="fixed bottom-0 left-0 right-0 w-full backdrop-blur-sm z-50">
          <div className="max-w-[1920px] mx-auto px-2 p-3 mb-16 ">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Nút kết thúc thời gian y tế */}
              {isMedicalTime && (
                <button
                  onClick={() => {
                    clearInterval(timerRef.current);
                    setIsMedicalTime(false);
                    setMedicalTeam(null);
                    setMedicalTimeLeft(0);
                    console.log("✅ Kết thúc thời gian y tế");
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center font-bold text-sm gap-2 transition-colors animate-pulse"
                >
                  Y tế
                </button>
              )}

              {/* Nút Thoát */}
              <button
                onClick={() => btnGoBack()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Thoát
              </button>

              {/* Nút Reset */}
              <button
                onClick={resetTimer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Reset
              </button>

              {/* Nút Lịch sử */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Lịch sử
              </button>

              {/* Nút Cấu hình */}
              <button
                onClick={() => setShowConfigModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Cấu hình
              </button>

              {/* Nút Kết thúc */}
              {buttonPermissions.hien_thi_button_ket_thuc && (
                <button
                  onClick={btnFinishMatch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Kết thúc
                </button>
              )}
              {buttonPermissions.hien_thi_button_tran_truoc && (
                <button
                  onClick={btnPreviousMatch}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Trận trước
                </button>
              )}

              {/* Nút Trận sau */}
              {buttonPermissions.hien_thi_button_tran_tiep_theo && (
                <button
                  onClick={btnNextMatch}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Trận sau
                </button>
              )}

              {/* Nút Hiệp phụ */}
              {buttonPermissions.hien_thi_button_hiep_phu && (
                <button
                  onClick={btnExtraRound}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hiệp phụ
                </button>
              )}

              {/* Nút Tắt/Bật âm thanh */}
              <button
                onClick={() => {
                  stopAllAudios();
                  setIsSoundEnabled(!isSoundEnabled);
                }}
                className={`${
                  isSoundEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-600 hover:bg-gray-700"
                } text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl`}
              >
                {isSoundEnabled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isSoundEnabled ? "Âm thanh" : "Tắt tiếng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showControlBar && (
        <div className="mt-2 w-full max-w-7xl pb-32">
          {/* Grid layout: 2 cột cho Đỏ và Xanh */}
          <div className="grid grid-cols-2 gap-2">
            {/* Cột ĐỎ */}
            <div className="flex flex-col">
              {/* Container cho Điểm số và Hành động - dùng flex để tự động dồn */}
              <div className="flex flex-col gap-0.5 flex-1">
                {/* Điểm số ĐỎ - Grid 5 cột, mỗi cột có 2 buttons (+/-) */}
                <div className="grid grid-cols-5 gap-0.5">
                  {/* Cột 1: +1/-1 */}
                  {buttonPermissions.hien_thi_button_diem_1 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("red", 1)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleScoreChange("red", -1)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        -1
                      </button>
                    </div>
                  )}

                  {/* Cột 2: +2/-2 */}
                  {buttonPermissions.hien_thi_button_diem_2 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("red", 2)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        +2
                      </button>
                      <button
                        onClick={() => handleScoreChange("red", -2)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        -2
                      </button>
                    </div>
                  )}

                  {/* Cột 3: +3/-3 */}
                  {buttonPermissions.hien_thi_button_diem_3 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("red", 3)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        +3
                      </button>
                      <button
                        onClick={() => handleScoreChange("red", -3)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        -3
                      </button>
                    </div>
                  )}

                  {/* Cột 4: +5/-5 */}
                  {buttonPermissions.hien_thi_button_diem_5 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("red", 5)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handleScoreChange("red", -5)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        -5
                      </button>
                    </div>
                  )}

                  {/* Cột 5: +10/-10 */}
                  {buttonPermissions.hien_thi_button_diem_10 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("red", 10)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleScoreChange("red", -10)}
                        disabled={disableRedButtons}
                        className={getButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        -10
                      </button>
                    </div>
                  )}
                </div>

                {/* Hành động ĐỎ - Grid 5 cột */}
                <div className="grid grid-cols-5 gap-0.5">
                  {/* Cột 1: Nhắc nhở +/- */}
                  {buttonPermissions.hien_thi_button_nhac_nho && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleRemind("red", 1)}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        Nhắc nhở +
                      </button>
                      <button
                        onClick={() => handleRemind("red", -1)}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        Nhắc nhở -
                      </button>
                    </div>
                  )}

                  {/* Cột 2: Cảnh cáo +/- */}
                  {buttonPermissions.hien_thi_button_canh_cao && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleWarn("red", 1)}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        Cảnh cáo +
                      </button>
                      <button
                        onClick={() => handleWarn("red", -1)}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        Cảnh cáo -
                      </button>
                    </div>
                  )}

                  {/* Cột 3: Đòn chân +/- */}
                  {buttonPermissions.hien_thi_button_don_chan && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleKick("red", 1)}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        Đ.Chân +
                      </button>
                      <button
                        onClick={() => handleKick("red", -1)}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        Đ.Chân -
                      </button>
                    </div>
                  )}

                  {/* Cột 4: Biên/Ngã */}
                  <div className="flex flex-col gap-0.5">
                    {buttonPermissions.hien_thi_button_bien && (
                      <button
                        onClick={() => handleBien("red")}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        Biên
                      </button>
                    )}
                    {buttonPermissions.hien_thi_button_nga && (
                      <button
                        onClick={() => handleNga("red")}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-800 hover:bg-red-900 text-white",
                        )}
                      >
                        Ngã
                      </button>
                    )}
                  </div>

                  {/* Cột 5: Y tế/Thắng */}
                  <div className="flex flex-col gap-0.5">
                    {buttonPermissions.hien_thi_button_y_te && (
                      <button
                        onClick={() => handleMedical("red")}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-red-600 hover:bg-red-700 text-white",
                        )}
                      >
                        Y TẾ
                      </button>
                    )}
                    {buttonPermissions.hien_thi_button_thang && (
                      <button
                        onClick={() => handleWinner("red")}
                        disabled={disableRedButtons}
                        className={getActionButtonClassName(
                          "red",
                          "bg-yellow-600 hover:bg-yellow-500 text-white flex items-center gap-2",
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 00-1.5 1.5v.5h-11v-.5A1.5 1.5 0 002.5 10H2a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013 0V4h2v-.5zM10 14a5 5 0 01-5-5v-1h10v1a5 5 0 01-5 5zm-7 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        THẮNG
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cột XANH */}
            <div className="flex flex-col items-end">
              {/* Container cho Điểm số và Hành động - dùng flex để tự động dồn */}
              <div className="flex flex-col gap-0.5 flex-1 w-full">
                {/* Điểm số XANH - Grid 5 cột, mỗi cột có 2 buttons (+/-) */}
                <div className="grid grid-cols-5 gap-0.5" dir="rtl">
                  {/* Cột 5: +1/-1 */}
                  {buttonPermissions.hien_thi_button_diem_1 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("blue", 1)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        1+
                      </button>
                      <button
                        onClick={() => handleScoreChange("blue", -1)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        1-
                      </button>
                    </div>
                  )}
                  {/* Cột 4: +2/-2 */}
                  {buttonPermissions.hien_thi_button_diem_2 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("blue", 2)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        2+
                      </button>
                      <button
                        onClick={() => handleScoreChange("blue", -2)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        2-
                      </button>
                    </div>
                  )}
                  {/* Cột 3: +3/-3 */}
                  {buttonPermissions.hien_thi_button_diem_3 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("blue", 3)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        3+
                      </button>
                      <button
                        onClick={() => handleScoreChange("blue", -3)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        3-
                      </button>
                    </div>
                  )}
                  {/* Cột 2: +5/-5 */}
                  {buttonPermissions.hien_thi_button_diem_5 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("blue", 5)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        5+
                      </button>
                      <button
                        onClick={() => handleScoreChange("blue", -5)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        5-
                      </button>
                    </div>
                  )}
                  {/* Cột 1: +10/-10 (đảo ngược cho XANH) */}
                  {buttonPermissions.hien_thi_button_diem_10 && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleScoreChange("blue", 10)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        10+
                      </button>
                      <button
                        onClick={() => handleScoreChange("blue", -10)}
                        disabled={disableBlueButtons}
                        className={getButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        10-
                      </button>
                    </div>
                  )}
                </div>

                {/* Hành động XANH - Grid 5 cột */}
                <div className="grid grid-cols-5 gap-0.5" dir="rtl">
                  {/* Cột 1: Nhắc nhở +/- */}
                  {buttonPermissions.hien_thi_button_nhac_nho && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleRemind("blue", 1)}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        + Nhắc nhở
                      </button>
                      <button
                        onClick={() => handleRemind("blue", -1)}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        - Nhắc nhở
                      </button>
                    </div>
                  )}
                  {/* Cột 2: Cảnh cáo +/- */}
                  {buttonPermissions.hien_thi_button_canh_cao && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleWarn("blue", 1)}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        + Cảnh cáo
                      </button>
                      <button
                        onClick={() => handleWarn("blue", -1)}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        - Cảnh cáo
                      </button>
                    </div>
                  )}

                  {/* Cột 3: Đòn chân +/- */}
                  {buttonPermissions.hien_thi_button_don_chan && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleKick("blue", 1)}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        + Đ.Chân
                      </button>
                      <button
                        onClick={() => handleKick("blue", -1)}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        - Đ.Chân
                      </button>
                    </div>
                  )}

                  {/* Cột 4: Biên/Ngã */}
                  <div className="flex flex-col gap-0.5">
                    {buttonPermissions.hien_thi_button_bien && (
                      <button
                        onClick={() => handleBien("blue")}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        Biên
                      </button>
                    )}
                    {buttonPermissions.hien_thi_button_nga && (
                      <button
                        onClick={() => handleNga("blue")}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-800 hover:bg-blue-900 text-white",
                        )}
                      >
                        Ngã
                      </button>
                    )}
                  </div>

                  {/* Cột 5: Y tế/Thắng */}
                  <div className="flex flex-col gap-0.5">
                    {buttonPermissions.hien_thi_button_y_te && (
                      <button
                        onClick={() => handleMedical("blue")}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                        )}
                      >
                        Y TẾ
                      </button>
                    )}
                    {buttonPermissions.hien_thi_button_thang && (
                      <button
                        onClick={() => handleWinner("blue")}
                        disabled={disableBlueButtons}
                        className={getActionButtonClassName(
                          "blue",
                          "bg-yellow-600 hover:bg-yellow-500 text-white flex items-center gap-2",
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 00-1.5 1.5v.5h-11v-.5A1.5 1.5 0 002.5 10H2a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5a1.5 1.5 0 013 0V4h2v-.5zM10 14a5 5 0 01-5-5v-1h10v1a5 5 0 01-5 5zm-7 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        THẮNG
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics and Ready Indicator - Below Scoreboard */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 ">
        <div className="max-w-[1920px] mx-auto px-2 p-3">
          <div className="flex items-center justify-between text-xs">
            {/* Left: Statistics */}
            <div className="flex items-center gap-6">
              <span className="text-gray-400">
                Tổng số:{" "}
                <span className="text-white font-bold text-sm">
                  {matchInfo.config_system?.so_giam_dinh || 3}
                </span>
              </span>
              <span className="text-gray-400">
                Sẵn sàng:{" "}
                <span className="text-green-400 font-bold text-sm">
                  {referrerDevices.filter((s) => s.ready).length}
                </span>
              </span>
              <span className="text-gray-400">
                Đã kết nối:{" "}
                <span className="text-yellow-400 font-bold text-sm">
                  {
                    referrerDevices.filter((s) => s.connected && !s.ready)
                      .length
                  }
                </span>
              </span>
              <span className="text-gray-400">
                Chưa kết nối:{" "}
                <span className="text-red-400 font-bold text-sm">
                  {referrerDevices.filter((s) => !s.connected).length}
                </span>
              </span>

              {/* Layout Switch */}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-600">
                <span className="text-gray-400 text-xs">Chế độ</span>
                <button
                  onClick={() => setShowControlBar(!showControlBar)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showControlBar ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  title={showControlBar ? "Quản lý" : "Thi đấu"}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showControlBar ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-white text-xs font-semibold">
                  {showControlBar ? "Quản lý" : "Thi đấu"}
                </span>
              </div>
            </div>

            {/* Center: Individual GĐ Indicators */}
            <div className="flex items-center gap-2">
              {Array.from(
                { length: matchInfo.config_system?.so_giam_dinh || 3 },
                (_, index) => {
                  const gdNumber = index + 1;
                  // Tìm device có referrer tương ứng với GĐ này
                  const device = referrerDevices.find(
                    (d) => Number(d.referrer) === gdNumber,
                  );
                  // Xác định trạng thái: ready (xanh) hoặc không (đỏ)
                  const isReady = device?.ready || false;
                  const bgColor = isReady ? "bg-green-500" : "bg-red-500";
                  const textColor = "text-white";

                  return (
                    <div
                      key={gdNumber}
                      className={`${bgColor} ${textColor} font-bold px-3 py-1.5 rounded text-sm min-w-[50px] text-center shadow-lg`}
                      title={
                        isReady
                          ? `GĐ${gdNumber}: Sẵn sàng`
                          : `GĐ${gdNumber}: Chưa sẵn sàng`
                      }
                    >
                      GĐ{gdNumber}
                    </div>
                  );
                },
              )}
            </div>

            {/* Right: Ready Indicator */}
            {referrerDevices.filter((s) => s.ready).length ===
            (matchInfo.config_system?.so_giam_dinh || 3) ? (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500 rounded px-4 py-2">
                <span className="text-green-400 font-bold text-sm">
                  Tất cả sẵn sàng
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded px-4 py-2 animate-pulse">
                <span className="text-yellow-400 font-bold text-sm">
                  Chưa đủ giám định
                </span>
              </div>
            )}
            {/* Right: Connection Button */}
            <button
              onClick={() => setShowConnectionModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm shadow-lg hover:shadow-xl font-bold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Kết nối ({referrerDevices.filter((s) => s.ready).length}/
              {matchInfo.config_system?.so_giam_dinh || 3})
            </button>
          </div>
        </div>
      </div>

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
      />

      {/* Modal thông báo chung */}
      <ConfirmModal {...modalProps} />
    </div>
  );
};

export default Vovinam;
