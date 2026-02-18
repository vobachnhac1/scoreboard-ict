const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license.controller');

/**
 * License Routes
 * 
 * POST   /api/license/activate    - Kích hoạt license
 * GET    /api/license/status      - Lấy trạng thái license hiện tại
 * POST   /api/license/check       - Kiểm tra license cụ thể
 * POST   /api/license/deactivate  - Hủy kích hoạt license
 */

// Kích hoạt license
router.post('/activate', licenseController.activateLicense);

// Lấy trạng thái license hiện tại
router.get('/status', licenseController.getLicenseStatus);

// Kiểm tra license cụ thể
router.post('/check', licenseController.checkLicense);

// Hủy kích hoạt license
router.post('/deactivate', licenseController.deactivateLicense);

module.exports = router;

