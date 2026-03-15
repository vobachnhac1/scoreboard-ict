import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Constants } from "../../../../common/Constants";
import { useAppDispatch, useAppSelector } from "../../../../config/redux/store";
import { fetchConfigSystem } from "../../../../config/redux/controller/configSystemSlice";
import useConfirmModal from "../../../../hooks/useConfirmModal";

// UI Components
import SearchInput from "../../../../components/SearchInput";
import ConfirmModal from "../../../../components/ConfirmModal";

// Local Sub-components
import ConfigSystem from "../ConfigSystem";
import ConfigForm from "./components/ConfigForm";
import RoundHistoryCard from "./components/RoundHistoryCard";
import MatchCard from "./components/MatchCard";
import DataForm from "./components/DataForm";
import ResultForm from "./components/ResultForm";
import DeleteConfirm from "./components/DeleteConfirm";
import ActionConfirm from "./components/ActionConfirm";
import MatchReportView from "./components/MatchReportView";
import MatchLogsReportView from "./components/MatchLogsReportView";
import HistoryView from "./components/HistoryView";
import RefereeAllocationSection from "./components/RefereeAllocationSection";

// Helpers
import { formatMatchName } from "../../../../utils/nameFormatter";

export default function CompetitionDataDetail() {
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

  const [openActions, setOpenActions] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("match_no");
  const [viewMode, setViewMode] = useState("list");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("matches");
  const [availableReferees, setAvailableReferees] = useState([]);

  const { modalProps, showAlert, showError, showSuccess } = useConfirmModal();
  const exportToExcelRef = React.useRef(null);
  const configSystem = useAppSelector((state) => state.configSystem);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchConfigSystem());
    fetchData();
    fetchAvailableReferees();
  }, [id]);

  const fetchAvailableReferees = async () => {
    try {
      const response = await axios.get("http://localhost:6789/api/referees");
      if (response.data.success) setAvailableReferees(response.data.data);
    } catch (error) {
      console.error("Error fetching referees:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:6789/api/competition-dk/${id}`);
      if (response?.data?.success && response?.data?.data) {
        const data = response.data.data;
        setSheetData(data);

        if (data.data && data.data.length > 0) {
          data.data[0][0] = t("competition_detail.table.match_no");
          const headersWithWinner = [...data.data[0], t("competition_detail.match_card.winner")];
          setHeaders(headersWithWinner);

          const matchesResponse = await axios.get(`http://localhost:6789/api/competition-match/by-dk/${id}`);
          const matches = matchesResponse.data.success ? matchesResponse.data.data : [];

          const rowsData = data.data.slice(1).map((row, index) => {
            const match = matches.find((m) => m.row_index === index);
            let winnerText = "";
            if (match?.winner) {
              if (match.winner?.toUpperCase() === "RED") winnerText = `${row[3] || ""} - ${row[4] || ""}`;
              else if (match.winner?.toUpperCase() === "BLUE") winnerText = `${row[6] || ""} - ${row[7] || ""}`;
            }

            return {
              data: row,
              match_id: match?.id,
              match_status: match?.match_status || "WAI",
              config_system: match?.config_system || {},
              winner: match?.winner || null,
              winner_text: winnerText,
            };
          });
          setRows(rowsData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(t("competition_detail.messages.load_error") + ": " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => fetchData();

  const listActions = [
    {
      key: Constants.ACTION_MATCH_START,
      btnText: t("competition_detail.actions.start_match"),
      color: "bg-blue-600 rounded text-white hover:bg-blue-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
      description: t("competition_detail.action_descriptions.start_match"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_START, row }),
    },
    {
      key: Constants.ACTION_MATCH_CONFIG,
      btnText: t("competition_detail.actions.config"),
      color: "bg-purple-600 text-white hover:bg-purple-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
      description: t("competition_detail.action_descriptions.config"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_CONFIG, row }),
    },
    {
      key: Constants.ACTION_MATCH_HISTORY,
      btnText: t("competition_detail.actions.history"),
      color: "bg-green-600 text-white hover:bg-green-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
      description: t("competition_detail.action_descriptions.history"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_HISTORY, row }),
    },
    {
      key: Constants.ACTION_UPDATE,
      btnText: t("competition_detail.actions.update"),
      color: "bg-gray-600 text-white hover:bg-gray-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>,
      description: t("competition_detail.action_descriptions.update"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row }),
    },
    {
      key: Constants.ACTION_DELETE,
      btnText: t("competition_detail.actions.delete"),
      color: "bg-red-600 text-white hover:bg-red-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
      description: t("competition_detail.action_descriptions.delete"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_DELETE, row }),
    },
    {
      key: Constants.ACTION_MATCH_REPORT,
      btnText: t("competition_detail.actions.report"),
      color: "bg-orange-600 text-white hover:bg-orange-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
      description: t("competition_detail.action_descriptions.report"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_REPORT, row }),
    },
    {
      key: Constants.ACTION_MATCH_LOGS,
      btnText: t("competition_detail.actions.logs"),
      color: "bg-purple-600 text-white hover:bg-purple-700",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>,
      description: t("competition_detail.action_descriptions.logs"),
      callback: (row) => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_LOGS, row }),
    },
  ];

  const getActionsByStatus = (status) => {
    switch (status) {
      case "FIN": return [Constants.ACTION_UPDATE, Constants.ACTION_MATCH_HISTORY, Constants.ACTION_MATCH_REPORT];
      case "IN": return [Constants.ACTION_MATCH_START, Constants.ACTION_MATCH_HISTORY];
      case "WAI": return [Constants.ACTION_MATCH_START, Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
      default: return [Constants.ACTION_UPDATE, Constants.ACTION_DELETE];
    }
  };

  const tableData = rows.map((row, index) => {
    const rowData = Array.isArray(row) ? row : row.data || row;
    return {
      key: index, id: index, rowIndex: index,
      data: [...rowData, row.winner_text || ""],
      match_status: row.match_status || "WAI",
      match_id: row.match_id || null,
      config_system: row.config_system || {},
      winner: row.winner || null,
    };
  });

  const filteredData = tableData.filter((row) => {
    if (filterStatus !== "ALL" && row.match_status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return [0, 3, 6, 4, 7].some(i => String(row.data[i] || "").toLowerCase().includes(s));
    }
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "match_no") return Number(a.data[0] || 0) - Number(b.data[0] || 0);
    if (sortBy === "status") {
      const order = { IN: 0, WAI: 1, FIN: 2, CAN: 3 };
      return (order[a.match_status] || 99) - (order[b.match_status] || 99);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const saveDataToServer = async (newData) => {
    await axios.put(`http://localhost:6789/api/competition-dk/${id}`, {
      sheet_name: sheetData.sheet_name,
      file_name: sheetData.file_name,
      data: newData,
    });
  };

  const handleUpdate = async (formData) => {
    try {
      const row = openActions.row;
      const headersWithoutWinner = headers.slice(0, -1);
      const rowData = headersWithoutWinner.map((_, i) => formData[`col_${i}`] || "");
      let winnerText = row.data[row.data.length - 1] || "";
      if (formData.winner === "red") winnerText = formData.col_3 + (formData.col_4 ? ` - ${formData.col_4}` : "");
      else if (formData.winner === "blue") winnerText = formData.col_6 + (formData.col_7 ? ` - ${formData.col_7}` : "");
      else if (formData.winner === "") winnerText = "";
      rowData.push(winnerText);

      await axios.put(`http://localhost:6789/api/competition-dk/${id}/row/${row.rowIndex}`, { data: rowData });
      if (row.match_id) {
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/status`, { status: formData.match_status });
        if (formData.winner !== undefined) {
          await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/winner`, { winner: formData.winner });
          if (formData.winner) await updateWinnerToNextMatches(row, formData.winner);
        }
      }
      await fetchData();
      setOpenActions(null);
      showSuccess(t("competition_detail.messages.update_success"));
    } catch (e) { showError(t("competition_detail.messages.update_error") + ": " + (e.response?.data?.message || e.message)); }
  };

  const handleDelete = async () => {
    try {
      const newRows = rows.filter((_, i) => i !== openActions.row.rowIndex);
      const updatedRows = newRows.map((r, i) => ({ ...r, data: r.data.map((c, ci) => ci === 0 ? i + 1 : c) }));
      const newData = [headers.slice(0, -1), ...updatedRows.map(r => r.data)];
      await saveDataToServer(newData);
      setRows(updatedRows);
      setOpenActions(null);
      showSuccess(t("competition_detail.messages.delete_success"));
    } catch (e) { showError(t("competition_detail.messages.delete_error") + ": " + (e.response?.data?.message || e.message)); }
  };

  const updateWinnerToNextMatches = async (currentRow, winner) => {
    try {
      const matchNum = parseFloat(currentRow.data[0]);
      let wName = winner.toUpperCase() === "RED" ? currentRow.data[3] : currentRow.data[6];
      let wUnit = winner.toUpperCase() === "RED" ? currentRow.data[4] : currentRow.data[7];
      if (!wName) return 0;
      const pattern = `win.${matchNum}`.toLowerCase();
      const updates = [];
      for (let i = 0; i < rows.length; i++) {
        let updated = [...rows[i].data];
        let needed = false;
        for (let j = 0; j < updated.length; j++) {
          if (String(updated[j] || "").toLowerCase().trim() === pattern) {
            updated[j] = wName;
            if (j + 1 < updated.length) updated[j + 1] = wUnit;
            needed = true;
          }
        }
        if (needed) updates.push(axios.put(`http://localhost:6789/api/competition-dk/${id}/row/${i}`, { data: updated }));
      }
      if (updates.length > 0) await Promise.all(updates);
      return updates.length;
    } catch (e) { console.error(e); throw e; }
  };

  const handleMatchStart = async () => {
    try {
      const row = openActions.row;
      if (!configSystem.data.ap_dung_doikhang) { showError(t("competition_detail.messages.feature_locked")); return; }
      if (!row.match_id) {
        const res = await axios.post("http://localhost:6789/api/competition-match", {
          competition_dk_id: id, match_no: row.data[0], row_index: row.rowIndex,
          red_name: row.data[3], blue_name: row.data[6], config_system: configSystem.data,
          referrers: sheetData.referrers || []
        });
        row.match_id = res.data.data.id;
      }
      await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/status`, { status: "IN" });
      setOpenActions(null);
      const matchData = {
        match_id: row.match_id, match_no: row.data[0], match_weight: row.data[1], match_type: row.data[2],
        match_level: row.data[9], red: { name: row.data[3], unit: row.data[4], country: row.data[5] },
        blue: { name: row.data[6], unit: row.data[7], country: row.data[8] }, match_status: "IN",
        ten_giai_dau: configSystem.data.ten_giai_dau, ten_mon_thi: configSystem.data.bo_mon,
        config_system: configSystem.data, competition_dk_id: id, referrers: sheetData?.referrers || []
      };
      navigate("/bang-diem/doi-khang", { state: { matchData, returnUrl: `/management/competition-data/${id}` } });
    } catch (e) { showError(t("competition_detail.messages.start_match_error") + ": " + (e.response?.data?.message || e.message)); }
  };

  const handleSaveReferrers = async (refs) => {
    try {
      await axios.put(`http://localhost:6789/api/competition-dk/${id}`, { ...sheetData, referrers: refs });
      setSheetData({ ...sheetData, referrers: refs });
      showSuccess(t("competition_detail.messages.save_referees_success"));
    } catch (e) { showError(t("competition_detail.messages.save_referees_error", { error: e.message })); }
  };

  const handleResult = async (formData) => {
    try {
      const row = openActions.row;
      if (row.match_id) {
        await axios.post(`http://localhost:6789/api/competition-match/${row.match_id}/history`, {
          red_score: formData.red_score, blue_score: formData.blue_score, notes: formData.notes, status: "FIN"
        });
        await axios.put(`http://localhost:6789/api/competition-match/${row.match_id}/winner`, { winner: formData.winner });
      }
      const count = await updateWinnerToNextMatches(row, formData.winner);
      setOpenActions(null);
      await fetchData();
      showSuccess(count > 0 ? `${t("competition_detail.messages.save_result_success")} ${count} ${t("competition_detail.stats.matches")}.` : t("competition_detail.messages.save_result_success"));
    } catch (e) { showError(t("competition_detail.messages.save_result_error") + ": " + (e.response?.data?.message || e.message)); }
  };

  const renderModalContent = () => {
    if (!openActions) return null;
    const { key, row } = openActions;
    if (key === Constants.ACTION_MATCH_START) return <ActionConfirm message={t("competition_detail.messages.start_match_confirm", { match: row.data[0] })} onConfirm={handleMatchStart} onCancel={() => setOpenActions(null)} />;
    if (key === Constants.ACTION_MATCH_RESULT) return <ResultForm row={row} onSubmit={handleResult} onCancel={() => setOpenActions(null)} showAlert={showAlert} />;
    if (key === Constants.ACTION_MATCH_CONFIG) return <ConfigForm row={row} onSubmit={handleUpdate} onCancel={() => setOpenActions(null)} />;
    if (key === Constants.ACTION_MATCH_HISTORY) return <HistoryView row={row} onClose={() => setOpenActions(null)} exportToExcelRef={exportToExcelRef} showError={showError} modalProps={modalProps} setOpenActions={setOpenActions} openActions={openActions} />;
    if (key === Constants.ACTION_UPDATE) return <DataForm headers={headers} data={row.data} row={row} onSubmit={handleUpdate} onCancel={() => setOpenActions(null)} showAlert={showAlert} />;
    if (key === Constants.ACTION_DELETE) return <DeleteConfirm onConfirm={handleDelete} onCancel={() => setOpenActions(null)} />;
    if (key === Constants.ACTION_MATCH_REPORT) return <MatchReportView row={row} onClose={() => setOpenActions(null)} />;
    if (key === Constants.ACTION_MATCH_LOGS) return <MatchLogsReportView row={row} onClose={() => setOpenActions(null)} />;
    return null;
  };

  if (loading) return <div className="p-12 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>{t("competition_detail.messages.loading_data")}</div>;
  if (!sheetData) return <div className="p-12 text-center">{t("competition_detail.messages.no_data_found")}</div>;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => navigate("/management/general-setting/competition-management")} className="text-blue-600 mb-4 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>{t("competition_detail.buttons.back")}</button>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase">{sheetData.sheet_name}</h2>
        </div>
        <div className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-900/10 p-1.5 rounded border border-blue-100 dark:border-blue-800/30">
          <button
            onClick={() => setActiveTab("matches")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "matches"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_detail.tabs.matches")}
          </button>
          <button
            onClick={() => setActiveTab("referrers")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "referrers"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_detail.tabs.referees")}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`py-2.5 px-6 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 ${activeTab === "results"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`}
          >
            {t("competition_detail.tabs.results")}
          </button>
        </div>
      </div>

      {activeTab === "matches" && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {["WAI", "IN", "FIN"].map(s => {
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
                    {t(`competition_detail.match_status.${s === "WAI" ? "waiting" : s === "IN" ? "ongoing" : "finished"}`)}
                  </p>
                  <p className="text-3xl font-black">{tableData.filter(r => r.match_status === s).length}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mb-6 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-1 min-w-[300px] gap-3">
              <SearchInput value={search} onChange={setSearch} placeholder={t("competition_detail.form.search_placeholder")} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 min-w-[250px] bg-gray-50 dark:bg-gray-900 border-none rounded text-xs font-bold"><option value="ALL">{t("competition_detail.filters.all_status")}</option><option value="WAI">Chờ</option><option value="IN">Đang đấu</option><option value="FIN">Kết thúc</option></select>
            </div>
            <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded border border-gray-100 dark:border-gray-700">
              <button onClick={() => setViewMode("grid")} className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-gray-400"}`}>
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
              <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "text-gray-400"}`}>
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
            </div>
          </div>

          <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-3"}>
            {paginatedData.map(row => <MatchCard key={row.key} row={row} listActions={listActions} getActionsByStatus={getActionsByStatus} viewMode={viewMode} onDoubleClick={r => setOpenActions({ isOpen: true, key: Constants.ACTION_UPDATE, row: r })} />)}
          </div>
          {totalPages > 1 && <div className="mt-8 flex justify-center gap-2">{[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded font-bold transition-all ${page === i + 1 ? "bg-blue-600 text-white shadow-lg scale-110" : "bg-white dark:bg-gray-800 text-gray-500"}`}>{i + 1}</button>)}</div>}
        </>
      )}

      {activeTab === "referrers" && (
        <RefereeAllocationSection availableReferees={availableReferees} initialReferrers={sheetData?.referrers || []} onSave={handleSaveReferrers} configSystem={configSystem} />
      )}

      {activeTab === "results" && (
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 w-20">Trận</th>
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4">Đối đầu</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {tableData.filter(r => r.match_status === "FIN").map(row => (
                <tr key={row.key} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors">
                  <td className="px-6 py-4 font-black">{row.data[0]}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-400">{row.data[2]}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase">
                      <span className="text-red-600">{row.data[3]}</span>
                      <span className="text-gray-300">vs</span>
                      <span className="text-blue-600">{row.data[6]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setOpenActions({ isOpen: true, key: Constants.ACTION_MATCH_LOGS, row })}
                        className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {t("competition_detail.modals.match_log")}
                      </button>
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
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">
                    Chưa có trận đấu nào kết thúc để xem kết quả
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}


      {openActions?.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-md transition-all duration-500">
          <div className={`bg-white dark:bg-gray-900 rounded shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] w-full ${[Constants.ACTION_MATCH_START, Constants.ACTION_DELETE, Constants.ACTION_MATCH_RESULT].includes(openActions?.key) ? "max-w-md" : [Constants.ACTION_UPDATE, Constants.ACTION_MATCH_CONFIG].includes(openActions?.key) ? "max-w-2xl" : "max-w-7xl"} max-h-[94vh] overflow-hidden flex flex-col border border-white/20`}>
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center backdrop-blur-md"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></div>
                <div><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-0.5">{t("competition_detail.modals.subtitle") || "Competition Management"}</p><h3 className="text-2xl font-black uppercase tracking-tight">{listActions.find(a => a.key === openActions.key)?.btnText || "Action"}</h3></div>
              </div>
              <div className="flex items-center gap-3">
                {[Constants.ACTION_MATCH_REPORT, Constants.ACTION_MATCH_LOGS].includes(openActions?.key) && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded font-bold transition-all active:scale-95 uppercase tracking-widest text-xs backdrop-blur-md border border-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {openActions?.key === Constants.ACTION_MATCH_REPORT ? t("competition_detail.modals.print_report") : t("competition_detail.modals.print_log")}
                  </button>
                )}
                <button onClick={() => setOpenActions(null)} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-all active:scale-90 font-bold">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-950/50 custom-scrollbar">{renderModalContent()}</div>
          </div>
        </div>
      )}
      <ConfirmModal {...modalProps} />
      {showScrollTop && <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg></button>}
    </div>
  );
}
