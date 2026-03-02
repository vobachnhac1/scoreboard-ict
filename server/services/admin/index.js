const { getMacAddress, getUUID, getIP } = require('../../config/config')
const init_config_db = require('../init-config')
const licenseService = require('../license/license.service')
const encryption = require('../../config/encryption')
const moment = require('moment')
const _ = require('lodash')
class Admin {

    // 1. API lấy thông tin thiết bị  | đã tích hợp
    get_information_device = async () => {
        try {
            // Sử dụng licenseService (bảng license_activation mới) để đồng bộ
            const licenseInfo = await licenseService.getCurrentLicense();
            return licenseInfo;
        } catch (error) {
            console.log('[get_information_device] error: ', error);
            return { active: false, valid: false, requireActivation: true }
        }
    }

    // 2. API Kiểm tra Thời gian hiện lực
    check_expired_license = async () => {
        try {
            // Sử dụng licenseService (bảng license_activation mới) để đồng bộ
            const result = await licenseService.getCurrentLicense();
            return { active: result.valid === true };
        } catch (error) {
            console.log('[check_expired_license] error: ', error);
            return { active: false }
        }
    }

    // 3. RES_ROOM_ADMIN thông tin Quản lý cài đặt
    get_information_system = async () => {
        try {
            const res_config = await init_config_db.getAllKeyValueByKey('system');
            let config = {};

            // Danh sách các trường là string (không convert sang number)
            const stringFields = [
                'ten_giai_dau',
                'bo_mon',
                'thoi_gian_bat_dau',
                'thoi_gian_ket_thuc',
                'mo_ta_giai_dau',
                'mon_thi',
                'keyboard_mode',
                // Background fields
                'bg_quyen_type',
                'bg_quyen_color',
                'bg_quyen_image',
                'bg_doikhang_type',
                'bg_doikhang_color',
                'bg_doikhang_image',
                'bg_vonhac_type',
                'bg_vonhac_color',
                'bg_vonhac_image',
                // Header colors
                'header_title_color_quyen',
                'header_desc_color_quyen',
                'header_title_color_doikhang',
                'header_desc_color_doikhang',
                'header_title_color_vonhac',
                'header_desc_color_vonhac'
            ];

            // Các trường đặc biệt cần parse JSON (mảng hoặc object)
            const jsonFields = [
                'hiddenFields',
                'hiddenGroups',
                'allowedOptions'
            ];

            res_config.forEach(element => {
                const key = element.child_key;
                const value = element.value;

                if (jsonFields.includes(key)) {
                    try {
                        config[key] = JSON.parse(value);
                    } catch (e) {
                        config[key] = value; // Fallback nếu không phải JSON
                    }
                } else if (stringFields.includes(key)) {
                    config[key] = value;
                } else {
                    // Mặc định convert sang number, fallback về string nế NaN
                    const num = Number(value);
                    config[key] = isNaN(num) ? value : num;
                }
            });

            console.log('config: ', config);
            return config
        } catch (error) {
            console.log('[get_information_system] error: ', error);
            return {}
        }
    }

    // 4. Cập nhật thông tin Quản lý cài đặt
    update_information_system = async (body) => {
        try {
            if (!body) return false

            const lsInput = Object.entries(body).map(([key, value]) => {
                let finalValue = value;
                // Nếu là object hoặc array thì stringify trước khi lưu
                if (typeof value === 'object' && value !== null) {
                    finalValue = JSON.stringify(value);
                }
                return {
                    key,
                    value: String(finalValue)
                };
            });

            const lsDB = await init_config_db.getAllKeyValueByKey('system');

            for (let i = 0; i < lsInput.length; i++) {
                const item = lsDB.find(ele => ele.child_key == lsInput[i].key)

                if (item) {
                    await init_config_db.updateKeyValueByKey(item.id, {
                        ...item,
                        value: lsInput[i].value
                    })
                } else {
                    console.log(`[update_information_system] Thêm mới field: ${lsInput[i].key}`);
                    await init_config_db.insertKeyValue('system', lsInput[i].key, lsInput[i].value);
                }
            }

            return true;
        } catch (error) {
            console.log('[update_information_system] error: ', error);
            return false;
        }
    }

    // 4.5. Tự tạo initconfig mặc định nếu chưa có (dùng cho QR generation)
    ensureInitConfig = async () => {
        try {
            const uuid_desktop = await getUUID();
            const mac = getMacAddress() || ('LOCAL-' + uuid_desktop);

            let license_info = await init_config_db.getConfigByUUID(uuid_desktop);

            // Lấy key_license từ bảng license_activation mới nếu có
            let key_license = 'FREE-' + uuid_desktop;
            try {
                const activatedLicense = await licenseService.getCurrentLicenseFromDB();
                if (activatedLicense?.license_key) {
                    key_license = activatedLicense.license_key;
                    console.log('[ensureInitConfig] Dùng license_key từ license_activation:', key_license);
                }
            } catch (e) { /* bỏ qua - dùng FREE */ }

            if (!license_info) {
                console.log('[ensureInitConfig] Chưa có initconfig, tự động tạo mặc định cho uuid:', uuid_desktop);
                const expired_date = moment().add(30, 'days').format('YYYYMMDD');
                const active_date = moment().format('YYYYMMDD');

                await init_config_db.insertConfig({
                    uuid_desktop,
                    mac_address: mac,
                    key_license,
                    total_device_desktop: 1,
                    total_device_app: 5,
                    use_desktop: 0,
                    use_app: 0,
                    expired_date,
                    active_date,
                    promotion_code: 'FREE',
                });
                license_info = await init_config_db.getConfigByUUID(uuid_desktop);
                console.log('[ensureInitConfig] Đã tạo initconfig mặc định:', license_info);
            } else if (license_info.key_license !== key_license && !key_license.startsWith('FREE-')) {
                // Cập nhật key_license nếu mới khác với trong initconfig
                console.log('[ensureInitConfig] Cập nhật key_license mới:', key_license);
                await init_config_db.updateConfig(uuid_desktop, { ...license_info, key_license });
                license_info = await init_config_db.getConfigByUUID(uuid_desktop);
            }

            return license_info;
        } catch (error) {
            console.log('[ensureInitConfig] error: ', error);
            return null;
        }
    }

