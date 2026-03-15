const axios = require('axios');
const { BetterSQLiteWrapper } = require('../common/db_better_sqlite3');
const { DB_SCHEME } = require('../common/constant_sql');
const { getMacAddress, getUUID, getIP, API_ENCRYPTION_ENABLED } = require('../../config/config')
const encryption = require('../../config/encryption');
const init_config_db = require('../init-config');

/**
 * License Service
 * Quản lý việc kích hoạt và kiểm tra bản quyền
 * 
 * Flow:
 * 1. Backend gọi API https://digisports.com.vn/api/v1/device-activations/activate
 * 2. Lưu thông tin license vào SQLite (table: license_activation)
 * 3. Kiểm tra ngày hết hạn mỗi khi khởi động app
 * 4. Cung cấp API cho frontend lấy thông tin license
 */

class LicenseService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.apiUrl = 'https://digisports.com.vn/api/v1/device-activations/activate';
        // this.apiUrl = 'http://localhost:3000/api/v1/device-activations/activate';
        // URL cho việc huỷ key (revoke)
        this.revokeBaseUrl = 'https://digisports.com.vn/api/v1/device-activations/client/deactivate';
        // this.revokeBaseUrl = 'http://localhost:3000/api/v1/device-activations/client/deactivate';
        this.initDatabase();
    }

    /**
     * Chuyển đổi lỗi kỹ thuật thành thông báo thân thiện cho người dùng
     * @param {Error|Object} error - Đối tượng lỗi từ axios hoặc Error
     * @returns {string} - Thông báo lỗi thân thiện kèm mã tracking
     */
    _getFriendlyErrorMessage(error) {
        let code = 'ERROR';
        let message = 'Đã xảy ra lỗi không xác định.';

        if (error.response) {
            // Lỗi từ máy chủ (Axios response error)
            const status = error.response.status;
            code = status;

            // Lấy message từ server nếu có
            let serverMsg = error.response.data?.message || error.response.data?.error;
            if (Array.isArray(serverMsg)) serverMsg = serverMsg.join(' ');

            switch (status) {
                case 400:
                    message = serverMsg || 'Dữ liệu không hợp lệ hoặc mã kích hoạt không đúng.';
                    break;
                case 401:
                    message = 'Phiên làm việc hết hạn hoặc không có quyền truy cập.';
                    break;
                case 403:
                    message = 'Truy cập bị từ chối. Bản quyền có thể đã bị thu hồi hoặc không hợp lệ.';
                    break;
                case 404:
                    message = 'Không tìm thấy thông tin yêu cầu trên hệ thống.';
                    break;
                case 429:
                    message = 'Hệ thống đang bận do có quá nhiều yêu cầu. Vui lòng thử lại sau.';
                    break;
                default:
                    if (status >= 500) {
                        message = 'Hệ thống máy chủ đang gặp sự cố tạm thời.';
                    } else {
                        message = serverMsg || 'Lỗi kết nối tới máy chủ bản quyền.';
                    }
            }
        } else if (error.request) {
            // Không kết nối được tới server
            code = 'NETWORK_ERROR';
            message = 'Không thể kết nối tới máy chủ bản quyền. Vui lòng kiểm tra kết nối internet.';
        } else {
            // Các lỗi khác
            code = error.code || 'APP_ERROR';
            message = error.message || 'Đã xảy ra lỗi trong quá trình xử lý.';
        }

        return `${message} (Mã lỗi: ${code})`;
    }

    /**
     * Khởi tạo bảng license_activation
     */
    initDatabase() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS license_activation (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    license_key TEXT NOT NULL UNIQUE,
                    device_uuid TEXT NOT NULL,
                    mac_address TEXT,
                    activation_date TEXT NOT NULL,
                    expiration_date TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    package_name TEXT,
                    max_devices INTEGER DEFAULT 1,
                    features TEXT,
                    api_response TEXT,
                    last_check_date TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
            `);

            console.log(' License activation table initialized');
        });
    }

    /**
     * Kích hoạt license bằng cách gọi API
     * @param {Object} data - { license_key, device_uuid, mac_address }
     * @returns {Promise<Object>} - License info
     */

    async activateLicense(data) {
        const { license_key } = data;
        try {
            console.log('🔑 Activating license:', license_key);
            const uuid_desktop = await getUUID()
            const ip = await getIP()
            const mac_address = await getMacAddress()
            const config = {
                licenseKey: license_key,
                deviceType: 'COMPUTER',
                deviceId: uuid_desktop,
                deviceInfo: {
                    uuid_desktop: uuid_desktop,
                    mac_address: mac_address,
                    app_version: require('../../../package.json').version,
                    platform: process.platform
                }
            }
            // Gọi API kích hoạt
            console.log('API URL:', this.apiUrl);

            let requestData = config;
            let headers = {
                'Content-Type': 'application/json'
            };

            if (API_ENCRYPTION_ENABLED) {
                console.log('🔐 Request Encryption enabled');
                requestData = encryption.encryptPayload(config);
                headers['x-encrypted'] = 'true';
            }

            console.log('API Config:', JSON.stringify(requestData, null, 2));
            const response = await axios.post(this.apiUrl, requestData, {
                timeout: 10000,
                headers: headers
            });

            if (response.data && response.status == 201) {
                let responseData = response.data;
                if (API_ENCRYPTION_ENABLED && response.headers['x-encrypted'] === 'true') {
                    console.log('🔓 Response Decryption enabled');
                    responseData = encryption.decryptPayload(responseData);
                }

                console.log(' API Response:', JSON.stringify(responseData, null, 2));
                const resultCheck = responseData;

                // Parse response từ API
                const licenseData = {
                    is_active: resultCheck.isActive,
                    activation_date: resultCheck.activatedAt,
                    expiration_date: resultCheck.expiredDate,
                    licenseKeyId: resultCheck.licenseKeyId,
                    license_key: license_key,
                    deviceInfo: resultCheck.deviceInfo, // object
                    package_name: resultCheck.packageName || resultCheck.package_name || null,
                    max_devices: resultCheck.maxDevices || resultCheck.max_devices || 1,
                    features: resultCheck.features || {},
                    config_presets: resultCheck.config_presets || {}
                }

                // Lưu vào database với đầy đủ thông tin từ API
                // cập nhật lại config_presets vào database
                await this.saveLicenseToDatabase({
                    license_key: license_key,
                    device_uuid: uuid_desktop,
                    mac_address: mac_address,
                    activation_date: licenseData.activation_date || new Date().toISOString(),
                    expiration_date: licenseData.expiration_date,
                    status: licenseData.is_active ? 'active' : 'inactive',
                    package_name: licenseData.package_name,
                    max_devices: licenseData.max_devices,
                    features: JSON.stringify({
                        ...licenseData.features,
                        allowed_keyboard_modes: licenseData.features.allowed_keyboard_modes,
                        hiddenConfigs: licenseData.features.hidden_configs,
                        disabledConfigs: licenseData.features.disabled_configs,
                        module_overrides: licenseData.features.module_overrides,
                        custom_event_name: licenseData.features.custom_event_name,
                        forced_keyboard_mode: licenseData.features.forced_keyboard_mode,
                        hiddenGroups: licenseData.features.hidden_groups,
                        allowedOptions: licenseData.features.default_values.allowed_options,
                        config_presets: licenseData.config_presets
                    }),
                    api_response: JSON.stringify(response.data),
                    last_check_date: new Date().toISOString()
                });

                // Đồng bộ dữ liệu license vào bảng config_values (init_config_db)
                const featuresToSync = {
                    ...licenseData.features,
                    allowedOptions: licenseData.features?.default_values?.allowed_options,
                };
                await this._syncLicenseFeaturesToSystemConfig(featuresToSync);


                // Tính số ngày còn lại
                const now = new Date();
                const expirationDate = new Date(licenseData.expiration_date);
                const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

                // Trả về data đầy đủ cho frontend
                return {
                    success: true,
                    data: {
                        valid: licenseData.is_active && daysRemaining > 0,
                        daysRemaining: Math.max(0, daysRemaining),
                        expirationDate: licenseData.expiration_date,
                        activationDate: licenseData.activation_date,
                        packageName: licenseData.package_name,
                        licenseKey: license_key,
                        licenseKeyId: licenseData.licenseKeyId,
                        features: {
                            ...licenseData.features,
                            config_presets: licenseData.config_presets
                        },
                        config_presets: licenseData.config_presets || {},
                        status: licenseData.is_active ? 'active' : 'inactive',
                        requireActivation: false,
                        deviceInfo: licenseData.deviceInfo
                    },
                    message: 'License activated successfully'
                };
            } else {
                throw new Error(response.data.message || 'Activation failed');
            }
        } catch (error) {
            console.error(' License activation error:', error.message);

            const friendlyError = this._getFriendlyErrorMessage(error);
            const status = error.response?.status || 500;

            // Xử lý logic đặc biệt cho revoked license (403 hoặc thông báo revoke)
            if (status === 403 ||
                (error.response?.data?.message &&
                    (error.response.data.message.toLowerCase().includes('revoked') ||
                        error.response.data.message.toLowerCase().includes('thu hồi')))) {

                console.log('  License revoked or Access Forbidden. Clearing local database...');
                try {
                    await this.deleteAllLicenses();
                } catch (e) {
                    console.error('  Failed to clear database:', e.message);
                }

                return {
                    success: false,
                    error: friendlyError,
                    code: status,
                    revoked: true
                };
            }

            return {
                success: false,
                error: friendlyError,
                code: status === 500 ? 'INTERNAL_ERROR' : status
            };
        }
    }

    /**
     * Lưu license vào database
     */
    saveLicenseToDatabase(data) {
        return new Promise((resolve, reject) => {
            const {
                license_key, device_uuid, mac_address, activation_date,
                expiration_date, status, package_name, max_devices,
                features, api_response, last_check_date
            } = data;

            // Kiểm tra xem license đã tồn tại chưa
            this.db.get(
                'SELECT * FROM license_activation WHERE license_key = ?',
                [license_key],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row) {
                        // Update existing license
                        this.db.run(`
                            UPDATE license_activation SET
                                device_uuid = ?,
                                mac_address = ?,
                                activation_date = ?,
                                expiration_date = ?,
                                status = ?,
                                package_name = ?,
                                max_devices = ?,
                                features = ?,
                                api_response = ?,
                                last_check_date = ?,
                                updated_at = datetime('now')
                            WHERE license_key = ?
                        `, [device_uuid, mac_address, activation_date, expiration_date, status,
                            package_name, max_devices, features, api_response, last_check_date, license_key],
                            function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ id: row.id, ...data });
                                }
                            });
                    } else {
                        // Insert new license
                        this.db.run(`
                            INSERT INTO license_activation (
                                license_key, device_uuid, mac_address, activation_date,
                                expiration_date, status, package_name, max_devices,
                                features, api_response, last_check_date
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [license_key, device_uuid, mac_address, activation_date,
                            expiration_date, status, package_name, max_devices,
                            features, api_response, last_check_date],
                            function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve({ id: this.lastID, ...data });
                                }
                            });
                    }
                }
            );
        });
    }

    /**
     * Kiểm tra kết nối internet
     * @returns {Promise<boolean>}
     */
    async checkInternetConnection() {
        try {
            await axios.get('https://www.google.com', { timeout: 3000 });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Xóa license khỏi database (khi bị revoke)
     * @param {string} license_key
     * @returns {Promise<Object>}
     */
    async deleteLicense(license_key) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM license_activation WHERE license_key = ?',
                [license_key],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('🗑️  License deleted from database:', license_key);
                        resolve({ success: true, changes: this.changes });
                    }
                }
            );
        });
    }

    /**
     * Xóa TẤT CẢ license khỏi database
     * @returns {Promise<Object>}
     */
    async deleteAllLicenses() {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM license_activation',
                [],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('🗑️  All licenses deleted from database. Rows affected:', this.changes);
                        resolve({ success: true, changes: this.changes });
                    }
                }
            );
        });
    }

    /**
     * Kiểm tra license online với API server
     * @param {string} license_key
     * @param {string} device_uuid
     * @param {string} mac_address
     * @returns {Promise<Object>}
     */
    async checkLicenseOnline(license_key, device_uuid, mac_address) {
        try {
            console.log(' Checking license online...');

            const config = {
                licenseKey: license_key,
                deviceType: 'COMPUTER',
                deviceId: device_uuid,
                deviceInfo: {
                    uuid_desktop: device_uuid,
                    mac_address: mac_address,
                    app_version: require('../../../package.json').version,
                    platform: process.platform
                }
            };

            let requestData = config;
            let headers = {
                'Content-Type': 'application/json'
            };

            if (API_ENCRYPTION_ENABLED) {
                requestData = encryption.encryptPayload(config);
                headers['x-encrypted'] = 'true';
            }

            const response = await axios.post(this.apiUrl, requestData, {
                timeout: 10000,
                headers: headers
            });

            if (response.status === 201 && response.data) {
                let responseData = response.data;
                if (API_ENCRYPTION_ENABLED && response.headers['x-encrypted'] === 'true') {
                    responseData = encryption.decryptPayload(responseData);
                }
                const resultCheck = responseData;

                // Update database với thông tin mới nhất từ server
                await this.saveLicenseToDatabase({
                    license_key: license_key,
                    device_uuid: device_uuid,
                    mac_address: mac_address,
                    activation_date: resultCheck.activatedAt,
                    expiration_date: resultCheck.expiredDate,
                    status: resultCheck.isActive ? 'active' : 'inactive',
                    package_name: resultCheck.packageName || null,
                    max_devices: resultCheck.maxDevices || 1,
                    features: JSON.stringify({
                        ...(resultCheck.features || {}),
                        allowedOptions: resultCheck.features?.default_values?.allowed_options,
                        config_presets: resultCheck.config_presets
                    }),
                    api_response: JSON.stringify(response.data),
                    last_check_date: new Date().toISOString()
                });

                // Đồng bộ dữ liệu license vào bảng config_values (init_config_db)
                const featuresToSync = {
                    ...(resultCheck.features || {}),
                    allowedOptions: resultCheck.features?.default_values?.allowed_options,
                };
                await this._syncLicenseFeaturesToSystemConfig(featuresToSync);

                const now = new Date();
                const expirationDate = new Date(resultCheck.expiredDate);
                const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

                return {
                    success: true,
                    online: true,
                    valid: resultCheck.isActive && daysRemaining > 0,
                    daysRemaining: Math.max(0, daysRemaining),
                    expirationDate: resultCheck.expiredDate,
                    activationDate: resultCheck.activatedAt,
                    packageName: resultCheck.packageName || null,
                    features: {
                        ...(resultCheck.features || {}),
                        config_presets: resultCheck.config_presets
                    },
                    config_presets: resultCheck.config_presets || {},
                    status: resultCheck.isActive ? 'active' : 'inactive',
                    licenseKey: license_key,
                    requireActivation: false
                };
            }

            return {
                success: false,
                online: true,
                error: 'Invalid response from server'
            };

        } catch (error) {
            const status = error.response?.status;
            const friendlyError = this._getFriendlyErrorMessage(error);

            // Xử lý lỗi 400 hoặc 403
            if (status === 400 || status === 403) {
                let errorMessage = '';
                if (Array.isArray(error.response.data?.message)) {
                    errorMessage = error.response.data.message.join(' ');
                } else {
                    errorMessage = error.response.data?.message || error.response.data?.error || '';
                }

                // Kiểm tra nếu license bị revoked hoặc trả về 403 (Forbidden)
                if (status === 403 ||
                    errorMessage.toLowerCase().includes('revoked') ||
                    errorMessage.toLowerCase().includes('thu hồi')) {
                    console.log(`  Access forbidden (${status}) or License revoked during check. Deleting ALL licenses...`);

                    await this.deleteAllLicenses();

                    return {
                        success: false,
                        online: true,
                        revoked: true,
                        error: friendlyError,
                        requireActivation: true
                    };
                }

                if (status === 400) {
                    await this.deleteAllLicenses();
                    console.log('  API validation error (400) during check, database cleared.');
                    return {
                        success: false,
                        online: true,
                        error: friendlyError,
                        requireActivation: true
                    };
                }
            }

            // Lỗi khác (network, timeout, etc.)
            console.error(' Online check error:', error.message);
            return {
                success: false,
                online: false,
                error: friendlyError,
                code: status || 'CHECK_ERROR'
            };
        }
    }

    /**
     * Kiểm tra license offline từ database
     * @param {string} license_key
     * @returns {Promise<Object>}
     */
    async checkLicenseOffline(license_key) {
        return new Promise((resolve, reject) => {
            console.log('💾 Checking license offline (from database)...', license_key);

            this.db.get(
                'SELECT * FROM license_activation WHERE license_key = ? ORDER BY id DESC LIMIT 1',
                [license_key],
                (err, row) => {
                    if (err) {
                        console.log('err: ', err);
                        reject(err);
                        return;
                    }

                    if (!row) {
                        resolve({
                            success: false,
                            online: false,
                            valid: false,
                            error: 'License not found',
                            requireActivation: true
                        });
                        return;
                    }

                    const now = new Date();
                    const expirationDate = new Date(row.expiration_date);
                    const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
                    console.log('daysRemaining: ', daysRemaining);
                    const isValid = daysRemaining > 0 && row.status === 'active';

                    // Update last_check_date
                    this.db.run(
                        'UPDATE license_activation SET last_check_date = datetime(\'now\') WHERE id = ?',
                        [row.id]
                    );

                    resolve({
                        success: true,
                        online: false,
                        valid: isValid,
                        daysRemaining: Math.max(0, daysRemaining),
                        expirationDate: row.expiration_date,
                        activationDate: row.activation_date,
                        packageName: row.package_name,
                        features: row.features ? JSON.parse(row.features) : {},
                        config_presets: row.features ? (JSON.parse(row.features).config_presets || {}) : {},
                        status: row.status,
                        licenseKey: row.license_key,
                        requireActivation: !isValid
                    });
                }
            );
        });
    }

    /**
     * Kiểm tra license còn hạn hay không (DEPRECATED - use checkLicenseWithPriority)
     * @param {string} license_key - License key
     * @returns {Promise<Object>} - { valid, daysRemaining, expirationDate, features }
     */
    async checkLicenseValidity(license_key) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM license_activation WHERE license_key = ? ORDER BY id DESC LIMIT 1',
                [license_key],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!row) {
                        resolve({
                            valid: false,
                            error: 'License not found',
                            requireActivation: true
                        });
                        return;
                    }

                    const now = new Date();
                    const expirationDate = new Date(row.expiration_date);
                    const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

                    const isValid = daysRemaining > 0 && row.status === 'active';

                    // Update last_check_date
                    this.db.run(
                        'UPDATE license_activation SET last_check_date = datetime(\'now\') WHERE id = ?',
                        [row.id]
                    );

                    resolve({
                        valid: isValid,
                        daysRemaining: Math.max(0, daysRemaining),
                        expirationDate: row.expiration_date,
                        activationDate: row.activation_date,
                        packageName: row.package_name,
                        features: row.features ? JSON.parse(row.features) : {},
                        config_presets: row.features ? (JSON.parse(row.features).config_presets || {}) : {},
                        status: row.status,
                        licenseKey: row.license_key
                    });
                }
            );
        });
    }

    /**
     * Kiểm tra license với ưu tiên online, fallback offline
     * @param {string} license_key - License key (optional, nếu không có sẽ lấy từ DB)
     * @returns {Promise<Object>}
     */
    async checkLicenseWithPriority(license_key = null) {
        try {
            // Nếu không có license_key, lấy từ database
            if (!license_key) {
                const currentLicense = await this.getCurrentLicenseFromDB();
                if (!currentLicense) {
                    return {
                        success: false,
                        valid: false,
                        requireActivation: true,
                        message: 'No license found. Please activate your license.'
                    };
                }
                license_key = currentLicense.license_key;
            }

            // Lấy device info
            const uuid_desktop = await getUUID();
            const mac_address = await getMacAddress();

            // Kiểm tra kết nối internet
            const hasInternet = await this.checkInternetConnection();
            console.log('Internet connection:', hasInternet ? 'Available' : 'Not available');

            if (hasInternet) {
                // Ưu tiên kiểm tra online
                const onlineResult = await this.checkLicenseOnline(license_key, uuid_desktop, mac_address);

                if (onlineResult.success) {
                    console.log(' Online check successful');
                    return onlineResult;
                } else if (onlineResult.revoked) {
                    // License bị revoke hoặc access forbidden - đã xóa khỏi database
                    console.log('  License revoked or Access Forbidden by server');
                    return onlineResult;
                } else {
                    // Online check failed (network error, etc.), fallback to offline
                    console.log('  Online check failed (likely network), falling back to offline...');
                    return await this.checkLicenseOffline(license_key);
                }
            } else {
                // Không có internet, kiểm tra offline
                console.log('💾 No internet, checking offline...');
                return await this.checkLicenseOffline(license_key);
            }

        } catch (error) {
            console.error(' License check error:', error.message);

            // Fallback to offline check
            if (license_key) {
                return await this.checkLicenseOffline(license_key);
            }

            return {
                success: false,
                valid: false,
                requireActivation: true,
                error: this._getFriendlyErrorMessage(error)
            };
        }
    }

    /**
     * Lấy license hiện tại từ database (helper function)
     * @returns {Promise<Object|null>}
     */
    async getCurrentLicenseFromDB() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM license_activation ORDER BY id DESC LIMIT 1',
                [],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || null);
                    }
                }
            );
        });
    }

    /**
     * Lấy thông tin license hiện tại (không cần license_key)
     * Sử dụng checkLicenseWithPriority để kiểm tra online/offline
     * @returns {Promise<Object>} - License info
     */
    async getCurrentLicense() {
        try {
            // Sử dụng checkLicenseWithPriority để kiểm tra online/offline
            const result = await this.checkLicenseWithPriority();
            return result;
        } catch (error) {
            console.error(' Get current license error:', error.message);
            return {
                success: false,
                valid: false,
                requireActivation: true,
                error: this._getFriendlyErrorMessage(error)
            };
        }
    }

    /**
     * Deactivate license (local only)
     */
    async deactivateLicense(license_key) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE license_activation SET status = ?, updated_at = datetime(\'now\') WHERE license_key = ?',
                ['inactive', license_key],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true, changes: this.changes });
                    }
                }
            );
        });
    }

    /**
     * Huỷ kích hoạt thiết bị - gọi API DELETE /device-activations/device/:identifier
     * rồi xóa license khỏi local database
     * @param {string} identifier - UUID hoặc deviceId (mac address) của thiết bị
     * @returns {Promise<Object>}
     */
    async revokeDeviceKey(identifier) {
        try {
            console.log('🗑️  Revoking device activation online, identifier:', identifier);

            // Gọi API DELETE lên server online
            const revokeUrl = `${this.revokeBaseUrl}/${identifier}`;
            console.log('Revoke URL:', revokeUrl);

            let onlineRevoked = false;
            let onlineError = null;

            try {
                // Lấy license hiện tại để huỷ nếu có thể
                const currentLicense = await this.getCurrentLicenseFromDB();
                const licenseKey = currentLicense ? currentLicense.license_key : null;

                let response;
                let headers = { 'Content-Type': 'application/json' };

                if (API_ENCRYPTION_ENABLED && licenseKey) {
                    const payload = {
                        licenseKey: licenseKey,
                        deviceId: identifier
                    };
                    const encryptedData = encryption.encryptPayload(payload);
                    headers['x-encrypted'] = 'true';

                    // Với encryption, ta dùng POST cho client/deactivate theo chuẩn server mới
                    response = await axios.post(this.revokeBaseUrl, encryptedData, {
                        timeout: 10000,
                        headers: headers
                    });
                } else {
                    // Fallback hoặc không encryption
                    const revokeUrl = `${this.revokeBaseUrl}/${identifier}`;
                    console.log('Revoke URL:', revokeUrl);
                    response = await axios.delete(revokeUrl, {
                        timeout: 10000,
                        headers: headers
                    });
                }

                console.log('✅ Online revoke response status:', response.status);
                onlineRevoked = true;
            } catch (apiError) {
                console.warn('⚠️  Online revoke failed (will still clear local):', apiError.message);
                onlineError = 'Thông báo: Không thể huỷ kích hoạt license online. Vui lòng huỷ kích hoạt license online thủ công.' // apiError.response?.data?.message || apiError.message;
            }

            // Dù API thành công hay không, luôn xóa local database
            await this.deleteAllLicenses();
            console.log('✅ Local license data cleared');

            return {
                success: true,
                onlineRevoked,
                onlineError,
                message: onlineError || 'License revoked from server and removed from device',
                // message: onlineRevoked
                //     ? 'License revoked from server and removed from device'
                //     : `Local license removed. Server revoke failed: ${onlineError}`
            };
        } catch (error) {
            console.error('❌ revokeDeviceKey error:', error.message);
            // Thử xóa local dù có lỗi
            try { await this.deleteAllLicenses(); } catch (e) { /* ignore */ }
            return {
                success: false,
                error: this._getFriendlyErrorMessage(error),
                code: error.response?.status || 'REVOKE_ERROR'
            };
        }
    }

    /**
     * Đồng bộ các thông tin từ features của License vào bảng config_values (system)
     * @param {Object} features - Đối tượng features từ License Server
     */
    async _syncLicenseFeaturesToSystemConfig(features) {
        if (!features) return;

        try {
            console.log('🔄 Syncing license features to system config...');

            // Map từ Online License Features sang Local Config Child Keys
            const syncMap = {
                'hidden_configs': 'hiddenFields',
                'disabled_configs': 'disabledFields',
                'hidden_groups': 'hiddenGroups',
                'allowed_options': 'allowedOptions',
                'allowedOptions': 'allowedOptions',
                // Module overrides (áp dụng cho VO NHAC/QUYEN/DOI KHANG)
                '/bang-diem/quyen': 'ap_dung_quyen',
                '/bang-diem/vo-nhac': 'ap_dung_vonhac',
                '/bang-diem/doi-khang': 'ap_dung_doikhang'
            };

            const lsDB = await init_config_db.getAllKeyValueByKey('system');

            // Hỗ trợ lookup cả trong object features root và features.default_values + module_overrides
            const flattenedFeatures = {
                ...features,
                ...(features.default_values || {}),
                ...(features.module_overrides || {})
            };

            for (const [onlineKey, localKey] of Object.entries(syncMap)) {
                if (flattenedFeatures[onlineKey] !== undefined) {
                    const value = flattenedFeatures[onlineKey];
                    let finalValue = value;

                    // Chuyển đổi Boolean (từ module_overrides) sang '1'/'0' để lưu DB
                    if (typeof value === 'boolean') {
                        finalValue = value ? '1' : '0';
                    } else if (typeof value === 'object' && value !== null) {
                        // Nếu là object hoặc array thì stringify trước khi lưu
                        finalValue = JSON.stringify(value);
                    } else {
                        finalValue = String(value);
                    }

                    const existingItem = lsDB.find(ele => ele.child_key === localKey);

                    if (existingItem) {
                        console.log(`  Updating ${localKey}:`, finalValue);
                        await init_config_db.updateKeyValueByKey(existingItem.id, {
                            ...existingItem,
                            value: finalValue
                        });
                    } else {
                        console.log(`  Inserting ${localKey}:`, finalValue);
                        await init_config_db.insertKeyValue('system', localKey, finalValue);
                    }
                }
            }

            console.log('✅ License features synced to system config');
        } catch (error) {
            console.error('❌ Error syncing license features to system config:', error.message);
        }
    }
}

const instance = new LicenseService();
module.exports = instance;

