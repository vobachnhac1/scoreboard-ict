import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import SearchInput from "../../../components/SearchInput";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import ChampionCategoryForm from "./Forms/ChampionCategoryForm";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { deleteChampionCategory, fetchChampionCategories } from "../../../config/redux/controller/championCategorySlice";

export default function ChampionCategory() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  const { categories, loading } = useAppSelector((state) => state.championCategories);
  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    dispatch(fetchChampionCategories());
  }, [dispatch]);

  const columns = [
    { title: "STT", key: "order", align: "center" },
    { title: "Tên nhóm", key: "category_name" },
    { title: "Mô tả", key: "description" },
    { title: "Mã nhóm", key: "category_key" },
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
          <ChampionCategoryForm
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
          <ChampionCategoryForm
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
            message={`Bạn có muốn xóa nhóm "${openActions?.row?.category_name}" không?`}
            onAgree={() => {
              dispatch(deleteChampionCategory(openActions?.row?.id));
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
      <div className="flex items-center justify-between mb-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          onSearch={(text) => {
            console.log("Tìm kiếm:", text);
          }}
          placeholder="Tìm kiếm nhóm..."
        />
        <Button variant="primary" className="min-w-28" onClick={listActions[0].callback}>
          Tạo mới
        </Button>
      </div>
      <CustomTable
        columns={columns}
        data={categories}
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
        {renderContentModal()}
      </Modal>
    </div>
  );
}