    // 5. Tạo QR kích hoạt + kết nối 
    connect_active_device = async (room_id) => {
        try {
            const uuid_desktop = await getUUID()
            const ip = await getIP()

            // Tự động tạo initconfig nếu chưa có
            const license_info = await this.ensureInitConfig();

            if (!license_info) {
                console.warn('[connect_active_device] Không thể lấy hoặc tạo license info.');
                return null;
            }

            const datetime = moment().add(300, 'seconds').format('YYYYMMDDHHmmss')
            const data = {
                expired_datetime: datetime,
                register_connect: false,
                domain: ip,
                port: 6789,
                room_id: room_id,
                uuid_desktop: license_info.uuid_desktop,
                key_license: license_info.key_license,
            };
            console.log('[connect_active_device] data: ', data);
            const base64QR = await encryption.generateQR(data)
            return {
                base64QR: base64QR,
                expire: 300
            }
        } catch (error) {
            console.log('[connect_active_device] error: ', error);
            return null
        }
    }

    // 6. Tạo QR đăng ký Giám định + kết nối 
    connect_register_device = async (room_id) => {
        try {
            const uuid_desktop = await getUUID()
            const ip = await getIP()

            // Tự động tạo initconfig nếu chưa có
            const license_info = await this.ensureInitConfig();

            if (!license_info) {
                console.warn('[connect_register_device] Không thể lấy hoặc tạo license info.');
                return null;
            }

            const datetime = moment().add(300, 'seconds').format('YYYYMMDDHHmmss')
            const data = {
                expired_datetime: datetime,
                register_connect: true,
                referrer: 0,
                domain: ip,
                port: 6789,
                room_id: room_id,
                uuid_desktop: license_info.uuid_desktop,
                key_license: license_info.key_license,
            };
            console.log('[connect_register_device] data: ', data);
            const base64QR = await encryption.generateQR(data)
            return {
                base64QR: base64QR,
                expire: 300
            }
        } catch (error) {
            console.log('[connect_register_device] error: ', error);
            return null
        }
    }

    // ------------- CLIENT ----------------//
    // Kiểm tra license key nếu có
    // verify_license_key = async (body)=>{
    //     const uuid_desktop = await getUUID();
    //     const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
    //     console.log('license_info: ', license_info);
    //     const data = {
    //         uuid_desktop: license_info.uuid_desktop, 
    //         key_license: license_info.key_license, 
    //     };
    //     return license_info ?? data;
    // }

    // // lấy thông cấu hình thi đấu
    // get_system_config =(req, res)=>{}

    // // lấy thông tin Giải đấu
    // get_system_config =(req, res)=>{}

    // // upload danh sách VDV
    // upload_list_member =(req, res)=>{}

    // // upload danh sách Giám định
    // upload_list_referrer =(req, res)=>{}

    // // upload danh sách Nội dung thi quyền
    // upload_list_content_show =(req, res)=>{}

    // // upload danh sách Nội dung thi đối kháng
    // upload_list_content_competition =(req, res)=>{}

    // // ------ SAU CẤU HÌNH ------ //
    // get_list_competition =(req, res)=>{}
    // get_list_show =(req, res)=>{}

    // // Lưu kết quả trận đấu/thi quyền
    // save_result_competition =(req, res)=>{}
    // save_result_show =(req, res)=>{}

    // // lưu log của GĐ
    // save_log_referrer_by_competition =(req, res)=>{}
    // save_log_referrer_by_show =(req, res)=>{}

    // // API tạo mã QR kích hoạt (key_license)
    // generateQRActiveDevice = async () =>{
    //     const license_info = await init_config_db.getConfigByMacaddress(mac_address);
    //     const data = {
    //         mac_address: license_info.mac_address, 
    //         key_license: license_info.key_license, 
    //     };
    //     const base64QR = await encryption.generateQR(data)
    //     return base64QR
    // }

    // // API tạo mã Đăng ký giám định (key_license, room_id, referrer)
    // generateQRRegisterReferrer = async(body) =>{
    //     // mặc định là hợp lệ license đang hiệu lực
    //     // gọi service lấy license
    //     const mac_address = getMacAddress()
    //     const license_info = await init_config_db.getConfigByMacaddress(mac_address);
    //     const data = {
    //         room_id: license_info.room_code,
    //         mac_address: license_info.mac_address, 
    //         key_license: license_info.key_license, 
    //     };
    //     const base64QR = await encryption.generateQR(data)
    //     return base64QR
    // }

    // //  Hàm tạo mã random 10 ký tự
    // randomCode(length = 10) {
    //     return [...Array(length)].map(() =>
    //         Math.floor(Math.random() * 36).toString(36)
    //     ).join('').toUpperCase();
    // }


}

const intance = new Admin()
module.exports = intance;