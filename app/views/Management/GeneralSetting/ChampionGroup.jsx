import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import ChampionGroupForm from "./Forms/ChampionGroupForm";
import CustomCombobox from "../../../components/CustomCombobox";
import { deleteChampionGroup, fetchChampionGroups } from "../../../config/redux/controller/championGroupSlice";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchChampions } from "../../../config/redux/controller/championSlice";

export default function ChampionGroup({ ...props }) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  // @ts-ignore
  const { data: groups, loading } = useAppSelector((state) => state.championGroups);
  // @ts-ignore
  const { data: champions, loadingCombobox } = useAppSelector((state) => state.champions);
  const [openActions, setOpenActions] = useState(null);
  const [selectedChampion, setSelectedChampion] = useState(null);

  useEffect(() => {
    dispatch(fetchChampions());
    dispatch(fetchChampionGroups());
  }, [dispatch]);

  const listActions = [
    {
      key: Constants.ACTION_INSERT,
      btnText: "Thêm",
      color: "bg-[#CCE5FF]",
      description: "Thêm nhóm",
      callback: () => setOpenActions({ isOpen: true, key: Constants.ACTION_INSERT }),
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: "Sửa",
      color: "bg-[#FFFF88]",
      description: "Cập nhật nhóm",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row }),
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: "Xóa",
      color: "bg-[#FFCCCC]",
      description: "Xóa nhóm",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_DELETE, row }),
    },
  ];

  const columns = [
    { title: "STT", key: "order", align: "center" },
    { title: "Tên nhóm", key: "name" },
    { title: "Mô tả", key: "description" },
    { title: "Ngày tạo", key: "created_at", render: (row) => Utils.formatDate(row.created_at) },
    { title: "Ngày sửa", key: "updated_at", render: (row) => Utils.formatDate(row.updated_at) },
    {
      title: "Hành động",
      align: "center",
      key: "action",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {listActions
            .filter((action) => action.key !== Constants.ACTION_INSERT)
            .map((action) => (
              <Button key={action.key} variant="none" className={`!rounded-md !p-1 w-16 ${action.color} hover:opacity-75`} onClick={() => action.callback(row)}>
                {action.btnText}
              </Button>
            ))}
        </div>
      ),
    },
  ];

  const RenderContentModal = () => {
    switch (openActions?.key) {
      case Constants.ACTION_INSERT:
        return (
          <ChampionGroupForm
            type={Constants.ACTION_INSERT}
            onAgree={(formData) => {
              dispatch(fetchChampionGroups(selectedChampion?.id));
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACTION_UPDATE:
        return (
          <ChampionGroupForm
            type={Constants.ACTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              dispatch(fetchChampionGroups(selectedChampion?.id));
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACTION_DELETE:
        return (
          <DeleteConfirmForm
            message={`Bạn có muốn xóa nhóm "${openActions?.row?.name}" không?`}
            onAgree={() => {
              dispatch(deleteChampionGroup(openActions?.row?.id));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-auto overflow-auto">
      <div className="flex items-center justify-between gap-2 mb-1">
        {/* Combobox Dropdown */}
        <div className="min-w-80">
          <CustomCombobox
            data={champions || []}
            selectedData={selectedChampion}
            onChange={(value) => {
              setSelectedChampion(value);
              dispatch(fetchChampionGroups(value?.id));
            }}
            placeholder="Vui lòng chọn nhóm dự thi"
            keyShow={"tournament_name"}
          />
        </div>
        <Button variant="primary" className="min-w-28" onClick={listActions[0].callback}>
          Tạo mới
        </Button>
      </div>
      <CustomTable
        columns={columns}
        data={groups}
        loading={loading}
        page={page}
        onPageChange={setPage}
        onRowDoubleClick={(row) => {
          setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row });
        }}
      />
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ isOpen: false })}
        title={listActions.find((e) => e.key === openActions?.key)?.description}
        headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        <RenderContentModal />
      </Modal>
    </div>
  );
}
