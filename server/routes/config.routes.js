const {getMacAddress} = require('../config/config');
const express = require('express');
const moment = require('moment');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const ClientController = require('../controllers/client.controller');
const CommonController = require('../controllers/common.controller');
const LogoController = require('../controllers/logo.controller');
const init_config_db = require('../services/init-config');


checkLicense = async (req, res) =>{
    // API server cloud để lấy license
    try {
        const key_license = req?.body?.key_license;
        console.log('key_license: ', key_license);
        if(!key_license) {
            return res.status(400).json({message: 'Key license is required'});
        }
        const uuid_desktop = await getUUID();
        // console.log('macAddress: ', macAddress);
        // let config_db = new ConfigApplicationService();
        // kiểm tra có internet không -> có gọi API kiểm tả online
        const paramSend = {
          uuid_desktop : uuid_desktop,
          key_license: key_license
        }
        // gọi API Check
        const result_online = {
            status: 200,
            data: {
                is_valid: true,
                expried_date: moment().valueOf()
            }
        }
        // kêt quả
        let license_db = await init_config_db.getConfigByUUID(uuid_desktop);
        if(result_online.status == 200 && result_online.data.is_valid){
            // kiểm tra db
            let record = await init_config_db.getAllConfig()
            console.log('record: ', record);
            if(record?.length > 0){
                // cập nhật
                record[0].key_license = key_license
                console.log('Cập nhật record: ', record);

                const update = await init_config_db.updateConfig(uuid_desktop, record[0])
                console.log('update: ', update);
                
            }else {
                // thêm mới
                console.log('Thêm mới record: ', record);
                const insert = await init_config_db.insertConfig({
                  mac_address: mac_address,
                  uuid_desktop: uuid_desktop,
                  key_license: key_license,
                  total_device_desktop: 0,
                  total_device_app: 0,
                  use_desktop: 0,
                  use_app: 0,
                  expired_date: '20251231',
                  active_date: '20250101',
                  promotion_code: 'FREE',
                  room_code: 'Y6HV700K90'
                })
                console.log('insert: ', insert);
            }
            // Fo
            let fetch = await init_config_db.getConfigByLicense(key_license)
            console.log('fetch: ', fetch);
            
            return res.status(200).json({room_id: fetch?.room_code})
        }else {
            // Thông báo lỗi
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Bản quyền không hợp lệ. Vui lòng liên hệ nhà cung cấp."
            })
        }
        // kiểm tra có database không -> không thì insert (khi gọi API online thành công)
        // Nếu API offline + Không có trong có trong Database => yêu cầu mở internet để kíck hoạt thiết bị
        return res.status(200).json()
    }
    catch (error) {
        console.log('error: ', error);
        return res.status(500).json({message: 'Internal server error'});
    }
}


// Cấu hình Multer lưu file tạm vào bộ nhớ RAM
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/check-license', checkLicense);

router.post('/get-information', AdminController.getDevicesInformation);
router.post('/check-expired-time', AdminController.checkExpiredLicense);
router.post('/get-config-system', AdminController.getInformationSystem);
router.post('/update-config-system', AdminController.updateInformationSystem);
router.get('/get-qr-active', AdminController.getQRActiveDevice);
router.get('/get-qr-register', AdminController.getQRRegisterReferrer);

// Logo Management Routes
router.get('/logos', LogoController.getAllLogos);
router.post('/logos', LogoController.createLogo);
router.post('/logos/upload', LogoController.uploadMiddleware, LogoController.uploadLogo);
router.put('/logos/:id', LogoController.updateLogo);
router.delete('/logos/:id', LogoController.deleteLogo);
router.put('/logos/reorder', LogoController.reorderLogos);



// Client
router.post('/client/check-active', ClientController.clientCheckActive);
router.post('/client/register-referrer', ClientController.clientRegisterReferrer);
router.post('/client/get-config-system', ClientController.getInformationSystem);

// 🧩 API POST /generate-qr
router.post('/generate-qr-', async (req, res) => {
    try {
    //   const data = req.body;
    //   if (!data || typeof data !== 'object') {
    //     return res.status(400).json({ error: 'Invalid JSON body' });
    //   }
    //   const encrypted = encryptObject(data);
    //   const qrBase64 = await QRCode.toDataURL(encrypted);
        const qrBase64 = await Admin.generateQRRegisterReferrer();
        res.json({ success:true, message: "Thực hiện thành công", data: qrBase64 });
    } catch (err) {
      console.error('❌ Error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
module.exports = router