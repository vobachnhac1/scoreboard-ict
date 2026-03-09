const SyncService = require('../services/sync');
const { DB_SCHEME } = require('../services/common/constant_sql');
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');
const GoogleDriveService = require('../services/google-drive');
const FtpService = require('../services/ftp');
const { getUUID } = require('../config/config');
const electron = require('electron'); // Import electron for relaunching

class SyncController {
    constructor() {
        // Bind all methods to ensure 'this' context is preserved in route handlers
        this.restartApp = this.restartApp.bind(this);
        this.exportData = this.exportData.bind(this);
        this.getTables = this.getTables.bind(this);
        this.getAllTables = this.getAllTables.bind(this);
        this.getTableRecords = this.getTableRecords.bind(this);
        this.getMetadata = this.getMetadata.bind(this);
        this.importData = this.importData.bind(this);
        this.deleteTable = this.deleteTable.bind(this);
        this.deleteTables = this.deleteTables.bind(this);
        this.deleteRecord = this.deleteRecord.bind(this);
        this.deleteRecords = this.deleteRecords.bind(this);
        this.importToStaging = this.importToStaging.bind(this);
        this.getStagingSessions = this.getStagingSessions.bind(this);
        this.getStagingData = this.getStagingData.bind(this);
        this.updateStagingMapping = this.updateStagingMapping.bind(this);
        this.applyStagingChanges = this.applyStagingChanges.bind(this);
        this.deleteStagingSession = this.deleteStagingSession.bind(this);
        this.backupDatabase = this.backupDatabase.bind(this);
        this.restoreDatabase = this.restoreDatabase.bind(this);
        this.getCloudStatus = this.getCloudStatus.bind(this);
        this.authorizeCloud = this.authorizeCloud.bind(this);
        this.listCloudBackups = this.listCloudBackups.bind(this);
        this.backupToCloud = this.backupToCloud.bind(this);
        this.restoreFromCloud = this.restoreFromCloud.bind(this);
        this.testFtpConnection = this.testFtpConnection.bind(this);
        this.listFtpBackups = this.listFtpBackups.bind(this);
        this.downloadFtpBackup = this.downloadFtpBackup.bind(this);
        this.backupToFtp = this.backupToFtp.bind(this);
        this.restoreFromFtp = this.restoreFromFtp.bind(this);
    }

    /**
     * Helper to restart the Electron application safely
     */
    restartApp() {
        console.log('[SyncController] Initiating application restart...');
        
        // Try to close the main database connection
        try {
            if (SyncService && SyncService.db && typeof SyncService.db.close === 'function') {
                console.log('[SyncController] Closing database connection...');
                SyncService.db.close();
            }
        } catch (e) {
            console.warn('[SyncController] Could not close database cleanly before restart:', e);
        }

        // Check environment
        const isElectron = !!process.versions.electron;
        console.log('[SyncController] Environment: ' + (isElectron ? 'Electron' : 'Node.js'));

        if (isElectron) {
            try {
                const { app } = require('electron');
                if (app && typeof app.relaunch === 'function') {
                    console.log('[SyncController] Relaunching Electron app...');
                    
                    // In some environments, we might need to be explicit about the relaunch
                    // app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
                    app.relaunch();
                    
                    console.log('[SyncController] Exiting current instance...');
                    // Use exit(0) to bypass "window-all-closed" handlers and other quit-blocking logic
                    app.exit(0);
                } else {
                    console.error('[SyncController] Electron app.relaunch not found. Falling back to process.exit.');
                    process.exit(0);
                }
            } catch (err) {
                console.error('[SyncController] Error during Electron relaunch:', err);
                process.exit(1);
            }
        } else {
            // Fallback for non-electron (dev)
            console.warn('[SyncController] Not in Electron process. Using process.exit(0).');
            // In dev mode, if using nodemon, exit(0) will trigger a restart.
            // If using standard node, it just stops.
            process.exit(0);
        }
    }
    
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

