import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";

// export default function DoiKhangResultReport() {
//   const [excelData, setExcelData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const [showPreview, setShowPreview] = useState(false);
//   const [reportTitle, setReportTitle] = useState("BÁO CÁO KẾT QUẢ ĐỐI KHÁNG");
//   const [filterType, setFilterType] = useState("all"); // all, DK, results
//   const [templateSettings, setTemplateSettings] = useState({
//     showHeader: true,
//     showFooter: true,
//     showPageNumbers: true,
//     orientation: "landscape",
//     fontSize: "12px",
//     showStats: true,
//   });

//   const printRef = useRef();

//   // Load default Excel file on component mount
//   useEffect(() => {
//     loadDefaultExcelFile();
//   }, []);

//   // Filter data when filterType changes
//   useEffect(() => {
//     filterDataByType();
//   }, [excelData, filterType]);

//   const loadDefaultExcelFile = async () => {
//     console.log("🔄 Starting to load Excel file: /exports/DOIKHANG_KQ.xlsx");
//     try {
//       const response = await fetch("/exports/DOIKHANG_KQ.xlsx");
//       console.log("📡 Fetch response:", response.status, response.statusText);

//       // Check if the response is successful and is actually an Excel file
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const contentType = response.headers.get("content-type");
//       console.log(" Content-Type:", contentType);

//       if (
//         contentType &&
//         !contentType.includes(
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         ) &&
//         !contentType.includes("application/vnd.ms-excel") &&
//         !contentType.includes("application/octet-stream")
//       ) {
//         console.warn(" Response content type:", contentType);
//         throw new Error("Response is not an Excel file");
//       }

//       console.log("📥 Getting array buffer...");
//       const arrayBuffer = await response.arrayBuffer();
//       console.log(" Array buffer size:", arrayBuffer.byteLength, "bytes");

//       const data = new Uint8Array(arrayBuffer);
//       console.log(" Reading workbook with XLSX...");
//       const workbook = XLSX.read(data, { type: "array" });
//       console.log("📋 Workbook sheets:", workbook.SheetNames);

//       // Read first sheet
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//       console.log("📈 JSON data rows:", jsonData.length);

//       if (jsonData.length > 0) {
//         console.log("📝 Headers:", jsonData[0]);
//         console.log(" Sample data row:", jsonData[1]);
//         setHeaders(jsonData[0]);
//         setExcelData(jsonData.slice(1));
//         console.log(
//           " Successfully loaded Excel file with",
//           jsonData.length - 1,
//           "rows",
//         );
//       } else {
//         throw new Error("Excel file is empty");
//       }
//     } catch (error) {
//       console.error(" Lỗi khi tải file Excel mặc định:", error);
//       console.log("🔄 Falling back to sample data...");
//       // Fallback: create sample data structure
//       createSampleData();
//     }
//   };

//   const createSampleData = () => {
//     const sampleHeaders = [
//       "STT",
//       "Mã VĐV",
//       "Họ tên",
//       "Đội",
//       "Loại",
//       "Đối thủ",
//       "Kết quả",
//       "Điểm",
//       "Thời gian",
//       "Ghi chú",
//     ];

//     const sampleData = [
//       [
//         2,
//         "VDV002",
//         "Nguyễn Văn B",
//         "TP.HCM",
//         "DK",
//         "Nguyễn Văn A",
//         "Thua",
//         "10-15",
//         "10:30",
//         "",
//       ],
//       [
//         3,
//         "VDV003",
//         "Trần Thị C",
//         "Đà Nẵng",
//         "DK",
//         "Lê Thị D",
//         "Thắng",
//         "12-8",
//         "11:00",
//         "",
//       ],
//       [
//         4,
//         "VDV004",
//         "Lê Thị D",
//         "Cần Thơ",
//         "DK",
//         "Trần Thị C",
//         "Thua",
//         "8-12",
//         "11:00",
//         "",
//       ],
//       [
//         5,
//         "VDV005",
//         "Phạm Văn E",
//         "Hải Phòng",
//         "KQ",
//         "Hoàng Văn F",
//         "Hòa",
//         "10-10",
//         "11:30",
//         "Gia hạn",
//       ],
//       [
//         6,
//         "VDV006",
//         "Hoàng Văn F",
//         "Huế",
//         "KQ",
//         "Phạm Văn E",
//         "Hòa",
//         "10-10",
//         "11:30",
//         "Gia hạn",
//       ],
//     ];

