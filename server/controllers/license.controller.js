const licenseService = require('../services/license/license.service');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
// const {} = require('')
/**
 * License Controller
 * Xử lý các request liên quan đến license
 */

/**
 * Lấy device UUID và MAC address
 */
function getDeviceInfo() {
    // Lấy MAC address của network interface đầu tiên
    const networkInterfaces = os.networkInterfaces();
    let macAddress = '';

    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
                macAddress = iface.mac;
                break;
            }
        }
        if (macAddress) break;
    }

    // Tạo UUID dựa trên hostname và MAC
    const hostname = os.hostname();
    const deviceUuid = uuidv4(); // Hoặc có thể dùng hash của hostname + MAC

    return {
        device_uuid: deviceUuid,
        mac_address: macAddress,
        hostname: hostname,
        platform: os.platform(),
        arch: os.arch()
    };
}

/**
 * POST /api/license/activate
 * Kích hoạt license
 */

const { getMacAddress, getUUID, getIP } = require('../config/config')

exports.activateLicense = async (req, res) => {
    try {
        const { license_key } = req.body;

        if (!license_key) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        // Lấy thông tin device
        const deviceInfo = getDeviceInfo();
        console.log('deviceInfo: ', deviceInfo);

        // Gọi service để kích hoạt dùng mac address / mã thiết thị 
        // mac address / mã thiết thị / ip address
        const result = await licenseService.activateLicense({
            license_key,
            device_uuid: getUUID(),
            mac_address: getMacAddress(),
            ip_address: getIP()
        });

        if (result.success) {
            return res.json({
                success: true,
                data: result.data,
                message: 'License activated successfully'
            });
        } else {
            return res.status(400).json({
                success: false,
                error: result.error,
                code: result.code
            });
        }
    } catch (error) {
        console.error(' Activate license error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * GET /api/license/status
 * Kiểm tra trạng thái license hiện tại
 */
exports.getLicenseStatus = async (req, res) => {
    try {
        const licenseInfo = await licenseService.getCurrentLicense();

        return res.json({
            success: true,
            data: licenseInfo
        });
    } catch (error) {
        console.error(' Get license status error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * POST /api/license/check
 * Kiểm tra license cụ thể
 */
exports.checkLicense = async (req, res) => {
    try {
        const { license_key } = req.body;

        if (!license_key) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await licenseService.checkLicenseValidity(license_key);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(' Check license error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * POST /api/license/deactivate
 * Hủy kích hoạt license
 */
exports.deactivateLicense = async (req, res) => {
    try {
        const { license_key } = req.body;

        if (!license_key) {
            return res.status(400).json({
                success: false,
                error: 'License key is required'
            });
        }

        const result = await licenseService.deactivateLicense(license_key);

        return res.json({
            success: true,
            data: result,
            message: 'License deactivated successfully'
        });
    } catch (error) {
        console.error(' Deactivate license error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
};

