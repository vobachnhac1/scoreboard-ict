import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";

// Template configurations
const TEMPLATE_CONFIGS = {
  DOIKHANG: {
    name: "Đối Kháng",
    type: "DOIKHANG",
    pageSize: "A5",
    orientation: "portrait",
    sections: [
      { id: "header", name: "Header", required: true, editable: true },
      { id: "info", name: "Thông tin thi", required: true, editable: true },
      { id: "results", name: "Kết quả", required: true, editable: false },
      {
        id: "judges",
        name: "Thông tin giám định",
        required: false,
        editable: true,
      },
      {
        id: "athletes",
        name: "Thông tin VĐV",
        required: true,
        editable: false,
      },
    ],
    fields: {
      header: ["title"],
      info: ["competition_name", "date", "content", "unit"],
      results: ["judge_scores", "total_score"],
      judges: ["judge_list"],
      athletes: ["athlete_list"],
    },
  },
  QUYEN: {
    name: "Quyền",
    type: "QUYEN",
    pageSize: "A5",
    orientation: "portrait",
    sections: [
      { id: "header", name: "Header", required: true, editable: true },
      { id: "info", name: "Thông tin thi", required: true, editable: true },
      { id: "results", name: "Kết quả", required: true, editable: false },
      {
        id: "judges",
        name: "Thông tin giám định",
        required: false,
        editable: true,
      },
      {
        id: "athletes",
        name: "Thông tin VĐV",
        required: true,
        editable: false,
      },
    ],
    fields: {
      header: ["title"],
      info: ["competition_name", "date", "content", "unit"],
      results: ["judge_scores", "total_score"],
      judges: ["judge_list"],
      athletes: ["athlete_list"],
    },
  },
};

