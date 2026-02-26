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
            // Thực hiện kiểm tra dữ liệu:
            console.log('table, data, strategy: ', table, data, strategy);
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

    /**
     * POST /api/sync/import-staging
     * Nhận dữ liệu gửi đến và lưu vào bảng staging (không import trực tiếp)
     * Body: { table, data, session_id, source_ip, meta }
     */
    async importToStaging(req, res) {
        try {
            const { table, data, session_id, source_ip, meta, partial_rows } = req.body;

            if (!table || !data || !session_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu tham số table, data hoặc session_id'
                });
            }

            const clientIP = source_ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

            // thực hiện 
            let result;
            if (partial_rows) {
                console.log('---------------- Cập nhật từng dòng dữ liệu ----------------')
                result = await SyncService.saveToStaging(table, data, clientIP, session_id, meta, true);
            } else {
                console.log('---------------- Import toàn bộ dữ liệu ----------------')
                result = await SyncService.saveToStaging(table, data, clientIP, session_id, meta);
            }

            // Emit socket event để notify client có dữ liệu staging mới
            const io = req.app.get('io');
            if (io) {
                io.emit('STAGING_DATA_RECEIVED', {
                    status: 200,
                    message: 'Có dữ liệu mới trong staging',
                    data: {
                        session_id,
                        table,
                        count: result.saved,
                        source_ip: clientIP
                    }
                });
            }

            return res.json({
                success: true,
                message: `Đã lưu ${result.saved} records vào staging`,
                data: result
            });
        }catch (error) {
            console.log('Error importToStaging:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lưu vào staging',
                error: error.message
            });
        }
    }

    /**
     * GET /api/sync/staging/sessions
     * Lấy danh sách các phiên đồng bộ đang chờ
     */
    async getStagingSessions(req, res) {
        try {
            const result = await SyncService.getStagingSessions();
            return res.json({
                success: true,
                message: 'Lấy danh sách sessions thành công',
                data: result
            });
        } catch (error) {
            console.error('Error getStagingSessions:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách sessions',
                error: error.message
            });
        }
    }

    /**
     * GET /api/sync/staging/:sessionId
     * Lấy dữ liệu staging của một session
     * Query params: table (optional)
     */
    async getStagingData(req, res) {
        try {
            const { sessionId }= req.params;
            const { table }= req.query;

            const result = await SyncService.getStagingData(sessionId, table || null);
            return res.json({
                success: true,
                message: 'Lấy dữ liệu staging thành công',
                data: result
            });
        } catch (error) {
            console.error('Error getStagingData:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy dữ liệu staging',
                error: error.message
            });
        }
    }

    /**
     * PUT /api/sync/staging/:stagingId/mapping
     * Cập nhật mapping cho một staging record
     * Body: { mapping_to_id, action }
     */
    async updateStagingMapping(req, res) {
        try {
            const { stagingId } = req.params;
            const { mapping_to_id, action } = req.body;

            if (!action) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu tham số action (insert/update/skip)'
                });
            }

            const result = await SyncService.updateStagingMapping(parseInt(stagingId), mapping_to_id, action);
            return res.json({
                success: true,
                message: 'Cập nhật mapping thành công',
                data: result
            });
        } catch (error) {
            console.error('Error updateStagingMapping:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật mapping',
                error: error.message
            });
        }
    }

    /**
     * POST /api/sync/staging/:sessionId/apply
     * Apply changes từ staging vào database thực
     */
    async applyStagingChanges(req, res) {
        try {
            const { sessionId } = req.params;
            const result = await SyncService.applyStagingChanges(sessionId);

            return res.json({
                success: true,
                message: `Đã áp dụng: ${result.inserted} thêm mới, ${result.updated} cập nhật, ${result.skipped}bỏ qua`,
                data: result
            });
        } catch (error) {
            console.error('Error applyStagingChanges:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi áp dụng dữ liệu',
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/sync/staging/:sessionId
     * Xóa staging session
     */
    async deleteStagingSession(req, res) {
        try {
            const { sessionId } = req.params;
            const result = await SyncService.deleteStagingSession(sessionId);
            return res.json({
                success: true,
                message: 'Đã xóa session staging',
                data: result
            });
        } catch (error) {
            console.error('Error deleteStagingSession:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa session',
                error: error.message
            });
        }
    }
}

module.exports = new SyncController();

