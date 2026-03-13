const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');
const { getIP } = require('../config/config');
const axios = require('axios');
const multer = require('multer');
const os = require('os');

const upload = multer({ dest: os.tmpdir() });

// GET /api/sync/local-ip - Lấy IP của máy hiện tại
router.get('/local-ip', async (req, res) => {
    try {
        const ip = await getIP();
        return res.json({
            success: true,
            message: 'Lấy IP thành công',
            data: { ip: ip || 'Không xác định' }
        });
    } catch (error) {
        console.error('Error getting local IP:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy IP',
            error: error.message
        });
    }
});

// GET /api/sync/scan-network - Quét mạng tìm máy chủ khác
router.get('/scan-network', async (req, res) => {
    try {
        const networkInterfaces = os.networkInterfaces();
        const localIPs = [];
        const subnets = new Set();

        // Thu thập tất cả IP và subnet từ các card mạng đang hoạt động
        for (const [name, netInterface] of Object.entries(networkInterfaces)) {
            for (const iface of netInterface) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIPs.push(iface.address);
                    const parts = iface.address.split('.');
                    if (parts.length === 4) {
                        subnets.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
                    }
                }
            }
        }

        if (localIPs.length === 0) {
            return res.json({
                success: false,
                message: 'Không thể xác định IP của máy hiện tại',
                data: { servers: [] }
            });
        }

        // Heuristic: Quét rộng hơn cho dải 192.168.x.x (từ .0 đến .50) như yêu cầu của user
        const has192 = Array.from(subnets).some(s => s.startsWith('192.168'));
        if (has192) {
            for (let i = 0; i <= 50; i++) {
                subnets.add(`192.168.${i}`);
            }
        }

        const subnetsToScan = Array.from(subnets);
        const allTargetIPs = [];

        // Thu thập tất cả IP mục tiêu
        for (const subnet of subnetsToScan) {
            for (let i = 0; i <= 254; i++) {
                const targetIP = `${subnet}.${i}`;
                if (!localIPs.includes(targetIP)) {
                    allTargetIPs.push(targetIP);
                }
            }
        }

        console.log(`🔍 Bắt đầu quét tổng cộng ${allTargetIPs.length} IP trên ${subnetsToScan.length} subnet...`);

        const foundServers = [];
        const BATCH_SIZE = 200; // Quét 200 IP một lúc để tránh quá tải
        const TIMEOUT = 450;

        // Quét theo đợt (batch)
        for (let i = 0; i < allTargetIPs.length; i += BATCH_SIZE) {
            const batch = allTargetIPs.slice(i, i + BATCH_SIZE);

            const batchPromises = batch.map(targetIP =>
                axios.get(`http://${targetIP}:6789/api/sync/local-ip`, { timeout: TIMEOUT })
                    .then(response => {
                        if (response.data && response.data.success) {
                            console.log(`\x1b[32m Found server at ${targetIP} \x1b[0m`);
                            return {
                                ip: targetIP,
                                url: `http://${targetIP}:6789`,
                                remoteIP: response.data.data.ip,
                                status: 'online'
                            };
                        }
                        return null;
                    })
                    .catch(() => null)
            );

            const batchResults = await Promise.all(batchPromises);
            const onlineServers = batchResults.filter(s => s !== null);
            foundServers.push(...onlineServers);

            // Log tiến độ mỗi 1000 IP
            if ((i + BATCH_SIZE) % 1000 === 0 || i + BATCH_SIZE >= allTargetIPs.length) {
                console.log(`  Tiến độ: ${Math.min(i + BATCH_SIZE, allTargetIPs.length)}/${allTargetIPs.length} IP...`);
            }
        }

        console.log(`\x1b[36m Quét xong! Tìm thấy ${foundServers.length} server(s) \x1b[0m`);

        return res.json({
            success: true,
            message: `Tìm thấy ${foundServers.length} server(s) trên mạng`,
            data: {
                localIPs: localIPs,
                subnetsScanned: subnetsToScan,
                servers: foundServers
            }
        });
    } catch (error) {
        console.error('Error scanning network:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi quét mạng',
            error: error.message,
            data: { servers: [] }
        });
    }
});

// GET /api/sync/tables - Lấy danh sách các bảng có thể đồng bộ
router.get('/tables', SyncController.getTables);

// GET /api/sync/all-tables - Lấy tất cả các bảng trong database
router.get('/all-tables', SyncController.getAllTables);

// GET /api/sync/records/:tableName - Lấy tất cả records của một bảng
router.get('/records/:tableName', SyncController.getTableRecords);

// GET /api/sync/metadata?tables=champion,team,champion_athlete
router.get('/metadata', SyncController.getMetadata);

// GET /api/sync/export?tables=champion,team,champion_athlete
router.get('/export', SyncController.exportData);

// POST /api/sync/import
// Body: { table, data, strategy }
router.post('/import', SyncController.importData);

// DELETE /api/sync/table/:tableName - Xóa một bảng
router.delete('/table/:tableName', SyncController.deleteTable);

// POST /api/sync/delete-tables - Xóa nhiều bảng
// Body: { tables: ['table1', 'table2'] }
router.post('/delete-tables', SyncController.deleteTables);

// DELETE /api/sync/record/:tableName/:recordId - Xóa một record
router.delete('/record/:tableName/:recordId', SyncController.deleteRecord);

// POST /api/sync/delete-records - Xóa nhiều records
// Body: { tableName, recordIds: [1, 2, 3] }
router.post('/delete-records', SyncController.deleteRecords);

// === STAGING ROUTES ===

// POST /api/sync/import-staging - Nhận dữ liệu vào staging
// Body: { table, data, session_id, source_ip }
router.post('/import-staging', SyncController.importToStaging);

// GET /api/sync/staging/sessions - Lấy danh sách staging sessions
router.get('/staging/sessions', SyncController.getStagingSessions);

// GET /api/sync/staging/:sessionId - Lấy dữ liệu staging của session
router.get('/staging/:sessionId', SyncController.getStagingData);

// PUT /api/sync/staging/:stagingId/mapping - Cập nhật mapping
// Body: { mapping_to_id, action }
router.put('/staging/:stagingId/mapping', SyncController.updateStagingMapping);

// POST /api/sync/staging/:sessionId/apply - Áp dụng changes
router.post('/staging/:sessionId/apply', SyncController.applyStagingChanges);

// DELETE /api/sync/staging/:sessionId - Xóa staging session
router.delete('/staging/:sessionId', SyncController.deleteStagingSession);

// GET /api/sync/backup - Tải về bản sao lưu database SQLite
router.get('/backup', SyncController.backupDatabase);

// POST /api/sync/restore - Tải lên bản sao lưu và khôi phục
router.post('/restore', upload.single('db_file'), SyncController.restoreDatabase);

// Cloud Backup Routes
router.get('/cloud/status', SyncController.getCloudStatus.bind(SyncController));
router.post('/cloud/authorize', SyncController.authorizeCloud.bind(SyncController));
router.get('/cloud/backups', SyncController.listCloudBackups);
router.post('/cloud/backup', SyncController.backupToCloud);
router.post('/cloud/restore', SyncController.restoreFromCloud);

// FTP Backup Routes
router.get('/ftp/test', SyncController.testFtpConnection.bind(SyncController));
router.get('/ftp/backups', SyncController.listFtpBackups);
router.get('/ftp/download', SyncController.downloadFtpBackup.bind(SyncController));
router.post('/ftp/backup', SyncController.backupToFtp);
router.post('/ftp/restore', SyncController.restoreFromFtp);

module.exports = router;
