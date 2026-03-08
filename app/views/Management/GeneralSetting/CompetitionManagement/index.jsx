import React, { useEffect, useState, useMemo } from "react";
import { readSheetNames } from "read-excel-file";
import readXlsxFile from "read-excel-file";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/Button";
import axios from "axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import useConfirmModal from "../../../../hooks/useConfirmModal";
import ConfirmModal from "../../../../components/ConfirmModal";
import Modal from "../../../../components/Modal";
import BracketMergeTab from "./components/BracketMergeTab";
import { generateKnockoutMatches } from "../../../../utils/bracketGenerator";

import DataManagementPanel from './components/DataManagementPanel';
import RefereeManagementPanel from './components/RefereeManagementPanel';
import ConfigSystemPanel from './components/ConfigSystemPanel';

export default function CompetitionManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho tab quản lý dữ liệu
  const [savedData, setSavedData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "grid" hoặc "list"
  const [dataTypeFilter, setDataTypeFilter] = useState("all"); // "all", "excel", "auto"

  // State for Referee Management
  const [referees, setReferees] = useState([]);
  const [loadingReferees, setLoadingReferees] = useState(false);
  const [refSearch, setRefSearch] = useState("");

  // Referee Modal State
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [refModalMode, setRefModalMode] = useState("add"); // "add" or "edit"
  const [currentRef, setCurrentRef] = useState({
    full_name: "",
    unit: "",
    country: "",
    r1: false,
    r2: false,
    r3: false,
    r4: false,
    r5: false,
    r6: false,
    r7: false,
    is_ref_machine: false,
    is_ref_court: false,
  });

  // Modal hook
  const { modalProps, showConfirm, showAlert, showError, showSuccess } =
    useConfirmModal();

  // Xử lý khi chọn file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedSheet("");
    setSheetData([]);
    setHeaders([]);
    setLoading(true);

    // Đọc danh sách sheet names
    readSheetNames(file)
      .then((names) => {
        const filteredNames = names.filter((ele) => {
          const firstPart = ele.split("-")[0].trim();
          return !ele.includes("SKIP") && !firstPart.includes("HC");
        });

        setSheetNames(filteredNames);
        // thực hiện lưu file vào database
        setLoading(false);
      })
      .catch(async (error) => {
        console.error("Lỗi khi đọc file Excel:", error);
        await showError(t("competition_management.error_read_excel"));
        setLoading(false);
      });
  };

  // Xử lý khi chọn sheet
  const handleSheetChange = (event) => {
    const sheetName = event.target.value;
    setSelectedSheet(sheetName);

    if (!sheetName || !selectedFile) return;

    setLoading(true);
    // Tìm index của sheet (bắt đầu từ 1)
    const sheetIndex = sheetNames.indexOf(sheetName) + 1;

    // Đọc dữ liệu từ sheet đã chọn
    readXlsxFile(selectedFile, { sheet: sheetIndex })
      .then((rows) => {
        if (rows.length > 0) {
          // Kiểm tra loại format dựa vào cell đầu tiên
          const formatType = rows[0][0];

          if (sheetName.startsWith("HC")) {
            console.log("📋 Format: Tự động xếp Bracket Knockout (HC)");
            handleSaveHCToDatabase(sheetName, rows);
          } else if (formatType == "DK") {
            console.log("📋 Format: Đối kháng (DK)");
            handleSaveToDatabase(sheetName, rows);
          } else if (formatType == "DOL") {
            console.log("📋 Format: Đối luyện (DOL) - 1 VĐV/row");
            handleSaveDOLToDatabase(sheetName, rows);
          } else if (formatType == "SOL") {
            console.log("📋 Format: Song luyện (SOL) - 2 VĐV/team");
            handleSaveSOLToDatabase(sheetName, rows);
          } else if (formatType == "TUV") {
            console.log("📋 Format: Tự vệ (TUV) - 2 VĐV/team");
            handleSaveTUVToDatabase(sheetName, rows);
          } else if (formatType == "DAL") {
            console.log("📋 Format: Đa luyện (DAL) - 4 VĐV/team");
            handleSaveDALToDatabase(sheetName, rows);
          } else if (formatType == "VON") {
            console.log("📋 Format: Võ Nhạc/Đồng đội - 6-16 VĐV/team");
            handleSaveVONToDatabase(sheetName, rows);
          } else if (formatType === "REF") {
            console.log("📋 Format: Tổ trọng tài (REF)");
            handleSaveREFToDatabase(sheetName, rows);
          } else {
            console.warn(" Format không xác định:", formatType);
            showWarning(
              t("competition_management.unsupported_format_desc", {
                formatType,
              }),
              {
                title: t("competition_management.format_not_supported"),
                showCancel: false,
              },
            );
          }
          if (rows[0][0] == "DK") {
            // handleSaveToDatabase(sheetName, rows);
            rows[0][0] = t("competition_management.match_no");
          }
          setHeaders(rows[0]); // Dòng đầu tiên là header
          setSheetData(rows.slice(1)); // Các dòng còn lại là data
        } else {
          setHeaders([]);
          setSheetData([]);
        }
        setLoading(false);
      })
      .catch(async (error) => {
        console.error("Lỗi khi đọc sheet:", error);
        await showError(t("competition_management.error_read_sheet"));
        setLoading(false);
      });
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setSheetNames([]);
    setSelectedSheet("");
    setSheetData([]);
    setHeaders([]);
  };

  // Lưu dữ liệu Bracket tạo mảng trận đấu tự động từ danh sách HC
  const handleSaveHCToDatabase = async (sheetName, rows) => {
    try {
      const dataRows = rows.slice(1);

      const athletes = dataRows.map((row, index) => ({
        name: row[3] || "",
        weight: row[1] || sheetName.replace("HC", "").trim(),
        unit: row[4] || "",
        country: "Việt Nam",
        seed: row[6] ? parseInt(row[6]) : null,
      }));

      const generatedMatches = generateKnockoutMatches(athletes);
      console.log("Generated Matches", generatedMatches);

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
      generatedMatches.forEach((m) => {
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

      // Lưu bảng competition_dk trước
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: tableData, // Chuyển sang format Table giống màn Import để click view Detail không bị lỗi Header mapping
        },
      );

      if (response.data.success) {
        const competitionDkId = response.data.data.id;

        const matchesToCreate = generatedMatches.map((match, index) => ({
          competition_dk_id: competitionDkId,
          row_index: index,
          match_no: match.matchNo.toString(),
          red_name: match.red_name,
          red_team: match.red_unit,
          blue_name: match.blue_name,
          blue_team: match.blue_unit,
          match_status: "WAI",
          config_system: {},
        }));

        if (matchesToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match/bulk", {
            matches: matchesToCreate,
          });
        }

        await showSuccess(
          t("competition_management.success_save_dk") ||
          `Đã tạo ${matchesToCreate.length} trận knockout!`,
        );
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving HC to database:", error);
      await showError(
        (t("competition_management.error_save_data") || "Lỗi lưu dữ liệu: ") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lưu dữ liệu vào database (Format DK - Đối kháng)
  const handleSaveToDatabase = async (sheetName, rows) => {
    try {
      // Bước 1: Lưu competition_dk trước
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: rows,
        },
      );

      if (response.data.success) {
        const competitionDkId = response.data.data.id;

        // Bước 2: Tạo match_id cho từng row (bỏ qua header - row đầu tiên)
        const dataRows = rows.slice(1); // Bỏ header
        console.log("dataRows: ", dataRows);

        // Tạo danh sách matches để insert
        const matchesToCreate = dataRows.map((row, index) => ({
          competition_dk_id: competitionDkId,
          row_index: index,
          match_no: row[0] || `Match ${index + 1}`, // Cột đầu tiên là số trận
          red_name: row[3] || "", // Tên Giáp Đỏ
          red_team: row[4] || "",
          blue_name: row[6] || "", // Tên Giáp Xanh
          blue_team: row[7] || "",
          match_status: "WAI", // Mặc định là chờ
          config_system: {}, // Config mặc định
        }));

        // Bước 3: Bulk insert matches
        if (matchesToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match/bulk", {
            matches: matchesToCreate,
          });
        }

        await showSuccess(t("competition_management.success_save_dk"));
        fetchSavedData(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      await showError(
        t("competition_management.error_save_data") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lưu dữ liệu DOL (Đối luyện) vào database
  // Format Excel: [DOL, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 1 row = 1 VĐV = 1 match
  const handleSaveDOLToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: rows,
        },
      );

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header
        console.log("📋 Parsing SOL/TUV/DAL/DOL data...");

        // Format Excel: [DOL, Mã số, Họ tên, Đơn vị, Nội dung thi]
        // Mapping: row[0]=DOL, row[1]=Mã số, row[2]=Họ tên, row[3]=Đơn vị, row[4]=Nội dung thi
        const teamsToCreate = dataRows.map((row, index) => ({
          competition_dk_id: competitionDkId,
          row_index: index,
          match_no: row[0] || `${index + 1}`,
          match_name: row[4] || "",
          team_name: row[3] || "",
          match_type: row[1] || "DOL",
          match_status: "WAI",
          config_system: {},
          athletes: [{ name: row[2] || "", unit: row[3] || "" }],
        }));
        if (teamsToCreate.length > 0) {
          await axios.post(
            "http://localhost:6789/api/competition-match-team/bulk",
            {
              teams: teamsToCreate,
            },
          );
        }

        await showSuccess(
          `${t("competition_management.success_save_part1", "Lưu")} ${teamsToCreate.length} ${t("competition_management.success_save_dol", "VĐV DOL thành công!")}`,
        );
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving DOL to database:", error);
      await showError(
        t("competition_management.error_save_dol") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lưu dữ liệu SOL (Song luyện) vào database
  // Format Excel: [SOL, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 2 rows liên tục = 1 team
  const handleSaveSOLToDatabase = async (sheetName, rows) => {
    console.log("rows: ", rows);
    try {
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: rows,
        },
      );

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header

        const teamsToCreate = [];
        console.log("📋 Parsing SOL/TUV/DAL/DOL data...");

        // Group 2 rows liên tục
        for (let i = 0; i < dataRows.length; i += 2) {
          const row1 = dataRows[i];
          const row2 = dataRows[i + 1];

          if (!row1) continue;

          const athletes = [{ name: row1[2] || "", unit: row1[3] || "" }];

          if (row2) {
            athletes.push({ name: row2[2] || "", unit: row2[3] || "" });
          }
          teamsToCreate.push({
            competition_dk_id: competitionDkId,
            row_index: i,
            match_no: row1[0] || `${teamsToCreate.length + 1}`,
            match_name: row1[4] ?? "",
            team_name: row1[3] || "",
            match_type: row1[1] || "SOL",
            match_status: "WAI",
            config_system: {},
            athletes: athletes,
          });
        }

        console.log(" Total teams:", teamsToCreate.length);

        if (teamsToCreate.length > 0) {
          await axios.post(
            "http://localhost:6789/api/competition-match-team/bulk",
            {
              teams: teamsToCreate,
            },
          );
        }

        await showSuccess(
          `${t("competition_management.success_save_part1", "Lưu")} ${teamsToCreate.length} ${t("competition_management.success_save_teams", "teams thành công!")}`,
        );
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      await showError(
        t("competition_management.error_save_data") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lưu dữ liệu TUV (Tự vệ) vào database
  // Format Excel: [TUV, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 2 rows liên tục = 1 team (giống SOL)
  const handleSaveTUVToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: rows,
        },
      );

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header

        const teamsToCreate = [];
        // Group 2 rows liên tục
        for (let i = 0; i < dataRows.length; i += 2) {
          const row1 = dataRows[i];
          const row2 = dataRows[i + 1];

          if (!row1) continue;

          const athletes = [{ name: row1[2] || "", unit: row1[3] || "" }];

          if (row2) {
            athletes.push({ name: row2[2] || "", unit: row2[3] || "" });
          }
          teamsToCreate.push({
            competition_dk_id: competitionDkId,
            row_index: i,
            match_no: row1[0] || `${teamsToCreate.length + 1}`,
            match_name: row1[4] ?? "",
            team_name: row1[3] || "",
            match_type: row1[1] || "TUV",
            match_status: "WAI",
            config_system: {},
            athletes: athletes,
          });
        }

        if (teamsToCreate.length > 0) {
          await axios.post(
            "http://localhost:6789/api/competition-match-team/bulk",
            {
              teams: teamsToCreate,
            },
          );
        }

        await showSuccess(
          `${t("competition_management.success_save_part1", "Lưu")} ${teamsToCreate.length} ${t("competition_management.success_save_tuv", "teams TUV thành công!")}`,
        );
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving TUV to database:", error);
      await showError(
        t("competition_management.error_save_tuv") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lưu dữ liệu DAL (Đa luyện) vào database
  // Format Excel: [DAL, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 4 rows liên tục = 1 team
  const handleSaveDALToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: rows,
        },
      );

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header

        const teamsToCreate = [];

        // Group 4 rows liên tục
        for (let i = 0; i < dataRows.length; i += 4) {
          const row1 = dataRows[i];
          const row2 = dataRows[i + 1];
          const row3 = dataRows[i + 2];
          const row4 = dataRows[i + 3];

          if (!row1) continue;

          const athletes = [{ name: row1[2] || "", unit: row1[3] || "" }];

          if (row2) athletes.push({ name: row2[2] || "", unit: row2[3] || "" });
          if (row3) athletes.push({ name: row3[2] || "", unit: row3[3] || "" });
          if (row4) athletes.push({ name: row4[2] || "", unit: row4[3] || "" });

          const athleteNames = athletes
            .map((a) => a.name)
            .filter((n) => n)
            .join(", ");

          teamsToCreate.push({
            competition_dk_id: competitionDkId,
            row_index: i,
            match_no: row1[0] || `${teamsToCreate.length + 1}`,
            match_name: row1[4] ?? "",
            team_name: row1[3] || "",
            match_type: row1[1] || "DAL",
            match_status: "WAI",
            config_system: {},
            athletes: athletes,
          });
        }

        if (teamsToCreate.length > 0) {
          await axios.post(
            "http://localhost:6789/api/competition-match-team/bulk",
            {
              teams: teamsToCreate,
            },
          );
        }

        await showSuccess(
          `${t("competition_management.success_save_part1", "Lưu")} ${teamsToCreate.length} ${t("competition_management.success_save_dal", "teams DAL thành công!")}`,
        );
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving DAL to database:", error);
      await showError(
        t("competition_management.error_save_dal") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lưu dữ liệu VON(Võ Nhạc) vào database
  // Format Excel: [VON, Mã, Đơn vị,	Nội dung thi, Số Lượng]
  const handleSaveVONToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post(
        "http://localhost:6789/api/competition-dk",
        {
          sheet_name: sheetName,
          file_name: selectedFile?.name || "",
          data: rows,
        },
      );
      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header
        const teamsToCreate = [];
        // 1. Lấy dòng 1 kiểm tra cột số lượng cột số 5
        let count = 1;
        for (let i = 0; i < dataRows.length; i += count) {
          const rowMain = dataRows[i];
          const athletes = [];
          if (rowMain.length > 0) {
            if (rowMain[5] != undefined && rowMain[5] != null) {
              count = rowMain[5] > 1 ? rowMain[5] : 1;
              console.log("count: ", count);
              for (let row = 0; row < count; row++) {
                // push vào mảng
                const item = dataRows[i + row] ?? {};
                console.log("item: ", item);
                athletes.push({ name: item[3] || "", unit: rowMain[2] || "" });
              }
            }
            console.log("athletes: ", athletes);

            // thực hiện push vào danh sách
            teamsToCreate.push({
              competition_dk_id: competitionDkId,
              row_index: i,
              match_no: rowMain[0] || `${teamsToCreate.length + 1}`,
              match_name: rowMain[4] ?? "",
              team_name: rowMain[2] || "",
              match_type: rowMain[1] || "DAL",
              match_status: "WAI",
              config_system: {},
              athletes: athletes,
            });
          }
        }

        // 2. cập nhật lại thông tin.
        if (teamsToCreate.length > 0) {
          await axios.post(
            "http://localhost:6789/api/competition-match-team/bulk",
            {
              teams: teamsToCreate,
            },
          );
        }

        await showSuccess(
          `${t("competition_management.success_save_part1", "Lưu")} ${teamsToCreate.length} ${t("competition_management.success_save_dal", "teams DAL thành công!")}`,
        );
        fetchSavedData();
      }
    } catch (error) { }
  };

  // Lưu dữ liệu REF (Trọng tài) vào database
  const handleSaveREFToDatabase = async (sheetName, rows) => {
    try {
      const dataRows = rows.slice(1); // Bỏ header
      const refereesToCreate = dataRows.map((row) => {
        return {
          full_name: row[1] || "",
          unit: row[2] || "",
          country: row[3] || "",
          r1: !!row[4],
          r2: !!row[5],
          r3: !!row[6],
          r4: !!row[7],
          r5: !!row[8],
          r6: !!row[9],
          r7: !!row[10],
          is_ref_machine: !!row[11],
          is_ref_court: !!row[12],
        };
      });

      if (refereesToCreate.length > 0) {
        await axios.post("http://localhost:6789/api/referees/bulk", {
          referees: refereesToCreate,
        });
      }

      await showSuccess(
        `${t("competition_management.success_save_part1", "Lưu")} ${refereesToCreate.length} ${t("competition_management.success_save_ref", "trọng tài thành công!")}`,
      );
      fetchReferees();
      // Chúng ta có thể chuyển sang tab trọng tài sau khi import
    } catch (error) {
      console.error("Error saving REF to database:", error);
      await showError(
        t("competition_management.error_save_referee") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Lấy danh sách dữ liệu đã lưu
  const fetchSavedData = async () => {
    setLoadingData(true);
    try {
      const response = await axios.get(
        "http://localhost:6789/api/competition-dk",
      );
      if (response.data.success) {
        setSavedData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching saved data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Xóa dữ liệu
  const handleDelete = async (id) => {
    const confirmDelete = await showConfirm(
      t("competition_management.confirm_delete"),
      {
        title: t("competition_management.confirm_title"),
        confirmText: t("competition_management.confirm_text"),
        cancelText: t("competition_management.cancel_text"),
      },
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:6789/api/competition-dk/${id}`,
      );
      if (response.data.success) {
        await showSuccess(t("competition_management.success_delete_data"));
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      await showError(
        t("competition_management.error_delete_data") +
        ": " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchSavedData();
    fetchReferees();
  }, []);

  // Fetch referees
  const fetchReferees = async (keyword = "") => {
    setLoadingReferees(true);
    try {
      const response = await axios.get(
        `http://localhost:6789/api/referees${keyword ? `?keyword=${keyword}` : ""}`,
      );
      if (response.data.success) {
        setReferees(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching referees:", error);
    } finally {
      setLoadingReferees(false);
    }
  };

  const handleDeleteReferee = async (id) => {
    const confirmDelete = await showConfirm(
      t("competition_management.confirm_delete_referee"),
      {
        title: t("competition_management.confirm_title"),
        confirmText: t("competition_management.confirm_text"),
        cancelText: t("competition_management.cancel_text"),
      },
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:6789/api/referees/${id}`,
      );
      if (response.data.success) {
        showSuccess(t("competition_management.success_delete_referee"));
        fetchReferees(refSearch);
      }
    } catch (error) {
      console.error("Error deleting referee:", error);
      showError(t("competition_management.error_delete_referee"));
    }
  };

  const handleUpdateReferee = async (ref, updatedFields) => {
    try {
      const payload = { ...ref, ...updatedFields };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      // Robust bits casting
      const toB = (v) =>
        v === true || v === 1 || v === "true" || v === "1" || v === "X" ? 1 : 0;
      for (let i = 1; i <= 7; i++) payload[`r${i}`] = toB(payload[`r${i}`]);
      payload.is_ref_machine = toB(payload.is_ref_machine);
      payload.is_ref_court = toB(payload.is_ref_court);

      const response = await axios.put(
        `http://localhost:6789/api/referees/${ref.id}`,
        payload,
      );
      if (response.data.success) {
        setReferees((prev) =>
          prev.map((r) => (r.id === ref.id ? { ...r, ...updatedFields } : r)),
        );
      }
    } catch (error) {
      console.error("Error updating referee:", error);
      showError(t("competition_management.error_update_referee"));
    }
  };

  const handleToggleField = (ref, field) => {
    handleUpdateReferee(ref, { [field]: !ref[field] });
  };

  const handleEditField = (ref, field, label) => {
    const newValue = prompt(`Nhập ${label}:`, ref[field] || "");
    if (newValue !== null) {
      handleUpdateReferee(ref, { [field]: newValue });
    }
  };

  const handleOpenRefModal = (mode = "add", ref = null) => {
    setRefModalMode(mode);
    if (mode === "edit" && ref) {
      setCurrentRef(ref);
    } else {
      setCurrentRef({
        full_name: "",
        unit: "",
        country: "",
        r1: false,
        r2: false,
        r3: false,
        r4: false,
        r5: false,
        r6: false,
        r7: false,
        is_ref_machine: false,
        is_ref_court: false,
      });
    }
    setIsRefModalOpen(true);
  };

  const handleSaveRefModal = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentRef };

      // Robust bits casting
      const toB = (v) =>
        v === true || v === 1 || v === "true" || v === "1" || v === "X" ? 1 : 0;
      for (let i = 1; i <= 7; i++) payload[`r${i}`] = toB(payload[`r${i}`]);
      payload.is_ref_machine = toB(payload.is_ref_machine);
      payload.is_ref_court = toB(payload.is_ref_court);

      if (refModalMode === "add") {
        const response = await axios.post(
          "http://localhost:6789/api/referees",
          payload,
        );
        if (response.data.success) {
          showSuccess(t("competition_management.success_add_referee"));
          fetchReferees(refSearch);
          setIsRefModalOpen(false);
        }
      } else {
        const response = await axios.put(
          `http://localhost:6789/api/referees/${currentRef.id}`,
          payload,
        );
        if (response.data.success) {
          showSuccess(t("competition_management.success_update_referee"));
          fetchReferees(refSearch);
          setIsRefModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving referee:", error);
      showError(t("competition_management.error_save_referee_info"));
    }
  };

  const handleDeleteAllReferees = async () => {
    const confirmDelete = await showConfirm(
      t("competition_management.confirm_delete_all"),
      {
        title: t("competition_management.confirm_delete_all_title"),
        confirmText: t("competition_management.confirm_delete_all_text"),
        cancelText: t("competition_management.cancel_text"),
      },
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:6789/api/referees-all`,
      );
      if (response.data.success) {
        showSuccess(t("competition_management.success_delete_all"));
        fetchReferees();
      }
    } catch (error) {
      console.error("Error deleting all referees:", error);
      showError(t("competition_management.error_delete_all_referees"));
    }
  };

  // Chuyển đến trang chi tiết
  const handleViewDetail = (item) => {
    // Todo: Chặn chế độ Đối Kháng/Quyền/Võ Nhạc
    if (item.sheet_name.startsWith("DK") || item.sheet_name.startsWith("HC")) {
      navigate(`/management/competition-data/${item.id}`);
    } else {
      navigate(`/management/competition-data-other/${item.id}`);
    }
  };

  // Memoize savedData để tránh re-render không cần thiết
  const memoizedSavedData = useMemo(() => {
    if (dataTypeFilter === "excel") {
      return savedData.filter(
        (item) =>
          !item.sheet_name.startsWith("HC_AUTO") &&
          !item.sheet_name.startsWith("HC"),
      );
    }
    if (dataTypeFilter === "auto") {
      return savedData.filter(
        (item) =>
          item.sheet_name.startsWith("HC_AUTO") ||
          item.sheet_name.startsWith("HC"),
      );
    }
    return savedData;
  }, [savedData, dataTypeFilter]);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t("competition_management.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
            {t("competition_management.description")}
          </p>
        </div>
      </div>

      <TabGroup>
        <TabList className="flex gap-2 p-1.5 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100  mb-8 w-fit">
          <Tab
            className={({ selected }) =>
              `flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 outline-none
              ${selected
                ? "bg-blue-600 text-white shadow-lg "
                : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`
            }
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            {t("competition_management.tab_data_management")}
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 outline-none
              ${selected
                ? "bg-blue-600 text-white shadow-lg "
                : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`
            }
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {t("competition_management.tab_referee_management")}
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 outline-none
              ${selected
                ? "bg-blue-600 text-white shadow-lg "
                : "text-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-blue-900/30"
              }`
            }
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            {t("competition_management.tab_upload_import")}
          </Tab>
          <Tab
            className={({ selected }) =>
              `flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded transition-all duration-300 outline-none
              ${selected
                ? "bg-blue-600 text-white shadow-lg "
                : "text-blue-500 hover:text-blue-700 hover:bg-white dark:hover:bg-blue-900/30"
              }`
            }
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
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            {t("competition_management.create_auto_list")}
          </Tab>
        </TabList>

        <TabPanels>
          {/* Tab 1: Data Management */}
          <DataManagementPanel {...{ viewMode, setViewMode, dataTypeFilter, setDataTypeFilter, savedData, memoizedSavedData, loadingData, fetchSavedData, handleDelete, handleReset, handleViewDetail }} />
          {/* Tab 2: Referee Management */}
          <RefereeManagementPanel {...{ referees, loadingReferees, refSearch, setRefSearch, fetchReferees, handleOpenRefModal, handleUpdateReferee, handleDeleteReferee, handleDeleteAllReferees, handleToggleField }} />
          {/* Tab 3: Upload & Import */}
          <ConfigSystemPanel {...{ selectedFile, sheetNames, selectedSheet, sheetData, headers, loading, handleFileChange, handleSheetChange, handleReset }} />
          {/* Tab 4: Merge Knockout Bracket */}
          <TabPanel>
            <BracketMergeTab onMergeComplete={fetchSavedData} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Confirm Modal */}
      <ConfirmModal {...modalProps} />

      {/* Referee Add/Edit Modal */}
      <Modal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        title={
          refModalMode === "add"
            ? t("competition_management.modal_add_referee")
            : t("competition_management.modal_edit_referee")
        }
        size="large"
      >
        <form onSubmit={handleSaveRefModal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("competition_management.referee_name")}
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentRef.full_name}
                onChange={(e) =>
                  setCurrentRef({ ...currentRef, full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("competition_management.unit")}
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentRef.unit}
                onChange={(e) =>
                  setCurrentRef({ ...currentRef, unit: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("competition_management.country")}
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={currentRef.country}
                onChange={(e) =>
                  setCurrentRef({ ...currentRef, country: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("competition_management.referee_group")}
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <label
                    key={num}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-all border ${currentRef[`r${num}`] ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20" : "bg-gray-50 border-gray-200 dark:bg-gray-800/40"}`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!!currentRef[`r${num}`]}
                      onChange={(e) =>
                        setCurrentRef({
                          ...currentRef,
                          [`r${num}`]: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[10px] font-bold font-mono">
                      {t("competition_management.referee_label")} {num}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("competition_management.special_referee_permissions")}
              </label>
              <div className="flex flex-wrap gap-4">
                <label
                  className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-all border ${currentRef.is_ref_machine ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20" : "bg-gray-50 border-gray-200 dark:bg-gray-800/40"}`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    checked={!!currentRef.is_ref_machine}
                    onChange={(e) =>
                      setCurrentRef({
                        ...currentRef,
                        is_ref_machine: e.target.checked,
                      })
                    }
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {t("competition_management.machine_referee_label")}
                    </span>
                    <span className="text-[10px] text-gray-500 italic">
                      {t("competition_management.machine_referee_desc")}
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-all border ${currentRef.is_ref_court ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20" : "bg-gray-50 border-gray-200 dark:bg-gray-800/40"}`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                    checked={!!currentRef.is_ref_court}
                    onChange={(e) =>
                      setCurrentRef({
                        ...currentRef,
                        is_ref_court: e.target.checked,
                      })
                    }
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {t("competition_management.court_referee_label")}
                    </span>
                    <span className="text-[10px] text-gray-500 italic">
                      {t("competition_management.court_referee_desc")}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => setIsRefModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors border border-gray-300 dark:border-gray-700"
            >
              {t("competition_management.cancel")}
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-all shadow-md active:scale-95"
            >
              {refModalMode === "add"
                ? t("competition_management.button_add")
                : t("competition_management.button_save")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
