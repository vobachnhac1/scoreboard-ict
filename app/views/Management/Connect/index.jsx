import React, { Fragment, useEffect, useState } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { useSocketEvent, emitSocketEvent } from "../../../config/hooks/useSocketEvents";
import { socketClient } from "../../../config/routes";
import { connectSocket, disconnectSocket, setupSocketListeners, setConnected } from "../../../config/redux/reducers/socket-reducer";
import { useStore } from "react-redux";

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

  // Khởi tạo socket khi component mount
  useEffect(() => {
    const initSocket = async () => {
      try {
        // Kiểm tra xem socket đã connected chưa
        console.log("🔍 Checking socket status:", socket.connected);

        if (!socket.connected) {
          console.log("Khởi tạo socket connection...");
          await dispatch(connectSocket('admin'));

          // Setup socket event listeners để auto-update Redux state
          console.log("Setting up socket event listeners...");
          setupSocketListeners(store);
        } else {
          console.log("Socket already connected");
          await dispatch(connectSocket('admin'));
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
            console.log("Registering admin to room...");
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

  // Hàm tạo/sử dụng room
  const handleCreateRoom = async(roomData) => {
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
        await dispatch(connectSocket('admin'));

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
        alert("Tạo lại kết nối socket thành công!");

    } catch (error) {
      console.error("Lỗi khi tạo lại kết nối:", error);
      alert("Lỗi khi tạo lại kết nối socket. Vui lòng thử lại.");
    } finally {
      setIsReconnecting(false);
      setLoading(false);
    }
  };

  // Hàm mở modal tạo room mới
  const handleOpenCreateRoom = () => {
    setShowCreateRoom(true);
  };

  // Hàm xóa room hiện tại
  const handleDeleteRoom = () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa room hiện tại?\n\nSocket sẽ bị ngắt kết nối."
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

  const listActions = [
    {
      key: Constants.ACTION_CONNECT_KH,
      titleModal: "Kích hoạt thiết bị",
      color: "bg-[#FAD7AC]",
      description: "Kích hoạt thiết bị mobile",
      callback: (row) => onApproveInfoClient(row),
    },
    {
      key: Constants.ACTION_CONNECT_GD,
      titleModal: "Đăng ký giám định",
      color: "bg-[#FAD9D5]",
      description: "Đăng ký thiết bị với quyền giám định",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_CONNECT_GD, row: row });
      },
    },
    {
      key: Constants.ACTION_CONNECT_DIS,
      titleModal: "Ngắt kết nối",
      color: "bg-[#B0E3E6]",
      description: "Ngắt kết nối",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_CONNECT_DIS, row: row });
      },
    },
    {
      key: Constants.ACTION_CONNECT_MSG,
      titleModal: "Gửi thông báo",
      color: "bg-[#50d71e]",
      description: "Gửi thông báo đến Giám định",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_CONNECT_MSG, row: row });
      },
    },
  ];

  const columns = [
    { title: "STT", key: "order" },
    { title: "Tên thiết bị", key: "device_name" },
    { title: "Quyền giám định", key: "judge_permission", render: (row) => Utils.getJudgePermissionLabel(row.judge_permission) },
    { title: "Mã thiết bị", key: "device_code" },
    { title: "IP thiết bị", key: "device_ip" },
    { title: "Trạng thái", key: "status", render: (row) => <div className="text-nowrap">{Utils.getStatusLabel(row.status)}</div> },
    { title: "Chấp thuận", key: "accepted", render: (row) => Utils.getApprovalStatusLabel(row.accepted) },
    {
      title: (
        <div className="flex items-center justify-center">
          <span>Khác</span> <NotePopover listActions={listActions} />
        </div>
      ),
      key: "action",
      render: (row) => (
        <div className="flex items-center justify-center">
          {listActions.map((action) => (
            <Button
              variant="none"
              className={`!rounded-none !p-2 w-16 ${action.color} mr-1 hover:opacity-75`}
              onClick={() => {
                console.log("action.key: ", action.key);
                action.callback(row);
              }}
              key={action.key}
            >
              {action.key}
            </Button>
          ))}
        </div>
      ),
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
                <div className="bg-slate-400 min-h-24 min-w-24 rounded-lg border-2 border-black flex items-center justify-center">QR</div>
              ) : (
                <div className="bg-slate-400 min-h-24 min-w-24 rounded-lg border-2 border-black flex items-center justify-center">QR</div>
              )}
            </div>
            <Button className="min-w-32" variant="secondary" onClick={() => setOpenActions({ ...openActions, isOpen: false })}>
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
              <div className="bg-slate-400 min-h-24 min-w-24 rounded-lg border-2 border-black flex items-center justify-center">QR</div>
            </div>
            <Button className="min-w-32" variant="secondary" onClick={() => setOpenActions({ ...openActions, isOpen: false })}>
              Đóng
            </Button>
          </div>
        );
      case Constants.ACTION_CONNECT_DIS:
        return (
          <DisconnectForm
            data={openActions?.row}
            onAgree={(formData) => {
              console.log("DisconnectForm", formData);
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
    if ( row && row?.socket_id && row?.room_id) {
      emitSocketEvent("APPROVED", {
        socket_id: row.socket_id,
        room_id: row.room_id
      });
    }
  };

  // 2. Cập nhật thông tin kết nối client/mobile
  const onUpdateInfoClient = (formData , openActions)=>{
    setOpenActions({ ...openActions, isOpen: false });
    emitSocketEvent("REQ_MSG_ADMIN", {
      referrer: formData.judge_permission,
      socket_id : formData.socket_id, 
      room_id: formData.room_id
    });
  }

  // Lắng nghe response từ server khi fetch danh sách thiết bị
  useSocketEvent("RES_ROOM_ADMIN", (response) => {
    console.log("Receive from server:", response);

    // Kiểm tra nếu response từ ADMIN_FETCH_CONN
    if (response.path === "ADMIN_FETCH_CONN" && response.status === 200) {
      // Chuyển đổi MapConn object thành array
      const deviceList = response.data.ls_conn || {};
      const devices = Object.values(deviceList).map((conn, index) => ({
        order: index + 1,
        device_name: conn.device_name || `Thiết bị ${conn.socket_id?.substring(0, 8)}`,
        judge_permission: conn.referrer ? LIST_JUDGE_PRORMISSION.find((item) => item.key === Number(conn.referrer)).label : "Chưa gán",
        device_code: conn.device_id || conn.socket_id,
        device_ip: conn.client_ip || "N/A",
        status: conn.connect_status_code === "CONNECTED" ? "active" : "inactive",
        accepted: conn.register_status_code === "CONNECTED" ? "approved"
                : conn.register_status_code === "PROCESSING" ? "pending"
                : conn.register_status_code === "ADMIN" ? "admin"
                : "rejected",
        // Lưu thêm thông tin gốc để sử dụng cho các action
        socket_id: conn.socket_id,
        room_id: conn.room_id,
        permission: conn.permission,
        token: conn.token,
        rawData: conn
      }));

      setData(devices);
      setLoading(false);
    }

    // Xử lý response từ các action khác (APPROVED, REJECTED, DISCONNECT_CLIENT, etc.)
    if (response.status === 200 && response.data?.ls_conn) {
      // Refresh lại danh sách sau khi thực hiện action
      const deviceList = response.data.ls_conn || {};
      const devices = Object.values(deviceList).map((conn, index) => ({
        order: index + 1,
        device_name: conn.device_name || `Thiết bị ${conn.socket_id?.substring(0, 8)}`,
        judge_permission: conn.referrer ? LIST_JUDGE_PRORMISSION.find((item) => item.key === Number(conn.referrer)).label : "Chưa gán",
        device_code: conn.device_id || conn.socket_id,
        device_ip: conn.client_ip || "N/A",
        status: conn.connect_status_code === "CONNECTED" ? "active" : "inactive",
        accepted: conn.register_status_code === "CONNECTED" ? "approved"
                : conn.register_status_code === "PROCESSING" ? "pending"
                : conn.register_status_code === "ADMIN" ? "admin"
                : "rejected",
        socket_id: conn.socket_id,
        room_id: conn.room_id,
        permission: conn.permission,
        token: conn.token,
        rawData: conn
      }));
      setData(devices);
      setLoading(false);
    }
  });

  // Lắng nghe response từ client khi fetch danh sách thiết bị
  useSocketEvent("RES_MSG", (response) => {
    console.log("Receive from client:", response);
  });

  // Hàm refresh danh sách thiết bị
  const handleRefresh = () => {
    setLoading(true);
    emitSocketEvent("ADMIN_FETCH_CONN", {});
    setLoading(false);
  };

  // Hàm ngắt tất cả kết nối thiết bị
  const handleTurnOffAll = () => {
    if (data.length === 0) {
      alert("Không có thiết bị nào để ngắt kết nối");
      return;
    }

    const confirmDisconnect = window.confirm(
      `Bạn có chắc chắn muốn ngắt kết nối tất cả ${data.length} thiết bị?`
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
      setTimeout(() => { setData([]) }, 1000);
      // khi socket mất kết nối thì cập nhật lại state 
      dispatch(setConnected({ connected: false, socketId: null }));
      setLoading(false);
    }
  };

  // Hàm tạo lại kết nối socket
  const handleRecreateConnection = async () => {
    const confirmReconnect = window.confirm(
      "Bạn có chắc chắn muốn tạo lại kết nối socket?\n\nSocket hiện tại sẽ bị ngắt và tạo lại kết nối mới."
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
        await dispatch(connectSocket('admin'));

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
        alert("Tạo lại kết nối socket thành công!");

      } catch (error) {
        console.error("Lỗi khi tạo lại kết nối:", error);
        alert("Lỗi khi tạo lại kết nối socket. Vui lòng thử lại.");
      } finally {
        setIsReconnecting(false);
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full h-autooverflow-auto">
      {/* Room Info Bar */}
      {currentRoom && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-gray-500">Máy chủ:</span>
                <span className="ml-2 font-mono font-bold text-blue-700">{currentRoom.room_id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Mã thiết bị:</span>
                <span className="ml-2 font-mono font-bold text-blue-700">{currentRoom.uuid_desktop}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-xs text-gray-500"> Trạng thái:</span>

                {socket.connected ? (
                  <span className="ml-2 font-mono font-bold text-green-600">Đang kết nối</span>
                ) : (
                  <span className="ml-2 font-mono font-bold text-red-600">Không kết nối</span>
                )}
              </div>
              {/* <div>
                <span className="text-xs text-gray-500">Server:</span>
                <span className="ml-2 font-mono text-sm text-gray-700">{currentRoom.server_url}</span>
              </div> */}
            </div>
            {/* <div className="flex gap-2">
              
              <Button
                variant="danger"
                className="min-w-24"
                onClick={handleDeleteRoom}
              >
                Xoá kết nối hiện tại
              </Button>
            </div> */}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center gap-2 mb-1">
        {/* Left side buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            className="min-w-32"
            onClick={handleTurnOffAll}
            disabled={loading || data.length === 0}
          >
            Tắt tất cả kết nối ({data.length})
          </Button>
         
          
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Button variant={socket.connected ? "primary" : "secondary" } className="min-w-28">
            Cập nhật license
          </Button>
          <Button
            variant={socket.connected ? "warning" : "success" }
            className="min-w-32"
            onClick={handleRecreateConnection}
            disabled={isReconnecting || loading || !currentRoom}
          >
            {isReconnecting ? "Đang tạo lại..." : "Tạo lại kết nối"}
          </Button>
          <Button 
            variant={socket.connected ? "primary" : "secondary" }
            className="min-w-28" onClick={handleOpenCreateRoom}>
            Scan QR
          </Button>
          <Button variant={socket.connected ? "primary" : "secondary" } className="min-w-28" onClick={handleRefresh} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>
        </div>
      </div>
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        onPageChange={setPage}
        onRowDoubleClick={(row) => {
          console.log("Double clicked row:", row);
          setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
        }}
      />
      {/* Action Modals */}
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ ...openActions, isOpen: false })}
        title={listActions.find((e) => e.key === openActions?.key)?.titleModal || "Cập nhật thông tin kết nối"}
        headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        {renderContentModal(openActions)}
      </Modal>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateRoom}
        onClose={() => {
          // Chỉ cho phép đóng nếu đã có room
          if (currentRoom) {
            setShowCreateRoom(false);
          } else {
            alert("Vui lòng tạo room để tiếp tục!");
          }
        }}
        title="Quản lý máy chủ"
        headerClass="bg-blue-500"
        width="1200px"
      >
        <CreateRoomForm
          onSubmit={handleCreateRoom}
          onClose={() => {
            if (currentRoom) {
              setShowCreateRoom(false);
            } else {
              alert("Vui lòng tạo room để tiếp tục!");
            }
          }}
          existingRoom={currentRoom}
        />
      </Modal>
    </div>
  );
}
