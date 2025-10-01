const express = require("express");
const quizTrainerController = require("../controllers/quizTrainer.controller");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

router.get("/result/:id", auth, checkRole("trainer"), quizTrainerController.getQuizResult)
router.get("/", auth, checkRole("trainer"), quizTrainerController.getAllQuizzes);
router.post("/", auth, checkRole("trainer"), quizTrainerController.createQuiz);
router.delete("/:id", auth, checkRole("trainer"), quizTrainerController.deleteQuiz);


module.exports = router;