export default function TemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState("DOIKHANG");
  const [templateData, setTemplateData] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const printRef = useRef();

  const currentTemplate = TEMPLATE_CONFIGS[selectedTemplate];

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Template_${currentTemplate.name}`,
    pageStyle: `
      @page {
        size: ${currentTemplate.pageSize} ${currentTemplate.orientation};
        margin: 15mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      let templateExcelData = [];

      if (selectedTemplate === "DOIKHANG") {
        templateExcelData = generateDoiKhangExcelData();
      } else if (selectedTemplate === "QUYEN") {
        templateExcelData = generateQuyenExcelData();
      }

      const ws = XLSX.utils.aoa_to_sheet(templateExcelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 8 },
        { wch: 8 },
        { wch: 20 },
        { wch: 8 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, currentTemplate.name);

      const fileName = `Template_${currentTemplate.name}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
    }
  };

  const generateDoiKhangExcelData = () => {
    return [
      ["BIÊN BẢN NỘI DUNG DỰ THI"],
      [],
      ["TÊN GIAI", templateData.competition_name || "", "", "", ""],
      [
        "NGÀY THI",
        templateData.date || new Date().toLocaleDateString("vi-VN"),
        "",
        "",
        "",
      ],
      ["NỘI DUNG THI", templateData.content || "", "", "", ""],
      ["ĐƠN VỊ", templateData.unit || "", "", "", ""],
      [],
      ["", "", "KẾT QUẢ NỘI DUNG DỰ THI", "", ""],
      ["GIÁM ĐỊNH", "1", "2", "3", "4", "5"],
      [
        "ĐIỂM",
        templateData.score1 || "",
        templateData.score2 || "",
        templateData.score3 || "",
        templateData.score4 || "",
        templateData.score5 || "",
      ],
      ["TỔNG", "", "", templateData.total_score || "255", "", ""],
      [],
      ["", "", "THÔNG TIN GIÁM ĐỊNH", "", ""],
      ["GIÁM", "", "HỌ TÊN", "", "ĐƠN VỊ"],
      ...Array.from({ length: 6 }, (_, i) => [
        i + 1,
        "",
        templateData[`judge_${i + 1}_name`] || "",
        "",
        templateData[`judge_${i + 1}_unit`] || "",
      ]),
      [],
      ["", "", "THÔNG TIN VĐV", "", ""],
      ["VĐV", "", "HỌ TÊN", "", "ĐƠN VỊ"],
      ...Array.from({ length: 14 }, (_, i) => [
        i + 1,
        "",
        templateData[`athlete_${i + 1}_name`] || "",
        "",
        templateData[`athlete_${i + 1}_unit`] || "",
      ]),
    ];
  };

  const generateQuyenExcelData = () => {
    return [
      ["BIÊN BẢN NỘI DUNG DỰ THI - QUYỀN"],
      [],
      ["TÊN GIAI", templateData.competition_name || "", "", "", ""],
      [
        "NGÀY THI",
        templateData.date || new Date().toLocaleDateString("vi-VN"),
        "",
        "",
        "",
      ],
      ["NỘI DUNG THI", templateData.content || "QUYỀN", "", "", ""],
      ["ĐƠN VỊ", templateData.unit || "", "", "", ""],
      [],
      ["", "", "KẾT QUẢ NỘI DUNG DỰ THI", "", ""],
      ["GIÁM ĐỊNH", "1", "2", "3", "4", "5"],
      [
        "ĐIỂM",
        templateData.score1 || "",
        templateData.score2 || "",
        templateData.score3 || "",
        templateData.score4 || "",
        templateData.score5 || "",
      ],
      ["TỔNG", "", "", templateData.total_score || "", "", ""],
      [],
      ["", "", "THÔNG TIN GIÁM ĐỊNH", "", ""],
      ["GIÁM", "", "HỌ TÊN", "", "ĐƠN VỊ"],
      ...Array.from({ length: 6 }, (_, i) => [
        i + 1,
        "",
        templateData[`judge_${i + 1}_name`] || "",
        "",
        templateData[`judge_${i + 1}_unit`] || "",
      ]),
      [],
      ["", "", "THÔNG TIN VĐV", "", ""],
      ["VĐV", "", "HỌ TÊN", "", "ĐƠN VỊ"],
      ...Array.from({ length: 14 }, (_, i) => [
        i + 1,
        "",
        templateData[`athlete_${i + 1}_name`] || "",
        "",
        templateData[`athlete_${i + 1}_unit`] || "",
      ]),
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quản lý Template
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tạo và tùy chỉnh template báo cáo một cách linh động
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowLayoutEditor(true)}
              >
                Chỉnh sửa bố cục
              </Button>
              <Button variant="secondary" onClick={() => setShowPreview(true)}>
                Xem trước
              </Button>
              <Button variant="primary" onClick={exportToExcel}>
                Xuất Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Template Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Chọn Template
              </h3>
              <div className="space-y-3">
                {Object.entries(TEMPLATE_CONFIGS).map(([key, config]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate === key
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {config.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {config.pageSize} - {config.orientation}
                        </p>
                      </div>
                      {selectedTemplate === key && (
                        <div className="w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Info */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Thông tin Template
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tên:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {currentTemplate.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Khổ giấy:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {currentTemplate.pageSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Hướng:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {currentTemplate.orientation === "portrait"
                        ? "Dọc"
                        : "Ngang"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Sections:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {currentTemplate.sections.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Data Input */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nhập dữ liệu Template
              </h3>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tên giải
                    </label>
                    <input
                      type="text"
                      value={templateData.competition_name || ""}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          competition_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Nhập tên giải đấu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ngày thi
                    </label>
                    <input
                      type="date"
                      value={templateData.date || ""}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nội dung thi
                    </label>
                    <input
                      type="text"
                      value={templateData.content || ""}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          content: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder={
                        selectedTemplate === "QUYEN" ? "QUYỀN" : "ĐỐI KHÁNG"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      value={templateData.unit || ""}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          unit: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Nhập đơn vị tổ chức"
                    />
                  </div>
                </div>

                {/* Scores */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                    Điểm số giám định
                  </h4>
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Giám định {i}
                        </label>
                        <input
                          type="number"
                          value={templateData[`score${i}`] || ""}
                          onChange={(e) =>
                            setTemplateData({
                              ...templateData,
                              [`score${i}`]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <TemplatePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          template={currentTemplate}
          data={templateData}
          printRef={printRef}
          onPrint={handlePrint}
        />

        <LayoutEditorModal
          isOpen={showLayoutEditor}
          onClose={() => setShowLayoutEditor(false)}
          template={currentTemplate}
          onSave={(updatedTemplate) => {
            // Update template configuration
            TEMPLATE_CONFIGS[selectedTemplate] = updatedTemplate;
            setShowLayoutEditor(false);
          }}
        />
      </div>
    </div>
  );
}

// Template Preview Modal
function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  data,
  printRef,
  onPrint,
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem trước Template"
      size="full"
    >
      <div className="space-y-4">
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={onPrint}>
            In Template
          </Button>
        </div>

        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div
            ref={printRef}
            className="bg-white p-8"
            style={{ fontSize: "12px" }}
          >
            {template.type === "DOIKHANG" ? (
              <DoiKhangTemplate data={data} />
            ) : template.type === "QUYEN" ? (
              <QuyenTemplate data={data} />
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Layout Editor Modal
function LayoutEditorModal({ isOpen, onClose, template, onSave }) {
  const [editingTemplate, setEditingTemplate] = useState(template);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa bố cục Template"
      size="large"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Template
            </label>
            <input
              type="text"
              value={editingTemplate.name}
              onChange={(e) =>
                setEditingTemplate({ ...editingTemplate, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Khổ giấy
            </label>
            <select
              value={editingTemplate.pageSize}
              onChange={(e) =>
                setEditingTemplate({
                  ...editingTemplate,
                  pageSize: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hướng trang
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="portrait"
                checked={editingTemplate.orientation === "portrait"}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    orientation: e.target.value,
                  })
                }
                className="w-4 h-4 text-blue-600 dark:text-blue-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Dọc</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="landscape"
                checked={editingTemplate.orientation === "landscape"}
                onChange={(e) =>
                  setEditingTemplate({
                    ...editingTemplate,
                    orientation: e.target.value,
                  })
                }
                className="w-4 h-4 text-blue-600 dark:text-blue-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Ngang
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => onSave(editingTemplate)}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Đối Kháng Template Component
function DoiKhangTemplate({ data }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-2">
        <h1 className="text-lg font-bold">BIÊN BẢN NỘI DUNG DỰ THI</h1>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex">
            <span className="font-semibold w-20">TÊN GIAI:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.competition_name || ""}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-20">NGÀY THI:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.date || ""}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex">
            <span className="font-semibold w-24">NỘI DUNG THI:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.content || "ĐỐI KHÁNG"}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">ĐƠN VỊ:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.unit || ""}
            </span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-6">
        <div className="text-center font-bold mb-2">
          KẾT QUẢ NỘI DUNG DỰ THI
        </div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-yellow-200">
              <th className="border border-gray-800 px-2 py-1">GIÁM ĐỊNH</th>
              <th className="border border-gray-800 px-2 py-1">1</th>
              <th className="border border-gray-800 px-2 py-1">2</th>
              <th className="border border-gray-800 px-2 py-1">3</th>
              <th className="border border-gray-800 px-2 py-1">4</th>
              <th className="border border-gray-800 px-2 py-1">5</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-1 font-semibold">
                ĐIỂM
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score1 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score2 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score3 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score4 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score5 || ""}
              </td>
            </tr>
            <tr className="bg-yellow-200">
              <td className="border border-gray-800 px-2 py-1 font-bold">
                TỔNG
              </td>
              <td className="border border-gray-800 px-2 py-1"></td>
              <td className="border border-gray-800 px-2 py-1"></td>
              <td className="border border-gray-800 px-2 py-1 text-center font-bold">
                {data.total_score || "255"}
              </td>
              <td className="border border-gray-800 px-2 py-1"></td>
              <td className="border border-gray-800 px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Judges Info */}
      <div className="mt-6">
        <div className="text-center font-bold mb-2">THÔNG TIN GIÁM ĐỊNH</div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr>
              <th className="border border-gray-800 px-2 py-1 w-16">GIÁM</th>
              <th className="border border-gray-800 px-2 py-1">HỌ TÊN</th>
              <th className="border border-gray-800 px-2 py-1">ĐƠN VỊ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, i) => (
              <tr key={i}>
                <td className="border border-gray-800 px-2 py-1 text-center">
                  {i + 1}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`judge_${i + 1}_name`] || ""}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`judge_${i + 1}_unit`] || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Athletes Info */}
      <div className="mt-6">
        <div className="text-center font-bold mb-2">THÔNG TIN VĐV</div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr>
              <th className="border border-gray-800 px-2 py-1 w-16">VĐV</th>
              <th className="border border-gray-800 px-2 py-1">HỌ TÊN</th>
              <th className="border border-gray-800 px-2 py-1">ĐƠN VỊ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 14 }, (_, i) => (
              <tr key={i}>
                <td className="border border-gray-800 px-2 py-1 text-center">
                  {i + 1}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`athlete_${i + 1}_name`] || ""}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`athlete_${i + 1}_unit`] || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Quyền Template Component (similar structure but for Quyền)
function QuyenTemplate({ data }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-2">
        <h1 className="text-lg font-bold">BIÊN BẢN NỘI DUNG DỰ THI - QUYỀN</h1>
      </div>

      {/* Same structure as DoiKhangTemplate but with Quyền-specific content */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex">
            <span className="font-semibold w-20">TÊN GIAI:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.competition_name || ""}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-20">NGÀY THI:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.date || ""}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex">
            <span className="font-semibold w-24">NỘI DUNG THI:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.content || "QUYỀN"}
            </span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">ĐƠN VỊ:</span>
            <span className="border-b border-gray-400 flex-1 px-2">
              {data.unit || ""}
            </span>
          </div>
        </div>
      </div>

      {/* Results Section - Same as DoiKhang */}
      <div className="mt-6">
        <div className="text-center font-bold mb-2">
          KẾT QUẢ NỘI DUNG DỰ THI
        </div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr className="bg-yellow-200">
              <th className="border border-gray-800 px-2 py-1">GIÁM ĐỊNH</th>
              <th className="border border-gray-800 px-2 py-1">1</th>
              <th className="border border-gray-800 px-2 py-1">2</th>
              <th className="border border-gray-800 px-2 py-1">3</th>
              <th className="border border-gray-800 px-2 py-1">4</th>
              <th className="border border-gray-800 px-2 py-1">5</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-1 font-semibold">
                ĐIỂM
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score1 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score2 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score3 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score4 || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {data.score5 || ""}
              </td>
            </tr>
            <tr className="bg-yellow-200">
              <td className="border border-gray-800 px-2 py-1 font-bold">
                TỔNG
              </td>
              <td className="border border-gray-800 px-2 py-1"></td>
              <td className="border border-gray-800 px-2 py-1"></td>
              <td className="border border-gray-800 px-2 py-1 text-center font-bold">
                {data.total_score || ""}
              </td>
              <td className="border border-gray-800 px-2 py-1"></td>
              <td className="border border-gray-800 px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Judges and Athletes sections same as DoiKhang */}
      <div className="mt-6">
        <div className="text-center font-bold mb-2">THÔNG TIN GIÁM ĐỊNH</div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr>
              <th className="border border-gray-800 px-2 py-1 w-16">GIÁM</th>
              <th className="border border-gray-800 px-2 py-1">HỌ TÊN</th>
              <th className="border border-gray-800 px-2 py-1">ĐƠN VỊ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, i) => (
              <tr key={i}>
                <td className="border border-gray-800 px-2 py-1 text-center">
                  {i + 1}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`judge_${i + 1}_name`] || ""}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`judge_${i + 1}_unit`] || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <div className="text-center font-bold mb-2">THÔNG TIN VĐV</div>
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr>
              <th className="border border-gray-800 px-2 py-1 w-16">VĐV</th>
              <th className="border border-gray-800 px-2 py-1">HỌ TÊN</th>
              <th className="border border-gray-800 px-2 py-1">ĐƠN VỊ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 14 }, (_, i) => (
              <tr key={i}>
                <td className="border border-gray-800 px-2 py-1 text-center">
                  {i + 1}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`athlete_${i + 1}_name`] || ""}
                </td>
                <td className="border border-gray-800 px-2 py-1">
                  {data[`athlete_${i + 1}_unit`] || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
