import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import ChampionForm from "./Forms/ChampionForm";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import SearchInput from "../../../components/SearchInput";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import { deleteChampion, fetchChampions } from "../../../config/redux/controller/championSlice";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";

export default function Champion() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  const { data: champions, loading } = useAppSelector((state) => state.champions);
  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // gọi API
    dispatch(fetchChampions());
  }, []);

  const handleSearch = async (text) => {
    console.log("Tìm kiếm:", text);
    // @ts-ignore
    dispatch(fetchChampions({ search: text }));
  };

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
    {
      title: "STT",
      key: "order",
      align: "center",
    },
    { title: "Tên giải đấu", key: "tournament_name" },
    { title: "Bắt đầu", key: "start_date", render: (row) => Utils.formatDate(row.start_date) },
    { title: "Kết thúc", key: "end_date", render: (row) => Utils.formatDate(row.end_date) },
    { title: "Nơi tổ chức", key: "location" },
    { title: "Số VĐV", key: "num_judges" },
    { title: "Số giám định", key: "num_athletes" },
    { title: "Trạng thái", key: "status", render: (row) => <div className="text-nowrap">{Utils.getChampionStatusLabel(row.status)}</div> },
    { title: "Ngày tạo", key: "created_at", render: (row) => Utils.formatDate(row.created_at) },
    { title: "Ngày sửa", key: "updated_at", render: (row) => Utils.formatDate(row.updated_at) },
    {
      title: "Hành động",
      align: "center",
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
          <ChampionForm
            type={Constants.ACCTION_INSERT}
            onAgree={(formData) => {
              // @ts-ignore
              dispatch(fetchChampions({ search: search }));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_UPDATE:
        return (
          <ChampionForm
            type={Constants.ACCTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              // @ts-ignore
              dispatch(fetchChampions({ search: search }));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_DELETE:
        return (
          <DeleteConfirmForm
            message={`Bạn có muốn xóa giải đấu "${openActions?.row?.tournament_name}" không?`}
            onAgree={() => {
              dispatch(deleteChampion(openActions?.row?.id));
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
    <div className="w-full h-auto overflow-auto">
      <div className="flex items-center justify-between mb-1">
        <SearchInput value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Tìm kiếm giải đấu..." />
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
        data={champions}
        loading={loading}
        page={page}
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
