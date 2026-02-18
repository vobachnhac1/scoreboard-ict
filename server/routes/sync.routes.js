const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');

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

module.exports = router;

