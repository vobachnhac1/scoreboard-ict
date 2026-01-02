import React, { useEffect, useState } from "react";
import { readSheetNames } from "read-excel-file";
import readXlsxFile from "read-excel-file";
import Button from "../../../components/Button";
import axios from "axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

export default function CompetitionManagement() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [sheetData, setSheetData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho tab quản lý dữ liệu
  const [savedData, setSavedData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

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
        setSheetNames(names.filter(ele=> !ele.includes('SKIP')));
        console.log('names: ', names);
        // thực hiện lưu file vào database
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi đọc file Excel:", error);
        alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra lại file.");
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

          if(formatType == 'DK') {
            console.log('📋 Format: Đối kháng (DK)');
            handleSaveToDatabase(sheetName, rows);
          } else if(formatType == 'DOL') {
            console.log('📋 Format: Đối luyện (DOL) - 1 VĐV/row');
            handleSaveDOLToDatabase(sheetName, rows);
          } else if(formatType == 'SOL') {
            console.log('📋 Format: Song luyện (SOL) - 2 VĐV/team');
            handleSaveSOLToDatabase(sheetName, rows);
          } else if(formatType == 'TUV') {
            console.log('📋 Format: Tự vệ (TUV) - 2 VĐV/team');
            handleSaveTUVToDatabase(sheetName, rows);
          } else if(formatType == 'DAL') {
            console.log('📋 Format: Đa luyện (DAL) - 4 VĐV/team');
            handleSaveDALToDatabase(sheetName, rows);
          } else {
            console.warn('⚠️ Format không xác định:', formatType);
            alert(`Format "${formatType}" không được hỗ trợ. Các format hợp lệ: DK, DOL, SOL, TUV, DAL`);
          }
          if(rows[0][0] == 'DK') {
            // handleSaveToDatabase(sheetName, rows);
            rows[0][0] = 'Trận số'
          }
          setHeaders(rows[0]); // Dòng đầu tiên là header
          setSheetData(rows.slice(1)); // Các dòng còn lại là data
        } else {
          setHeaders([]);
          setSheetData([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi đọc sheet:", error);
        alert("Lỗi khi đọc sheet. Vui lòng thử lại.");
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
      const response = await axios.post("http://localhost:6789/api/competition-dk", {
        sheet_name: sheetName,
        file_name: selectedFile?.name || "",
        data: rows
      });

      if (response.data.success) {
        const competitionDkId = response.data.data.id;

        // Bước 2: Tạo match_id cho từng row (bỏ qua header - row đầu tiên)
        const dataRows = rows.slice(1); // Bỏ header
        console.log('dataRows: ', dataRows);

        // Tạo danh sách matches để insert
        const matchesToCreate = dataRows.map((row, index) => ({
          competition_dk_id: competitionDkId,
          row_index: index,
          match_no: row[0] || `Match ${index + 1}`, // Cột đầu tiên là số trận
          red_name: row[3] || '', // Tên Giáp Đỏ
          red_team: row[4] || '',
          blue_name: row[6] || '', // Tên Giáp Xanh
          blue_team: row[7] || '',
          match_status: 'WAI', // Mặc định là chờ
          config_system: {} // Config mặc định
        }));

        // Bước 3: Bulk insert matches
        if (matchesToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match/bulk", {
            matches: matchesToCreate
          });
        }

        alert("Lưu dữ liệu DK và tạo matches thành công!");
        fetchSavedData(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Lỗi khi lưu dữ liệu: " + (error.response?.data?.message || error.message));
    }
  };

  // Lưu dữ liệu DOL (Đối luyện) vào database
  // Format Excel: [DOL, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 1 row = 1 VĐV = 1 match
  const handleSaveDOLToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post("http://localhost:6789/api/competition-dk", {
        sheet_name: sheetName,
        file_name: selectedFile?.name || "",
        data: rows
      });

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header
        console.log('📋 Parsing SOL/TUV/DAL/DOL data...');

        // Format Excel: [DOL, Mã số, Họ tên, Đơn vị, Nội dung thi]
        // Mapping: row[0]=DOL, row[1]=Mã số, row[2]=Họ tên, row[3]=Đơn vị, row[4]=Nội dung thi
        const teamsToCreate = dataRows.map((row, index) => ({
          competition_dk_id: competitionDkId,
          row_index: index,
          match_no: row[0] || `${index + 1}`, // Mã số
          match_name: row[4] || '', // Họ tên
          team_name: row[3] || '', // Đơn vị
          match_type: row[1] || 'DOL', // Nội dung thi
          match_status: 'WAI',
          config_system: {},
          athletes: [{ name: row[2] || '', unit: row[3] || '' }] // danh sách VĐV
        }));
        if (teamsToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match-team/bulk", {
            teams: teamsToCreate
          });
        }

        alert(`✅ Lưu ${teamsToCreate.length} VĐV DOL thành công!`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving DOL to database:", error);
      alert("Lỗi khi lưu dữ liệu DOL: " + (error.response?.data?.message || error.message));
    }
  };

  // Lưu dữ liệu SOL (Song luyện) vào database
  // Format Excel: [SOL, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 2 rows liên tục = 1 team
  const handleSaveSOLToDatabase = async (sheetName, rows) => {
    console.log('rows: ', rows);
    try {
      const response = await axios.post("http://localhost:6789/api/competition-dk", {
        sheet_name: sheetName,
        file_name: selectedFile?.name || "",
        data: rows
      });

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header

        const teamsToCreate = [];
        console.log('📋 Parsing SOL/TUV/DAL/DOL data...');

        // Group 2 rows liên tục
        for (let i = 0; i < dataRows.length; i += 2) {
          const row1 = dataRows[i];
          const row2 = dataRows[i + 1];

          if (!row1) continue;

          const athletes = [
            { name: row1[2] || '', unit: row1[3] || '' }
          ];

          if (row2) {
            athletes.push({ name: row2[2] || '', unit: row2[3] || '' });
          }
          teamsToCreate.push({
            competition_dk_id: competitionDkId,
            row_index: i,
            match_no: row1[0] || `${teamsToCreate.length + 1}`, // Mã số
            match_name: row1[4] ?? '', // Nội dung thi
            team_name: row1[3] || '', // Đơn vị
            match_type: row1[1] || 'SOL', // Hình thức
            match_status: 'WAI',
            config_system: {},
            athletes: athletes // danh sách VĐV 
          });
        }

        console.log('📊 Total teams:', teamsToCreate.length);

        if (teamsToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match-team/bulk", {
            teams: teamsToCreate
          });
        }

        alert(`✅ Lưu ${teamsToCreate.length} teams thành công!`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Lỗi khi lưu dữ liệu: " + (error.response?.data?.message || error.message));
    }
  };

  // Lưu dữ liệu TUV (Tự vệ) vào database
  // Format Excel: [TUV, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 2 rows liên tục = 1 team (giống SOL)
  const handleSaveTUVToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post("http://localhost:6789/api/competition-dk", {
        sheet_name: sheetName,
        file_name: selectedFile?.name || "",
        data: rows
      });

      if (response.data.success) {
        const competitionDkId = response.data.data.id;
        const dataRows = rows.slice(1); // Bỏ header

        const teamsToCreate = [];
        // Group 2 rows liên tục
        for (let i = 0; i < dataRows.length; i += 2) {
          const row1 = dataRows[i];
          const row2 = dataRows[i + 1];

          if (!row1) continue;

          const athletes = [
            { name: row1[2] || '', unit: row1[3] || '' }
          ];

          if (row2) {
            athletes.push({ name: row2[2] || '', unit: row2[3] || '' });
          }
          teamsToCreate.push({
            competition_dk_id: competitionDkId,
            row_index: i,
            match_no: row1[0] || `${teamsToCreate.length + 1}`, // Mã số
            match_name: row1[4] ?? '', // Nội dung thi
            team_name: row1[3] || '', // Đơn vị
            match_type: row1[1] || 'TUV', // Hình thức
            match_status: 'WAI',
            config_system: {},
            athletes: athletes // danh sách VĐV 
          });
        }

        if (teamsToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match-team/bulk", {
            teams: teamsToCreate
          });
        }

        alert(`✅ Lưu ${teamsToCreate.length} teams TUV thành công!`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving TUV to database:", error);
      alert("Lỗi khi lưu dữ liệu TUV: " + (error.response?.data?.message || error.message));
    }
  };

  // Lưu dữ liệu DAL (Đa luyện) vào database
  // Format Excel: [DAL, Mã số, Họ tên, Đơn vị, Nội dung thi]
  // 4 rows liên tục = 1 team
  const handleSaveDALToDatabase = async (sheetName, rows) => {
    try {
      const response = await axios.post("http://localhost:6789/api/competition-dk", {
        sheet_name: sheetName,
        file_name: selectedFile?.name || "",
        data: rows
      });

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

          const athletes = [
            { name: row1[2] || '', unit: row1[3] || '' }
          ];

          if (row2) athletes.push({ name: row2[2] || '', unit: row2[3] || '' });
          if (row3) athletes.push({ name: row3[2] || '', unit: row3[3] || '' });
          if (row4) athletes.push({ name: row4[2] || '', unit: row4[3] || '' });

          const athleteNames = athletes.map(a => a.name).filter(n => n).join(', ');

          teamsToCreate.push({
            competition_dk_id: competitionDkId,
            row_index: i,
            match_no: row1[0] || `${teamsToCreate.length + 1}`, // Mã số
            match_name: row1[4] ?? '', // Nội dung thi
            team_name: row1[3] || '', // Đơn vị
            match_type: row1[1] || 'DAL', // Hình thức
            match_status: 'WAI',
            config_system: {},
            athletes: athletes // danh sách VĐV 
          });
        }

        if (teamsToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match-team/bulk", {
            teams: teamsToCreate
          });
        }

        alert(`✅ Lưu ${teamsToCreate.length} teams DAL thành công!`);
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error saving DAL to database:", error);
      alert("Lỗi khi lưu dữ liệu DAL: " + (error.response?.data?.message || error.message));
    }
  };

  // Lấy danh sách dữ liệu đã lưu
  const fetchSavedData = async () => {
    setLoadingData(true);
    try {
      const response = await axios.get("http://localhost:6789/api/competition-dk");
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
    if (!confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) return;

    try {
      const response = await axios.delete(`http://localhost:6789/api/competition-dk/${id}`);
      if (response.data.success) {
        alert("Xóa dữ liệu thành công!");
        fetchSavedData();
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Lỗi khi xóa dữ liệu: " + (error.response?.data?.message || error.message));
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchSavedData();
  }, []);

  // Chuyển đến trang chi tiết
  const handleViewDetail = (item) => {
    console.log('item: ', item);
    if (item.sheet_name.startsWith("DK")) {
      navigate(`/management/competition-data/${item.id}`);
    } else { 
      navigate(`/management/competition-data-other/${item.id}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Quản lý Thi đấu</h2>

      <TabGroup>
        <TabList className="flex space-x-1 rounded-lg bg-blue-900/20 p-1 mb-6">

          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800'
              }`
            }
          >
            Quản lý dữ liệu
          </Tab>
            <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-700 hover:bg-white/[0.12] hover:text-blue-800'
              }`
            }
          >
            Upload & Import
          </Tab>
        </TabList>

        <TabPanels>
         

          {/* Tab 2: Quản lý dữ liệu */}
          <TabPanel>
            <div className="space-y-4">
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : savedData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
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
                  <p className="mt-2 text-sm text-gray-600">
                    Chưa có dữ liệu nào được lưu
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sheet Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số dòng
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {savedData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {item.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                            {item.sheet_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {item.file_name || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {item.data?.length || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                            <button
                              onClick={() => handleViewDetail(item)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Xem chi tiết
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabPanel>

               {/* Tab 1: Upload & Import */}
          <TabPanel>

            {/* Upload File Section */}
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="flex items-center gap-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                    Chọn file Excel
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      📄 {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-w-20"
                      onClick={handleReset}
                    >
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sheet Selection */}
            {sheetNames.length > 0 && (
              <div className="mb-6">
                <label htmlFor="sheet-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn Sheet
                </label>
                <select
                  id="sheet-select"
                  value={selectedSheet}
                  onChange={handleSheetChange}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn sheet --</option>
                  {sheetNames.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            )}

            {/* Data Table */}
            {!loading && sheetData.length > 0 && (
              <div className="w-full">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Dữ liệu từ sheet: <span className="text-blue-600">{selectedSheet}</span>
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Tổng số dòng: {sheetData.length}
                    </span>
                    {(() => {
                      // Detect format
                      const firstDataRow = sheetData[0];
                      const format = firstDataRow?.[1] || 'UNKNOWN';
                      const formatColors = {
                        'SOL': 'bg-blue-100 text-blue-800',
                        'TUV': 'bg-green-100 text-green-800',
                        'DAL': 'bg-purple-100 text-purple-800',
                        'DOL': 'bg-orange-100 text-orange-800',
                        'DK': 'bg-red-100 text-red-800'
                      };
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${formatColors[format] || 'bg-gray-100 text-gray-800'}`}>
                          Format: {format}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Scroll hint */}
                <div className="mb-2 flex items-center justify-end gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  <span>Cuộn ngang để xem thêm</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Scrollable container */}
                <div className="table-scroll-container overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-300 rounded-lg shadow-lg relative">
                  <style>{`
                    /* Custom scrollbar */
                    .table-scroll-container::-webkit-scrollbar {
                      height: 12px;
                      width: 12px;
                    }

                    .table-scroll-container::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 10px;
                    }

                    .table-scroll-container::-webkit-scrollbar-thumb {
                      background: linear-gradient(180deg, #888 0%, #666 100%);
                      border-radius: 10px;
                      border: 2px solid #f1f1f1;
                    }

                    .table-scroll-container::-webkit-scrollbar-thumb:hover {
                      background: linear-gradient(180deg, #666 0%, #444 100%);
                    }

                    .table-scroll-container::-webkit-scrollbar-corner {
                      background: #f1f1f1;
                    }

                    /* Scroll shadow indicators */
                    .table-scroll-container {
                      background:
                        linear-gradient(90deg, white 30%, rgba(255,255,255,0)),
                        linear-gradient(90deg, rgba(255,255,255,0), white 70%) 100% 0,
                        radial-gradient(farthest-side at 0 50%, rgba(0,0,0,.2), rgba(0,0,0,0)),
                        radial-gradient(farthest-side at 100% 50%, rgba(0,0,0,.2), rgba(0,0,0,0)) 100% 0;
                      background-repeat: no-repeat;
                      background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
                      background-attachment: local, local, scroll, scroll;
                    }

                    /* Team separator styles */
                    .team-row {
                      position: relative;
                    }

                    .team-row::after {
                      content: '';
                      position: absolute;
                      bottom: -4px;
                      left: 0;
                      right: 0;
                      height: 8px;
                      background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 100%);
                      pointer-events: none;
                    }

                    .team-row:last-child::after {
                      display: none;
                    }

                    /* Hover effect for team row */
                    .team-row:hover {
                      transform: translateY(-2px);
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                      z-index: 10;
                    }

                    /* Athlete card animation */
                    .athlete-card {
                      transition: all 0.2s ease;
                    }

                    .athlete-card:hover {
                      transform: translateX(4px);
                      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    }

                    /* Team number badge pulse */
                    @keyframes pulse-subtle {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.8; }
                    }

                    .team-badge {
                      animation: pulse-subtle 2s ease-in-out infinite;
                    }
                  `}</style>

                  <table className="min-w-full divide-y divide-gray-200 table-auto">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-20">
                      <tr>
                      {
                        !selectedSheet.startsWith('DK') && (
                          <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[80px]">
                           Team
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[100px]">
                          Mã số
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                          Hình thức
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[350px]">
                          Danh sách VĐV
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                          Nội dung thi
                        </th>
            </>
                        )
                      }

                        {headers.length > 5 && headers.slice(!selectedSheet.startsWith('DK')  ? 5: 0).map((header, index) => (
                          <th
                            key={index + 5}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-[150px]"
                          >
                            {header || `Cột ${index + 6}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {(() => {
                        // Detect format from first row
                        console.log('sheetData: ', selectedSheet.startsWith('DK'));
                        const firstDataRow = sheetData[0];
                        const detectedFormat = firstDataRow?.[1] || '';
                        const isDKFormat = selectedSheet.startsWith('DK') || detectedFormat === 'DK';

                        // Group rows into teams
                        const teams = [];
                        let currentTeam = null;
                        if(isDKFormat){
                          /// thực hiện khi là DK
                          sheetData.forEach((row, rowIndex) => {
                            currentTeam = {
                              extraCols: row.slice(0)
                            };
                            teams.push(currentTeam);

                          });
                        }else {
                          sheetData.forEach((row, rowIndex) => {
                            const isTeamStart = row[0] && row[0] !== '';

                            if (isTeamStart) {
                              // Start new team
                              currentTeam = {
                                teamNo: teams.length + 1,
                                matchNo: row[0],
                                matchType: row[1] || '',
                                matchName: row[4] || '',
                                redName: row[2] || '',
                                blueName: row[3] || '',
                                athletes: [{ name: row[2] || '', unit: row[3] || '' }],
                                extraCols: row.slice(5)
                              };
                              teams.push(currentTeam);
                            } else if (currentTeam && row[2]) {
                              // Add athlete to current team
                              currentTeam.athletes.push({ name: row[2] || '', unit: row[3] || '' });
                            }
                          });
                        }
                        // Render teams
                        return teams.map((team, teamIndex) => {
                          const matchType = team.matchType;
                          const bgColors = {
                            'SOL': 'bg-blue-50',
                            'TUV': 'bg-green-50',
                            'DAL': 'bg-purple-50',
                            'DOL': 'bg-orange-50',
                            'DK': 'bg-red-50'
                          };
                          const borderColors = {
                            'SOL': 'border-l-4 border-blue-400',
                            'TUV': 'border-l-4 border-green-400',
                            'DAL': 'border-l-4 border-purple-400',
                            'DOL': 'border-l-4 border-orange-400',
                            'DK': 'border-l-4 border-red-400'
                          };

                          // DK format: Hiển thị khác
                          if (isDKFormat || matchType === 'DK') {
                            return (
                              <tr
                                key={teamIndex}
                                className={`team-row ${bgColors[matchType] || 'bg-gray-50'} ${borderColors[matchType] || 'border-l-1 border-gray-400'} transition-all duration-200 ${teamIndex > 0 ? 'border-t-1 border-gray-300' : ''}`}
                              >
                              
                                {/* Extra Columns */}
                                {team.extraCols && team.extraCols.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300 last:border-r-0"
                                  >
                                    {cell !== null && cell !== undefined ? String(cell) : "-"}
                                  </td>
                                ))}
                              </tr>
                            );
                          }

                          // SOL/TUV/DAL/DOL format: Hiển thị đầy đủ
                          return (
                            <tr
                              key={teamIndex}
                              className={`team-row ${bgColors[matchType] || 'bg-gray-50'} ${borderColors[matchType] || 'border-l-1 border-gray-400'} transition-all duration-200 ${teamIndex > 0 ? 'border-t-1 border-gray-300' : ''}`}
                            >
                              {/* Team Number */}
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-700 border-r border-gray-300">
                                <div className="team-badge flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                  {team.teamNo}
                                </div>
                              </td>

                              {/* Match No */}
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-r border-gray-300">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{team.matchNo}</span>
                                </div>
                              </td>

                              {/* Match Type Badge */}
                              <td className="px-4 py-4 whitespace-nowrap text-sm border-r border-gray-300">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                                  matchType === 'SOL' ? 'bg-blue-500 text-white' :
                                  matchType === 'TUV' ? 'bg-green-500 text-white' :
                                  matchType === 'DAL' ? 'bg-purple-500 text-white' :
                                  matchType === 'DOL' ? 'bg-orange-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {matchType}
                                </span>
                              </td>

                              {/* Athletes List */}
                              <td className="px-4 py-4 text-sm border-r border-gray-300">
                                <div className="space-y-2">
                                  {team.athletes.map((athlete, athleteIndex) => (
                                    <div
                                      key={athleteIndex}
                                      className="athlete-card flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-300"
                                    >
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                        {athleteIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 truncate text-sm">
                                          {athlete.name || '-'}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                          <span>📍</span>
                                          <span>{athlete.unit || '-'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 font-medium">
                                      Tổng số VĐV:
                                    </div>
                                    <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                      {team.athletes.length}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Match Name */}
                              <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-300">
                                <div className="font-medium">{team.matchName || '-'}</div>
                              </td>

                              {/* Extra Columns */}
                              {team.extraCols && team.extraCols.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-300 last:border-r-0"
                                >
                                  {cell !== null && cell !== undefined ? String(cell) : "-"}
                                </td>
                              ))}
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Chú thích:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-semibold">DK</span>
                      <span className="text-gray-600">Đối kháng (1v1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">SOL</span>
                      <span className="text-gray-600">Song luyện (2 VĐV)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-semibold">TUV</span>
                      <span className="text-gray-600">Tự vệ (2 VĐV)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-semibold">DAL</span>
                      <span className="text-gray-600">Đại luyện (4 VĐV)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 font-semibold">DOL</span>
                      <span className="text-gray-600">Đơn luyện (1 VĐV)</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                    <p className="text-xs text-gray-500">
                      💡 <strong>DK (Đối kháng):</strong> Hiển thị Đỏ vs Xanh
                    </p>
                    <p className="text-xs text-gray-500">
                      💡 <strong>SOL/TUV/DAL/DOL:</strong> Hiển thị danh sách VĐV trong team
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && selectedFile && sheetNames.length > 0 && !selectedSheet && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Vui lòng chọn một sheet để xem dữ liệu
                </p>
              </div>
            )}

            {!loading && !selectedFile && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Chưa có file nào được chọn. Vui lòng upload file Excel.
                </p>
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );

}