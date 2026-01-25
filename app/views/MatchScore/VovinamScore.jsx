import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import JudgeScore from "./components/JudgeScore";
import Header from "./components/Header";
import TotalScore from "./components/TotalScore";
import ControlPanel from "./components/ControlPanel";
import InfoPanel from "./components/InfoPanel";
import Modal from "../../components/Modal";
import VovinamScoreForm from "./Forms/VovinamScoreForm";
import ScoreWaitingOverlay from "./components/ScoreWaitingOverlay";
import ConnectionManagerModal from "./components/ConnectionManagerModal";
import axios from "axios";
import useConfirmModal from "../../hooks/useConfirmModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  useSocketEvent,
  emitSocketEvent,
} from "../../config/hooks/useSocketEvents";
import { MSG_TP_CLIENT } from "../../common/Constants";
import { useSelector, useDispatch } from "react-redux";
import {
  connectSocket,
  disconnectSocket,
} from "../../config/redux/reducers/socket-reducer";
import { socketClient } from "../../config/routes";
import { initSocket as initSocketUtil } from "../../utils/socketUtils";

export default function VovinamScore() {
  const {
    modalProps,
    showConfirm,
    showAlert,
    showWarning,
    showError,
    showSuccess,
  } = useConfirmModal();
  const socket = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  // Chuyển matchData sang state để tự động cập nhật khi location thay đổi
  const [matchData, setMatchData] = useState(location.state?.matchData || {});
  const matchDataRef = useRef(location.state?.matchData || {});
  const [configSystem, setConfigSystem] = useState(
    location.state?.matchData?.config_system || {},
  );
  const returnUrl = location.state?.returnUrl || "/management/competition-data";

  // Cập nhật matchData khi location.state thay đổi
  useEffect(() => {
    if (location.state?.matchData) {
      setMatchData(location.state.matchData);
      matchDataRef.current = location.state?.matchData;
      setConfigSystem(location.state.matchData.config_system || {});
    }
  }, [location.state]);

  const extractCompetitionIdFromUrl = (url) => {
    // URL format: /management/competition-data/:id
    const match = url.match(/\/management\/competition-data\/(\d+)/);
    return match ? match[1] : null;
  };

  // State cho logos
  const [lsLogo, setLsLogo] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [showAthletes, setShowAthletes] = useState(true);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [showScores, setShowScores] = useState(true);
  const [showRefConnectionState, setShowRefConnectionState] = useState(false);

  // Chuyển scores sang useRef để tránh stale closure
  const scoresRef = useRef({});
  const [, forceUpdate] = useState({});

  // Helper function để update scores và trigger re-render
  const setScores = (newScores) => {
    scoresRef.current = newScores;
    // chuyển text -> number
    Object.keys(scoresRef.current).forEach((key) => {
      if (key.includes("judge")) {
        scoresRef.current[key] = Number(scoresRef.current[key]);
      }
    });
    forceUpdate({}); // Trigger re-render
  };

  // Getter để dễ sử dụng
  const scores = scoresRef.current;

  // Waiting overlay states
  const [showWaiting, setShowWaiting] = useState(false);
  const [receivedJudges, setReceivedJudges] = useState([]);

  // Connection manager states
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [referrerDevices, setReferrerDevices] = useState([]);

  // Timer states
  const isTimerRunning = useRef(false);
  const timerInterval = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

  // Room management state
  const [currentRoom, setCurrentRoom] = useState(null);

  // Hàm khởi tạo socket connection (sử dụng socketUtils)
  const initSocket = async (forceReConnection = false) => {
    // Sử dụng utility function để init socket
    const connected = await initSocketUtil({
      dispatch,
      connectSocket,
      socket,
      role: "admin",
      onSuccess: () => {
        console.log("✅ Socket initialized successfully in VovinamScore");
      },
      onError: (error) => {
        console.error("❌ Socket initialization failed:", error);
        showError("Không thể kết nối socket. Vui lòng thử lại.");
      },
      forceReConnection: forceReConnection,
      disconnectSocket: disconnectSocket,
    });

    // Nếu kết nối thành công, thực hiện post-connection logic
    if (connected) {
      try {
        // Load room từ localStorage
        const savedRoom = localStorage.getItem("admin_room");
        if (savedRoom) {
          try {
            const roomData = JSON.parse(savedRoom);
            setCurrentRoom(roomData);

            console.log("Loaded room from localStorage:", roomData);

            // Đợi một chút để đảm bảo socket đã sẵn sàng
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Auto connect với room đã lưu
            emitSocketEvent("REGISTER_ROOM_ADMIN", {
              room_id: roomData.room_id,
              uuid_desktop: roomData.uuid_desktop,
              permission: 9,
            });
          } catch (error) {
            console.error("Error loading saved room:", error);
          }
        } else {
          // Chưa có room
          console.log("No saved room found");
        }
      } catch (error) {
        console.error("Error in post-connection logic:", error);
      }
    }
  };

  // Lắng nghe response từ server khi fetch danh sách thiết bị
  useSocketEvent("RES_ROOM_ADMIN", (response) => {
    console.log("Receive from server RES_ROOM_ADMIN:", response);
    if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
      const devices = Object.values(response.data.ls_conn);
      // Transform server data to match our device format
      const transformedDevices = devices
        .filter(
          (device) =>
            device.register_status_code !== "ADMIN" &&
            device?.client_ip != "::1",
        ) // Only judge devices
        .map((device, index) => ({
          referrer: device.referrer,
          device_name: device.device_name,
          device_ip: device.client_ip || "N/A",
          connected: device.connect_status_code === "CONNECTED", // 1 = active, 0 = inactive
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

  // Khởi tạo socket khi component mount
  useEffect(() => {
    initSocket();
    fetchLogos();
  }, []); // Chỉ chạy 1 lần khi mount

  // Cập nhật khi chuyển trận (matchData.match_id thay đổi)
  useEffect(() => {
    console.log("Match changed, updating scores and info...");

    // Reset timer khi chuyển trận
    resetTimer();

    // set score nếu no empty
    if (
      matchDataRef.current.scores &&
      Object.keys(matchDataRef.current.scores).length > 0
    ) {
      setScores({ ...matchDataRef.current.scores });
    } else {
      console.log("Clearing scores");
      clearScore();
    }

    // Emit thông tin trận đấu mới
    emitSocketEvent("QUYEN_INFO", {
      match_id: matchDataRef.current.match_id,
      ten_giai_dau: matchDataRef.current.ten_giai_dau,
      ten_mon_thi: matchDataRef.current.ten_mon_thi,
      match_name: matchDataRef.current.match_name,
      team_name: matchDataRef.current.team_name,
    });

    // lấy danh sách mới
    emitSocketEvent("ADMIN_FETCH_CONN", {});
  }, [matchDataRef.current.match_id]); // Chạy lại khi match_id thay đổi

  // Khởi tạo room khi component mount
  useEffect(() => {
    const savedRoom = localStorage.getItem("admin_room");
    if (savedRoom) {
      const roomData = JSON.parse(savedRoom);
      setCurrentRoom(roomData);
    }

    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleBack();
      } else if (e.key === "F10") {
        e.preventDefault();
        setShowWaiting((prev) => !prev);
      } else if (e.key === "F1") {
        e.preventDefault();
        setShowConnectionModal((prev) => !prev);
      } else if (e.key === "F6") {
        e.preventDefault();
        setShowRefConnectionState((prev) => !prev);
      } else if (e.key === "F5") {
        e.preventDefault();
        resetTimer();
        clearScore();
      } else if (e.key === "F4") {
        e.preventDefault();
        setShowAthletes((prev) => !prev);
      } else if (e.key === "F3") {
        e.preventDefault();
        setShowActionButtons((prev) => !prev);
      } else if (e.key === "F2") {
        // e.preventDefault();
        // setShowScores((prev) => !prev);
      } else if (e.key === " ") {
        e.preventDefault();
        startTimer();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    // kiểm tra empty object matchData.scores
    if (
      matchData.scores &&
      Object.keys(matchDataRef.current.scores).length > 0
    ) {
      setScores({ ...matchDataRef.current.scores });
    } else {
      clearScore();
    }
  }, [matchDataRef.current.scores]);

  // Track received scores for waiting overlay
  useEffect(() => {
    if (!matchDataRef.current.scores) return;

    // Check which judges have submitted scores
    const judges = [];
    if (matchDataRef.current.scores.judge1 > 0) judges.push(1);
    if (matchDataRef.current.scores.judge2 > 0) judges.push(2);
    if (matchDataRef.current.scores.judge3 > 0) judges.push(3);

    if (configSystem.so_giam_dinh === 5) {
      if (matchDataRef.current.scores.judge4 > 0) judges.push(4);
      if (matchDataRef.current.scores.judge5 > 0) judges.push(5);
    }

    setReceivedJudges(judges);

    // Auto hide overlay when all scores received
    if (judges.length === configSystem.so_giam_dinh && showWaiting) {
      setTimeout(() => {
        setShowWaiting(false);
      }, 1500); // Wait 1.5s before hiding
    }
  }, [matchDataRef.current.scores, configSystem.so_giam_dinh, showWaiting]);

  // clear điểm hiện tại
  const clearScore = () => {
    if (configSystem.so_giam_dinh == 3) {
      setScores({
        judge1: 0,
        judge2: 0,
        judge3: 0,
        total: 0,
      });
    } else if (configSystem.so_giam_dinh == 5) {
      setScores({
        judge1: 0,
        judge2: 0,
        judge3: 0,
        judge4: 0,
        judge5: 0,
        total: 0,
      });
    }

    // Show waiting overlay and reset received judges
    setShowWaiting(false);
    setReceivedJudges([]);
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

  // Connection Manager Handlers
  const handleReconnect = async (device) => {
    console.log(`Reconnecting to Judge ${device.referrer}...`);
    try {
      // Emit reconnect event
      emitSocketEvent("RECONNECT_CLIENT", {
        socket_id: device.socket_id,
        room_id: device.room_id,
        referrer: device.referrer,
      });

      await new Promise((resolve) => setTimeout(resolve, 800));

      showSuccess(
        `Đã gửi yêu cầu kết nối lại đến Giám định ${device.referrer}!`,
      );

      // Refresh device list để cập nhật trạng thái
      handleRefreshDevices();
    } catch (error) {
      console.error("Reconnect error:", error);
      showError(`Không thể kết nối lại với Giám định ${device.referrer}`);
    }
  };

  const handleDisconnect = async (device) => {
    console.log(`Disconnecting Judge ${device.referrer}...`);
    try {
      // Emit disconnect event
      emitSocketEvent("DISCONNECT_CLIENT", {
        socket_id: device.socket_id,
        room_id: device.room_id,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      showSuccess(`Đã ngắt kết nối với Giám định ${device.referrer}!`);

      // Update local state immediately
      setReferrerDevices((prev) =>
        prev.map((d) =>
          d.referrer === device.referrer ? { ...d, connected: false } : d,
        ),
      );
    } catch (error) {
      console.error("Disconnect error:", error);
      showError(`Không thể ngắt kết nối với Giám định ${device.referrer}`);
    }
  };

  const handleRefreshDevices = () => {
    console.log("Refreshing device list...");
    // Emit event để fetch danh sách thiết bị từ server
    emitSocketEvent("ADMIN_FETCH_CONN", {});
    showSuccess("Đang làm mới danh sách thiết bị...");
  };

  const buttons = useRef([
    {
      label: "QUAY LẠI",
      onClick: () => handleBack(),
      iconName: "Exit",
      variant: "red",
      fontBold: true,
    },
    {
      label: !isTimerRunning.current ? "BẮT ĐẦU" : "DỪNG",
      onClick: () => startTimer(),
      iconName: "Start",
      fontBold: true,
    },
    {
      label: "TRƯỚC",
      onClick: () => previousMatch(),
      iconName: "ChevronLeft",
      variant: "yellow",
      fontBold: true,
    },
    {
      label: "SAU",
      onClick: () => nextMatch(),
      iconName: "ChevronRight",
      variant: "yellow",
      fontBold: true,
      iconBehind: true,
    },
    {
      label: "TÍNH ĐIỂM",
      onClick: () => handleCaculator(),
      iconName: "Calculator",
      fontBold: true,
    },
    {
      label: "NHẬP ĐIỂM TAY",
      onClick: () => handleManualInput(),
      iconName: "Edit",
      fontBold: true,
    },
    {
      label: "MỞ CHẤM ĐIỂM",
      onClick: () => setShowWaiting((prev) => !prev),
      iconName: "Open",
      fontBold: true,
    },
    {
      label: "LƯU KẾT QUẢ",
      onClick: () => onSaveResult(),
      iconName: "Save",
      fontBold: true,
    },
    {
      label: "LÀM MỚI",
      onClick: () => resetTimer(),
      iconName: "Reset",
      variant: "blue",
      fontBold: true,
    },
  ]);

  // Thực hiện quay lại
  const handleBack = () => {
    navigate(returnUrl);
  };

  // Thực hiện tính toán
  const handleCaculator = (currentScores = null) => {
    // Sử dụng currentScores nếu được truyền vào, nếu không thì dùng state scores
    const scoresToCalculate = currentScores || scoresRef.current;

    if (!scoresToCalculate?.judge1) return;
    // Loại bỏ total và hidden để chỉ lấy điểm giám định
    const { total, hidden, ...judgeScores } = scoresToCalculate;

    if (configSystem.so_giam_dinh == 3) {
      const calculatedTotal =
        Number(judgeScores.judge1 || 0) +
        Number(judgeScores.judge2 || 0) +
        Number(judgeScores.judge3 || 0);
      const newScores = { ...judgeScores, total: calculatedTotal };
      setScores(newScores);
      return newScores;
    } else if (configSystem.so_giam_dinh == 5) {
      const scoresArray = Object.values(judgeScores)
        .filter((score) => Number(score) !== 0)
        .sort((a, b) => Number(a) - Number(b));

      const calculatedTotal =
        scoresArray.length >= 3
          ? scoresArray
              .slice(1, -1)
              .reduce((acc, score) => Number(acc) + Number(score), 0)
          : 0;

      let selectedMaxIndex = -1;
      let selectedMinIndex = -1;
      const maxScore = Math.max(...scoresArray);
      const minScore = Math.min(...scoresArray);
      const hasNonZeroScores = scoresArray.some((s) => s > 0);
      const scoresToCalculate = currentScores || scoresRef.current;

      if (hasNonZeroScores) {
        // Tìm tất cả các index có điểm cao nhất
        const maxIndices = scoresArray
          .map((score, idx) => ({ score: Number(score), idx }))
          .filter((item) => item.score === Number(maxScore))
          .map((item) => item.idx);

        // Tìm tất cả các index có điểm thấp nhất
        const minIndices = scoresArray
          .map((score, idx) => ({ score: Number(score), idx }))
          .filter((item) => item.score === Number(minScore) && item.score > 0)
          .map((item) => item.idx);

        // Random chọn 1 index từ danh sách điểm cao nhất
        if (maxIndices.length > 0) {
          selectedMaxIndex =
            maxIndices.length > 1
              ? maxIndices[Math.floor(Math.random() * maxIndices.length)]
              : maxIndices[0];
        }

        // Random chọn 1 index từ danh sách điểm thấp nhất
        if (minIndices.length > 0) {
          selectedMinIndex =
            minIndices.length > 1
              ? minIndices[Math.floor(Math.random() * minIndices.length)]
              : minIndices[0];
        }
      }
      const newScores = {
        ...judgeScores,
        total: calculatedTotal,
        hidden: { maxIndex: selectedMaxIndex, minIndex: selectedMinIndex },
      };
      setScores(newScores);
      return newScores;
    }
  };

  // Thực hiện đến căp thi tiếp
  const nextMatch = async () => {
    try {
      const competitionId =
        matchDataRef.current.competition_dk_id ||
        extractCompetitionIdFromUrl(returnUrl);
      if (!competitionId) {
        await showError(
          "Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.",
        );
        navigate(returnUrl);
        return;
      }
      /// LẤY DANH SÁCH TỪ competition-match-team
      const matchesResponse = await axios.get(
        `http://localhost:6789/api/competition-match-team/by-dk/${competitionId}`,
      );
      const matches = matchesResponse.data.success
        ? matchesResponse.data.data
        : [];
      // Tìm trận tiếp theo: rơw_index = matchData.row_index + matchData.athletes.length
      const index = matches.findIndex(
        (m) => m.id === matchDataRef.current.match_id,
      );
      const nextMatch = matches[index + 1];
      if (!nextMatch) {
        await showAlert("Đã hết trận đấu! Quay về màn hình quản lý.");
        return;
      }
      const nextMatchData = {
        ...matchDataRef.current,
        match_id: nextMatch.id, // match_id của trận tiếp theo
        match_no: nextMatch.match_no,
        match_name: nextMatch.match_name,
        team_name: nextMatch.team_name,
        match_type: nextMatch.match_type,
        athletes: nextMatch.athletes,
        match_status: nextMatch.match_status,
        config_system: configSystem,
        row_index: nextMatch.row_index,
        scores: nextMatch.scores || {},
      };
      navigate("/scoreboard/vovinam-score", {
        state: {
          matchData: nextMatchData,
          returnUrl: returnUrl,
        },
        replace: true, // Replace để không tạo history entry mới
      });
    } catch (error) {
      console.error("❌ Lỗi khi chuyển trận:", error);
      await showError(
        "Lỗi khi chuyển sang trận tiếp theo: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Thục hiện đến trận trước
  const previousMatch = async () => {
    try {
      const competitionId =
        matchDataRef.current.competition_dk_id ||
        extractCompetitionIdFromUrl(returnUrl);
      if (!competitionId) {
        await showError(
          "Không tìm thấy thông tin giải đấu. Quay về màn hình quản lý.",
        );
        navigate(returnUrl);
        return;
      }
      const matchesResponse = await axios.get(
        `http://localhost:6789/api/competition-match-team/by-dk/${competitionId}`,
      );
      const matches = matchesResponse.data.success
        ? matchesResponse.data.data
        : [];
      // lất vị trí của trận trước matches lấy theo id hiện tại -> lấy
      const index = matches.findIndex(
        (m) => m.id === matchDataRef.current.match_id,
      );
      const previousMatch = matches[index - 1];
      if (!previousMatch) {
        await showAlert("Đây là trận đầu tiên!");
        return;
      }
      const previousMatchData = {
        ...matchDataRef.current,
        match_id: previousMatch.id, // match_id của trận trước
        match_no: previousMatch.match_no,
        match_name: previousMatch.match_name,
        team_name: previousMatch.team_name,
        match_type: previousMatch.match_type,
        athletes: previousMatch.athletes,
        match_status: previousMatch.match_status,
        row_index: previousMatch.row_index,
        scores: previousMatch.scores || {},
      };
      navigate("/scoreboard/vovinam-score", {
        state: {
          matchData: previousMatchData,
          returnUrl: returnUrl,
        },
        replace: true, // Replace để không tạo history entry mới
      });
    } catch (error) {
      console.error("❌ Lỗi khi chuyển trận:", error);
      await showError(
        "Lỗi khi chuyển sang trận trước: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Thực hiện nhập tay
  const handleManualInput = () => {
    setOpenModal(true);
  };

  // thực hiện lưu kết quả:
  const onSaveResult = async () => {
    try {
      if (!matchDataRef.current.match_id) {
        alert("Không tìm thấy thông tin trận đấu!");
        return;
      }
      const params = {
        match_id: matchDataRef.current.match_id,
        scores: scoresRef.current,
        config_system: configSystem,
      };
      const result = await axios.post(
        "http://localhost:6789/api/competition-match-team/save-score",
        params,
      );
      if (result.status == 200 && result.data.success) {
        alert("Lưu kết quả thành công!");
      } else {
        alert("Lưu kết quả thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lưu kết quả:", error);
      alert(
        "Lỗi khi lưu kết quả: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Thực hiện tạo file excel kết quả
  const RenderContentModal = ({ setScores, scoresRef }) => {
    return (
      <VovinamScoreForm
        type={"other"}
        soGiamDinh={configSystem.so_giam_dinh}
        scores={matchData.scores ?? scoresRef.current}
        scoresRef={scoresRef}
        onAgree={(data) => {
          setScores(data);
          // Gọi handleCaculator với data mới để tính toán ngay
          setOpenModal(false);
        }}
        onGoBack={() => setOpenModal(false)}
      />
    );
  };

  // lắng nghe điểm quyền
  useSocketEvent(MSG_TP_CLIENT.SCORE_QUYEN, (response) => {
    if (!showWaiting) return;
    if (response?.data?.referrer) {
      setScores({
        ...scores,
        [`judge${response?.data?.referrer}`]: response?.data?.score,
      });
    }
  });

  // Timer functions
  const startTimer = () => {
    if (!isTimerRunning.current) {
      isTimerRunning.current = true;
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      timerInterval.current = interval;
    } else {
      isTimerRunning.current = false;
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }
  };

  const stopTimer = () => {
    if (isTimerRunning.current) {
      isTimerRunning.current = false;
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }
  };

  const resetTimer = () => {
    stopTimer();
    setElapsedTime(0);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerInterval]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // nút nhấn tạo mã QR
  const generateQR = async () => {
    try {
      const savedRoom = localStorage.getItem("admin_room");
      if (!savedRoom) {
        showError("Không tìm thấy thông tin phòng. Vui lòng kết nối lại.");
        return null;
      }
      const roomData = JSON.parse(savedRoom);

      // Gọi API get-qr-active
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        baseURL: "http://localhost:6789/api/config/get-qr-active",
        params: {
          room_id: roomData.room_id, // Fixed: use roomData instead of savedRoom
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

  // tạo lại connect
  const handleReConnectionSocket = async () => {
    const confirmReconnect = window.confirm(
      "Bạn có chắc chắn muốn tạo lại kết nối socket?\n\nSocket hiện tại sẽ bị ngắt và tạo lại kết nối mới.",
    );
    await initSocket(true);
  };

  // nút nhấn cấp quyền chấm điểm, và phân luôn giám định
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-3 pb-20 text-white flex flex-col items-center">
      {/* Waiting Overlay */}
      {/* <ScoreWaitingOverlay
        show={showWaiting}
        message="Đang chờ nhập điểm từ giám định"
        judgeCount={configSystem.so_giam_dinh || 5}
        receivedScores={receivedJudges}
      /> */}

      {/* Connection Manager Modal */}
      <ConnectionManagerModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        devices={referrerDevices}
        configSystem={configSystem}
        onReconnect={handleReconnect}
        onDisconnect={handleDisconnect}
        onRefresh={handleRefreshDevices}
        onInitSocket={handleReConnectionSocket}
        onGenerateQR={generateQR}
        onSetPermissionRef={onSetPermissionRef}
      />

      {/* Header Vovinam */}
      <Header
        title={matchDataRef.current.ten_giai_dau || "GIẢI VÔ ĐỊCH"}
        desc={matchDataRef.current.ten_mon_thi || "VÕ HIỆN ĐẠI"}
        logos={lsLogo}
      />

      {/* Match Name & Team Name */}
      <div className="w-full max-w-6xl mb-3 space-y-3">
        <div className="bg-white/10 px-6 py-4 shadow-2xl">
          <p className="text-start text-2xl font-bold tracking-wide">
            NỘI DUNG:{" "}
            {matchDataRef.current?.match_name?.toUpperCase() ||
              matchDataRef.current?.match_type?.toUpperCase() ||
              ""}
          </p>
        </div>
        <div className="bg-white/10 px-6 py-4 shadow-2xl ">
          <p className="text-start text-2xl font-bold tracking-wide">
            ĐƠN VỊ: {matchDataRef.current?.team_name?.toUpperCase() || ""}
          </p>
        </div>
      </div>

      {/* Timer Section - Center (when showScores = false) */}
      {!showScores && (
        <div className="flex items-center gap-4 mt-8">
          <div className="bg-white/10 px-8 py-6 shadow-2xl !rounded">
            <span className="text-6xl font-mono font-bold tracking-wider text-yellow-300">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
      )}

      {/* Bố cục điểm: Giám định 1-5 + Tổng điểm */}
      {showScores && (
        <>
          <div className="w-full max-w-6xl mb-6 mt-6">
            <div
              className={`grid grid-cols-${configSystem.so_giam_dinh ?? 5} md:grid-cols-${configSystem.so_giam_dinh ?? 5} lg:grid-cols-${configSystem.so_giam_dinh ?? 5} gap-4 justify-items-center`}
            >
              {/* Render JudgeScores */}
              {(() => {
                // Tính toán selectedMaxIndex và selectedMinIndex một lần duy nhất
                // Render các JudgeScore
                return Array.from({
                  length: configSystem.so_giam_dinh ?? 5,
                }).map((_, index) => {
                  const judgeNum = index + 1;
                  const judgeScore = scores[`judge${judgeNum}`] || 0;

                  const isHighest =
                    configSystem.so_giam_dinh == 3
                      ? false
                      : index === scores?.hidden?.maxIndex;
                  const isLowest =
                    configSystem.so_giam_dinh == 3
                      ? false
                      : index === scores?.hidden?.minIndex;

                  return (
                    <JudgeScore
                      key={index}
                      judge={judgeNum}
                      score={judgeScore}
                      isHighest={isHighest}
                      isLowest={isLowest}
                    />
                  );
                });
              })()}
            </div>
          </div>
          <TotalScore total={scores.total} />
        </>
      )}

      {/* Danh sách VĐV (Toggle với F5) */}
      {showAthletes && (
        <div className="w-full max-w-6xl animate-fadeIn mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(matchDataRef.current.athletes || []).map((athlete, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 flex items-center gap-2 rounded"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500 text-black font-bold text-sm">
                  {index + 1}
                </span>
                <span className="font-semibold">{athlete.athlete_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActionButtons && (
        <div className="w-full max-w-6xl mt-6">
          <ControlPanel
            buttons={buttons.current}
            timer={formatTime(elapsedTime)}
            showTimer={true}
          />
        </div>
      )}

      {/*  Statistics and Ready Indicator - Below Scoreboard */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-gray-900/95 backdrop-blur-sm z-50">
        <div className="max-w-[1920px] mx-auto px-2 p-3">
          <div className="flex items-center justify-between text-xs">
            {/* Left: Statistics */}
            <div className="flex items-center gap-6">
              {/* Trạng thái tính điểm */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Tính điểm:</span>
                {showWaiting ? (
                  <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500 rounded px-2.5 py-1 animate-pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-400 font-bold text-sm">
                      Đang mở
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-gray-500/20 border border-gray-500 rounded px-2.5 py-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-400 font-bold text-sm">
                      Đã đóng
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-gray-600"></div>

              <span className="text-gray-400">
                Tổng số:{" "}
                <span className="text-white font-bold text-sm">
                  {configSystem.so_giam_dinh || 3}
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
            </div>

            {/* Center: Individual GĐ Indicators */}
            <div className="flex items-center gap-2">
              {Array.from(
                { length: configSystem.so_giam_dinh || 3 },
                (_, index) => {
                  const gdNumber = index + 1;
                  const device = referrerDevices.find(
                    (d) => Number(d.referrer) === gdNumber,
                  );
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

            {/* Right: Ready Indicator + Control Bar Toggle */}
            <div className="flex items-center gap-4">
              {/* Ready Indicator */}
              {referrerDevices.filter((s) => s.ready).length ===
              (configSystem.so_giam_dinh || 3) ? (
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

              {/* Control Bar Toggle Switch */}
              <div className="flex items-center gap-2 bg-gray-800/50  px-3 py-2">
                <span className="text-gray-300 text-sm font-medium">
                  Ẩn/Hiện
                </span>
                <button
                  onClick={() => setShowActionButtons(!showActionButtons)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    showActionButtons ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  title={
                    showActionButtons ? "Ẩn Control Bar" : "Hiện Control Bar"
                  }
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showActionButtons ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title={"NHẬP ĐIỂM TAY"}
      >
        <RenderContentModal
          matchData={matchDataRef.current}
          setScores={setScores}
          scoresRef={scoresRef}
        />
      </Modal>

      {/* Modal thông báo chung */}
      <ConfirmModal {...modalProps} />

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