//     setHeaders(sampleHeaders);
//     setExcelData(sampleData);
//   };

//   const filterDataByType = () => {
//     if (!excelData.length) return;

//     let filtered = [...excelData];

//     if (filterType === "DK") {
//       // Filter rows where "Loại" column contains "DK"
//       filtered = excelData.filter((row) => {
//         const typeIndex = headers.findIndex((h) =>
//           h.toLowerCase().includes("loại"),
//         );
//         return typeIndex !== -1 && row[typeIndex] === "DK";
//       });
//     } else if (filterType === "results") {
//       // Filter rows with match results
//       filtered = excelData.filter((row) => {
//         const resultIndex = headers.findIndex((h) =>
//           h.toLowerCase().includes("kết quả"),
//         );
//         return (
//           resultIndex !== -1 && row[resultIndex] && row[resultIndex] !== ""
//         );
//       });
//     }

//     setFilteredData(filtered);
//   };

//   const getStatistics = () => {
//     if (!filteredData.length) return {};

//     const resultIndex = headers?.findIndex((h) =>
//       h?.toLowerCase().includes("kết quả"),
//     ) || 0;
//     const typeIndex = headers?.findIndex((h) =>
//       h?.toLowerCase().includes("loại"),
//     ) || 0;

//     const stats = {
//       total: filteredData.length,
//       wins: 0,
//       losses: 0,
//       draws: 0,
//       dkMatches: 0,
//       otherMatches: 0,
//     };

//     filteredData.forEach((row) => {
//       if (resultIndex !== -1) {
//         const result = row[resultIndex]?.toLowerCase();
//         if (result === "thắng") stats.wins++;
//         else if (result === "thua") stats.losses++;
//         else if (result === "hòa") stats.draws++;
//       }

//       if (typeIndex !== -1) {
//         const type = row[typeIndex];
//         if (type === "DK") stats.dkMatches++;
//         else stats.otherMatches++;
//       }
//     });

//     return stats;
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: reportTitle,
//     pageStyle: `
//       @page {
//         size: ${templateSettings.orientation === "landscape" ? "A4 landscape" : "A4 portrait"};
//         margin: 15mm;
//       }
//       @media print {
//         body { -webkit-print-color-adjust: exact; }
//         .no-print { display: none !important; }
//       }
//     `,
//   });

//   const stats = getStatistics();

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 Báo cáo kết quả đối kháng
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Xem và xuất báo cáo kết quả thi đấu đối kháng
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <Button
//                 variant="secondary"
//                 onClick={() => setShowPreview(true)}
//                 disabled={!filteredData.length}
//               >
//                 Xem trước
//               </Button>
//               <Button
//                 variant="primary"
//                 onClick={handlePrint}
//                 disabled={!filteredData.length}
//               >
//                 Xuất PDF
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Left Panel - Settings */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Filter Settings */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                 Bộ lọc dữ liệu
//               </h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Loại dữ liệu
//                   </label>
//                   <select
//                     value={filterType}
//                     onChange={(e) => setFilterType(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   >
//                     <option value="all">Tất cả</option>
//                     <option value="DK">Chỉ đối kháng (DK)</option>
//                     <option value="results">Có kết quả</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Statistics */}
//             {templateSettings.showStats && (
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                   Thống kê
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Tổng số trận:
//                     </span>
//                     <span className="font-semibold text-gray-900 dark:text-white">
//                       {stats.total}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Thắng:
//                     </span>
//                     <span className="font-semibold text-green-600 dark:text-green-400">
//                       {stats.wins}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Thua:
//                     </span>
//                     <span className="font-semibold text-red-600 dark:text-red-400">
//                       {stats.losses}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">
//                       Hòa:
//                     </span>
//                     <span className="font-semibold text-yellow-600 dark:text-yellow-400">
//                       {stats.draws}
//                     </span>
//                   </div>
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">
//                         Đối kháng (DK):
//                       </span>
//                       <span className="font-semibold text-blue-600 dark:text-blue-400">
//                         {stats.dkMatches}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">
//                         Khác:
//                       </span>
//                       <span className="font-semibold text-purple-600 dark:text-purple-400">
//                         {stats.otherMatches}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Template Settings */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                 Cài đặt báo cáo
//               </h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Tiêu đề
//                   </label>
//                   <input
//                     type="text"
//                     value={reportTitle}
//                     onChange={(e) => setReportTitle(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Hướng trang
//                   </label>
//                   <select
//                     value={templateSettings.orientation}
//                     onChange={(e) =>
//                       setTemplateSettings({
//                         ...templateSettings,
//                         orientation: e.target.value,
//                       })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   >
//                     <option value="portrait">Dọc</option>
//                     <option value="landscape">Ngang</option>
//                   </select>
//                 </div>

