const {getMacAddress, getUUID, getIP} = require('../../config/config')
const init_config_db = require('../init-config')
const encryption = require('../../config/encryption')
const moment = require('moment')
const _ = require('lodash')
class Admin {

    // 1. API lấy thông tin thiết bị  | đã tích hợp
    get_information_device = async ()=>{
        try {
            const uuid_desktop = await getUUID();
            const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
            return {...license_info, active: moment(license_info?.expired_date,'YYYYMMDD').isAfter(moment())}
        } catch (error) {
            console.log('[get_information_device] error: ', error);
            return {active: false}
        }
    }

    // 2. API Kiểm tra Thời gian hiện lực
    check_expired_license = async()=>{
        try {
            const uuid_desktop = await getUUID();
            const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
            if(license_info){
                return {active: moment(license_info?.expired_date,'YYYYMMDD').isAfter(moment())}
            }else{
                return {active: false}
            }
        } catch (error) {
            console.log('error: ', error);
            return {active: false}
        }
    }

    // 3. RES_ROOM_ADMIN thông tin Cấu hình hệ thống
    get_information_system = async () =>{
        try {
            const res_config  = await init_config_db.getAllKeyValueByKey('system');
            let config = {};

            // Danh sách các trường là string (không convert sang number)
            const stringFields = [
                'ten_giai_dau',
                'bo_mon',
                'thoi_gian_bat_dau',
                'thoi_gian_ket_thuc',
                'mo_ta_giai_dau',
                'mon_thi'
            ];

            res_config.forEach(element => {
                // Nếu là string field thì giữ nguyên, còn lại convert sang number
                if (stringFields.includes(element.child_key)) {
                    config[`${element.child_key}`] = element.value;
                } else {
                    config[`${element.child_key}`] = Number(element.value);
                }
            });

            console.log('config: ', config);
            return config
        } catch (error) {
            console.log('[get_information_system] error: ', error);
            return {}
        }
    }

    // 4. Cập nhật thông tin cấu hình hệ thống
    update_information_system = async (body) =>{
        try {
            if(!body) return false

            const lsInput = Object.entries(body).map(([key, value]) => ({
                key,
                value: String(value) // Convert to string để lưu vào database
            }));

            const lsDB = await init_config_db.getAllKeyValueByKey('system');

            for(let i = 0 ; i < lsInput.length; i++){
                const item = lsDB.find(ele=> ele.child_key == lsInput[i].key)

                if(item){
                    // Cập nhật nếu đã tồn tại
                    await init_config_db.updateKeyValueByKey(item.id, {
                        ...item,
                        value: lsInput[i].value
                    })
                } else {
                    // Thêm mới nếu chưa tồn tại
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

    // 5. Tạo QR kích hoạt + kết nối 
    connect_active_device = async (room_id)=>{
        try {
            const uuid_desktop = await getUUID()
            const ip = await getIP()
            const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
            const datetime =  moment().add(300, 'seconds').format('YYYYMMDDHHmmss')
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
    connect_register_device = async (room_id)=>{
        try {
            const uuid_desktop = await getUUID()
            const ip = await getIP()
            const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
            const datetime =  moment().add(300, 'seconds').format('YYYYMMDDHHmmss')
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

    // // ✅ Hàm tạo mã random 10 ký tự
    // randomCode(length = 10) {
    //     return [...Array(length)].map(() =>
    //         Math.floor(Math.random() * 36).toString(36)
    //     ).join('').toUpperCase();
    // }
    

}

const intance = new Admin()
module.exports = intance;