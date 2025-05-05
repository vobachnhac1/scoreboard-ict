const express = require('express');
const moment = require('moment');
const router = express.Router();
const CommonController = require('../controllers/common.controller');

// Cấu hình Multer lưu file tạm vào bộ nhớ RAM
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// ĐƠN VỊ THAM GIA
router.post('/teams', CommonController.insertTeam);
router.put('/teams/:id', CommonController.updateTeam);
router.delete('/teams/:id', CommonController.deleteTeam);
router.get('/teams', CommonController.getAllTeamsByTournament);
router.get('/teams/search', CommonController.searchTeamsByDisplayName);


// GIÁM ĐỊNH/TRỌNG TÀI THAM GIA
router.post('/referees', CommonController.insertReferee);
router.put('/referees/:id', CommonController.updateReferee);
router.delete('/referees/:id', CommonController.deleteReferee);
router.get('/referees', CommonController.getAllReferees);
router.get('/referees/search', CommonController.searchReferees);

// Quản lý Giám định/Trọng tài
// vhd_mau_team_02: Đơn vị tham gia
// vhd_mau_ref_01: Trọng tài/Giám định
// vhd_mau_02: VĐV Quyền


// export tệp Giám định/Trọng tài
router.post('/referees/export', CommonController.exportFileSampleReferee);
router.post('/referees/import', upload.single('vhd_mau_ref_01'), CommonController.importFileReferee);

// export tệp Đơn vị
router.post('/teams/export', CommonController.exportFileSampleTeams);
router.post('/teams/import', upload.single('vhd_mau_team_02'), CommonController.importFileTeams);



module.exports = router