//                 <div className="space-y-3">
//                   <label className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={templateSettings.showHeader}
//                       onChange={(e) =>
//                         setTemplateSettings({
//                           ...templateSettings,
//                           showHeader: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
//                     />
//                     <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                       Hiển thị header
//                     </span>
//                   </label>

//                   <label className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={templateSettings.showStats}
//                       onChange={(e) =>
//                         setTemplateSettings({
//                           ...templateSettings,
//                           showStats: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
//                     />
//                     <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                       Hiển thị thống kê
//                     </span>
//                   </label>

//                   <label className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={templateSettings.showFooter}
//                       onChange={(e) =>
//                         setTemplateSettings({
//                           ...templateSettings,
//                           showFooter: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 dark:text-blue-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
//                     />
//                     <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                       Hiển thị footer
//                     </span>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Panel - Preview */}
//           <div className="lg:col-span-3">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                 Xem trước dữ liệu
//               </h3>

//               {filteredData.length > 0 ? (
//                 <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
//                   <div className="max-h-96 overflow-auto">
//                     <table className="w-full text-sm">
//                       <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
//                         <tr>
//                           {headers.map((header, index) => (
//                             <th
//                               key={index}
//                               className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600"
//                             >
//                               {header}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {filteredData.slice(0, 10).map((row, rowIndex) => (
//                           <tr
//                             key={rowIndex}
//                             className={
//                               rowIndex % 2 === 0
//                                 ? "bg-white dark:bg-gray-800"
//                                 : "bg-gray-50 dark:bg-gray-700"
//                             }
//                           >
//                             {headers.map((_, colIndex) => (
//                               <td
//                                 key={colIndex}
//                                 className="px-3 py-2 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600"
//                               >
//                                 {row[colIndex] || ""}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   {filteredData.length > 10 && (
//                     <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600">
//                       Hiển thị 10/{filteredData.length} dòng đầu tiên
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-12 text-gray-500 dark:text-gray-400">
//                   <p>Không có dữ liệu để hiển thị</p>
//                   <p className="text-sm mt-2">
//                     Thử thay đổi bộ lọc hoặc kiểm tra file Excel
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Hidden Print Template */}
//         <div style={{ display: "none" }}>
//           <div
//             ref={printRef}
//             className="bg-white p-8"
//             style={{ fontSize: templateSettings.fontSize }}
//           >
//             {/* Header */}
//             {templateSettings.showHeader && (
//               <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                   {reportTitle}
//                 </h1>
//                 <p className="text-gray-600 text-sm">
//                   Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
//                 </p>
//               </div>
//             )}

