const {getMacAddress} = require('../config/config');
const express = require('express');
const axios = require('axios');
const moment = require('moment');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const ClientController = require('../controllers/client.controller');
const LogoController = require('../controllers/logo.controller');
const init_config_db = require('../services/init-config');

const dns = require("dns");
checkInternet = async ()=> {
  return new Promise((resolve) => {
    dns.lookup("google.com", (err) => {
      if (err) {
        resolve(false); // không có internet
      } else {
        resolve(true); // có internet
      }
    });
  });
}

// const DOMAIN_ADMIN = 'http://103.147.123.95:6868/admin-check-license';
// const DOMAIN_CLIENT = 'http://103.147.123.95:6868/client-check-license';

// checkLicenseAdmin = async (req, res) =>{
//     // API server cloud để lấy license
//     try {
//         const key_license = req?.body?.key_license;
//         if(!key_license) {
//             return res.status(400).json({message: 'Key license is required'});
//         }
//         const uuid_desktop = await getUUID();
//         // console.log('macAddress: ', macAddress);
//         // let config_db = new ConfigApplicationService();
//         // kiểm tra có internet không -> có gọi API kiểm tả online
    
//         // kiểm tra kết nối internet 
//         const check_internet = await checkInternet();
//         if(!check_internet){
//             // kiểm tra trong database
//             const license_db = await init_config_db.getConfigByLicense(key_license);    
//             // kiểm tra expired 
//             const current_date = moment();
//             const expired_date = moment(license_db.expired_date,'YYYYMMDD');
//             if (current_date.isAfter(expired_date)) {
//                 return res.status(400).json({message: 'Bản quyền đã hết hạn'});
//             }
//             if(license_db){
//                 return res.status(200).json({room_id: license_db?.room_code})
//             }
//             return res.status(400).json({message: 'Thiết bị chưa được kích hoạt. Vui lòng liên hệ nhà cung cấp.'});
//         }
//         const paramSend = {
//           uuid_desktop : uuid_desktop,
//           key_license: key_license
//         }
//         const result_online = await axios.post(DOMAIN_ADMIN, paramSend);
//         // kêt quả
//         let license_db = await init_config_db.getConfigByUUID(uuid_desktop);
//         if(result_online.status == 200 && result_online.data.data.is_valid){
//             // kiểm tra db
//             let record = await init_config_db.getAllConfig()
//             if(record?.length > 0){
//                 // cập nhật
//                 record[0].key_license = key_license
//                 record[0].expired_date = result_online.data.data.expried_date
//                 const update = await init_config_db.updateConfig(uuid_desktop, record[0])                
//             }else {
//                 // thêm mới
//                 const insert = await init_config_db.insertConfig({
//                   mac_address: mac_address,
//                   uuid_desktop: uuid_desktop,
//                   key_license: key_license,
//                   total_device_desktop: 0,
//                   total_device_app: 0,
//                   use_desktop: 0,
//                   use_app: 0,
//                   expired_date: '20261231',
//                   active_date: '20260101',
//                   promotion_code: 'FREE',
//                   room_code: 'FE5MPI1I3U'
//                 })
//             }
//             // Fo
//             let fetch = await init_config_db.getConfigByLicense(key_license)            
//             return res.status(200).json({room_id: fetch?.room_code})
//         }else { 
//             console.log('Bản quyền không hợp lệ');
//             // Xoá trong database
//             const delete_license = await init_config_db.deleteConfig(uuid_desktop);
//             // Thông báo lỗi
//             return res.status(400).json({
//                 success: false,
//                 status: 400,
//                 message: "Phiên bản không hợp lệ. Vui lòng liên hệ nhà cung cấp."
//             })
//         }
//         // kiểm tra có database không -> không thì insert (khi gọi API online thành công)
//         // Nếu API offline + Không có trong có trong Database => yêu cầu mở internet để kíck hoạt thiết bị
//         return res.status(200).json()
//     }
//     catch (error) {
//         console.log('error: ', error);
//         return res.status(500).json({message: 'Internal server error'});
//     }
// }


