import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabPanel } from "@headlessui/react";


export default function ConfigSystemPanel(props) {
  const { t } = useTranslation();
  const { selectedFile, sheetNames, selectedSheet, sheetData, headers, loading, handleFileChange, handleSheetChange, handleReset } = props;
  return (
    <>
      <TabPanel>
        {/* Download Template Section */}
        <div className="mb-6 flex justify-end">
          <a
            href="/exports/FILE_DIGISPORTS_TEMPLATE.xlsx"
            download="FILE_DIGISPORTS_TEMPLATE.xlsx"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border-2 border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t("competition_management.download_template")}
          </a>
        </div>

        {/* Upload File Section */}
        <div className="mb-8">
          <label htmlFor="file-upload" className="group cursor-pointer">
            <div className="relative overflow-hidden p-12 lg:p-16 border-4 border-dashed border-blue-100 dark:border-blue-900/30 rounded bg-blue-50/30 dark:bg-blue-900/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-500 text-center">
              {/* Background decoration */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white dark:bg-blue-900 rounded flex items-center justify-center text-blue-600 shadow-2xl  mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-blue-50 dark:">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">
                  {selectedFile
                    ? t("competition_management.file_selected")
                    : t("competition_management.upload_file")}
                </h3>
                <p className="text-sm font-bold text-blue-500 dark:text-blue-400 mb-6 max-w-md mx-auto italic">
                  {selectedFile
                    ? `${t("competition_management.file_ready")}: ${selectedFile.name}`
                    : t("competition_management.file_support")}
                </p>

                <div className="flex items-center gap-4">
                  {!selectedFile ? (
                    <div className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl shadow-blue-500/30 transition-all active:scale-95  ">
                      {t("competition_management.choose_file_from_device")}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleReset();
                      }}
                      className="px-8 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border border-red-200 transition-all active:scale-95"
                    >
                      {t("competition_management.remove_selected_file")}
                    </button>
                  )}
                </div>
              </div>

              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>
        </div>

        {/* Sheet Selection */}
        {sheetNames.length > 0 && (
          <div className="mb-10 bg-white dark:bg-gray-800 p-8 rounded border border-blue-50 dark:border-blue-900/30 shadow-xl shadow-blue-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-1">
                  {t("competition_management.data_structure")}
                </h3>
                <p className="text-xs text-blue-500 dark:text-blue-400 font-bold italic">
                  {t("competition_management.select_sheet")}
                </p>
              </div>

              <div className="relative flex-1 max-w-md">
                <select
                  id="sheet-select"
                  value={selectedSheet}
                  onChange={handleSheetChange}
                  className="w-full pl-5 pr-12 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark: focus:border-blue-500 outline-none rounded text-sm font-black text-blue-900 dark:text-blue-100 appearance-none transition-all shadow-inner"
                >
                  <option value="">
                    {t("competition_management.select_sheet_placeholder")}
                  </option>
                  {sheetNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-2xl  mb-6"></div>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs">
              {t("competition_management.loading_excel_data")}
            </p>
          </div>
        )}

        {/* Data Table */}
        {!loading && sheetData.length > 0 && (
          <div className="w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-blue-900/5 dark:bg-blue-900/20 rounded border border-blue-100 ">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg ">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight leading-none mb-1">
                    {t("competition_management.preview_data")}:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {selectedSheet.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs font-bold text-blue-500 dark:text-blue-400 italic">
                    {t("competition_management.check_structure")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                    {t("competition_management.scale")}
                  </p>
                  <p className="text-xl font-black text-blue-900 dark:text-blue-100 leading-none">
                    {sheetData.length}{" "}
                    <span className="text-xs font-bold text-blue-400">
                      {t("competition_management.rows")}
                    </span>
                  </p>
                </div>
                {(() => {
                  const firstDataRow = sheetData[0];
                  const format = firstDataRow?.[1] || "UNKNOWN";
                  const formatColors = {
                    SOL: "bg-blue-600 text-white shadow-blue-500/30",
                    TUV: "bg-emerald-600 text-white shadow-emerald-500/30",
                    DAL: "bg-indigo-600 text-white shadow-indigo-500/30",
                    DOL: "bg-orange-600 text-white shadow-orange-500/30",
                    DK: "bg-rose-600 text-white shadow-rose-500/30",
                    VON: "bg-amber-600 text-white shadow-amber-500/30",
                  };
                  return (
                    <div className="flex flex-col items-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                        {t("competition_management.format")}
                      </p>
                      <span
                        className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest shadow-lg ${formatColors[format] || "bg-gray-600 text-white"}`}
                      >
                        {format}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Scroll hint & table container */}
            <div className="relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-4 py-1 bg-blue-900/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                  <svg
                    className="w-3 h-3 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M7 16l-4-4m0 0l4-4m-4 4h18"
                    />
                  </svg>
                  {t("competition_management.scroll_to_view")}
                  <svg
                    className="w-3 h-3 animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>

              <div className="table-scroll-container overflow-x-auto overflow-y-auto max-h-[700px] border border-blue-50 dark:border-blue-900/30 rounded shadow-2xl shadow-blue-500/5 relative bg-white dark:bg-gray-900">
                <style>{`
                      .table-scroll-container::-webkit-scrollbar { height: 10px; width: 10px; }
                      .table-scroll-container::-webkit-scrollbar-track { background: rgba(59, 130, 246, 0.05); border-radius: 20px; }
                      .table-scroll-container::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
                      .table-scroll-container::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.6); }
                      
                      .table-scroll-container {
                        background:
                          linear-gradient(90deg, #fff 30%, rgba(255,255,255,0)),
                          linear-gradient(90deg, rgba(255,255,255,0), #fff 70%) 100% 0,
                          radial-gradient(farthest-side at 0 50%, rgba(0,0,0,.05), rgba(0,0,0,0)),
                          radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,.05), rgba(0,0,0,0)) 100% 0;
                        background-repeat: no-repeat;
                        background-size: 50px 100%, 50px 100%, 15px 100%, 15px 100%;
                        background-attachment: local, local, scroll, scroll;
                      }

                      .dark .table-scroll-container {
                        background:
                          linear-gradient(90deg, #111827 30%, rgba(17, 24, 39, 0)),
                          linear-gradient(90deg, rgba(17, 24, 39, 0), #111827 70%) 100% 0,
                          radial-gradient(farthest-side at 0 50%, rgba(0,0,0,.3), rgba(0,0,0,0)),
                          radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,.3), rgba(0,0,0,0)) 100% 0;
                        background-size: 50px 100%, 50px 100%, 15px 100%, 15px 100%;
                        background-repeat: no-repeat;
                        background-attachment: local, local, scroll, scroll;
                      }
                    `}</style>

                <table className="min-w-full divide-y divide-blue-50 dark:divide-blue-900/30 table-auto">
                  <thead className="bg-blue-50 dark:bg-blue-900 sticky top-0 z-20">
                    <tr className="border-b border-blue-100 ">
                      {!selectedSheet.startsWith("DK") && (
                        <>
                          <th className="px-5 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest border-r border-blue-50 dark:border-blue-900/20 min-w-[100px]">
                            {t("competition_management.team")}
                          </th>
                          <th className="px-5 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest border-r border-blue-50 dark:border-blue-900/20 min-w-[100px]">
                            {t("competition_management.id_code")}
                          </th>
                          <th className="px-5 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest border-r border-blue-50 dark:border-blue-900/20 min-w-[120px]">
                            {t("competition_management.form_type")}
                          </th>
                          <th className="px-5 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest border-r border-blue-50 dark:border-blue-900/20 min-w-[350px]">
                            {t("competition_management.athlete_list")}
                          </th>
                          <th className="px-5 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest border-r border-blue-50 dark:border-blue-900/20 min-w-[200px]">
                            {t(
                              "competition_management.competition_content",
                            )}
                          </th>
                        </>
                      )}

                      {headers.length > 5 &&
                        headers
                          .slice(!selectedSheet.startsWith("DK") ? 5 : 0)
                          .map((header, index) => (
                            <th
                              key={index + 5}
                              className="px-5 py-4 text-left text-[10px] font-black text-blue-400 uppercase tracking-widest border-r border-blue-50 dark:border-blue-900/20 last:border-r-0 min-w-[150px]"
                            >
                              {header ||
                                `${t("competition_management.column")} ${index + 6}`}
                            </th>
                          ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(() => {
                      // Detect format from first row
                      const firstDataRow = sheetData[0];
                      const detectedFormat = firstDataRow?.[1] || "";
                      const isDKFormat =
                        selectedSheet.startsWith("DK") ||
                        detectedFormat === "DK";

                      // Group rows into teams
                      const teams = [];
                      let currentTeam = null;
                      if (isDKFormat) {
                        /// thực hiện khi là DK
                        sheetData.forEach((row, rowIndex) => {
                          currentTeam = {
                            extraCols: row.slice(0),
                          };
                          teams.push(currentTeam);
                        });
                      } else {
                        let _matchType = selectedSheet.startsWith("VON")
                          ? "VON"
                          : null;
                        if (_matchType != null) {
                          const dataRows = sheetData;
                          // 1. Lấy dòng 1 kiểm tra cột số lượng cột số 5
                          let count = 1;
                          for (let i = 0; i < dataRows.length; i += count) {
                            const rowMain = dataRows[i];
                            const athletes = [];
                            if (rowMain.length > 0) {
                              if (
                                rowMain[5] != undefined &&
                                rowMain[5] != null
                              ) {
                                count = rowMain[5] > 1 ? rowMain[5] : 1;
                                for (let row = 0; row < count; row++) {
                                  // push vào mảng
                                  const item = dataRows[i + row] ?? {};
                                  athletes.push({
                                    name: item[3] ?? rowMain[2] ?? "",
                                    unit: rowMain[2] || "",
                                  });
                                }
                              }
                              // thực hiện push vào danh sách
                              teams.push({
                                teamNo: teams.length + 1,
                                matchNo: rowMain[0],
                                matchType: rowMain[1] || "",
                                matchName: rowMain[4] || "",
                                athletes: athletes,
                                extraCols: rowMain.slice(5),
                              });
                            }
                          }
                        } else {
                          sheetData.forEach((row, rowIndex) => {
                            const isTeamStart = row[0] && row[0] !== "";
                            if (isTeamStart) {
                              // Start new team
                              currentTeam = {
                                teamNo: teams.length + 1,
                                matchNo: row[0],
                                matchType: row[1] || "",
                                matchName: row[4] || "",
                                redName: row[2] || "",
                                blueName: row[3] || "",
                                athletes: [
                                  {
                                    name: row[2] || "",
                                    unit: row[3] || "",
                                  },
                                ],
                                extraCols: row.slice(5),
                              };
                              teams.push(currentTeam);
                            } else if (currentTeam && row[2]) {
                              // Add athlete to current team
                              currentTeam.athletes.push({
                                name: row[2] || "",
                                unit: row[3] || "",
                              });
                            }
                          });
                        }
                      }
                      // Render teams
                      return teams.map((team, teamIndex) => {
                        const matchType = team.matchType;
                        const bgColors = {
                          SOL: "bg-blue-50",
                          TUV: "bg-green-50",
                          DAL: "bg-blue-50",
                          DOL: "bg-orange-50",
                          DK: "bg-red-50",
                          VON: "bg-yellow-50",
                        };
                        const borderColors = {
                          SOL: "border-l-4 border-blue-400",
                          TUV: "border-l-4 border-green-400",
                          DAL: "border-l-4 border-blue-400",
                          DOL: "border-l-4 border-orange-400",
                          DK: "border-l-4 border-red-400",
                          VON: "border-l-4 border-yellow-400",
                        };

                        // DK format: Hiển thị khác
                        if (isDKFormat || matchType === "DK") {
                          return (
                            <tr
                              key={teamIndex}
                              className={`team-row ${bgColors[matchType] || "bg-gray-50"} ${borderColors[matchType] || "border-l-1 border-gray-400"} transition-all duration-200 ${teamIndex > 0 ? "border-t-1 border-gray-300" : ""}`}
                            >
                              {/* Extra Columns */}
                              {team.extraCols &&
                                team.extraCols.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300 last:border-r-0"
                                  >
                                    {cell !== null && cell !== undefined
                                      ? String(cell)
                                      : "-"}
                                  </td>
                                ))}
                            </tr>
                          );
                        }

                        // SOL/TUV/DAL/DOL format: Hiển thị đầy đủ
                        return (
                          <tr
                            key={teamIndex}
                            className={`team-row ${bgColors[matchType] || "bg-gray-50"} ${borderColors[matchType] || "border-l-1 border-gray-400"} transition-all duration-200 ${teamIndex > 0 ? "border-t-1 border-gray-300" : ""}`}
                          >
                            {/* Team Number */}
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-700 border-r border-gray-300">
                              <div className="team-badge flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg">
                                {team.teamNo}
                              </div>
                            </td>

                            {/* Match No */}
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-300">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {team.matchNo}
                                </span>
                              </div>
                            </td>

                            {/* Match Type Badge */}
                            <td className="px-4 py-4 whitespace-nowrap text-sm border-r border-gray-300">
                              <span
                                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${matchType === "SOL"
                                  ? "bg-blue-500 text-white"
                                  : matchType === "TUV"
                                    ? "bg-green-500 text-white"
                                    : matchType === "DAL"
                                      ? "bg-blue-500 text-white"
                                      : matchType === "DOL"
                                        ? "bg-orange-500 text-white"
                                        : matchType === "VON"
                                          ? "bg-yellow-500 text-white"
                                          : "bg-gray-500 text-white"
                                  }`}
                              >
                                {matchType}
                              </span>
                            </td>

                            {/* Athletes List */}
                            <td className="px-4 py-4 text-sm border-r border-gray-300">
                              <div className="space-y-2">
                                {team.athletes.map(
                                  (athlete, athleteIndex) => (
                                    <div
                                      key={athleteIndex}
                                      className="athlete-card flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 rounded shadow-sm border-2 border-gray-200 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 hover:translate-x-1 hover:shadow-md transition-all duration-200"
                                    >
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                        {athleteIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 truncate text-sm">
                                          {athlete.name || "-"}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                          <span>📍</span>
                                          <span>{athlete.unit || "-"}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                  <div className="text-xs text-gray-500 font-medium">
                                    {t(
                                      "competition_management.total_athletes",
                                    )}
                                    :
                                  </div>
                                  <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                    {team.athletes.length}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Match Name */}
                            <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-300">
                              <div className="font-medium">
                                {team.matchName || "-"}
                              </div>
                            </td>

                            {/* Extra Columns */}
                            {team.extraCols &&
                              team.extraCols.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300 last:border-r-0"
                                >
                                  {cell !== null && cell !== undefined
                                    ? String(cell)
                                    : "-"}
                                </td>
                              ))}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend Section */}
            <div className="p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded border border-blue-100 ">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">
                  {t("competition_management.format_legend")}
                </h4>
              </div>

              {[
                {
                  code: "DK",
                  label: t("competition_management.format_dk"),
                  color: "bg-rose-600",
                  desc: t("competition_management.format_dk_desc"),
                },
                {
                  code: "SOL",
                  label: t("competition_management.format_sol"),
                  color: "bg-blue-600",
                  desc: t("competition_management.format_sol_desc"),
                },
                {
                  code: "TUV",
                  label: t("competition_management.format_tuv"),
                  color: "bg-emerald-600",
                  desc: t("competition_management.format_tuv_desc"),
                },
                {
                  code: "DAL",
                  label: t("competition_management.format_dal"),
                  color: "bg-indigo-600",
                  desc: t("competition_management.format_dal_desc"),
                },
                {
                  code: "DOL",
                  label: t("competition_management.format_dol"),
                  color: "bg-orange-600",
                  desc: t("competition_management.format_dol_desc"),
                },
                {
                  code: "VON",
                  label: t("competition_management.format_von"),
                  color: "bg-amber-600",
                  desc: t("competition_management.format_von_desc"),
                },
              ].map((item) => (
                <div
                  key={item.code}
                  className="flex flex-col gap-1.5 p-3 bg-white dark:bg-blue-900/20 rounded border border-blue-50 dark: shadow-sm hover:shadow-md transition-shadow"
                >
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-black text-white ${item.color} w-fit`}
                  >
                    {item.code}
                  </span>
                  <p className="text-[11px] font-black text-blue-900 dark:text-blue-100 leading-none">
                    {item.label}
                  </p>
                  <p className="text-[9px] font-bold text-blue-400 italic leading-none">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-blue-100/50 ">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-400"></div>
                  <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    <strong className="font-black text-blue-600">
                      {t("competition_management.legend_dk_title")}
                    </strong>{" "}
                    {t("competition_management.legend_dk_desc")}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-400"></div>
                  <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    <strong className="font-black text-blue-600">
                      {t("competition_management.legend_form_title")}
                    </strong>{" "}
                    {t("competition_management.legend_form_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - No Sheet Selected */}
        {!loading &&
          selectedFile &&
          sheetNames.length > 0 &&
          !selectedSheet && (
            <div className="text-center py-24 bg-blue-50/20 dark:bg-blue-900/10 rounded border-2 border-dashed border-blue-100 ">
              <div className="w-20 h-20 bg-white dark:bg-blue-900 rounded flex items-center justify-center mx-auto mb-6 shadow-xl border border-blue-50 dark:">
                <svg
                  className="w-10 h-10 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">
                {t("competition_management.ready_to_analyze")}
              </h4>
              <p className="text-blue-500 text-xs font-bold italic">
                {t("competition_management.please_select_sheet")}
              </p>
            </div>
          )}

        {/* Empty State - No File Selected */}
        {!loading && !selectedFile && (
          <div className="text-center py-24 bg-blue-50/20 dark:bg-blue-900/10 rounded border-2 border-dashed border-blue-100 ">
            <div className="w-20 h-20 bg-white dark:bg-blue-900 rounded flex items-center justify-center mx-auto mb-6 shadow-xl border border-blue-50 dark:">
              <svg
                className="w-10 h-10 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">
              {t("competition_management.no_data")}
            </h4>
            <p className="text-blue-500 text-xs font-bold italic text-center max-w-sm mx-auto">
              {t("competition_management.upload_excel_description")}
            </p>
          </div>
        )}
      </TabPanel>
    </>
  );
}
