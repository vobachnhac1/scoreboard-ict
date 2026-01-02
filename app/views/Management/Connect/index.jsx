import React, { Fragment, useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import NotePopover from "./components/NotePopover";
import Modal from "../../../components/Modal";
import DisconnectForm from "./Forms/DisconnectForm";
import NotificationForm from "./Forms/NotificationForm";
import UpdateForm from "./Forms/UpdateForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import { useSelector } from "react-redux";
import { useSocketEvent, emitSocketEvent } from "../../../config/hooks/useSocketEvents";

export default function index() {
  // @ts-ignore
  const socket = useSelector((state) => state.socket);
  useEffect(() => {}, []);

  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openActions, setOpenActions] = useState(null);

  // Fetch danh sách thiết bị khi component mount hoặc page thay đổi
  useEffect(() => {
    setLoading(true);

    // emitSocketEvent("ADMIN_FETCH_CONN", {});
    // Khởi tạo REGISTER_ROOM_ADMIN
    // emitSocketEvent("REGISTER_ROOM_ADMIN", {
    //   room_id: "1AZJM9JL8D", // tự tạo 
    //   uuid_desktop: "CO2GJ74NMD6M", // lấy từ  thiết bị  
    //   permission: 9,
    // });

  }, [page]);

  // Button khởi tạo kết nối socket theo emit REGISTER_ROOM_ADMIN 
  const handleInitConnection = () => {
    emitSocketEvent("REGISTER_ROOM_ADMIN", {
      room_id: "1AZJM9JL8D", // tự tạo 
      uuid_desktop: "CO2GJ74NMD6M", // lấy từ  thiết bị  
      permission: 9,
    });
  };

  const listActions = [
    {
      key: Constants.ACTION_CONNECT_KH,
      titleModal: "Kích hoạt thiết bị",
      color: "bg-[#FAD7AC]",
      description: "Kích hoạt thiết bị mobile",
      callback: (row) => {
        // Phê duyệt kết nối thiết bị
        if (row.socket_id && row.room_id) {
          emitSocketEvent("APPROVED", {
            socket_id: row.socket_id,
            room_id: row.room_id
          });
        }
      },
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
            onAgree={(formData) => {
              console.log("UpdateForm", formData);
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

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
        judge_permission: conn.referrer ? `GD${conn.referrer}` : "Chưa gán",
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
        judge_permission: conn.referrer ? `GD${conn.referrer}` : "Chưa gán",
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
    }
  });

  useSocketEvent("RES_MSG", (data) => {
    console.log("Receive from client:", data);
  });

  // Hàm refresh danh sách thiết bị
  const handleRefresh = () => {
    setLoading(true);
    emitSocketEvent("ADMIN_FETCH_CONN", {});
  };

  return (
    <div className="w-full h-autooverflow-auto">
      <div className="flex justify-end items-center gap-2 mb-1">
        <Button variant="primary" className="min-w-28">
          Cập nhật license
        </Button>
        <Button variant="primary" className="min-w-28">
          Mã kích hoạt điện thoại
        </Button>
        <Button variant="primary" className="min-w-28" onClick={handleRefresh} disabled={loading}>
          {loading ? "Đang tải..." : "Tải lại"}
        </Button>
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
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ ...openActions, isOpen: false })}
        title={listActions.find((e) => e.key === openActions?.key)?.titleModal || "Cập nhật thông tin kết nối"}
        headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        {renderContentModal(openActions)}
      </Modal>
    </div>
  );
}
