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
  rounded = "rounded-xl",
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
    <div className={`border border-gray-300 overflow-hidden select-none ${rounded}`}>
      {/* Hiển thị content nếu có */}
      {contentHeader && <div className="px-4 py-3 border-b bg-primary text-sm text-white font-semibold text-center">{contentHeader}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {columnGroups ? (
              <>
                <tr>
                  {columnGroups.map((group, idx) => (
                    <th key={`group-${idx}`} colSpan={group.colSpan} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      {group.title}
                    </th>
                  ))}
                </tr>
                <tr>
                  {columnGroups.map((group) =>
                    group.children
                      .filter((col) => !col.hidden)
                      .map((col) => (
                        <th key={col.key} className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ""}`}>
                          {col.title}
                        </th>
                      ))
                  )}
                </tr>
              </>
            ) : (
              <tr>
                {visibleColumns.map((col) => (
                  <th key={col.key} className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${getAlignmentClass(col.align)} ${col.className || ""}`}>
                    {col.title}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-3 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-3 text-center">
                  <div className="py-12 bg-gray-50">
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
                    <p className="mt-2 text-sm text-gray-600">Không có dữ liệu</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`cursor-pointer hover:bg-gray-50 ${focusedRowIndex === idx ? "bg-blue-100" : ""}`}
                  onClick={() => handleRowClick(idx)}
                  onDoubleClick={() => onRowDoubleClick(row)}
                >
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${getAlignmentClass(col.align)} ${col.className || ""}`}
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
      {page ? (
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700">
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
      ) : (
        <React.Fragment />
      )}
    </div>
  );
};

export default CustomTable;
