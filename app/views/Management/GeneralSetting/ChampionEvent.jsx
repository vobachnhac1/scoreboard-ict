import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import DeleteConfirmForm from "./Forms/DeleteConfirmForm";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import ChampionEventForm from "./Forms/ChampionEventForm";
import ChampionGroupEvent from "./ChampionGroupEvent";
import CustomCombobox from "../../../components/CustomCombobox";

const listCategory = [
  {
    id: 2,
    category_key: "QU",
    category_name: "Quyền",
    description: "Thi quyền",
    created_at: "2025-04-29 17:53:37",
    updated_at: "2025-04-29 17:53:37",
  },
  {
    id: 1,
    category_key: "DK",
    category_name: "Đối kháng",
    description: "Thi đối kháng",
    created_at: "2025-04-29 17:53:37",
    updated_at: "2025-04-29 17:53:37",
  },
];

export default function ChampionEvent() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openActions, setOpenActions] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const totalPages = 3;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeData = Array.from({ length: 10 }, (_, i) => {
        const order = i + 1 + (page - 1) * 10;
        return {
          order: order,
          id: order,
          event_name: `${60 + i}KG`,
          num_member: Math.floor(Math.random() * 10) + 1,
          category_key: i % 2 === 0 ? "DK" : "QUN",
          qu_type: "OTH",
          description: "Hạng cân",
          created_at: `2025-04-${(i + 1).toString().padStart(2, "0")} 08:00:00`,
          updated_at: `2025-04-${(i + 2).toString().padStart(2, "0")} 12:00:00`,
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
    { title: "STT", key: "order", align: "center" },
    { title: "Tên hạng cân", key: "event_name" },
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
          <ChampionEventForm
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
          <ChampionEventForm
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
            message={`Bạn có muốn xóa giải đấu ${openActions?.row?.event_name} không?`}
            onAgree={() => setOpenActions({ isOpen: false })}
            onGoBack={() => setOpenActions({ isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

  const RenderTabEvent = () => {
    return (
      <div className="bg-white rounded-lg p-3 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Combobox Dropdown */}
          <div className="w-full">
            <CustomCombobox
              data={listCategory}
              selectedData={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Vui lòng chọn hình thức thi"
              keyShow={"category_name"}
            />
          </div>
          <Button variant="primary" className="min-w-28" onClick={listActions[0].callback}>
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
            setOpenActions({ isOpen: true, key: Constants.ACCTION_UPDATE, row });
          }}
        />
      </div>
    );
  };

  return (
    <div className="w-full h-auto overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        <RenderTabEvent />
        <ChampionGroupEvent />
      </div>
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