// checkLicenseClient = async (req, res) =>{
//     // API server cloud để lấy license
//     try {
//         const {mac_address, key_license }  = req?.body?.key_license;
//         if(!key_license || !mac_address) {
//             return res.status(400).json({message: 'Key license is required'});
//         }
//         // console.log('macAddress: ', macAddress);
//         // let config_db = new ConfigApplicationService();
//         // kiểm tra có internet không -> có gọi API kiểm tả online
    
//          // kiểm tra kết nối internet 
//         const check_internet = await checkInternet();
//         if(!check_internet){
//             // kiểm tra trong database
//             const license_db = await init_config_db.getConfigByLicense(key_license);    
//             // kiểm tra expired 
//             const current_date = moment();
//             const expired_date = moment(license_db.expired_date,'YYYYMMDD');
//             if (current_date.isAfter(expired_date)) {
//                 return res.status(400).json({message: 'Bản quyền đã hết hạn. Vui lòng liên hệ nhà cung cấp.'});
//             }
//             if(license_db){
//                 return res.status(200).json({room_id: license_db?.room_code})
//             }

//             return res.status(400).json({message: 'Thiết bị chưa được kích hoạt. Vui lòng liên hệ nhà cung cấp.'});
//         }
//         const uuid_desktop = await getUUID();
//         const paramSend = {
//           uuid_desktop : uuid_desktop,
//           mac_address : mac_address,
//           key_license: key_license
//         }
//         const result_online = await axios.post(DOMAIN_ADMIN, paramSend);
//         // kêt quả
//         let license_db = await init_config_db.getConfigByUUID(uuid_desktop);
//         if(result_online.status == 200 && result_online.data.data.is_valid){
//             // kiểm tra db
//             let record = await init_config_db.getAllConfig()
//             if(record?.length > 0){
//                 // cập nhật
//                 record[0].key_license = key_license
//                 record[0].expired_date = result_online.data.data.expried_date
//                 const update = await init_config_db.updateConfig(uuid_desktop, record[0])                
//             }else {
//                 // thêm mới
//                 const insert = await init_config_db.insertConfig({
//                   mac_address: mac_address,
//                   uuid_desktop: uuid_desktop,
//                   key_license: key_license,
//                   total_device_desktop: 0,
//                   total_device_app: 0,
//                   use_desktop: 0,
//                   use_app: 0,
//                   expired_date: '20261231',
//                   active_date: '20250101',
//                   promotion_code: 'FREE',
//                   room_code: 'FE5MPI1I3U'
//                 })
//             }
//             // Fo
//             let fetch = await init_config_db.getConfigByLicense(key_license)            
//             return res.status(200).json({room_id: fetch?.room_code})
//         }else {
//             console.log('Bản quyền không hợp lệ');
//             // Xoá trong database
//             const delete_license = await init_config_db.deleteConfig(uuid_desktop);
//             // Thông báo lỗi
//             return res.status(400).json({
//                 success: false,
//                 status: 400,
//                 message: "Phiên bản không hợp lệ. Vui lòng liên hệ nhà cung cấp."
//             })
//         }
//         // kiểm tra có database không -> không thì insert (khi gọi API online thành công)
//         // Nếu API offline + Không có trong có trong Database => yêu cầu mở internet để kíck hoạt thiết bị
//         return res.status(200).json()
//     }
//     catch (error) {
//         console.log('error: ', error);
//         return res.status(500).json({message: 'Internal server error'});
//     }
// }

// Cấu hình Multer lưu file tạm vào bộ nhớ RAM
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API kiểm tra license key
// router.post('/check-license', checkLicenseAdmin);
// router.post('/check-license-client', checkLicenseClient);


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
router.delete('/logos/:id', LogoController.deleteLogo);
router.put('/logos/reorder', LogoController.reorderLogos);
router.put('/logos/:id', LogoController.updateLogo);

// Background Image Upload Route
router.post('/upload/background', LogoController.backgroundUploadMiddleware, LogoController.uploadBackgroundImage);



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
      console.error(' Error:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
module.exports = router