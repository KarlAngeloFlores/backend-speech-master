const express = require('express');
const multer = require('multer');
const studentController = require('../controllers/student.controller');
const auth = require("../middlewares/auth");
const checkRole = require('../middlewares/checkRole');

const router = express.Router();
const upload = multer({ dest: "/uploads" });

router.post('/generate-script', auth, checkRole('trainee'), studentController.generateScript);
router.post('/analyze-voice', auth, checkRole('trainee'), upload.single("audio"), studentController.analyzeVoice);

module.exports = router;