//             {/* Statistics Summary */}
//             {templateSettings.showStats && (
//               <div className="mb-6 grid grid-cols-6 gap-4">
//                 <div className="text-center p-3 bg-blue-50 rounded">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {stats.total}
//                   </div>
//                   <div className="text-sm text-blue-800">Tổng trận</div>
//                 </div>
//                 <div className="text-center p-3 bg-green-50 rounded">
//                   <div className="text-2xl font-bold text-green-600">
//                     {stats.wins}
//                   </div>
//                   <div className="text-sm text-green-800">Thắng</div>
//                 </div>
//                 <div className="text-center p-3 bg-red-50 rounded">
//                   <div className="text-2xl font-bold text-red-600">
//                     {stats.losses}
//                   </div>
//                   <div className="text-sm text-red-800">Thua</div>
//                 </div>
//                 <div className="text-center p-3 bg-yellow-50 rounded">
//                   <div className="text-2xl font-bold text-yellow-600">
//                     {stats.draws}
//                   </div>
//                   <div className="text-sm text-yellow-800">Hòa</div>
//                 </div>
//                 <div className="text-center p-3 bg-purple-50 rounded">
//                   <div className="text-2xl font-bold text-purple-600">
//                     {stats.dkMatches}
//                   </div>
//                   <div className="text-sm text-purple-800">Đối kháng</div>
//                 </div>
//                 <div className="text-center p-3 bg-gray-50 rounded">
//                   <div className="text-2xl font-bold text-gray-600">
//                     {stats.otherMatches}
//                   </div>
//                   <div className="text-sm text-gray-800">Khác</div>
//                 </div>
//               </div>
//             )}

