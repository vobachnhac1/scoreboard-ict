import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import { Constants } from "../../../common/Constants";
import { deleteChampion, fetchChampions } from "../../../config/redux/controller/championSlice";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import ActionForm from "./Forms/ActionForm";
import DataTotalAthleteListForm from "./Forms/DataTotalAthleteListForm";

export default function DataTotalAthleteList() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeMatches = Array.from({ length: 10 }, (_, i) => {
        const index = i + 1 + (page - 1) * 10;
        return {
          id: index,
          fullName: `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
          year: 1990 + (i % 10),
        };
      });
      setData(fakeMatches);
      setLoading(false);
    }, 500);
  }, [page]);

  const listActions = [
    {
      key: Constants.ACTION_INSERT,
      btnText: "Thêm đơn vị",
      color: "bg-[#CCE5FF]",
      description: "Thêm đơn vị",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_INSERT, row: row });
      },
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: "Cập nhật",
      color: "bg-[#FFFF88]",
      description: "Cập nhật",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
      },
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: "Xóa",
      color: "bg-[#FFCCCC]",
      description: "Thông báo",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACTION_DELETE, row: row });
      },
    },
  ];

  const columns = [
    {
      title: "STT",
      key: "order",
      align: "center",
    },
    { title: "Họ tên", key: "fullName", className: "text-nowrap" },
    { title: "Năm sinh", key: "year" },
    // { title: "Ngày tạo", key: "created_at", render: (row) => Utils.formatDate(row.created_at) },
    // { title: "Ngày sửa", key: "updated_at", render: (row) => Utils.formatDate(row.updated_at) },
    {
      title: "Hành động",
      align: "center",
      key: "action",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {listActions.map(
            (action) =>
              action?.key !== Constants.ACTION_INSERT && (
                <Button
                  variant="none"
                  className={`!rounded-md !p-1 w-20 ${action.color} hover:opacity-75`}
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
      case Constants.ACTION_INSERT:
        return (
          <DataTotalAthleteListForm
            type={Constants.ACTION_INSERT}
            onAgree={(formData) => {
              // @ts-ignore
              // dispatch(fetchChampions({ search: search }));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_UPDATE:
        return (
          <DataTotalAthleteListForm
            type={Constants.ACTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              // @ts-ignore
              // dispatch(fetchChampions({ search: search }));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_DELETE:
        return (
          <ActionForm
            message={`Bạn có muốn xóa đơn vị này không?`}
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
      <div style={{ marginTop: 42 }} />
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        contentHeader={
          <div className="relative">
            <div className="">Danh sách VĐV tham dự</div>
            <Button
              className="absolute right-0 -top-[6px]"
              variant="warning"
              onClick={() => {
                setOpenActions({ isOpen: true, key: Constants.ACTION_INSERT, row: null });
              }}
            >
              Thêm
            </Button>
          </div>
        }
        onPageChange={setPage}
        onRowDoubleClick={(row) => {
          console.log("Double clicked row:", row);
          setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: row });
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
