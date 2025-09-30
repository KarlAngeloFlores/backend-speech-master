const express = require("express");
const quizTraineeController = require("../controllers/quizTrainee.controller");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

const router = express.Router();

router.get("/not-answered", auth, checkRole("trainee"), quizTraineeController.getQuizzes);
router.get("/answered", auth, checkRole("trainee"), quizTraineeController.getAnsweredQuizzes);
router.get("/:id", auth, checkRole("trainee"), quizTraineeController.getQuiz);
router.post("/answer-pending", auth, checkRole("trainee"), quizTraineeController.answerQuiz);
router.patch("/answer-completed", auth, checkRole("trainee"), quizTraineeController.submitQuiz);

module.exports = router;