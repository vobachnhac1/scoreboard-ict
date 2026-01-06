const {getMacAddress, getUUID} = require('../../config/config')
const { STATE_ACTIVE } = require('../../constants');

const init_config_db = require('../init-config')

// cho phép hiển thị
const allow = ['thoi_gian_tinh_diem', 'he_diem','cau_hinh_hinh_thuc_quyen', 'cau_hinh_hinh_thuc_doikhang', 'ten_giai_dau', 'mo_ta_giai_dau'];

class Client {
    verify_active = async ( body )=>{
        try {
            const param = {
                device_id: body?.device_id,
                key_license: body?.key_license,
                uuid_desktop: body?.uuid_desktop,
            }
            // TRẠNG THÁI OFFLINE ( KHÔNG KÍCH HOẠT THIẾT BỊ CLIENT)
            // GỌI API KIỂM TRA EXPIRE
            let result = {
                status:  200,
                data: {
                    active: true,
                }
            }
            // insert table license_child - id/key_license/uuid_desktop/device_id/expired_date
            if(result.status == 200){ 
                // kiểm tra trong hệ thống
                const uuid_desktop = await getUUID();
                const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
                const license_child  = await init_config_db.getLicenseChildByConndition(param);
                if(!license_child && license_info){
                    // Thêm mới vinsert_license_child
                    const insert_license_child = await init_config_db.insertLicenseChild({
                        ...param, 
                        expired_date: license_info.expired_date
                    });
                }else if(license_child && license_info){ 
                    // cập nhật update_license_child
                    const update_license_child = await init_config_db.updateLicenseChild(license_child.id,{
                        ...param, 
                        expired_date: license_info.expired_date
                    });
                }
                console.log('body?.key_license: ', license_info);

                return {
                    active: result.data.active,
                    expired_date: license_info.expired_date,
                    license_key: license_info?.key_license,
                    active_status_code: STATE_ACTIVE.ACT.code,
                    active_status_name: STATE_ACTIVE.ACT.name,
                }
            }
            return {
                active: false,
                expired_date: '',
                license_key: body?.license_key,
                active_status_code: STATE_ACTIVE.EXP.code,
                active_status_name: STATE_ACTIVE.EXP.name,
            }
        } catch (error) {
            console.log('[connect_register_device] error: ', error);
            return {
                active: false,
                expired_date: '',
                license_key: body?.license_key,
                active_status_code: STATE_ACTIVE.NOT_ACT.code,
                active_status_name: STATE_ACTIVE.NOT_ACT.name,
            }
        }
    }

    register_referrer = async (body)=>{
        try {
            const param = {
                device_id:      body?.device_id,
                key_license:    body?.key_license,
                uuid_desktop:   body?.uuid_desktop,
            }
            // 1. kiểm tra key_license / device_id /uuid_desktop => nếu không tồn tại báo lỗi | thành công
            const uuid_desktop = await getUUID();
            const license_info = await init_config_db.getConfigByUUID(uuid_desktop);
            if(license_info.uuid_desktop != body?.uuid_desktop || license_info.key_license!= license_info?.key_license ){
                return false
            }
            const license_child  = await init_config_db.getLicenseChildByConndition(param);
            if(!license_child) return false
            return true
        } catch (error) {
            return false
        }
    }

    get_config_system = async ()=>{
        try {
            const res_config  = await init_config_db.getAllKeyValueByKey('system');
            // Danh sách các trường là string (không convert sang number)
            const stringFields = [
                'ten_giai_dau',
                'mo_ta_giai_dau'
            ];
            let config = {};
            res_config.filter((ele)=> allow.includes(ele.child_key)).forEach(element => {
                // Nếu là string field thì giữ nguyên, còn lại convert sang number
                if (stringFields.includes(element.child_key)) {
                    config[`${element.child_key}`] = element.value;
                } else {
                    config[`${element.child_key}`] = Number(element.value);
                }
            });
            return config
        } catch (error) {
            console.log('[get_information_system] error: ', error);
            return {}
        }
    }
}
const instances = new Client()
module.exports = instances;
