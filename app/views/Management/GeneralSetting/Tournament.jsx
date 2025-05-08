import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import TournamentForm from "./Forms/TournamentForm";
import TournamentDeleteForm from "./Forms/TournamentDeleteForm";
import SearchInput from "../../../components/SearchInput";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/utils";

export default function Tournament() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openActions, setOpenActions] = useState(null);
  const [search, setSearch] = useState("");
  const totalPages = 5;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeData = Array.from({ length: 10 }, (_, i) => {
        const order = i + 1 + (page - 1) * 10;
        return {
          order,
          tournament_name: `Giải đấu ${order}`,
          start_date: `2025-06-${(i + 1).toString().padStart(2, "0")}`,
          end_date: `2025-06-${(i + 3).toString().padStart(2, "0")}`,
          location: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ"][i % 4],
          num_judges: 3 + (i % 5),
          num_athletes: 30 + i * 2,
          status: ["NEW", "PRO", "COM", "RAN", "IN", "FIN", "CAN", "PEN"][i % 8],
          created_at: "2025-05-01 10:00:00",
          updated_at: "2025-05-08 10:00:00",
        };
      });

      setData(fakeData);
      setLoading(false);
    }, 500);
  }, [page]);

  const listActions = [
    {
      key: Constants.ACCTION_INSERT,
      btnText: "Thêm",
      color: "bg-[#CCE5FF]",
      description: "Tạo thông tin giải đấu",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_INSERT, row: row });
      },
    },
    {
      key: Constants.ACCTION_UPDATE,
      btnText: "Sửa",
      color: "bg-[#FFFF88]",
      description: "Cập nhật thông tin giải đấu",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row: row });
      },
    },
    {
      key: Constants.ACCTION_DELETE,
      btnText: "Xóa",
      color: "bg-[#FFCCCC]",
      description: "Thông báo",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_DELETE, row: row });
      },
    },
  ];

  const columns = [
    { title: "STT", key: "order" },
    { title: "Tên giải đấu", key: "tournament_name" },
    { title: "Bắt đầu", key: "start_date", render: (row) => Utils.formatDate(row.start_date) },
    { title: "Kết thúc", key: "end_date", render: (row) => Utils.formatDate(row.end_date) },
    { title: "Nơi tổ chức", key: "location" },
    { title: "Số VĐV", key: "num_judges" },
    { title: "Số giám định", key: "num_athletes" },
    { title: "Trạng thái", key: "status", render: (row) => <div className="text-nowrap">{Utils.getTournamentStatusLabel(row.status)}</div> },
    { title: "Ngày tạo", key: "created_at", render: (row) => Utils.formatDate(row.created_at) },
    { title: "Ngày sửa", key: "updated_at", render: (row) => Utils.formatDate(row.updated_at) },
    {
      title: (
        <div className="flex items-center justify-center">
          <span>Khác</span>
        </div>
      ),
      key: "action",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {listActions.map(
            (action) =>
              action?.key !== Constants.ACCTION_INSERT && (
                <Button
                  variant="none"
                  className={`!rounded-md !p-1 w-16 ${action.color} hover:opacity-75`}
                  onClick={() => action.callback(row)}
                  key={action.key}
                >
                  {action.btnText}
                </Button>
              )
          )}
        </div>
      ),
    },
  ];

  const renderContentModal = (openActions) => {
    // console.log("openActions", openActions);
    switch (openActions?.key) {
      case Constants.ACCTION_INSERT:
        return (
          <TournamentForm
            type={Constants.ACCTION_INSERT}
            onAgree={(formData) => {
              console.log("TournamentForm", formData);
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_UPDATE:
        return (
          <TournamentForm
            type={Constants.ACCTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              console.log("TournamentForm", formData);
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_DELETE:
        return (
          <TournamentDeleteForm
            onAgree={() => setOpenActions({ ...openActions, isOpen: false })}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-auto bg-gray-100 overflow-auto">
      <div className="flex items-center justify-between mb-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          onSearch={(text) => {
            console.log("Tìm kiếm:", text);
          }}
          placeholder="Tìm kiếm giải đấu..."
        />
        <Button
          variant="primary"
          className="min-w-28"
          onClick={() => {
            setOpenActions({ isOpen: true, key: Constants.ACCTION_INSERT });
          }}
        >
          Tạo mới
        </Button>
      </div>
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
        title={listActions.find((e) => e.key === openActions?.key)?.description}
        headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        {renderContentModal(openActions)}
      </Modal>
    </div>
  );
}
