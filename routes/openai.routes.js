const express = require('express');
const multer = require('multer');
const trainee = require('../controllers/trainee.controller');
const auth = require("../middlewares/auth");
const checkRole = require('../middlewares/checkRole');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/generate-script', auth, checkRole('trainee'), trainee.generateScript);
router.post('/analyze-voice', auth, checkRole('trainee'), upload.single("audio"), trainee.analyzeVoice);
router.post('/scenario-feedback', auth, checkRole('trainee'), upload.single("audio"), trainee.scenarioFeedback);

module.exports = router;