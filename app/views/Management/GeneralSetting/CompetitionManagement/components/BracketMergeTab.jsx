import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Bracket } from "react-brackets";
import { useTranslation } from "react-i18next";
import { generateKnockoutMatches } from "../../../../../utils/bracketGenerator";
import { readSheetNames } from "read-excel-file";
import readXlsxFile from "read-excel-file";
import axios from "axios";
import { formatMatchName } from "../../../../../utils/nameFormatter"; // Added this import
import useConfirmModal from "../../../../../hooks/useConfirmModal";
import * as XLSX from "xlsx";

export default function BracketMergeTab({ onMergeComplete }) {
    const { t } = useTranslation();
    const { showSuccess, showError } = useConfirmModal();
    const [step, setStep] = useState(1);

    // States for Wizard
    const [file, setFile] = useState(null);
    const [sheetNames, setSheetNames] = useState([]);
    const [hcSheets, setHcSheets] = useState([]);
    const [selectedSheets, setSelectedSheets] = useState([]);

    // States for Generated Data
    const [generatedData, setGeneratedData] = useState({});
    const [mergedMatches, setMergedMatches] = useState([]);
    const [byePosition, setByePosition] = useState("top");
    const [customSheetSuffix, setCustomSheetSuffix] = useState("");

    // States for Tree display
    const [treeModalOpen, setTreeModalOpen] = useState(false);
    const [selectedTreeSheet, setSelectedTreeSheet] = useState(null);
    const [expandedSheets, setExpandedSheets] = useState({});

    const toggleSheetExpand = (sheetName) => {
        setExpandedSheets((prev) => ({
            ...prev,
            [sheetName]: !prev[sheetName],
        }));
    };

    const getBracketData = (sheetName) => {
        if (!sheetName || !generatedData[sheetName]) return [];
        const matches = generatedData[sheetName].matches || [];
        const roundsMap = {};
        matches.forEach((m) => {
            if (!roundsMap[m.roundIndex]) {
                roundsMap[m.roundIndex] = {
                    title: m.roundName,
                    seeds: [],
                };
            }
            roundsMap[m.roundIndex].seeds.push({
                id: m.matchNo,
                date: m.isVirtual ? "" : `${t("bracket_merge.match")} ${m.matchNo} `,
                teams: [{ name: formatMatchName(m.red_name, t) || "TBD" }, { name: formatMatchName(m.blue_name, t) || "TBD" }],
            });
        });
        return Object.values(roundsMap);
    };

    // --- STEP 1: Upload File ---
    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;
        setFile(uploadedFile);
        try {
            const names = await readSheetNames(uploadedFile);
            setSheetNames(names);
            const hcs = names.filter((n) => n.startsWith("HC"));
            setHcSheets(hcs);
            setSelectedSheets(hcs); // Mặc định tự chọn tất cả các sheet HC
            setStep(2);
        } catch (err) {
            showError(t("competition_management.error_read_excel"));
        }
    };

    // --- STEP 2: Chọn Sheet ---
    const handleToggleSheet = (sheetName) => {
        setSelectedSheets((prev) => {
            if (prev.includes(sheetName)) return prev.filter((s) => s !== sheetName);
            return [...prev, sheetName];
        });
    };

    const handleConfirmSheets = async () => {
        if (selectedSheets.length === 0)
            return showError(t("bracket_merge.require_select_sheet"));

        let tempGen = {};
        for (let sheetName of selectedSheets) {
            const sheetIndex = sheetNames.indexOf(sheetName) + 1;
            const rows = await readXlsxFile(file, { sheet: sheetIndex });
            const dataRows = rows.slice(1);
            const athletes = dataRows.map((row) => ({
                name: row[3] || "",
                weight: row[1] || sheetName.replace("HC", "").trim(),
                unit: row[4] || "",
                country: "Việt Nam",
                seed: row[6] ? parseInt(row[6]) : null,
            }));
            const matches = generateKnockoutMatches(athletes, byePosition);
            tempGen[sheetName] = {
                athletes,
                matches,
                weight: athletes[0]?.weight || sheetName.replace("HC", "").trim(),
            };
        }
        setGeneratedData(tempGen);
        setStep(3);
    };

    // --- STEP 3: Combine logic & Navigate to Merge ---
    const reindexComplexMatches = (matchesArr) => {
        const cloned = JSON.parse(JSON.stringify(matchesArr));
        const mapping = {};

        // Khởi tạo map ID gốc -> STT hiển thị mới
        cloned.forEach((m, index) => {
            const newIndex = index + 1;
            mapping[m.original_win_id] = `win.${newIndex}`;
            m.matchNo = newIndex;
        });

        // Xoay vòng cập nhật lại dependency bằng original_name map sang index hiển thị
        cloned.forEach((m) => {
            if (m.original_red_name && mapping[m.original_red_name]) {
                m.red_name = mapping[m.original_red_name];
            } else {
                m.red_name = m.original_red_name;
            }

            if (m.original_blue_name && mapping[m.original_blue_name]) {
                m.blue_name = mapping[m.original_blue_name];
            } else {
                m.blue_name = m.original_blue_name;
            }
        });

        return cloned;
    };

    const prepareMerge = () => {
        let combined = [];

        for (const sheetName of selectedSheets) {
            const { matches, weight } = generatedData[sheetName];
            const realMatches = matches.filter((m) => !m.isVirtual);

            let mapped = realMatches.map((m) => {
                const red_name =
                    m.red_name && m.red_name.startsWith("win.")
                        ? m.red_name.replace("win.", `win.${sheetName}_`)
                        : m.red_name;
                const blue_name =
                    m.blue_name && m.blue_name.startsWith("win.")
                        ? m.blue_name.replace("win.", `win.${sheetName}_`)
                        : m.blue_name;

                return {
                    ...m,
                    db_id: `temp_${sheetName}_${m.matchNo}`,
                    original_win_id: `win.${sheetName}_${m.matchNo}`,
                    original_red_name: red_name,
                    original_blue_name: blue_name,
                    weight: weight,
                    red_name: red_name,
                    blue_name: blue_name,
                };
            });

            combined = [...combined, ...mapped];
        }

        // Auto sort by roundWeight (Dồn Vòng loại về trước, sau đó TK -> BK -> CK)
        combined.sort((a, b) => {
            if (a.roundWeight !== b.roundWeight) return a.roundWeight - b.roundWeight;
            if (a.weight !== b.weight) return a.weight.localeCompare(b.weight);
            return 0; // retain mapped original order within same round/weight
        });

        setMergedMatches(reindexComplexMatches(combined));
        setStep(4);
    };

    // --- STEP 4: Drag & Drop ---
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(mergedMatches);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        // Tự động map sửa lại win.X dependencies do index bị xô lệch
        const reindexedItems = reindexComplexMatches(items);
        setMergedMatches(reindexedItems);
    };

    // --- STEP 6: Save Final ---
    const handleFinalSave = async () => {
        try {
            // Format data theo chuẩn để có thể view detail trong trang Match Detail
            const tableData = [
                [
                    "STT",
                    "Vòng đấu",
                    "Hạng Cân",
                    "Họ tên đỏ",
                    "Đơn vị đỏ",
                    "Quốc kỳ",
                    "Họ tên xanh",
                    "Đơn vị xanh",
                    "Quốc kỳ",
                ],
            ];
            mergedMatches.forEach((m) => {
                tableData.push([
                    m.matchNo,
                    m.roundName,
                    m.weight,
                    m.red_name,
                    m.red_unit,
                    "Việt Nam",
                    m.blue_name,
                    m.blue_unit,
                    "Việt Nam",
                ]);
            });

            const finalSheetSuffix =
                customSheetSuffix.trim() !== ""
                    ? customSheetSuffix.trim()
                    : new Date().getTime();

            // Lưu gốc
            const response = await axios.post(
                "http://localhost:6789/api/competition-dk",
                {
                    sheet_name: `HC_AUTO_${finalSheetSuffix} `, // Nhãn HC_AUTO_ để dễ parse sau này
                    file_name: file.name,
                    data: tableData,
                },
            );

            if (response.data.success) {
                const competitionDkId = response.data.data.id;

                const matchesToCreate = mergedMatches.map((match, index) => ({
                    competition_dk_id: competitionDkId,
                    row_index: index,
                    match_no: match.matchNo.toString(),
                    match_type: "DK",
                    red_name: match.red_name,
                    red_team: match.red_unit,
                    blue_name: match.blue_name,
                    blue_team: match.blue_unit,
                    match_status: "WAI",
                    config_system: {},
                }));

                await axios.post("http://localhost:6789/api/competition-match/bulk", {
                    matches: matchesToCreate,
                });

                showSuccess(t("bracket_merge.save_success"));
                setStep(1);
                setFile(null);
                if (onMergeComplete) onMergeComplete();
            }
        } catch (error) {
            console.error(error);
            showError(t("bracket_merge.save_failed"));
        }
    };

    const handleExportExcel = () => {
        const tableData = [
            [
                "STT",
                "Vòng đấu",
                "Hạng Cân",
                "Họ tên đỏ",
                "Đơn vị đỏ",
                "Quốc kỳ",
                "Họ tên xanh",
                "Đơn vị xanh",
                "Quốc kỳ",
            ],
        ];
        mergedMatches.forEach((m) => {
            tableData.push([
                m.matchNo,
                m.roundName,
                m.weight,
                m.red_name,
                m.red_unit,
                "Việt Nam",
                m.blue_name,
                m.blue_unit,
                "Việt Nam",
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(tableData);
        // Tự động scale độ rộng cột
        const colWidths = tableData[0].map((_, colIndex) => {
            const maxLen = Math.max(...tableData.map(row => (row[colIndex] ? row[colIndex].toString().length : 0)));
            return { wch: maxLen + 2 };
        });
        ws["!cols"] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachGop");
        const finalSheetSuffix = customSheetSuffix.trim() !== "" ? customSheetSuffix.trim() : new Date().getTime();
        XLSX.writeFile(wb, `HC_AUTO_${finalSheetSuffix}.xlsx`);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Thanh điều hướng tiến trình */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <React.Fragment key={s}>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? "bg-emerald-600 text-white " : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
                            >
                                {s}
                            </div>
                            {s < 6 && (
                                <div
                                    className={`w-10 h-1 rounded ${step > s ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                                ></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded border border-gray-100 dark:border-gray-700 ">
                {/* BƯỚC 1: UPLOAD FILE */}
                {step === 1 && (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-black mb-2 text-blue-900 dark:text-blue-100">
                            {t("bracket_merge.step_1_title")}
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                            {t("bracket_merge.step_1_desc")}
                        </p>
                        <div className="relative overflow-hidden inline-block cursor-pointer">
                            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded  hover:bg-blue-700 transition">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 inline-block mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                                {t("bracket_merge.select_excel_file")}
                            </button>
                            <input
                                type="file"
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                )}

                {/* BƯỚC 2: CHỌN SHEET */}
                {step === 2 && (
                    <div>
                        <h3 className="text-xl font-black uppercase text-blue-900 dark:text-blue-100 mb-6">
                            {t("bracket_merge.step_2_title")}
                        </h3>
                        <div className="mb-6 p-4 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3 uppercase">
                                {t("bracket_merge.bye_position_config")}
                            </h4>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="byePos"
                                        checked={byePosition === "top"}
                                        onChange={() => setByePosition("top")}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {t("bracket_merge.bye_position_top")}
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="byePos"
                                        checked={byePosition === "bottom"}
                                        onChange={() => setByePosition("bottom")}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        {t("bracket_merge.bye_position_bottom")}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {hcSheets.length > 0 ? (
                                hcSheets.map((sheet) => {
                                    const isSelected = selectedSheets.includes(sheet);
                                    return (
                                        <button
                                            key={sheet}
                                            onClick={() => handleToggleSheet(sheet)}
                                            className={`px-4 py-3 rounded border-2 transition-all font-bold text-sm ${isSelected
                                                ? "bg-blue-600 border-blue-600 text-white "
                                                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-400 text-gray-600 dark:text-gray-300"
                                                }`}
                                        >
                                            {sheet}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="text-rose-500 italic text-sm font-bold">
                                    {t("bracket_merge.error_no_hc_sheet")}
                                </p>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded mr-3"
                            >
                                {t("bracket_merge.back")}
                            </button>
                            <button
                                onClick={handleConfirmSheets}
                                disabled={selectedSheets.length === 0}
                                className="px-6 py-2 bg-emerald-600 disabled:opacity-50 text-white font-bold rounded hover:bg-emerald-700 transition"
                            >
                                {t("bracket_merge.confirm_preview")}
                            </button>
                        </div>
                    </div>
                )}

                {/* BƯỚC 3: REVIEW TỪNG TRẬN */}
                {step === 3 && (
                    <div>
                        <h3 className="text-xl font-black uppercase text-blue-900 dark:text-blue-100 mb-2">
                            {t("bracket_merge.step_3_title")}
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                            {t("bracket_merge.step_3_desc")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedSheets.map((sheetName) => (
                                <div
                                    key={sheetName}
                                    className="p-4 border rounded bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                >
                                    <div
                                        className="flex justify-between items-center mb-1 cursor-pointer select-none"
                                        onClick={() => toggleSheetExpand(sheetName)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transition-transform ${expandedSheets[sheetName] ? "rotate-180" : ""
                                                    }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            <h4 className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                                {sheetName}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTreeSheet(sheetName);
                                                setTreeModalOpen(true);
                                            }}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold rounded uppercase hover:bg-indigo-200 transition"
                                        >
                                            {t("bracket_merge.view_bracket")}
                                        </button>
                                    </div>
                                    <p
                                        className="text-xs text-gray-500 mt-1 mb-3 ml-7 cursor-pointer select-none"
                                        onClick={() => toggleSheetExpand(sheetName)}
                                    >
                                        {t("bracket_merge.athletes_count")}:{" "}
                                        {generatedData[sheetName]?.athletes?.length || 0} -{" "}
                                        {t("bracket_merge.matches_count")}:{" "}
                                        {
                                            (generatedData[sheetName]?.matches || []).filter(
                                                (m) => !m.isVirtual,
                                            ).length
                                        }
                                    </p>

                                    {expandedSheets[sheetName] && (
                                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 mt-4 ml-7">
                                            {(generatedData[sheetName]?.matches || [])
                                                .filter((m) => !m.isVirtual)
                                                .map((m) => (
                                                    <div
                                                        key={m.matchNo}
                                                        className="p-1.5 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 flex flex-col gap-1 hover:border-blue-200 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-center text-gray-500 mb-0.5 px-0.5">
                                                            <span className="text-[9px] font-bold text-gray-400">
                                                                {t("bracket_merge.match")} {m.matchNo}
                                                            </span>
                                                            <span className="text-[9px] uppercase font-bold text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                                                {m.roundName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 w-full overflow-hidden">
                                                            <div className="flex-1 min-w-0 flex flex-col bg-red-50 dark:bg-red-900/10 px-1.5 py-1.5 rounded">
                                                                <span className="font-bold text-red-600 truncate text-[10px] text-right w-full block" title={formatMatchName(m.red_name, t)}>
                                                                    {formatMatchName(m.red_name, t)}
                                                                </span>
                                                                <span className="text-[8px] text-gray-500 truncate text-right w-full block mt-0.5">
                                                                    {m.red_unit || t("bracket_merge.empty")}
                                                                </span>
                                                            </div>
                                                            <div className="text-[8px] font-black italic text-gray-300 px-0.5 flex-shrink-0">
                                                                VS
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col bg-blue-50 dark:bg-blue-900/10 px-1.5 py-1.5 rounded">
                                                                <span className="font-bold text-blue-600 truncate text-[10px] text-left w-full block" title={formatMatchName(m.blue_name, t)}>
                                                                    {formatMatchName(m.blue_name, t)}
                                                                </span>
                                                                <span className="text-[8px] text-gray-500 truncate text-left w-full block mt-0.5">
                                                                    {m.blue_unit || t("bracket_merge.empty")}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded mr-3"
                            >
                                {t("bracket_merge.back")}
                            </button>
                            <button
                                onClick={prepareMerge}
                                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
                            >
                                {t("bracket_merge.continue_merge")}
                            </button>
                        </div>
                    </div>
                )}

                {/* BƯỚC 4: KÉO THẢ GỘP */}
                {step === 4 && (
                    <div>
                        <h3 className="text-xl font-black uppercase text-blue-900 dark:text-blue-100 mb-6">
                            {t("bracket_merge.step_4_title")}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t("bracket_merge.step_4_desc")}
                        </p>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="matches-list-board">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2 border border-dashed border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-50 dark:bg-gray-900/50 min-h-[400px]"
                                    >
                                        {mergedMatches.map((match, index) => (
                                            <Draggable
                                                key={match.db_id}
                                                draggableId={match.db_id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-4 bg-white dark:bg-gray-800 border rounded flex items-center gap-4 ${snapshot.isDragging ? " border-blue-500 ring-2 ring-blue-200" : "border-gray-200 dark:border-gray-700  hover:border-blue-300"}`}
                                                    >
                                                        <div className="w-8 h-8 flex-shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-xs">
                                                            {match.matchNo}
                                                        </div>
                                                        <div className="w-24">
                                                            <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                                                {match.weight}
                                                            </span>
                                                        </div>
                                                        <div className="w-16">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                                                                {match.roundName}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 flex items-center justify-center">
                                                            <div className="flex-1 text-right">
                                                                <p className="font-bold text-red-600 truncate text-sm" title={formatMatchName(match.red_name, t)}>
                                                                    {formatMatchName(match.red_name, t)}
                                                                </p>
                                                            </div>
                                                            <div className="px-4 text-gray-400 font-black italic text-xs">
                                                                VS
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-blue-600 truncate text-sm" title={formatMatchName(match.blue_name, t)}>
                                                                    {formatMatchName(match.blue_name, t)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setStep(3)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded mr-3"
                            >
                                {t("bracket_merge.back")}
                            </button>
                            <button
                                onClick={() => setStep(5)}
                                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition"
                            >
                                {t("bracket_merge.save_progress")}
                            </button>
                        </div>
                    </div>
                )}

                {/* BƯỚC 5: REVIEW ALL VÀ BƯỚC 6: LƯU BASE */}
                {step === 5 && (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-10 h-10 text-emerald-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">
                            {t("bracket_merge.step_5_title")}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {t("bracket_merge.step_5_desc")}
                        </p>

                        <div className="max-w-md mx-auto mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {t("bracket_merge.custom_sheet_name")}
                            </label>
                            <div className="flex bg-white dark:bg-gray-900 overflow-hidden border border-gray-300 dark:border-gray-600 rounded">
                                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 font-bold border-r border-gray-300 dark:border-gray-600 select-none">
                                    HC_AUTO_
                                </span>
                                <input
                                    type="text"
                                    value={customSheetSuffix}
                                    onChange={(e) => setCustomSheetSuffix(e.target.value)}
                                    placeholder={t("bracket_merge.custom_sheet_name_placeholder")}
                                    className="flex-1 px-3 py-2 outline-none dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                onClick={handleExportExcel}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t("bracket_merge.export_excel")}
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-50 transition"
                            >
                                {t("bracket_merge.back")}
                            </button>
                            <button
                                onClick={handleFinalSave}
                                className="px-8 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest rounded hover:bg-emerald-700 transition "
                            >
                                {t("bracket_merge.save_progress")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tree Modal overlay */}
            {treeModalOpen && selectedTreeSheet && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-lg font-black text-blue-600 dark:text-blue-400">
                                {t("bracket_merge.bracket_title")}: {selectedTreeSheet}
                            </h3>
                            <button
                                onClick={() => setTreeModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-rose-500 hover:text-white transition"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
                            <div className="min-w-max pb-4">
                                <Bracket rounds={getBracketData(selectedTreeSheet)} />
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => setTreeModalOpen(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-800 font-bold rounded hover:bg-gray-400 transition"
                            >
                                {t("bracket_merge.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
