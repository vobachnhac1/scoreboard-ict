const express = require('express');
const router = express.Router();
const RefereeController = require('../controllers/referee.controller');

// CRUD trọng tài
router.get('/referees', RefereeController.getAllReferees);
router.post('/referees', RefereeController.createReferee);
router.post('/referees/bulk', RefereeController.bulkImportReferees);
router.put('/referees/:id', RefereeController.updateReferee);
router.delete('/referees/:id', RefereeController.deleteReferee);
router.delete('/referees-all', RefereeController.deleteAllReferees);

module.exports = router;
