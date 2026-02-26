import React from "react";

const TableSelection = ({
  availableTables,
  selectedTables,
  handleTableToggle,
}) => {
  const handleSelectAll = () => {
    availableTables.forEach((table) => handleTableToggle(table.name, true));
  };

  const handleDeselectAll = () => {
    availableTables.forEach((table) => handleTableToggle(table.name, false));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Chọn bảng dữ liệu muốn đồng bộ
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/60"
          >
            Chọn tất cả
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {availableTables.map((table) => (
          <label
            key={table.name}
            className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition ${
              selectedTables.includes(table.name)
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedTables.includes(table.name)}
              onChange={(e) => handleTableToggle(table.name, e.target.checked)}
              className="w-4 h-4"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-800 dark:text-white text-sm">
                {table.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {table.count}
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedTables.length > 0 && (
        <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
          Đã chọn <strong>{selectedTables.length}</strong> bảng
        </div>
      )}
    </div>
  );
};

export default TableSelection;

