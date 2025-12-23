const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competition.controller');

// API quản lý Competition DK
router.get('/competition-dk', competitionController.getAllCompetitionDK);
router.get('/competition-dk/:id', competitionController.getCompetitionDKById);
router.post('/competition-dk', competitionController.insertCompetitionDK);
router.put('/competition-dk/:id', competitionController.updateCompetitionDK);
router.delete('/competition-dk/:id', competitionController.deleteCompetitionDK);

module.exports = router;