//             {/* Data Table */}
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
//                     {headers.map((header, index) => (
//                       <th
//                         key={index}
//                         className="border border-gray-400 px-3 py-2 text-left font-semibold text-sm"
//                       >
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredData.map((row, rowIndex) => (
//                     <tr
//                       key={rowIndex}
//                       className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
//                     >
//                       {headers.map((_, colIndex) => (
//                         <td
//                           key={colIndex}
//                           className="border border-gray-400 px-3 py-2 text-sm"
//                         >
//                           {row[colIndex] || ""}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             {templateSettings.showFooter && (
//               <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Báo cáo được tạo tự động từ hệ thống
//                 </p>
//                 <p className="text-gray-500 text-xs mt-1">
//                   Tổng số bản ghi: {filteredData.length} | Bộ lọc:{" "}
//                   {filterType === "all"
//                     ? "Tất cả"
//                     : filterType === "DK"
//                       ? "Đối kháng (DK)"
//                       : "Có kết quả"}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Preview Modal */}
//         <Modal
//           isOpen={showPreview}
//           onClose={() => setShowPreview(false)}
//           title="Xem trước báo cáo"
//           size="full"
//         >
//           <div
//             className="bg-white p-8"
//             style={{ fontSize: templateSettings.fontSize }}
//           >
//             {/* Header */}
//             {templateSettings.showHeader && (
//               <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
//                 <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                   {reportTitle}
//                 </h1>
//                 <p className="text-gray-600 text-sm">
//                   Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
//                 </p>
//               </div>
//             )}

//             {/* Statistics Summary */}
//             {templateSettings.showStats && (
//               <div className="mb-6 grid grid-cols-6 gap-4">
//                 <div className="text-center p-3 bg-blue-50 rounded">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {stats.total}
//                   </div>
//                   <div className="text-sm text-blue-800">Tổng trận</div>
//                 </div>
//                 <div className="text-center p-3 bg-green-50 rounded">
//                   <div className="text-2xl font-bold text-green-600">
//                     {stats.wins}
//                   </div>
//                   <div className="text-sm text-green-800">Thắng</div>
//                 </div>
//                 <div className="text-center p-3 bg-red-50 rounded">
//                   <div className="text-2xl font-bold text-red-600">
//                     {stats.losses}
//                   </div>
//                   <div className="text-sm text-red-800">Thua</div>
//                 </div>
//                 <div className="text-center p-3 bg-yellow-50 rounded">
//                   <div className="text-2xl font-bold text-yellow-600">
//                     {stats.draws}
//                   </div>
//                   <div className="text-sm text-yellow-800">Hòa</div>
//                 </div>
//                 <div className="text-center p-3 bg-purple-50 rounded">
//                   <div className="text-2xl font-bold text-purple-600">
//                     {stats.dkMatches}
//                   </div>
//                   <div className="text-sm text-purple-800">Đối kháng</div>
//                 </div>
//                 <div className="text-center p-3 bg-gray-50 rounded">
//                   <div className="text-2xl font-bold text-gray-600">
//                     {stats.otherMatches}
//                   </div>
//                   <div className="text-sm text-gray-800">Khác</div>
//                 </div>
//               </div>
//             )}

//             {/* Data Table */}
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr style={{ backgroundColor: "#1f2937", color: "white" }}>
//                     {headers.map((header, index) => (
//                       <th
//                         key={index}
//                         className="border border-gray-400 px-3 py-2 text-left font-semibold text-sm"
//                       >
//                         {header}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredData.map((row, rowIndex) => (
//                     <tr
//                       key={rowIndex}
//                       className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
//                     >
//                       {headers.map((_, colIndex) => (
//                         <td
//                           key={colIndex}
//                           className="border border-gray-400 px-3 py-2 text-sm"
//                         >
//                           {row[colIndex] || ""}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Footer */}
//             {templateSettings.showFooter && (
//               <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center">
//                 <p className="text-gray-600 text-sm">
//                   Báo cáo được tạo tự động từ hệ thống
//                 </p>
//                 <p className="text-gray-500 text-xs mt-1">
//                   Tổng số bản ghi: {filteredData.length} | Bộ lọc:{" "}
//                   {filterType === "all"
//                     ? "Tất cả"
//                     : filterType === "DK"
//                       ? "Đối kháng (DK)"
//                       : "Có kết quả"}
//                 </p>
//               </div>
//             )}
//           </div>
//         </Modal>
//       </div>
//     </div>
//   );
// }

const dataDoiKhang = {
  config_system: {
    ten_giai_dau: "GIẢI CÚP VÕ HIỆN ĐẠI NĂM 2026",
    ten_mon_thi: "VÕ HIỆN ĐẠI",
    so_hiep: 3,
    so_giam_dinh: 5,
    he_diem: 10,
    tieu_de: "KẾT QUẢ THI ĐẤU",
  },
  ten_giai_dau: "GIẢI CÚP VÕ HIỆN ĐẠI NĂM 2026",
  ngay_thi: "17/01/2026",
  match_id: "Trận 1",
  match_level: "Nhóm 1", // Hạng cân:
  match_type: "Vòng loại", // Thể thức
  match_weight: "70kg", // Hạng cân
  red: {
    name: "Nguyễn Văn A",
    unit: "TP.HCM",
    country: "Việt Nam",
  },
  blue: {
    name: "Trần Thị B",
    unit: "Đà Nẵng",
    country: "Việt Nam",
  },
  winner: "red", // red, blue, null
  total_score: {
    red: 20,
    blue: 16,
  },
  match_history: [
    // Hiệp 1
    {
      round: 1,
      round_type: "main", // main, extra
      red: {
        score: 10, // Tổng điểm trong hiệp này
        remind: 1, // nhắc nhở/ Khiển trách
        warn: 0, // cảnh cáo
        mins: 0, // điểm trừ
        incr: 0, // điểm cộng
      },
      blue: {
        score: 8,
        remind: 0,
        warn: 1,
        mins: 0,
        incr: 0,
      },
      actions: [
        {
          time: "00:05.3",
          team: "red",
          action: "score",
          value: 2,
          description: "Điểm 2",
        },
        {
          time: "00:10.1",
          team: "blue",
          action: "score",
          value: 1,
          description: "Điểm 1",
        },
      ],
    },
    // Hiệp 2
    {
      round: 2,
      round_type: "main", // main, extra
      red: {
        score: 10, // Tổng điểm trong hiệp này
        remind: 1, // nhắc nhở/ Khiển trách
        warn: 0, // cảnh cáo
        mins: 0, // điểm trừ
        incr: 0, // điểm cộng
      },
      blue: {
        score: 8,
        remind: 0,
        warn: 1,
        mins: 0,
        incr: 0,
      },
      actions: [
        {
          time: "00:05.3",
          team: "red",
          action: "score",
          value: 2,
          description: "Điểm 2",
        },
        {
          time: "00:10.1",
          team: "blue",
          action: "score",
          value: 1,
          description: "Điểm 1",
        },
        {
          time: "00:15.0",
          team: "red",
          action: "remind",
          value: 1,
          description: "Nhắc nhở",
        },
      ],
    },
    // Hiệp phụ
    {
      round: 3,
      round_type: "extra", // main, extra
      red: {
        score: 10, // Tổng điểm trong hiệp này
        remind: 1, // nhắc nhở/ Khiển trách
        warn: 0, // cảnh cáo
        mins: 0, // điểm trừ
        incr: 0, // điểm cộng
      },
      blue: {
        score: 8,
        remind: 0,
        warn: 1,
        mins: 0,
        incr: 0,
      },
      actions: [
        {
          time: "00:05.3",
          team: "red",
          action: "score",
          value: 2,
          description: "Điểm 2",
        },
        {
          time: "00:10.1",
          team: "blue",
          action: "score",
          value: 1,
          description: "Điểm 1",
        },
      ],
    },
  ],
  referrees: [
    {
      name: "Nguyễn Văn A",
      unit: "TP.HCM",
      country: "Việt Nam",
      referrer: 1,
    },
    {
      name: "Trần Thị B",
      unit: "Đà Nẵng",
      country: "Việt Nam",
      referrer: 2,
    },
    {
      name: "Lê Văn C",
      unit: "Hà Nội",
      country: "Việt Nam",
      referrer: 3,
    },
    {
      name: "Phạm Thị D",
      unit: "TP.HCM",
      country: "Việt Nam",
      referrer: 4,
    },
    {
      name: "Hoàng Văn E",
      unit: "Đà Nẵng",
      country: "Việt Nam",
      referrer: 5,
    },
  ],
};

// Màn hình xem trước trước khi in Đối Kháng
const DoiKhangResultReport = () => {
  // tạo template báo cáo theo data mẫu dataDoiKhang
  const data = dataDoiKhang;
  const navigate = useNavigate();

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Bao_cao_ket_qua_doi_khang",
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  const handleDownloadPDF = () => {
    // Create a temporary print-optimized view for PDF download
    const printWindow = window.open("", "_blank");
    const content = templateRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Báo cáo kết quả Đối Kháng</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 16px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
              font-size: 12px;
            }
            /* Background colors */
            .bg-white { background-color: #fff !important; }
            .bg-red-100 { background-color: #fee2e2 !important; }
            .bg-blue-100 { background-color: #dbeafe !important; }
            .bg-gray-100 { background-color: #f3f4f6 !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-yellow-100 { background-color: #fef3c7 !important; }

            /* Text colors */
            .text-red-600 { color: #dc2626 !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-gray-800 { color: #1f2937 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-600 { color: #4b5563 !important; }

            /* Font weights */
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }

            /* Text alignment */
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .text-right { text-align: right !important; }

            /* Spacing */
            .p-4 { padding: 16px !important; }
            .p-2 { padding: 8px !important; }
            .p-1 { padding: 4px !important; }
            .px-0\.5 { padding-left: 2px !important; padding-right: 2px !important; }
            .py-0\.5 { padding-top: 2px !important; padding-bottom: 2px !important; }
            .px-1 { padding-left: 4px !important; padding-right: 4px !important; }
            .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
            .mb-1 { margin-bottom: 4px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-6 { margin-bottom: 24px !important; }
            .mt-4 { margin-top: 16px !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }

            /* Borders */
            .border { border: 1px solid #d1d5db !important; }
            .border-r { border-right: 1px solid #d1d5db !important; }
            .border-gray-300 { border-color: #d1d5db !important; }

            /* Width */
            .w-full { width: 100% !important; }
            .max-w-4xl { max-width: 56rem !important; }

            /* Display */
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .gap-4 { gap: 16px !important; }

            /* Grid */
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }

            /* Shadow - remove for print */
            .shadow-lg { box-shadow: none !important; }

            /* Rounded corners */
            .rounded-lg { border-radius: 8px !important; }

            /* Font sizes */
            .text-xs { font-size: 12px !important; }
            .text-sm { font-size: 14px !important; }
            .text-base { font-size: 16px !important; }
            .text-lg { font-size: 18px !important; }
            .text-xl { font-size: 20px !important; }
            .text-2xl { font-size: 24px !important; }
            .text-3xl { font-size: 30px !important; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then trigger print dialog
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Close window after printing (user can cancel)
      setTimeout(() => printWindow.close(), 100);
    }, 250);
  };
  const templateRef = useRef();
  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <div
        ref={templateRef}
        className="w-full max-w-none mx-auto bg-white p-2 shadow-lg print:shadow-none print:p-1 print:max-w-none print:w-full print:h-full"
        style={{
          width: "210mm",
          minHeight: "297mm",
          maxWidth: "210mm",
          fontSize: "10px",
          lineHeight: "1.2",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header - Thông tin giải đấu */}
        <div className="mb-1 border-gray-300 pb-1">
          <h1
            className="font-bold text-gray-800 mb-1 text-center"
            style={{ fontSize: "13px" }}
          >
            {data.config_system.ten_giai_dau}
          </h1>
          <h2
            className="font-semibold text-gray-700 mb-1 text-center"
            style={{ fontSize: "11px" }}
          >
            {data.config_system.tieu_de}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Môn thi
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Ngày thi
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Số hiệp
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Số giám định
                  </th>
                  {/* <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                  Hệ điểm
                </th> */}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-gray-800 text-xs">
                    {data.config_system.ten_mon_thi}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.ngay_thi}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.config_system.so_hiep}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.config_system.so_giam_dinh}
                  </td>
                  {/* <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                  {data.config_system.he_diem}
                </td> */}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông tin trận đấu */}
        <div className="mb-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Trận đấu
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Nhóm
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Thể thức
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Hạng cân
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-gray-800 text-xs">
                    {data.match_id}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.match_level}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.match_type}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.match_weight}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông tin VDV */}
        <div className="mb-3">
          <h3
            className="font-bold text-gray-800 mb-1 text-left"
            style={{ fontSize: "11px" }}
          >
            THÔNG TIN VẬN ĐỘNG VIÊN
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Giáp
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Họ tên
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Đơn vị
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Quốc gia
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* VDV Đỏ */}
                <tr className="hover:bg-red-50">
                  <td className="border border-gray-300 px-1 py-0.5 text-center">
                    <div className="inline-flex items-center justify-center w-4 h-4 ">
                      <span className="text-black font-bold text-xs">ĐỎ</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-gray-800 text-xs">
                    {data.red.name}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.red.unit}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.red.country}
                  </td>
                </tr>

                {/* VDV Xanh */}
                <tr className="hover:bg-blue-50">
                  <td className="border border-gray-300 px-1 py-0.5 text-center">
                    <div className="inline-flex items-center justify-center w-4 h-4 ">
                      <span className="text-black font-bold text-xs">XANH</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-gray-800 text-xs">
                    {data.blue.name}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.blue.unit}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-gray-700 text-xs">
                    {data.blue.country}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chi tiết từng hiệp */}
        <div className="mb-1">
          <h3
            className="font-bold text-gray-800 mb-1 text-left"
            style={{ fontSize: "11px" }}
          >
            CHI TIẾT TỪNG HIỆP
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-0.5 text-center font-semibold text-gray-800 text-xs">
                    HIỆP
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-center font-semibold text-red-600 text-xs">
                    VĐV ĐỎ
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-center font-semibold text-blue-600 text-xs">
                    VĐV XANH
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-1 py-0.5 text-xs font-medium text-gray-600"></th>
                  <th className="border border-gray-300 px-0 py-0.5">
                    <div className="grid grid-cols-5 text-xs font-bold text-black">
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        KHIỂN TRÁCH
                      </div>
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        CẢNH CÁO
                      </div>
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        ĐIỂM TRỪ
                      </div>
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        ĐIỂM CỘNG
                      </div>
                      <div className="px-0.5 py-0.5">TỔNG</div>
                    </div>
                  </th>
                  <th className="border border-gray-300 px-0 py-0.5">
                    <div className="grid grid-cols-5 text-xs font-bold text-black">
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        KHIỂN TRÁCH
                      </div>
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        CẢNH CÁO
                      </div>
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        ĐIỂM TRỪ
                      </div>
                      <div className="border-r border-gray-300 px-0.5 py-0.5">
                        ĐIỂM CỘNG
                      </div>
                      <div className="px-0.5 py-0.5">TỔNG</div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.match_history?.map((round, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-1 py-0.5 text-center font-medium text-gray-800 text-xs">
                      {round.round} {round.round_type === "extra" && "(Phụ)"}
                    </td>
                    <td className="border border-gray-300 px-0 py-0.5">
                      <div className="grid grid-cols-5 text-center text-xs">
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.red.remind}
                        </div>
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.red.warn}
                        </div>
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.red.mins}
                        </div>
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.red.incr}
                        </div>
                        <div className="px-0.5 py-0.5 font-bold text-red-600">
                          {round.red.score}
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-0 py-0.5">
                      <div className="grid grid-cols-5 text-center text-xs">
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.blue.remind}
                        </div>
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.blue.warn}
                        </div>
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.blue.mins}
                        </div>
                        <div className="border-r border-gray-300 px-0.5 py-0.5 font-medium text-gray-700">
                          {round.blue.incr}
                        </div>
                        <div className="px-0.5 py-0.5 font-bold text-blue-600">
                          {round.blue.score}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông tin trọng tài */}
        <div className="mb-1">
          <h3
            className="font-bold text-gray-800 mb-1 text-left"
            style={{ fontSize: "11px" }}
          >
            BAN TRỌNG TÀI
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Giám định
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Họ tên
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Đơn vị
                  </th>
                  <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-gray-800 text-xs">
                    Quốc gia
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.referrees?.map((referee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-1 py-0.5 text-xs text-gray-700">
                      Giám định {referee.referrer}
                    </td>
                    <td className="border border-gray-300 px-1 py-0.5 text-xs font-medium text-gray-800">
                      {referee.name}
                    </td>
                    <td className="border border-gray-300 px-1 py-0.5 text-xs text-gray-600">
                      {referee.unit}
                    </td>
                    <td className="border border-gray-300 px-1 py-0.5 text-xs text-gray-600">
                      {referee.country}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-1 mt-1">
          {/* Thông tin vận động viên thắng */}
          {data.winner && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <h4 className="font-bold text-gray-800 mb-2">
                  VẬN ĐỘNG VIÊN THẮNG CUỘC
                </h4>
                <div
                  className={`inline-block px-4 py-2 rounded-lg font-bold text-black`}
                  // data.winner === "red" ? "bg-red-500" : "bg-blue-500"
                >
                  {data.winner === "red" ? data.red.name : data.blue.name}
                  <span className="text-sm font-normal ml-2">
                    ({data.winner === "red" ? "Giáp Đỏ" : "Giáp Xanh"})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <p className="font-semibold mb-4">BAN GIÁM KHẢO</p>
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-xs text-gray-600">Ký tên và đóng dấu</p>
            </div>
            <div className="text-center">
              <p className="font-semibold mb-4">TRỌNG TÀI CHÍNH</p>
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-xs text-gray-600">Ký tên</p>
            </div>
            <div className="text-center">
              <p className="font-semibold mb-4">VẬN ĐỘNG VIÊN THẮNG</p>
              <div className="h-16 border-b border-gray-400 mb-2"></div>
              <p className="text-xs text-gray-600">Ký tên xác nhận</p>
              {data.winner && (
                <p className="text-xs text-gray-500 mt-1">
                  {data.winner === "red" ? data.red.name : data.blue.name}
                </p>
              )}
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-gray-500">
            <p>Báo cáo được tạo tự động bởi hệ thống chấm điểm Vovinam</p>
            <p>Thời gian in: {new Date().toLocaleString("vi-VN")}</p>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="mt-4 text-center print:hidden flex gap-3 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại
        </button>
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Tải PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          In báo cáo
        </button>
      </div>
    </>
  );
};

export default DoiKhangResultReport;
