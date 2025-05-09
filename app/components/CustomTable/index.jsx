import React, { useState } from "react";
import Button from "../Button";

const CustomTable = ({
  columns = [],
  data = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange = (newPage) => {},
  onRowDoubleClick = (row) => {},
}) => {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);

  const handleRowClick = (idx) => {
    setFocusedRowIndex(idx);
  };

  const getAlignmentClass = (align) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary text-white">
            <tr>
              {visibleColumns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${getAlignmentClass(col.align)}`}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length} className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="p-6 text-center text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`cursor-pointer hover:bg-gray-100 ${focusedRowIndex === idx ? "bg-blue-100" : ""}`}
                  onClick={() => handleRowClick(idx)}
                  onDoubleClick={() => onRowDoubleClick(row)}
                >
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={`px-4 py-2 text-sm text-gray-700 ${getAlignmentClass(col.align)}`} style={{ minWidth: col.width || 100 }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 text-sm text-gray-700">
        <span>
          Trang {page} / {totalPages}
        </span>
        <div className="space-x-2">
          <Button variant="primary" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="!px-3 !py-1">
            Trước
          </Button>
          <Button variant="primary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="!px-3 !py-1">
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomTable;
