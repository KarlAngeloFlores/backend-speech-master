const express = require('express');
const trainerController = require('../controllers/trainer.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

router.get('/home', auth, checkRole("trainer"), trainerController.getHome);
router.get('/trainees', auth, checkRole('trainer'), trainerController.getTrainees);
router.get('/trainees/performance/:id', auth, checkRole('trainer'), trainerController.getTraineePerformance);
router.patch('/trainees/:id/approve', auth, checkRole('trainer'), trainerController.approveTrainee);
router.delete('/trainees/:id', auth, checkRole('trainer'), trainerController.deleteTrainee);

module.exports = router;