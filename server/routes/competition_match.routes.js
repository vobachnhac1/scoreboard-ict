const express = require('express');
const router = express.Router();
const competitionMatchController = require('../controllers/competition_match.controller');

// API quản lý Competition Match
router.post('/competition-match/bulk', competitionMatchController.bulkCreateMatches); // Phải đặt trước /competition-match/:id
router.post('/competition-match', competitionMatchController.createMatch);
router.get('/competition-match/:id', competitionMatchController.getMatchById);
router.get('/competition-match/by-dk/:competition_dk_id', competitionMatchController.getMatchesByCompetitionDKId);
router.put('/competition-match/:id/status', competitionMatchController.updateMatchStatus);
router.put('/competition-match/:id/winner', competitionMatchController.updateWinner);
router.put('/competition-match/:id/config', competitionMatchController.updateConfigSystem);
router.post('/competition-match/:id/history', competitionMatchController.addHistory);
router.get('/competition-match/:id/history', competitionMatchController.getHistory);
router.delete('/competition-match/:id', competitionMatchController.deleteMatch);

module.exports = router;

