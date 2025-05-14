import React, { useEffect, useState } from "react";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SearchInput from "../../../components/SearchInput";
import { Constants, LIST_STATUS_ATHLETE } from "../../../common/Constants";
import Utils from "../../../common/Utils";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import MatchForm from "./Forms/MatchForm";
import ActionForm from "./Forms/ActionForm";

export default function index() {
  const dispatch = useAppDispatch();
  // @ts-ignore
  // const { data: champions, loading } = useAppSelector((state) => state.champions);

  //fake data
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
          champ_grp_event_id: 40 + (index % 5),
          round: (index % 3) + 1,
          match_id: `MX${1000 + index}`,
          match_no: index,
          ath_red_id: `${400 + index * 2}`,
          ath_blue_id: `${401 + index * 2}`,
          ath_win_id: index % 3 === 0 ? `${400 + index * 2}` : null,
          created_at: "2025-05-03 17:32:00",
          updated_at: "2025-05-03 17:32:00",
          match_status: LIST_STATUS_ATHLETE[i % LIST_STATUS_ATHLETE.length].key,
        };
      });
      setData(fakeMatches);
      setLoading(false);
    }, 500);
  }, [page]);

  const handleSearch = async (text) => {
    console.log("Tìm kiếm:", text);
    // @ts-ignore
    // dispatch(fetchChampions({ search: text }));
  };

  const listActions = [
    {
      key: Constants.ACCTION_ATHLETE_RESULT,
      btnText: "Kết quả",
      color: "bg-[#FAD7AC]",
      description: "Kết quả",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_RESULT, row: row });
      },
    },
    {
      key: Constants.ACCTION_ATHLETE_ADJUST,
      btnText: "Điều chỉnh",
      color: "bg-[#FFFF88]",
      description: "Cập nhật thông tin",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_ADJUST, row: row });
      },
    },
    {
      key: Constants.ACCTION_ATHLETE_CONTINUE,
      btnText: "Tiếp tục",
      color: "bg-[#CDEB8B]",
      description: "Tiếp tục",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_CONTINUE, row: row });
      },
    },
    {
      key: Constants.ACCTION_ATHLETE_IN,
      btnText: "Vào trận",
      color: "bg-[#CCE5FF]",
      description: "Vào trận",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_IN, row: row });
      },
    },
    {
      key: Constants.ACCTION_ATHLETE_RE,
      btnText: "Thi lại",
      color: "bg-[#FAD9D5]",
      description: "Thi lại",
      callback: (row) => {
        setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_RE, row: row });
      },
    },
  ];

  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [Constants.ACCTION_ATHLETE_RESULT, Constants.ACCTION_ATHLETE_RE];
      case "IN": // Đang diễn ra
        return [Constants.ACCTION_ATHLETE_CONTINUE, Constants.ACCTION_ATHLETE_RE];
      case "WAI": // Chờ
        return [Constants.ACCTION_ATHLETE_IN, Constants.ACCTION_ATHLETE_ADJUST];
      default: // Các trạng thái khác: HUỶ, KHÁC...
        return [];
    }
  };

  const columns = [
    {
      title: "STT",
      key: "order",
      align: "center",
    },
    { title: "Trận", key: "match_no" },
    { title: "Hình thức", key: "" },
    { title: "Tên giáp đỏ", key: "ath_red_id" },
    { title: "Tên giáp xanh", key: "ath_blue_id" },
    { title: "Kết quả", key: "ath_win_id" },
    { title: "Trạng thái", key: "match_status", render: (row) => <div className="text-nowrap">{Utils.getAthleteStatusLabel(row.match_status)}</div> },
    { title: "Ngày sửa", key: "updated_at", render: (row) => Utils.formatDate(row.updated_at) },
    { title: "Ngày tạo", key: "created_at", render: (row) => Utils.formatDate(row.created_at) },
    {
      title: "Hành động",
      align: "center",
      key: "action",
      render: (row) => {
        const availableActions = getActionsByStatus(row.match_status);
        return (
          <div className="flex items-center justify-center gap-2">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <Button
                  variant="none"
                  className={`!rounded-md !p-1 w-20 ${action.color} hover:opacity-75`}
                  onClick={() => action.callback(row)}
                  key={action.key}
                >
                  {action.btnText}
                </Button>
              ))}
          </div>
        );
      },
    },
  ];

  const renderContentModal = (openActions) => {
    switch (openActions?.key) {
      case Constants.ACCTION_ATHLETE_RESULT:
        return (
          <ActionForm
            message={`Mã trận đấu "${openActions?.row?.match_id}"`}
            onAgree={() => {
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_ATHLETE_CONTINUE:
        return (
          <ActionForm
            message={`Mã trận đấu "${openActions?.row?.match_id}"`}
            onAgree={() => {
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_ATHLETE_IN:
        return (
          <ActionForm
            message={`Mã trận đấu "${openActions?.row?.match_id}"`}
            onAgree={() => {
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_ATHLETE_RE:
        return (
          <ActionForm
            message={`Mã trận đấu "${openActions?.row?.match_id}"`}
            onAgree={() => {
              setOpenActions({ ...openActions, isOpen: false });
            }}
            onGoBack={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACCTION_ATHLETE_ADJUST:
        return (
          <MatchForm
            type={Constants.ACCTION_ATHLETE_ADJUST}
            data={openActions?.row}
            onAgree={(formData) => {
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
        <SearchInput value={search} onChange={setSearch} onSearch={handleSearch} placeholder="Tìm kiếm..." />
      </div>
      <CustomTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        onPageChange={setPage}
        // onRowDoubleClick={(row) => {
        //   console.log("Double clicked row:", row);
        //   setOpenActions({ isOpen: true, key: Constants.ACCTION_ATHLETE_ADJUST, row: row });
        // }}
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
