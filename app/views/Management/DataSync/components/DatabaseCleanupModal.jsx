import React from "react";

const DatabaseCleanupModal = ({
  show,
  allDatabaseTables,
  selectedTablesToDelete,
  loadingCleanup,
  handleTableDeleteToggle,
  handleDeleteTables,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý bảng dữ liệu</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">✕</button>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold"> CẢNH BÁO</p>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
            Chỉ xóa các bảng bạn chắc chắn không cần thiết. Các bảng quan trọng của hệ thống sẽ không thể xóa.
          </p>
        </div>

        {loadingCleanup ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Đang tải danh sách bảng...</div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Tổng số bảng: <strong>{allDatabaseTables.length}</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Bảng quan trọng (không thể xóa): <strong>{allDatabaseTables.filter((t) => t.isSyncable).length}</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Bảng có thể xóa: <strong>{allDatabaseTables.filter((t) => !t.isSyncable).length}</strong>
              </p>
              <p className="text-blue-600 dark:text-blue-400 mb-2">
                Đã chọn: <strong>{selectedTablesToDelete.length}</strong> bảng
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="p-2 text-left w-12"></th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Tên bảng</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Mô tả</th>
                    <th className="p-2 text-left text-gray-700 dark:text-gray-300">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {allDatabaseTables.map((table) => (
                    <tr
                      key={table.name}
                      className={`border-t border-gray-200 dark:border-gray-700 ${table.isSyncable ? "bg-green-50 dark:bg-green-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      <td className="p-2">
                        {table.isSyncable ? (
                          <span className="text-green-600 dark:text-green-400 text-xl">🔒</span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={selectedTablesToDelete.includes(table.name)}
                            onChange={() => handleTableDeleteToggle(table.name)}
                            className="w-4 h-4"
                          />
                        )}
                      </td>
                      <td className="p-2 text-gray-800 dark:text-white font-mono">{table.name}</td>
                      <td className="p-2 text-gray-600 dark:text-gray-400">{table.label}</td>
                      <td className="p-2">
                        {table.isSyncable ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">Quan trọng</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-xs">Có thể xóa</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded">
                Hủy
              </button>
              <button
                onClick={handleDeleteTables}
                disabled={selectedTablesToDelete.length === 0 || loadingCleanup}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded font-semibold"
              >
                {loadingCleanup ? "Đang xóa..." : `Xóa ${selectedTablesToDelete.length}bảng`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseCleanupModal;

