import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import CustomTable from "../../../components/CustomTable";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import SearchInput from "../../../components/SearchInput";
import { Constants } from "../../../common/Constants";
import { useAppDispatch, useAppSelector } from "../../../config/redux/store";
import {
  fetchConfigSystem,
  updateConfigSystem,
} from "../../../config/redux/controller/configSystemSlice";
import * as XLSX from "xlsx";
import useConfirmModal from "../../../hooks/useConfirmModal";
import ConfirmModal from "../../../components/ConfirmModal";
import ConfigSystem from "./ConfigSystem";

// Component Card cho mỗi đội/VĐV thi đấu
function TeamCard({
  row,
  listActions,
  getActionsByStatus,
  onDoubleClick,
  viewMode = "grid",
}) {
  const status = row.match_status || "WAI";
  const statusConfig = {
    WAI: {
      label: "Chờ",
      color:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    IN: {
      label: "Đang diễn ra",
      color:
        "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
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
    },
    FIN: {
      label: "Kết thúc",
      color:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    CAN: {
      label: "Hủy",
      color:
        "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const typeColors = {
    DOL: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-300 dark:border-purple-700",
      gradient:
        "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
      name: "Đối Luyện",
    },
    SOL: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-300 dark:border-green-700",
      gradient:
        "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
      name: "Song Luyện",
    },
    TUV: {
      bg: "bg-orange-100 dark:bg-orange-900",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
      gradient:
        "from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800",
      name: "Tự Vệ",
    },
    DAL: {
      bg: "bg-pink-100 dark:bg-pink-900",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-300 dark:border-pink-700",
      gradient: "from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800",
      name: "Đả Luyện",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig["WAI"];
  const typeColor = typeColors[row.match_type] || typeColors["DOL"];
  const availableActions = getActionsByStatus(status);

  // List View - Compact horizontal layout
  if (viewMode === "list") {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group relative flex h-full"
        onDoubleClick={() => onDoubleClick(row)}
      >
        <div className="flex items-center gap-4 p-4 w-full">
          {/* STT */}
          <div className="flex-shrink-0">
            <div
              className={`bg-gradient-to-r ${typeColor.gradient} ${typeColor.border} border-1  text-gray-800 dark:text-gray-200 rounded px-4 py-2 font-bold text-base shadow-md min-w-[50px] text-center`}
            >
              {Number(row.match_no)}
            </div>
          </div>

          {/* Nội dung thi */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div
              className={`px-3 py-1.5 rounded font-bold text-xs ${typeColor.bg} ${typeColor.text} border-1 ${typeColor.border}`}
            >
              {row.match_name || typeColor.name}
            </div>
          </div>

          {/* VĐV tham gia */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              VĐV tham gia:
            </div>
            {row.athletes && row.athletes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {row.athletes.slice(0, 3).map((athlete, idx) => (
                  <div
                    key={`${row.match_id || row.match_no}-athlete-${idx}`}
                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900 px-2 py-1 rounded"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300 text-sm truncate max-w-[150px]">
                      {athlete.athlete_name}
                    </span>
                  </div>
                ))}
                {row.athletes.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                    +{row.athletes.length - 3} khác
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                Chưa có VĐV
              </span>
            )}
          </div>

          {/* Đơn vị */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Đơn vị:
            </div>
            <div
              className={`px-3 py-1 rounded font-semibold text-sm ${typeColor.bg} ${typeColor.text}`}
            >
              {row.team_name || "-"}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="flex-shrink-0 flex items-center justify-center w-28">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {status === "IN" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "IN" ? "bg-blue-500" : status === "FIN" ? "bg-green-500" : status === "WAI" ? "bg-amber-500" : "bg-gray-400"}`}></span>
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{currentStatus.label}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2 border-l border-gray-100 dark:border-gray-700/60 pl-4 ml-2">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => {
                let actionStyle = "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700";

                if (action.key === Constants.ACTION_MATCH_START) actionStyle = "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50";
                if (action.key === Constants.ACTION_MATCH_RESULT) actionStyle = "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/50";
                if (action.key === Constants.ACTION_DELETE) actionStyle = "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50";

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      action.callback(row);
                    }}
                    key={action.key}
                    title={action.btnText}
                    className={`
                      flex items-center justify-center
                      h-8 w-8 rounded
                      border shadow-sm
                      transition-colors duration-200
                      ${actionStyle}
                    `}
                  >
                    {React.cloneElement(action.icon, { className: "h-3.5 w-3.5" })}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Card layout
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group relative flex flex-col h-full"
      onDoubleClick={() => onDoubleClick(row)}
    >
      {/* Header - STT và Trạng thái */}
      <div
        className={`bg-gradient-to-r ${typeColor.gradient} px-4 py-3 border-b-2 ${typeColor.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`${typeColor.bg} ${typeColor.text} border-2 ${typeColor.border} rounded px-3 py-1.5 font-bold text-sm shadow-md`}
            >
              {Number(row.match_no)}
            </div>
            <div
              className={`px-3 py-1 rounded font-bold text-xs ${typeColor.bg} ${typeColor.text}`}
            >
              {row.match_name || typeColor.name}
            </div>
          </div>
        </div>
      </div>

      {/* Body - Thông tin VĐV và Đơn vị */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-auto">
          {/* Đơn vị */}
          <div
            className={`bg-gradient-to-br ${typeColor.gradient} rounded p-4 border-2 ${typeColor.border} shadow-sm mb-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${typeColor.text}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              <h3
                className={`text-sm font-bold ${typeColor.text} uppercase tracking-wide`}
              >
                Đơn vị
              </h3>
            </div>
            <div className={`font-bold ${typeColor.text} text-lg`}>
              {row.team_name || "-"}
            </div>
          </div>

          {/* VĐV tham gia */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded p-4 border-2 border-blue-200 dark:border-blue-700 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-700 dark:text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                VĐV tham gia
              </h3>
              {row.athletes && row.athletes.length > 0 && (
                <span className="ml-auto bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {row.athletes.length}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {row.athletes && row.athletes.length > 0 ? (
                row.athletes.map((athlete, idx) => (
                  <div
                    key={`${row.match_id || row.match_no}-athlete-card-${idx}`}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded p-2 shadow-sm"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-blue-900 dark:text-blue-200 truncate">
                        {athlete.athlete_name || "-"}
                      </div>
                      {athlete.athlete_unit && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {athlete.athlete_unit}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 py-2">
                  Chưa có VĐV
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trạng thái Mini */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {status === "IN" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "IN" ? "bg-blue-500" : status === "FIN" ? "bg-green-500" : status === "WAI" ? "bg-amber-500" : "bg-gray-400"}`}></span>
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currentStatus.label}</span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="border-t border-gray-100 dark:border-gray-700/60 pt-3 mt-1 pl-1">
          <div className="flex items-center gap-2 flex-wrap">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => {
                let actionStyle = "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700";

                if (action.key === Constants.ACTION_MATCH_START) actionStyle = "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50";
                if (action.key === Constants.ACTION_MATCH_RESULT) actionStyle = "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/50";
                if (action.key === Constants.ACTION_DELETE) actionStyle = "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50";

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering onDoubleClick
                      action.callback(row);
                    }}
                    key={action.key}
                    title={action.btnText}
                    className={`
                      flex items-center justify-center
                      h-8 w-8 rounded
                      border shadow-sm
                      transition-colors duration-200
                      ${actionStyle}
                    `}
                  >
                    {React.cloneElement(action.icon, { className: "h-3.5 w-3.5" })}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component RoundHistoryCard - Không dùng cho format DOL/SOL/TUV/DAL
export default function CompetitionDataDetailOrther() {
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
  }, [id]);

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
          setRows(matches?.map((m) => ({ ...m, match_id: m.id })));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(
        "Lỗi khi tải dữ liệu: " +
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
      btnText: "Thi",
      color:
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
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
      description: "Bắt đầu thi",
      callback: (row) => {
        handleMatchStart(row);
      },
    },
    {
      key: Constants.ACTION_MATCH_RESULT,
      btnText: "Kết quả",
      color:
        "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700",
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
      description: "Kết quả",
      callback: (row) => {
        setOpenActions({
          isOpen: true,
          key: Constants.ACTION_MATCH_RESULT,
          row: row,
        });
      },
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: "Cập nhật",
      color:
        "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700",
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
      description: "Cập nhật dữ liệu",
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
    //     "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700",
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
      btnText: "Xóa",
      color:
        "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
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
      description: "Xác nhận xóa",
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
  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": // Kết thúc
        return [Constants.ACTION_MATCH_RESULT];
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
      title: "STT",
      key: "match_no",
      align: "center",
      width: "80px",
      render: (row) => (
        <span className="font-semibold text-lg">{row.match_no || "-"}</span>
      ),
    },
    {
      title: "VĐV tham gia",
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
      title: "Đơn vị",
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
      title: "Nội dung thi",
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
      title: "Trạng thái",
      key: "match_status",
      align: "center",
      width: "120px",
      render: (row) => {
        const status = row.match_status || "WAI";
        const statusLabel =
          {
            WAI: "Chờ",
            IN: "Đang diễn ra",
            FIN: "Kết thúc",
            CAN: "Hủy",
          }[status] || "Chờ";

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
      title: "Hành động",
      align: "center",
      key: "action",
      width: "auto",
      render: (row) => {
        const availableActions = getActionsByStatus(row.match_status || "WAI");
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
      showSuccess("Thêm mới thành công!");
    } catch (error) {
      console.error("Error inserting:", error);
      showError(
        "Lỗi khi thêm mới: " + (error.response?.data?.message || error.message),
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
      showSuccess("Cập nhật thành công!");
    } catch (error) {
      console.error("Error updating:", error);
      showError(
        "Lỗi khi cập nhật: " + (error.response?.data?.message || error.message),
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
      showSuccess("Xóa thành công!");
    } catch (error) {
      console.error("Error deleting:", error);
      showError(
        "Lỗi khi xóa: " + (error.response?.data?.message || error.message),
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
      await showError("Tính năng đang khoá. Vui lòng thử lại sau.");
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
        "Lỗi khi bắt đầu trận: " +
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
      showSuccess("Lưu kết quả thành công!");
    } catch (error) {
      console.error("Error saving result:", error);
      showError(
        "Lỗi khi lưu kết quả: " +
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

        showSuccess("Lưu cấu hình thành công!");
        setOpenActions({ ...openActions, isOpen: false });
        fetchData(); // Reload data
      } else {
        showAlert("Chưa có match_id. Vui lòng tạo team trước!");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      showError(
        "Lỗi khi lưu cấu hình: " +
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
            message={`Bắt đầu trận ${openActions.row?.match_no}?`}
            onConfirm={() => handleMatchStart(openActions.row)}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        );
      case Constants.ACTION_MATCH_RESULT:
        return openActions.row?.match_type === 'VON' ? (
          <VonResultForm
            row={openActions.row}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
          />
        ) : (
          <ResultForm
            row={openActions.row}
            onSubmit={handleResult}
            onCancel={() => setOpenActions({ ...openActions, isOpen: false })}
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
          />
        );
      case Constants.ACTION_MATCH_CONFIG:
        return <ConfigSystem />;
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
            Đang tải dữ liệu...
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
            Không tìm thấy dữ liệu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate("/management/general-setting/competition-management")
          }
          className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {sheetData?.sheet_name || "Đang tải..."}
        </h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            File: {sheetData?.file_name || "-"} | Tổng số dòng: {rows.length}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 border-2 border-yellow-200 dark:border-yellow-700 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-700 dark:text-yellow-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase">
                Chờ
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
              {tableData.filter((r) => r.match_status === "WAI").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-2 border-blue-200 dark:border-blue-700 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-700 dark:text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
                Đang thi
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {tableData.filter((r) => r.match_status === "IN").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-2 border-green-200 dark:border-green-700 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-700 dark:text-green-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">
                Kết thúc
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
              {tableData.filter((r) => r.match_status === "FIN").length}
            </div>
          </div>
          {/* <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-2 border-red-200 dark:border-red-700 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-700 dark:text-red-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase">
                Hủy
              </span>
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-200">
              {tableData.filter((r) => r.match_status === "CAN").length}
            </div>
          </div> */}
        </div>
      </div>

      {/* Toolbar - Filter, Sort, View Mode */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                placeholder="Tìm kiếm STT, VĐV, đơn vị..."
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border min-w-[150px] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="WAI">Chờ thi</option>
              <option value="IN">Đang diễn ra</option>
              <option value="FIN">Kết thúc</option>
              <option value="CAN">Hủy bỏ</option>
            </select>

            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border min-w-[150px] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="ALL">Tất cả nội dung</option>
              <option value="DOL">Đối Luyện</option>
              <option value="SOL">Song Luyện</option>
              <option value="TUV">Tự Vệ</option>
              <option value="DAL">Đa Luyện</option>
              <option value="VON">Võ Nhạc</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border min-w-[150px] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="match_no">Sắp xếp: STT</option>
              <option value="status">Sắp xếp: Trạng thái</option>
              <option value="type">Sắp xếp: Nội dung</option>
            </select>
          </div>

          {/* Right: View Mode & Stats */}
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600 dark:text-blue-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {filteredData.length} / {tableData.length}
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${viewMode === "grid"
                  ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                title="Lưới"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-all ${viewMode === "list"
                  ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                title="Danh sách"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={() => setViewMode("rank")}
                className={`p-2 rounded transition-all flex items-center gap-1.5 px-3 font-semibold text-sm ${viewMode === "rank"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                title="Bảng xếp hạng điểm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="hidden sm:inline">Xếp hạng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid/List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Đang tải dữ liệu...
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
              Không tìm thấy dữ liệu nào
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Thử thay đổi bộ lọc hoặc tìm kiếm
            </p>
          </div>
        ) : (
          <>
            {/* Cards / Leaderboard */}
            {viewMode === "rank" ? (
              <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-center w-24">Hạng</th>
                      <th className="px-6 py-4 w-28 text-center">STT</th>
                      <th className="px-6 py-4 w-[40%]">Đơn vị / Đội thi</th>
                      <th className="px-6 py-4">Nội dung</th>
                      <th className="px-6 py-4 text-center text-blue-600 dark:text-blue-400 font-bold">Điểm số</th>
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
                                <p className="text-gray-500 font-medium">Chưa có kết quả điểm số nào để xếp hạng</p>
                                <p className="text-gray-400 text-sm mt-1">Chỉ những phần thi đã hoàn thành mới được xếp hạng</p>
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
                          <tr key={row.match_id || index} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors ${rankStyle}`}>
                            <td className="px-6 py-4 text-center font-bold text-lg">{rankBadge}</td>
                            <td className="px-6 py-4 text-center font-mono">T{row.match_no}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-base tracking-wide flex items-center gap-2">
                                {index === 0 && <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>}
                                {row.team_name || "-"}
                              </div>
                              <div className="text-xs opacity-75 mt-1 font-normal flex flex-wrap gap-1">
                                {row.athletes?.map((a, i) => (
                                  <span key={i} className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
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
                                          <span className="text-gray-500 font-medium">GĐ{jn}:</span>
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
                {paginatedData.map((row) => (
                  <TeamCard
                    key={row.match_id || row.match_no}
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
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {/* Page Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {startIndex + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {Math.min(endIndex, filteredData.length)}
                  </span>{" "}
                  trong tổng số{" "}
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
                                ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md"
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
                  <option value={6}>6 / trang</option>
                  <option value={12}>12 / trang</option>
                  <option value={24}>24 / trang</option>
                  <option value={48}>48 / trang</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
          title="Lên đầu trang"
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
      {openActions?.isOpen &&
        openActions?.key === Constants.ACTION_MATCH_RESULT && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className={`bg-white dark:bg-gray-900 rounded shadow-2xl ${openActions?.row?.match_type === 'VON' ? 'w-[1100px]' : 'w-[900px]'
              } max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700`}>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 px-6 py-4 flex justify-between items-center relative flex-shrink-0 shadow-md z-10">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white m-0">KẾT QUẢ</h2>
                  {openActions?.row?.match_type === 'VON' && (
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/30">
                      Võ Nhạc • 7 Giám định
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                  className="text-white hover:text-gray-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-white/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 p-6">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )}

      {/* Modal Cập nhật */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 px-6 py-4 flex justify-between items-center relative flex-shrink-0 shadow-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 m-0">
                CẬP NHẬT THÔNG TIN
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 p-6">
              {renderContentModal(openActions, modalProps)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm mới */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_CREATE && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-4 flex justify-between items-center relative flex-shrink-0 shadow-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 m-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                THÊM MỚI TRẬN ĐẤU
              </h2>
              <button
                onClick={() => setOpenActions({ ...openActions, isOpen: false })}
                className="text-white hover:text-gray-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 p-6">
              {renderContentModal(openActions, modalProps)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cấu hình */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_CONFIG && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 rounded shadow-2xl w-[1000px] max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 px-6 py-4 flex justify-between items-center relative flex-shrink-0 shadow-md z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 m-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                CẤU HÌNH HỆ THỐNG
              </h2>
              <button onClick={() => setOpenActions({ ...openActions, isOpen: false })} className="text-white hover:text-gray-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 p-6">
              {renderContentModal(openActions, modalProps)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Xoá */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_DELETE && (
        <Modal
          isOpen={true}
          onClose={() => setOpenActions({ ...openActions, isOpen: false })}
          title="Thông báo"
          headerClass="bg-red-500"
        >
          {renderContentModal(openActions, modalProps)}
        </Modal>
      )}

      {/* Modal Vào trận */}
      {openActions?.isOpen &&
        openActions?.key === Constants.ACTION_MATCH_START && (
          <Modal
            isOpen={true}
            onClose={() => setOpenActions({ ...openActions, isOpen: false })}
            title="Thông báo"
            headerClass="bg-blue-500"
          >
            {renderContentModal(openActions, modalProps)}
          </Modal>
        )}

      {/* Modal thông báo */}
      <ConfirmModal {...modalProps} />
    </div>
  );
}

// Component xác nhận xóa
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="space-y-6 p-4 rounded">
      {/* Icon cảnh báo */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      </div>

      {/* Tiêu đề */}
      {/* <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Xác nhận xóa</h3> */}

      {/* Nội dung */}
      <div className="text-center space-y-2">
        <p className="text-base text-gray-700 dark:text-gray-300">
          Bạn có chắc chắn muốn xóa dòng này?
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
          Hành động này không thể hoàn tác
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px] bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 min-w-[120px] bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

// Component Form cho format DOL/SOL/TUV/DAL
function DataFormOther({
  headers,
  row = null,
  onSubmit,
  onCancel,
  isCreate = false,
  sheetData,
  showAlert,
  soGiamDinh = 5,
}) {
  // match_type
  const match_type = sheetData?.data[0][0] || "DOL";

  // Xác định số VĐV từ row hiện tại hoặc match_type
  const getNumAthletesByType = (type) => {
    if (type === "DOL") return 1;
    if (type === "SOL" || type === "TUV") return 2;
    if (type === "DAL") return 4;
    return 1;
  };

  const initialMatchType = row?.match_type ?? match_type ?? "DOL";
  const initialNumAthletes =
    row?.athletes?.length ?? getNumAthletesByType(initialMatchType);

  const [numAthletes, setNumAthletes] = React.useState(initialNumAthletes);
  const [formData, setFormData] = React.useState({
    match_no: row?.match_no ?? sheetData.match_no ?? "",
    match_name: row?.match_name ?? sheetData.match_name ?? "",
    match_type: initialMatchType,
    match_status: row?.match_status || "WAI",
    team_name: row?.team_name ?? sheetData.match_no ?? "",
    scores: row?.scores || {},
    athletes:
      row?.athletes ||
      Array(initialNumAthletes)
        .fill(null)
        .map(() => ({ athlete_name: "", athlete_unit: "" })),
  });

  // Cập nhật số VĐV khi thay đổi loại nội dung
  const handleMatchTypeChange = (type) => {
    const num = getNumAthletesByType(type);
    setNumAthletes(num);
    const newAthletes = Array(num)
      .fill(null)
      .map((_, idx) => formData.athletes[idx] || { name: "", unit: "" });
    setFormData({ ...formData, match_type: type, athletes: newAthletes });
  };

  const handleAthleteChange = (index, field, value) => {
    const newAthletes = [...formData.athletes];
    newAthletes[index] = { ...newAthletes[index], [field]: value };
    setFormData({ ...formData, athletes: newAthletes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!formData.match_no) {
      showAlert("Vui lòng điền Mã số!");
      return;
    }

    // Kiểm tra ít nhất 1 VĐV có tên
    const hasAthlete = formData.athletes.some(
      (a) => a.athlete_name && a.athlete_name.trim(),
    );
    if (!hasAthlete) {
      showAlert("Vui lòng điền ít nhất 1 VĐV!");
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAI":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "IN":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "FIN":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
      case "CAN":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái: Thông tin chung & Trạng thái */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Thông tin chung
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    STT <span className="text-red-500">*</span>
                  </label>
                  <input
                    readOnly={!isCreate}
                    id="match_no"
                    type="text"
                    value={formData.match_no}
                    onChange={(e) =>
                      setFormData({ ...formData, match_no: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow disabled:bg-gray-100 read-only:bg-gray-100 dark:read-only:bg-gray-900"
                    placeholder="Nhập STT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={formData.match_status}
                    onChange={(e) =>
                      setFormData({ ...formData, match_status: e.target.value })
                    }
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow ${getStatusColor(formData.match_status)}`}
                  >
                    <option value="WAI">Chờ thi đấu</option>
                    <option value="IN">Đang diễn ra</option>
                    <option value="FIN">Kết thúc</option>
                    <option value="CAN">Hủy bỏ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nội dung thi
                </label>
                <input
                  readOnly={!isCreate}
                  id="match_name"
                  type="text"
                  value={formData.match_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, match_name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow read-only:bg-gray-100 dark:read-only:bg-gray-900"
                  placeholder="Nhập nội dung thi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => {
                    // Cập nhật đơn vị cho tất cả VĐV
                    const newAthletes = formData.athletes.map((a) => ({
                      ...a,
                      athlete_unit: e.target.value,
                    }));
                    setFormData({
                      ...formData,
                      athletes: newAthletes,
                      team_name: e.target.value,
                    });
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow"
                  placeholder="Nhập đơn vị"
                />
              </div>
            </div>
          </section>

          {/* Cập nhật điểm */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 mt-8">
              Thông tin điểm số
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
                {Array.from({ length: formData.match_type === "VON" ? 7 : soGiamDinh }).map((_, i) => {
                  let judgeLabel = `Giám định ${i + 1}`;
                  if (formData.match_type === "VON") {
                    if (i === 0 || i === 1) judgeLabel = `GĐ ${i + 1} (Chuyên môn)`;
                    else if (i === 2 || i === 3) judgeLabel = `GĐ ${i + 1} (Nghệ thuật)`;
                    else if (i === 4 || i === 5) judgeLabel = `GĐ ${i + 1} (Thực hiện)`;
                    else if (i === 6) judgeLabel = `GĐ 7 (TT Trưởng)`;
                  }

                  return (
                    <div key={`judge-${i}`}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {judgeLabel}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.scores?.[`judge${i + 1}`] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);

                          // Cập nhật điểm và tính lại tổng điểm
                          const newScores = { ...formData.scores, [`judge${i + 1}`]: val };
                          const currentTotalJudges = formData.match_type === "VON" ? 7 : soGiamDinh;
                          const judgeScores = [];
                          let hasInput = false;
                          for (let j = 1; j <= currentTotalJudges; j++) {
                            const jScore = newScores[`judge${j}`];
                            if (jScore !== undefined && jScore !== "") {
                              hasInput = true;
                            }
                            judgeScores.push(Number(jScore || 0));
                          }

                          if (hasInput) {
                            let total = 0;
                            if (formData.match_type === "VON") {
                              const chuyenMonAvg = (judgeScores[0] + judgeScores[1]) / 2;
                              const ngheThuatAvg = (judgeScores[2] + judgeScores[3]) / 2;
                              const thucHienAvg = (judgeScores[4] + judgeScores[5]) / 2;
                              const trongTaiTruong = judgeScores[6];
                              total = chuyenMonAvg * 0.3 + ngheThuatAvg * 0.3 + thucHienAvg * 0.3 + trongTaiTruong * 0.1;
                            } else if (soGiamDinh === 5) {
                              const minScore = Math.min(...judgeScores);
                              const maxScore = Math.max(...judgeScores);
                              total = judgeScores.reduce((acc, curr) => acc + curr, 0) - minScore - maxScore;
                            } else {
                              total = judgeScores.reduce((acc, curr) => acc + curr, 0);
                            }
                            newScores.total = Number(total.toFixed(2));
                          }

                          setFormData({
                            ...formData,
                            scores: newScores,
                          });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow text-gray-900 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tổng điểm chính thức
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.scores?.total ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setFormData({
                        ...formData,
                        scores: { ...formData.scores, total: val },
                      });
                    }}
                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold text-gray-900 dark:text-gray-100 transition-shadow"
                    placeholder="Nhập tổng điểm..."
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Điểm tổng tự động tính. Nếu cần sửa ngoại lệ, bạn có thể gõ đè trực tiếp ô này.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Cột phải: Danh sách VĐV */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              Danh sách Vận Động Viên ({formData.athletes.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {formData.athletes.map((athlete, idx) => (
                <div key={`athlete-form-${idx}`} className="flex gap-3 items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-800">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={athlete.athlete_name}
                      onChange={(e) =>
                        handleAthleteChange(idx, "athlete_name", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 transition-shadow placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder={`Họ tên VĐV ${idx + 1}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {row ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}

// Component xác nhận action
function ActionConfirm({ message, onConfirm, onCancel }) {
  return (
    <div className="space-y-6 p-4 rounded">
      {/* Icon thông tin */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tiêu đề */}
      {/* <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Xác nhận</h3> */}

      {/* Nội dung */}
      <div className="text-center">
        <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
          {message}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px] bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 min-w-[120px] bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
}

// Component form kết quả cho format DOL/SOL/TUV/DAL
function VonResultForm({ row, onCancel }) {
  const scores = row?.scores || {};
  const hasScores = scores && Object.keys(scores).length > 0;

  // Công thức Võ Nhạc:
  // - Chuyên môn (GD1, GD2): avg * 0.3
  // - Nghệ thuật (GD3, GD4): avg * 0.3
  // - Thực hiện (GD5, GD6): avg * 0.3
  // - Trọng tài trưởng (GD7): * 0.1
  const j1 = Number(scores.judge1 || 0);
  const j2 = Number(scores.judge2 || 0);
  const j3 = Number(scores.judge3 || 0);
  const j4 = Number(scores.judge4 || 0);
  const j5 = Number(scores.judge5 || 0);
  const j6 = Number(scores.judge6 || 0);
  const j7 = Number(scores.judge7 || 0);

  const avgCM = (j1 + j2) / 2;
  const avgNT = (j3 + j4) / 2;
  const avgTH = (j5 + j6) / 2;
  const totalCalc = (avgCM * 0.3 + avgNT * 0.3 + avgTH * 0.3 + j7 * 0.1);

  const categories = [
    {
      label: 'Chuyên môn',
      weight: '30%',
      color: 'blue',
      judges: [
        { label: 'GĐ 1', score: j1 },
        { label: 'GĐ 2', score: j2 },
      ],
      avg: avgCM,
      weighted: (avgCM * 0.3),
    },
    {
      label: 'Nghệ thuật',
      weight: '30%',
      color: 'blue',
      judges: [
        { label: 'GĐ 3', score: j3 },
        { label: 'GĐ 4', score: j4 },
      ],
      avg: avgNT,
      weighted: (avgNT * 0.3),
    },
    {
      label: 'Thực hiện',
      weight: '30%',
      color: 'blue',
      judges: [
        { label: 'GĐ 5', score: j5 },
        { label: 'GĐ 6', score: j6 },
      ],
      avg: avgTH,
      weighted: (avgTH * 0.3),
    },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', header: 'bg-blue-600', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300', score: 'text-blue-700 dark:text-blue-300', avg: 'text-blue-800 dark:text-blue-200' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', header: 'bg-purple-600', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300', score: 'text-purple-700 dark:text-purple-300', avg: 'text-purple-800 dark:text-purple-200' },
    green: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', header: 'bg-green-600', badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300', score: 'text-green-700 dark:text-green-300', avg: 'text-green-800 dark:text-green-200' },
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 mx-auto p-5">
      {/* Match Info */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-center font-bold text-xl text-gray-900 dark:text-gray-100 uppercase tracking-widest">
          {row?.match_name || row?.match_type}
        </p>
        <div className="flex items-center justify-center gap-4 text-sm mt-2">
          <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {row?.team_name}
          </span>
          <span className="text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-4">
            STT: {row?.match_no}
          </span>
        </div>
      </div>

      {hasScores ? (
        <>
          {/* 3 Category blocks */}
          <div className="grid grid-cols-3 gap-4">
            {categories.map((cat) => {
              const c = colorMap[cat.color];
              return (
                <div key={cat.label} className={`rounded border ${c.border} ${c.bg} overflow-hidden`}>
                  {/* Category header */}
                  <div className={`${c.header} px-3 py-2 flex items-center justify-between`}>
                    <span className="text-white font-bold text-sm">{cat.label}</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">{cat.weight}</span>
                  </div>
                  {/* Judges */}
                  <div className="p-3 space-y-2">
                    {cat.judges.map((j) => (
                      <div key={j.label} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{j.label}</span>
                        <span className={`text-xl font-bold ${c.score}`}>{j.score.toFixed(1)}</span>
                      </div>
                    ))}
                    {/* Average */}
                    <div className={`mt-2 pt-2 border-t ${c.border} flex items-center justify-between`}>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Trung bình</span>
                      <span className={`text-2xl font-black ${c.avg}`}>{cat.avg.toFixed(1)}</span>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">× {cat.weight}</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{cat.weighted.toFixed(1)}</span>
                    </div> */}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TT Truong + Total row */}
          <div className="grid grid-cols-2 gap-4">
            {/* GD7 - Trọng tài trưởng */}
            <div className="rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 overflow-hidden">
              <div className="bg-blue-500 px-3 py-2 flex items-center justify-between">
                <span className="text-white font-bold text-sm">Trọng tài trưởng</span>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">10%</span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">GĐ 7</span>
                  <span className="text-3xl font-black text-blue-700 dark:text-blue-300">{j7.toFixed(1)}</span>
                </div>
                {/* <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">× 10%</span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{(j7 * 0.1).toFixed(1)}</span>
                </div> */}
              </div>
            </div>

            {/* Tổng điểm */}
            <div className="rounded border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/40 dark:to-orange-950/40 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-2">
                <span className="text-white font-bold text-sm">TỔNG ĐIỂM CHÍNH THỨC</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500">
                  {(scores.total ?? totalCalc).toFixed(1)}
                </p>
                {/* <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  = CM×0.3 + NT×0.3 + TH×0.3 + TT×0.1
                </p> */}
              </div>
            </div>
          </div>

          {/* Chi tiết bảng */}
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Hạng mục</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 1</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 2</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 3</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 4</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 5</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 6</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">GĐ 7</th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">Tổng</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Võ Nhạc</td>
                  {[j1, j2, j3, j4, j5, j6, j7].map((s, i) => (
                    <td key={i} className="py-3 px-3 text-center font-bold text-blue-600 dark:text-blue-400">{s.toFixed(1)}</td>
                  ))}
                  <td className="py-3 px-4 text-right font-black text-orange-600 dark:text-orange-400 text-base">
                    {(scores.total ?? totalCalc).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              KẾT QUẢ ĐÃ HOÀN THÀNH
            </span>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 p-8 rounded flex flex-col items-center justify-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Chưa có kết quả điểm số</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Trận đấu này chưa được chấm điểm.</p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

// Component form kết quả cho format DOL/SOL/TUV/DAL
function ResultForm({ row, onSubmit, onCancel }) {
  const scores = row?.scores || {};
  const soGiamDinh = row?.config_system?.so_giam_dinh || 3;
  const hasScores = scores && Object.keys(scores).length > 0;

  return (
    <div className="space-y-8 bg-white dark:bg-gray-900 max-w-4xl mx-auto p-4">
      {/* Match Info */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-3">
          <p className="text-center font-bold text-xl text-gray-900 dark:text-gray-100 uppercase tracking-widest">
            {row?.match_name || row?.match_type}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {row?.team_name}
            </span>
            <span className="text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-4">
              STT: {row?.match_no}
            </span>
          </div>
        </div>
      </div>

      {hasScores ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Điểm Giám Định
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          </div>

          {/* Judge Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(() => {
              // Tính toán selectedMaxIndex và selectedMinIndex
              let selectedMaxIndex = -1;
              let selectedMinIndex = -1;

              if (soGiamDinh === 5) {
                const allScores = [
                  scores.judge1 || 0,
                  scores.judge2 || 0,
                  scores.judge3 || 0,
                  scores.judge4 || 0,
                  scores.judge5 || 0,
                ];

                const maxScore = Math.max(...allScores);
                const minScore = Math.min(...allScores);
                const hasNonZeroScores = allScores.some((s) => s > 0);

                if (hasNonZeroScores) {
                  const maxIndices = allScores
                    .map((score, idx) => ({ score: Number(score), idx }))
                    .filter((item) => item.score === Number(maxScore))
                    .map((item) => item.idx);

                  const minIndices = allScores
                    .map((score, idx) => ({ score: Number(score), idx }))
                    .filter(
                      (item) => item.score === Number(minScore) && item.score > 0,
                    )
                    .map((item) => item.idx);

                  if (maxIndices.length > 0) {
                    selectedMaxIndex =
                      maxIndices.length > 1
                        ? maxIndices[Math.floor(Math.random() * maxIndices.length)]
                        : maxIndices[0];
                  }

                  if (minIndices.length > 0) {
                    selectedMinIndex =
                      minIndices.length > 1
                        ? minIndices[Math.floor(Math.random() * minIndices.length)]
                        : minIndices[0];
                  }
                }
              }

              return Array.from({ length: soGiamDinh }).map((_, index) => {
                const judgeIndex = index + 1;
                const judgeScore = scores[`judge${judgeIndex}`] || 0;

                const isHighest = index === selectedMaxIndex;
                const isLowest = index === selectedMinIndex;
                const isGrayed = isHighest || isLowest;

                const styleWrapper = isGrayed
                  ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60 grayscale-[50%]"
                  : "bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700/50 shadow-sm ring-1 ring-black/5 hover:ring-blue-500/20";

                const textColor = isGrayed ? "text-gray-400" : "text-blue-500 dark:text-blue-400";
                const scoreColor = isGrayed ? "text-gray-500 dark:text-gray-400 font-semibold text-2xl" : "text-gray-900 dark:text-gray-100 font-bold text-3xl";

                return (
                  <div key={judgeIndex} className={`relative flex flex-col justify-center items-center p-4 rounded transition-all duration-300 ${styleWrapper}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textColor}`}>
                      Giám định {judgeIndex}
                    </p>
                    <p className={scoreColor}>
                      {judgeScore}
                    </p>
                    {isGrayed && (
                      <span className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 text-gray-500 text-[10px] px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 font-semibold shadow-sm">
                        Bỏ
                      </span>
                    )}
                  </div>
                );
              });
            })()}

            {/* Total Score */}
            <div className="relative flex flex-col justify-center items-center p-4 rounded bg-gradient-to-br from-yellow-400/10 to-orange-500/10 dark:from-yellow-500/5 dark:to-orange-500/5 border border-yellow-300 dark:border-yellow-700/50 shadow-sm ring-2 ring-yellow-400/20">
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">
                Tổng Điểm
              </p>
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500 drop-shadow-sm">
                {scores.total || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              Chi Tiết Tổng Hợp
            </h3>
            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          </div>

          {/* Score Details Table */}
          <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    Vị Trí Giám Định
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                    Điểm Số
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: soGiamDinh }).map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      Giám định {index + 1}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {scores[`judge${index + 1}`] || 0}
                    </td>
                  </tr>
                ))}
                <tr className="bg-orange-50/30 dark:bg-orange-900/10">
                  <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    TỔNG ĐIỂM CHÍNH THỨC
                  </td>
                  <td className="py-4 px-4 text-right font-black text-orange-600 dark:text-orange-400 text-xl">
                    {scores.total || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mt-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              KẾT QUẢ ĐÃ HOÀN THÀNH
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 p-8 rounded flex flex-col items-center justify-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            Chưa có kết quả điểm số
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Trận đấu này chưa được chấm điểm hoặc giám định chưa tổng hợp.</p>
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-end pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
