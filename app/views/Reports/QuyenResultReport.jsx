import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";

// export default function QuyenResultReport() {
//   const [excelData, setExcelData] = useState([]);
//   const [headers, setHeaders] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [filterType, setFilterType] = useState("all");
//   const [showPreview, setShowPreview] = useState(false);
//   const printRef = useRef();

//   useEffect(() => {
//     loadDefaultExcelFile();
//   }, []);

//   // Filter data when filterType changes
//   useEffect(() => {
//     filterDataByType();
//   }, [excelData, filterType]);

//   const loadDefaultExcelFile = async () => {
//     try {
//       const response = await fetch("/exports/QUYEN_KQ.xlsx");

//       // Check if the response is successful and is actually an Excel file
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const contentType = response.headers.get("content-type");
//       if (
//         contentType &&
//         !contentType.includes(
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         ) &&
//         !contentType.includes("application/vnd.ms-excel") &&
//         !contentType.includes("application/octet-stream")
//       ) {
//         console.warn("Response content type:", contentType);
//         throw new Error("Response is not an Excel file");
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       const data = new Uint8Array(arrayBuffer);
//       const workbook = XLSX.read(data, { type: "array" });

//       // Read first sheet
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//       if (jsonData.length > 0) {
//         setHeaders(jsonData[0]);
//         setExcelData(jsonData.slice(1));
//         console.log(
//           "Successfully loaded Excel file with",
//           jsonData.length - 1,
//           "rows",
//         );
//       } else {
//         throw new Error("Excel file is empty");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải file Excel mặc định:", error);
//       console.log("Falling back to sample data...");
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
//       "Quyền",
//       "Điểm kỹ thuật",
//       "Điểm lực",
//       "Tổng điểm",
//       "Xếp hạng",
//       "Ghi chú",
//     ];

//     const sampleData = [
//       [
//         1,
//         "VDV001",
//         "Nguyễn Văn A",
//         "TP.HCM",
//         "QY",
//         "Thập Tự Quyền",
//         "8.5",
//         "8.0",
//         "16.5",
//         "1",
//         "",
//       ],
//       [
//         2,
//         "VDV002",
//         "Trần Thị B",
//         "Hà Nội",
//         "QY",
//         "Ngũ Hành Quyền",
//         "8.2",
//         "7.8",
//         "16.0",
//         "2",
//         "",
//       ],
//       [
//         3,
//         "VDV003",
//         "Lê Văn C",
//         "Đà Nẵng",
//         "QY",
//         "Bát Quái Quyền",
//         "7.9",
//         "8.2",
//         "16.1",
//         "3",
//         "",
//       ],
//       [
//         4,
//         "VDV004",
//         "Phạm Thị D",
//         "Cần Thơ",
//         "QY",
//         "Thập Tự Quyền",
//         "8.0",
//         "7.5",
//         "15.5",
//         "4",
//         "",
//       ],
//       [
//         5,
//         "VDV005",
//         "Hoàng Văn E",
//         "Hải Phòng",
//         "QY",
//         "Ngũ Hành Quyền",
//         "7.8",
//         "7.9",
//         "15.7",
//         "5",
//         "",
//       ],
//     ];

//     setHeaders(sampleHeaders);
//     setExcelData(sampleData);
//   };

//   const filterDataByType = () => {
//     if (!excelData.length) return;

//     let filtered = [...excelData];

//     if (filterType === "QY") {
//       // Filter rows where "Loại" column contains "QY"
//       filtered = excelData.filter((row) => {
//         const typeIndex = headers.findIndex((h) =>
//           h.toLowerCase().includes("loại"),
//         );
//         return typeIndex !== -1 && row[typeIndex] === "QY";
//       });
//     } else if (filterType === "results") {
//       // Filter rows with results
//       filtered = excelData.filter((row) => {
//         const rankIndex = headers.findIndex((h) =>
//           h.toLowerCase().includes("xếp hạng"),
//         );
//         return rankIndex !== -1 && row[rankIndex] && row[rankIndex] !== "";
//       });
//     }

//     setFilteredData(filtered);
//   };

//   const getStatistics = () => {
//     if (!filteredData.length) return {};

//     const rankIndex = headers.findIndex((h) =>
//       h.toLowerCase().includes("xếp hạng"),
//     );
//     const typeIndex = headers.findIndex((h) =>
//       h.toLowerCase().includes("loại"),
//     );

//     const stats = {
//       total: filteredData.length,
//       ranked: 0,
//       quyenMatches: 0,
//       otherMatches: 0,
//       avgScore: 0,
//     };

