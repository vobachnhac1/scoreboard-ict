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
import { useTranslation } from "react-i18next";

// Component Card cho mỗi đội/VĐV thi đấu
function TeamCard({
  row,
  listActions,
  getActionsByStatus,
  onDoubleClick,
  viewMode = "grid",
}) {
  const { t } = useTranslation();
  const status = row.match_status || "WAI";
  const statusConfig = {
    WAI: {
      label: t("competition_data_other.status_waiting"),
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
      label: t("competition_data_other.status_in_progress"),
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
      label: t("competition_data_other.status_finished"),
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
      label: t("competition_data_other.status_cancelled"),
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
      name: t("competition_data_other.type_doi_luyen"),
    },
    SOL: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-300 dark:border-green-700",
      name: t("competition_data_other.type_song_luyen"),
    },
    TUV: {
      bg: "bg-orange-100 dark:bg-orange-900",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
      name: t("competition_data_other.type_tu_ve"),
    },
    DAL: {
      bg: "bg-pink-100 dark:bg-pink-900",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-300 dark:border-pink-700",
      name: t("competition_data_other.type_da_luyen"),
    },
  };

  const currentStatus = statusConfig[status] || statusConfig["WAI"];
  const typeColor = typeColors[row.match_type] || typeColors["DOL"];
  const availableActions = getActionsByStatus(status, row.match_type);

  // List View - Compact horizontal layout
  if (viewMode === "list") {
    return (
      <div
        className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden group relative flex h-full"
        onDoubleClick={() => onDoubleClick(row)}
      >
        <div className="flex items-center gap-4 p-4 w-full">
          {/* STT */}
          <div className="flex-shrink-0">
            <div
              className={`${typeColor.bg} ${typeColor.text} ${typeColor.border} border-1 rounded px-4 py-2 font-bold text-base min-w-[50px] text-center`}
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
              {t("competition_data_other.athletes_participating")}:
            </div>
            {row.athletes && row.athletes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {row.athletes.slice(0, 3).map((athlete, idx) => (
                  <div
                    key={`${row.match_id || row.match_no || "match"}-athlete-${idx}`}
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
                    +{row.athletes.length - 3} {t("competition_data_other.others")}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-sm">
                {t("competition_data_other.no_athletes")}
              </span>
            )}
          </div>

          {/* Đơn vị */}
          <div className="flex-shrink-0 min-w-[120px]">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {t("competition_data_other.unit")}:
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
                      border
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
      className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden group relative flex flex-col h-full"
      onDoubleClick={() => onDoubleClick(row)}
    >
      {/* Header - STT và Trạng thái */}
      <div
        className={`${typeColor.bg} px-4 py-3 border-b-2 ${typeColor.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`${typeColor.bg} ${typeColor.text} border-2 ${typeColor.border} rounded px-3 py-1.5 font-bold text-sm`}
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
            className={`${typeColor.bg} rounded p-4 border-2 ${typeColor.border} mb-4`}
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
                {t("competition_data_other.unit")}
              </h3>
            </div>
            <div className={`font-bold ${typeColor.text} text-lg`}>
              {row.team_name || "-"}
            </div>
          </div>

          {/* VĐV tham gia */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded p-4 border-2 border-blue-200 dark:border-blue-700 mb-4">
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
                {t("competition_data_other.athletes_participating")}
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
                    key={`${row.match_id || row.match_no || "match"}-athlete-card-${idx}`}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded p-2"
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
                  {t("competition_data_other.no_athletes")}
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
                      border
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
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate("/management/general-setting/competition-management")
          }
          className="group mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all w-fit"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{t("competition_data_other.back")}</span>
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {sheetData?.sheet_name || t("competition_data_other.loading")}
        </h2>
        <div className="flex items-center gap-1 mb-8 bg-blue-50/50 dark:bg-blue-900/10 p-1.5 rounded w-fit border border-blue-100 dark:border-blue-800/30">
          <button
            onClick={() => setActiveTab("matches")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "matches"
              ? "bg-blue-600 text-white"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t('competition_data_other.match_list')}
          </button>
          <button
            onClick={() => setActiveTab("referrers")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "referrers"
              ? "bg-blue-600 text-white"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t('competition_data_other.referee_allocation_tab')}
          </button>
        </div>
      </div>

      {activeTab === "matches" ? (
        <>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded p-5 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest">{t("competition_data_other.status_waiting_badge")}</span>
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-200">
                {tableData.filter((r) => r.match_status === "WAI").length}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded p-5 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest">{t("competition_data_other.status_competing_badge")}</span>
              </div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-200">
                {tableData.filter((r) => r.match_status === "IN").length}
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-5 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest">{t("competition_data_other.status_finished_badge")}</span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-200">
                {tableData.filter((r) => r.match_status === "FIN").length}
              </div>
            </div>
          </div>


          {/* Toolbar - Filter, Sort, View Mode */}
          <div className="bg-white dark:bg-gray-800 rounded p-3 mb-4 border border-blue-50 dark:border-blue-900/30">
            <div className="flex flex-row items-center justify-between gap-4">
              {/* Left: Search & Filter */}
              <div className="flex flex-row items-center gap-3 flex-1 overflow-x-auto no-scrollbar">
                {/* Search */}
                <div className="min-w-[200px] flex-1 max-w-xs">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    onSearch={handleSearch}
                    placeholder={t("competition_data_other.search_placeholder")}
                  />
                </div>

                {/* Filter Status */}
                <div className="relative group shrink-0">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-[11px] font-black text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none min-w-[130px]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
                  >
                    <option value="ALL">{t("competition_data_other.filter_all_status")}</option>
                    <option value="WAI">{t("competition_data_other.filter_waiting")}</option>
                    <option value="IN">{t("competition_data_other.filter_in_progress")}</option>
                    <option value="FIN">{t("competition_data_other.filter_finished")}</option>
                    <option value="CAN">{t("competition_data_other.filter_cancelled")}</option>
                  </select>
                </div>

                {/* Filter Type */}
                <div className="relative group shrink-0">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-[11px] font-black text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none min-w-[130px]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
                  >
                    <option value="ALL">{t("competition_data_other.filter_all_content")}</option>
                    <option value="DOL">{t("competition_data_other.type_doi_luyen")}</option>
                    <option value="SOL">{t("competition_data_other.type_song_luyen")}</option>
                    <option value="TUV">{t("competition_data_other.type_tu_ve")}</option>
                    <option value="DAL">{t("competition_data_other.type_da_luyen")}</option>
                    <option value="VON">{t("competition_data_other.type_vo_nhac")}</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="relative group shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-[11px] font-black text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none min-w-[130px]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
                  >
                    <option value="match_no">{t("competition_data_other.sort_by_stt")}</option>
                    <option value="status">{t("competition_data_other.sort_by_status")}</option>
                    <option value="type">{t("competition_data_other.sort_by_content")}</option>
                  </select>
                </div>
              </div>

              {/* Right: View Mode & Stats */}
              <div className="flex flex-row items-center gap-3 shrink-0">
                {/* Stats Counter */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-600 rounded text-white min-w-[100px] justify-center">
                  <span className="text-[10px] font-black uppercase opacity-80">{t('competition_data_other.column_stt')}:</span>
                  <span className="text-xs font-black">{filteredData.length}/{tableData.length}</span>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 p-1 rounded border border-blue-100 dark:border-blue-900/50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center justify-center h-8 w-8 rounded transition-all ${viewMode === "grid"
                      ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white"
                      : "text-blue-400 hover:text-blue-600"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center justify-center h-8 w-8 rounded transition-all ${viewMode === "list"
                      ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white"
                      : "text-blue-400 hover:text-blue-600"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="w-px h-4 bg-blue-100 dark:bg-blue-900 mx-1"></div>
                  <button
                    onClick={() => setViewMode("rank")}
                    className={`h-8 rounded transition-all flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-widest ${viewMode === "rank"
                      ? "bg-amber-500 text-white"
                      : "text-amber-600 hover:bg-amber-50"
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span>{t('competition_data_other.rank')}</span>
                  </button>
                </div>
              </div>
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
            )
            }
          </div >
        </>
      ) : (
        <RefereeAllocationSection
          availableReferees={availableReferees}
          initialReferrers={sheetData?.referrers || []}
          onSave={handleSaveReferrers}
          configSystem={configSystem}
          formatType={formatType}
        />
      )}

      {/* Scroll to Top Button */}
      {
        showScrollTop && (
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
        )
      }

      {/* Modal Kết quả */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_RESULT && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-2xl" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

          <div className={`relative bg-white dark:bg-gray-900 rounded-3xl ${openActions?.row?.match_type === 'VON' ? 'max-w-6xl' : 'max-w-4xl'} w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-yellow-500 dark:border-yellow-600`}>
            {/* Header */}
            <div className="relative px-6 py-4 bg-yellow-500 dark:bg-yellow-600 flex-shrink-0">

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
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
      )}

      {/* Modal Cập nhật */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_UPDATE && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-emerald-500 dark:border-emerald-600">
            {/* Header */}
            <div className="relative px-6 py-4 bg-emerald-500 dark:bg-emerald-600 flex-shrink-0">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
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
      )}

      {/* Modal Biên bản */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_REPORT && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh] border border-blue-500 dark:border-blue-600">
            {/* Header */}
            <div className="relative px-6 py-4 bg-blue-600 dark:bg-blue-700 flex-shrink-0">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
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
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2 backdrop-blur"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {t('competition_detail.modals.print_report')}
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
      )}

      {/* Modal Thêm mới */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_CREATE && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full mx-4 overflow-hidden flex flex-col border border-blue-500 dark:border-blue-600">
            {/* Header */}
            <div className="relative px-8 py-6 bg-blue-600 flex-shrink-0">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
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
      )}

      {/* Modal Cấu hình */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_CONFIG && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>

          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-6xl w-full mx-4 overflow-hidden flex flex-col border border-blue-500 dark:border-blue-600">
            {/* Header */}
            <div className="relative px-8 py-6 bg-blue-600 flex-shrink-0">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
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
      )}

      {/* Modal Xoá */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_DELETE && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full mx-4 overflow-hidden border border-rose-500">
            <div className="px-8 py-6 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
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
      )}

      {/* Modal Vào trận */}
      {openActions?.isOpen && openActions?.key === Constants.ACTION_MATCH_START && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-blue-950/60" onClick={() => setOpenActions({ ...openActions, isOpen: false })}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full mx-4 overflow-hidden border border-blue-500">
            <div className="px-8 py-6 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
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
      )}

      {/* Modal thông báo */}
      <ConfirmModal {...modalProps} />
    </div >
  );
}

