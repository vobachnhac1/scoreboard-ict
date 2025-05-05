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
const athleteController = require('../controllers/athlete.controller');

// Nhập dữ liệu từ file tổng hợp
router.get('/athlete', athleteController.getByChampId);
router.post('/athlete', athleteController.create);
router.put('/athlete/:id', athleteController.update);
router.delete('/athlete/:id', athleteController.delete);

router.get('/bracket/check-bye', athleteController.handleNumPlayerBye )
router.get('/bracket/random', athleteController.randomBracket )

// Màn hình quản lý bốc thăm
router.put('/athlete-random/:id', athleteController.updateRandom);

// Trận đấu
router.put('/ath-match', athleteController.updateAthMatch);
router.get('/ath-match', athleteController.getAthMatch);


module.exports = router