import React, { Fragment, useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import NotePopover from "./components/NotePopover";
import Modal from "../../../components/Modal";
import DisconnectForm from "./Forms/DisconnectForm";
import NotificationForm from "./Forms/NotificationForm";
import UpdateForm from "./Forms/UpdateForm";

export default function index() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openActions, setOpenActions] = useState(null);
  const totalPages = 5;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // fake data
      setData(
        Array.from({ length: 10 }, (_, i) => ({
          id: i + 1 + (page - 1) * 10,
          name: `Người dùng ${i + 1 + (page - 1) * 10}`,
        }))
      );
      setLoading(false);
    }, 500);
  }, [page]);

  const KEY_ACTIONS = {
    KH: "KH",
    GD: "GĐ",
    DIS: "DIS",
    MSG: "MSG",
    UPDATE: "UPDATE",
  };

  const listActions = [
    {
      key: KEY_ACTIONS.KH,
      color: "bg-[#FAD7AC]",
      description: "Kích hoạt thiết bị mobile",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: KEY_ACTIONS.KH, row: row });
      },
    },
    {
      key: KEY_ACTIONS.GD,
      color: "bg-[#FAD9D5]",
      description: "Đăng ký thiết bị với quyền giám định",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: KEY_ACTIONS.GD, row: row });
      },
    },
    {
      key: KEY_ACTIONS.DIS,
      color: "bg-[#B0E3E6]",
      description: "Ngắt kết nối",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: KEY_ACTIONS.DIS, row: row });
      },
    },
    {
      key: KEY_ACTIONS.MSG,
      color: "bg-[#50d71e]",
      description: "Gửi thông báo đến Giám định",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: KEY_ACTIONS.MSG, row: row });
      },
    },
  ];

  const columns = [
    // { title: "ID", key: "id" },
    { title: "STT", key: "id" },
    { title: "Tên thiết bị", key: "name" },
    { title: "Quyền giám định", key: "name2" },
    { title: "Mã thiết bị", key: "name3" },
    { title: "IP thiết bị", key: "name4" },
    { title: "Trạng thái", key: "name5" },
    { title: "Chấp thuận", key: "name6" },
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
    console.log("openActions", openActions);
    switch (openActions?.key) {
      case KEY_ACTIONS.KH:
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
      case KEY_ACTIONS.GD:
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
      case KEY_ACTIONS.DIS:
        return (
          <DisconnectForm
            data={openActions?.raw}
            onSuccess={(formData) => {
              console.log("DisconnectForm", formData);
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case KEY_ACTIONS.MSG:
        return (
          <NotificationForm
            data={openActions?.raw}
            onSuccess={(formData) => {
              console.log("NotificationForm", formData);
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case KEY_ACTIONS.UPDATE:
        return (
          <UpdateForm
            data={openActions?.raw}
            onSuccess={(formData) => {
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

  const statusColorHeader = (key) => {
    console.log("key", key);
    switch (key) {
      case KEY_ACTIONS.KH:
        return "!bg-[#FAD7AC] text-black font-bold text-lg";
      case KEY_ACTIONS.GD:
        return "!bg-[#FAD9D5] text-black font-bold text-lg";
      case KEY_ACTIONS.DIS:
        return "!bg-[#B0E3E6] text-black font-bold text-lg";
      case KEY_ACTIONS.MSG:
        return "!bg-[#50d71e] text-black font-bold text-lg";
      case KEY_ACTIONS.MSG:
        return "!bg-[#50d71e] text-black font-bold text-lg";
      case KEY_ACTIONS.UPDATE:
        return "!bg-[#F9F7ED] text-black font-bold text-lg";
      default:
        return "";
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
          setOpenActions({ isOpen: true, key: KEY_ACTIONS.UPDATE, row: row });
        }}
      />
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ ...openActions, isOpen: false })}
        title={openActions?.key === KEY_ACTIONS.UPDATE ? "Cập nhật thông tin kết nối" : "Thông báo"}
        headerClass={statusColorHeader(openActions?.key)}
      >
        {renderContentModal(openActions)}
      </Modal>
    </div>
  );
}
