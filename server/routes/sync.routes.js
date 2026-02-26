const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');
const { getIP } = require('../config/config');
const axios = require('axios');

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
        const localIP = await getIP();

        if (!localIP || localIP === 'Không xác định') {
            return res.json({
                success: false,
                message: 'Không thể xác định IP của máy hiện tại',
                data: { servers: [] }
            });
        }

        // Lấy subnet từ IP (ví dụ: 192.168.1.100 -> 192.168.1)
        const ipParts = localIP.split('.');
        if (ipParts.length !== 4) {
            return res.json({
                success: false,
                message: 'IP không hợp lệ',
                data: { servers: [] }
            });
        }

        const subnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
        const foundServers = [];

        console.log(`🔍 Bắt đầu quét subnet ${subnet}.0/24...`);

        // Quét từ .1 đến .254
        const promises = [];
        for (let i = 1; i <= 254; i++) {
            const targetIP = `${subnet}.${i}`;

            // Bỏ qua IP của chính mình
            if (targetIP === localIP) continue;

            // Tạo promise để quét IP này
            const promise = axios.get(`http://${targetIP}:6789/api/sync/local-ip`, {
                timeout: 500 // 500ms timeout cho mỗi IP
            })
            .then(response => {
                if (response.data && response.data.success) {
                    console.log(` Tìm thấy server tại ${targetIP}`);
                    foundServers.push({
                        ip: targetIP,
                        url: `http://${targetIP}:6789`,
                        remoteIP: response.data.data.ip,
                        status: 'online'
                    });
                }
            })
            .catch(() => {
                // Không log lỗi để tránh spam console
            });

            promises.push(promise);
        }

        // Chờ tất cả các requests hoàn thành
        await Promise.all(promises);

        console.log(` Quét xong! Tìm thấy ${foundServers.length} server(s)`);

        return res.json({
            success: true,
            message: `Tìm thấy ${foundServers.length} server(s) trên mạng`,
            data: {
                localIP: localIP,
                subnet: subnet,
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

module.exports = router;