    /**
     * GET /api/sync/backup
     * Sao lưu tĩnh CSDL SQLite
     */
    async backupDatabase(req, res) {
        try {
            const tempDir = os.tmpdir();
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `DigiSports_Backup_${dateStr}.sqlite`;
            const backupPath = path.join(tempDir, backupFileName);

            const db = new Database(DB_SCHEME);
            await db.backup(backupPath);
            db.close();

            res.download(backupPath, backupFileName, (err) => {
                if (err) {
                    console.error('Error downloading backup:', err);
                }
                setTimeout(() => {
                    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
                }, 5000);
            });
        } catch (error) {
            console.error('Error backupDatabase:', error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Lỗi sao lưu CSDL', error: error.message });
            }
        }
    }

    /**
     * POST /api/sync/restore
     * Khôi phục CSDL từ file tải lên
     */
    async restoreDatabase(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Không tìm thấy file' });
            }

            const uploadedFile = req.file.path;
            
            // Đảm bảo đóng kết nối trước khi ghi đè
            if (SyncService && SyncService.db) {
                SyncService.db.close();
                console.log(' Main database connection closed for restore.');
            }

            // Xóa file SHM và WAL để tránh corrupt db sau khi copy
            if (fs.existsSync(`${DB_SCHEME}-shm`)) fs.unlinkSync(`${DB_SCHEME}-shm`);
            if (fs.existsSync(`${DB_SCHEME}-wal`)) fs.unlinkSync(`${DB_SCHEME}-wal`);
            
            // Ghi đè file chính
            fs.copyFileSync(uploadedFile, DB_SCHEME);
            fs.unlinkSync(uploadedFile);

            res.json({ success: true, message: 'Khôi phục CSDL thành công. Ứng dụng sẽ tự động khởi động lại.' });
            
