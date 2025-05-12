import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import ChampionEventGroupForm from "./Forms/ChampionEventGroupForm";
import CustomCombobox from "../../../components/CustomCombobox";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { deleteChampionEvent } from "../../../config/redux/controller/championEventSlice";
import { fetchChampionGroups } from "../../../config/redux/controller/championGroupSlice";
import { deleteChampionEventGroup, fetchChampionEventGroups } from "../../../config/redux/controller/championEventGroupSlice";

export default function ChampionEventGroup() {
  const dispatch = useAppDispatch();

  // @ts-ignore
  const { groups, loading: loadingGroups } = useAppSelector((state) => state.championGroups);
  // @ts-ignore
  const { eventGroups, loading: loadingEventGroups } = useAppSelector((state) => state.championEventGroups);
  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    dispatch(fetchChampionGroups());
  }, [dispatch]);

  const listActions = [
    {
      key: Constants.ACCTION_INSERT,
      btnText: "Thêm",
      color: "bg-[#CCE5FF]",
      description: "Thêm nội dung theo nhóm thi",
      callback: () => setOpenActions({ isOpen: true, key: Constants.ACCTION_INSERT }),
    },
    {
      key: Constants.ACCTION_UPDATE,
      btnText: "Sửa",
      color: "bg-[#FFFF88]",
      description: "Cập nhật nội dung theo nhóm thi",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row }),
    },
    {
      key: Constants.ACCTION_DELETE,
      btnText: "Xóa",
      color: "bg-[#FFCCCC]",
      description: "Xóa nội dung theo nhóm thi",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACCTION_DELETE, row }),
    },
  ];
  console.log(openActions);

  const columns = [
    { title: "STT", key: "order", align: "center" },
    { title: "Tên giải", key: "ten_giai" },
    { title: "Nhóm thi", key: "nhom_thi" },
    { title: "Nội dung thi", key: "event_name" },
    { title: "Giới tính", key: "gender_commons_key", render: (row) => Utils.getGenderLabel(row.gender_commons_key) },
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

  const RenderContentModal = () => {
    switch (openActions?.key) {
      case Constants.ACCTION_INSERT:
        return (
          <ChampionEventGroupForm
            id={selectedGroup.id}
            type={Constants.ACCTION_INSERT}
            onAgree={(formData) => {
              // @ts-ignore
              selectedGroup && dispatch(fetchChampionEventGroups({ champ_grp_id: selectedGroup?.id }));
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACCTION_UPDATE:
        return (
          <ChampionEventGroupForm
            id={selectedGroup.id}
            type={Constants.ACCTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              console.log("Update Champion Group:", formData);
              // @ts-ignore
              selectedGroup && dispatch(fetchChampionEventGroups({ champ_grp_id: selectedGroup?.id }));
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACCTION_DELETE:
        return (
          <DeleteConfirmForm
            message={`Bạn có muốn xóa nội dung theo nhóm thi "${openActions?.row?.event_name}" không?`}
            onAgree={() => {
              setOpenActions({ ...openActions, isOpen: false });
              dispatch(deleteChampionEventGroup(openActions?.row?.champ_grp_event_id));
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
      <div className="">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Combobox Dropdown */}
          <div className="min-w-80">
            <CustomCombobox
              data={groups}
              selectedData={selectedGroup}
              onChange={(value) => {
                setSelectedGroup(value);
                // @ts-ignore
                dispatch(fetchChampionEventGroups({ champ_grp_id: value?.id }));
              }}
              placeholder="Vui lòng chọn nhóm thi"
              keyShow={"name"}
            />
          </div>
          <Button disabled={!selectedGroup} variant="primary" className="min-w-28" onClick={listActions[0].callback}>
            Tạo mới
          </Button>
        </div>
        <CustomTable
          columns={columns}
          data={selectedGroup ? eventGroups : []}
          loading={loadingEventGroups}
          page={page}
          onPageChange={setPage}
          onRowDoubleClick={(row) => {
            setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row });
          }}
        />
      </div>
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