//     let totalScore = 0;
//     let scoreCount = 0;

//     filteredData.forEach((row) => {
//       if (rankIndex !== -1 && row[rankIndex]) {
//         stats.ranked++;
//       }

//       if (typeIndex !== -1) {
//         const type = row[typeIndex];
//         if (type === "QY") stats.quyenMatches++;
//         else stats.otherMatches++;
//       }

//       // Calculate average score
//       const scoreIndex = headers.findIndex((h) =>
//         h.toLowerCase().includes("tổng điểm"),
//       );
//       if (scoreIndex !== -1 && row[scoreIndex]) {
//         const score = parseFloat(row[scoreIndex]);
//         if (!isNaN(score)) {
//           totalScore += score;
//           scoreCount++;
//         }
//       }
//     });

//     if (scoreCount > 0) {
//       stats.avgScore = (totalScore / scoreCount).toFixed(2);
//     }

//     return stats;
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: "Bao_cao_ket_qua_quyen",
//     pageStyle: `
//       @page {
//         size: A4;
//         margin: 20mm;
//       }
//       @media print {
//         body { -webkit-print-color-adjust: exact; }
//       }
//     `,
//   });

//   const stats = getStatistics();

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                 Báo cáo kết quả quyền
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Xem và xuất báo cáo kết quả thi đấu quyền
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

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
//                 <svg
//                   className="w-6 h-6 text-blue-600 dark:text-blue-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                   Tổng VĐV
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {stats.total || 0}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
//                 <svg
//                   className="w-6 h-6 text-green-600 dark:text-green-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                   Đã xếp hạng
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {stats.ranked || 0}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
//                 <svg
//                   className="w-6 h-6 text-purple-600 dark:text-purple-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 10V3L4 14h7v7l9-11h-7z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                   Thi quyền
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {stats.quyenMatches || 0}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
//                 <svg
//                   className="w-6 h-6 text-orange-600 dark:text-orange-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                   Điểm TB
//                 </p>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {stats.avgScore || "0.00"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
//           <div className="flex flex-wrap gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Lọc theo loại
//               </label>
//               <select
//                 value={filterType}
//                 onChange={(e) => setFilterType(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="all">Tất cả</option>
//                 <option value="QY">Chỉ quyền (QY)</option>
//                 <option value="results">Có kết quả</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Data Table */}
//         <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Dữ liệu kết quả ({filteredData.length} bản ghi)
//             </h3>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   {headers.map((header, index) => (
//                     <th
//                       key={index}
//                       className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                     >
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {filteredData.map((row, rowIndex) => (
//                   <tr
//                     key={rowIndex}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700"
//                   >
//                     {row.map((cell, cellIndex) => (
//                       <td
//                         key={cellIndex}
//                         className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Preview Modal */}
//         {showPreview && (
//           <Modal
//             isOpen={showPreview}
//             onClose={() => setShowPreview(false)}
//             title="Xem trước báo cáo"
//             size="full"
//           >
//             <div className="space-y-4">
//               <div className="flex justify-end gap-3">
//                 <Button
//                   variant="secondary"
//                   onClick={() => setShowPreview(false)}
//                 >
//                   Đóng
//                 </Button>
//                 <Button variant="primary" onClick={handlePrint}>
//                   In báo cáo
//                 </Button>
//               </div>

//               <div className="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
//                 <div
//                   ref={printRef}
//                   className="bg-white p-8"
//                   style={{ fontSize: "12px" }}
//                 >
//                   <QuyenReportTemplate
//                     data={filteredData}
//                     headers={headers}
//                     stats={stats}
//                   />
//                 </div>
//               </div>
//             </div>
//           </Modal>
//         )}
//       </div>
//     </div>
//   );
// }

// // Quyền Report Template Component
// function QuyenReportTemplate({ data, headers, stats }) {
//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="text-center border-b-2 border-gray-800 pb-2">
//         <h1 className="text-lg font-bold">BÁO CÁO KẾT QUẢ THI ĐẤU QUYỀN</h1>
//         <p className="text-sm mt-1">
//           Ngày: {new Date().toLocaleDateString("vi-VN")}
//         </p>
//       </div>

//       {/* Statistics Summary */}
//       <div className="grid grid-cols-4 gap-4 mb-4">
//         <div className="text-center">
//           <div className="font-bold text-lg">{stats.total || 0}</div>
//           <div className="text-xs">Tổng VĐV</div>
//         </div>
//         <div className="text-center">
//           <div className="font-bold text-lg">{stats.ranked || 0}</div>
//           <div className="text-xs">Đã xếp hạng</div>
//         </div>
//         <div className="text-center">
//           <div className="font-bold text-lg">{stats.quyenMatches || 0}</div>
//           <div className="text-xs">Thi quyền</div>
//         </div>
//         <div className="text-center">
//           <div className="font-bold text-lg">{stats.avgScore || "0.00"}</div>
//           <div className="text-xs">Điểm TB</div>
//         </div>
//       </div>

//       {/* Data Table */}
//       <table className="w-full border-collapse border border-gray-800">
//         <thead>
//           <tr className="bg-gray-100">
//             {headers.map((header, index) => (
//               <th
//                 key={index}
//                 className="border border-gray-800 px-2 py-1 text-xs font-bold"
//               >
//                 {header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row, rowIndex) => (
//             <tr key={rowIndex}>
//               {row.map((cell, cellIndex) => (
//                 <td
//                   key={cellIndex}
//                   className="border border-gray-800 px-2 py-1 text-xs"
//                 >
//                   {cell}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Footer */}
//       <div className="mt-8 flex justify-between">
//         <div className="text-center">
//           <div className="border-t border-gray-800 pt-2 mt-8">
//             <div className="font-bold">BAN TỔ CHỨC</div>
//           </div>
//         </div>
//         <div className="text-center">
//           <div className="border-t border-gray-800 pt-2 mt-8">
//             <div className="font-bold">BAN GIÁM ĐỊNH</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// Màn hình xem trước trước khi in Quyền

const dataQuyen = {
  config_system: {
    ten_giai_dau: "GIẢI CÚP VÕ HIỆN ĐẠI NĂM 2026",
    ten_mon_thi: "VÕ HIỆN ĐẠI",
    so_giam_dinh: 5,
    tieu_de: "KẾT QUẢ THI QUYỀN",
  },
  ten_giai_dau: "GIẢI CÚP VÕ HIỆN ĐẠI NĂM 2026",
  ngay_thi: "17/01/2026",
  noi_dung_thi: "long Hổ Quyền",
  unit: "Đà Nẵng",
  members: [
    { no: 1, name: "Nguyễn Văn A", unit: "Đà Nẵng" },
    { no: 2, name: "Nguyễn Văn B", unit: "Đà Nẵng" },
    { no: 3, name: "Nguyễn Văn C", unit: "Đà Nẵng" },
    { no: 4, name: "Nguyễn Văn D", unit: "Đà Nẵng" },
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
  results: {
    judge1: 10,
    judge2: 9,
    judge3: 8,
    judge4: 7,
    judge5: 6,
    total: 30,
    hidden: { maxIndex: 0, minIndex: 4 },
    max: 10,
    min: 6,
  },
};
const QuyenResultReport = () => {
  const { t } = useTranslation();
  // tạo template báo cáo theo data mẫu dataQuyen
  // THÔNG TIN GIẢN ĐẤU
  // THÔNG TIN NỘI DUNG THI
  // THÔNG TIN VẬN ĐỘNG VIÊN
  // KẾT QUẢ NỘI DUNG THI
  // BAN TRỌNG TÀI

  const data = dataQuyen;
  const navigate = useNavigate();

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Bao_cao_ket_qua_quyen",
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
    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Báo cáo kết quả Quyền</title>
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
            .rounded { border-radius: 8px !important; }

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

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
      <div
        ref={printRef}
        className="w-full max-w-none mx-auto bg-white p-4 shadow-lg print:shadow-none print:p-2 print:max-w-none print:w-full print:h-full"
        style={{
          width: "210mm",
          minHeight: "297mm",
          maxWidth: "210mm",
          fontSize: "13px",
          lineHeight: "1.3",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header - Thông tin giải đấu */}
        <div className="mb-2 border-gray-300 pb-3">
          <h1
            className="font-bold text-gray-800 mb-2 text-center"
            style={{ fontSize: "16px" }}
          >
            {data.config_system.ten_giai_dau}
          </h1>
          <h2
            className="font-semibold text-gray-700 mb-3 text-center"
            style={{ fontSize: "14px" }}
          >
            {data.config_system.tieu_de}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Môn thi
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Ngày thi
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Số giám định
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1 font-medium text-gray-800 text-xs">
                    {data.config_system.ten_mon_thi}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                    {data.ngay_thi}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                    {data.config_system.so_giam_dinh}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Thông tin nội dung thi */}
        <div className="mb-3">
          <h3
            className="font-semibold text-gray-800 mb-2"
            style={{ fontSize: "14px" }}
          >
            THÔNG TIN NỘI DUNG THI
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-800 text-xs bg-gray-100 w-1/4">
                    Nội dung thi
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                    {data.noi_dung_thi}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-800 text-xs bg-gray-100">
                    Đơn vị
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                    {data.unit}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Thông tin vận động viên */}
        <div className="mb-3">
          <h3
            className="font-semibold text-gray-800 mb-2"
            style={{ fontSize: "14px" }}
          >
            THÔNG TIN VẬN ĐỘNG VIÊN
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs w-16">
                    STT
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Họ và tên
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Đơn vị
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-center text-gray-700 text-xs">
                      {member.no}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                      {member.name}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                      {member.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kết quả nội dung thi */}
        <div className="mb-3">
          <h3
            className="font-semibold text-gray-800 mb-2"
            style={{ fontSize: "14px" }}
          >
            KẾT QUẢ NỘI DUNG THI
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs">
                    Giám định 1
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs">
                    Giám định 2
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs">
                    Giám định 3
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs">
                    Giám định 4
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs">
                    Giám định 5
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs bg-yellow-100">
                    Tổng điểm
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    className={`border border-gray-300 px-2 py-1 text-center text-xs ${data.results.hidden.maxIndex === 0 ||
                      data.results.hidden.minIndex === 0
                      ? "bg-red-100 line-through text-gray-500"
                      : "text-gray-700"
                      }`}
                  >
                    {data.results.judge1}
                  </td>
                  <td
                    className={`border border-gray-300 px-2 py-1 text-center text-xs ${data.results.hidden.maxIndex === 1 ||
                      data.results.hidden.minIndex === 1
                      ? "bg-red-100 line-through text-gray-500"
                      : "text-gray-700"
                      }`}
                  >
                    {data.results.judge2}
                  </td>
                  <td
                    className={`border border-gray-300 px-2 py-1 text-center text-xs ${data.results.hidden.maxIndex === 2 ||
                      data.results.hidden.minIndex === 2
                      ? "bg-red-100 line-through text-gray-500"
                      : "text-gray-700"
                      }`}
                  >
                    {data.results.judge3}
                  </td>
                  <td
                    className={`border border-gray-300 px-2 py-1 text-center text-xs ${data.results.hidden.maxIndex === 3 ||
                      data.results.hidden.minIndex === 3
                      ? "bg-red-100 line-through text-gray-500"
                      : "text-gray-700"
                      }`}
                  >
                    {data.results.judge4}
                  </td>
                  <td
                    className={`border border-gray-300 px-2 py-1 text-center text-xs ${data.results.hidden.maxIndex === 4 ||
                      data.results.hidden.minIndex === 4
                      ? "bg-red-100 line-through text-gray-500"
                      : "text-gray-700"
                      }`}
                  >
                    {data.results.judge5}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center font-bold text-gray-800 text-xs bg-yellow-100">
                    {data.results.total}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td
                    colSpan="5"
                    className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-800 text-xs"
                  >
                    Điểm cao nhất / Điểm thấp nhất:
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center text-gray-700 text-xs">
                    {data.results.max} / {data.results.min}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-600 mt-1 italic">
              * Điểm gạch ngang là điểm cao nhất và thấp nhất bị loại
            </p>
          </div>
        </div>

        {/* Ban trọng tài */}
        <div className="mb-3">
          <h3
            className="font-semibold text-gray-800 mb-2"
            style={{ fontSize: "14px" }}
          >
            BAN TRỌNG TÀI
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-center font-semibold text-gray-800 text-xs w-20">
                    Giám định
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Họ và tên
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Đơn vị
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-800 text-xs">
                    Quốc gia
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.referrees.map((referee, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 text-center text-gray-700 text-xs">
                      {referee.referrer}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                      {referee.name}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                      {referee.unit}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-gray-700 text-xs">
                      {referee.country}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-4">
          {/* Thông tin vận động viên thắng */}
          {data.winner && (
            <div className="mb-6 bg-gray-50 p-4 rounded">
              <div className="text-center">
                <h4 className="font-bold text-gray-800 mb-2">
                  VẬN ĐỘNG VIÊN THẮNG CUỘC
                </h4>
                <div
                  className={`inline-block px-4 py-2 rounded font-bold text-black`}
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

          <div className="grid grid-cols-2 gap-6 text-sm">
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
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
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
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
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
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
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

export default QuyenResultReport;
