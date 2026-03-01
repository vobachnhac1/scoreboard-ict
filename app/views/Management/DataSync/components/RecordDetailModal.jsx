import React, { useState } from "react";
import { META_FIELDS_NAME } from "../constants";

// Parse data field của competition_dk
const parseCompDKData = (value) => {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
};

// Render field data của competition_dk dạng bảng đẹp với export CSV
const CompDKDataTable = ({ value, fileName }) => {
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const parsed = parseCompDKData(value);
  if (!parsed) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
        <span className="text-gray-400 dark:text-gray-500 italic text-sm">
          {value ? "Dữ liệu không hợp lệ" : "Không có dữ liệu"}
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

  // tạo format dữ liệu lại trước khi data theo dạng DK, DOL thì không cần đổi | TUV, SOL thì cần dổi 2 row thì 1 | DAL thì cần đổi 4 row thành 1
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
      let count = 0;
      for (let i = 0; i < rows.length; i += count) {
        let arrRow = []
        if (rows[i][1] == "VON" && rows[i][5] != null) {
          count = Number(rows[i][5]) > 1 ? Number(rows[i][5]) : 1;
        }
        for (let j = 0; j < count; j++) {
          arrRow.push(rows[i + j]);
        }
        formatted.push(arrRow);
      }
    }
    return formatted;
  };

  return (
    <div className="mt-2">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
            {rows.length} / {originalCount}
          </span>
          {q && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-medium">
              Đang lọc
            </span>
          )}
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 Tìm kiếm trong bảng..."
            className="w-full pl-3 pr-8 py-1.5 text-sm border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-shadow"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={exportCSV}
          className="shrink-0 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          title="Xuất file CSV"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV
        </button>
      </div>

      {/* Table */}
      <div className="border-2 border-gray-200 dark:border-gray-600 rounded overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2.5 text-center text-gray-500 dark:text-gray-400 border-r-2 border-gray-300 dark:border-gray-600 w-12 select-none font-bold bg-gray-100 dark:bg-gray-700">
                    #
                  </th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      onClick={() => toggleSort(idx)}
                      className="px-4 py-2.5 text-left font-bold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600 whitespace-nowrap cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 select-none group transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span>{header}</span>
                        <span className={`text-xs transition-all ${sortCol === idx ? "opacity-100 text-blue-600 dark:text-blue-400" : "opacity-0 group-hover:opacity-50 text-gray-400"}`}>
                          {sortCol === idx ? (sortAsc ? "▲" : "▼") : "▲"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={headers.length + 1}
                      className="px-4 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {/* <span className="text-4xl opacity-20">{q ? "🔍" : "📭"}</span> */}
                        <span className="text-gray-400 dark:text-gray-500 italic">
                          {q ? "Không tìm thấy kết quả phù hợp" : "Không có dữ liệu"}
                        </span>
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
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-blue-900/20 dark:hover:to-transparent transition-all group"
                      >
                        <td className="px-3 py-2.5 text-center text-gray-400 dark:text-gray-500 border-r-2 border-gray-100 dark:border-gray-700 select-none font-mono font-semibold text-xs bg-gray-50 dark:bg-gray-900">
                          {rowIdx + 1}
                        </td>
                        {headers.map((headerStr, cellIdx) => {
                          // headers[0] = STT |  headers[1] = Mã | headers[2] = Họ tên | headers[3] = Đơn vị | headers[4] = Nội dung thi
                          // nêu row là array -> cột STT, Mã, Đơn vị, Nội dung thi sẽ được gộp lại
                          if (!isGrouped) {
                            const val = displayRow[cellIdx];
                            return (
                              <td
                                key={cellIdx}
                                className="px-4 py-2.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700"
                              >
                                <div
                                  className="max-w-[250px] truncate"
                                  title={String(val ?? "")}
                                >
                                  {val !== null && val !== undefined
                                    ? String(val)
                                    : <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                                </div>
                              </td>
                            );
                          }

                          // Cho trường hợp Grouped (ví dụ: TUV, SOL, DAL)
                          const val1 = displayRow[cellIdx];
                          const headerLower = String(headerStr).toLowerCase();
                          // Xác định những cột cần "gộp" (stack) để hiển thị đồng thời nhiều giá trị
                          // Ở vị trí 1 và 2 thường là tên hoặc thông tin định danh
                          let isNameCol = headerLower.includes('họ tên') || headerLower.includes('họ và tên') || headerLower === 'tên' || cellIdx === 2;

                          if (headers[0] == 'VON') {
                            isNameCol = headerLower.includes('họ tên') || headerLower.includes('họ và tên') || headerLower === 'tên' || cellIdx === 3;
                          }

                          if (isNameCol) {
                            return (
                              <td
                                key={cellIdx}
                                className="px-4 py-2 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 align-middle bg-blue-50/40 dark:bg-blue-900/20 z-10"
                              >
                                <div className="flex flex-col gap-1.5 leading-tight">
                                  {item.map((r, subIdx) => {
                                    if (!r) return null;
                                    const textColors = ["text-blue-700 dark:text-blue-400", "text-indigo-700 dark:text-indigo-400", "text-green-700 dark:text-green-400", "text-orange-700 dark:text-orange-400"];
                                    const dotColors = ["bg-blue-500", "bg-indigo-500", "bg-green-500", "bg-orange-500"];
                                    const tColor = textColors[subIdx % textColors.length];
                                    const dColor = dotColors[subIdx % dotColors.length];
                                    return (
                                      <React.Fragment key={subIdx}>
                                        {subIdx > 0 && <div className="w-full h-px bg-blue-200 dark:bg-blue-800"></div>}
                                        <div
                                          className={`max-w-[250px] truncate flex items-center gap-2`}
                                          title={String(r[cellIdx] ?? "")}
                                        >
                                          {/* <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dColor}`}></span> */}
                                          {r[cellIdx] !== null && r[cellIdx] !== undefined
                                            ? subIdx + 1 + ". " + String(r[cellIdx])
                                            : <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                                        </div>
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </td>
                            );
                          }

                          // STT (0), Mã (1), Đơn vị (3), Nội dung thi (4) -> Được yêu cầu hiển thị gộp thông tin thành dạng duy nhất
                          let isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 3 || cellIdx === 4;
                          // trường hợp VON thì đơn vị là cột 3
                          if (headers[0] == "VON") {
                            isStaticCol = cellIdx === 0 || cellIdx === 1 || cellIdx === 2 || cellIdx === 4 || cellIdx === 5;
                          }

                          // trường hợp 
                          if (isStaticCol) {
                            return (
                              <td
                                key={cellIdx}
                                className="px-4 py-2.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700"
                              >
                                <div
                                  className="max-w-[250px] truncate"
                                  title={String(val1 ?? "")}
                                >
                                  {val1 !== null && val1 !== undefined
                                    ? String(val1)
                                    : <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                                </div>
                              </td>
                            );
                          }

                          // Những cột khác, nếu giá trị giống nhau hoàn toàn thì hiển thị 1 lần, khác thì stack
                          const allSame = item.every((r) => r && String(r[cellIdx] || "") === String(val1 || ""));
                          if (allSame) {
                            return (
                              <td
                                key={cellIdx}
                                className="px-4 py-2.5 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700"
                              >
                                <div
                                  className="max-w-[250px] truncate"
                                  title={String(val1 ?? "")}
                                >
                                  {val1 !== null && val1 !== undefined
                                    ? String(val1)
                                    : <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                                </div>
                              </td>
                            );
                          } else {
                            return (
                              <td
                                key={cellIdx}
                                className="px-4 py-2 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700 align-middle"
                              >
                                <div className="flex flex-col gap-1.5 leading-tight">
                                  {item.map((r, subIdx) => (
                                    <React.Fragment key={subIdx}>
                                      {subIdx > 0 && <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>}
                                      <div
                                        className="max-w-[250px] truncate"
                                        title={String(r?.[cellIdx] ?? "")}
                                      >
                                        {r?.[cellIdx] !== null && r?.[cellIdx] !== undefined
                                          ? String(r[cellIdx])
                                          : <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                                      </div>
                                    </React.Fragment>
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
      </div>

      {/* Footer stats */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {headers.length} cột × {rows.length} dòng
        </span>
        {sortCol !== null && (
          <button
            onClick={() => { setSortCol(null); setSortAsc(true); }}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ✕ Xóa sắp xếp
          </button>
        )}
      </div>
    </div>
  );
};

// Icon map cho từng field phổ biến
const FIELD_ICONS = {
  id: "", file_name: "", sheet_name: "", created_at: "",
  updated_at: "", data: "", meta: "", record_id: "",
  status: "", name: "", type: "",
};

// Phân loại field: "data" là field chính, còn lại là meta
const META_FIELDS = ["id", "file_name", "sheet_name", "created_at", "updated_at", "status", "type"];

const RecordDetailModal = ({ show, record, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("table"); // "table" | "json"

  if (!show || !record) return null;

  const hasData = "data" in record;
  const metaEntries = Object.entries(record).filter(([k]) => k !== "data");
  const dataValue = record.data;

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
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    const str = String(value);
    // Nhận diện datetime
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const d = new Date(str);
      return (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {isNaN(d) ? str : d.toLocaleString("vi-VN")}
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded shadow-2xl w-full min-w-[80vw] min-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">

        {/* ── HEADER ── */}
        <div className="relative flex items-start justify-between px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 flex-shrink-0">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-24 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Chi tiết
              </h3>
              <span className="text-xs font-mono bg-white/20 text-white px-2 py-0.5 rounded-full">
                #{record.id}
              </span>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {record.file_name && (
                <span className="flex items-center gap-1 text-xs text-blue-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {record.file_name}
                </span>
              )}
              {record.sheet_name && (
                <>
                  <span className="text-blue-300">/</span>
                  <span className="text-xs text-blue-200">{record.sheet_name}</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors text-lg mt-0.5 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* LEFT — Meta fields panel */}
          <div className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Thông tin
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {metaEntries.map(([key, value]) => (
                <div key={key} className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">{FIELD_ICONS[key] || "▸"}</span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {META_FIELDS_NAME[key] || key.toUpperCase()}
                    </span>
                  </div>
                  <div className="pl-5">
                    {renderMetaValue(key, value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Data panel */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {hasData ? (
              <>
                {/* Tab bar */}
                <div className="flex items-center gap-0 px-4 pt-3 pb-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab("table")}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${activeTab === "table"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                  >
                    Dạng bảng
                  </button>
                  {/* <button
                    onClick={() => setActiveTab("json")}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                      activeTab === "json"
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {"{ }"} JSON raw
                  </button> */}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                  {activeTab === "table" ? (
                    <CompDKDataTable value={dataValue} fileName={record.file_name} />
                  ) : (
                    <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-800 rounded p-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 leading-relaxed">
                      {JSON.stringify(record.data, null, 2)}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              /* Không có data → hiển thị JSON toàn bộ */
              <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-gray-900">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    JSON raw
                  </span>
                </div>
                <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-800 rounded p-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 leading-relaxed">
                  {JSON.stringify(record, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {Object.keys(record).length} trường dữ liệu
          </span>
          <div className="flex gap-2">
            {/* <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-semibold transition-all ${
                copied
                  ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow"
              }`}
            >
              {copied ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Đã copy!</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy JSON</>
              )}
            </button> */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded text-sm font-semibold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecordDetailModal;



