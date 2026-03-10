import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/Button";
import SearchInput from "../../../../components/SearchInput";
import { Constants } from "../../../../common/Constants";
import { useAppDispatch, useAppSelector } from "../../../../config/redux/store";
import { fetchConfigSystem } from "../../../../config/redux/controller/configSystemSlice";
import useConfirmModal from "../../../../hooks/useConfirmModal";
import ConfirmModal from "../../../../components/ConfirmModal";
import ConfigSystem from "../ConfigSystem";
import { useTranslation } from "react-i18next";

// Import extracted components
import TeamCard from "./components/TeamCard";
import DeleteConfirm from "./components/DeleteConfirm";
import DataFormOther from "./components/DataFormOther";
import ActionConfirm from "./components/ActionConfirm";
import VonResultForm from "./components/VonResultForm";
import ResultForm from "./components/ResultForm";
import RefereeAllocationSection from "./components/RefereeAllocationSection";
import QuyenReportForm from "./components/QuyenReportForm";
import VonReportForm from "./components/VonReportForm";

export default function CompetitionDataOther() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // State cho modal actions
  const [openActions, setOpenActions] = useState(null);

  // Ref để lưu hàm exportToExcel từ HistoryView
  const exportToExcelRef = React.useRef(null);

  // State cho filter và view
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, WAI, IN, FIN, CAN
  const [filterType, setFilterType] = useState("ALL"); // ALL, DOL, SOL, TUV, DAL
  const [sortBy, setSortBy] = useState("match_no"); // match_no, status, type

  // Hook cho modal thông báo
  const { modalProps, showAlert, showError, showSuccess } = useConfirmModal();
  const [viewMode, setViewMode] = useState("list"); // grid, list
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("matches"); // matches, referrers
  const [availableReferees, setAvailableReferees] = useState([]);

  // Scroll to top handler
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load dữ liệu khi component mount
  const configSystem = useAppSelector((state) => state.configSystem);

  useEffect(() => {
    dispatch(fetchConfigSystem());
    fetchData();
    fetchAvailableReferees();
  }, [id]);

  const fetchAvailableReferees = async () => {
    try {
      const response = await axios.get("http://localhost:6789/api/referees");
      if (response.data.success) {
        setAvailableReferees(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching referees:", error);
    }
  };

  const handleSaveReferrers = async (newReferrers) => {
    try {
      await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
        ...sheetData,
        referrers: newReferrers,
      });
      setSheetData({ ...sheetData, referrers: newReferrers });
      showSuccess(t("competition_data_other.save_referees_success"));
    } catch (error) {
      console.error("Error saving referrers:", error);
      showError(t("competition_data_other.save_referees_error") + ": " + error.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:6789/api/competition-dk/${id}`,
      );
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSheetData(data);
        if (data.data && data.data.length > 0) {
          // Phát hiện format từ cell đầu tiên
          const formatType = data.data[0][0]; // 'DK', 'DOL', 'SOL', 'TUV', 'DAL'
          // Lấy danh sách matches/teams từ database
          let matchesResponse = await axios.get(
            `http://localhost:6789/api/competition-match-team/by-dk/${id}`,
          );
          let matches = matchesResponse.data.success
            ? matchesResponse.data.data
            : [];
          // Xử lý theo format
          setHeaders(data.data[0]);
          setRows(matches?.map((m) => ({
            ...m,
            match_id: m.id,
            referrers: m.referrers || []
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(
        t("competition_data_other.load_data_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm
  const handleSearch = (text) => {
    fetchData();
    // TODO: Implement search logic
  };

  // File này chỉ xử lý format DOL/SOL/TUV/DAL
  // Phát hiện format từ sheetData
  const formatType = sheetData?.data?.[0]?.[0] || "DOL";

  // List actions cho format DOL/SOL/TUV/DAL
  const listActions = [
    {
      key: Constants.ACTION_MATCH_START,
      btnText: t("competition_data_other.action_compete"),
      color:
        "bg-blue-600 text-white hover:bg-blue-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      description: t("competition_data_other.action_start_match"),
      callback: (row) => {
        handleMatchStart(row);
      },
    },
    {
      key: Constants.ACTION_MATCH_RESULT,
      btnText: t("competition_data_other.action_result"),
      color:
        "bg-yellow-500 text-white hover:bg-yellow-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      description: t("competition_data_other.action_result"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_RESULT,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_MATCH_REPORT,
      btnText: t("competition_data_other.action_report"),
      color:
        "bg-purple-600 text-white hover:bg-purple-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      description: t("competition_data_other.action_match_report"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_REPORT,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: t("competition_data_other.action_update"),
      color:
        "bg-gray-600 text-white hover:bg-gray-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      description: t("competition_data_other.action_update_data"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_UPDATE,
          row: row,
        });
      },
    },
    // {
    //   key: Constants.ACTION_MATCH_CONFIG,
    //   btnText: "Cấu hình",
    //   color:
    //     "bg-purple-600 text-white hover:bg-purple-700",
    //   icon: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="h-4 w-4"
    //       viewBox="0 0 20 20"
    //       fill="currentColor"
    //     >
    //       <path
    //         fillRule="evenodd"
    //         d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
    //         clipRule="evenodd"
    //       />
    //     </svg>
    //   ),
    //   description: "Cấu hình hệ thống",
    //   callback: (row) => {
    //     setOpenActions({
    //       isOpen: true,
    //       key: Constants.ACTION_MATCH_CONFIG,
    //       row: row,
    //     });
    //   },
    // },
    {
      key: Constants.ACTION_DELETE,
      btnText: t("competition_data_other.action_delete"),
      color:
        "bg-red-600 text-white hover:bg-red-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      description: t("competition_data_other.action_confirm_delete"),
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_DELETE,
          row: row,
        });
      },
    },
  ];

  // Lấy actions theo status cho format DOL/SOL/TUV/DAL
  const getActionsByStatus = (status, matchType) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [Constants.ACTION_MATCH_RESULT, Constants.ACTION_MATCH_REPORT];
      case "IN": // Đang diễn ra
        return [Constants.ACTION_MATCH_START];
      case "WAI": // Chờ
        return [
          Constants.ACTION_MATCH_START,
          // Constants.ACTION_MATCH_CONFIG,
          Constants.ACTION_UPDATE,
          Constants.ACTION_DELETE,
        ];
      default:
        return [Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
    }
  };
  // Tạo columns cho format DOL/SOL/TUV/DAL
  const columns = [
    {
      title: t("competition_data_other.column_stt"),
      key: "match_no",
      align: "center",
      width: "80px",
      render: (row) => (
        <span className="font-semibold text-lg">{row.match_no || "-"}</span>
      ),
    },
    {
      title: t("competition_data_other.column_athletes"),
      key: "athletes",
      render: (row) => {
        if (!row.athletes || row.athletes.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        return (
          <div className="space-y-1">
            {row.athletes.map((athlete, idx) => (
              <div
                key={`${row.match_id || row.id}-athlete-table-${idx}`}
                className="flex items-center gap-2"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-blue-600">
                  {athlete.athlete_name || "-"}
                </span>
                {/* {athlete.athlete_unit && (
                  <span className="text-gray-500 text-sm">({athlete.athlete_unit})</span>
                )} */}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: t("competition_data_other.column_unit"),
      key: "team_name",
      align: "center",
      width: "150px",
      render: (row) => {
        const typeColors = {
          DOL: "bg-purple-100 text-purple-700",
          SOL: "bg-green-100 text-green-700",
          TUV: "bg-orange-100 text-orange-700",
          DAL: "bg-pink-100 text-pink-700",
          VON: "bg-yellow-100 text-yellow-700",
        };
        const color = typeColors[row.match_type] || "bg-gray-100 text-gray-700";

        return (
          <span className={`px-3 py-1 !rounded text-sm font-bold ${color}`}>
            {row.team_name || "-"}
          </span>
        );
      },
    },
    {
      title: t("competition_data_other.column_content"),
      key: "match_type",
      align: "center",
      width: "150px",
      render: (row) => {
        const typeColors = {
          DOL: "bg-purple-100 text-purple-700",
          SOL: "bg-green-100 text-green-700",
          TUV: "bg-orange-100 text-orange-700",
          DAL: "bg-pink-100 text-pink-700",
          VON: "bg-yellow-100 text-yellow-700",
        };
        const color = typeColors[row.match_type] || "bg-gray-100 text-gray-700";

        return (
          <span className={`px-3 py-1 !rounded  text-sm font-bold ${color}`}>
            {row.match_name || "-"}
          </span>
        );
      },
    },
    {
      title: t("competition_data_other.column_status"),
      key: "match_status",
      align: "center",
      width: "120px",
      render: (row) => {
        const status = row.match_status || "WAI";
        const statusLabel =
          {
            WAI: t("competition_data_other.status_waiting"),
            IN: t("competition_data_other.status_in_progress"),
            FIN: t("competition_data_other.status_finished"),
            CAN: t("competition_data_other.status_cancelled"),
          }[status] || t("competition_data_other.status_waiting");

        const statusColor =
          {
            WAI: "bg-yellow-100 text-yellow-800 border-yellow-300",
            IN: "bg-blue-100 text-blue-800 border-blue-300",
            FIN: "bg-green-100 text-green-800 border-green-300",
            CAN: "bg-red-100 text-red-800 border-red-300",
          }[status] || "bg-gray-100 text-gray-800 border-gray-300";

        return (
          <span
            className={`px-3 py-1 !rounded text-xs font-semibold border-2 ${statusColor}`}
          >
            {statusLabel}
          </span>
        );
      },
    },
    {
      title: t("competition_data_other.column_actions"),
      align: "center",
      key: "action",
      width: "auto",
      render: (row) => {
        const availableActions = getActionsByStatus(row.match_status || "WAI", row.match_type);
        return (
          <div className="flex items-center justify-center gap-1.5">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <Button
                  variant="none"
                  className={`!rounded !px-3 !py-2 !text-sm !font-medium ${action.color} transition-colors whitespace-nowrap`}
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

  // Chuyển đổi rows thành data cho CustomTable - Chỉ cho format DOL/SOL/TUV/DAL
  const tableData = rows.map((row, index) => {
    return {
      key: index,
      id: index,
      ...row,
    };
  });

  // Xử lý thêm mới - Format DOL/SOL/TUV/DAL
  const handleInsert = async (formData) => {
    try {
      const athletes = formData.athletes || [];
      const matchType = formData.match_type || formatType;

      // Tính row_index bắt đầu (tổng số rows hiện tại trong Excel)
      const currentExcelRowCount = rows.reduce(
        (sum, r) => sum + (r.raw_data?.length || r.athletes?.length || 1),
        0,
      );

      // Tạo các rows cho Excel (mỗi VĐV là 1 row)
      const excelRows = athletes.map((athlete, idx) => [
        formatType,
        formData.match_no || "",
        athlete.athlete_name || "",
        athlete.athlete_unit || "",
        matchType,
      ]);

      const newTeamObject = {
        match_no: formData.match_no || "",
        athletes: athletes,
        match_name: athletes
          .map((a) => a.athlete_name)
          .filter((n) => n)
          .join(", "),
        team_name: athletes
          .map((a) => a.athlete_unit)
          .filter((u) => u)
          .join(", "),
        match_type: matchType,
        match_status: formData.match_status || "WAI",
        match_id: null,
        row_index: currentExcelRowCount, // Row index của VĐV đầu tiên
        team_row_indices: excelRows.map((_, idx) => currentExcelRowCount + idx),
        raw_data: excelRows,
      };

      // Cập nhật Excel - Flatten tất cả raw_data
      const newRows = [...rows, newTeamObject];
      const allExcelRows = newRows.flatMap((r) => r.raw_data || []);
      const excelData = [headers, ...allExcelRows];

      await saveDataToServer(excelData);
      setRows(newRows);
      setOpenActions({ ...openActions, isOpen: false });
      showSuccess(t("competition_data_other.insert_success"));
    } catch (error) {
      console.error("Error inserting:", error);
      showError(
        t("competition_data_other.insert_error") + ": " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý cập nhật - Format DOL/SOL/TUV/DAL
  const handleUpdate = async (formData) => {
    try {
      const row = openActions.row;
      const athletes = formData.athletes || [];
      const matchType = formData.match_type || row.match_type;

      // 1. Tạo các rows cho Excel (mỗi VĐV là 1 row)
      const excelRows = athletes.map((athlete, idx) => [
        formatType,
        formData.match_no || row.match_no,
        athlete.athlete_name || "",
        athlete.athlete_unit || "",
        matchType,
      ]);

      // 2. Cập nhật tất cả rows của team trong Excel
      // Cần cập nhật từng row một
      for (let i = 0; i < excelRows.length; i++) {
        const rowIndex = row.row_index + i;
        await axios.put(
          `http://localhost:6789/api/competition-dk/${id}/row/${rowIndex}`,
          {
            data: excelRows[i],
          },
        );
      }

      // Nếu số VĐV giảm, xóa các rows thừa
      const oldNumRows = row.raw_data?.length || row.athletes?.length || 1;
      if (excelRows.length < oldNumRows) {
        for (let i = excelRows.length; i < oldNumRows; i++) {
          const rowIndex = row.row_index + i;
          await axios.delete(
            `http://localhost:6789/api/competition-dk/${id}/row/${rowIndex}`,
          );
        }
      }

      // 3. Nếu có match_id, cập nhật match_status và thông tin điểm số vào database
      if (row.match_id) {
        // Cập nhật trạng thái
        await axios.put(
          `http://localhost:6789/api/competition-match-team/${row.match_id}/status`,
          {
            status: formData.match_status,
          },
        );
        // Cập nhật điểm tay
        await axios.put(
          `http://localhost:6789/api/competition-match-team/${row.match_id}/scores`,
          {
            scores: formData.scores,
          },
        );
      }

      // 4. Reload data để đồng bộ
      await fetchData();

      setOpenActions({ ...openActions, isOpen: false });
      showSuccess(t("competition_data_other.update_success"));
    } catch (error) {
      console.error("Error updating:", error);
      showError(
        t("competition_data_other.update_error") + ": " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý xóa - Format DOL/SOL/TUV/DAL
  const handleDelete = async () => {
    try {
      const teamToDelete = openActions.row;
      const match_type = teamToDelete.match_type;
      const match_no = teamToDelete.match_no;
      const match_id = teamToDelete.match_id;
      const row_index = Number(teamToDelete.row_index) + 1;
      if (match_type == "SOL" || match_type == "TUV") {
        // xoá dữ liệu 2 rows liên tục
        const updated = sheetData?.data.filter((row, index) => {
          return index !== row_index && index !== row_index + 1;
        });
        // sắp xếp match_no lại
        await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
          sheet_name: sheetData.sheet_name,
          file_name: sheetData.file_name,
          data: updated,
        });
      } else if (match_type == "DOL") {
        // xoá dữ liệu 1 rows
        const updated = sheetData?.data.filter((row, index) => {
          return index !== row_index;
        });
        await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
          sheet_name: sheetData.sheet_name,
          file_name: sheetData.file_name,
          data: updated,
        });
      } else if (match_type == "DAL") {
        // xoá dữ liệu 4 rows liên tục
        const updated = sheetData?.data.filter((row, index) => {
          return (
            index !== row_index &&
            index !== row_index + 1 &&
            index !== row_index + 2 &&
            index !== row_index + 3
          );
        });
        await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
          sheet_name: sheetData.sheet_name,
          file_name: sheetData.file_name,
          data: updated,
        });
      } else if (match_type == "VON") {
        // xoá dữ liệu
      }

      // gọi lại dữ liệu
      await fetchData();

      // xoá competition-match-team theo id
      await axios.delete(
        `http://localhost:6789/api/competition-match-team/${match_id}`,
      );

      await fetchData();
      setOpenActions({ ...openActions, isOpen: false });
      showSuccess(t("competition_data_other.delete_success"));
    } catch (error) {
      console.error("Error deleting:", error);
      showError(
        t("competition_data_other.delete_error") + ": " + (error.response?.data?.message || error.message),
      );
    }
  };

  // Gọi API để lưu dữ liệu
  const saveDataToServer = async (newData) => {
    // await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
    //   sheet_name: sheetData.sheet_name,
    //   file_name: sheetData.file_name,
    //   data: newData
    // });
  };

  // Xử lý vào trận - Chỉ cho format DOL/SOL/TUV/DAL
  const handleMatchStart = async (row) => {
    // Thực hiện chặn
    const _match_type = row?.match_type ?? null;
    let isBlocked = false;
    if (_match_type == "VON") {
      isBlocked = !configSystem.data.ap_dung_vonhac;
    }
    if (_match_type != "VON") {
      isBlocked = !configSystem.data.ap_dung_quyen;
    }
    if (isBlocked) {
      await showError(t("competition_data_other.feature_locked"));
      return;
    }

    try {
      // Nếu chưa có match_id, tạo team mới
      if (!row.match_id) {
        const createPayload = {
          competition_dk_id: id,
          match_no: row?.match_no,
          match_name: row?.match_name,
          match_type: row?.match_type,
          team_name: row?.team_name,
          athletes:
            row?.athletes?.map((a) => ({
              name: a.athlete_name,
              unit: a.athlete_unit,
            })) || [],
          config_system: configSystem?.data || {},
          referrers: sheetData?.referrers || [],
          row_index: row?.row_index,
        };
        const createResponse = await axios.post(
          "http://localhost:6789/api/competition-match-team",
          createPayload,
        );
        row.match_id = createResponse.data.data.id;
      }

      // Cập nhật status thành 'IN'
      await axios.put(
        `http://localhost:6789/api/competition-match-team/${row.match_id}/status`,
        {
          status: "IN",
        },
      );

      // Chuẩn bị dữ liệu trận đấu
      const matchData = {
        match_id: row?.match_id,
        match_no: row?.match_no,
        match_name: row?.match_name,
        team_name: row?.team_name,
        match_type: row?.match_type,
        athletes: row?.athletes || [],
        match_status: "IN",
        ten_giai_dau: configSystem?.data?.ten_giai_dau || "",
        ten_mon_thi: configSystem?.data?.bo_mon || "",
        config_system: configSystem?.data || {},
        competition_dk_id: id,
        row_index: row?.row_index,
        scores: row?.scores || {},
        referrers: sheetData?.referrers || [],
      };

      // Chuyển màn hình thi đấu Võ Nhạc
      if (_match_type == "VON") {
        // Chuyển màn hình thi Võ Nhạc
        navigate("/bang-diem/vo-nhac", {
          state: {
            matchData,
            returnUrl: `/management/competition-data-other/${id}`,
          },
        });
      } else {
        // Chuyển màn hình thi đấu Quyền
        navigate("/bang-diem/quyen", {
          state: {
            matchData,
            returnUrl: `/management/competition-data-other/${id}`,
          },
        });
      }
    } catch (error) {
      console.error("Error starting match:", error);
      showError(
        t("competition_data_other.start_match_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý kết quả - Format DOL/SOL/TUV/DAL
  const handleResult = async (formData) => {
    try {
      const row = openActions.row;

      // 1. Lưu kết quả vào history
      const historyData = {
        score: formData.score || 0,
        rank: formData.rank,
        time_result: formData.time_result,
        notes: formData.notes || "",
        status: "FIN",
      };

      // Ngày 19.02
      // Nếu có match_id,  thêm vào history
      // if (row.match_id) {
      //   await axios.post(
      //     `http://localhost:6789/api/competition-match-team/${row.match_id}/history`,
      //     historyData,
      //   );
      // }

      // 2. Cập nhật status thành FIN
      if (row.match_id) {
        await axios.put(
          `http://localhost:6789/api/competition-match-team/${row.match_id}/status`,
          {
            status: "FIN",
          },
        );
      }

      // 3. Đóng modal
      setOpenActions({ ...openActions, isOpen: false });

      // 4. Reload data để hiển thị cập nhật
      await fetchData();

      // 5. Thông báo thành công
      showSuccess(t("competition_data_other.save_result_success"));
    } catch (error) {
      console.error("Error saving result:", error);
      showError(
        t("competition_data_other.save_result_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý cấu hình
  const handleConfig = async (configData) => {
    try {
      const row = openActions.row;

      if (row.match_id) {
        await axios.put(
          `http://localhost:6789/api/competition-match-team/${row.match_id}/config`,
          {
            config_system: configData,
          },
        );

        showSuccess(t("competition_data_other.save_config_success"));
        setOpenActions({ ...openActions, isOpen: false });
        fetchData(); // Reload data
      } else {
        showAlert(t("competition_data_other.no_match_id"));
      }
    } catch (error) {
      console.error("Error saving config:", error);
      showError(
        t("competition_data_other.save_config_error") + ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Xử lý thêm mới // modal đang lỗi | api đang lỗi
  // const handleCreate = async (formData) => {
  //   try {
  //     // Tìm row_index lớn nhất hiện tại
  //     const maxRowIndex = rows.reduce((max, row) => Math.max(max, row.row_index || 0), 0);
  //     const newRowIndex = maxRowIndex + 1;

  //     // Tạo team mới trong database
  //     const createPayload = {
  //       competition_dk_id: id,
  //       match_no: formData.match_no,
  //       match_name: formData.match_name,
  //       match_type: formData.match_type || formData.match_name,
  //       team_name: formData.team_name,
  //       athletes: formData.athletes
  //         .filter(a => a.athlete_name && a.athlete_name.trim())
  //         .map(a => ({ name: a.athlete_name, unit: a.athlete_unit })),
  //       config_system: configSystem?.data || {},
  //       row_index: newRowIndex
  //     };

  //     const createResponse = await axios.post('http://localhost:6789/api/competition-match-team', createPayload);

  //     if (createResponse.data.success) {
  //       alert('Thêm mới thành công!');
  //       // cập nhật lại
  //       //  const row_index = Number(teamToDelete.row_index) + 1;
  //       // if(match_type == 'SOL' || match_type == 'TUV' ){
  //       //   // xoá dữ liệu 2 rows liên tục
  //       //   const updated = sheetData?.data.filter((row, index) => {
  //       //     return index !== row_index && index !== row_index + 1;
  //       //   });
  //       //   // sắp xếp match_no lại
  //       //   await axios.put(`http://localhost:6789/api/competition-dk/${id}`,{
  //       //     sheet_name: sheetData.sheet_name , file_name: sheetData.file_name, data: updated
  //       //   });
  //       // } else if(match_type == 'DOL'){
  //       //   // xoá dữ liệu 1 rows
  //       //   const updated = sheetData?.data.filter((row, index) => {
  //       //     return index !== row_index;
  //       //   });
  //       //   await axios.put(`http://localhost:6789/api/competition-dk/${id}`,{
  //       //     sheet_name: sheetData.sheet_name , file_name: sheetData.file_name, data: updated
  //       //   });

  //       // } else if(match_type == 'DAL'){
  //       //   // xoá dữ liệu 4 rows liên tục
  //       //   const updated = sheetData?.data.filter((row, index) => {
  //       //     return index !== row_index && index !== row_index + 1 && index !== row_index + 2 && index !== row_index + 3;
  //       //   });
  //       //   await axios.put(`http://localhost:6789/api/competition-dk/${id}`,{
  //       //     sheet_name: sheetData.sheet_name , file_name: sheetData.file_name, data: updated
  //       //   });
  //       // }

  //       await fetchData(); // Reload data
  //       setOpenActions({ ...openActions, isOpen: false });
  //     } else {
  //       alert('Thêm mới thất bại!');
  //     }
  //   } catch (error) {
  //     console.error('Error creating:', error);
  //     alert('Lỗi khi thêm mới: ' + (error.response?.data?.message || error.message));
  //   }
  // };

  // Render nội dung modal - Format DOL/SOL/TUV/DAL
  const renderContentModal = (openActions, modalProps) => {
    switch (openActions?.key) {
      case Constants.ACTION_MATCH_START:
        return (
          <ActionConfirm
            message={`${t("competition_data_other.confirm_start_match")} ${openActions.row?.match_no}?`}
            onConfirm={() => handleMatchStart(openActions.row)}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_MATCH_RESULT:
        return openActions.row?.match_type === 'VON' ? (
          <VonResultForm
            row={openActions.row}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            referrers={openActions.row?.referrers || []}
          />
        ) : (
          <ResultForm
            row={openActions.row}
            onSubmit={handleResult}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            soGiamDinh={configSystem?.data?.so_giam_dinh || 5}
            referrers={openActions.row?.referrers || []}
          />
        );
      // case Constants.ACTION_CREATE:
      //   return <DataFormOther headers={headers} row={null} onSubmit={handleCreate} onCancel={() => setOpenActions({ ...openActions, isOpen: false })} isCreate={true} sheetData ={sheetData}/>;
      case Constants.ACTION_UPDATE:
        return (
          <DataFormOther
            headers={headers}
            row={openActions.row}
            onSubmit={handleUpdate}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            showAlert={showAlert}
            soGiamDinh={configSystem?.data?.so_giam_dinh || 5}
            referrers={openActions.row?.referrers || []}
            availableReferees={availableReferees}
          />
        );
      case Constants.ACTION_MATCH_CONFIG:
        return <ConfigSystem />;
      case Constants.ACTION_MATCH_REPORT:
        return openActions.row?.match_type === 'VON' ? (
          <VonReportForm
            row={openActions.row}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            referrers={openActions.row?.referrers || []}
            soGiamDinh={7}
          />
        ) : (
          <QuyenReportForm
            row={openActions.row}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
            referrers={openActions.row?.referrers || []}
            soGiamDinh={configSystem?.data?.so_giam_dinh || 5}
          />
        );
      case Constants.ACTION_MATCH_LOGS:
        return (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center mb-4 text-blue-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase mb-2">Nhật ký diễn biến</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Nhật ký diễn biến chi tiết hiện tại chỉ được hỗ trợ cho các nội dung thi đấu đối kháng trực tiếp.
            </p>
          </div>
        );
      case Constants.ACTION_DELETE:
        return (
          <DeleteConfirm
            onConfirm={handleDelete}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      default:
        return null;
    }
  };

  // Filter và Sort logic - Đặt trước các return statements
  const filteredData = tableData.filter((row) => {
    // Filter by status
    if (filterStatus !== "ALL" && row.match_status !== filterStatus)
      return false;

    // Filter by type
    if (filterType !== "ALL" && row.match_type !== filterType) return false;

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      const matchNo = String(row.match_no || "").toLowerCase();
      const matchName = String(row.match_name || "").toLowerCase();
      const teamName = String(row.team_name || "").toLowerCase();
      const athleteNames = (row.athletes || [])
        .map((a) => String(a.athlete_name || "").toLowerCase())
        .join(" ");

      return (
        matchNo.includes(searchLower) ||
        matchName.includes(searchLower) ||
        teamName.includes(searchLower) ||
        athleteNames.includes(searchLower)
      );
    }

    return true;
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case "match_no":
        return Number(a.match_no) - Number(b.match_no);
      case "status":
        const statusOrder = { IN: 0, WAI: 1, FIN: 2, CAN: 3 };
        return (
          (statusOrder[a.match_status] || 99) -
          (statusOrder[b.match_status] || 99)
        );
      case "type":
        const typeOrder = { DOL: 0, SOL: 1, TUV: 2, DAL: 3 };
        return (
          (typeOrder[a.match_type] || 99) - (typeOrder[b.match_type] || 99)
        );
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset page khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [filterStatus, filterType, search]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("competition_data_other.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 shadow">
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("competition_data_other.no_data_found")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate("/management/general-setting/competition-management")}
            className="text-blue-600 mb-4 flex items-center gap-2 font-bold text-xs uppercase tracking-widest group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            {t("competition_data_other.back")}
          </button>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase">
            {sheetData?.sheet_name || t("competition_data_other.loading")}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/10 p-1.5 rounded w-fit border border-blue-100 dark:border-blue-800/30">
          <button
            onClick={() => setActiveTab("matches")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "matches"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_data_other.tabs.matches")}
          </button>
          <button
            onClick={() => setActiveTab("referrers")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "referrers"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_data_other.tabs.referrers")}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "results"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_data_other.tabs.results")}
          </button>
        </div>
      </div>

      {activeTab === "matches" && (
        <>

          {/* Match Stats Section */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {["WAI", "IN", "FIN"].map((s) => {
              const statusColors = {
                WAI: "bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20 text-amber-600",
                IN: "bg-blue-50/50 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20 text-blue-600",
                FIN: "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20 text-emerald-600"
              };
              const labelColors = {
                WAI: "text-amber-500/70",
                IN: "text-blue-500/70",
                FIN: "text-emerald-500/70"
              };
              return (
                <div key={s} className={`p-4 rounded border transition-all duration-300 ${statusColors[s]}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${labelColors[s]}`}>
                    {t(`competition_data_other.filter_${s === "WAI" ? "waiting" : s === "IN" ? "in_progress" : "finished"}`)}
                  </p>
                  <p className="text-3xl font-black">
                    {tableData.filter((r) => r.match_status === s).length}
                  </p>
                </div>
              );
            })}
          </div>


          {/* Toolbar Section */}
          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-1 min-w-[300px] gap-3">
              <div className="flex-1 max-w-sm">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  onSearch={handleSearch}
                  placeholder={t("competition_data_other.search_placeholder")}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded text-xs font-bold min-w-[150px]"
              >
                <option value="ALL">{t("competition_data_other.filter_all_status")}</option>
                <option value="WAI">{t("competition_data_other.filter_waiting")}</option>
                <option value="IN">{t("competition_data_other.filter_in_progress")}</option>
                <option value="FIN">{t("competition_data_other.filter_finished")}</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded text-xs font-bold min-w-[150px]"
              >
                <option value="ALL">{t("competition_data_other.filter_all_content")}</option>
                <option value="DOL">{t("competition_data_other.type_doi_luyen")}</option>
                <option value="SOL">{t("competition_data_other.type_song_luyen")}</option>
                <option value="TUV">{t("competition_data_other.type_tu_ve")}</option>
                <option value="DAL">{t("competition_data_other.type_da_luyen")}</option>
                <option value="VON">{t("competition_data_other.type_vo_nhac")}</option>
              </select>
            </div>

            <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded border border-gray-100 dark:border-gray-700 items-center">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-gray-400"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span>{t("competition_management.grid_view")}</span>

              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "text-gray-400"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span>{t("competition_management.list_view")}</span>

              </button>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-800 mx-2"></div>
              <button
                onClick={() => setViewMode("rank")}
                className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "rank" ? "bg-amber-500 text-white shadow-md" : "text-amber-600"
                  }`}
              >
                {t("competition_data_other.rank")}
              </button>
            </div>
          </div>


          {/* Cards Grid/List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12" >
                <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("competition_data_other.loading")}
                </p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">
                  {t("competition_data_other.no_data_found")}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                  {t("competition_data_other.try_filters")}
                </p>
              </div>
            ) : (
              <>
                {/* Cards / Leaderboard */}
                {viewMode === "rank" ? (
                  <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-center w-24">{t('competition_data_other.rank')}</th>
                          <th className="px-6 py-4 w-28 text-center">{t('competition_data_other.column_stt')}</th>
                          <th className="px-6 py-4 w-[40%]">{t('competition_data_other.unit_team')}</th>
                          <th className="px-6 py-4">{t('competition_data_other.column_content')}</th>
                          <th className="px-6 py-4 text-center text-blue-600 dark:text-blue-400 font-bold">{t('competition_data_other.score')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rankedData = [...filteredData]
                            .filter(row => row.match_status === "FIN" && row.scores?.total > 0)
                            .sort((a, b) => {
                              const bTotal = b.scores?.total || 0;
                              const aTotal = a.scores?.total || 0;
                              if (bTotal !== aTotal) {
                                return bTotal - aTotal; // Sort by total descending
                              }

                              // If total is equal, check the max score among judges
                              const getJudgeScores = (scores) => {
                                if (!scores) return [];
                                return Object.keys(scores)
                                  .filter(key => key.startsWith('judge'))
                                  .map(key => Number(scores[key]))
                                  .filter(val => !isNaN(val));
                              };

                              const aJudgeScores = getJudgeScores(a.scores);
                              const bJudgeScores = getJudgeScores(b.scores);

                              if (aJudgeScores.length > 0 && bJudgeScores.length > 0) {
                                const aMax = Math.max(...aJudgeScores);
                                const bMax = Math.max(...bJudgeScores);
                                if (bMax !== aMax) {
                                  return bMax - aMax; // Tie-breaker 1: Highest max judge score
                                }

                                const aMin = Math.min(...aJudgeScores);
                                const bMin = Math.min(...bJudgeScores);
                                if (bMin !== aMin) {
                                  return bMin - aMin; // Tie-breaker 2: Highest min judge score
                                }
                              }

                              return 0;
                            });

                          if (rankedData.length === 0) {
                            return (
                              <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">{t('competition_data_other.no_ranking_results')}</p>
                                    <p className="text-gray-400 text-sm mt-1">{t('competition_data_other.only_completed_ranked')}</p>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return rankedData.map((row, index) => {
                            let rankStyle = "text-gray-600 dark:text-gray-300 font-medium";
                            let rankBadge = `${index + 1}`;
                            if (index === 0) {
                              rankStyle = "text-yellow-700 dark:text-yellow-500 font-bold bg-yellow-50/50 dark:bg-yellow-900/10";
                              rankBadge = "🥇 1";
                            } else if (index === 1) {
                              rankStyle = "text-gray-600 dark:text-gray-300 font-bold bg-gray-50/50 dark:bg-gray-800/30";
                              rankBadge = "🥈 2";
                            } else if (index === 2) {
                              rankStyle = "text-amber-700 dark:text-amber-500 font-bold bg-orange-50/30 dark:bg-orange-900/10";
                              rankBadge = "🥉 3";
                            }

                            return (
                              <tr key={row.match_id ? `rank-${row.match_id}` : `rank-row-${index}`} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors ${rankStyle}`}>
                                <td className="px-6 py-4 text-center font-bold text-lg">{rankBadge}</td>
                                <td className="px-6 py-4 text-center font-mono">T{row.match_no}</td>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-base tracking-wide flex items-center gap-2">
                                    {index === 0 && <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>}
                                    {row.team_name || "-"}
                                  </div>
                                  <div className="text-xs opacity-75 mt-1 font-normal flex flex-wrap gap-1">
                                    {row.athletes?.map((a, i) => (
                                      <span key={`rank-${row.match_id || index}-ath-${i}`} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                        {a.athlete_name}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 font-medium opacity-90">{row.match_name}</td>
                                <td className="px-6 py-4">
                                  <div className="text-center font-black text-xl text-blue-600 dark:text-blue-400">
                                    {row.scores?.total || 0}
                                  </div>
                                  {row.scores && (
                                    <div className="mt-2 flex flex-wrap justify-center gap-1.5 opacity-80">
                                      {Object.keys(row.scores)
                                        .filter(key => key.startsWith('judge'))
                                        .sort()
                                        .map(key => {
                                          const jn = key.replace('judge', '');
                                          return (
                                            <div key={key} className="text-[10px] bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                              <span className="text-gray-500 font-medium">{t('competition_data_other.form_judge_short')}{jn}:</span>
                                              <span className="font-bold">{row.scores[key]}</span>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                        : "space-y-3"
                    }
                  >
                    {paginatedData.map((row, index) => (
                      <TeamCard
                        key={row.match_id ? `match-id-${row.match_id}` : `row-index-${index}`}
                        row={row}
                        listActions={listActions}
                        getActionsByStatus={getActionsByStatus}
                        onDoubleClick={(row) => {
                          setOpenActions({
                            isOpen: true,
                            key: Constants.ACTION_UPDATE,
                            row: row,
                          });
                        }}
                        viewMode={viewMode}
                        t={t}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {/* Page Info */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('competition_data_other.showing')}{" "}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {startIndex + 1}
                      </span>{" "}
                      - {" "}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {Math.min(endIndex, filteredData.length)}
                      </span>{" "}
                      {t('competition_data_other.of_total')}{" "}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {filteredData.length}
                      </span>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className={`px-3 py-2 rounded font-medium text-sm transition-all ${page === 1
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (pageNum) => {
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= page - 1 && pageNum <= page + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`px-3 py-2 rounded font-medium text-sm transition-all ${page === pageNum
                                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === page - 2 ||
                              pageNum === page + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="px-2 text-gray-400 dark:text-gray-500"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          },
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className={`px-3 py-2 rounded font-medium text-sm transition-all ${page === totalPages
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Items per page */}
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                    >
                      <option value={6}>6 / {t('competition_data_other.page')}</option>
                      <option value={12}>12 / {t('competition_data_other.page')}</option>
                      <option value={24}>24 / {t('competition_data_other.page')}</option>
                      <option value={48}>48 / {t('competition_data_other.page')}</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      {activeTab === "referrers" && (
        <RefereeAllocationSection
          availableReferees={availableReferees}
          initialReferrers={sheetData?.referrers || []}
          onSave={handleSaveReferrers}
          configSystem={configSystem}
          formatType={formatType}
        />
      )}

      {activeTab === "results" && (
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 w-24">{t("competition_data_other.match_no_label") || "Mã số"}</th>
                <th className="px-6 py-4">{t("competition_data_other.match_content") || "Nội dung thi"}</th>
                <th className="px-6 py-4">{t("competition_data_other.athletes_label") || "VĐV Tham Gia"}</th>
                <th className="px-6 py-4 text-center">{t("competition_data_other.column_actions") || "Thao tác"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tableData.filter(r => r.match_status === "FIN").map(row => (
                <tr key={row.match_id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors group">
                  <td className="px-6 py-4 font-black">T{row.match_no}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400">{row.match_content || row.match_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {row.athletes?.map((a, idx) => (
                          <span key={idx} className="bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {a.athlete_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* <button
                        onClick={() => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_LOGS, row })}
                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t("competition_detail.modals.match_log")}
                      </button> */}
                      <button
                        onClick={() => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_REPORT, row })}
                        className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        {t("competition_detail.modals.result_report")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tableData.filter(r => r.match_status === "FIN").length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{t("competition_detail.messages.no_data")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full hover:scale-110 transition-all duration-300 z-40 group"
          title={t('competition_data_other.scroll_to_top')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 group-hover:animate-bounce"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Modal Kết quả */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_RESULT && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

            <div className={`relative bg-white dark:bg-gray-900 rounded ${openActions?.row?.match_type === 'VON' ? 'max-w-6xl' : 'max-w-4xl'} w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-yellow-500 dark:border-yellow-600`}>
              {/* Header */}
              <div className="relative px-6 py-4 bg-yellow-500 dark:bg-yellow-600 flex-shrink-0">

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">{t('competition_data_other.modal_match_data_analysis')}</h2>
                        {openActions?.row?.match_type === 'VON' && (
                          <span className="text-[8px] font-mono bg-white/20 text-white px-2 py-0.5 rounded-full">
                            {t('competition_data_other.type_vo_nhac')} • 7 {t('competition_data_other.form_judge')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">
                        {t('competition_data_other.modal_detailed_score_table')}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                    className="w-9 h-9 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-5 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Cập nhật */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded max-w-5xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-emerald-500 dark:border-emerald-600">
              {/* Header */}
              <div className="relative px-6 py-4 bg-emerald-500 dark:bg-emerald-600 flex-shrink-0">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em] mb-0.5">{t('competition_data_other.modal_match_management')}</h2>
                      <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">
                        {t('competition_data_other.modal_update_info')}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                    className="w-9 h-9 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-5 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Nhật ký */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_LOGS && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded max-w-xl w-full mx-4 overflow-hidden flex flex-col border border-blue-500">
              {/* Header */}
              <div className="relative px-6 py-4 bg-blue-600 dark:bg-blue-700 flex-shrink-0 text-white">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight uppercase leading-none">
                        {t("competition_detail.modals.match_log")}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded font-bold transition-all active:scale-95 uppercase tracking-widest text-xs backdrop-blur-md border border-white/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      {t("competition_detail.modals.print_log")}
                    </button>
                    <button
                      onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                      className="w-9 h-9 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 dark:bg-gray-950 p-8 text-center">
                {renderContentModal(openActions, modalProps)}
                <div className="mt-8 flex justify-center">
                  <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="px-8 py-2 bg-blue-600 text-white font-bold rounded uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20">Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Biên bản */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_REPORT && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded max-w-5xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-blue-500 dark:border-blue-600">
              {/* Header */}
              <div className="relative px-6 py-4 bg-blue-600 dark:bg-blue-700 flex-shrink-0">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em] mb-0.5">{t('competition_data_other.modal_match_management')}</h2>
                      <h3 className="text-xl font-black text-white tracking-tight uppercase leading-none">
                        {t('competition_data_other.modal_match_report')}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Nút In biên bản */}
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded font-bold transition-all active:scale-95 uppercase tracking-widest text-xs backdrop-blur-md border border-white/10"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      {t("competition_detail.modals.print_report")}
                    </button>

                    {/* Nút Đóng */}
                    <button
                      onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                      className="w-9 h-9 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-5 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Thêm mới */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_CREATE && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded max-w-5xl w-full mx-4 overflow-hidden flex flex-col border border-blue-500 dark:border-blue-600">
              {/* Header */}
              <div className="relative px-8 py-6 bg-blue-600 flex-shrink-0">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center text-white">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div>
                      <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.update_match_subtitle")}</h2>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                        {t("competition_data_other.form_create_match")}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                    className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Cấu hình */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_CONFIG && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

            <div className="relative bg-white dark:bg-gray-900 rounded max-w-6xl w-full mx-4 overflow-hidden flex flex-col border border-blue-500 dark:border-blue-600">
              {/* Header */}
              <div className="relative px-8 py-6 bg-blue-600 flex-shrink-0">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center text-white">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-0.5">{t("competition_detail.modals.config_subtitle")}</h2>
                      <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                        {t("competition_detail.modals.config_title")}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                    className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8 custom-scrollbar">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Xoá */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_DELETE && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded max-w-xl w-full mx-4 overflow-hidden border border-rose-500">
              <div className="px-8 py-6 bg-rose-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest">{t("competition_data_other.action_confirm_delete")}</h3>
                </div>
                <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal Vào trận */}
      {
        openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_START && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
            <div className="relative bg-white dark:bg-gray-900 rounded max-w-xl w-full mx-4 overflow-hidden border border-blue-500">
              <div className="px-8 py-6 bg-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest">{t("competition_data_other.action_start_match")}</h3>
                </div>
                <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="w-10 h-10 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )
      }

      {/* Modal thông báo */}
      <ConfirmModal {...modalProps} />
    </div >
  );
}