// Component xác nhận xóa
function DeleteConfirm({ onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Icon */}
      <div className="relative group">
        <div className="relative w-24 h-24 bg-rose-50 dark:bg-rose-950 rounded-3xl flex items-center justify-center border border-rose-100 dark:border-rose-800">
          <svg className="w-12 h-12 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('competition_data_other.system_warning')}</h3>
        <div className="max-w-xs mx-auto">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
            {t('competition_data_other.delete_warning_message_1')} <span className="text-rose-600 font-bold">{t('competition_data_other.delete_permanently')}</span> {t('competition_data_other.delete_warning_message_2')}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t('competition_data_other.keep_record')}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 text-white font-bold transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t('competition_data_other.confirm_delete')}
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
  referrers = [],
  availableReferees = [],
}) {
  const { t } = useTranslation();

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
      showAlert(t("competition_data_other.please_enter_match_no"));
      return;
    }

    // Kiểm tra ít nhất 1 VĐV có tên
    const hasAthlete = formData.athletes.some(
      (a) => a.athlete_name && a.athlete_name.trim(),
    );
    if (!hasAthlete) {
      showAlert(t("competition_data_other.please_enter_at_least_one_athlete"));
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAI":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "IN":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "FIN":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "CAN":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - General Info & Score */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <section className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_match_profile")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="md:col-span-1 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_match_no")}</label>
                <input
                  readOnly={!isCreate}
                  type="text"
                  value={formData.match_no}
                  onChange={(e) => setFormData({ ...formData, match_no: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg transition-all outline-none font-bold text-gray-900 dark:text-white read-only:opacity-60"
                  placeholder={t("competition_data_other.form_match_no_placeholder")}
                />
              </div>

              <div className="md:col-span-1 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_current_status")}</label>
                <div className="relative">
                  <select
                    value={formData.match_status}
                    onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
                    className={`w-full px-3 py-2 border-2 border-transparent focus:border-blue-500 rounded-lg transition-all outline-none font-bold appearance-none cursor-pointer ${getStatusColor(formData.match_status)}`}
                  >
                    <option value="WAI">{t("competition_data_other.form_status_waiting")}</option>
                    <option value="IN">{t("competition_data_other.form_status_in_progress")}</option>
                    <option value="FIN">{t("competition_data_other.form_status_finished")}</option>
                    <option value="CAN">{t("competition_data_other.form_status_cancelled")}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_match_content")}</label>
                <input
                  readOnly={!isCreate}
                  type="text"
                  value={formData.match_name || ""}
                  onChange={(e) => setFormData({ ...formData, match_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg transition-all outline-none font-bold text-gray-900 dark:text-white read-only:opacity-60"
                  placeholder={t("competition_data_other.form_match_content_placeholder")}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_unit_name")}</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => {
                    const newAthletes = formData.athletes.map((a) => ({ ...a, athlete_unit: e.target.value }));
                    setFormData({ ...formData, athletes: newAthletes, team_name: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg transition-all outline-none font-bold text-gray-900 dark:text-white"
                  placeholder={t("competition_data_other.form_unit_name_placeholder")}
                />
              </div>
            </div>
          </section>

          {/* Scores Section */}
          <section className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_score_system")}</h3>
            </div>

            <div className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: formData.match_type === "VON" ? 7 : soGiamDinh }).map((_, i) => {
                  let judgeLabel = `${t("competition_data_other.form_judge_short")} ${i + 1}`;
                  let subLabel = t("competition_data_other.form_judge");
                  if (formData.match_type === "VON") {
                    if (i === 0 || i === 1) subLabel = "CM";
                    else if (i === 2 || i === 3) subLabel = "NT";
                    else if (i === 4 || i === 5) subLabel = "TH";
                    else if (i === 6) subLabel = "TTT";
                  }

                  return (
                    <div key={`judge-input-${i}`} className="group relative bg-gray-50 dark:bg-gray-800/50 px-2.5 py-2 rounded-lg border-2 border-transparent focus-within:border-blue-500 transition-all">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{judgeLabel}</label>
                        <span className="text-[7px] font-black text-blue-500/60 uppercase">{subLabel}</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.scores?.[`judge${i + 1}`] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);
                          const newScores = { ...formData.scores, [`judge${i + 1}`]: val };
                          const currentTotalJudges = formData.match_type === "VON" ? 7 : soGiamDinh;
                          const judgeScores = [];
                          let hasInput = false;
                          for (let j = 1; j <= currentTotalJudges; j++) {
                            const jScore = newScores[`judge${j}`];
                            if (jScore !== undefined && jScore !== "") hasInput = true;
                            judgeScores.push(Number(jScore || 0));
                          }
                          if (hasInput) {
                            let total = 0;
                            if (formData.match_type === "VON") {
                              const cm = (judgeScores[0] + judgeScores[1]) / 2;
                              const nt = (judgeScores[2] + judgeScores[3]) / 2;
                              const th = (judgeScores[4] + judgeScores[5]) / 2;
                              total = cm * 0.3 + nt * 0.3 + th * 0.3 + judgeScores[6] * 0.1;
                            } else if (soGiamDinh === 5) {
                              total = judgeScores.reduce((a, b) => a + b, 0) - Math.min(...judgeScores) - Math.max(...judgeScores);
                            } else {
                              total = judgeScores.reduce((a, b) => a + b, 0);
                            }
                            newScores.total = Number(total.toFixed(2));
                          }
                          setFormData({ ...formData, scores: newScores });
                        }}
                        className="w-full bg-transparent font-black text-base text-gray-900 dark:text-white outline-none"
                        placeholder="0.0"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600/10 rounded-xl blur-lg group-focus-within:bg-blue-600/20 transition-all"></div>
                  <div className="relative bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border-2 border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t("competition_data_other.form_final_score")}</p>
                        <p className="text-[8px] text-gray-500 dark:text-gray-500 font-medium">{t("competition_data_other.form_auto_calculated")}</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.scores?.total ?? ""}
                      onChange={(e) => setFormData({ ...formData, scores: { ...formData.scores, total: e.target.value === "" ? "" : Number(e.target.value) } })}
                      className="bg-transparent text-right font-black text-2xl text-blue-600 dark:text-blue-400 outline-none w-32"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Athletes */}
        <div className="lg:col-span-12 xl:col-span-5">
          <section className="sticky top-0 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_competing_members")}</h3>
              </div>

              <div className="bg-white dark:bg-gray-900/40 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar space-y-2">
                  {formData.athletes.map((athlete, idx) => (
                    <div key={`athlete-item-${idx}`} className="group relative flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border-2 border-transparent hover:border-emerald-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                      <div className="w-8 h-8 flex-shrink-0 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center font-black text-sm text-emerald-600 dark:text-emerald-400 border border-gray-100 dark:border-gray-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">{t("competition_data_other.form_athlete_name")}</label>
                        <input
                          type="text"
                          value={athlete.athlete_name}
                          onChange={(e) => handleAthleteChange(idx, "athlete_name", e.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none"
                          placeholder={t("competition_data_other.form_athlete_name_placeholder")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Referrers Section */}
            {referrers && referrers.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                  <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_referee_council")}</h3>
                </div>

                <div className="bg-white dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  {referrers.map((ref, idx) => {
                    let roleLabel = ref.role;
                    let iconColor = "bg-purple-600";

                    if (ref.role.startsWith("r")) {
                      const num = ref.role.substring(1);
                      roleLabel = `${t('competition_data_other.judge_role')} ${num}`;
                      iconColor = "bg-blue-600";
                    } else if (ref.role === "machine") {
                      roleLabel = t('competition_data_other.machine_referee');
                      iconColor = "bg-amber-500";
                    } else if (ref.role === "court") {
                      roleLabel = t('competition_data_other.court_referee');
                      iconColor = "bg-emerald-600";
                    }

                    return (
                      <div key={`ref-${idx}`} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className={`w-7 h-7 flex-shrink-0 ${iconColor} rounded-md flex items-center justify-center text-white font-black text-[10px]`}>
                          {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{roleLabel}</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{ref.full_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]"
        >
          {t("competition_data_other.form_cancel_changes")}
        </button>
        <button
          type="submit"
          className="px-10 py-3.5 rounded-2xl bg-blue-600 text-white font-black transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px] flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {row ? t("competition_data_other.form_update_profile") : t("competition_data_other.form_create_match")}
        </button>
      </div>
    </form>
  );
}

// Component xác nhận action
function ActionConfirm({ message, onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Icon */}
      <div className="relative group">
        <div className="relative w-24 h-24 bg-blue-50 dark:bg-blue-950 rounded-3xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
          <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t("competition_data_other.confirm_action")}</h3>
        <div className="max-w-xs mx-auto">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t("competition_data_other.cancel")}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-white font-bold transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t("competition_data_other.continue")}
        </button>
      </div>
    </div>
  );
}

// Component form kết quả cho format DOL/SOL/TUV/DAL
function VonResultForm({ row, onCancel, referrers = [] }) {
  const { t } = useTranslation();

  const scores = row?.scores || {};
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

  const sections = [
    { label: t('competition_data_other.von_expertise'), weight: '30%', icon: 'M13 10V3L4 14h7v7l9-11h-7z', judges: [{ l: `${t('competition_data_other.form_judge_short')} 1`, s: j1 }, { l: `${t('competition_data_other.form_judge_short')} 2`, s: j2 }], avg: avgCM },
    { label: t('competition_data_other.von_artistry'), weight: '30%', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z', judges: [{ l: `${t('competition_data_other.form_judge_short')} 3`, s: j3 }, { l: `${t('competition_data_other.form_judge_short')} 4`, s: j4 }], avg: avgNT },
    { label: t('competition_data_other.von_execution'), weight: '30%', icon: 'M9 12l2 2 4-4M7.835 4.697a.75.75 0 001.061 0l.53-.53a.75.75 0 000-1.06L8.365 2.047a.75.75 0 00-1.06 0l-.53.53a.75.75 0 000 1.061l1.06 1.06zM6 6a2 2 0 012 2v1h5V8a2 2 0 012-2h1a2 2 0 012 2v10a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1H8v1a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1z', judges: [{ l: `${t('competition_data_other.form_judge_short')} 5`, s: j5 }, { l: `${t('competition_data_other.form_judge_short')} 6`, s: j6 }], avg: avgTH }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.match_code')}</p>
            <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{row?.match_no}</p>
          </div>
          <div className="md:col-span-3 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.match_content')}</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{row?.match_name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sections.map((sec, i) => (
          <div key={i} className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d={sec.icon} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="text-[8px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase">{sec.weight}</span>
              </div>

              <div>
                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase mb-2">{sec.label}</h4>
                <div className="space-y-1.5">
                  {sec.judges.map((j, k) => (
                    <div key={k} className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{j.l}</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">{j.s.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[8px] font-black text-gray-400 uppercase">{t('competition_data_other.average')}</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{sec.avg.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h4 className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('competition_data_other.chief_referee')} (10%)</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-black text-xs">7</div>
              <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('competition_data_other.form_judge_short')} 7</span>
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{j7.toFixed(2)}</span>
          </div>
        </div>

        <div className="md:col-span-8 bg-blue-600 p-5 rounded-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-center text-white">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">{t('competition_data_other.official_final_result')}</span>
              <div className="h-px flex-1 bg-white/20"></div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-[4.5rem] font-black leading-none">{(scores.total || totalCalc).toFixed(2)}</span>
              <span className="text-lg font-black text-white/40 uppercase tracking-widest">{t('competition_data_other.points')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Referrers Section */}
      {referrers && referrers.length > 0 && (
        <div className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">{t('competition_data_other.form_referee_council')}</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {referrers.map((ref, idx) => {
              let roleLabel = ref.role;
              let iconColor = "bg-purple-600";

              if (ref.role.startsWith("r")) {
                const num = ref.role.substring(1);
                roleLabel = `${t('competition_data_other.form_judge_short')} ${num}`;
                iconColor = "bg-blue-600";
              } else if (ref.role === "machine") {
                roleLabel = t('competition_data_other.machine_referee_short');
                iconColor = "bg-amber-500";
              } else if (ref.role === "court") {
                roleLabel = t('competition_data_other.court_referee_short');
                iconColor = "bg-emerald-600";
              }

              return (
                <div key={`ref-${idx}`} className="flex flex-col gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 flex-shrink-0 ${iconColor} rounded-md flex items-center justify-center text-white font-black text-[9px]`}>
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{roleLabel}</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{ref.full_name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Component form kết quả cho format DOL/SOL/TUV/DAL
function ResultForm({ row, onCancel, soGiamDinh = 5, referrers = [] }) {
  const { t } = useTranslation();

  const scores = row?.scores || {};
  const currentTotalJudges = soGiamDinh || 5;
  const judgeScores = [];
  for (let j = 1; j <= currentTotalJudges; j++) {
    judgeScores.push(Number(scores[`judge${j}`] || 0));
  }

  const minScore = Math.min(...judgeScores);
  const maxScore = Math.max(...judgeScores);
  const totalCalc = judgeScores.reduce((a, b) => a + b, 0) - (currentTotalJudges === 5 ? (minScore + maxScore) : 0);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center md:text-left">
          <div className="md:col-span-1 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.match_code')}</p>
            <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{row?.match_no}</p>
          </div>
          <div className="md:col-span-3 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('competition_data_other.referee_team')}</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{t('competition_data_other.score_determination')} ({currentTotalJudges} {t('competition_data_other.form_judge')})</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div className="md:col-span-7 space-y-3">
          <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{t('competition_data_other.detailed_analysis_table')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {judgeScores.map((score, i) => {
              let isExcluded = false;
              if (currentTotalJudges === 5) {
                if (score === minScore && !judgeScores.slice(0, i).includes(minScore)) isExcluded = true;
                else if (score === maxScore && !judgeScores.slice(0, i).includes(maxScore)) isExcluded = true;
              }

              return (
                <div key={i} className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${isExcluded ? 'bg-gray-50 dark:bg-gray-800/20 border-gray-200/50 opacity-40 grayscale' : 'bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800'}`}>
                  {isExcluded && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gray-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{t('competition_data_other.excluded')}</span>
                  )}
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{t('competition_data_other.form_judge')} {i + 1}</p>
                  <p className={`text-xl font-black ${isExcluded ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{score.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          {currentTotalJudges === 5 && (
            <p className="text-[8px] font-black text-amber-600 dark:text-amber-500/60 uppercase tracking-widest px-2 italic">* {t('competition_data_other.auto_exclude_note')}</p>
          )}
        </div>

        <div className="md:col-span-5">
          <div className="bg-blue-600 p-5 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10 text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Final Summary</p>
                  <h4 className="text-base font-black uppercase tracking-widest">{t('competition_data_other.total_score')}</h4>
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[4.5rem] font-black leading-none tracking-tighter">{(scores.total ?? totalCalc).toFixed(2)}</span>
                <span className="text-lg font-black text-white/40 uppercase tracking-widest">PTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referrers Section */}
      {referrers && referrers.length > 0 && (
        <div className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">{t('competition_data_other.form_referee_council')}</h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {referrers.map((ref, idx) => {
              let roleLabel = ref.role;
              let iconColor = "bg-purple-600";

              if (ref.role.startsWith("r")) {
                const num = ref.role.substring(1);
                roleLabel = `${t('competition_data_other.form_judge_short')} ${num}`;
                iconColor = "bg-blue-600";
              } else if (ref.role === "machine") {
                roleLabel = t('competition_data_other.machine_referee_short');
                iconColor = "bg-amber-500";
              } else if (ref.role === "court") {
                roleLabel = t('competition_data_other.court_referee_short');
                iconColor = "bg-emerald-600";
              }

              return (
                <div key={`ref-${idx}`} className="flex flex-col gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 flex-shrink-0 ${iconColor} rounded-md flex items-center justify-center text-white font-black text-[9px]`}>
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{roleLabel}</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{ref.full_name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
        >
          {t('competition_data_other.close_window')}
        </button>
      </div>
    </div>
  );
}

// Component Phân bổ giám định
function RefereeAllocationSection({
  availableReferees,
  initialReferrers,
  onSave,
  configSystem,
  formatType,
}) {
  const { t } = useTranslation();

  const [selectedReferrers, setSelectedReferrers] = React.useState(() => {
    const roles = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "machine", "court"];
    const initial = {};
    roles.forEach((role) => {
      const existing = (initialReferrers || []).find((ref) => ref.role === role);
      initial[role] = existing ? existing.referee_id : "";
    });
    return initial;
  });

  const [isSkipped, setIsSkipped] = React.useState(false);

  // Lấy số lượng giám định từ configSystem hoặc mặc định 7 cho VON
  const maxReferees = formatType === "VON"
    ? 7
    : parseInt(configSystem?.data?.so_giam_dinh || 5);



  const handleRefereeChange = (role, refereeId) => {
    setSelectedReferrers((prev) => ({ ...prev, [role]: refereeId }));
  };

  const handleClearAll = () => {
    const cleared = {};
    Object.keys(selectedReferrers).forEach(k => cleared[k] = "");
    setSelectedReferrers(cleared);
  };

  const handleSaveReferrers = () => {
    if (isSkipped) {
      onSave([]); // Save empty if skipped
      return;
    }

    const referrers = Object.entries(selectedReferrers)
      .filter(([role, id]) => {
        // Chỉ lưu những GD trong phạm vi config
        if (role.startsWith("r")) {
          const idx = parseInt(role.substring(1));
          if (idx > maxReferees) return false;
        }
        return id !== "";
      })
      .map(([role, id]) => {
        const refObj = availableReferees.find((r) => r.id === parseInt(id));
        return {
          role,
          referee_id: parseInt(id),
          full_name: refObj?.full_name || "",
        };
      });
    onSave(referrers);
  };

  // Lấy danh sách ID đã được chọn để kiểm tra trùng
  const usedRefereeIds = Object.values(selectedReferrers)
    .filter(id => id !== "")
    .map(id => parseInt(id));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] border border-blue-100 dark:border-blue-900/40 overflow-hidden animate-in fade-in zoom-in duration-700">
      <div className="relative bg-blue-50 dark:bg-blue-900/10 px-10 py-12 border-b border-blue-100 dark:border-blue-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('competition_data_other.referee_allocation')}</h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg">{t('competition_data_other.referee_allocation_desc')}</p>
          </div>

          <label className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-3xl border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:bg-white transition-all">
            <input
              type="checkbox"
              checked={isSkipped}
              onChange={(e) => setIsSkipped(e.target.checked)}
              className="w-6 h-6 rounded-lg border-2 border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
            />
            <span className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">{t('competition_data_other.skip_setup')}</span>
          </label>
        </div>
      </div>

      <div className={`p-10 transition-all duration-500 ${isSkipped ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t('competition_data_other.judging_council')} ({maxReferees})</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {Array.from({ length: maxReferees }).map((_, idx) => {
                const role = `r${idx + 1}`;
                let roleLabel = `${t('competition_data_other.form_judge')} ${idx + 1}`;
                let roleSub = t('competition_data_other.direct_scoring');
                let iconColor = "bg-blue-600 text-white";

                if (formatType === "VON") {
                  if (idx === 0 || idx === 1) { roleLabel = `${t('competition_data_other.form_judge_short')} ${idx + 1} ${t('competition_data_other.von_expertise')}`; iconColor = "bg-blue-600 text-white"; }
                  else if (idx === 2 || idx === 3) { roleLabel = `${t('competition_data_other.form_judge_short')} ${idx + 1} ${t('competition_data_other.von_artistry')}`; iconColor = "bg-indigo-600 text-white"; }
                  else if (idx === 4 || idx === 5) { roleLabel = `${t('competition_data_other.form_judge_short')} ${idx + 1} ${t('competition_data_other.von_execution')}`; iconColor = "bg-emerald-600 text-white"; }
                  else if (idx === 6) { roleLabel = t('competition_data_other.chief_referee_full'); iconColor = "bg-amber-500 text-white"; roleSub = t('competition_data_other.final_confirmation'); }
                }

                return (
                  <div key={role} className="group flex flex-col p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border-2 border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 flex-shrink-0 rounded-xl ${iconColor} flex items-center justify-center font-black text-xs`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{roleSub}</p>
                        <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">{roleLabel}</h5>
                      </div>
                    </div>

                    <select
                      value={selectedReferrers[role]}
                      onChange={(e) => handleRefereeChange(role, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-950/50 border-2 border-transparent focus:border-blue-500 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none transition-all cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}
                    >
                      <option value="">-- {t('competition_data_other.empty')} --</option>
                      {availableReferees
                        .filter((ref) => ref[role] || formatType === "VON")
                        .map((ref) => {
                          const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers[role] !== String(ref.id);
                          return (
                            <option key={ref.id} value={ref.id} disabled={isUsed}>
                              {ref.full_name} {isUsed ? ` (${t('competition_data_other.already_selected')})` : ""}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-4">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t('competition_data_other.operational_referee')}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Machine Referee */}
              <div className="group flex gap-5 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border-2 border-transparent hover:border-amber-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all">
                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">{t('competition_data_other.technician')}</p>
                    <h5 className="text-lg font-black text-gray-900 dark:text-white">{t('competition_data_other.machine_referee')}</h5>
                  </div>
                  <select
                    value={selectedReferrers.machine}
                    onChange={(e) => handleRefereeChange("machine", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-950/50 border-2 border-transparent focus:border-amber-500 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f59e0b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    <option value="">-- {t('competition_data_other.empty')} --</option>
                    {availableReferees
                      .filter((r) => r.is_ref_machine === 1)
                      .map((ref) => {
                        const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.machine !== String(ref.id);
                        return (
                          <option key={ref.id} value={ref.id} disabled={isUsed}>
                            {ref.full_name} {isUsed ? ` (${t('competition_data_other.already_selected')})` : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Court Referee */}
              <div className="group flex gap-5 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border-2 border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all">
                <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{t('competition_data_other.court_operator')}</p>
                    <h5 className="text-lg font-black text-gray-900 dark:text-white">{t('competition_data_other.court_referee')}</h5>
                  </div>
                  <select
                    value={selectedReferrers.court}
                    onChange={(e) => handleRefereeChange("court", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-950/50 border-2 border-transparent focus:border-blue-500 rounded-xl text-sm font-bold text-gray-900 dark:text-white outline-none transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233b82f6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    <option value="">-- {t('competition_data_other.empty')} --</option>
                    {availableReferees
                      .filter((r) => r.is_ref_court === 1)
                      .map((ref) => {
                        const isUsed = usedRefereeIds.includes(ref.id) && selectedReferrers.court !== String(ref.id);
                        return (
                          <option key={ref.id} value={ref.id} disabled={isUsed}>
                            {ref.full_name} {isUsed ? ` (${t('competition_data_other.already_selected')})` : ""}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
            <button
              onClick={handleSaveReferrers}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] active:scale-95 transition-all text-[11px]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {t('competition_data_other.confirm_allocation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component Biên bản Quyền (DOL/SOL/TUV/DAL) - Thiết kế dựa trên Đối Kháng
function QuyenReportForm({ row, onCancel, referrers, soGiamDinh }) {
  const { t } = useTranslation();

  const configSystem = useAppSelector((state) => state.configSystem);

  const getMatchTypeName = (type) => {
    const types = {
      DOL: t('competition_data_other.type_doi_luyen'),
      SOL: t('competition_data_other.type_song_luyen'),
      TUV: t('competition_data_other.type_tu_ve'),
      DAL: t('competition_data_other.type_da_luyen'),
    };
    return types[type] || type;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black p-0 sm:p-2 min-h-0 print:p-0 print:bg-white print:text-black font-serif">
      {/* Container A4 Style - 210mm x 297mm approx */}
      <div className="max-w-[210mm] mx-auto bg-white border border-gray-100 p-[10mm] sm:p-[20mm] print:border-0 print:max-w-none print:p-[15mm] print:min-h-0">

        {/* Official Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center w-5/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wider">{configSystem.data?.don_vi_to_chuc || t('competition_data_other.organizing_committee')}</h4>
            <p className="text-[8pt] italic font-medium -mt-1">{t('competition_data_other.organizing_committee_en')}</p>
            <div className="h-[1.5px] bg-black w-20 mx-auto mt-2"></div>
          </div>
          <div className="text-center w-8/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wide">{t('competition_data_other.socialist_republic')}</h4>
            <p className="text-[8pt] -mt-1">{t('competition_data_other.socialist_republic_en')}</p>
            <h5 className="font-bold text-[10pt] mt-1">{t('competition_data_other.independence_freedom')}</h5>
            <p className="text-[8pt] italic -mt-1">{t('competition_data_other.independence_freedom_en')}</p>
            <div className="h-[1.5px] bg-black w-28 mx-auto mt-2"></div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-[20pt] font-black uppercase tracking-[0.1em] leading-tight">{t('competition_data_other.report_title')}</h1>
          <h2 className="text-[12pt] font-bold text-gray-500 uppercase tracking-widest -mt-1 italic">{t('competition_data_other.report_title_en')}</h2>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[14pt] font-black text-gray-900 border-b-2 border-gray-100 pb-1 px-8">
              {configSystem.data?.ten_giai_dau || "—"}
            </p>
            <div className="flex gap-6 text-[10pt] font-bold text-gray-600">
              <div className="flex flex-col items-center">
                <span>{t('competition_data_other.venue')}: {configSystem.data?.dia_diem || "—"}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex flex-col items-center">
                <span>{t('competition_data_other.date')}: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Minimalist */}
        <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black mb-8 bg-gray-50/50 uppercase font-black text-[9pt]">
          <div className="p-3 text-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t('competition_data_other.match_no_label')}</span>
            <span className="text-lg">{row.match_no}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t('competition_data_other.category_label')}</span>
            <span className="truncate">{row.match_name || "—"}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t('competition_data_other.type_label')}</span>
            <span className="truncate">{getMatchTypeName(row.match_type)}</span>
          </div>
        </div>

        {/* Team Info */}
        <div className="border-2 border-black p-6 mb-8 bg-gray-50/30">
          <div className="text-center mb-4">
            <span className="text-[7pt] font-black text-black uppercase tracking-widest border-b border-black pb-0.5">{t('competition_data_other.team_label')}</span>
            <h3 className="text-[14pt] font-black text-center text-black uppercase leading-none mt-2">{row.team_name || "—"}</h3>
          </div>

          {/* Athletes List */}
          {row.athletes && row.athletes.length > 0 && (
            <div className="mt-4">
              <p className="text-[8pt] font-black uppercase text-gray-500 mb-2">{t('competition_data_other.athletes_label')}:</p>
              <div className="grid grid-cols-2 gap-2">
                {row.athletes.map((athlete, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-200">
                    <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[8pt] font-black">{idx + 1}</span>
                    <span className="text-[9pt] font-bold text-black">{athlete.athlete_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Table - Scores from Judges */}
        <table className="w-full border-collapse border-t-2 border-black mb-8 text-[9pt]">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="p-3 text-center border-r border-black">
                <p className="font-black uppercase">{t('competition_data_other.judge_header')}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Judge</p>
              </th>
              {Array.from({ length: soGiamDinh }).map((_, i) => (
                <th key={i} className="p-3 text-center border-r border-black bg-gray-50">
                  <p className="font-black text-black uppercase">{t('competition_data_other.form_judge_short')} {i + 1}</p>
                </th>
              ))}
              <th className="p-3 text-center bg-black text-white">
                <p className="font-black uppercase">{t('competition_data_other.total_score')}</p>
                <p className="text-[7pt] uppercase font-black -mt-1 italic">Total</p>
              </th>
            </tr>
          </thead>
          <tbody className="border-b-2 border-black">
            <tr className="h-16">
              <td className="p-3 text-center font-black text-lg border-r border-black bg-gray-50">{t('competition_data_other.score_label')}</td>
              {Array.from({ length: soGiamDinh }).map((_, i) => (
                <td key={i} className="p-3 text-center font-black text-2xl text-black border-r border-black">
                  {row.scores?.[`judge${i + 1}`] ?? "—"}
                </td>
              ))}
              <td className="p-3 text-center font-black text-3xl text-white bg-black">
                {row.scores?.total ?? "—"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Referrers Section - Hội đồng giám định */}
        {referrers && referrers.length > 0 && (
          <div className="border-2 border-black p-6 mb-12 bg-gray-50/30">
            <h3 className="text-[10pt] font-black uppercase text-center mb-4 border-b border-black pb-2">
              {t('competition_data_other.judging_panel')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {referrers.map((ref, idx) => {
                let roleLabel = ref.role;
                if (ref.role.startsWith("r")) {
                  const num = ref.role.substring(1);
                  roleLabel = `${t('competition_data_other.judge_role')} ${num} / ${t('competition_data_other.judge_role_en', 'Judge')} ${num}`;
                } else if (ref.role === "machine") {
                  roleLabel = `${t('competition_data_other.machine_referee')} / ${t('competition_data_other.machine_referee_en', 'Machine Referee')}`;
                } else if (ref.role === "court") {
                  roleLabel = `${t('competition_data_other.court_referee')} / ${t('competition_data_other.court_referee_en', 'Court Referee')}`;
                }

                return (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[9pt] font-black">
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <div className="flex-1">
                      <p className="text-[7pt] font-black text-gray-400 uppercase">{roleLabel}</p>
                      <p className="text-[9pt] font-bold text-black">{ref.full_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Signature Box */}
        <div className="grid grid-cols-3 gap-10 mt-16 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t('competition_data_other.match_secretary')}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Match Secretary</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center border-x border-gray-100">
            <span className="text-[9pt] font-black uppercase">{t('competition_data_other.chief_referee')}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Chief Referee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t('competition_data_other.judging_committee')}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Judging Committee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; margin: 0; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  );
}

// Component Biên bản Võ Nhạc (VON) - Thiết kế A4 chuyên nghiệp
function VonReportForm({ row, onCancel, referrers, soGiamDinh }) {
  const { t } = useTranslation();

  const configSystem = useAppSelector((state) => state.configSystem);

  const handlePrint = () => {
    window.print();
  };

  // Tính điểm VON
  const calculateVonScore = () => {
    if (!row.scores) return { cm: 0, nt: 0, th: 0, ttt: 0, total: 0 };

    const judge1 = Number(row.scores.judge1 || 0);
    const judge2 = Number(row.scores.judge2 || 0);
    const judge3 = Number(row.scores.judge3 || 0);
    const judge4 = Number(row.scores.judge4 || 0);
    const judge5 = Number(row.scores.judge5 || 0);
    const judge6 = Number(row.scores.judge6 || 0);
    const judge7 = Number(row.scores.judge7 || 0);

    const cm = (judge1 + judge2) / 2;
    const nt = (judge3 + judge4) / 2;
    const th = (judge5 + judge6) / 2;
    const ttt = judge7;
    const total = cm * 0.3 + nt * 0.3 + th * 0.3 + ttt * 0.1;

    return { cm, nt, th, ttt, total };
  };

  const vonScores = calculateVonScore();

  return (
    <div className="bg-white text-black p-0 sm:p-2 min-h-0 print:p-0 print:bg-white print:text-black font-serif">
      {/* Container A4 Style - 210mm x 297mm approx */}
      <div className="max-w-[210mm] mx-auto bg-white border border-gray-100 p-[10mm] sm:p-[20mm] print:border-0 print:max-w-none print:p-[15mm] print:min-h-0">

        {/* Official Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-black">
          <div className="text-left flex-1">
            <p className="text-[9pt] font-bold uppercase leading-tight">{configSystem?.data?.don_vi_to_chuc || t('competition_data_other.organizing_committee')}</p>
            <p className="text-[8pt] font-semibold mt-1 leading-tight">{configSystem?.data?.ten_giai_dau}</p>
          </div>
          <div className="text-right flex-1">
            <p className="text-[9pt] font-bold uppercase leading-tight">{t('competition_data_other.socialist_republic')}</p>
            <p className="text-[9pt] font-bold border-b-2 border-black inline-block pb-1 mt-1">{t('competition_data_other.independence_freedom')}</p>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-[16pt] font-black uppercase tracking-wide mb-1">{t('competition_data_other.report_title')}</h1>
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-gray-700 mb-1">{t('competition_data_other.musical_performance')}</h2>
          <p className="text-[9pt] font-semibold italic">{t('competition_data_other.report_title_en')} - {t('competition_data_other.musical_performance_en')}</p>
          <div className="mt-4 text-[9pt]">
            <p className="font-semibold">{configSystem?.data?.ten_giai_dau || ""}</p>
            <p className="text-[8pt] text-gray-600 mt-1">
              {t('competition_data_other.venue')}: {configSystem?.data?.dia_diem || "_______________"} |
              {t('competition_data_other.date')}: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Info Grid - Match No, Category, Type */}
        <div className="grid grid-cols-3 gap-4 mb-8 border-2 border-black p-4">
          <div className="text-center border-r border-gray-300">
            <p className="text-[8pt] font-bold text-gray-600 uppercase mb-1">{t('competition_data_other.match_no_label')}</p>
            <p className="text-[14pt] font-black">{row.match_no || "-"}</p>
          </div>
          <div className="text-center border-r border-gray-300">
            <p className="text-[8pt] font-bold text-gray-600 uppercase mb-1">{t('competition_data_other.category_label')}</p>
            <p className="text-[11pt] font-bold">{row.match_name || "-"}</p>
          </div>
          <div className="text-center">
            <p className="text-[8pt] font-bold text-gray-600 uppercase mb-1">{t('competition_data_other.type_label')}</p>
            <p className="text-[11pt] font-bold">{t('competition_data_other.musical_performance')}</p>
          </div>
        </div>

        {/* Team Info with Athletes */}
        <div className="mb-8 border-2 border-black p-6">
          <div className="mb-4">
            <p className="text-[9pt] font-bold uppercase mb-2 border-b border-gray-400 pb-1">
              {t('competition_data_other.team_label')}: <span className="font-black ml-2">{row.team_name || "-"}</span>
            </p>
          </div>
          <div>
            <p className="text-[9pt] font-bold uppercase mb-3">{t('competition_data_other.athletes_label')}:</p>
            <div className="grid grid-cols-1 gap-2">
              {row.athletes && row.athletes.length > 0 ? (
                row.athletes.map((athlete, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-200">
                    <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-bold text-[10pt] rounded">
                      {idx + 1}
                    </div>
                    <p className="text-[10pt] font-semibold flex-1">{athlete.athlete_name}</p>
                  </div>
                ))
              ) : (
                <p className="text-[9pt] text-gray-500 italic">{t('competition_data_other.no_info')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Results Table - VON Scoring */}
        <div className="mb-8">
          <h3 className="text-[10pt] font-black uppercase text-center mb-4 border-b-2 border-black pb-2">
            {t('competition_data_other.musical_performance_score_table')}
          </h3>

          {/* Detailed Scores Table */}
          <table className="w-full border-2 border-black mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.criteria_label')}<br /><span className="text-[7pt] font-normal">{t('competition_data_other.criteria_en')}</span></th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 1</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 2</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 3</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 4</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 5</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 6</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 7</th>
                <th className="border border-black p-2 text-[9pt] font-bold bg-gray-200">{t('competition_data_other.average_title')}<br /><span className="text-[7pt] font-normal">{t('competition_data_other.average_en')}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-blue-50">
                  {t('competition_data_other.von_standard')} (30%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.standard_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge1 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge2 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-blue-100">{vonScores.cm.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-green-50">
                  {t('competition_data_other.von_proficiency')} (30%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.proficiency_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge3 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge4 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-green-100">{vonScores.nt.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-orange-50">
                  {t('competition_data_other.von_expression')} (30%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.expression_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge5 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge6 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-orange-100">{vonScores.th.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-purple-50">
                  {t('competition_data_other.von_overall')} (10%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.overall_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge7 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-purple-100">{vonScores.ttt.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Final Score */}
          <div className="border-4 border-black p-6 bg-gray-50 text-center">
            <p className="text-[9pt] font-bold uppercase mb-2">{t('competition_data_other.final_score_label')}</p>
            <p className="text-[8pt] text-gray-600 mb-3">CM×0.3 + NT×0.3 + TH×0.3 + TTT×0.1</p>
            <p className="text-[28pt] font-black">{vonScores.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Referrers Section */}
        {referrers && referrers.length > 0 && (
          <div className="border-2 border-black p-6 mb-12 bg-gray-50/30">
            <h3 className="text-[10pt] font-black uppercase text-center mb-4 border-b border-black pb-2">
              {t('competition_data_other.judging_panel')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {referrers.map((ref, idx) => {
                let roleLabel = ref.role;
                let roleEn = ref.role;

                if (ref.role.startsWith("r")) {
                  const num = ref.role.substring(1);
                  roleLabel = `${t('competition_data_other.judge_role')} ${num}`;
                  roleEn = `${t('competition_data_other.judge_role_en', 'Judge')} ${num}`;
                } else if (ref.role === "machine") {
                  roleLabel = t('competition_data_other.machine_referee');
                  roleEn = t('competition_data_other.machine_referee_en', 'Machine Referee');
                } else if (ref.role === "court") {
                  roleLabel = t('competition_data_other.court_referee');
                  roleEn = t('competition_data_other.court_referee_en', 'Court Referee');
                }

                return (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-300">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-[10pt] rounded">
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <div className="flex-1">
                      <p className="text-[8pt] font-bold text-gray-600 uppercase">{roleLabel} / {roleEn}</p>
                      <p className="text-[10pt] font-bold">{ref.full_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Signature Box */}
        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t-2 border-black">
          <div className="text-center">
            <p className="text-[9pt] font-bold uppercase mb-1">{t('competition_data_other.match_secretary')}</p>
            <p className="text-[8pt] italic text-gray-600 mb-12">{t('competition_data_other.match_secretary_en')}</p>
            <p className="text-[9pt] font-semibold border-t border-black inline-block px-8 pt-1">{t('competition_data_other.signature')}</p>
          </div>
          <div className="text-center">
            <p className="text-[9pt] font-bold uppercase mb-1">{t('competition_data_other.chief_referee')}</p>
            <p className="text-[8pt] italic text-gray-600 mb-12">{t('competition_data_other.chief_referee_en')}</p>
            <p className="text-[9pt] font-semibold border-t border-black inline-block px-8 pt-1">{t('competition_data_other.signature')}</p>
          </div>
          <div className="text-center">
            <p className="text-[9pt] font-bold uppercase mb-1">{t('competition_data_other.judging_committee')}</p>
            <p className="text-[8pt] italic text-gray-600 mb-12">{t('competition_data_other.judging_committee_en')}</p>
            <p className="text-[9pt] font-semibold border-t border-black inline-block px-8 pt-1">{t('competition_data_other.signature')}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
