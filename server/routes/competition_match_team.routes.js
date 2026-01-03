const express = require('express');
const router = express.Router();
const competitionMatchTeamController = require('../controllers/competition_match_team.controller');

// API quản lý Competition Match Team (SOL/TUV/DAL/DOL/ORTHER)
router.post('/competition-match-team/bulk', competitionMatchTeamController.bulkCreateTeams); // Phải đặt trước /competition-match-team/:id
router.post('/competition-match-team', competitionMatchTeamController.createTeam);
router.get('/competition-match-team/:id', competitionMatchTeamController.getTeamById);
router.get('/competition-match-team/by-dk/:competition_dk_id', competitionMatchTeamController.getTeamsByCompetitionDKId);
router.put('/competition-match-team/:id/status', competitionMatchTeamController.updateTeamStatus);
router.put('/competition-match-team/:id/config', competitionMatchTeamController.updateConfigSystem);
router.post('/competition-match-team/:id/history', competitionMatchTeamController.addHistory);
router.get('/competition-match-team/:id/history', competitionMatchTeamController.getHistory);
router.delete('/competition-match-team/:id', competitionMatchTeamController.deleteTeam);
router.delete('/competition-match-team/by-dk/:competition_dk_id', competitionMatchTeamController.deleteTeamsByCompetitionDKId);
// thực hiện lưu kết quả thi đấu 
router.post('/competition-match-team/save-score', competitionMatchTeamController.saveResultTeam);



module.exports = router;

