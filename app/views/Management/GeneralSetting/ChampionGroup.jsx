import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import ChampionGroupForm from "./Forms/ChampionGroupForm";
import { fetchChampions } from "../../../config/reducers/championSlice";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { deleteChampionGroup, fetchChampionGroups, fetchChampionGroupsByChampion } from "../../../config/reducers/championGroupSlice";
import CustomCombobox from "../../../components/CustomCombobox";

// @ts-ignore
export default function ChampionGroup({ ...props }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  // @ts-ignore
  const { championGroups, loading } = useSelector((state) => state.championGroups);
  // @ts-ignore
  const { champions, loadingCombobox } = useSelector((state) => state.champions);
  const [openActions, setOpenActions] = useState(null);
  const [champion, setChampion] = useState(null);

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchChampions());
  }, [dispatch]);

  const listActions = [
    {
      key: Constants.ACCTION_INSERT,
      btnText: "Thêm",
      color: "bg-[#CCE5FF]",
      description: "Thêm nhóm",
      callback: () => setOpenActions({ isOpen: true, key: Constants.ACCTION_INSERT }),
    },
    {
      key: Constants.ACCTION_UPDATE,
      btnText: "Sửa",
      color: "bg-[#FFFF88]",
      description: "Cập nhật nhóm",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row }),
    },
    {
      key: Constants.ACCTION_DELETE,
      btnText: "Xóa",
      color: "bg-[#FFCCCC]",
      description: "Xóa nhóm",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACCTION_DELETE, row }),
    },
  ];

  const columns = [
    { title: "STT", key: "oder", align: "center" },
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
            .filter((action) => action.key !== Constants.ACCTION_INSERT)
            .map((action) => (
              <Button key={action.key} variant="none" className={`!rounded-md !p-1 w-16 ${action.color} hover:opacity-75`} onClick={() => action.callback(row)}>
                {action.btnText}
              </Button>
            ))}
        </div>
      ),
    },
  ];

  const renderContentModal = () => {
    switch (openActions?.key) {
      case Constants.ACCTION_INSERT:
        return (
          <ChampionGroupForm
            id={champion?.id}
            type={Constants.ACCTION_INSERT}
            onAgree={(formData) => {
              console.log("Insert Champion Group:", formData);
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACCTION_UPDATE:
        return (
          <ChampionGroupForm
            id={champion?.id}
            type={Constants.ACCTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              console.log("Update Champion Group:", formData);
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACCTION_DELETE:
        return (
          <DeleteConfirmForm
            message={`Bạn có muốn xóa nhóm "${openActions?.row?.name}" không?`}
            onAgree={() => {
              // @ts-ignore
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
            selectedData={champion}
            onChange={(value) => {
              console.log(value);

              setChampion(value);
              // @ts-ignore
              dispatch(fetchChampionGroupsByChampion(value.id));
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
        data={championGroups}
        loading={loading}
        page={page}
        onPageChange={setPage}
        onRowDoubleClick={(row) => {
          setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row });
        }}
      />
      <Modal
        isOpen={openActions?.isOpen || false}
        onClose={() => setOpenActions({ isOpen: false })}
        title={listActions.find((e) => e.key === openActions?.key)?.description}
        headerClass={listActions.find((e) => e.key === openActions?.key)?.color}
      >
        {champion && renderContentModal()}
      </Modal>
    </div>
  );
}
