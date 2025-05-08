const express = require('express');
const moment = require('moment');
const router = express.Router();

// Cấu hình Multer lưu file tạm vào bộ nhớ RAM
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// tầng controller
const championController = require('../controllers/champion.controller');


// Thực hiện routes 
// keysearch

// 1. Quản lý giải đấu
router.get('/champion', championController.getAllChampion);
router.post('/champion', championController.insertChampion);
router.put('/champion/:id', championController.updateChampion);
router.delete('/champion/:id', championController.deleteChampion);


// 2. Quản lý nhóm thi đấu
router.get('/champion-grp', championController.getChampionGroup);
router.post('/champion-grp', championController.createChampionGroup);
router.put('/champion-grp/:id', championController.updateChampionGroup);
router.delete('/champion-grp/:id', championController.deleteChampionGroup);
//-- add new get by champ_id and get detail
router.get('/champion-grp/detail', championController.getChampionGroupById);
router.get('/champion-grp/:champ_id', championController.getChampionGroupsByChampion);
 

//3. API quản lý hình thức thi
router.get('/champion-category', championController.getAllChampionCategory);
router.post('/champion-category', championController.insertChampionCategory);
router.put('/champion-category/:id', championController.updateChampionCaterory);
router.delete('/champion-category/:id', championController.deleteChampionCaterory);

//4. API quản lý nội dung thi theo hình thúc
router.get('/champion-event', championController.getEvent);
router.get('/champion-event/:category_key', championController.getEventByCategory);
router.post('/champion-event', championController.createEvent);
router.put('/champion-event/:id', championController.updateEvent);
router.delete('/champion-event/:id', championController.deleteEvent);



//5. API quản lý nội dung thi theo Mục 4.
router.get('/champion-grp-event', championController.getGrpEvent);
router.post('/champion-grp-event', championController.createGrpEvent);
router.put('/champion-grp-event/:id', championController.updateGrpEvent);
router.delete('/champion-grp-event/:id', championController.deleteGrpEvent);

router.get('/champion-grp-event/search', championController.getGrpEvtSearch);

// Xuất File mẫu
router.post('/champion/export', championController.exportFileChampion);


// Nhập dữ liệu từ file tổng hợp
router.post('/champion/import', upload.single('vhd_mau_01'),  championController.importFileChampion);


module.exports = router