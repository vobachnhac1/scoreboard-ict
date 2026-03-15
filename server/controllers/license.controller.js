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
                error: 'Vui lòng nhập mã kích hoạt. (Mã lỗi: 400)'
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
            return res.status(result.code).json({
                success: false,
                error: result.error,
                code: result.code
            });
        }
    } catch (error) {
        console.error(' Activate license error:', error);
        return res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi hệ thống khi kích hoạt. Vui lòng thử lại sau. (Mã lỗi: 500)',
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
            error: 'Không thể kiểm tra trạng thái bản quyền. (Mã lỗi: 500)',
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
                error: 'Thiếu mã kích hoạt để kiểm tra. (Mã lỗi: 400)'
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
            error: 'Lỗi hệ thống khi kiểm tra bản quyền. (Mã lỗi: 500)',
            message: error.message
        });
    }
};

/**
 * POST /api/license/deactivate
 * Hủy kích hoạt license (local only)
 */
exports.deactivateLicense = async (req, res) => {
    try {
        const { license_key } = req.body;

        if (!license_key) {
            return res.status(400).json({
                success: false,
                error: 'Mã kích hoạt không khả dụng để hủy. (Mã lỗi: 400)'
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
            error: 'Lỗi hệ thống khi hủy kích hoạt. (Mã lỗi: 500)',
            message: error.message
        });
    }
};

/**
 * DELETE /api/license/revoke-device
 * Hủy key license: Gọi API DELETE /device-activations/device/:identifier lên server online
 * và xóa dữ liệu license khỏi thiết bị
 */
exports.revokeDeviceKey = async (req, res) => {
    try {
        // Lấy identifier của thiết bị (UUID hoặc MAC address)
        const mac_address = await getMacAddress();
        const uuid_desktop = await getUUID();

        // Ư u tiên dùng MAC address (deviceId), fallback sang UUID
        const identifier = uuid_desktop || mac_address;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                error: 'Không xác định được danh tính thiết bị. (Mã lỗi: 400)'
            });
        }

        console.log('🗑️  Revoking device key, identifier:', identifier);

        const result = await licenseService.revokeDeviceKey(identifier);

        return res.json({
            success: result.success,
            data: result,
            message: result.message || (result.success ? 'License revoked successfully' : result.error)
        });
    } catch (error) {
        console.error('❌ Revoke device key error:', error);
        return res.status(500).json({
            success: false,
            error: 'Lỗi hệ thống khi thu hồi bản quyền. (Mã lỗi: 500)',
            message: error.message
        });
    }
};

