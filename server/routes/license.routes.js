const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license.controller');

/**
 * License Routes
 * 
 * POST   /api/license/activate      - Kích hoạt license
 * GET    /api/license/status        - Lấy trạng thái license hiện tại
 * POST   /api/license/check         - Kiểm tra license cụ thể
 * POST   /api/license/deactivate    - Hủy kích hoạt license (local only)
 * DELETE /api/license/revoke-device - Huỷ key khỏi thiết bị (gọi server + xóa local)
 */

// Kích hoạt license
router.post('/activate', licenseController.activateLicense);

// Lấy trạng thái license hiện tại
router.get('/status', licenseController.getLicenseStatus);

// Kiểm tra license cụ thể
router.post('/check', licenseController.checkLicense);

// Hủy kích hoạt license (local only)
router.post('/deactivate', licenseController.deactivateLicense);

// Huỷ key license khỏi thiết bị - gọi API DELETE lên server online + xóa local DB
router.delete('/revoke-device', licenseController.revokeDeviceKey);

module.exports = router;

