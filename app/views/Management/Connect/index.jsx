import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
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
  const { t } = useTranslation();
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
            : t("connection.not_assigned"),
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
            : t("connection.not_assigned"),
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
      btnText: t("connection.activate"),
      titleModal: t("connection.activate_device"),
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
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      color: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
      textColor: "text-white",
      description: t("connection.activate_mobile"),
      callback: (row) => onApproveInfoClient(row),
    },
    {
      key: Constants.ACTION_CONNECT_GD,
      titleModal: t("connection.register_referee"),
      btnText: t("connection.register_referee_short"),
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
            strokeWidth={2.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      color: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
      textColor: "text-white",
      description: t("connection.register_referee_desc"),
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
      titleModal: t("connection.disconnect_device"),
      btnText: t("connection.disconnect"),
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
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      color: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
      textColor: "text-white",
      description: t("connection.disconnect_device"),
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
      titleModal: t("connection.send_notification"),
      btnText: t("connection.notification"),
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
            strokeWidth={2.5}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
      ),
      color: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20",
      textColor: "text-white",
      description: t("connection.send_notification_to_referee"),
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
    {
      title: "STT",
      key: "order",
      render: (row) => (
        <span className="font-bold text-blue-900 dark:text-blue-100 opacity-60">
          {row.order}
        </span>
      ),
    },
    {
      title: t("connection.referee"),
      key: "judge_permission",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.referrer ? (
            <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-sm">
              {t("connection.referee")} {row.referrer}
            </div>
          ) : (
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-black uppercase rounded border border-gray-200 dark:border-gray-700">
              {t("connection.not_assigned")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t("connection.device_name"),
      key: "device_name",
      render: (row) => (
        <span className="font-black text-blue-900 dark:text-blue-100 tracking-tight">
          {row.device_name || t("connection.device_unnamed")}
        </span>
      ),
    },
    {
      title: "Mã định danh",
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
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 shadow-inner"
            title={maskedIp.tooltip}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {maskedIp.display}
          </span>
        );
      },
    },
    {
      title: t("connection.connection_status"),
      key: "status",
      render: (row) => {
        const isActive = row.status === "active";
        return (
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2`}>
              {isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? "bg-emerald-500" : "bg-gray-400"
                  }`}
              ></span>
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-400"
                }`}
            >
              {isActive ? t("connection.online") : t("connection.offline")}
            </span>
          </div>
        );
      },
    },
    {
      title: t("connection.approval_status"),
      key: "accepted",
      render: (row) => {
        const statusConfig = {
          approved: {
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-900/50",
            label: t("connection.approved"),
          },
          pending: {
            bg: "bg-amber-50 dark:bg-amber-950/20",
            text: "text-amber-600 dark:text-amber-400",
            border: "border-amber-100 dark:border-amber-900/50",
            label: t("connection.pending"),
          },
          rejected: {
            bg: "bg-rose-50 dark:bg-rose-950/20",
            text: "text-rose-600 dark:text-rose-400",
            border: "border-rose-100 dark:border-rose-900/50",
            label: t("connection.rejected"),
          },
        };
        const st = statusConfig[row.accepted] || statusConfig.rejected;
        return (
          <span
            className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${st.bg} ${st.text} ${st.border}`}
          >
            {st.label}
          </span>
        );
      },
    },
    {
      title: t("connection.actions"),
      key: "action",
      align: "center",
      render: (row) => {
        if (row?.accepted == "admin") return null;
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
                  relative
                  flex items-center justify-center
                  h-9 w-9
                  ${action.color}
                  text-white
                  rounded shadow-sm
                  transition-all duration-300
                  hover:scale-110 active:scale-90
                  group
                `}
                title={action.description}
              >
                {/* Icon */}
                <span className="flex-shrink-0">{action.icon}</span>

                {/* Tooltip on hover */}
                <div
                  className="
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded
                    opacity-0 group-hover:opacity-100
                    pointer-events-none transition-all duration-300
                    whitespace-nowrap z-50
                    shadow-xl scale-90 group-hover:scale-100
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
            <div className="">{t("connection.activate_mobile")}</div>
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
              {t("common.close")}
            </Button>
          </div>
        );
      case Constants.ACTION_CONNECT_GD:
        return (
          <div className="text-center">
            <div className="">{t("connection.register_referee")}</div>
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
              {t("common.close")}
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
      await showAlert(t("connection.no_devices_to_disconnect"));
      return;
    }

    const confirmDisconnect = await showConfirm(
      t("connection.confirm_disconnect_all", { count: data.length }),
      {
        title: t("connection.confirm_disconnect"),
        confirmText: t("connection.disconnect"),
        cancelText: t("common.cancel"),
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
      t("connection.confirm_reconnect_message"),
      {
        title: t("connection.confirm_reconnect"),
        confirmText: t("connection.recreate"),
        cancelText: t("common.cancel"),
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
        await showError(t("connection.reconnect_error"));
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
      await showSuccess(t("connection.reconnect_success"));
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
      t("connection.confirm_delete_room_message"),
      {
        title: t("connection.confirm_delete_room"),
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
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
    <div className="w-full h-auto overflow-auto p-1 py-1">
      {/* Room Info Bar - Premium Design */}
      {currentRoom && (
        <div className="bg-white dark:bg-gray-800 border-2 border-blue-50 dark:border-blue-900/30 rounded-3xl p-6 mb-6 shadow-xl shadow-blue-500/10 overflow-hidden relative group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Server Details */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/10 rotate-3 group-hover:rotate-0 transition-all duration-500">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 opacity-60">
                    {t("connection.server_address")}
                  </div>
                  <div className="font-mono font-black text-blue-900 dark:text-blue-100 text-xl tracking-tight leading-none">
                    {serverIpHash.current?.display}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 opacity-60">
                  {t("connection.system_status")}
                </div>
                {socket.connected ? (
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl shadow-inner shadow-emerald-500/5">
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                      {t("connection.online_connected")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-lg shadow-rose-500/10"></div>
                    <span className="text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">
                      {t("connection.server_disconnected")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Room ID Badge */}
            <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-3xl flex flex-col items-center md:items-end justify-center min-w-[200px]">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 opacity-60">
                Mã định danh Room
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-[0.2em] leading-none">
                {currentRoom.room_id || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Toolbar - Premium Design */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-8 shadow-xl shadow-blue-500/10 border border-blue-50 dark:border-blue-900/30">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Left: Device Statistic */}
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">
                {t("connection.connected_devices")}
              </p>
              <p className="text-2xl font-black text-blue-900 dark:text-blue-100 leading-none">
                {data.length} <span className="text-xs font-bold text-blue-400">client</span>
              </p>
            </div>
          </div>

          {/* Right: Action Buttons Group */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-50 hover:bg-white dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{loading ? t("connection.scanning") : t("connection.refresh_list")}</span>
            </button>

            {/* Scan QR Button */}
            <button
              onClick={handleOpenCreateRoom}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-50 hover:bg-white dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-xl transition-all duration-300 active:scale-95"
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
                  strokeWidth={3}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <span>{t("connection.create_room")}</span>
            </button>

            <div className="w-px h-10 bg-blue-50 dark:bg-blue-900 mx-2"></div>

            {/* Reconnect Button */}
            <button
              onClick={handleRecreateConnection}
              disabled={isReconnecting || loading || !currentRoom}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 transition-all duration-300 active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
            >
              <svg
                className={`w-4 h-4 ${isReconnecting ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span>
                {isReconnecting ? t("connection.processing") : t("connection.restart_connection")}
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{getActionConfig(openActions?.key)?.titleModal || t("connection.update_data")}</span>
          </div>
        }
        headerClass="bg-gradient-to-r from-blue-600 to-indigo-600 text-white !py-6 border-b-0"
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
            await showAlert(t("connection.setup_room_required"));
          }
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Cấu hình & Thiết lập máy chủ</span>
          </div>
        }
        headerClass="bg-gradient-to-r from-blue-700 to-indigo-700 text-white !py-8 border-b-0"
        width="1200px"
      >
        <CreateRoomForm
          onSubmit={handleCreateRoom}
          onClose={async () => {
            if (currentRoom) {
              setShowCreateRoom(false);
            } else {
              await showAlert("Hệ thống yêu cầu Room ID để khởi chạy dịch vụ!");
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
