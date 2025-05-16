import React, { useState } from "react";
import Button from "../Button";

const CustomTable = ({
  columns = [],
  columnGroups = null,
  data = [],
  loading = false,
  page = 1,
  totalPages = 1,
  contentHeader = null,
  onPageChange = (newPage) => {},
  onRowDoubleClick = (row) => {},
}) => {
  const visibleColumns = columnGroups ? columnGroups.flatMap((group) => group.children).filter((col) => !col.hidden) : columns.filter((col) => !col.hidden);
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
      {/* Hiển thị content nếu có */}
      {contentHeader && <div className="px-4 py-3 border-b bg-primary text-sm text-white font-semibold text-center">{contentHeader}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary text-white">
            {columnGroups ? (
              <>
                <tr>
                  {columnGroups.map((group, idx) => (
                    <th key={`group-${idx}`} colSpan={group.colSpan} className="px-4 py-3 text-sm font-semibold text-center border-r last:border-none">
                      {group.title}
                    </th>
                  ))}
                </tr>
                <tr>
                  {columnGroups.map((group) =>
                    group.children
                      .filter((col) => !col.hidden)
                      .map((col) => (
                        <th key={col.key} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ""}`}>
                          {col.title}
                        </th>
                      ))
                  )}
                </tr>
              </>
            ) : (
              <tr>
                {visibleColumns.map((col) => (
                  <th key={col.key} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ""}`}>
                    {col.title}
                  </th>
                ))}
              </tr>
            )}
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
                    <td
                      key={col.key}
                      className={`px-4 py-2 text-sm text-gray-700 ${getAlignmentClass(col.align)} ${col.className || ""}`}
                      style={{ minWidth: col.width || 100 }}
                    >
                      {col.render ? col.render(row) : col.key === "order" ? row[col.key] ?? idx + 1 : row[col.key]}
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
