import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SearchInput from "../../../components/SearchInput";
import { Constants } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import { deleteChampion, fetchChampions } from "../../../config/redux/controller/championSlice";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import ActionForm from "./Forms/ActionForm";
import DataForm from "./Forms/DataForm";
import Input from "../../../components/Input";

export default function DataTotal() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [openActions, setOpenActions] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeMatches = Array.from({ length: 10 }, (_, i) => {
        const index = i + 1 + (page - 1) * 10;
        return {
          id: index,
          match_name: `Nội dung thi ${index}`,
          don_vi: `Đơn vị ${index}`,
          thu_tu: index,
          gd1: Math.floor(Math.random() * 10),
          gd2: Math.floor(Math.random() * 10),
          gd3: Math.floor(Math.random() * 10),
          gd4: Math.floor(Math.random() * 10),
          gd5: Math.floor(Math.random() * 10),
          xep_hang: Math.ceil(Math.random() * 100),
        };
      });
      setData(fakeMatches);
      setLoading(false);
    }, 500);
  }, [page]);

  const handleSearch = async (text) => {
    console.log("Tìm kiếm:", text);
    // @ts-ignore
    dispatch(fetchChampions({ search: text }));
  };

  const listActions = [
    {
      key: Constants.ACCTION_INSERT,
      btnText: "Thêm đơn vị",
      color: "bg-[#CCE5FF]",
      description: "Thêm đơn vị",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_INSERT, row: row });
      },
    },
    {
      key: Constants.ACCTION_UPDATE,
      btnText: "Cập nhật",
      color: "bg-[#FFFF88]",
      description: "Cập nhật",
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
    { title: "Nội dung thi", key: "match_name", className: "text-nowrap" },
    { title: "Đơn vị", key: "don_vi" },
    { title: "Thứ tự", key: "thu_tu" },
    { title: "GĐ1", key: "gd1" },
    { title: "GĐ2", key: "gd2" },
    { title: "GĐ3", key: "gd3" },
    { title: "GĐ4", key: "gd4" },
    { title: "GĐ5", key: "gd5" },
    { title: "XẾP HẠNG", key: "xep_hang" },
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
              action?.key !== Constants.ACCTION_INSERT && (
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
      case Constants.ACCTION_INSERT:
        return (
          <DataForm
            type={Constants.ACCTION_INSERT}
            onAgree={(formData) => {
              // @ts-ignore
              // dispatch(fetchChampions({ search: search }));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_UPDATE:
        return (
          <DataForm
            type={Constants.ACCTION_UPDATE}
            data={openActions?.row}
            onAgree={(formData) => {
              // @ts-ignore
              // dispatch(fetchChampions({ search: search }));
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_DELETE:
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 mb-1">
          {/* Chọn nhóm thi */}
          <select
            defaultValue={""}
            id="gender_commons_key"
            className="form-select col-span-2 min-w-24 px-3 py-2 border rounded-md text-sm"
            aria-placeholder="Vui lòng chọn loại"
          >
            <option value="">Nhóm thi</option>
            {[1, 2, 3].map((item, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          {/* Chọn Hình thức */}
          <select
            defaultValue={""}
            id="gender_commons_key"
            className="form-select col-span-2 min-w-24 px-3 py-2 border rounded-md text-sm"
            aria-placeholder="Vui lòng chọn loại"
          >
            <option value="">Hình thức</option>
            {[1, 2, 3].map((item, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          {/* Chọn giới tính */}
          <select
            defaultValue={""}
            id="gender_commons_key"
            className="form-select col-span-2 min-w-24 px-3 py-2 border rounded-md text-sm"
            aria-placeholder="Vui lòng chọn loại"
          >
            <option value="">Giới tính</option>
            {[1, 2, 3].map((item, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <Input className="!rounded-md !border-black !p-2 !py-1.5" placeholder="Tìm kiếm" />
          <Button
            onClick={() => {
              console.log("search:");
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => {
              console.log("Upload File:");
            }}
          >
            Upload File
          </Button>
        </div>
        <Button
          variant="primary"
          className="min-w-24"
          onClick={() => {
            setOpenActions({ isOpen: true, key: Constants.ACCTION_INSERT });
          }}
        >
          Thêm đơn vị
        </Button>
      </div>
      <CustomTable
        columns={columns}
        data={data}
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
