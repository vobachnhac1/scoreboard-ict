import React, { useEffect, useState, useMemo } from "react";
import { readSheetNames } from "read-excel-file";
import readXlsxFile from "read-excel-file";
import { useTranslation } from "react-i18next";
import Button from "../../../components/Button";
import axios from "axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import useConfirmModal from "../../../hooks/useConfirmModal";
import ConfirmModal from "../../../components/ConfirmModal";
import Modal from "../../../components/Modal";

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
  const [viewMode, setViewMode] = useState("list"); // 'grid' hoặc 'list'

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
    r1: false, r2: false, r3: false, r4: false, r5: false, r6: false, r7: false,
    is_ref_machine: false, is_ref_court: false
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
        setSheetNames(names.filter((ele) => !ele.includes("SKIP")));
        console.log("names: ", names);
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

          if (formatType == "DK") {
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
              t("competition_management.unsupported_format_desc", { formatType }),
              { title: t("competition_management.format_not_supported"), showCancel: false },
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
        t("competition_management.error_save_data") + ": " +
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

        await showSuccess(`${t('competition_management.success_save_part1', 'Lưu')} ${teamsToCreate.length} ${t('competition_management.success_save_dol', 'VĐV DOL thành công!')}`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving DOL to database:", error);
      await showError(
        t("competition_management.error_save_dol") + ": " +
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

        await showSuccess(`${t('competition_management.success_save_part1', 'Lưu')} ${teamsToCreate.length} ${t('competition_management.success_save_teams', 'teams thành công!')}`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      await showError(
        t("competition_management.error_save_data") + ": " +
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

        await showSuccess(`${t('competition_management.success_save_part1', 'Lưu')} ${teamsToCreate.length} ${t('competition_management.success_save_tuv', 'teams TUV thành công!')}`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving TUV to database:", error);
      await showError(
        t("competition_management.error_save_tuv") + ": " +
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

        await showSuccess(`${t('competition_management.success_save_part1', 'Lưu')} ${teamsToCreate.length} ${t('competition_management.success_save_dal', 'teams DAL thành công!')}`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving DAL to database:", error);
      await showError(
        t("competition_management.error_save_dal") + ": " +
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

        await showSuccess(`${t('competition_management.success_save_part1', 'Lưu')} ${teamsToCreate.length} ${t('competition_management.success_save_dal', 'teams DAL thành công!')}`);
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
          r1: !!row[4], r2: !!row[5], r3: !!row[6], r4: !!row[7], r5: !!row[8], r6: !!row[9], r7: !!row[10],
          is_ref_machine: !!row[11],
          is_ref_court: !!row[12]
        };
      });

      if (refereesToCreate.length > 0) {
        await axios.post("http://localhost:6789/api/referees/bulk", {
          referees: refereesToCreate,
        });
      }

      await showSuccess(`${t('competition_management.success_save_part1', 'Lưu')} ${refereesToCreate.length} ${t('competition_management.success_save_ref', 'trọng tài thành công!')}`);
      fetchReferees();
      // Chúng ta có thể chuyển sang tab trọng tài sau khi import
    } catch (error) {
      console.error("Error saving REF to database:", error);
      await showError(
        t("competition_management.error_save_referee") + ": " +
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
        t("competition_management.error_delete_data") + ": " +
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
      const response = await axios.get(`http://localhost:6789/api/referees${keyword ? `?keyword=${keyword}` : ''}`);
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
    const confirmDelete = await showConfirm(t("competition_management.confirm_delete_referee"), {
      title: t("competition_management.confirm_title"),
      confirmText: t("competition_management.confirm_text"),
      cancelText: t("competition_management.cancel_text"),
    });
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:6789/api/referees/${id}`);
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
      const toB = (v) => (v === true || v === 1 || v === "true" || v === "1" || v === "X") ? 1 : 0;
      for (let i = 1; i <= 7; i++) payload[`r${i}`] = toB(payload[`r${i}`]);
      payload.is_ref_machine = toB(payload.is_ref_machine);
      payload.is_ref_court = toB(payload.is_ref_court);

      const response = await axios.put(`http://localhost:6789/api/referees/${ref.id}`, payload);
      if (response.data.success) {
        setReferees(prev => prev.map(r => r.id === ref.id ? { ...r, ...updatedFields } : r));
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
        full_name: "", unit: "", country: "",
        r1: false, r2: false, r3: false, r4: false, r5: false, r6: false, r7: false,
        is_ref_machine: false, is_ref_court: false
      });
    }
    setIsRefModalOpen(true);
  };

  const handleSaveRefModal = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentRef };

      // Robust bits casting
      const toB = (v) => (v === true || v === 1 || v === "true" || v === "1" || v === "X") ? 1 : 0;
      for (let i = 1; i <= 7; i++) payload[`r${i}`] = toB(payload[`r${i}`]);
      payload.is_ref_machine = toB(payload.is_ref_machine);
      payload.is_ref_court = toB(payload.is_ref_court);

      if (refModalMode === "add") {
        const response = await axios.post("http://localhost:6789/api/referees", payload);
        if (response.data.success) {
          showSuccess(t("competition_management.success_add_referee"));
          fetchReferees(refSearch);
          setIsRefModalOpen(false);
        }
      } else {
        const response = await axios.put(`http://localhost:6789/api/referees/${currentRef.id}`, payload);
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
    const confirmDelete = await showConfirm(t("competition_management.confirm_delete_all"), {
      title: t("competition_management.confirm_delete_all_title"),
      confirmText: t("competition_management.confirm_delete_all_text"),
      cancelText: t("competition_management.cancel_text"),
    });
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:6789/api/referees-all`);
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
    if (item.sheet_name.startsWith("DK")) {
      navigate(`/management/competition-data/${item.id}`);
    } else {
      navigate(`/management/competition-data-other/${item.id}`);
    }
  };

  // Memoize savedData để tránh re-render không cần thiết
  const memoizedSavedData = useMemo(() => savedData, [savedData]);

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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t("competition_management.tab_upload_import")}
          </Tab>
        </TabList>

        <TabPanels>
          {/* Tab 1: Data Management */}
          <TabPanel>
            {/* Header với button refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">
                    {t("competition_management.saved_data")}
                  </h2>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-bold italic">
                    {t("competition_management.saved_data_desc")}
                  </p>
                </div>

                {/* Badge số lượng */}
                {!loadingData && savedData.length > 0 && (
                  <div className="flex items-center gap-3 px-2 py-2 bg-blue-600 rounded shadow-lg   ">
                    <svg
                      className="w-5 h-5 text-white/80"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-[10px] text-white/70 font-black uppercase leading-none">
                        {t("competition_management.total_files")}
                      </p>
                      <p className="text-xl font-black text-white leading-tight">
                        {savedData.length}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/10 p-1 rounded border border-blue-100 ">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-md "
                      : "text-blue-400 hover:text-blue-600"
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>{t("competition_management.grid_view")}</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "list"
                      ? "bg-blue-600 text-white shadow-md "
                      : "text-blue-400 hover:text-blue-600"
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>{t("competition_management.list_view")}</span>
                  </button>
                </div>

                <button
                  onClick={fetchSavedData}
                  disabled={loadingData}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg  transition-all duration-300 active:scale-95 disabled:opacity-50  "
                >
                  <svg
                    className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{loadingData ? t("common.loading") : t("common.refresh")}</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t("competition_management.loading_data")}
                  </p>
                </div>
              ) : savedData.length === 0 ? (
                <div className="relative text-center py-16 bg-blue-50 dark:bg-blue-900 rounded border-2 border-dashed border-blue-200 dark:border-blue-700 overflow-hidden">
                  {/* Animated background circles */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                  <div
                    className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 dark:bg-blue-600 rounded-full mb-4 shadow-lg">
                      <svg
                        className="h-10 w-10 text-white"
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
                    </div>
                    <p className="mt-4 text-xl font-bold text-gray-800 dark:text-white">
                      {t("competition_management.no_data")}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {t("competition_management.no_data_desc")}
                    </p>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memoizedSavedData.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white dark:bg-gray-800 rounded overflow-hidden shadow-xl shadow-blue-500/5 border border-blue-50 dark:border-blue-900/30 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-blue-50 dark:border-blue-900/10 bg-blue-50/30 dark:bg-blue-900/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase leading-tight mb-2 break-words">
                              {item.sheet_name}
                            </h2>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black text-white px-2 py-0.5 bg-blue-600 rounded uppercase tracking-tighter">
                                ID: #{item.id}
                              </span>
                              <span className="text-[10px] font-bold text-blue-500 truncate max-w-[150px]">
                                {item.file_name}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-blue-900 rounded shadow-sm border border-blue-100 dark:border-blue-700 flex flex-col items-center justify-center">
                            <span className="text-lg font-black text-blue-600 leading-none">
                              {item.data?.length > 0 ? item.data?.length - 1 : 0}
                            </span>
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">{t("competition_management.rows")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">{t("competition_management.updated_at")}</p>
                            <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                              {new Date(item.created_at).toLocaleString("vi-VN", {
                                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow hover:shadow-lg transition-all active:scale-95"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {t("competition_management.view_detail")}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border border-red-200 hover:border-red-600 transition-all active:scale-95"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {t("competition_management.delete_data")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {memoizedSavedData.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white dark:bg-gray-800 rounded overflow-hidden shadow-xl shadow-blue-500/5 border border-blue-50 dark:border-blue-900/30 hover:border-blue-500 transition-all duration-300"
                    >
                      <div className="flex items-center gap-6 p-5">
                        <div className="flex-shrink-0 w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center text-blue-600 shadow-inner">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">{t("competition_management.competition_content")}</p>
                            <h3 className="text-base font-black text-blue-900 dark:text-blue-100 uppercase truncate">
                              {item.sheet_name}
                            </h3>
                            <span className="inline-block mt-1 text-[9px] font-black text-white px-2 py-0.5 bg-blue-500 rounded uppercase tracking-tighter">
                              ID: #{item.id}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">{t("competition_management.file_info")}</p>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200 truncate">{item.file_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-black text-blue-600">{item.data?.length > 0 ? item.data?.length - 1 : 0}</span>
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{t("competition_management.data_rows")}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1.5">{t("competition_management.last_updated")}</p>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                              {new Date(item.created_at).toLocaleString("vi-VN", {
                                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-md transition-all active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">{t("competition_management.view")}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded border border-red-200 hover:border-red-600 transition-all active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">{t("competition_management.delete")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabPanel>


          {/* Tab 2: Referee Management */}
          <TabPanel>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">
                  {t("competition_management.referee_list")}
                </h2>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-bold italic">
                  {t("competition_management.referee_list_desc")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={t("competition.search_referee") + "..."}
                    className="pl-12 pr-4 py-3 bg-white dark:bg-blue-900/10 border border-blue-100  rounded text-xs font-bold text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-lg shadow-blue-500/5 transition-all"
                    value={refSearch}
                    onChange={(e) => {
                      setRefSearch(e.target.value);
                      fetchReferees(e.target.value);
                    }}
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <button
                  onClick={() => handleOpenRefModal("add")}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg  transition-all duration-300 active:scale-95  "
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t("competition_management.add_referee")}
                </button>

                {referees.length > 0 && (
                  <button
                    onClick={handleDeleteAllReferees}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border border-red-200 hover:border-red-600 transition-all duration-300 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t("competition_management.delete_all")}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 overflow-hidden shadow-2xl shadow-blue-500/5">
              {loadingReferees ? (
                <div className="text-center py-24">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-lg "></div>
                  <p className="mt-6 text-blue-600 font-black uppercase tracking-widest text-xs">{t("competition_management.loading_referees")}</p>
                </div>
              ) : referees.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100 dark:">
                    <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">{t("competition_management.no_referees")}</h3>
                  <p className="text-blue-500 text-xs font-bold italic">{t("competition_management.no_referees_desc")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-50/50 dark:bg-blue-900/30 border-b border-blue-100 ">
                        <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">#</th>
                        <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("competition_management.referee_name")}</th>
                        <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("competition_management.unit")}</th>
                        <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("competition_management.ref_machine")} / {t("competition_management.ref_court")}</th>
                        <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">{t("competition_management.country")}</th>
                        <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-right">{t("competition_management.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50 dark:divide-blue-900/20">
                      {referees.map((ref, idx) => (
                        <tr key={ref.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all duration-200">
                          <td className="px-6 py-4 text-xs font-black text-blue-400 font-mono">{(idx + 1).toString().padStart(2, '0')}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase leading-none mb-1">{ref.full_name}</p>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{ref.country || t('competition_management.internal_unit', "Nội bộ")}</span>
                                {ref.country && <div className="w-1 h-1 bg-blue-300 rounded-full"></div>}
                                <span className="text-[10px] font-bold text-blue-400">#{ref.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded border border-blue-100 ">
                              {ref.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5">
                              {[ref.r1, ref.r2, ref.r3, ref.r4, ref.r5, ref.r6, ref.r7].map((r, rIdx) => (
                                <button
                                  key={rIdx}
                                  onClick={() => handleToggleField(ref, `r${rIdx + 1}`)}
                                  className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded shadow-sm border transition-all duration-300 hover:scale-110 active:scale-90 ${r
                                    ? 'bg-blue-600 text-white border-blue-700 '
                                    : 'bg-white dark:bg-blue-900/20 text-blue-300 border-blue-100 dark: hover:border-blue-400'}`}
                                  title={`${t('competition_management.round_label', 'Round')} ${rIdx + 1} - ${t('competition_management.click_to_change', 'Click để thay đổi')}`}
                                >
                                  {rIdx + 1}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleField(ref, "is_ref_machine")}
                                className={`px-3 py-1.5 text-[9px] font-black rounded border transition-all duration-300 active:scale-90 shadow-sm ${ref.is_ref_machine
                                  ? 'bg-indigo-600 text-white border-indigo-800 shadow-indigo-500/20'
                                  : 'bg-white dark:bg-blue-900/20 text-blue-300 border-blue-100 dark: hover:border-indigo-400'}`}
                                title={t("competition_management.click_assign_ref_machine")}
                              >
                                {t('competition_management.ref_machine')}
                              </button>
                              <button
                                onClick={() => handleToggleField(ref, "is_ref_court")}
                                className={`px-3 py-1.5 text-[9px] font-black rounded border transition-all duration-300 active:scale-90 shadow-sm ${ref.is_ref_court
                                  ? 'bg-amber-600 text-white border-amber-800 shadow-amber-500/20'
                                  : 'bg-white dark:bg-blue-900/20 text-blue-300 border-blue-100 dark: hover:border-amber-400'}`}
                                title={t("competition_management.click_assign_ref_court")}
                              >
                                {t('competition_management.ref_court')}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenRefModal("edit", ref)}
                                className="w-9 h-9 flex items-center justify-center text-blue-500 hover:text-white bg-white dark:bg-blue-900/20 border border-blue-100 dark: hover:bg-blue-600 hover:border-blue-600 rounded shadow-sm transition-all duration-300"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteReferee(ref.id)}
                                className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-white bg-white dark:bg-blue-900/20 border border-blue-100 dark: hover:bg-red-600 hover:border-red-600 rounded shadow-sm transition-all duration-300"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Tab 3: Upload & Import */}
          <TabPanel>
            {/* Upload File Section */}
            <div className="mb-8">
              <label htmlFor="file-upload" className="group cursor-pointer">
                <div className="relative overflow-hidden p-12 lg:p-16 border-4 border-dashed border-blue-100 dark:border-blue-900/30 rounded-3xl bg-blue-50/30 dark:bg-blue-900/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-500 text-center">
                  {/* Background decoration */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white dark:bg-blue-900 rounded flex items-center justify-center text-blue-600 shadow-2xl  mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-blue-50 dark:">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>

                    <h3 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">
                      {selectedFile ? t("competition_management.file_selected") : t("competition_management.upload_file")}
                    </h3>
                    <p className="text-sm font-bold text-blue-500 dark:text-blue-400 mb-6 max-w-md mx-auto italic">
                      {selectedFile ? `${t("competition_management.file_ready")}: ${selectedFile.name}` : t("competition_management.file_support")}
                    </p>

                    <div className="flex items-center gap-4">
                      {!selectedFile ? (
                        <div className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-xl shadow-blue-500/30 transition-all active:scale-95  ">
                          {t("competition_management.choose_file_from_device")}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); handleReset(); }}
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
                      <option value="">{t("competition_management.select_sheet_placeholder")}</option>
                      {sheetNames.map((name, index) => (
                        <option key={index} value={name}>
                          {name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
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
                <p className="text-blue-600 font-black uppercase tracking-widest text-xs">{t("competition_management.loading_excel_data")}</p>
              </div>
            )}

            {/* Data Table */}
            {!loading && sheetData.length > 0 && (
              <div className="w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-blue-900/5 dark:bg-blue-900/20 rounded border border-blue-100 ">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg ">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight leading-none mb-1">
                        {t("competition_management.preview_data")}: <span className="text-blue-600 dark:text-blue-400">{selectedSheet.toUpperCase()}</span>
                      </h3>
                      <p className="text-xs font-bold text-blue-500 dark:text-blue-400 italic">
                        {t("competition_management.check_structure")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{t("competition_management.scale")}</p>
                      <p className="text-xl font-black text-blue-900 dark:text-blue-100 leading-none">
                        {sheetData.length} <span className="text-xs font-bold text-blue-400">{t("competition_management.rows")}</span>
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
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{t("competition_management.format")}</p>
                          <span className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest shadow-lg ${formatColors[format] || "bg-gray-600 text-white"}`}>
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
                      <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      {t("competition_management.scroll_to_view")}
                      <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
                                {t("competition_management.competition_content")}
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
                                  {header || `${t("competition_management.column")} ${index + 6}`}
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
                                      { name: row[2] || "", unit: row[3] || "" },
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
                                        {t("competition_management.total_athletes")}:
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
                    { code: "DK", label: t("competition_management.format_dk"), color: "bg-rose-600", desc: t("competition_management.format_dk_desc") },
                    { code: "SOL", label: t("competition_management.format_sol"), color: "bg-blue-600", desc: t("competition_management.format_sol_desc") },
                    { code: "TUV", label: t("competition_management.format_tuv"), color: "bg-emerald-600", desc: t("competition_management.format_tuv_desc") },
                    { code: "DAL", label: t("competition_management.format_dal"), color: "bg-indigo-600", desc: t("competition_management.format_dal_desc") },
                    { code: "DOL", label: t("competition_management.format_dol"), color: "bg-orange-600", desc: t("competition_management.format_dol_desc") },
                    { code: "VON", label: t("competition_management.format_von"), color: "bg-amber-600", desc: t("competition_management.format_von_desc") },
                  ].map((item) => (
                    <div key={item.code} className="flex flex-col gap-1.5 p-3 bg-white dark:bg-blue-900/20 rounded border border-blue-50 dark: shadow-sm hover:shadow-md transition-shadow">
                      <span className={`px-2 py-1 rounded text-[10px] font-black text-white ${item.color} w-fit`}>
                        {item.code}
                      </span>
                      <p className="text-[11px] font-black text-blue-900 dark:text-blue-100 leading-none">{item.label}</p>
                      <p className="text-[9px] font-bold text-blue-400 italic leading-none">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-blue-100/50 ">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-400"></div>
                      <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                        <strong className="font-black text-blue-600">{t("competition_management.legend_dk_title")}</strong> {t("competition_management.legend_dk_desc")}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-400"></div>
                      <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                        <strong className="font-black text-blue-600">{t("competition_management.legend_form_title")}</strong> {t("competition_management.legend_form_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - No Sheet Selected */}
            {!loading && selectedFile && sheetNames.length > 0 && !selectedSheet && (
              <div className="text-center py-24 bg-blue-50/20 dark:bg-blue-900/10 rounded-3xl border-2 border-dashed border-blue-100 ">
                <div className="w-20 h-20 bg-white dark:bg-blue-900 rounded flex items-center justify-center mx-auto mb-6 shadow-xl border border-blue-50 dark:">
                  <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">{t("competition_management.ready_to_analyze")}</h4>
                <p className="text-blue-500 text-xs font-bold italic">{t("competition_management.please_select_sheet")}</p>
              </div>
            )}

            {/* Empty State - No File Selected */}
            {!loading && !selectedFile && (
              <div className="text-center py-24 bg-blue-50/20 dark:bg-blue-900/10 rounded-3xl border-2 border-dashed border-blue-100 ">
                <div className="w-20 h-20 bg-white dark:bg-blue-900 rounded flex items-center justify-center mx-auto mb-6 shadow-xl border border-blue-50 dark:">
                  <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">{t("competition_management.no_data")}</h4>
                <p className="text-blue-500 text-xs font-bold italic text-center max-w-sm mx-auto">{t("competition_management.upload_excel_description")}</p>
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Confirm Modal */}
      <ConfirmModal {...modalProps} />

      {/* Referee Add/Edit Modal */}
      <Modal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        title={refModalMode === "add" ? t("competition_management.modal_add_referee") : t("competition_management.modal_edit_referee")}
        size="large"
      >
        <form onSubmit={handleSaveRefModal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("competition_management.referee_name")}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentRef.full_name}
                onChange={(e) => setCurrentRef({ ...currentRef, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("competition_management.unit")}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentRef.unit}
                onChange={(e) => setCurrentRef({ ...currentRef, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("competition_management.country")}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={currentRef.country}
                onChange={(e) => setCurrentRef({ ...currentRef, country: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("competition_management.referee_group")}</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <label key={num} className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-all border ${currentRef[`r${num}`] ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20" : "bg-gray-50 border-gray-200 dark:bg-gray-800/40"}`}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={!!currentRef[`r${num}`]}
                      onChange={(e) => setCurrentRef({ ...currentRef, [`r${num}`]: e.target.checked })}
                    />
                    <span className="text-[10px] font-bold font-mono">{t("competition_management.referee_label")} {num}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t("competition_management.special_referee_permissions")}</label>
              <div className="flex flex-wrap gap-4">
                <label className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-all border ${currentRef.is_ref_machine ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20" : "bg-gray-50 border-gray-200 dark:bg-gray-800/40"}`}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    checked={!!currentRef.is_ref_machine}
                    onChange={(e) => setCurrentRef({ ...currentRef, is_ref_machine: e.target.checked })}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{t("competition_management.machine_referee_label")}</span>
                    <span className="text-[10px] text-gray-500 italic">{t("competition_management.machine_referee_desc")}</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2 cursor-pointer p-3 rounded transition-all border ${currentRef.is_ref_court ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20" : "bg-gray-50 border-gray-200 dark:bg-gray-800/40"}`}>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                    checked={!!currentRef.is_ref_court}
                    onChange={(e) => setCurrentRef({ ...currentRef, is_ref_court: e.target.checked })}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">{t("competition_management.court_referee_label")}</span>
                    <span className="text-[10px] text-gray-500 italic">{t("competition_management.court_referee_desc")}</span>
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
              {refModalMode === "add" ? t("competition_management.button_add") : t("competition_management.button_save")}
            </button>
          </div>
        </form>
      </Modal>
    </div >
  );
}
