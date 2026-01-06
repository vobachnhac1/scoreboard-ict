import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import axios from "axios";
import ConfirmModal from "../../components/common/ConfirmModal";
import useConfirmModal from "../../hooks/useConfirmModal";
import ConnectionManagerModal from "../MatchScore/components/ConnectionManagerModal";
import RefereeStatusBar from "../MatchScore/components/RefereeStatusBar";

import { useSocketEvent, emitSocketEvent } from "../../config/hooks/useSocketEvents";
import {MSG_TP_CLIENT} from '../../common/Constants'
import { connectSocket, disconnectSocket } from "../../config/redux/reducers/socket-reducer";
import { initSocket as initSocketUtil } from "../../utils/socketUtils";

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
  const { modalProps, showConfirm, showAlert, showWarning, showError, showSuccess } = useConfirmModal();

  // Connection manager states
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showRefConnectionState, setShowRefConnectionState] = useState(true);
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
  const [selectedWinner, setSelectedWinner] = useState(null);    // 
  const [isFinishingMatch, setIsFinishingMatch] = useState(false); // Phân biệt giữa "Thắng" và "Kết thúc"
  const [announcedWinner, setAnnouncedWinner] = useState(null); // {team: 'red'|'blue', name: string, score: number} | Người thắng đang hiển thị hiệu ứng trên bảng điểm
  const [showWinnerAnnouncementModal, setShowWinnerAnnouncementModal] = useState(false); // HIỂN THỊ HIỆU ỨNG CHIẾN THẮNG

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
    hien_thi_button_tran_tiep_theo: matchData.config_system.hien_thi_button_tran_tiep_theo
      ? true
      : false,
    hien_thi_button_tran_truoc: matchData.config_system.hien_thi_button_tran_truoc
      ? true
      : false,
  });

  // set state cho những thông tin chung
  const [matchInfo, setMatchInfo] = useState({
    // Thông tin trận đấu
    match_id: matchData.match_id,
    match_no: matchData.match_no,
    match_type: matchData.match_type,
    match_status: matchData.match_status ?? matchData.status ?? 'WAI',
    match_weight: matchData.match_weight || '',
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
    ten_giai_dau: matchData.config_system.ten_giai_dau || matchData.ten_giai_dau || "GIẢI VÔ ĐỊCH VÕ HIỆN ĐẠI",
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
  const [timeLeft, setTimeLeft] = useState((matchData.config_system.thoi_gian_thi_dau || 180) * 10); // Lưu theo 0.1s
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [isMedicalTime, setIsMedicalTime] = useState(false); // Thời gian y tế
  const [medicalTimeLeft, setMedicalTimeLeft] = useState(0); // Thời gian y tế còn lại
  const [medicalTeam, setMedicalTeam] = useState(null); // 'red' hoặc 'blue'
  const timerRef = useRef(null);
  const isHandlingRound = useRef(false);

  // Tạm ngừng công bố kết quả
  const [pauseMatch, setPauseMatch] = useState(false);

  // Đồng bộ refs với state khi component mount hoặc state thay đổi
  useEffect(() => {
    redScoreRef.current = redScore;
    blueScoreRef.current = blueScore;
  }, [redScore, blueScore]);
  // thực listen
  useSocketEvent(MSG_TP_CLIENT.SCORE_RED, (response) => {
    // khi nhận tín hiệu referrer  tương đương với RF và score  tương đương với indexx => nháy RF1 index==0 đỏ từ bg-yellow-200 -> bg-yellow-800
    console.log("SCORE_RED:", response);
    if(!isRunning) return; 
    // Trigger hiệu ứng nháy cho RF tương ứng
    if (response && typeof response.data.referrer !== 'undefined') {
      const {score, referrer } = response.data;

      const refIndex = Number(referrer) - 1; // 0 = RF1, 1 = RF2, ...

      // Bật hiệu ứng nháy
      setFlashingRefs(prev => ({
        ...prev,
        red: { ...prev.red, [refIndex]: Number(score) - 1 }
      }));

      // Tắt hiệu ứng sau thời gian tính điểm
      const thoiGianTinhDiem = matchInfo.thoi_gian_tinh_diem || 1000; // ms
      setTimeout(() => {
        setFlashingRefs(prev => ({
          ...prev,
          red: { ...prev.red, [refIndex]: -1 }
        }));
      }, thoiGianTinhDiem);
    }
  });

  useSocketEvent(MSG_TP_CLIENT.SCORE_BLUE, (response) => {
      console.log("SCORE_BLUE:", response);
      if(!isRunning) return; 
      // Trigger hiệu ứng nháy cho RF tương ứng
      if (response && typeof response.data.referrer !== 'undefined') {
        const {score, referrer } = response.data;
        const refIndex = Number(response.data.referrer) - 1; // 0 = RF1, 1 = RF2, ...
        // score => 1: nhảy vàng | 2: nhảy xanh lá | 3: nhảy đỏ

        // Bật hiệu ứng nháy
        setFlashingRefs(prev => ({
          ...prev,
          blue: { ...prev.blue, [refIndex]: Number(score) - 1 }
        }));

        // Tắt hiệu ứng sau thời gian tính điểm
        const thoiGianTinhDiem = matchInfo.thoi_gian_tinh_diem || 1000; // ms
        setTimeout(() => {
          setFlashingRefs(prev => ({
            ...prev,
            blue: { ...prev.blue, [refIndex]: -1 }
          }));
        }, thoiGianTinhDiem);
      }
  });
  // SCORE_RESULT
  useSocketEvent(MSG_TP_CLIENT.SCORE_RESULT, (response)=>{
    console.log("SCORE_RESULT:", response);
    if(!isRunning) return; 
    if(response?.data?.team == 'red'){
      redScoreRef.current += response.data.point;
      setRedScore(redScoreRef.current);
    }else if(response?.data?.team == 'blue'){
      blueScoreRef.current += response.data.point;
      setBlueScore(blueScoreRef.current);
    }
  })

  // ========== Socket Connection Management ==========

  // Hàm khởi tạo socket connection
  const initSocket = async (forceReConnection = false) => {
    const connected = await initSocketUtil({
      dispatch,
      connectSocket,
      socket,
      role: 'admin',
      onSuccess: () => {
        console.log("✅ Socket initialized successfully in Vovinam");
      },
      onError: (error) => {
        console.error("❌ Socket initialization failed:", error);
        showError("Không thể kết nối socket. Vui lòng thử lại.");
      },
      forceReConnection: forceReConnection,
      disconnectSocket: disconnectSocket
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
    console.log("Receive from server RES_ROOM_ADMIN:", response);
    if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
      const devices = Object.values(response.data.ls_conn);
      console.log('devices: ', devices);

      const transformedDevices = devices
        .filter(device => (device.register_status_code !== 'ADMIN' && device?.client_ip != '::1'))
        .map((device, index) => ({
          referrer: device.referrer,
          device_name: device.device_name,
          device_ip: device.client_ip || 'N/A',
          connected: device.connect_status_code === 'CONNECTED',
          socket_id: device.socket_id,
          room_id: device.room_id,
          ready: device.referrer != 0 && device.register_status_code === 'CONNECTED'
        }));

      setReferrerDevices(transformedDevices);
      console.log('transformedDevices: ', transformedDevices);
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
        method: 'get',
        maxBodyLength: Infinity,
        baseURL: "http://localhost:6789/api/config/get-qr-active",
        params: {
          room_id: roomData.room_id
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
      "Bạn có chắc chắn muốn tạo lại kết nối socket?\n\nSocket hiện tại sẽ bị ngắt và tạo lại kết nối mới."
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
      accepted: referrer == 0 ? 'pending' : 'approved',
      status: 'active',
    });
  };

  // ========== End Socket Connection Management ==========

  // Function để lưu button permissions về server
  const saveButtonPermissions = async () => {
    try {
      const params= {
        hien_thi_button_ket_thuc: buttonPermissions?.hien_thi_button_ket_thuc ? 1: 0,
        hien_thi_button_diem_1: buttonPermissions?.hien_thi_button_diem_1 ? 1: 0, 
        hien_thi_button_diem_2: buttonPermissions?.hien_thi_button_diem_2 ? 1: 0,
        hien_thi_button_diem_3: buttonPermissions?.hien_thi_button_diem_3 ? 1: 0,
        hien_thi_button_diem_5: buttonPermissions?.hien_thi_button_diem_5 ? 1: 0,
        hien_thi_button_diem_10: buttonPermissions?.hien_thi_button_diem_10 ? 1: 0,
        hien_thi_button_nhac_nho: buttonPermissions?.hien_thi_button_nhac_nho ? 1: 0, 
        hien_thi_button_canh_cao: buttonPermissions?.hien_thi_button_canh_cao ? 1: 0,
        hien_thi_button_don_chan: buttonPermissions?.hien_thi_button_don_chan ? 1: 0,
        hien_thi_button_bien: buttonPermissions?.hien_thi_button_bien ? 1: 0,
        hien_thi_button_nga: buttonPermissions?.hien_thi_button_nga ? 1: 0, 
        hien_thi_button_y_te: buttonPermissions?.hien_thi_button_y_te ? 1: 0,
        hien_thi_button_thang: buttonPermissions?.hien_thi_button_thang ? 1: 0,
        hien_thi_button_quay_lai: buttonPermissions?.hien_thi_button_quay_lai ? 1: 0,
        hien_thi_button_reset: buttonPermissions?.hien_thi_button_reset ? 1: 0,
        hien_thi_button_lich_su: buttonPermissions?.hien_thi_button_lich_su ? 1: 0,
        hien_thi_button_cau_hinh: buttonPermissions?.hien_thi_button_cau_hinh ? 1: 0,
        hien_thi_button_ket_thuc: buttonPermissions?.hien_thi_button_ket_thuc ? 1: 0,
        hien_thi_button_tran_tiep_theo: buttonPermissions?.hien_thi_button_tran_tiep_theo ? 1: 0,
        hien_thi_button_tran_truoc: buttonPermissions?.hien_thi_button_tran_truoc ? 1: 0,
      }

      const response = await axios.post(
        "http://localhost:6789/api/config/update-config-system",
        params
      );
      if (response.data.success) {
        console.log("Lưu button permissions thành công");
        addActionToHistory(
          "config",
          null,
          0,
          "Cập nhật cấu hình hiển thị buttons"
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

      const response = await axios.get(`http://localhost:6789/api/competition-dk/${matchInfo.competition_dk_id}`);
      if (response?.data?.success && response?.data?.data) {
        const competitionData = response.data.data;

        // Tìm row tương ứng với trận đấu hiện tại
        if (competitionData.data && matchInfo.row_index !== undefined) {
          const rowIndex = matchInfo.row_index + 1; // +1 vì row 0 là header
          const rowData = competitionData.data[rowIndex];

          if (rowData) {
            // Cập nhật thông tin VĐV nếu có thay đổi
            const newRedName = rowData[3] || '';
            const newRedUnit = rowData[4] || '';
            const newBlueName = rowData[6] || '';
            const newBlueUnit = rowData[7] || '';

            // Chỉ cập nhật nếu có thay đổi
            setMatchInfo(prev => {
              const currentRedName = prev.red?.name || '';
              const currentRedUnit = prev.red?.unit || '';
              const currentBlueName = prev.blue?.name || '';
              const currentBlueUnit = prev.blue?.unit || '';

              if (newRedName !== currentRedName || newRedUnit !== currentRedUnit ||
                  newBlueName !== currentBlueName || newBlueUnit !== currentBlueUnit) {

                console.log('Đã cập nhật thông tin VĐV từ backend:', {
                  red: { name: newRedName, unit: newRedUnit },
                  blue: { name: newBlueName, unit: newBlueUnit }
                });

                return {
                  ...prev,
                  red: {
                    ...prev.red,
                    name: newRedName,
                    unit: newRedUnit
                  },
                  blue: {
                    ...prev.blue,
                    name: newBlueName,
                    unit: newBlueUnit
                  }
                };
              }

              return prev;
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
    }finally {
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
    emitSocketEvent('DK_INFO',{
      match_id: matchData.match_id,
      match_no: 'Trận '+ matchData.match_no,
      ten_giai_dau: matchData.ten_giai_dau,
      ten_mon_thi: matchData.ten_mon_thi,
      match_name: matchData.match_name,
      red: matchInfo?.red ?? { name: '', unit: ''},
      blue: matchInfo?.blue ?? { name: '', unit: ''},
      round: currentRound > (matchInfo.so_hiep || 3)
            ? `Hiệp phụ ${currentRound - (matchInfo.so_hiep || 3)}`
            : `Hiệp ${currentRound}`
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
    };
  });

  // Tự động tạm dừng timer khi mở modal hoặc đã chọn winner
  useEffect(() => {
    const shouldPause = showConnectionModal ||  showConfigModal || showHistoryModal || showWinnerModal || announcedWinner !== null;

    // CHỈ TẠM DỪNG, KHÔNG TỰ ĐỘNG RESUME
    if (shouldPause && isRunning && !isMedicalTime) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      console.log('⏸️ Timer tạm dừng do mở modal hoặc đã chọn winner');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfigModal, showHistoryModal, showWinnerModal, announcedWinner]);

  // Hotkey F6 để toggle hiển thị controls
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Bỏ qua nếu đang focus vào input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      const handlers = handlersRef.current;

      if(e.key === 'Escape'){
        e.preventDefault();
        btnGoBack()
        return;
      }

      // ========== CHỈ CHO PHÉP F1, F5, F6, F7 KHI ĐANG MỞ MODAL ==========
      // F1: Connection Manager Modal
      if (e.key === 'F1') {
        e.preventDefault();
        setShowConnectionModal(prev => !prev);
        return;
      }

      // F5 và F6 luôn hoạt động để mở/đóng modal
      if (e.key === 'F5') { // Cấu hình
        e.preventDefault();
        setShowConfigModal(prev => !prev);
        return;
      } else if (e.key === 'F6') { // Lịch sử
        e.preventDefault();
        setShowHistoryModal(prev => !prev);
        return;
      } else if (e.key === 'F7') { // Toggle Referee Connection State
        e.preventDefault();
        setShowRefConnectionState(prev => !prev);
        return;
      }

      // ========== TẮT TẤT CẢ HOTKEY KHÁC KHI ĐANG MỞ MODAL ==========
      if (showConfigModal || showHistoryModal || showConnectionModal) {
        return;
      }

      // ========== PHÍM ĐIỀU KHIỂN CHÍNH ==========
      // Space: Start/Pause timer
      if (key === ' ') {
        e.preventDefault();
        console.log('⌨️ Space pressed - isBreakTime:', handlers.isBreakTime);
        if (!handlers.isBreakTime) {
          console.log('🎬 Calling toggleTimer()');
          handlers.toggleTimer();
        }
        return;
      }

      // Ctrl+Z: Undo
      if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        console.log('⌨️ Ctrl+Z pressed - isBreakTime:', handlers.isBreakTime);
        if (!handlers.isBreakTime) {
          console.log('↩️ Calling undoLastAction()');
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
      else if (key === 'q') { // Đỏ +1
        e.preventDefault();
        handlers.handleScoreChange('red', 1);
      } else if (key === 'w') { // Đỏ +2
        e.preventDefault();
        handlers.handleScoreChange('red', 2);
      } else if (key === 'e') { // Đỏ +3
        e.preventDefault();
        handlers.handleScoreChange('red', 3);
      } else if (key === 'a') { // Đỏ -1
        e.preventDefault();
        handlers.handleScoreChange('red', -1);
      } else if (key === 's') { // Đỏ -2
        e.preventDefault();
        handlers.handleScoreChange('red', -2);
      } else if (key === 'd') { // Đỏ -3
        e.preventDefault();
        handlers.handleScoreChange('red', -3);
      }
      // Nhắc nhở & Cảnh cáo ĐỎ
      else if (key === 'r') { // Đỏ Nhắc nhở +1
        e.preventDefault();
        handlers.handleRemind('red', 1);
      } else if (key === 'f') { // Đỏ Nhắc nhở -1
        e.preventDefault();
        handlers.handleRemind('red', -1);
      } else if (key === 'z') { // Đỏ Cảnh cáo +1
        e.preventDefault();
        handlers.handleWarn('red', 1);
      } else if (key === 'x') { // Đỏ Cảnh cáo -1
        e.preventDefault();
        handlers.handleWarn('red', -1);
      }
      // Hành động ĐỎ
      else if (key === 't') { // Đỏ Thắng
        e.preventDefault();
        handlers.handleWinner('red');
      } else if (key === 'c') { // Đỏ Y tế
        e.preventDefault();
        handlers.handleMedical('red');
      }

      // ========== PHÍM TẮT XANH ==========
      // Điểm số XANH
      else if (key === 'p') { // Xanh +1
        e.preventDefault();
        handlers.handleScoreChange('blue', 1);
      } else if (key === 'o') { // Xanh +2
        e.preventDefault();
        handlers.handleScoreChange('blue', 2);
      } else if (key === 'i') { // Xanh +3
        e.preventDefault();
        handlers.handleScoreChange('blue', 3);
      } else if (key === 'l') { // Xanh -1
        e.preventDefault();
        handlers.handleScoreChange('blue', -1);
      } else if (key === 'k') { // Xanh -2
        e.preventDefault();
        handlers.handleScoreChange('blue', -2);
      } else if (key === 'j') { // Xanh -3
        e.preventDefault();
        handlers.handleScoreChange('blue', -3);
      }
      // Nhắc nhở & Cảnh cáo XANH
      else if (key === 'u') { // Xanh Nhắc nhở +1
        e.preventDefault();
        handlers.handleRemind('blue', 1);
      } else if (key === 'h') { // Xanh Nhắc nhở -1
        e.preventDefault();
        handlers.handleRemind('blue', -1);
      } else if (key === 'm') { // Xanh Cảnh cáo +1
        e.preventDefault();
        handlers.handleWarn('blue', 1);
      } else if (key === 'n') { // Xanh Cảnh cáo -1
        e.preventDefault();
        handlers.handleWarn('blue', -1);
      }
      // Hành động XANH
      else if (key === 'y') { // Xanh Thắng
        e.preventDefault();
        handlers.handleWinner('blue');
      } else if (key === 'b') { // Xanh Y tế
        e.preventDefault();
        handlers.handleMedical('blue');
      }

      // ========== PHÍM TẮT CHUNG ==========
      else if (key === 'g') { // Reset
        e.preventDefault();
        const confirmed = await showConfirm("Bạn có chắc chắn muốn bắt đầu lại trận đấu từ đầu không?", {
          title: "Thông báo"
        });
        if(confirmed === false) return;
        handlers.resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfigModal, showHistoryModal]);

  // Hiển thị kết quả khi quay lại trận đã kết thúc
  useEffect(() => {
    if (showPreviousResult && matchInfo.previous_status === 'FIN' && matchInfo.previous_winner) {
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
          name: winner === 'red' ? matchInfo.red.name : matchInfo.blue.name,
          score: winner === 'red' ? scores.red : scores.blue,
          teamName: winner === 'red' ? matchInfo.red.unit : matchInfo.blue.unit
        };

        // Hiển thị animation thắng
        setAnnouncedWinner(winnerData);

        console.log("✅ Hiển thị kết quả trận đã kết thúc:", winnerData);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showPreviousResult, matchInfo.previous_status, matchInfo.previous_winner, matchInfo.previous_scores]);

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
  useEffect(()=>{ 
    if(isBreakTime){
      // thực hiện vô hiệu hoá nút 
      setDisableRedButtons(true);
      setDisableBlueButtons(true);
    }else {
      setDisableRedButtons(false);
      setDisableBlueButtons(false);
    }
  },[isBreakTime]);

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
        "http://localhost:6789/api/config/logos"
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
        row.push(`RF${j + 1}`);
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
          remind: 0, // nhác nhở
          warn: 0, // cảnh cáo
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
          remind: 0, // nhác nhở
          warn: 0, // cảnh cáo
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
        console.log(`Kết thúc hiệp ${currentRound}: Điểm hòa ${currentRedScore}-${currentBlueScore} -> Chạy hiệp phụ`);
        startBreakTime();
      } else {
        // Đã có người thắng -> Kết thúc trận luôn
        console.log(`Kết thúc hiệp ${currentRound}: ${currentRedScore > currentBlueScore ? 'ĐỎ' : 'XANH'} thắng ${currentRedScore}-${currentBlueScore} -> Kết thúc trận`);
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
    emitSocketEvent('DK_INFO',{
      match_id: matchData.match_id,
      match_no: 'Trận '+ matchData.match_no,
      ten_giai_dau: matchData.ten_giai_dau,
      ten_mon_thi: matchData.ten_mon_thi,
      match_name: matchData.match_name,
      red: matchInfo?.red ?? { name: '', unit: ''},
      blue: matchInfo?.blue ?? { name: '', unit: ''},
      round: currentRound > (matchInfo.so_hiep || 3)
            ? `Hiệp phụ ${currentRound - (matchInfo.so_hiep || 3)}`
            : `Hiệp ${currentRound}`
    });
  };

  // Toggle timer (từ Timer.jsx)
  const toggleTimer = async () => {
    // Không cho phép start/pause khi đang trong thời gian y tế
    if (isMedicalTime) {
      await showError("Vui lòng kết thúc thời gian y tế trước khi tiếp tục trận đấu");
      return;
    }

    // kiếm tra có vận động viên thắng không nếu có thì hiển thị thông báo
    if(announcedWinner){
      const confirmed = await showConfirm("Trận đấu đã có kết quả, bạn muốn tiếp tục trận đấu?", {
        title: "Thông báo"
      });
      if(confirmed === false) return;
      setAnnouncedWinner(null);
      // cập nhật lại thông trạng thái 
      const currentStatus = matchInfo.match_status;
      if (currentStatus === 'FIN') {
        try {
          // xoá history trước đó
          // tạo thông tin trận 
          console.log('🔄 Cập nhật trạng thái từ FIN → IN');
          await axios.put(`http://localhost:6789/api/competition-match/${matchInfo.match_id}/status`, {
            status: 'IN', 
            winner: 'none'
          });
          // Cập nhật matchInfo
          setMatchInfo({ ...matchInfo, match_status: 'IN' });
          console.log('✅ Đã cập nhật trạng thái thành IN');
        } catch (error) {
          console.error('❌ Lỗi khi cập nhật trạng thái:', error);
          await showError('Lỗi khi cập nhật trạng thái trận đấu: ' + (error.response?.data?.message || error.message));
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
      if (currentStatus === 'WAI') {
        try {
          console.log('🔄 Cập nhật trạng thái từ WAI → IN');
          await axios.put(`http://localhost:6789/api/competition-match/${matchInfo.match_id}/status`, {
            status: 'IN'
          });
          // Cập nhật matchInfo
          setMatchInfo({ ...matchInfo, match_status: 'IN' });
          console.log('✅ Đã cập nhật trạng thái thành IN');
        } catch (error) {
          console.error('❌ Lỗi khi cập nhật trạng thái:', error);
          await showError('Lỗi khi cập nhật trạng thái trận đấu: ' + (error.response?.data?.message || error.message));
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
  };

  // Hàm xử lý nhắc nhở
  const handleRemind = (team, value) => {
    const teamName = team === "red" ? "Đỏ" : "Xanh";
    const action = value > 0 ? "+" : "-";

    if (team === "red") {
      setRemindRed((prev) => Math.max(0, prev + value));
    } else {
      setRemindBlue((prev) => Math.max(0, prev + value));
    }

    addActionToHistory("remind", team, value, `[BTN] ${teamName} Nhắc nhở ${action}1`);
  };

  // Hàm xử lý cảnh cáo
  const handleWarn = (team, value) => {
    const teamName = team === "red" ? "Đỏ" : "Xanh";
    const action = value > 0 ? "+" : "-";

    if (team === "red") {
      setWarnRed((prev) => Math.max(0, prev + value));
    } else {
      setWarnBlue((prev) => Math.max(0, prev + value));
    }

    addActionToHistory("warn", team, value, `[BTN] ${teamName} Cảnh cáo ${action}1`);
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
      `[BTN] ${teamName} Đòn chân ${action}1`
    );
  };

  // Hàm xử lý Biên (team bị trừ điểm)
  const handleBien = (team) => {
    const teamName = team === "red" ? "Đỏ" : "Xanh";

    if (team === "red") {
      setRedScore((prev) => {
        const newScore = Math.max(-99, prev - 1);
        redScoreRef.current = newScore; // Cập nhật ref
        return newScore;
      });
    } else {
      setBlueScore((prev) => {
        const newScore = Math.max(-99, prev - 1);
        blueScoreRef.current = newScore; // Cập nhật ref
        return newScore;
      });
    }

    addActionToHistory("score", team, -1, `[BTN] ${teamName} Biên: -1 điểm ${teamName}`);
  };

  // Hàm xử lý Ngã (team đối thủ được cộng điểm)
  const handleNga = (fallenTeam) => {
    const fallenTeamName = fallenTeam === "red" ? "Đỏ" : "Xanh";
    const scoringTeam = fallenTeam === "red" ? "blue" : "red";
    const scoringTeamName = scoringTeam === "red" ? "Đỏ" : "Xanh";

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
    addActionToHistory("score", scoringTeam, 1, `[BTN] ${fallenTeamName} Ngã : +1 điểm ${scoringTeamName}`);
  };

  // Hàm xử lý y tế
  const handleMedical = (team) => {
    const teamName = team === "red" ? "Đỏ" : "Xanh";
    setPauseMatch(false)
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
          timerRef.current = null
          return 0;
        }
        return prev - 1;
      });
    }, 100); // 100ms = 0.1s
  };

  // Hàm render điểm giám định với hiệu ứng nháy
  const renderGDScores = (colors, team) => {
    const teamFlashing = flashingRefs[team] || {};
    const numGrid = matchInfo.so_giam_dinh == 5? 'grid-cols-5' : 'grid-cols-3'
    return (
      <div className={`grid ${numGrid} gap-1 mt-2 w-full text-black text-center text-sm font-bold`}>
        {colors.map((colorRow, rowIndex) =>
          colorRow.map((gd, i) => {
            // Kiểm tra xem RF này có đang nháy không
            const isFlashing = teamFlashing[i] === rowIndex;
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
                key={`${rowIndex}-${i}`}
                className={`py-1 px-2 ${baseColor}`}
              >
                {gd}
              </div>
            );
          })
        )}
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
        matchResult
      );

      if (response.data.success) {
        await showSuccess("Đã lưu kết quả trận đấu thành công!");

        // Tracking action
        addActionToHistory(
          "finish",
          winner,
          0,
          `Kết thúc trận đấu - ${winnerText} ${winner ? "THẮNG" : ""}`
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
        `Lỗi khi lưu kết quả: ${error.message}\n\nVui lòng thử lại hoặc liên hệ quản trị viên.`
      );
    }
  };

  // Helper function để tạo className cho button với disabled state
  const getButtonClassName = (team, baseColor, isDisabled) => {
    const disabled = team === "red" ? disableRedButtons : disableBlueButtons;
    if (disabled || isDisabled) {
      return "bg-gray-400 cursor-not-allowed text-gray-600 font-bold py-0.5 text-[10px] transition-colors";
    }
    return `${baseColor} font-bold py-0.5 text-[10px] transition-colors`;
  };

  const getActionButtonClassName = (team, baseColor, isDisabled) => {
    const disabled = team === "red" ? disableRedButtons : disableBlueButtons;
    if (disabled || isDisabled) {
      return "bg-gray-400 cursor-not-allowed text-gray-600 font-bold py-1 transition-colors text-[10px]";
    }
    return `${baseColor} font-bold py-1 transition-colors text-[10px]`;
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
  const btnFinishMatch = async (finalRedScore = null, finalBlueScore = null) => {
    // TH1: nhấn nút Thắng -> Nhấn nút 'Kết thúc'
    // TH2: nhán nút 'Kết thúc'
    // TH3: Tự động gọi hàm khi kết thúc thời gian

    // Sử dụng điểm số được truyền vào hoặc điểm số hiện tại
    const currentRedScore = finalRedScore !== null ? finalRedScore : redScore;
    const currentBlueScore = finalBlueScore !== null ? finalBlueScore : blueScore;

    // 1. Đã xác định VĐV thắng
    if(announcedWinner){
      btnNextMatch();
      return
    }

    // 2. Chưa xác định nên tính toán điểm RED-BLUE
    if (currentRedScore > currentBlueScore) {
      const winnerData = {
        team: 'red',
        name: matchInfo.red.name,
        score: currentRedScore ,
        teamName: matchInfo.red.unit
      };
      setAnnouncedWinner(winnerData);
    } else if (currentBlueScore > currentRedScore) {
      const winnerData = {
        team: 'blue',
        name: matchInfo.blue.name,
        score: currentBlueScore ,
        teamName: matchInfo.blue.unit,
      };
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
    if(announcedWinner){
      btnNextMatch();
      return 
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
        teamName: winner === "red" ? matchInfo.red.unit : matchInfo.blue.unit
      });
    } else {
      // Chỉ hiển thị thông tin (từ nút "Thắng")
      const teamName = winner === "red" ? matchInfo.red.unit : matchInfo.blue.unit;
      // Hiển thị modal công bố thay vì alert
      setAnnouncedWinner({
        team: winner,
        name: winnerText,
        score: winner === "red" ? redScore : blueScore,
        teamName: teamName
      }); 
      // Hiển thị hiệu ứng trên bảng điểm
      setShowWinnerAnnouncementModal(true);
      // Thêm vào lịch sử
      addActionToHistory("winner", winner, 0, `Chọn ${teamName} (${winnerText}) thắng`);
      // Lưu trạn đấu

    }
  }; 

  // ---------- Thao tác nút "THẮNG"    ----------- //
  const handleWinner = (team, quick) => {
    const teamName = team === "red" ? matchInfo.red.unit : matchInfo.blue.unit;
    const athleteName = team === "red"
      ? matchInfo.red.name || "ĐỎ"
      : matchInfo.blue.name || "XANH";

    // Hiển thị modal công bố vận động viên thắng
    const winnerData = {
      team: team,
      name: athleteName,
      score: team === "red" ? redScore : blueScore,
      teamName: teamName
    };
    // setReady | setIsRunning | setIsBreakTime
    setPauseMatch(true)
    if(!quick){
      setAnnouncedWinner(winnerData);
      setShowWinnerAnnouncementModal(true);
      // Thêm vào lịch sử
    }else{
      setAnnouncedWinner(winnerData);
      setShowWinnerModal(false);
      setIsFinishingMatch(false);
    } 
  };

  const btnClearWinner = () => {
    setAnnouncedWinner(null);
    setShowWinnerAnnouncementModal(false);
  }

  const btnReturnWinner =()=>{
    setAnnouncedWinner(null);
    setShowWinnerAnnouncementModal(false);
  }

  const btnConfirmWinner = () =>{
    setShowWinnerAnnouncementModal(false);
  }

  // Hàm tự động cập nhật VĐV thắng vào các trận tiếp theo
  const updateWinnerToNextMatches = async (currentMatchNo, winner, winnerName, winnerUnit) => {
    try {
      const competition_dk_id = matchInfo.competition_dk_id;
      if (!competition_dk_id) {
        console.log('⚠️ Không có competition_dk_id, bỏ qua cập nhật.');
        return 0;
      }

      console.log('🔍 Tìm kiếm pattern win.' + currentMatchNo + ' trong danh sách...');
      console.log('🏆 VĐV thắng:', { name: winnerName, unit: winnerUnit });

      // Nếu không có VĐV thắng, không cần cập nhật
      if (!winnerName) {
        console.log('⚠️ Không có thông tin VĐV thắng, bỏ qua cập nhật.');
        return 0;
      }

      // Lấy dữ liệu competition
      const response = await axios.get(`http://localhost:6789/api/competition-dk/${competition_dk_id}`);
      if (!response?.data?.success || !response?.data?.data) {
        console.log('⚠️ Không thể lấy dữ liệu competition, bỏ qua cập nhật.');
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
          const cellValue = String(rowData[j] || '').toLowerCase().trim();

          if (cellValue === winPattern.toLowerCase()) {
            // Tìm thấy pattern, cập nhật tên VĐV thắng
            console.log(`✅ Tìm thấy "${winPattern}" tại trận ${updatedRow[0]}, cột ${j}`);

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
          console.log(`📝 Cập nhật backend - Trận ${updatedRow[0]}: ${winnerName} (${winnerUnit})`);

          updateRequests.push(
            axios.put(`http://localhost:6789/api/competition-dk/${competition_dk_id}/row/${i}`, { data: updatedRow })
              .then(() => {
                console.log(`✅ Đã cập nhật backend - Trận ${updatedRow[0]}`);
              })
              .catch(err => {
                console.error(`❌ Lỗi cập nhật backend - Trận ${updatedRow[0]}:`, err);
                throw err;
              })
          );
        }
      }

      // Chờ tất cả requests hoàn thành
      if (updateRequests.length > 0) {
        console.log(`⏳ Đang cập nhật ${updateRequests.length} trận vào backend...`);
        await Promise.all(updateRequests);
        console.log(`✅ Đã cập nhật thành công ${updateRequests.length} trận vào backend!`);
      } else {
        console.log('ℹ️ Không tìm thấy trận nào cần cập nhật.');
      }

      return updateCount;
    } catch (error) {
      console.error('❌ Error updating winner to next matches:', error);
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

      if (['IN'].includes(currentStatus)) {
        const confirmed = await showWarning(
          "Trận đấu đang diễn ra. Bạn có chắc chắn muốn quay lại trận trước không?\n\n⚠️ Dữ liệu trận hiện tại sẽ không được lưu!",
          { title: "Cảnh báo", confirmText: "Đồng ý" }
        );
        if (!confirmed) {
          return; // User hủy
        }
      }

      // 2. Lấy competition_dk_id từ returnUrl hoặc matchInfo
      const competition_dk_id = matchInfo.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
      if (!competition_dk_id) {
        await showError("Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.");
        navigate(returnUrl);
        return;
      }

      // 3. Lấy dữ liệu sheet
      const sheetResponse = await axios.get(`http://localhost:6789/api/competition-dk/${competition_dk_id}`);
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
      const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match/by-dk/${competition_dk_id}`);
      const allMatches = matchesResponse.data.success ? matchesResponse.data.data : [];
      const previousMatch = allMatches.find(m => m.match_no == previousRow[0]);
      console.log('previousMatch: ',previousMatch )
      let matchId = null;
      let matchStatus = 'WAI';
      let winner = null;
      let finalScores = { red: 0, blue: 0 };

      if (!previousMatch) {
        // Tạo mới nếu chưa có
        const createResponse = await axios.post('http://localhost:6789/api/competition-match', {
          competition_dk_id: competition_dk_id,
          match_no: previousRow[0] || '',
          row_index: previousRow[0] || '',
          red_name: previousRow[3] || '',
          blue_name: previousRow[6] || '',
          config_system: matchInfo.config_system || {}
        });
        matchId = createResponse.data.data?.id;
      } else {
        matchId = previousMatch.id;
        matchStatus = previousMatch.match_status;
        winner = previousMatch.winner;

        // Nếu trận đã kết thúc, lấy kết quả cuối cùng từ history
        if (matchStatus === 'FIN') {
          const historyResponse = await axios.get(`http://localhost:6789/api/competition-match/${matchId}/history`);
          if (historyResponse.data.success && historyResponse.data.data.length > 0) {
            const lastHistory = historyResponse.data.data[0]; // Đã sort DESC
            finalScores.red = lastHistory.red_score || 0;
            finalScores.blue = lastHistory.blue_score || 0;
          }
        }
      }

      // 6. Cập nhật matchInfo
      setMatchInfo({
        ...matchInfo,
        match_id: matchId || '',
        match_no: previousRow[0] || '',
        match_weight: previousRow[1] || '',
        match_type: previousRow[2] || '',
        match_level: previousRow[9] || '',
        red: {
          name: previousRow[3] || '',
          unit: previousRow[4] || '',
          country: previousRow[5] || ''
        },
        blue: {
          name: previousRow[6] || '',
          unit: previousRow[7] || '',
          country: previousRow[8] || ''
        },
        row_index: previousRow[0] || '',
        match_status: matchStatus,
        winner: winner,
        // Thêm thông tin kết quả nếu trận đã kết thúc
        previous_status: matchStatus === 'FIN' ? matchStatus : undefined,
        previous_winner: matchStatus === 'FIN' ? winner : undefined,
        previous_scores: matchStatus === 'FIN' ? finalScores : undefined,
      });

      console.log('Updated matchInfo: ', matchInfo);

      // 7. Navigate sang trận trước
      navigate('/scoreboard/vovinam', {
        state: {
          matchData: matchData,
          returnUrl: returnUrl,
          // Thêm flag để biết là quay lại trận đã kết thúc
          showPreviousResult: (matchStatus === 'FIN' && winner) ? true : false
        },
        replace: true
      });
      resetTimer()
    } catch (error) {
      console.error("❌ Lỗi khi quay lại trận trước:", error);
      await showError("Lỗi khi quay lại trận trước: " + (error.response?.data?.message || error.message));
    }
  };

  // ---------- Thao tác nút "T.SAU"    ----------- //
  const btnNextMatch = async () => {
    // Trạng thái trong trận 'IN' cần xác nhận trước khi thực thi
    try {
      // 1. Kiểm tra trạng thái trận hiện tại
      const currentStatus = matchInfo.match_status || 'WAI';

      // Nếu trạng thái là FIN (đã kết thúc) -> Chuyển trận luôn, không cần lưu lại
      if (currentStatus === 'FIN' ||currentStatus === 'WAI'  ) {
        console.log("✅ Trận đã kết thúc, chuyển sang trận tiếp theo");
      } else {
        // Trạng thái WAI hoặc IN -> Cần lưu kết quả trước khi chuyển trận

        // Hỏi xác nhận
        const confirmed = await showWarning(
          "Bạn có chắc chắn muốn kết thúc trận này và chuyển sang trận tiếp theo không?",
          { title: "Xác nhận kết thúc trận", confirmText: "Kết thúc" }
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

        console.log(`🔄 Lưu kết quả trận đấu (status: ${currentStatus} -> FIN)`);

        // Lưu winner và cập nhật status = FIN
        await axios.put(`http://localhost:6789/api/competition-match/${matchInfo.match_id}/winner`, {
          winner: winner
        });

        // Lưu history cuối cùng
        await axios.post(`http://localhost:6789/api/competition-match/${matchInfo.match_id}/history`, {
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
          round_type: currentRound > (matchInfo.so_hiep || 3) ? 'EXTRA' : 'NORMAL',
          confirm_attack: 0,
          status: 'FIN',
          action_type: 'finish',
          action_by: winner,
          notes: 'Kết thúc trận đấu',
          logs: actionHistory,
          roundHistory: roundHistory
        });
        console.log("✅ Đã lưu kết quả trận đấu vào database");

        // Tự động cập nhật VĐV thắng vào các trận tiếp theo
        const winnerName = winner === 'red' ? matchInfo.red?.name : matchInfo.blue?.name;
        const winnerUnit = winner === 'red' ? matchInfo.red?.unit : matchInfo.blue?.unit;
        const currentMatchNo = matchInfo.match_no;

        console.log('🔄 Bắt đầu cập nhật VĐV thắng vào các trận tiếp theo...');
        const updateCount = await updateWinnerToNextMatches(currentMatchNo, winner, winnerName, winnerUnit);

        if (updateCount > 0) {
          console.log(`✅ Đã tự động cập nhật ${updateCount} trận tiếp theo với VĐV thắng: ${winnerName}`);
        }
      }

      // 2. Lấy competition_dk_id từ returnUrl hoặc matchInfo
      const competition_dk_id = matchInfo.competition_dk_id || extractCompetitionIdFromUrl(returnUrl);
      if (!competition_dk_id) {
        await showError("Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.");
        navigate(returnUrl);
        return;
      }
      // 3. Lấy dữ liệu sheet để tạo matchData cho trận tiếp theo
      const sheetResponse = await axios.get(`http://localhost:6789/api/competition-dk/${competition_dk_id}`);
      const competitionDkData = sheetResponse?.data?.data;
      if (!sheetResponse?.data?.success || !sheetResponse?.data?.data) {
        await showError("Không thể tải dữ liệu trận tiếp theo!");
        navigate(returnUrl);
        return;
      }

      const currentMatch = matchInfo.match_no
      const nextRow = competitionDkData?.data[currentMatch + 1]; // +1 vì row 0 là header
      if(!nextRow){
        await showAlert("Đã hết trận đấu! Quay về màn hình quản lý.");
        navigate(returnUrl);
        return;
      }
      // kiểm tra nextRow có match_id không | nếu không có thì tạo mới 
      // lấy danh sách match theo competition_dk_id và kiểm tra match_no có tồn tại không| nếu tồn tại thì lấy id = match_id | không tồn tại thì gọi API create match để lấy id 
      // // 3. Lấy danh sách tất cả matches
      const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match/by-dk/${competition_dk_id}`);
      const allMatches = matchesResponse.data.success ? matchesResponse.data.data : [];
      const nextMatch = allMatches.find(m => m.match_no == nextRow[0]);
      let matchId  = null;
      if(!nextMatch){
        // tạo mới 
        const createResponse = await axios.post('http://localhost:6789/api/competition-match', {
          competition_dk_id: competition_dk_id,
          match_no: nextRow[0] || '',
          row_index: nextRow[0] || '',
          red_name: nextRow[3] || '',
          blue_name: nextRow[6] || '',
          config_system: matchInfo.config_system || {}
        }); 
        matchId = createResponse.data.data?.id;
        // cập nhật status = IN
        // tạm tắt debug next/prev
         if(createResponse.data.data?.status == 'WAI'){
          await axios.put(`http://localhost:6789/api/competition-match/${matchId}/status`, {
            status: 'IN'
          });
        }
      } else {
        matchId = nextMatch.id;
        // nextMatch.winner != null thì set winner 
        // tạm tắt debug next/prev
        if(nextMatch?.status == 'WAI'){
          await axios.put(`http://localhost:6789/api/competition-match/${matchId}/status`, {
            status: 'IN'
          });
        }
      }
      
      // 4. Cập nhật matchInfo
      setMatchInfo({
        ...matchInfo,
        match_id: matchId || '',
        match_no: nextRow[0] || '',
        match_weight: nextRow[1] || '',
        match_type: nextRow[2] || '',
        match_level: nextRow[9] || '',
        red: {
          name: nextRow[3] || '',
          unit: nextRow[4] || '',
          country: nextRow[5] || ''
        },
        blue: {
          name: nextRow[6] || '',
          unit: nextRow[7] || '',
          country: nextRow[8] || ''
        },
        match_status: nextMatch?.match_status || 'IN',
        row_index: nextRow[0] || '',
        // Xóa thông tin kết quả cũ
        previous_status: undefined,
        previous_winner: undefined,
        previous_scores: undefined,
        winner: undefined,
      });

      navigate('/scoreboard/vovinam', {
        state: {
          matchData: matchData,
          returnUrl: returnUrl
        },
        replace: true // Replace để không tạo history entry mới
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
      resetTimer()

      // dùng khi trạng thái trấn trạn thi đấu sau có dữ liệu  
      if(nextMatch.winner != null){
        // tạo animation winner
        const winnerData = {
          team: nextMatch.winner,
          name: nextMatch.winner === "red" ? nextRow[3] : nextRow[6],
          score: nextMatch.winner === "red" ? nextMatch.red_score : nextMatch.blue_score,
          teamName: nextMatch.winner === "red" ? nextRow[4] : nextRow[7]
        };
        setAnnouncedWinner(winnerData);
        setAnnouncedWinner(winnerData);
        console.log('winnerData: ', winnerData);
      }
    } catch (error) {
      console.error("❌ Lỗi khi chuyển trận:", error);
      await showError("Lỗi khi chuyển sang trận tiếp theo: " + (error.response?.data?.message || error.message));
    }
  };

  // ---------- Thao tác nút "Thoát"    ----------- //
  const btnGoBack = async () => {
    const confirmed = await showConfirm("Bạn có chắc muốn thoát khỏi trận đấu?", {
      title: "Xác nhận thoát"
    });
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


  return (
    <div className="bg-black h-screen w-screen text-white flex flex-col items-center justify-start relative overflow-hidden">
      {/* CSS Animations cho hiệu ứng chiến thắng */}
      <style>{`
        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
          }
        }

        @keyframes victoryGlow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.6);
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

        .victory-animation {
          animation: victoryPulse 1.5s ease-in-out infinite, victoryGlow 2s ease-in-out infinite;
          border: 4px solid gold !important;
          background: linear-gradient(
            90deg,
            rgba(255, 215, 0, 0.1) 0%,
            rgba(255, 215, 0, 0.3) 50%,
            rgba(255, 215, 0, 0.1) 100%
          );
          background-size: 200% auto;
          animation: victoryPulse 1.5s ease-in-out infinite,
                     victoryGlow 2s ease-in-out infinite,
                     victoryShine 3s linear infinite;
          position: relative;
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

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti 3s linear infinite;
        }
      `}</style>

      {/* Thiết kế hiển thị danh sách Logo - Căn giữa hàng ngang */}
      {lsLogo.length > 0 && (
        <div className="w-full max-w-7xl mx-auto mb-6 mt-6">
          <div className="flex justify-center items-center gap-8 px-8">
            {lsLogo.map((logo, index) => (
              <div
                key={logo.id || index}
                className="flex justify-center items-center shadow-lg hover:shadow-xl transition-shadow"
                style={{ minWidth: "75px", maxWidth: "75px" }}
              >
                <img
                  src={logo.url}
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
      )}

      {/* Header */}
      <div className="text-center mb-8 max-w-5xl mx-auto">
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

      {/* Scoreboard */}
      <div className="flex w-full max-w-7xl justify-between items-start px-8 gap-4">
        {/* Đỏ */}
        <div className="flex-1">
          <div className={`text-white p-8 rounded-2xl flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden ${
            announcedWinner?.team === "red" ? "victory-animation" : ""
          }`} style={{ backgroundColor: '#FF0000' }}>
            <div className="text-[200px] font-bold leading-none w-full text-center break-all" style={{ lineHeight: '300px', wordBreak: 'break-all' }}>
              {redScore}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <div className="h-20 w-20 bg-slate-400 mr-4 flex justify-center items-center text-sm ">
                LOGO
              </div>
              <div className="font-semibold text-lg flex-1 text-white">
                <p className="text-xl">{matchInfo.red?.name || "VĐV ĐỎ"}</p>
                <p className="text-base">
                  {matchInfo.red?.unit || ""}
                </p>
              </div>
            </div>
          </div>
          {renderGDScores(generateGdData(), 'red')}
          {/* Thông tin nhắc nhở, cảnh cáo, đòn chân - ĐỎ */}
          <div className="mt-4 space-y-2">
            <div className=" text-black font-bold text-start flex flex-row">
              <div className="flex justify-between flex-1  text-white ">
                <span className="text-sm">NHẮC NHỞ: {remindRed}</span>
              </div>
              <div className="flex justify-between flex-1 text-white">
                <span className="text-sm">CẢNH CÁO: {warnRed} </span>
              </div>
              <div className="flex justify-between flex-1 text-white">
                <span className="text-sm">Y TẾ: {medicalRed} </span>
              </div>
            </div>
          </div>
        </div>

        {/* Giữa */}
        <div className="flex flex-col items-center justify-center space-y-4 px-4 flex-shrink-0" style={{ minWidth: '300px' }}>
          <p className="font-bold text-2xl">
            TRẬN SỐ {matchInfo.match_no || "---"}
          </p>
          <p className="text-xl font-bold">{matchInfo.match_type || "---"}</p>
          <p className="text-xl font-bold">{matchInfo.match_weight || "---"}</p>

          {/* Timer display */}
          <div className="bg-yellow-300 text-black font-bold text-2xl px-6 py-3 rounded-lg shadow-lg min-w-[250px] text-center">
            {currentRound > (matchInfo.so_hiep || 3)
              ? `HIỆP PHỤ ${currentRound - (matchInfo.so_hiep || 3)}`
              : `HIỆP ${currentRound}`}
          </div>
          <div
            className={`font-bold px-10 py-4 rounded-lg shadow-lg min-w-[300px] text-center ${
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

          {/* Banner nghỉ giải lao */}
          {!pauseMatch && isBreakTime && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-yellow-400 text-black px-10 py-5 min-w-[600px] min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl font-bold mb-6">NGHỈ GIẢI LAO</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold">
                      {formatTime(breakTimeLeft).main}
                    </span>
                    <span className="text-4xl font-bold">
                      {formatTime(breakTimeLeft).decimal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner Y TẾ */}
          {!pauseMatch && isMedicalTime && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className={`px-10 py-5 min-w-[600px] min-h-[400px] bg-yellow-400 flex items-center justify-center`}>
                <div className="text-center text-black">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className="text-4xl font-bold">
                      {currentRound > (matchInfo.so_hiep || 3)
                        ? `HIỆP PHỤ ${currentRound - (matchInfo.so_hiep || 3)}`
                        : `HIỆP ${currentRound}`}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <p className={`text-5xl font-bold `}>
                      THỜI GIAN Y TẾ
                    </p>
                  </div>

                  <p className={`text-4xl font-semibold mb-6 ${
                    medicalTeam === 'red' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {medicalTeam === 'red' ? matchInfo.red.name : matchInfo.blue.name}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-6xl font-bold">
                      {formatTime(medicalTimeLeft).main}
                    </span>
                    <span className="text-4xl font-bold">
                      {formatTime(medicalTimeLeft).decimal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Banner tạm ngưng giữa trận - chỉ hiển thị trong hiệp thi đấu - ẩn khi đã trọn VĐV  thắng */}
          {!pauseMatch && !isRunning && !isBreakTime && !isMedicalTime && !ready && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-yellow-400 text-black px-10 py-5 min-w-[600px] min-h-[400px] flex flex-col items-center justify-center gap-4">
                <p className="text-4xl font-bold">
                  {currentRound > (matchInfo.so_hiep || 3)
                    ? `HIỆP PHỤ ${currentRound - (matchInfo.so_hiep || 3)}`
                    : `HIỆP ${currentRound}`} 
                </p>
                <p className="text-6xl font-bold">TẠM NGƯNG</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold">
                    {formatTime(timeLeft).main}
                  </span>
                  <span className="text-3xl font-bold">
                    {formatTime(timeLeft).decimal}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        

        {/* Xanh */}
        <div className="flex-1">
          <div className={`text-white p-8 rounded-2xl flex flex-col items-center shadow-2xl transition-all duration-500 overflow-hidden ${
            announcedWinner?.team === "blue" ? "victory-animation" : ""
          }`} style={{ backgroundColor: '#0000FF' }}>
            <div className="text-[200px] font-bold leading-none w-full text-center break-all" style={{ lineHeight: '300px', wordBreak: 'break-all' }}>
              {blueScore}
            </div>
            <div className="flex justify-between items-center w-full mt-4">
              <div className="font-semibold text-lg flex-1 text-right text-white">
                <p className="text-xl">{matchInfo.blue?.name || "VĐV XANH"}</p>
                <p className="text-base">
                  {matchInfo.blue?.unit || ""}
                </p>
              </div>
              <div className="h-20 w-20 bg-slate-400 ml-4 flex justify-center items-center text-sm ">
                LOGO
              </div>
            </div>
          </div>
          {renderGDScores(generateGdData(), 'blue')}

          {/* Thông tin nhắc nhở, cảnh cáo, đòn chân - XANH */}
          <div className="mt-4 space-y-2">
            <div className=" text-black font-bold text-start flex flex-row">
              <div className="flex justify-between flex-1  text-white ">
                <span className="text-sm">NHẮC NHỞ: {remindBlue}</span>
              </div>
              <div className="flex justify-between flex-1 text-white">
                <span className="text-sm">CẢNH CÁO: {warnBlue} </span>
              </div>
              <div className="flex justify-between flex-1 text-white">
                <span className="text-sm">Y TẾ: {medicalBlue} </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bộ button thao tác - Only show when Fixed Summary Bar is hidden */}
      {showControls && !showRefConnectionState && (
        <>
        <div className="mt-4 w-full max-w-5xl">
          <div className="bg-gray-800 p-1">
            {/* Grid layout: 2 cột cho Đỏ và Xanh */}
            <div className="grid grid-cols-2 gap-3">
              {/* Cột ĐỎ */}
              <div className="flex flex-col">
                {/* Container cho Điểm số và Hành động - dùng flex để tự động dồn */}
                <div className="flex flex-col gap-1 flex-1">
                  {/* Điểm số ĐỎ - Grid 5 cột, mỗi cột có 2 buttons (+/-) */}
                  <div className="bg-gray-700 p-0.5">
                    <div className="grid grid-cols-5 gap-0.5">
                      {/* Cột 1: +1/-1 */}
                      {buttonPermissions.hien_thi_button_diem_1 && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleScoreChange("red", 1)}
                            disabled={disableRedButtons}
                            className={`font-bold py-0.5 text-[10px] transition-colors ${
                              disableRedButtons
                                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleScoreChange("red", -1)}
                            disabled={disableRedButtons}
                            className={`font-bold py-0.5 text-[10px] transition-colors ${
                              disableRedButtons
                                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                : 'bg-red-800 hover:bg-red-900 text-white'
                            }`}
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
                            className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            +2
                          </button>
                          <button
                            onClick={() => handleScoreChange("red", -2)}
                            disabled={disableRedButtons}
                            className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            +3
                          </button>
                          <button
                            onClick={() => handleScoreChange("red", -3)}
                            disabled={disableRedButtons}
                            className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleScoreChange("red", -5)}
                            disabled={disableRedButtons}
                            className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleScoreChange("red", -10)}
                            disabled={disableRedButtons}
                            className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
                          >
                            -10
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hành động ĐỎ - Grid 5 cột */}
                  <div className="bg-gray-700 p-0.5">
                    <div className="grid grid-cols-5 gap-0.5">
                      {/* Cột 1: Nhắc nhở +/- */}
                      {buttonPermissions.hien_thi_button_nhac_nho && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleRemind("red", 1)}
                            disabled={disableRedButtons}
                            className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            Nhắc nhở +
                          </button>
                          <button
                            onClick={() => handleRemind("red", -1)}
                            disabled={disableRedButtons}
                            className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            Cảnh cáo +
                          </button>
                          <button
                            onClick={() => handleWarn("red", -1)}
                            disabled={disableRedButtons}
                            className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            Đ.Chân +
                          </button>
                          <button
                            onClick={() => handleKick("red", -1)}
                            disabled={disableRedButtons}
                            className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            Biên
                          </button>
                        )}
                        {buttonPermissions.hien_thi_button_nga && (
                          <button
                            onClick={() => handleNga("red")}
                            disabled={disableRedButtons}
                            className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                            className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                          >
                            🏥 Y TẾ
                          </button>
                        )}
                        {buttonPermissions.hien_thi_button_thang && (
                          <button
                            onClick={() => handleWinner("red")}
                            disabled={disableRedButtons}
                            className={getActionButtonClassName("red", "bg-yellow-600 hover:bg-yellow-500 text-white")}
                          >
                            🏆 THẮNG
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột XANH */}
              <div className="flex flex-col items-end">
                {/* Container cho Điểm số và Hành động - dùng flex để tự động dồn */}
                <div className="flex flex-col gap-0.5 flex-1 w-full">
                  {/* Điểm số XANH - Grid 5 cột, mỗi cột có 2 buttons (+/-) */}
                  <div className="bg-gray-700 p-0.5">
                    <div className="grid grid-cols-5 gap-0.5" dir="rtl">
                      {/* Cột 5: +1/-1 */}
                      {buttonPermissions.hien_thi_button_diem_1 && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleScoreChange("blue", 1)}
                            disabled={disableBlueButtons}
                            className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            1+
                          </button>
                          <button
                            onClick={() => handleScoreChange("blue", -1)}
                            disabled={disableBlueButtons}
                            className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            2+
                          </button>
                          <button
                            onClick={() => handleScoreChange("blue", -2)}
                            disabled={disableBlueButtons}
                            className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            3+
                          </button>
                          <button
                            onClick={() => handleScoreChange("blue", -3)}
                            disabled={disableBlueButtons}
                            className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            5+
                          </button>
                          <button
                            onClick={() => handleScoreChange("blue", -5)}
                            disabled={disableBlueButtons}
                            className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            10+
                          </button>
                          <button
                            onClick={() => handleScoreChange("blue", -10)}
                            disabled={disableBlueButtons}
                            className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
                          >
                            10-
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hành động XANH - Grid 5 cột */}
                  <div className="bg-gray-700 p-0.5">
                    <div className="grid grid-cols-5 gap-0.5" dir="rtl">
                      {/* Cột 1: Nhắc nhở +/- */}
                      {buttonPermissions.hien_thi_button_nhac_nho && (
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleRemind("blue", 1)}
                            disabled={disableBlueButtons}
                            className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            + Nhắc nhở
                          </button>
                          <button
                            onClick={() => handleRemind("blue", -1)}
                            disabled={disableBlueButtons}
                            className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            + Cảnh cáo
                          </button>
                          <button
                            onClick={() => handleWarn("blue", -1)}
                            disabled={disableBlueButtons}
                            className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            + Đ.Chân
                          </button>
                          <button
                            onClick={() => handleKick("blue", -1)}
                            disabled={disableBlueButtons}
                            className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                            Biên
                          </button>
                        )}
                        {buttonPermissions.hien_thi_button_nga && (
                          <button
                            onClick={() => handleNga("blue")}
                            disabled={disableBlueButtons}
                            className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                            className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                          >
                          Y TẾ
                          </button>
                        )}
                        {buttonPermissions.hien_thi_button_thang && (
                          <button
                            onClick={() => handleWinner("blue")}
                            disabled={disableBlueButtons}
                            className={getActionButtonClassName("blue", "bg-yellow-600 hover:bg-yellow-500 text-white")}
                          >
                            🏆 THẮNG
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer controls */}
        <div className="flex gap-2 mt-2">
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
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-bold text-[10px] transition-colors min-w-[120px] animate-pulse"
            >
              🏥 Y tế
            </button>
          )}

          {/* <button
            onClick={toggleTimer}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors min-w-[150px]"
          >
            {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
          </button> */}
          {/* Nút quay lại */}
          {buttonPermissions.hien_thi_button_quay_lai && (
            <button
              onClick={btnGoBack}
              className=" bg-gray-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors z-10 text-[10px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Thoát
            </button>
          )}
          {buttonPermissions.hien_thi_button_reset && (
            <button
              onClick={resetTimer}
              className="bg-gray-700 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg font-bold text-[10px] transition-colors min-w-[80px]"
            >
              Reset
            </button>
          )}
          {/* Nút Undo */}
          {/* <button
            onClick={undoLastAction}
            disabled={actionHistory.length === 0}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors min-w-[150px]"
          >
            Hoàn tác ({actionHistory.length})
          </button> */}

          {/* Nút Lịch sử và Cấu hình */}
          <div className=" flex gap-1.5 z-10">
            {buttonPermissions.hien_thi_button_lich_su && (
              <button
                onClick={btnShowHistory}
                className="bg-gray-700 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors text-[10px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Lịch sử ({actionHistory.length})
              </button>
            )}
            {buttonPermissions.hien_thi_button_cau_hinh && (
              <button
                onClick={btnSetting}
                className="bg-gray-700 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors text-[10px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
            )}

            {/* Nút Kết thúc */}
            {buttonPermissions.hien_thi_button_ket_thuc && (
              <button
                onClick={btnFinishMatch}
                className="bg-gray-700 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all text-[10px] shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
          </div>

          {/* Nút quay lại trận trước */}
          {buttonPermissions.hien_thi_button_tran_truoc && (
            <button
              onClick={btnPreviousMatch}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all text-[10px] shadow-lg hover:shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
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

          {/* Nút trận kế tiếp */}
          {buttonPermissions.hien_thi_button_tran_tiep_theo && (
            <button
              onClick={btnNextMatch}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all text-[10px] shadow-lg hover:shadow-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
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

        </div>
        </>
      )}

      {/* Hint text - Only show when Fixed Summary Bar is hidden */}
      {/* {!showRefConnectionState && (
        <div className="absolute bottom-6 text-gray-400 text-sm text-center">
          <div className="mb-2">
            <kbd className="px-2 py-1 bg-gray-700">Space</kbd> Bắt đầu/Tạm dừng |
            <kbd className="px-2 py-1 bg-gray-700 ml-2">Ctrl+Z</kbd> Hoàn tác |
            <kbd className="px-2 py-1 bg-gray-700 ml-2">F1</kbd> Kết nối |
            <kbd className="px-2 py-1 bg-gray-700 ml-2">F5</kbd> Cấu hình |
            <kbd className="px-2 py-1 bg-gray-700 ml-2">F6</kbd> Lịch sử |
            <kbd className="px-2 py-1 bg-gray-700 ml-2">F7</kbd> Giám định |
            <kbd className="px-2 py-1 bg-gray-700 ml-2">F10</kbd> {showControls ? 'Ẩn' : 'Hiện'} controls
          </div>
          <div className="text-xs">
            <span className="text-red-400">ĐỎ:</span>
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">Q/W/E</kbd> +1/+2/+3 |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">A/S/D</kbd> -1/-2/-3 |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">R/F</kbd> Nhắc nhở |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">Z/X</kbd> Cảnh cáo |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">T</kbd> Thắng |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">C</kbd> Y tế
            <span className="mx-2">|</span>
            <span className="text-blue-400">XANH:</span>
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">P/O/I</kbd> +1/+2/+3 |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">L/K/J</kbd> -1/-2/-3 |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">U/H</kbd> Nhắc nhở |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">M/N</kbd> Cảnh cáo |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">Y</kbd> Thắng |
            <kbd className="px-1 py-0.5 bg-gray-700 ml-1">B</kbd> Y tế
            <span className="mx-2">|</span>
            <kbd className="px-1 py-0.5 bg-gray-700">G</kbd> Reset
          </div>
        </div>
      )} */}

      {/* Modal Lịch sử */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                LỊCH SỬ THAO TÁC ({actionHistory.length})
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-50px)] bg-gray-50">
              {actionHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xl">Chưa có thao tác nào</p>
                </div>
              ) : (
                <div className="overflow-x-auto min-h-[700px] max-h-[700px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-600">
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-16">
                          STT
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-20">
                          Hiệp
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-24">
                          Thời gian
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-28">
                          Loại
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700">
                          Mô tả
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-20">
                          Đỏ
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-20">
                          Xanh
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-24">
                          Nhắc nhở
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-24">
                          Cảnh cáo
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-24">
                          Đòn chân
                        </th>
                        <th className="px-4 py-3 text-white font-bold border-b-2 border-blue-700 text-center w-24">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionHistory.map((action, index) => (
                        <tr
                          key={action.id}
                          className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                            action.team === "red"
                              ? "bg-red-100"
                              : action.team === "blue"
                              ? "bg-blue-100"
                              : "bg-white"
                          }`}
                        >
                          {/* STT */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-sm font-mono">
                              #{actionHistory.length - index}
                            </span>
                          </td>

                          {/* Hiệp */}
                          <td className="px-4 py-3 text-center text-gray-800 font-semibold">
                            {action.round}
                          </td>

                          {/* Thời gian */}
                          <td className="px-4 py-3 text-center text-gray-600 font-mono text-sm">
                            {action.time}
                          </td>

                          {/* Loại */}
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 text-xs font-bold ${
                                action.actionType === "score"
                                  ? "bg-green-600 text-white"
                                  : action.actionType === "remind"
                                  ? "bg-yellow-600 text-white"
                                  : action.actionType === "warn"
                                  ? "bg-orange-600 text-white"
                                  : action.actionType === "kick"
                                  ? "bg-purple-600 text-white"
                                  : action.actionType === "medical"
                                  ? "bg-pink-600 text-white"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {action.actionType === "score"
                                ? "ĐIỂM"
                                : action.actionType === "remind"
                                ? "NHẮC NHỚ"
                                : action.actionType === "warn"
                                ? "CẢNH CÁO"
                                : action.actionType === "kick"
                                ? "ĐÒN CHÂN"
                                : action.actionType === "medical"
                                ? "Y TẾ"
                                : "KHÁC"}
                            </span>
                          </td>

                          {/* Mô tả */}
                          <td className="px-4 py-3 text-gray-800 font-medium min-w-[200px] max-w-[400px]">
                            <div className="whitespace-normal break-words">
                              {action.description}
                            </div>
                          </td>

                          {/* Điểm Đỏ */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block bg-red-600 text-white px-2 py-1 rounded font-bold min-w-[40px]">
                              {action.redScore}
                            </span>
                          </td>

                          {/* Điểm Xanh */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded font-bold min-w-[40px]">
                              {action.blueScore}
                            </span>
                          </td>

                          {/* Nhắc nhở */}
                          <td className="px-4 py-3 text-center text-gray-600 text-sm">
                            {action.remindRed > 0 || action.remindBlue > 0 ? (
                              <span className="text-yellow-600 font-semibold">
                                {action.remindRed}/{action.remindBlue}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Cảnh cáo */}
                          <td className="px-4 py-3 text-center text-gray-600 text-sm">
                            {action.warnRed > 0 || action.warnBlue > 0 ? (
                              <span className="text-orange-600 font-semibold">
                                {action.warnRed}/{action.warnBlue}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Đòn chân */}
                          <td className="px-4 py-3 text-center text-gray-600 text-sm">
                            {action.kickRed > 0 || action.kickBlue > 0 ? (
                              <span className="text-purple-600 font-semibold">
                                {action.kickRed}/{action.kickBlue}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="px-4 py-3 text-center">
                            {index === 0 && (
                              <button
                                onClick={undoLastAction}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition-colors"
                              >
                                Hoàn tác
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-gray-600 text-sm">
                Tổng số thao tác:{" "}
                <span className="font-bold text-gray-800">
                  {actionHistory.length}
                </span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cấu hình */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                CẤU HÌNH TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)] bg-gray-50">
              <div className="space-y-6">
                {/* Section: Thông tin trận đấu */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thông tin trận đấu
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Hệ điểm */}
                    <div className="bg-white border border-gray-200 p-3 rounded-lg">
                      <label className="block text-gray-600 text-xs font-semibold mb-1">
                        Hệ điểm
                      </label>
                      <div className="text-gray-800 text-lg font-bold">
                        {matchInfo.he_diem === '1' || matchInfo.he_diem === 1 ? 'Hệ điểm 1' :
                         matchInfo.he_diem === '2' || matchInfo.he_diem === 2 ? 'Hệ điểm 2' :
                         matchInfo.he_diem === '3' || matchInfo.he_diem === 3 ? 'Hệ điểm 3' :
                         'Hệ điểm 2'}
                      </div>
                    </div>

                    {/* Số giám định */}
                    <div className="bg-white border border-gray-200 p-3 rounded-lg">
                      <label className="block text-gray-600 text-xs font-semibold mb-1">
                        Số giám định
                      </label>
                      <div className="text-gray-800 text-lg font-bold">
                        {matchInfo.so_giam_dinh === '3' || matchInfo.so_giam_dinh === 3 ? '3 giám định' :
                         matchInfo.so_giam_dinh === '5' || matchInfo.so_giam_dinh === 5 ? '5 giám định' :
                         matchInfo.so_giam_dinh === '10' || matchInfo.so_giam_dinh === 10 ? '10 giám định' :
                         '3 giám định'}
                      </div>
                    </div>

                    {/* Tổng số hiệp */}
                    <div className="bg-white border border-gray-200 p-3 rounded-lg">
                      <label className="block text-gray-600 text-xs font-semibold mb-1">
                        Tổng số hiệp
                      </label>
                      <div className="text-gray-800 text-lg font-bold">
                        {(matchInfo.so_hiep || 3) + (matchInfo.so_hiep_phu || 0)} hiệp
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        ({matchInfo.so_hiep || 3} chính + {matchInfo.so_hiep_phu || 0} phụ)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Điều khiển trận đấu */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Điều khiển trận đấu
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Hiệp hiện tại */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Hiệp hiện tại
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={matchInfo.so_hiep + matchInfo.so_hiep_phu}
                        value={currentRound}
                        onChange={(e) => {
                          const newRound = parseInt(e.target.value);
                          if (
                            newRound >= 1 &&
                            newRound <=
                              matchInfo.so_hiep + matchInfo.so_hiep_phu
                          ) {
                            setCurrentRound(newRound);
                          }
                        }}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold border border-gray-300"
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        Tối đa: {matchInfo.so_hiep + matchInfo.so_hiep_phu} hiệp
                      </p>
                    </div>

                    {/* Thời gian còn lại */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Thời gian còn lại (giây)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={matchInfo.thoi_gian_thi_dau * 10}
                        value={Math.floor(timeLeft / 10)}
                        onChange={(e) => {
                          const newTime = parseInt(e.target.value) * 10;
                          if (
                            newTime >= 0 &&
                            newTime <= matchInfo.thoi_gian_thi_dau * 10
                          ) {
                            setTimeLeft(newTime);
                          }
                        }}
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold border border-gray-300"
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        Hiển thị: {formatTime(timeLeft).main}
                        {formatTime(timeLeft).decimal}
                      </p>
                    </div>
                  </div>

                  {/* Quick jump buttons */}
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <button
                      onClick={() =>
                        setTimeLeft(matchInfo.thoi_gian_thi_dau * 10)
                      }
                      className="bg-gray-100 hover:bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Đầu hiệp
                    </button>
                    <button
                      onClick={() =>
                        setTimeLeft(
                          Math.floor((matchInfo.thoi_gian_thi_dau * 10) / 2)
                        )
                      }
                      className="bg-gray-100 hover:bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Giữa hiệp
                    </button>
                    <button
                      onClick={() => setTimeLeft(300)}
                      className="bg-gray-100 hover:bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      30 giây
                    </button>
                    <button
                      onClick={() => setTimeLeft(0)}
                      className="bg-gray-100 hover:bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Hết giờ
                    </button>
                  </div>
                </div>

                {/* Section: Cấu hình thời gian */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cấu hình thời gian
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Thời gian thi đấu */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Thời gian thi đấu (giây)
                      </label>
                      <input
                        type="number"
                        value={matchInfo.thoi_gian_thi_dau}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            thoi_gian_thi_dau: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      />
                    </div>

                    {/* Thời gian nghỉ */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Thời gian nghỉ (giây)
                      </label>
                      <input
                        type="number"
                        value={matchInfo.thoi_gian_nghi}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            thoi_gian_nghi: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      />
                    </div>

                    {/* Thời gian hiệp phụ */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Thời gian hiệp phụ (giây)
                      </label>
                      <input
                        type="number"
                        value={matchInfo.thoi_gian_hiep_phu}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            thoi_gian_hiep_phu: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      />
                    </div>

                    {/* Thời gian y tế */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Thời gian y tế (giây)
                      </label>
                      <input
                        type="number"
                        value={matchInfo.thoi_gian_y_te}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            thoi_gian_y_te: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Cấu hình hiệp */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cấu hình hiệp
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Số hiệp */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Số hiệp chính
                      </label>
                      <select
                        value={matchInfo.so_hiep || '3'}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            so_hiep: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      >
                        <option value="1">1 hiệp</option>
                        <option value="2">2 hiệp</option>
                        <option value="3">3 hiệp</option>
                      </select>
                      <p className="text-gray-500 text-xs mt-2">
                        Theo cấu hình hệ thống
                      </p>
                    </div>

                    {/* Số hiệp phụ */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Số hiệp phụ
                      </label>
                      <select
                        value={matchInfo.so_hiep_phu || '0'}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            so_hiep_phu: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      >
                        <option value="0">Không có</option>
                        <option value="1">1 hiệp phụ</option>
                        <option value="2">2 hiệp phụ</option>
                        <option value="3">3 hiệp phụ</option>
                      </select>
                      <p className="text-gray-500 text-xs mt-2">
                        Theo cấu hình hệ thống
                      </p>
                    </div>

                    {/* Hệ điểm */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Hệ điểm
                      </label>
                      <select
                        value={matchInfo.he_diem || '2'}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            he_diem: e.target.value,
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      >
                        <option value="1">Hệ điểm 1</option>
                        <option value="2">Hệ điểm 2</option>
                        <option value="3">Hệ điểm 3</option>
                      </select>
                      <p className="text-gray-500 text-xs mt-2">
                        Theo cấu hình hệ thống
                      </p>
                    </div>

                    {/* Số giám định */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Số giám định
                      </label>
                      <select
                        value={matchInfo.so_giam_dinh || '3'}
                        onChange={(e) =>
                          setMatchInfo({
                            ...matchInfo,
                            so_giam_dinh: e.target.value,
                          })
                        }
                        className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
                      >
                        <option value="3">3 giám định</option>
                        <option value="5">5 giám định</option>
                        <option value="10">10 giám định</option>
                      </select>
                      <p className="text-gray-500 text-xs mt-2">
                        Theo cấu hình hệ thống
                      </p>
                    </div>

                    {/* Số hiệp thi đấu (tổng) */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Tổng số hiệp thi đấu
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={(matchInfo.so_hiep || 3) + (matchInfo.so_hiep_phu || 0)}
                        disabled
                        className="w-full bg-gray-200 text-gray-600 px-4 py-2 rounded-lg border border-gray-300 cursor-not-allowed"
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        = Số hiệp chính + Số hiệp phụ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section: Cấu hình hiển thị buttons */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Hiển thị buttons
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Buttons điểm số */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="text-gray-700 font-semibold mb-3 text-sm">
                        Buttons điểm số
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_diem_1}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_diem_1: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Điểm +1/-1</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_diem_2}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_diem_2: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Điểm +2/-2</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_diem_3}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_diem_3: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Điểm +3/-3</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_diem_5}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_diem_5: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Điểm +5/-5</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_diem_10}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_diem_10: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Điểm +10/-10</span>
                        </label>
                      </div>
                    </div>

                    {/* Buttons hành động */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h4 className="text-gray-700 font-semibold mb-3 text-sm">
                        Buttons hành động
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_nhac_nho}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_nhac_nho: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Nhắc nhở</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_canh_cao}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_canh_cao: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Cảnh cáo</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_don_chan}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_don_chan: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Đòn chân</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_bien}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_bien: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Biên</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_nga}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_nga: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Ngã</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_y_te}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_y_te: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Y tế</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_thang}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_thang: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Thắng</span>
                        </label>
                      </div>
                    </div>

                    {/* Buttons điều khiển */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg col-span-2">
                      <h4 className="text-gray-700 font-semibold mb-3 text-sm">
                        Buttons điều khiển
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_quay_lai}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_quay_lai: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Thoát</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_reset}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_reset: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Reset</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_lich_su}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_lich_su: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Lịch sử</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_cau_hinh}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_cau_hinh: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Cấu hình</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_ket_thuc}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_ket_thuc: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Kết thúc</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_tran_tiep_theo}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_tran_tiep_theo: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Trận sau</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={buttonPermissions.hien_thi_button_tran_truoc}
                            onChange={(e) =>
                              setButtonPermissions({
                                ...buttonPermissions,
                                hien_thi_button_tran_truoc: e.target.checked,
                              })
                            }
                            className="w-4 h-4 "
                          />
                          <span>Trận trước</span>
                        </label>
                      </div>
                    </div>

                    {/* Vô hiệu hóa buttons */}
                    <div className="bg-white border border-gray-200 p-4 rounded-lg col-span-2">
                      <h4 className="text-gray-700 font-semibold mb-3 text-sm">
                        Vô hiệu hóa buttons
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={disableRedButtons}
                            onChange={(e) => setDisableRedButtons(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold text-red-600">🔴 Vô hiệu hóa tất cả buttons ĐỎ</span>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={disableBlueButtons}
                            onChange={(e) => setDisableBlueButtons(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="font-semibold text-blue-600">🔵 Vô hiệu hóa tất cả buttons XANH</span>
                        </label>
                      </div>
                      <div className="mt-3 text-xs text-gray-500 italic">
                        * Khi bật, tất cả các nút điều khiển của đội tương ứng sẽ bị vô hiệu hóa
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowConfigModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  // Lưu button permissions về server
                  const saved = await saveButtonPermissions();
                  if (saved) {
                    setShowConfigModal(false);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chọn winner khi điểm bằng nhau */}
      {showWinnerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-blue-500">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-500 rounded-full p-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Điểm số bằng nhau!
              </h2>
              <p className="text-lg text-gray-600">
                Điểm số:{" "}
                <span className="font-bold text-blue-600">
                  {redScore} - {blueScore}
                </span>
              </p>
              <p className="text-base text-gray-500 mt-2">
                Vui lòng chọn vận động viên thắng cuộc
              </p>
            </div>

            {/* Buttons chọn winner */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Button ĐỎ */}
              <button
                onClick={() => handleWinner("red", true)}
                className="group relative bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl border-2 border-red-400"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white rounded-full p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-red-200 mb-1">
                      {matchInfo?.red?.unit ?? ''}
                    </div>
                    <div className="text-xl font-bold">
                      {matchInfo.red.name || "ĐỎ"}
                    </div>
                    <div className="text-xs text-red-200 mt-1">
                      Click để chọn
                    </div>
                  </div>
                </div>
              </button>

              {/* Button XANH */}
              <button
                onClick={() => handleWinner("blue", true)}
                className="group relative bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl border-2 border-blue-400"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white rounded-full p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-blue-200 mb-1">
                      {matchInfo?.blue?.unit ?? ''}
                    </div>
                    <div className="text-xl font-bold">
                      {matchInfo?.blue?.name ?? "XANH"}
                    </div>
                    <div className="text-xs text-blue-200 mt-1">
                      Click để chọn
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Button Hủy */}
            <button
              onClick={() => {
                setShowWinnerModal(false);
                setIsFinishingMatch(false); // Reset state khi hủy
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Modal công bố vận động viên thắng */}
      {showWinnerAnnouncementModal && announcedWinner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-4 border-yellow-500">
            {/* Header với icon trophy */}
            <div className="text-center mb-6">
              <div className="inline-block bg-yellow-500 rounded-full p-4 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                🏆 VẬN ĐỘNG VIÊN THẮNG
              </h2> 
            </div>

            {/* Thông tin vận động viên */}
            <div className={`p-6 rounded-xl mb-6 ${
              announcedWinner.team === "red"
                ? "bg-gradient-to-br from-red-100 to-red-200 border-4 border-red-500"
                : "bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-blue-500"
            }`}>
              <div className="text-center space-y-4">
                {/* Tên vận động viên */}
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    TÊN VẬN ĐỘNG VIÊN
                  </div>
                  <div className={`text-4xl font-bold ${
                    announcedWinner.team === "red" ? "text-red-700" : "text-blue-700"
                  }`}>
                    {announcedWinner.name}
                  </div>
                </div>

                {/* Đội */}
                <div>
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    ĐỘI
                  </div>
                  <div className={`inline-block px-6 py-2 rounded-full text-2xl font-bold text-white ${
                    announcedWinner.team === "red" ? "bg-red-600" : "bg-blue-600"
                  }`}>
                    {announcedWinner.teamName}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {/* Button Quay lại */}
                <button
                  onClick={btnReturnWinner}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Quay lại
                </button>
                {/* Button Xác nhận */}
                <button
                  onClick={btnConfirmWinner}
                  className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Xác nhận & Kết thúc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Referee Status Bar */}
      {/* {showRefConnectionState && (
        <RefereeStatusBar
          devices={referrerDevices}
          so_giam_dinh={matchInfo.config_system?.so_giam_dinh || 3}
        />
      )} */}

      {/* Fixed Summary Bar at Bottom */}
      {showRefConnectionState && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-t-2 border-gray-700 shadow-2xl z-40 max-h-[30vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-2">
            {/* Row 1: Buttons */}
              <div className="mt-4 w-full max-w-5xl">
                <div className="bg-gray-800 p-1">
                  {/* Grid layout: 2 cột cho Đỏ và Xanh */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Cột ĐỎ */}
                    <div className="flex flex-col">
                      {/* Container cho Điểm số và Hành động - dùng flex để tự động dồn */}
                      <div className="flex flex-col gap-0.5 flex-1">
                        {/* Điểm số ĐỎ - Grid 5 cột, mỗi cột có 2 buttons (+/-) */}
                        <div className="bg-gray-700 p-0.5 flex-1 w-full">
                          <div className="grid grid-cols-5 gap-0.5">
                            {/* Cột 1: +1/-1 */}
                            {buttonPermissions.hien_thi_button_diem_1 && (
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => handleScoreChange("red", 1)}
                                  disabled={disableRedButtons}
                                  className={`font-bold py-0.5 text-[10px] transition-colors ${
                                    disableRedButtons
                                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                      : 'bg-red-600 hover:bg-red-700 text-white'
                                  }`}
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleScoreChange("red", -1)}
                                  disabled={disableRedButtons}
                                  className={`font-bold py-0.5 text-[10px] transition-colors ${
                                    disableRedButtons
                                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                      : 'bg-red-800 hover:bg-red-900 text-white'
                                  }`}
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
                                  className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  +2
                                </button>
                                <button
                                  onClick={() => handleScoreChange("red", -2)}
                                  disabled={disableRedButtons}
                                  className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  +3
                                </button>
                                <button
                                  onClick={() => handleScoreChange("red", -3)}
                                  disabled={disableRedButtons}
                                  className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleScoreChange("red", -5)}
                                  disabled={disableRedButtons}
                                  className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => handleScoreChange("red", -10)}
                                  disabled={disableRedButtons}
                                  className={getButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
                                >
                                  -10
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hành động ĐỎ - Grid 5 cột */}
                        <div className="bg-gray-700 p-0.5">
                          <div className="grid grid-cols-5 gap-0.5">
                            {/* Cột 1: Nhắc nhở +/- */}
                            {buttonPermissions.hien_thi_button_nhac_nho && (
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => handleRemind("red", 1)}
                                  disabled={disableRedButtons}
                                  className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  Nhắc nhở +
                                </button>
                                <button
                                  onClick={() => handleRemind("red", -1)}
                                  disabled={disableRedButtons}
                                  className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  Cảnh cáo +
                                </button>
                                <button
                                  onClick={() => handleWarn("red", -1)}
                                  disabled={disableRedButtons}
                                  className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  Đ.Chân +
                                </button>
                                <button
                                  onClick={() => handleKick("red", -1)}
                                  disabled={disableRedButtons}
                                  className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  Biên
                                </button>
                              )}
                              {buttonPermissions.hien_thi_button_nga && (
                                <button
                                  onClick={() => handleNga("red")}
                                  disabled={disableRedButtons}
                                  className={getActionButtonClassName("red", "bg-red-800 hover:bg-red-900 text-white")}
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
                                  className={getActionButtonClassName("red", "bg-red-600 hover:bg-red-700 text-white")}
                                >
                                  🏥 Y TẾ
                                </button>
                              )}
                              {buttonPermissions.hien_thi_button_thang && (
                                <button
                                  onClick={() => handleWinner("red")}
                                  disabled={disableRedButtons}
                                  className={getActionButtonClassName("red", "bg-yellow-600 hover:bg-yellow-500 text-white")}
                                >
                                  🏆 THẮNG
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cột XANH */}
                    <div className="flex flex-col items-end">
                      {/* Container cho Điểm số và Hành động - dùng flex để tự động dồn */}
                      <div className="flex flex-col gap-0.5 flex-1 w-full">
                        {/* Điểm số XANH - Grid 5 cột, mỗi cột có 2 buttons (+/-) */}
                        <div className="bg-gray-700 p-0.5">
                          <div className="grid grid-cols-5 gap-0.5" dir="rtl">
                            {/* Cột 5: +1/-1 */}
                            {buttonPermissions.hien_thi_button_diem_1 && (
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => handleScoreChange("blue", 1)}
                                  disabled={disableBlueButtons}
                                  className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  1+
                                </button>
                                <button
                                  onClick={() => handleScoreChange("blue", -1)}
                                  disabled={disableBlueButtons}
                                  className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  2+
                                </button>
                                <button
                                  onClick={() => handleScoreChange("blue", -2)}
                                  disabled={disableBlueButtons}
                                  className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  3+
                                </button>
                                <button
                                  onClick={() => handleScoreChange("blue", -3)}
                                  disabled={disableBlueButtons}
                                  className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  5+
                                </button>
                                <button
                                  onClick={() => handleScoreChange("blue", -5)}
                                  disabled={disableBlueButtons}
                                  className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  10+
                                </button>
                                <button
                                  onClick={() => handleScoreChange("blue", -10)}
                                  disabled={disableBlueButtons}
                                  className={getButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
                                >
                                  10-
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hành động XANH - Grid 5 cột */}
                        <div className="bg-gray-700 p-0.5">
                          <div className="grid grid-cols-5 gap-0.5" dir="rtl">
                            {/* Cột 1: Nhắc nhở +/- */}
                            {buttonPermissions.hien_thi_button_nhac_nho && (
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => handleRemind("blue", 1)}
                                  disabled={disableBlueButtons}
                                  className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  + Nhắc nhở
                                </button>
                                <button
                                  onClick={() => handleRemind("blue", -1)}
                                  disabled={disableBlueButtons}
                                  className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  + Cảnh cáo
                                </button>
                                <button
                                  onClick={() => handleWarn("blue", -1)}
                                  disabled={disableBlueButtons}
                                  className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  + Đ.Chân
                                </button>
                                <button
                                  onClick={() => handleKick("blue", -1)}
                                  disabled={disableBlueButtons}
                                  className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                  Biên
                                </button>
                              )}
                              {buttonPermissions.hien_thi_button_nga && (
                                <button
                                  onClick={() => handleNga("blue")}
                                  disabled={disableBlueButtons}
                                  className={getActionButtonClassName("blue", "bg-blue-800 hover:bg-blue-900 text-white")}
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
                                  className={getActionButtonClassName("blue", "bg-blue-600 hover:bg-blue-700 text-white")}
                                >
                                Y TẾ
                                </button>
                              )}
                              {buttonPermissions.hien_thi_button_thang && (
                                <button
                                  onClick={() => handleWinner("blue")}
                                  disabled={disableBlueButtons}
                                  className={getActionButtonClassName("blue", "bg-yellow-600 hover:bg-yellow-500 text-white")}
                                >
                                  🏆 THẮNG
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer controls */}
              <div className="flex items-center justify-center  w-full gap-2 mt-2 mb-3">
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
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg font-bold text-[10px] transition-colors min-w-[120px] animate-pulse"
                  >
                    🏥 Y tế
                  </button>
                )}

                {/* <button
                  onClick={toggleTimer}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors min-w-[150px]"
                >
                  {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
                </button> */}
                {/* Nút quay lại */}
                {buttonPermissions.hien_thi_button_quay_lai && (
                  <button
                    onClick={btnGoBack}
                    className=" bg-gray-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors z-10 text-[10px]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thoát
                  </button>
                )}
                {buttonPermissions.hien_thi_button_reset && (
                  <button
                    onClick={resetTimer}
                    className="bg-gray-700 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg font-bold text-[10px] transition-colors min-w-[80px]"
                  >
                    Reset
                  </button>
                )}
                {/* Nút Undo */}
                {/* <button
                  onClick={undoLastAction}
                  disabled={actionHistory.length === 0}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors min-w-[150px]"
                >
                  Hoàn tác ({actionHistory.length})
                </button> */}

                {/* Nút Lịch sử và Cấu hình */}
                <div className=" flex gap-1.5 z-10">
                  {buttonPermissions.hien_thi_button_lich_su && (
                    <button
                      onClick={btnShowHistory}
                      className="bg-gray-700 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors text-[10px]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Lịch sử ({actionHistory.length})
                    </button>
                  )}
                  {buttonPermissions.hien_thi_button_cau_hinh && (
                    <button
                      onClick={btnSetting}
                      className="bg-gray-700 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors text-[10px]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
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
                  )}

                  {/* Nút Kết thúc */}
                  {buttonPermissions.hien_thi_button_ket_thuc && (
                    <button
                      onClick={btnFinishMatch}
                      className="bg-gray-700 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all text-[10px] shadow-lg hover:shadow-xl"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
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
                </div>

                {/* Nút quay lại trận trước */}
                {buttonPermissions.hien_thi_button_tran_truoc && (
                  <button
                    onClick={btnPreviousMatch}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all text-[10px] shadow-lg hover:shadow-xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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

                {/* Nút trận kế tiếp */}
                {buttonPermissions.hien_thi_button_tran_tiep_theo && (
                  <button
                    onClick={btnNextMatch}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all text-[10px] shadow-lg hover:shadow-xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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

              </div>
              {/* Row 2: Statistics and Ready Indicator */}
              <div className="flex items-center justify-between text-xs mb-2 ">
                {/* Left: Statistics */}
                <div className="flex items-center gap-6">
                  <span className="text-gray-400">
                    Tổng số: <span className="text-white font-bold text-sm">{matchInfo.config_system?.so_giam_dinh || 3}</span>
                  </span>
                  <span className="text-gray-400">
                    Sẵn sàng: <span className="text-green-400 font-bold text-sm">
                      {referrerDevices.filter(s => s.ready).length}
                    </span>
                  </span>
                  <span className="text-gray-400">
                    Đã kết nối: <span className="text-yellow-400 font-bold text-sm">
                      {referrerDevices.filter(s => s.connected && !s.ready).length}
                    </span>
                  </span>
                  <span className="text-gray-400">
                    Chưa kết nối: <span className="text-red-400 font-bold text-sm">
                      {referrerDevices.filter(s => !s.connected).length}
                    </span>
                  </span>
                </div>
                {/* Right: Ready Indicator */}
                {referrerDevices.filter(s => s.ready).length === (matchInfo.config_system?.so_giam_dinh || 3) ? (
                  <div className="flex items-center gap-2 bg-green-500/20 border border-green-500 rounded px-4 py-1.5">
                    <span className="text-green-400 font-bold">✓ Tất cả sẵn sàng</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded px-4 py-1.5 animate-pulse">
                    <span className="text-yellow-400 font-bold">⚠ Chưa đủ giám định</span>
                  </div>
                )}
              </div>

            {/* Row 3: Hint text - Always visible */}
            <div className="text-gray-400 text-xs border-t border-gray-700 pt-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">Space</kbd> Bắt đầu/Tạm dừng |
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">Ctrl+Z</kbd> Hoàn tác |
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">F1</kbd> Kết nối |
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">F5</kbd> Cấu hình |
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">F6</kbd> Lịch sử |
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">F7</kbd> Kết nối GĐ  |
                {/* <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">F10</kbd> {showControls ? 'Ẩn' : 'Hiện'} controls */}
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px]">
                <span className="text-red-400">ĐỎ:</span>
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">Q/W/E</kbd> +1/+2/+3 |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">A/S/D</kbd> -1/-2/-3 |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">R/F</kbd> Nhắc nhở |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">Z/X</kbd> Cảnh cáo |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">T</kbd> Thắng |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">C</kbd> Y tế
                <span className="mx-1">|</span>
                <span className="text-blue-400">XANH:</span>
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">P/O/I</kbd> +1/+2/+3 |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">L/K/J</kbd> -1/-2/-3 |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">U/H</kbd> Nhắc nhở |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">M/N</kbd> Cảnh cáo |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">Y</kbd> Thắng |
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">B</kbd> Y tế
                <span className="mx-1">|</span>
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">G</kbd> Reset
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo chung */}
      <ConfirmModal {...modalProps} />
    </div>
  );
};

export default Vovinam;
