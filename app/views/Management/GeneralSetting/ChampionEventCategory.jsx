import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import ChampionEventCategoryForm from "./Forms/ChampionEventCategoryForm";
import CustomCombobox from "../../../components/CustomCombobox";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import { fetchChampionCategories } from "../../../config/redux/controller/championCategorySlice";
import { deleteChampionEvent, fetchChampionEvents } from "../../../config/redux/controller/championEventSlice";

export default function ChampionEventCategory() {
  const dispatch = useAppDispatch();

  // @ts-ignore
  const { data: categories, loading: loadingCategories } = useAppSelector((state) => state.championCategories);
  // @ts-ignore
  const { data: events, loading: loadingEvents } = useAppSelector((state) => state.championEvents);
  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchChampionCategories());
  }, [dispatch]);

  useEffect(() => {
    selectedCategory && dispatch(fetchChampionEvents(selectedCategory.category_key));
  }, [dispatch, selectedCategory]);

  const listActions = [
    {
      key: Constants.ACTION_INSERT,
      btnText: "Thêm",
      color: "bg-[#CCE5FF]",
      description: "Thêm nội dung theo hình thức",
      callback: () => setOpenActions({ isOpen: true, key: Constants.ACTION_INSERT }),
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: "Sửa",
      color: "bg-[#FFFF88]",
      description: "Cập nhật nội dung theo hình thức",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row }),
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: "Xóa",
      color: "bg-[#FFCCCC]",
      description: "Xóa nội dung theo hình thức",
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_DELETE, row }),
    },
  ];

  const columns = [
    { title: "STT", key: "order", align: "center" },
    { title: "Nội dung thi", key: "event_name" },
    { title: "Số thành viên", key: "num_member" },
    { title: "Loại", key: "category_key" },
    { title: "Kiểu quyền", key: "qu_type" },
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
          <ChampionEventCategoryForm
            id={selectedCategory.category_key}
            type={Constants.ACTION_INSERT}
            onAgree={(formData) => {
              selectedCategory && dispatch(fetchChampionEvents(selectedCategory.category_key));
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACTION_UPDATE:
        return (
          <ChampionEventCategoryForm
            id={selectedCategory.category_key}
            type={Constants.ACTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              selectedCategory && dispatch(fetchChampionEvents(selectedCategory.category_key));
              setOpenActions({ isOpen: false });
            }}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      case Constants.ACTION_DELETE:
        return (
          <DeleteConfirmForm
            message={`Bạn có muốn xóa giải đấu "${openActions?.row?.event_name}" không?`}
            onAgree={() => {
              dispatch(deleteChampionEvent(openActions?.row?.id));
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
      <div className="">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Combobox Dropdown */}
          <div className="min-w-80">
            <CustomCombobox
              data={categories}
              selectedData={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Vui lòng chọn hình thức thi"
              keyShow={"category_name"}
            />
          </div>
          <Button disabled={!selectedCategory} variant="primary" className="min-w-28" onClick={listActions[0].callback}>
            Tạo mới
          </Button>
        </div>
        <CustomTable
          columns={columns}
          data={selectedCategory ? events : []}
          loading={loadingEvents}
          page={page}
          onPageChange={setPage}
          onRowDoubleClick={(row) => {
            setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row });
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
