import React, { useState } from "react";
import { META_FIELDS_NAME, HIDDEN_DETAIL_KEYS } from "../constants";
import { cleanObject } from "../utils/dataUtils";
import { useTranslation } from "react-i18next";

// Parse data field của competition_dk
const parseCompDKData = (value) => {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return cleanObject(parsed);
  } catch {
    return null;
  }
};


// Render field data của competition_dk dạng bảng đẹp với export CSV
const CompDKDataTable = ({ value, fileName }) => {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const parsed = parseCompDKData(value);
  if (!parsed) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
        <span className="text-gray-400 dark:text-gray-500 italic text-sm">
          {value ? t("data_sync.invalid_data") : t("data_sync.no_data")}
        </span>
      </div>
    );
  }

  const headers = parsed[0] || [];
  let rows = parsed.slice(1);
  const originalCount = rows.length;

  // Filter
  const q = search.trim().toLowerCase();
  if (q) {
    rows = rows.filter((row) =>
      row.some((cell) => String(cell ?? "").toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortCol !== null) {
    rows = [...rows].sort((a, b) => {
      const av = a[sortCol] ?? "";
      const bv = b[sortCol] ?? "";
      const n = Number(av) - Number(bv);
      if (!isNaN(n) && av !== "" && bv !== "") return sortAsc ? n : -n;
      return sortAsc
        ? String(av).localeCompare(String(bv), "vi")
        : String(bv).localeCompare(String(av), "vi");
    });
  }

  const toggleSort = (idx) => {
    if (sortCol === idx) setSortAsc((v) => !v);
    else { setSortCol(idx); setSortAsc(true); }
  };

  const exportCSV = () => {
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "data"}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // tạo format dữ liệu lại trước khi data theo dạng DK, DOL thì không cần dổi | TUV, SOL thì cần dổi 2 row thì 1 | DAL thì cần đổi 4 row thành 1
  const formatData = () => {
    const type = headers[0];
    const formatted = [];
    if (type === "DK" || type === "DOL") return rows;
    if (type === "TUV" || type === "SOL") {
      for (let i = 0; i < rows.length; i += 2) {
        const row1 = rows[i];
        const row2 = rows[i + 1];
        formatted.push([row1, row2]);
      }
    }
    if (type === "DAL") {
      for (let i = 0; i < rows.length; i += 4) {
        const row1 = rows[i];
        const row2 = rows[i + 1];
        const row3 = rows[i + 2];
        const row4 = rows[i + 3];
        formatted.push([row1, row2, row3, row4]);
      }
    }
    if (type == "VON") {
      for (let i = 0; i < rows.length;) {
        let count = 1;
        if (rows[i] && rows[i][1] == "VON" && rows[i][5] != null) {
          const val = Number(rows[i][5]);
          count = !isNaN(val) && val > 1 ? val : 1;
        }
        let arrRow = [];
        for (let j = 0; j < count; j++) {
          if (rows[i + j]) arrRow.push(rows[i + j]);
        }
        formatted.push(arrRow);
        i += count;
      }
    }
    return formatted;
  };

  return (
    <div className="space-y-4">
      {/* ===== SEARCH & EXPORT TOOLBAR - Premium Pill Design ===== */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 ">
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/40 rounded border border-blue-100 dark:border-blue-800">
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
            {rows.length} / {originalCount} {t("data_sync.records")}
          </span>
          {q && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-[9px] font-black uppercase">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span> {t("data_sync.filtering")}
            </span>
          )}
        </div>

        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("data_sync.search_record_data")}
            className="w-full pl-11 pr-10 py-3 text-xs font-bold bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded transition-all outline-none text-blue-950 dark:text-blue-100 placeholder-blue-300/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        <button
          onClick={exportCSV}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-black uppercase tracking-widest  active:scale-95 transition-all flex items-center gap-3"
          title={t("data_sync.export_csv")}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 10l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t("data_sync.export_csv_label")}
        </button>
      </div>

      {/* ===== TABLE CONTAINER ===== */}
      <div className="rounded border-2 border-blue-50 dark:border-blue-900/30 bg-white dark:bg-gray-800  overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-blue-50/80 dark:bg-blue-900/40">
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-blue-900/50 dark:text-blue-100/50 border-r border-blue-100 dark:border-blue-800 w-14 text-center">
                    #
                  </th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      onClick={() => toggleSort(idx)}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-900/70 dark:text-blue-100/70 border-r border-blue-100 dark:border-blue-800 whitespace-nowrap cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors group select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span>{header}</span>
                        <div className={`transition-all duration-300 ${sortCol === idx ? "text-blue-600 opacity-100 scale-110" : "text-gray-300 opacity-0 group-hover:opacity-100"}`}>
                          {sortCol === idx ? (sortAsc ? "▲" : "▼") : "▲"}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 dark:divide-blue-900/10">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-200 dark:text-blue-800">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">
                          {q ? t("data_sync.no_matching_results") : t("data_sync.empty_record")}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  formatData().map((item, rowIdx) => {
                    const isGrouped = Array.isArray(item) && item.length > 0 && Array.isArray(item[0]);
                    const displayRow = isGrouped ? item[0] : item;
                    return (
                      <tr
                        key={rowIdx}
                        className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="px-5 py-3 text-center text-gray-400 font-mono text-[10px] font-bold border-r border-blue-50 dark:border-blue-900/10 bg-gray-50/30 dark:bg-black/10">
                          {rowIdx + 1}
                        </td>
                        {headers.map((headerStr, cellIdx) => {
                          if (!isGrouped) {
                            const val = displayRow[cellIdx];
                            return (
                              <td key={cellIdx} className="px-6 py-3 border-r border-blue-50 dark:border-blue-900/10">
                                <div className="text-xs font-bold text-gray-700 dark:text-gray-200 max-w-[300px] truncate" title={String(val ?? "")}>
                                  {val !== null && val !== undefined ? String(val) : <span className="text-gray-300 dark:text-gray-700 italic">—</span>}
                                </div>
                              </td>
                            );
                          }

                          const val1 = displayRow[cellIdx];
                          const headerLower = String(headerStr).toLowerCase();
                          const nameVariants = t("data_sync.name_column_variants").split(",").map(v => v.trim().toLowerCase());
                          let isNameCol = nameVariants.some(v => headerLower.includes(v)) || cellIdx === 2;
                          if (headers[0] == 'VON') isNameCol = nameVariants.some(v => headerLower.includes(v)) || cellIdx === 3;

                          if (isNameCol) {
                            return (
                              <td key={cellIdx} className="px-6 py-2 border-r border-blue-50 dark:border-blue-900/10 align-middle bg-blue-50/20 dark:bg-blue-900/10">
                                <div className="flex flex-col gap-1.5 py-1">
                                  {item.map((r, subIdx) => (
                                    <React.Fragment key={subIdx}>
                                      <div className="text-xs font-black text-blue-700 dark:text-blue-400 flex items-center gap-2 truncate max-w-[300px]" title={String(r[cellIdx] ?? "")}>
                                        <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[8px]">{subIdx + 1}</span>
                                        {r[cellIdx] !== null && r[cellIdx] !== undefined ? String(r[cellIdx]) : <span className="opacity-30 italic">—</span>}
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </td>
                            );
                          }

                          let isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 3 || cellIdx === 4;
                          if (headers[0] == "VON") isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 2 || cellIdx === 4 || cellIdx === 5;

                          if (isStaticCol) {
                            return (
                              <td key={cellIdx} className="px-6 py-3 border-r border-blue-50 dark:border-blue-900/10">
                                <div className="text-xs font-bold text-gray-600 dark:text-gray-300 max-w-[250px] truncate" title={String(val1 ?? "")}>
                                  {val1 !== null && val1 !== undefined ? String(val1) : <span className="text-gray-300 dark:text-gray-700 italic">—</span>}
                                </div>
                              </td>
                            );
                          }

                          const allSame = item.every((r) => r && String(r[cellIdx] || "") === String(val1 || ""));
                          if (allSame) {
                            return (
                              <td key={cellIdx} className="px-6 py-3 border-r border-blue-50 dark:border-blue-900/10">
                                <div className="text-xs font-bold text-gray-800 dark:text-gray-200 max-w-[250px] truncate" title={String(val1 ?? "")}>
                                  {val1 !== null && val1 !== undefined ? String(val1) : <span className="text-gray-300 dark:text-gray-700 italic">—</span>}
                                </div>
                              </td>
                            );
                          } else {
                            return (
                              <td key={cellIdx} className="px-6 py-2 border-r border-blue-50 dark:border-blue-900/10 align-middle">
                                <div className="flex flex-col gap-1.5 py-1">
                                  {item.map((r, subIdx) => (
                                    <div key={subIdx} className="text-xs font-bold text-gray-800 dark:text-white max-w-[250px] truncate border-b border-gray-50 dark:border-gray-800 last:border-0 pb-1 last:pb-0" title={String(r?.[cellIdx] ?? "")}>
                                      {r?.[cellIdx] !== null && r?.[cellIdx] !== undefined ? String(r[cellIdx]) : <span className="opacity-30 italic">—</span>}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            );
                          }
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== TABLE FOOTER - Statistics Bar ===== */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-t border-blue-50 dark:border-blue-900/20">
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-blue-300">{headers.length}</span> {t("data_sync.columns").toUpperCase()}
            </div>
            <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600 dark:text-blue-300">{rows.length}</span> {t("data_sync.rows").toUpperCase()}
            </div>
          </div>
          {sortCol !== null && (
            <button
              onClick={() => { setSortCol(null); setSortAsc(true); }}
              className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800 flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              {t("data_sync.clear_sort")}
            </button>
          )}
        </div>
      </div>
    </div >
  );
};

// Icon map cho từng field phổ biến
const FIELD_ICONS = {
  id: "", file_name: "", sheet_name: "", created_at: "",
  updated_at: "", data: "", meta: "", record_id: "",
  status: "", name: "", type: "",
};

// Phân loại field: "data", "config", "scores", "referrers" là field chính, còn lại là meta
const META_FIELDS = ["id", "file_name", "sheet_name", "created_at", "updated_at", "status", "type"];
const DATA_FIELDS = ["data", "config_system", "scores", "referrers"]; // Các field hiển th hiển thị ở tab riêng

// Render referrers data dạng bảng
const ReferrersTable = ({ value }) => {
  const { t } = useTranslation();
  if (!value) return null;
  let valueParse;
  try {
    valueParse = typeof value === "string" ? JSON.parse(value) : value;
  } catch (e) {
    return <div className="text-rose-500 italic p-4">{t("data_sync.invalid_data")}</div>;
  }
  const refData = Array.isArray(valueParse) ? valueParse : Object.values(valueParse || {});
  if (refData.length === 0) return <div className="text-gray-400 italic p-4">{t("data_sync.no_data")}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {refData.map((row, idx) => {
        const role = row.role || "";
        const isCenter = role.toLowerCase().includes('center');
        const isTechnical = role.toLowerCase().includes('technical') || role.toLowerCase().includes('operator');

        return (
          <div key={idx} className="relative group p-4 bg-white dark:bg-gray-800 rounded border-2 border-blue-50 dark:border-blue-900/30 hover:border-blue-500 dark:hover:border-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10">
            {/* Index Badge */}
            <div className="absolute -top-3 -left-3 w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-mono text-xs font-black shadow-lg shadow-blue-500/30 z-10">
              {idx + 1}
            </div>

            <div className="flex items-center gap-4">
              {/* Avatar Icon Container */}
              {/* <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 ${isCenter ? 'bg-amber-100 border-amber-500 text-amber-600' : isTechnical ? 'bg-purple-100 border-purple-500 text-purple-600' : 'bg-blue-100 border-blue-500 text-blue-600'}`}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div> */}

              <div className="flex-1 min-w-0">
                {/* Full Name */}
                <h4 className="text-lg font-black text-blue-950 dark:text-blue-50 truncate leading-tight mb-1">
                  {row.full_name || row.fullname || row.name || "—"}
                </h4>

                {/* Role Badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${isCenter ? 'bg-amber-500 text-white' : isTechnical ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {t(`data_sync.role_labels.${role}`, { defaultValue: role })}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-300 uppercase">
                    {role}
                  </span>
                </div>

                {/* Additional Info Grid */}
                {/* <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                  {Object.entries(row)
                    .filter(([k]) => !['role', 'full_name', 'fullname', 'name', 'REFEREE_ID'].includes(k))
                    .map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                          {t(`data_sync.meta_labels.${k}`, { defaultValue: k })}
                        </span>
                        <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 truncate">
                          {String(v ?? "—")}
                        </span>
                      </div>
                    ))}
                </div> */}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Component hiển thị dạng Key-Value cho Config và Scores
const KVObjectDisplay = ({ data, type = "blue" }) => {
  const { t } = useTranslation();
  if (!data || typeof data !== 'object') return null;

  const entries = Object.entries(data).filter(([k]) => k !== 'lkey');
  if (entries.length === 0) return <div className="text-gray-400 italic p-4">{t("data_sync.no_data")}</div>;

  const activeColor = "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 transition-all group">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${activeColor}`}>
              {t(`data_sync.meta_labels.${key}`, { defaultValue: key.replace(/_/g, ' ') })}
            </span>
            <span className="text-[9px] font-mono text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {key}
            </span>
          </div>
          <div className="text-sm font-black text-gray-800 dark:text-gray-200 break-all">
            {value && typeof value === 'object' ? (
              <pre className="text-[10px] bg-gray-50 dark:bg-gray-900 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(cleanObject(value), null, 2)}
              </pre>
            ) : String(value ?? "—")}
          </div>
        </div>
      ))}
    </div>
  );
};

const RecordDetailModal = ({ show, record, onClose }) => {
  const { t, i18n } = useTranslation();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("table"); // "table" | "json" | "config" | "scores" | "referrers"

  if (!show || !record) return null;

  // Lọc ra các field data và meta
  const hasData = "data" in record;
  const hasConfig = "config_system" in record && record.config_system;
  const hasScores = "scores" in record && record.scores;
  const hasReferrers = "referrers" in record && record.referrers;

  // Loại bỏ tất cả DATA_FIELDS khỏi meta
  const metaEntries = Object.entries(record).filter(([k]) => !DATA_FIELDS.includes(k));

  const tryParse = (val) => {
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch (e) { return val; }
  };

  const dataValue = record.data;
  const configValue = tryParse(record.config_system);
  const scoresValue = tryParse(record.scores);
  const referrersValue = record.referrers;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMetaValue = (key, value) => {
    if (value === null || value === undefined)
      return <span className="text-gray-400 italic text-xs">null</span>;
    if (typeof value === "object")
      return (
        <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-900 rounded p-1.5 max-h-20 overflow-y-auto text-gray-700 dark:text-gray-300">
          {JSON.stringify(cleanObject(value), null, 2)}
        </pre>
      );
    const str = String(value);
    // Nhận diện datetime
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const d = new Date(str);
      return (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {isNaN(d) ? str : d.toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US")}
        </span>
      );
    }
    return (
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-all">
        {str}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-blue-950/40" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-900 rounded w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden border border-blue-50 dark:border-blue-900/30">

        {/* ===== MODAL HEADER - Premium Blue Gradient ===== */}
        <div className="relative px-10 py-10 bg-blue-600 overflow-hidden flex-shrink-0">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-24 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center text-white ">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-[10px] font-black text-blue-100/60 uppercase tracking-[0.4em]">{t("data_sync.check_data_properties")}</h2>
                  <span className="text-[10px] font-mono bg-white/20 text-white px-3 py-0.5 rounded-full">
                    ID #{record.id}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                  {t("data_sync.system_record_detail")}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center bg-black/10 hover:bg-black/20 text-white rounded-full transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* ===== MODAL BODY - Split Layout ===== */}
        <div className="flex flex-1 overflow-hidden min-h-0 bg-gray-50/30 dark:bg-gray-900/40">

          {/* LEFT PANEL — Metadata Control Panel */}
          <div className="w-72 flex-shrink-0 border-r border-blue-50 dark:border-blue-900/30 bg-white/50 dark:bg-gray-800/20 flex flex-col overflow-hidden">
            <div className="px-8 py-5 border-b border-blue-50 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {t("data_sync.metadata")}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
              {metaEntries.map(([key, value]) => (
                <div key={key} className="p-4 rounded hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-blue-50 dark:hover:border-blue-900/30 group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 flex items-center justify-center text-blue-400 group-hover:text-blue-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                      {t(`data_sync.meta_labels.${key}`, { defaultValue: key.replace(/_/g, ' ') })}
                    </span>
                  </div>
                  <div className="pl-7">
                    {renderMetaValue(key, value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL — Core Data Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {(hasData || hasConfig || hasScores || hasReferrers) ? (
              <>
                {/* Tab Navigation - Pill Style */}
                <div className="px-8 py-4 bg-white dark:bg-gray-950/20 border-b border-blue-50 dark:border-blue-900/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 p-1 bg-blue-50 dark:bg-gray-900 rounded border border-blue-100 dark:border-blue-800 overflow-x-auto">
                    {hasData && (
                      <button
                        onClick={() => setActiveTab("table")}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "table"
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400  scale-105"
                          : "text-blue-400/60 hover:text-blue-600"
                          }`}
                      >
                        {t("data_sync.data")}
                      </button>
                    )}
                    {/* {hasConfig && (
                      <button
                        onClick={() => setActiveTab("config")}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "config"
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400  scale-105"
                          : "text-blue-400/60 hover:text-blue-600"
                          }`}
                      >
                        {t("data_sync.config")}
                      </button>
                    )} */}
                    {hasScores && (
                      <button
                        onClick={() => setActiveTab("scores")}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "scores"
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400  scale-105"
                          : "text-blue-400/60 hover:text-blue-600"
                          }`}
                      >
                        {t("data_sync.scores")}
                      </button>
                    )}
                    {hasReferrers && (
                      <button
                        onClick={() => setActiveTab("referrers")}
                        className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "referrers"
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400  scale-105"
                          : "text-blue-400/60 hover:text-blue-600"
                          }`}
                      >
                        {t("data_sync.referees")}
                      </button>
                    )}
                    {/* <button
                      onClick={() => setActiveTab("json")}
                      className={`px-6 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "json"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400  scale-105"
                        : "text-indigo-400/60 hover:text-indigo-600"
                        }`}
                    >
                      {t("data_sync.json")}
                    </button> */}
                  </div>

                  {record.file_name && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 dark:bg-blue-900/40 rounded-full border border-blue-100 dark:border-blue-800">
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-[10px] font-black text-blue-950 dark:text-blue-100 uppercase tracking-widest">{record.file_name}</span>
                      <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{record.sheet_name || t("data_sync.master_sheet")}</span>
                    </div>
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                  {activeTab === "table" && hasData ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <CompDKDataTable value={dataValue} fileName={record.file_name} />
                    </div>
                  ) : activeTab === "config" && hasConfig ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded border-2 border-blue-100 dark:border-blue-800 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </div>
                          <h3 className="text-xl font-black text-blue-700 dark:text-blue-300 uppercase">{t("data_sync.config")}</h3>
                        </div>
                        <KVObjectDisplay data={configValue} type="blue" />
                      </div>
                    </div>
                  ) : activeTab === "scores" && hasScores ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded border-2 border-blue-100 dark:border-blue-800 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                          </div>
                          <h3 className="text-xl font-black text-blue-700 dark:text-blue-300 uppercase">{t("data_sync.scores")}</h3>
                        </div>
                        <KVObjectDisplay data={scoresValue} type="blue" />
                      </div>
                    </div>
                  ) : activeTab === "referrers" && hasReferrers ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded border-2 border-blue-100 dark:border-blue-800 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                          <h3 className="text-xl font-black text-blue-700 dark:text-blue-300 uppercase">{t("data_sync.referees")}</h3>
                        </div>
                        <ReferrersTable value={referrersValue} />
                      </div>
                    </div>
                  ) : activeTab === "json" ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
                      <pre className="h-full font-mono text-xs p-8 bg-blue-950 dark:bg-black text-blue-200 dark:text-blue-400 rounded border border-blue-900/50 overflow-auto custom-scrollbar leading-relaxed">
                        {JSON.stringify(record, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              /* No Data Fallback */
              <div className="flex-1 flex flex-col p-8 overflow-hidden">
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">{t("data_sync.json_data_structure")}</h4>
                </div>
                <div className="flex-1 overflow-hidden rounded border border-blue-50 dark:border-blue-900/30 ">
                  <pre className="h-full font-mono text-xs p-8 bg-gray-50 dark:bg-gray-950 text-blue-950 dark:text-blue-100 overflow-auto custom-scrollbar leading-relaxed">
                    {JSON.stringify(record, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== MODAL FOOTER - Action Bar ===== */}
        <div className="px-10 py-6 border-t border-blue-50 dark:border-blue-900/30 bg-white dark:bg-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              <span className="text-gray-600 dark:text-gray-300">{Object.keys(record).length}</span>
              {t("data_sync.fields_detected")}
            </div>
            {(hasData || hasScores || hasReferrers) && (
              <div className="flex items-center gap-2">
                {hasData && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {t("data_sync.data")}
                  </div>
                )}
                {/* {hasConfig && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {t("data_sync.config")}
                  </div>
                )} */}
                {hasScores && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {t("data_sync.scores")}
                  </div>
                )}
                {hasReferrers && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {t("data_sync.referees")}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded text-[10px] font-black uppercase tracking-widest border-2 border-blue-50 dark:border-blue-900/30 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
            >
              {t("data_sync.close_details")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecordDetailModal;
