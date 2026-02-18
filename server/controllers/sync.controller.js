const SyncService = require('../services/sync');

class SyncController {
    
    /**
     * GET /api/sync/export
     * Export dữ liệu từ các bảng được chọn
     * Query params: tables (comma-separated list)
     */
    async exportData(req, res) {
        try {
            const { tables } = req.query;
            
            if (!tables) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu tham số tables'
                });
            }
            
            const tableList = tables.split(',').map(t => t.trim());
            const result = await SyncService.exportData(tableList);
            
            return res.json({
                success: true,
                message: 'Export dữ liệu thành công',
                data: result
            });
        } catch (error) {
            console.error('Error exportData:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi export dữ liệu',
                error: error.message
            });
        }
    }
    
    /**
     * POST /api/sync/import
     * Import dữ liệu vào database
     * Body: { table, data, strategy }
     */
    async importData(req, res) {
        try {
            const { table, data, strategy } = req.body;
            
            if (!table || !data) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu tham số table hoặc data'
                });
            }
            
            const result = await SyncService.importData(table, data, strategy || 'overwrite');
            
            return res.json({
                success: true,
                message: 'Import dữ liệu thành công',
                data: result
            });
        } catch (error) {
            console.error('Error importData:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi import dữ liệu',
                error: error.message
            });
        }
    }
    
    /**
     * GET /api/sync/metadata
     * Lấy metadata của các bảng (số lượng records, size, etc.)
     * Query params: tables (comma-separated list, optional - nếu không truyền sẽ lấy tất cả)
     */
    async getMetadata(req, res) {
        try {
            const { tables } = req.query;
            const tableList = tables ? tables.split(',').map(t => t.trim()) : null;
            const result = await SyncService.getMetadata(tableList);

            return res.json({
                success: true,
                message: 'Lấy metadata thành công',
                data: result
            });
        } catch (error) {
            console.error('Error getMetadata:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy metadata',
                error: error.message
            });
        }
    }
    
    /**
     * GET /api/sync/tables
     * Lấy danh sách các bảng có thể đồng bộ
     */
    async getTables(req, res) {
        try {
            const result = await SyncService.getAvailableTables();

            return res.json({
                success: true,
                message: 'Lấy danh sách bảng thành công',
                data: result
            });
        } catch (error) {
            console.error('Error getTables:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách bảng',
                error: error.message
            });
        }
    }

    /**
     * GET /api/sync/records/:tableName
     * Lấy tất cả records của một bảng
     * Query params: limit, offset
     */
    async getTableRecords(req, res) {
        try {
            const { tableName } = req.params;
            const limit = parseInt(req.query.limit) || 1000;
            const offset = parseInt(req.query.offset) || 0;

            const result = await SyncService.getTableRecords(tableName, limit, offset);

            return res.json({
                success: true,
                message: 'Lấy records thành công',
                data: result
            });
        } catch (error) {
            console.error('Error getTableRecords:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy records',
                error: error.message
            });
        }
    }

    /**
     * GET /api/sync/all-tables
     * Lấy tất cả các bảng trong database
     */
    async getAllTables(req, res) {
        try {
            const result = await SyncService.getAllDatabaseTables();

            return res.json({
                success: true,
                message: 'Lấy danh sách bảng thành công',
                data: result
            });
        } catch (error) {
            console.error('Error getAllTables:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách bảng',
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/sync/table/:tableName
     * Xóa một bảng khỏi database
     */
    async deleteTable(req, res) {
        try {
            const { tableName } = req.params;
            const result = await SyncService.dropTable(tableName);

            return res.json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            console.error('Error deleteTable:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa bảng',
                error: error.message
            });
        }
    }

    /**
     * POST /api/sync/delete-tables
     * Xóa nhiều bảng cùng lúc
     * Body: { tables: ['table1', 'table2'] }
     */
    async deleteTables(req, res) {
        try {
            const { tables } = req.body;

            if (!tables || !Array.isArray(tables) || tables.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp danh sách bảng cần xóa'
                });
            }

            const result = await SyncService.dropMultipleTables(tables);

            return res.json({
                success: true,
                message: `Đã xóa ${result.success.length}/${tables.length} bảng`,
                data: result
            });
        } catch (error) {
            console.error('Error deleteTables:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa bảng',
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/sync/record/:tableName/:recordId
     * Xóa một record khỏi bảng
     */
    async deleteRecord(req, res) {
        try {
            const { tableName, recordId } = req.params;
            const result = await SyncService.deleteRecord(tableName, parseInt(recordId));

            return res.json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            console.error('Error deleteRecord:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa record',
                error: error.message
            });
        }
    }

    /**
     * POST /api/sync/delete-records
     * Xóa nhiều records cùng lúc
     * Body: { tableName, recordIds: [1, 2, 3] }
     */
    async deleteRecords(req, res) {
        try {
            const { tableName, recordIds } = req.body;

            if (!tableName || !recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp tableName và danh sách recordIds'
                });
            }

            const result = await SyncService.deleteMultipleRecords(tableName, recordIds);

            return res.json({
                success: true,
                message: `Đã xóa ${result.success.length}/${recordIds.length} records`,
                data: result
            });
        } catch (error) {
            console.error('Error deleteRecords:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa records',
                error: error.message
            });
        }
    }
}

module.exports = new SyncController();

