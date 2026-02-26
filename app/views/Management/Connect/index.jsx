import React, { Fragment, useEffect, useState, useRef } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import NotePopover from "./components/NotePopover";
import Modal from "../../../components/Modal";
import DisconnectForm from "./Forms/DisconnectForm";
import NotificationForm from "./Forms/NotificationForm";
import UpdateForm from "./Forms/UpdateForm";
import CreateRoomForm from "./Forms/CreateRoomForm";
import { Constants, LIST_JUDGE_PRORMISSION } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import IpMasker from "../../../common/IpMasker";
import { useSelector, useDispatch } from "react-redux";
import {
  useSocketEvent,
  emitSocketEvent,
} from "../../../config/hooks/useSocketEvents";
import { socketClient } from "../../../config/routes";
import {
  connectSocket,
  disconnectSocket,
  setupSocketListeners,
  setConnected,
} from "../../../config/redux/reducers/socket-reducer";
import { useStore } from "react-redux";
import useConfirmModal from "../../../hooks/useConfirmModal";
import ConfirmModal from "../../../components/ConfirmModal";

export default function ManagementConnectionSocket() {
  // @ts-ignore
  const socket = useSelector((state) => state.socket);
  const dispatch = useDispatch();
  const store = useStore();

  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openActions, setOpenActions] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  // Modal hook
  const { modalProps, showConfirm, showAlert, showError, showSuccess } =
    useConfirmModal();

  // Khởi tạo socket khi component mount
  useEffect(() => {
    const initSocket = async () => {
      try {
        // Kiểm tra xem socket đã connected chưa
        console.log(
          "🔍 Checking socket status:",
          socket.connected,
          socketClient.isConnected(),
        );
        // kiểm tra thêm connection socket hiện tại

        if (!socket.connected || !socketClient.isConnected()) {
          console.log("Khởi tạo socket connection...");
          await dispatch(connectSocket("admin"));

          // Setup socket event listeners để auto-update Redux state
          console.log("Setting up socket event listeners...");
          setupSocketListeners(store);
        } else {
          console.log("Socket already connected");
          // await dispatch(connectSocket('admin'));
        }

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
            setLoading(true);
            emitSocketEvent("REGISTER_ROOM_ADMIN", {
              room_id: roomData.room_id,
              uuid_desktop: roomData.uuid_desktop,
              permission: 9,
            });
          } catch (error) {
            console.error("Error loading saved room:", error);
            // Nếu có lỗi, hiển thị modal tạo room
            setShowCreateRoom(true);
          }
        } else {
          // Chưa có room, hiển thị modal tạo room
          console.log("No saved room found, showing create room modal");
          setShowCreateRoom(true);
        }
      } catch (error) {
        console.error("Error initializing socket:", error);
        setShowCreateRoom(true);
      }
    };

    initSocket();

    // Cleanup function
    return () => {
      // Không disconnect socket khi unmount vì có thể cần dùng ở component khác
    };
  }, [dispatch, store]); // Chỉ chạy 1 lần khi mount

  // Lắng nghe response từ server khi fetch danh sách thiết bị
  const serverIpHash = useRef();
  useSocketEvent("RES_ROOM_ADMIN", (response) => {
    // Kiểm tra nếu response từ ADMIN_FETCH_CONN
    if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
      // Chuyển đổi MapConn object thành array
      const deviceList = response.data.ls_conn || {};
      // Tìm admin_ip từ item có register_status_code === "ADMIN"
      const adminItem = Object.values(deviceList).find(
        (ele) => ele?.register_status_code === "ADMIN",
      );
      const serverIp = adminItem?.admin_ip || "N/A";
      serverIpHash.current = IpMasker.mask(serverIp, "hash", 999, "Server");

      const devices = Object.values(deviceList)
        ?.filter(
          (ele) =>
            ele?.register_status_code !== "ADMIN" || ele?.device_ip != "::1",
        )
        .map((conn, index) => ({
          order: index + 1,
          device_name: conn.device_name ?? "",
          judge_permission: conn.referrer
            ? LIST_JUDGE_PRORMISSION.find(
                (item) => item.key === Number(conn.referrer),
              ).label
            : "Chưa gán",
          device_code: conn.device_id || conn.socket_id,
          device_ip: conn.client_ip || "N/A",
          server_ip: serverIp, // Thêm server IP
          status:
            conn.connect_status_code === "CONNECTED" ? "active" : "inactive",
          accepted:
            conn.register_status_code === "CONNECTED"
              ? "approved"
              : conn.register_status_code === "PROCESSING"
                ? "pending"
                : conn.register_status_code === "ADMIN"
                  ? "admin"
                  : "rejected",
          // Lưu thêm thông tin gốc để sử dụng cho các action
          socket_id: conn.socket_id,
          room_id: conn.room_id,
          permission: conn.permission,
          token: conn.token,
          rawData: conn,
          referrer: conn.referrer,
        }));

      setData(devices);
      setLoading(false);
    }

    // Xử lý response từ các action khác (APPROVED, REJECTED, DISCONNECT_CLIENT, etc.)
    if (response.status === 200 && response.data?.ls_conn) {
      // Refresh lại danh sách sau khi thực hiện action
      const deviceList = response.data.ls_conn || {};
      const devices = Object.values(deviceList)
        ?.filter((ele) => ele?.register_status_code !== "ADMIN")
        .map((conn, index) => ({
          order: index + 1,
          device_name: conn.device_name ?? "",
          judge_permission: conn.referrer
            ? LIST_JUDGE_PRORMISSION.find(
                (item) => item.key === Number(conn.referrer),
              ).label
            : "Chưa gán",
          device_code: conn.device_id || conn.socket_id,
          device_ip: conn.client_ip || "N/A",
          status:
            conn.connect_status_code === "CONNECTED" ? "active" : "inactive",
          accepted:
            conn.register_status_code === "CONNECTED"
              ? "approved"
              : conn.register_status_code === "PROCESSING"
                ? "pending"
                : conn.register_status_code === "ADMIN"
                  ? "admin"
                  : "rejected",
          socket_id: conn.socket_id,
          room_id: conn.room_id,
          permission: conn.permission,
          token: conn.token,
          rawData: conn,
          referrer: conn.referrer,
        }));
      setData(devices);
      setLoading(false);
    }
  });

  // Lắng nghe response từ client khi fetch danh sách thiết bị
  useSocketEvent("RES_MSG", (response) => {
    console.log("Receive from client:", response);
  });

  // Action configurations với icons và colors - Redesigned
  const listActions = [
    {
      key: Constants.ACTION_CONNECT_KH,
      btnText: "Kích hoạt",
      titleModal: "Kích hoạt thiết bị",
      icon: (
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      color: "bg-gradient-to-r from-green-400 to-green-500",
      hoverColor: "hover:from-green-500 hover:to-green-600",
      textColor: "text-white",
      description: "Kích hoạt thiết bị mobile",
      callback: (row) => onApproveInfoClient(row),
    },
    {
      key: Constants.ACTION_CONNECT_GD,
      titleModal: "Đăng ký giám định",
      btnText: "Đăng ký GĐ",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: "bg-gradient-to-r from-blue-400 to-blue-500",
      hoverColor: "hover:from-blue-500 hover:to-blue-600",
      textColor: "text-white",
      description: "Đăng ký thiết bị với quyền giám định",
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_UPDATE,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_CONNECT_DIS,
      titleModal: "Ngắt kết nối",
      btnText: "Ngắt kết nối",
      icon: (
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      color: "bg-gradient-to-r from-red-400 to-red-500",
      hoverColor: "hover:from-red-500 hover:to-red-600",
      textColor: "text-white",
      description: "Ngắt kết nối thiết bị",
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_CONNECT_DIS,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_CONNECT_MSG,
      titleModal: "Gửi thông báo",
      btnText: "Gửi thông báo",
      icon: (
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
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
      ),
      color: "bg-gradient-to-r from-purple-400 to-purple-500",
      hoverColor: "hover:from-purple-500 hover:to-purple-600",
      textColor: "text-white",
      description: "Gửi thông báo đến Giám định",
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_CONNECT_MSG,
          row: row,
        });
      },
    },
  ];

  // Helper: Tìm action config theo key (tránh duplicate code)
  const getActionConfig = (key) => {
    return listActions.find((action) => action.key === key);
  };

  const columns = [
    { title: "STT", key: "order" },
    // { title: "Tên thiết bị", key: "device_name" },
    {
      title: "Giám định",
      key: "judge_permission",
      render: (row) => Utils.getJudgePermissionLabel(row.judge_permission),
    },
    // { title: "Mã thiết bị", key: "device_code" },
    { title: "Tên thiết bị", key: "device_name" },
    {
      title: "Mã thiết bị",
      key: "device_ip",
      render: (row, index) => {
        const maskedIp = IpMasker.mask(
          row.device_ip,
          "hash",
          index,
          row.device_name,
        );
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold font-mono"
            title={maskedIp.tooltip}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {maskedIp.display}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (row) => (
        <div className="text-nowrap">{Utils.getStatusLabel(row.status)}</div>
      ),
    },
    {
      title: "Chấp thuận",
      key: "accepted",
      render: (row) => Utils.getApprovalStatusLabel(row.accepted),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <span className="font-semibold">Actions</span>
          {/* <NotePopover listActions={listActions} /> */}
        </div>
      ),
      key: "action",
      render: (row) => {
        if (row?.accepted == "admin") return <div />;
        return (
          <div className="flex items-center justify-center gap-2">
            {listActions.map((action) => (
              <button
                key={action.key}
                onClick={() => {
                  console.log("🎯 Action clicked:", action.key, row);
                  action.callback(row);
                }}
                className={`
                  group relative
                  flex items-center gap-1.5
                  px-3 py-2
                  ${action.color} ${action.hoverColor}
                  ${action.textColor}
                  rounded
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  font-semibold text-xs
                  hover:scale-105
                  active:scale-95
                `}
                title={action.description}
              >
                {/* Icon */}
                <span className="flex-shrink-0">{action.icon}</span>

                {/* Text */}
                <span className="whitespace-nowrap">{action.btnText}</span>

                {/* Tooltip on hover */}
                <div
                  className="
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  px-3 py-1.5 bg-gray-900 text-white text-xs rounded
                  opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity duration-200
                  whitespace-nowrap z-50
                  shadow-xl
                  after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2
                  after:border-4 after:border-transparent after:border-t-gray-900
                "
                >
                  {action.description}
                </div>
              </button>
            ))}
          </div>
        );
      },
    },
  ];

  const renderContentModal = (openActions) => {
    // console.log("openActions", openActions);
    switch (openActions?.key) {
      case Constants.ACTION_CONNECT_KH:
        return (
          <div className="text-center">
            <div className="">Kích hoạt thiết bị mobile</div>
            <div className="flex items-center justify-center my-6">
              {/* fake QR code */}
              {false ? (
                <div className="bg-slate-400 min-h-24 min-w-24 rounded border-2 border-black flex items-center justify-center">
                  QR
                </div>
              ) : (
                <div className="bg-slate-400 min-h-24 min-w-24 rounded border-2 border-black flex items-center justify-center">
                  QR
                </div>
              )}
            </div>
            <Button
              className="min-w-32"
              variant="secondary"
              onClick={() => setOpenActions({ ...openActions, isOpen: false })}
            >
              Đóng
            </Button>
          </div>
        );
      case Constants.ACTION_CONNECT_GD:
        return (
          <div className="text-center">
            <div className="">Đăng ký giám định</div>
            <div className="flex items-center justify-center my-6">
              {/* fake QR code */}
              <div className="bg-slate-400 min-h-24 min-w-24 rounded border-2 border-black flex items-center justify-center">
                QR
              </div>
            </div>
            <Button
              className="min-w-32"
              variant="secondary"
              onClick={() => setOpenActions({ ...openActions, isOpen: false })}
            >
              Đóng
            </Button>
          </div>
        );
      case Constants.ACTION_CONNECT_DIS:
        return (
          <DisconnectForm
            data={openActions?.row}
            onAgree={(formData) => {
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_CONNECT_MSG:
        return (
          <NotificationForm
            data={openActions?.row}
            onAgree={(formData) => {
              console.log("NotificationForm", formData);
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_UPDATE:
        return (
          <UpdateForm
            data={openActions?.row}
            onAgree={(formData) => onUpdateInfoClient(formData, openActions)}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

  // 1. Kích hoạt client/mobile
  const onApproveInfoClient = (row) => {
    // Phê duyệt kết nối thiết bị
    if (row && row?.socket_id && row?.room_id) {
      emitSocketEvent("APPROVED", {
        socket_id: row.socket_id,
        room_id: row.room_id,
      });
    }
  };

  // 2. Cập nhật thông tin kết nối client/mobile
  const onUpdateInfoClient = (formData, openActions) => {
    setOpenActions({ ...openActions, isOpen: false });
    emitSocketEvent("REQ_MSG_ADMIN", {
      referrer: formData.judge_permission,
      socket_id: formData.socket_id,
      room_id: formData.room_id,
      device_name: formData.device_name,
      accepted: formData.accepted,
      status: formData.status,
    });
  };

  // Hàm refresh danh sách thiết bị
  const handleRefresh = () => {
    setLoading(true);
    emitSocketEvent("ADMIN_FETCH_CONN", {});
    setLoading(false);
  };

  // Hàm ngắt tất cả kết nối thiết bị
  const handleTurnOffAll = async () => {
    if (data.length === 0) {
      await showAlert("Không có thiết bị nào để ngắt kết nối");
      return;
    }

    const confirmDisconnect = await showConfirm(
      `Bạn có chắc chắn muốn ngắt kết nối tất cả ${data.length} thiết bị?`,
      {
        title: "Xác nhận ngắt kết nối",
        confirmText: "Ngắt kết nối",
        cancelText: "Hủy",
      },
    );

    if (confirmDisconnect) {
      setLoading(true);
      // Ngắt kết nối từng thiết bị
      data.forEach((device) => {
        if (device.socket_id && device.room_id) {
          emitSocketEvent("DISCONNECT_CLIENT", {
            socket_id: device.socket_id,
            room_id: device.room_id,
          });
        }
      });

      // Refresh lại danh sách sau 1 giây
      setTimeout(() => {
        setData([]);
      }, 1000);
      // khi socket mất kết nối thì cập nhật lại state
      dispatch(setConnected({ connected: false, socketId: null }));
      setLoading(false);
    }
  };

  // Hàm tạo lại kết nối socket
  const handleRecreateConnection = async () => {
    const confirmReconnect = await showConfirm(
      "Bạn có chắc chắn muốn tạo lại kết nối socket?\n\nSocket hiện tại sẽ bị ngắt và tạo lại kết nối mới.",
      {
        title: "Xác nhận tạo lại kết nối",
        confirmText: "Tạo lại",
        cancelText: "Hủy",
      },
    );

    if (confirmReconnect) {
      setIsReconnecting(true);
      setLoading(true);

      try {
        console.log("Bắt đầu tạo lại kết nối socket...");

        // Bước 1: Ngắt kết nối hiện tại
        console.log("1. Ngắt kết nối socket hiện tại...");
        await dispatch(disconnectSocket());

        // Đợi 500ms để đảm bảo socket đã ngắt hoàn toàn
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Bước 2: Tạo kết nối mới
        console.log("2. Tạo kết nối socket mới...");
        await dispatch(connectSocket("admin"));

        // Đợi 500ms để socket kết nối
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Bước 3: Đăng ký lại admin vào room
        console.log("3. Đăng ký admin vào room...");
        if (currentRoom) {
          emitSocketEvent("REGISTER_ROOM_ADMIN", {
            room_id: currentRoom.room_id,
            uuid_desktop: currentRoom.uuid_desktop,
            permission: 9,
          });
        }

        // Đợi 500ms rồi refresh
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Bước 4: Refresh danh sách
        console.log("4. Refresh danh sách thiết bị...");
        emitSocketEvent("ADMIN_FETCH_CONN", {});
      } catch (error) {
        console.error("Lỗi khi tạo lại kết nối:", error);
        await showError("Lỗi khi tạo lại kết nối socket. Vui lòng thử lại.");
      } finally {
        setIsReconnecting(false);
        setLoading(false);
      }
    }
  };

  // Hàm tạo/sử dụng room
  const handleCreateRoom = async (roomData) => {
    // Lưu vào localStorage
    localStorage.setItem("admin_room", JSON.stringify(roomData));
    setCurrentRoom(roomData);
    setShowCreateRoom(false);
    // Kết nối đến room
    setLoading(true);
    try {
      console.log("Bắt đầu tạo lại kết nối socket...");

      // Bước 1: Ngắt kết nối hiện tại
      console.log("1. Ngắt kết nối socket hiện tại...");
      await dispatch(disconnectSocket());

      // Đợi 500ms để đảm bảo socket đã ngắt hoàn toàn
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Bước 2: Tạo kết nối mới
      console.log("2. Tạo kết nối socket mới...");
      await dispatch(connectSocket("admin"));

      // Đợi 500ms để socket kết nối
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Bước 3: Đăng ký lại admin vào room
      console.log("3. Đăng ký admin vào room...");
      if (currentRoom) {
        emitSocketEvent("REGISTER_ROOM_ADMIN", {
          room_id: currentRoom.room_id,
          uuid_desktop: currentRoom.uuid_desktop,
          permission: 9,
        });
      }

      // Đợi 500ms rồi refresh
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Bước 4: Refresh danh sách
      console.log("4. Refresh danh sách thiết bị...");
      emitSocketEvent("ADMIN_FETCH_CONN", {});

      console.log("Tạo lại kết nối socket thành công!");
      await showSuccess("Tạo lại kết nối socket thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo lại kết nối:", error);
      await showError("Lỗi khi tạo lại kết nối socket. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm mở modal tạo room mới
  const handleOpenCreateRoom = () => {
    setShowCreateRoom(true);
  };

  // Hàm xóa room hiện tại
  const handleDeleteRoom = async () => {
    const confirmDelete = await showConfirm(
      "Bạn có chắc chắn muốn xóa room hiện tại?\n\nSocket sẽ bị ngắt kết nối.",
      {
        title: "Xác nhận xóa room",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    );
    if (confirmDelete) {
      localStorage.removeItem("admin_room");
      setCurrentRoom(null);
      setData([]);

      // Disconnect socket
      // dispatch(disconnectSocket());

      // Hiển thị modal tạo room mới
      setShowCreateRoom(true);
      console.log("Deleted room");
    }
  };

  return (
    <div className="w-full h-auto overflow-auto">
      {/* Room Info Bar - Redesigned */}
      {currentRoom && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-200 dark:border-blue-700 rounded p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              {/* Server Icon & Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Máy chủ
                  </div>
                  <div className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {serverIpHash.current?.display}
                  </div>
                </div>
              </div>

              {/* Device Icon & Info */}
              {/* <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Mã thiết bị
                  </div>
                  <div className="font-mono font-bold text-purple-700 dark:text-purple-300 text-sm">
                    {currentRoom.uuid_desktop}
                  </div>
                </div>
              </div> */}

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                {socket.connected ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">
                      Đang kết nối
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">
                      Không kết nối
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar - Redesigned */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center gap-3">
          {/* Left side - Stats & Danger Actions */}
          <div className="flex items-center gap-3">
            {/* Device Count Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded shadow-sm">
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
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Thiết bị:
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {data.length}
              </span>
            </div>
          </div>

          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
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
              <span>{loading ? "Đang tải..." : "Làm mới"}</span>
            </button>

            {/* Scan QR Button */}
            <button
              onClick={handleOpenCreateRoom}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <span>Scan QR</span>
            </button>

            {/* Reconnect Button */}
            <button
              onClick={handleRecreateConnection}
              disabled={isReconnecting || loading || !currentRoom}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-5 h-5 ${isReconnecting ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span>
                {isReconnecting ? "Đang tạo lại..." : "Tạo lại kết nối"}
              </span>
            </button>
          </div>
        </div>
      </div>
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        onPageChange={setPage}
        // onRowDoubleClick={(row) => {
        //   setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
        // }}
      />
      {/* Action Modals */}
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ ...openActions, isOpen: false })}
        title={
          getActionConfig(openActions?.key)?.titleModal ||
          "Cập nhật thông tin kết nối"
        }
        headerClass={getActionConfig(openActions?.key)?.color}
      >
        {renderContentModal(openActions)}
      </Modal>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateRoom}
        onClose={async () => {
          // Chỉ cho phép đóng nếu đã có room
          if (currentRoom) {
            setShowCreateRoom(false);
          } else {
            await showAlert("Vui lòng tạo room để tiếp tục!");
          }
        }}
        title="Quản lý máy chủ"
        headerClass="bg-blue-500"
        width="1200px"
      >
        <CreateRoomForm
          onSubmit={handleCreateRoom}
          onClose={async () => {
            if (currentRoom) {
              setShowCreateRoom(false);
            } else {
              await showAlert("Vui lòng tạo room để tiếp tục!");
            }
          }}
          existingRoom={currentRoom}
        />
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal {...modalProps} />
    </div>
  );
}
