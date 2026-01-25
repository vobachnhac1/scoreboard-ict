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
import ConfirmModal from "../../../components/common/ConfirmModal";

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
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
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
      color: "bg-blue-100 text-blue-800 border-blue-300",
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
      color: "bg-green-100 text-green-800 border-green-300",
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
      color: "bg-red-100 text-red-800 border-red-300",
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
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-300",
      gradient: "from-purple-50 to-purple-100",
      name: "Đối Luyện",
    },
    SOL: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
      gradient: "from-green-50 to-green-100",
      name: "Song Luyện",
    },
    TUV: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-300",
      gradient: "from-orange-50 to-orange-100",
      name: "Tự Vệ",
    },
    DAL: {
      bg: "bg-pink-100",
      text: "text-pink-700",
      border: "border-pink-300",
      gradient: "from-pink-50 to-pink-100",
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
        className="bg-white rounded shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden group"
        onDoubleClick={() => onDoubleClick(row)}
      >
        <div className="flex items-center gap-4 p-4">
          {/* STT */}
          <div className="flex-shrink-0">
            <div
              className={`bg-gradient-to-r ${typeColor.gradient} ${typeColor.border} border-2 text-gray-800 rounded px-4 py-2 font-bold text-base shadow-md min-w-[80px] text-center`}
            >
              #{row.match_no}
            </div>
          </div>

          {/* Nội dung thi */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div
              className={`px-3 py-1.5 rounded font-bold text-xs ${typeColor.bg} ${typeColor.text} border-2 ${typeColor.border}`}
            >
              {row.match_name || typeColor.name}
            </div>
          </div>

          {/* VĐV tham gia */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-1">VĐV tham gia:</div>
            {row.athletes && row.athletes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {row.athletes.slice(0, 3).map((athlete, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-blue-700 text-sm truncate max-w-[150px]">
                      {athlete.athlete_name}
                    </span>
                  </div>
                ))}
                {row.athletes.length > 3 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{row.athletes.length - 3} khác
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-sm">Chưa có VĐV</span>
            )}
          </div>

          {/* Đơn vị */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div className="text-xs text-gray-500 mb-1">Đơn vị:</div>
            <div
              className={`px-3 py-1 rounded font-semibold text-sm ${typeColor.bg} ${typeColor.text}`}
            >
              {row.team_name || "-"}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="flex-shrink-0">
            <div
              className={`px-3 py-1.5 rounded font-semibold text-xs border-2 ${currentStatus.color} flex items-center gap-1.5 whitespace-nowrap`}
            >
              <span>{currentStatus.icon}</span>
              <span>{currentStatus.label}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {listActions
              .filter((action) => availableActions.includes(action.key))
              .map((action) => (
                <button
                  onClick={() => action.callback(row)}
                  key={action.key}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 whitespace-nowrap ${action.color}`}
                >
                  {action.icon}
                  <span className="hidden xl:inline">{action.btnText}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Card layout
  return (
    <div
      className="bg-white rounded shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
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
              #{row.match_no}
            </div>
            <div
              className={`px-3 py-1 rounded font-bold text-xs ${typeColor.bg} ${typeColor.text}`}
            >
              {row.match_name || typeColor.name}
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded font-semibold text-xs border-2 ${currentStatus.color} flex items-center gap-1.5`}
          >
            <span>{currentStatus.icon}</span>
            <span>{currentStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Body - Thông tin VĐV và Đơn vị */}
      <div className="p-5">
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-4 border-2 border-blue-200 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-700"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">
              VĐV tham gia
            </h3>
            {row.athletes && row.athletes.length > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {row.athletes.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {row.athletes && row.athletes.length > 0 ? (
              row.athletes.map((athlete, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white rounded p-2 shadow-sm"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-blue-900 truncate">
                      {athlete.athlete_name || "-"}
                    </div>
                    {athlete.athlete_unit && (
                      <div className="text-xs text-blue-600">
                        {athlete.athlete_unit}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-2">Chưa có VĐV</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
          {listActions
            .filter((action) => availableActions.includes(action.key))
            .map((action) => (
              <button
                onClick={() => action.callback(row)}
                key={action.key}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${action.color}`}
              >
                {action.icon}
                {action.btnText}
              </button>
            ))}
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
              <div key={idx} className="flex items-center gap-2">
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
      console.log("row: ", row, formData);

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

      // 3. Nếu có match_id, cập nhật match_status vào database
      if (row.match_id) {
        await axios.put(
          `http://localhost:6789/api/competition-match/${row.match_id}/status`,
          {
            status: formData.match_status,
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
    try {
      console.log(
        "🚀 CompetitionDataDetailOrther - handleMatchStart - row:",
        row,
      );
      console.log(
        "🚀 CompetitionDataDetailOrther - handleMatchStart - configSystem:",
        configSystem,
      );
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

      console.log(
        "🚀 CompetitionDataDetailOrther - Navigating with matchData:",
        matchData,
      );

      // Chuyển sang màn hình thi đấu với state
      navigate("/scoreboard/vovinam-score", {
        state: {
          matchData,
          returnUrl: `/management/competition-data-other/${id}`,
        },
      });
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

      // Nếu có match_id, thêm vào history
      if (row.match_id) {
        await axios.post(
          `http://localhost:6789/api/competition-match-team/${row.match_id}/history`,
          historyData,
        );
      }

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
        return (
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
          />
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
      <div className="p-6 bg-white  shadow">
        <div className="text-center py-8">
          <div className="inline-block animate-spin  h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!sheetData) {
    return (
      <div className="p-6 bg-white  shadow">
        <div className="text-center py-12 bg-gray-50 ">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="mt-2 text-sm text-gray-600">Không tìm thấy dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate("/management/general-setting/competition-management")
          }
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
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

        <h2 className="text-2xl font-bold mb-4">
          {sheetData?.sheet_name || "Đang tải..."}
        </h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            File: {sheetData?.file_name || "-"} | Tổng số dòng: {rows.length}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-yellow-700 uppercase">
                Chờ
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {tableData.filter((r) => r.match_status === "WAI").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-blue-700 uppercase">
                Đang thi
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {tableData.filter((r) => r.match_status === "IN").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-green-700 uppercase">
                Kết thúc
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {tableData.filter((r) => r.match_status === "FIN").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-red-700 uppercase">
                Hủy
              </span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {tableData.filter((r) => r.match_status === "CAN").length}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - Filter, Sort, View Mode */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded p-4 mb-6 shadow-sm border border-gray-200">
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
              className="px-4 py-2 border min-w-[150px] border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              className="px-4 py-2 border min-w-[150px] border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="ALL">Tất cả nội dung</option>
              <option value="DOL">Đối Luyện</option>
              <option value="SOL">Song Luyện</option>
              <option value="TUV">Tự Vệ</option>
              <option value="DAL">Đả Luyện</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border min-w-[150px] border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="match_no">Sắp xếp: STT</option>
              <option value="status">Sắp xếp: Trạng thái</option>
              <option value="type">Sắp xếp: Nội dung</option>
            </select>
          </div>

          {/* Right: View Mode & Stats */}
          <div className="flex items-center gap-3">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded border border-blue-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
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
              <span className="text-sm font-semibold text-blue-700">
                {filteredData.length} / {tableData.length}
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded border border-gray-300 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Grid View"
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
                className={`p-2 rounded transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="List View"
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
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid/List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
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
            <p className="mt-4 text-lg font-medium text-gray-600">
              Không tìm thấy dữ liệu nào
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi bộ lọc hoặc tìm kiếm
            </p>
          </div>
        ) : (
          <>
            {/* Cards */}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                {/* Page Info */}
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold text-gray-900">
                    {startIndex + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(endIndex, filteredData.length)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredData.length}
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600"
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
                              className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                                page === pageNum
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600"
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
                            <span key={pageNum} className="px-2 text-gray-400">
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
                    className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600"
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
                  className="px-3 py-2 border border-gray-300 rounded bg-white text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded shadow-2xl w-[900px] max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header - Căn giữa */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">KẾT QUẢ</h2>
                <button
                  onClick={() =>
                    setOpenActions({ ...openActions, isOpen: false })
                  }
                  className="text-white hover:text-gray-300 transition-colors absolute right-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderContentModal(openActions, modalProps)}
              </div>
            </div>
          </div>
        )}

      {/* Modal Cập nhật */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header - Căn giữa */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg> */}
                CẬP NHẬT THÔNG TIN
              </h2>
              <button
                onClick={() =>
                  setOpenActions({ ...openActions, isOpen: false })
                }
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContentModal(openActions, modalProps)}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm mới */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_CREATE && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-2xl w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-center items-center relative flex-shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                THÊM MỚI TRẬN ĐẤU
              </h2>
              <button
                onClick={() =>
                  setOpenActions({ ...openActions, isOpen: false })
                }
                className="text-white hover:text-gray-300 transition-colors absolute right-6"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-600"
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
      {/* <h3 className="text-xl font-bold text-gray-900 text-center">Xác nhận xóa</h3> */}

      {/* Nội dung */}
      <div className="text-center space-y-2">
        <p className="text-base text-gray-700">
          Bạn có chắc chắn muốn xóa dòng này?
        </p>
        <p className="text-sm text-red-600 font-semibold">
          ⚠️ Hành động này không thể hoàn tác
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px] bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 min-w-[120px] bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-all shadow-md hover:shadow-lg"
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
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "IN":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "FIN":
        return "bg-green-100 text-green-800 border-green-300";
      case "CAN":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* STT */}

      {/* STT - Nội dung thi nằm chung hàng */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập STT"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập nội dung thi"
          />
        </div>
      </div>

      {/* Đơn vị */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
          className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nhập đơn vị"
        />
      </div>

      {/* Danh sách VĐV */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Danh sách VĐV <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.athletes.map((athlete, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded border-2 border-blue-200 hover:border-blue-400 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Số thứ tự */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-base font-bold shadow-lg">
                    {idx + 1}
                  </span>
                </div>

                {/* Thông tin VĐV */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Họ tên VĐV {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={athlete.athlete_name}
                    onChange={(e) =>
                      handleAthleteChange(idx, "athlete_name", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder={`Nhập họ tên VĐV ${idx + 1}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trạng thái */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Trạng thái <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.match_status}
          onChange={(e) =>
            setFormData({ ...formData, match_status: e.target.value })
          }
          className={`w-full px-4 py-3 border-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(formData.match_status)}`}
        >
          <option value="WAI">Chờ thi đấu</option>
          <option value="IN">Đang diễn ra</option>
          <option value="FIN">Kết thúc</option>
          <option value="CAN">Hủy bỏ</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" type="submit">
          {row ? "Cập nhật" : "Thêm mới"}
        </Button>
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
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-600"
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
      {/* <h3 className="text-xl font-bold text-gray-900 text-center">Xác nhận</h3> */}

      {/* Nội dung */}
      <div className="text-center">
        <p className="text-base text-gray-700 font-medium">{message}</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px] bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Đồng ý
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
    <div className="space-y-6">
      {/* Match Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded shadow-lg border-2 border-blue-400">
        <div className="text-white space-y-2">
          <p className="text-center font-bold text-xl">
            {row?.match_name || row?.match_type}
          </p>
          <p className="text-center font-semibold text-lg">{row?.team_name}</p>
          <p className="text-center text-sm opacity-90">STT: {row?.match_no}</p>
        </div>
      </div>

      {hasScores ? (
        <>
          {/* Scores Display */}
          <div className="bg-white p-6 rounded shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              KẾT QUẢ THI
            </h3>

            {/* Judge Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {/* Render JudgeScores */}

              {(() => {
                // Tính toán selectedMaxIndex và selectedMinIndex một lần duy nhất
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
                    // Tìm tất cả các index có điểm cao nhất
                    const maxIndices = allScores
                      .map((score, idx) => ({ score: Number(score), idx }))
                      .filter((item) => item.score === Number(maxScore))
                      .map((item) => item.idx);

                    // Tìm tất cả các index có điểm thấp nhất
                    const minIndices = allScores
                      .map((score, idx) => ({ score: Number(score), idx }))
                      .filter(
                        (item) =>
                          item.score === Number(minScore) && item.score > 0,
                      )
                      .map((item) => item.idx);

                    // Random chọn 1 index từ danh sách điểm cao nhất
                    if (maxIndices.length > 0) {
                      selectedMaxIndex =
                        maxIndices.length > 1
                          ? maxIndices[
                              Math.floor(Math.random() * maxIndices.length)
                            ]
                          : maxIndices[0];
                    }

                    // Random chọn 1 index từ danh sách điểm thấp nhất
                    if (minIndices.length > 0) {
                      selectedMinIndex =
                        minIndices.length > 1
                          ? minIndices[
                              Math.floor(Math.random() * minIndices.length)
                            ]
                          : minIndices[0];
                    }
                  }
                }

                // Render các judge scores
                return Array.from({ length: soGiamDinh }).map((_, index) => {
                  const judgeIndex = index + 1;
                  const judgeScore = scores[`judge${judgeIndex}`] || 0;

                  const isHighest = index === selectedMaxIndex;
                  const isLowest = index === selectedMinIndex;
                  const isGrayed = isHighest || isLowest;

                  const cardBgColor = isGrayed
                    ? "bg-gradient-to-br from-gray-200 to-gray-300"
                    : "bg-gradient-to-br from-sky-50 to-sky-100";
                  const borderColor = isGrayed
                    ? "border-gray-400"
                    : "border-sky-300";
                  const textColor = isGrayed ? "text-gray-700" : "text-sky-800";
                  const scoreColor = isGrayed
                    ? "text-gray-800"
                    : "text-sky-900";

                  return (
                    <div key={judgeIndex} className="relative group">
                      <div
                        className={`${cardBgColor} p-4 rounded border-2 ${borderColor} shadow-md`}
                      >
                        <div className="text-center">
                          <p className={`text-xs font-bold ${textColor} mb-2`}>
                            GIÁM ĐỊNH {judgeIndex}
                          </p>
                          <p className={`text-3xl font-black ${scoreColor}`}>
                            {judgeScore}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Total Score */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 p-4 rounded border-4 border-yellow-400 shadow-2xl h-full flex flex-col items-center justify-center">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-600 px-3 py-1 rounded-full border-2 border-yellow-300 shadow-lg">
                    <p className="text-xs font-black tracking-widest text-white">
                      TỔNG
                    </p>
                  </div>
                  <p className="text-4xl font-black text-white drop-shadow-2xl mt-2">
                    {scores.total || 0}
                  </p>

                  {/* Decorative stars */}
                  <div className="absolute top-1 left-1 text-yellow-300 text-sm">
                    ⭐
                  </div>
                  <div className="absolute top-1 right-1 text-yellow-300 text-sm">
                    ⭐
                  </div>
                  <div className="absolute bottom-1 left-1 text-yellow-300 text-sm">
                    ⭐
                  </div>
                  <div className="absolute bottom-1 right-1 text-yellow-300 text-sm">
                    ⭐
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details Table */}
            <div className="bg-gray-50 rounded p-4 border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-3 font-bold text-gray-700">
                      Giám định
                    </th>
                    <th className="text-center py-2 px-3 font-bold text-gray-700">
                      Điểm
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: soGiamDinh }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-2 px-3 font-semibold text-gray-700">
                        Giám định {index + 1}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-sky-700">
                        {scores[`judge${index + 1}`] || 0}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-orange-100 border-t-2 border-orange-300">
                    <td className="py-3 px-3 font-black text-gray-800 text-lg">
                      TỔNG ĐIỂM
                    </td>
                    <td className="py-3 px-3 text-center font-black text-orange-700 text-2xl">
                      {scores.total || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 !rounded shadow-lg border-2 border-green-300">
              <p className="text-white font-bold text-lg flex items-center gap-2">
                HOÀN THÀNH
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-bold text-yellow-800">
                Chưa có kết quả
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-center pt-4 border-t-2 border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          className="min-w-40 bg-gray-500 hover:bg-gray-600 text-white"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
