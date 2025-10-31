const express = require('express');
const traineeController = require('../controllers/trainee.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();


router.get("/home", auth, checkRole("trainee"), traineeController.getHome);
router.get("/dictionary/:word", traineeController.dictionaryProxy);
router.get("/alternative-dictionary/:word", traineeController.alternativeDictionary);
router.get("/trainers", auth, checkRole("trainee"), traineeController.getTrainers);

module.exports = router;