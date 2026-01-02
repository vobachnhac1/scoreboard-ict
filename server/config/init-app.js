
const init_config_db = require('../services/init-config');
// const db_champion = require('../services/init-config/db_champion');
// const db_common = require('../services/common/db_common');
// const db_category = require('../services/common/db_champion_group');
const { getMacAddress, getUUID } = require('./config');

const axios = require('axios');
const moment = require('moment');
const admin = require('./../services/admin');

const checkInternet =async()=>{
    try {
        const rs = await axios.get('https://www.google.com');
        console.log("✅ Có Internet");
        return true
    } catch (error) {
        console.log("❌ Không có Internet");
        return false
    }
}

const FetchInitApp = async  ()=>{
    // Gọi API Check Version
    let insert = {}
    
    // thực hiện lấy dữ liệu từ sqllite3
    // const init_config_db = new InitConfigService();
    const list_license = await init_config_db.getAllConfig();
    const mac_address =  getMacAddress()
    const uuid_desktop = await getUUID()
    let license = false;

    if(list_license.length == 0){
        insert = {
            mac_address: mac_address, 
            uuid_desktop: uuid_desktop, 
            key_license: "", 
            total_device_desktop: 0, 
            total_device_app: 0, 
            use_desktop: 0, 
            use_app: 0, 
            expired_date:'20261231' , 
            active_date: '20250101', 
            promotion_code: 'FREE',
        }
        const rs = await init_config_db.insertConfig(insert);
        const current_date = moment();
        const expired_date = moment(insert.expired_date,'YYYYMMDD');
        if (current_date.isAfter(expired_date)) {
            console.log("❌ Thông báo: Bản dùng thử đã hết hạn");
        }else{
            license = true;
        }
    }else{
        // kiểm tra thời gian có hết hạn chưa
        if(!await checkInternet()){
            // gọi API check Version || trường hợp đã tồn tại mới gọi API check nếu có internet
            console.log("✅ Gọi API Check Version");
            const result = {
                status: 200,
                data:  {
                    mac_address: 'ac:de:48:00:11:22', 
                    uuid_desktop: 'CO2GJ74NMD6M', 
                    key_license: "c5646d69-fca8-4934-89a7-093dfeb8fc7c", 
                    total_device_desktop: 10, 
                    total_device_app: 10, 
                    use_desktop: 0, 
                    use_app: 0, 
                    expired_date:'20251231', 
                    active_date: '20250101', 
                    promotion_code: 'FREE'
                }
            }
            if(result.status == 200){
                console.log("✅ Check Version: thành công");
                insert = result.data
                // Cập nhật lại thông tin mới nhất
                const update = await init_config_db.updateConfig(mac_address, insert);
                const current_date = moment();
                const expired_date = moment(update.expired_date,'YYYYMMDD');
                if (current_date.isAfter(expired_date)) {
                    console.log("❌ Đã hết hạn: Sau khi gọi API checkversion");
                }else{
                    license = true;
                }
            }else {
                // Ngắt kết nối luôn
                console.log('API lỗi: Check version ứng dụng lỗi');
                license = false
            }
        }else {
            // kiểm tra hạn 
            const record = list_license.find(ele=>ele.mac_address == mac_address || ele.uuid_desktop == uuid_desktop )
            // console.log('mac_address: ', mac_address);
            // console.log('list_license: ', list_license);
            // console.log('record: ', record);
            const current_date = moment();
            const expired_date = moment(record.expired_date,'YYYYMMDD');
            if (current_date.isAfter(expired_date)) {
                console.log("❌ Đã hết hạn: Tình trạng offine");
            }else{
                license = true
            }
        }
    }
    // Khi hợp lệ thì tạo ra bộ cấu hình cho ứng dụng
    // Cấu hình:
    /**
     * Giải đấu: ten_giai, thoi_gian_bat_dau, thoi_gian_ket_thuc, dia_diem_thi, logo
     * Hệ thống: so_giam_dinh, so_hiep, doi_khang, thi_quyen, 
     *  cau_hinh_lay_diem_thap, (Nếu nhảy điểm  1 và 2 sẽ lấy điểm 1)
     *  thoi_gian_nhay_diem, 
     *  thoi_gian_hiep, thoi_gian_hiep_phu, 
     *  thoi_gian_nghi_giua_hiep, thoi_gian_y_te,
     *  quyen_tinh_tong (cộng tổng không bỏ điểm cao nhất)
     *  
     * 
     * Quản lý: danh sách vdv thi đối kháng/quyền
     * Quản lý thiết bị kết nối
     * 
     */
    const state_init ={
        license: license,
        system: false,
        competition: false,
    }
    const list_config_system = await init_config_db.getAllKeyValueByKey('system');
    if(list_config_system.length > 0){
        state_init.system = true
    }
    const list_competition_system   = await init_config_db.getAllKeyValueByKey('competition');
    if(list_competition_system.length > 0){
        state_init.competition = true
    }
    console.log('list_license: ', list_license.length);
    console.log('list_config_system: ', list_config_system.length);
    console.log('list_competition_system: ', list_competition_system.length);
    console.log('state_init: ', state_init);


    // admin.generateQRRegisterReferrer()

}


module.exports = {
    FetchInitApp: FetchInitApp
}