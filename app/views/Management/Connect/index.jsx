import React, { Fragment, useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import NotePopover from "./components/NotePopover";
import Modal from "../../../components/Modal";
import DisconnectForm from "./Forms/DisconnectForm";
import NotificationForm from "./Forms/NotificationForm";
import UpdateForm from "./Forms/UpdateForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/utils";

export default function index() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openActions, setOpenActions] = useState(null);
  const totalPages = 5;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeDevices = Array.from({ length: 10 }, (_, i) => {
        const index = i + 1 + (page - 1) * 10;
        return {
          order: index,
          device_name: `Thiết bị ${index}`,
          judge_permission: ["GD1", "GD2", "GD3", "GD4", "GD5", "GD6", "GD7"][i % 7],
          device_code: `DEV-${1000 + index}`,
          device_ip: `192.168.1.${i + 10}`,
          status: i % 2 === 0 ? "active" : "inactive",
          accepted: i % 3 === 0 ? "approved" : i % 3 === 1 ? "rejected" : "pending",
        };
      });
      setData(fakeDevices);
      setLoading(false);
    }, 500);
  }, [page]);

  const listActions = [
    {
      key: Constants.ACCTION_CONNECT_KH,
      titleModal: "Thông báo",
      color: "bg-[#FAD7AC]",
      description: "Kích hoạt thiết bị mobile",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_CONNECT_KH, row: row });
      },
    },
    {
      key: Constants.ACCTION_CONNECT_GD,
      titleModal: "Thông báo",
      color: "bg-[#FAD9D5]",
      description: "Đăng ký thiết bị với quyền giám định",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_CONNECT_GD, row: row });
      },
    },
    {
      key: Constants.ACCTION_CONNECT_DIS,
      titleModal: "Thông báo",
      color: "bg-[#B0E3E6]",
      description: "Ngắt kết nối",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_CONNECT_DIS, row: row });
      },
    },
    {
      key: Constants.ACCTION_CONNECT_MSG,
      titleModal: "Thông báo",
      color: "bg-[#50d71e]",
      description: "Gửi thông báo đến Giám định",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_CONNECT_MSG, row: row });
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
              onClick={() => action.callback(row)}
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
      case Constants.ACCTION_CONNECT_KH:
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
      case Constants.ACCTION_CONNECT_GD:
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
      case Constants.ACCTION_CONNECT_DIS:
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
      case Constants.ACCTION_CONNECT_MSG:
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
      case Constants.ACCTION_UPDATE:
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

  return (
    <div className="w-full h-auto bg-gray-100 overflow-auto  text-">
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowDoubleClick={(row) => {
          console.log("Double clicked row:", row);
          setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row: row });
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