            // Restart process to clear all memory sqlite connections
            setTimeout(() => {
                this.restartApp();
            }, 2000);
        } catch (error) {
            console.error('Error restoreDatabase:', error);
            res.status(500).json({ success: false, message: 'Lỗi khôi phục CSDL', error: error.message });
        }
    }

    /**
     * GET /api/sync/cloud/status
     */
    async getCloudStatus(req, res) {
        try {
            const isAuth = GoogleDriveService.isAuthenticated();
            const authUrl = !isAuth ? GoogleDriveService.getAuthUrl() : null;
            // Trả về thêm info về authMode để Frontend biết
            res.json({ success: true, data: { isAuthenticated: isAuth, authUrl, authMode: GoogleDriveService.authMode } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/sync/cloud/authorize
     */
    async authorizeCloud(req, res) {
        try {
            const { code } = req.body;
            await GoogleDriveService.authorize(code);
            res.json({ success: true, message: 'Kết nối Google Drive thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi xác thực Google: ' + error.message });
        }
    }

    /**
     * GET /api/sync/cloud/backups
     * Liệt kê các bản sao lưu từ Google Drive
     */
    async listCloudBackups(req, res) {
        try {
            if (!GoogleDriveService.isAuthenticated()) {
                return res.status(401).json({ success: false, message: 'Chưa kết nối Google Drive', isAuthError: true });
            }
            const uuid = await getUUID();
            const backups = await GoogleDriveService.listBackups(uuid);
            res.json({ success: true, data: backups });
        } catch (error) {
            console.error('Error listCloudBackups:', error);
            res.status(500).json({ success: false, message: 'Lỗi lấy danh sách sao lưu từ Cloud', error: error.message });
        }
    }

    /**
     * POST /api/sync/cloud/backup
     * Sao lưu CSDL lên Google Drive
     */
    async backupToCloud(req, res) {
        console.log('[SyncController] Starting backupToCloud process...');
        try {
            if (!GoogleDriveService.isAuthenticated()) {
                console.warn('[SyncController] Backup failed: Not authenticated.');
                return res.status(401).json({ success: false, message: 'Chưa kết nối Google Drive', isAuthError: true });
            }
            const uuid = await getUUID();
            const tempDir = os.tmpdir();
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `DigiSports_${dateStr}.sqlite`;
            const tempPath = path.join(tempDir, fileName);

            console.log(`[SyncController] Creating local backup file: ${fileName}`);
            // Tạo bản sao lưu tĩnh trước
            const db = new Database(DB_SCHEME);
            await db.backup(tempPath);
            db.close();

            console.log('[SyncController] Local backup created. Resolving Drive folders...');
            // Tìm/Tạo thư mục thiết bị
            const folderId = await GoogleDriveService.findOrCreateFolder(uuid);
            
            console.log('[SyncController] Uploading to Google Drive...');
            // Upload lên Drive
            const result = await GoogleDriveService.uploadFile(tempPath, fileName, folderId);

            console.log('[SyncController] Cleaning up temporary file.');
            // Xóa file tạm
            fs.unlinkSync(tempPath);

            console.log('[SyncController] Backup process completed successfully.');
            res.json({ success: true, message: 'Sao lưu lên Google Drive thành công', data: result });
        } catch (error) {
            console.error('[SyncController] Error backupToCloud:', error);
            res.status(500).json({ success: false, message: 'Lỗi sao lưu lên Cloud', error: error.message });
        }
    }

    /**
     * POST /api/sync/cloud/restore
     * Khôi phục CSDL từ Google Drive
     * Body: { fileId }
     */
    async restoreFromCloud(req, res) {
        console.log('[SyncController] Starting restoreFromCloud process...');
        try {
            if (!GoogleDriveService.isAuthenticated()) {
                console.warn('[SyncController] Restore failed: Not authenticated.');
                return res.status(401).json({ success: false, message: 'Chưa kết nối Google Drive', isAuthError: true });
            }
            const { fileId } = req.body;
            if (!fileId) {
                console.warn('[SyncController] Restore failed: Missing fileId.');
                return res.status(400).json({ success: false, message: 'Thiếu fileId' });
            }

            console.log(`[SyncController] Downloading file ${fileId} from Drive...`);
            const tempPath = path.join(os.tmpdir(), `restore_${Date.now()}.sqlite`);
            
            // Download từ Drive
            await GoogleDriveService.downloadFile(fileId, tempPath);
            console.log('[SyncController] Download complete. Restoring database...');

            // Đảm bảo đóng kết nối trước khi ghi đè
            if (SyncService && SyncService.db) {
                SyncService.db.close();
                console.log(' Main database connection closed for cloud restore.');
            }

            // Áp dụng logic restore giống restoreDatabase
            if (fs.existsSync(`${DB_SCHEME}-shm`)) fs.unlinkSync(`${DB_SCHEME}-shm`);
            if (fs.existsSync(`${DB_SCHEME}-wal`)) fs.unlinkSync(`${DB_SCHEME}-wal`);
            
            fs.copyFileSync(tempPath, DB_SCHEME);
            fs.unlinkSync(tempPath);

            res.json({ success: true, message: 'Khôi phục từ Cloud thành công. Ứng dụng sẽ khởi động lại.' });

            setTimeout(() => {
                this.restartApp();
            }, 2000);
        } catch (error) {
            console.error('Error restoreFromCloud:', error);
            res.status(500).json({ success: false, message: 'Lỗi khôi phục từ Cloud', error: error.message });
        }
    }

    /**
     * GET /api/sync/ftp/test
     */
    async testFtpConnection(req, res) {
        try {
            await FtpService.testConnection();
            res.json({ success: true, message: 'Kết nối FTP thành công!' });
        } catch (error) {
            console.error('[SyncController] FTP Test Connection Error:', error);
            res.status(500).json({ success: false, message: 'Lỗi kết nối FTP: ' + error.message });
        }
    }

    /**
     * GET /api/sync/ftp/backups
     */
    async listFtpBackups(req, res) {
        try {
            const uuid = await getUUID();
            const backups = await FtpService.listBackups(uuid);
            res.json({ success: true, data: backups });
        } catch (error) {
            console.error('Error listFtpBackups:', error);
            res.status(500).json({ success: false, message: 'Lỗi lấy danh sách sao lưu từ FTP', error: error.message });
        }
    }

    /**
     * POST /api/sync/ftp/backup
     */
    async backupToFtp(req, res) {
        console.log('[SyncController] Starting backupToFtp process...');
        try {
            const uuid = await getUUID();
            const tempDir = os.tmpdir();
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `DigiSports_FTP_${dateStr}.sqlite`;
            const tempPath = path.join(tempDir, fileName);

            console.log(`[SyncController] Creating local backup file: ${fileName}`);
            const db = new Database(DB_SCHEME);
            await db.backup(tempPath);
            db.close();

            console.log('[SyncController] Uploading to FTP...');
            const result = await FtpService.uploadFile(tempPath, fileName, uuid);

            console.log('[SyncController] Cleaning up temporary file.');
            fs.unlinkSync(tempPath);

            console.log('[SyncController] FTP Backup completed.');
            res.json({ success: true, message: 'Sao lưu lên FTP thành công', data: result });
        } catch (error) {
            console.error('[SyncController] Error backupToFtp:', error);
            res.status(500).json({ success: false, message: 'Lỗi sao lưu lên FTP', error: error.message });
        }
    }

    /**
     * POST /api/sync/ftp/restore
     */
    async restoreFromFtp(req, res) {
        console.log('[SyncController] Starting restoreFromFtp process...');
        try {
            const { filePath } = req.body;
            if (!filePath) {
                return res.status(400).json({ success: false, message: 'Thiếu filePath' });
            }

            console.log(`[SyncController] Downloading ${filePath} from FTP...`);
            const tempPath = path.join(os.tmpdir(), `restore_ftp_${Date.now()}.sqlite`);
            
            await FtpService.downloadFile(filePath, tempPath);
            
            console.log('[SyncController] Download complete. Restoring database...');

            // Đảm bảo đóng kết nối trước khi ghi đè
            if (SyncService && SyncService.db) {
                SyncService.db.close();
                console.log(' Main database connection closed for FTP restore.');
            }

            if (fs.existsSync(`${DB_SCHEME}-shm`)) fs.unlinkSync(`${DB_SCHEME}-shm`);
            if (fs.existsSync(`${DB_SCHEME}-wal`)) fs.unlinkSync(`${DB_SCHEME}-wal`);
            
            fs.copyFileSync(tempPath, DB_SCHEME);
            fs.unlinkSync(tempPath);

            res.json({ success: true, message: 'Khôi phục từ FTP thành công. Ứng dụng sẽ khởi động lại.' });

            setTimeout(() => {
                this.restartApp();
            }, 2000);
        } catch (error) {
            console.error('Error restoreFromFtp:', error);
            res.status(500).json({ success: false, message: 'Lỗi khôi phục từ FTP', error: error.message });
        }
    }

    /**
     * GET /api/sync/ftp/download?filePath=...
     */
    async downloadFtpBackup(req, res) {
        console.log('[SyncController] Starting downloadFtpBackup process...');
        try {
            const { filePath } = req.query;
            if (!filePath) {
                return res.status(400).json({ success: false, message: 'Thiếu filePath' });
            }

            const fileName = path.basename(filePath);
            const tempPath = path.join(os.tmpdir(), fileName);
            
            console.log(`[SyncController] Downloading ${filePath} from FTP to temporary storage...`);
            await FtpService.downloadFile(filePath, tempPath);
            
            console.log(`[SyncController] Sending file ${fileName} to browser.`);
            res.download(tempPath, fileName, (err) => {
                if (err) {
                    console.error('[SyncController] Error sending file:', err);
                }
                // Cleanup
                try {
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                } catch (e) {}
            });
        } catch (error) {
            console.error('[SyncController] Error downloadFtpBackup:', error);
            res.status(500).json({ success: false, message: 'Lỗi tải file từ FTP', error: error.message });
        }
    }
}

module.exports = new SyncController();

