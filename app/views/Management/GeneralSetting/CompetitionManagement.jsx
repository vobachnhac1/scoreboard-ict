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
          // kiểm tra rows[0][0]
          if(rows[0][0] == 'DK') {
            console.log('rows[0][0]: ',rows[0][0]);
            // thực hiện lưu vào database
            handleSaveToDatabase(sheetName, rows);
          } else if(rows[0][0] == 'TUV') {
            console.log('rows[0][0]: ',rows[0][0]);
          } else if(rows[0][0] == 'SOL') {
            console.log('rows[0][0]: ',rows[0][0]);
          } else if(rows[0][0] == 'DOL') {
            console.log('rows[0][0]: ',rows[0][0]);
          } else if(rows[0][0] == 'DAL') {
            console.log('rows[0][0]: ',rows[0][0]);
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

  // Lưu dữ liệu vào database
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

        // Tạo danh sách matches để insert
        const matchesToCreate = dataRows.map((row, index) => ({
          competition_dk_id: competitionDkId,
          row_index: index,
          match_no: row[0] || `Match ${index + 1}`, // Cột đầu tiên là số trận
          red_name: row[1] || '', // Tên Giáp Đỏ
          blue_name: row[4] || '', // Tên Giáp Xanh
          match_status: 'WAI', // Mặc định là chờ
          config_system: {} // Config mặc định
        }));

        // Bước 3: Bulk insert matches
        if (matchesToCreate.length > 0) {
          await axios.post("http://localhost:6789/api/competition-match/bulk", {
            matches: matchesToCreate
          });
        }

        alert("Lưu dữ liệu và tạo matches thành công!");
        fetchSavedData(); // Refresh danh sách
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      alert("Lỗi khi lưu dữ liệu: " + (error.response?.data?.message || error.message));
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
    navigate(`/management/competition-data/${item.id}`);
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
            Upload & Import
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
            Quản lý dữ liệu
          </Tab>
        </TabList>

        <TabPanels>
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
              <div className="overflow-x-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Dữ liệu từ sheet: <span className="text-blue-600">{selectedSheet}</span>
                  </h3>
                  <span className="text-sm text-gray-600">
                    Tổng số dòng: {sheetData.length}
                  </span>
                </div>

                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STT
                        </th>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header || `Cột ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sheetData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {rowIndex + 1}
                          </td>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                            >
                              {cell !== null && cell !== undefined ? String(cell) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
        </TabPanels>
      </TabGroup>
    </div>
  );

}