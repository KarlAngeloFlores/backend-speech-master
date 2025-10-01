const sequelize = require("../config/db");
const {
  Quiz,
  QuizAttempt,
  QuizQuestion,
  QuizScore,
} = require("../models/associations");
const { logInfo } = require("../utils/logs");
const { throwError } = require("../utils/util");

const quizTraineeService = {
  getQuizzes: async (user_id) => {
    try {
      // Quizzes not answered
      const [not_answered] = await sequelize.query(
        `SELECT q.* 
FROM quiz q
LEFT JOIN quiz_attempt qa 
  ON q.id = qa.quiz_id AND qa.user_id = ?
WHERE qa.id IS NULL 
   OR qa.status = 'pending';
`,
        { replacements: [user_id] }
      );

      return {
        message: "Fetched quizzes successfully",
        data: not_answered,
      };
    } catch (error) {
      throw error;
    }
  },

  getAnsweredQuizzes: async (user_id) => {
    try {
      // Quizzes answered
      const [answered] = await sequelize.query(
        `SELECT 
        q.id AS quiz_id,
        q.title,
        q.type,
        q.total_points,
        q.timer_seconds,
        qa.id AS attempt_id,
        qa.user_id,
        qa.status,
        qa.started_at,
        qa.completed_at,
        qs.score,
        qs.taken_at
      FROM quiz q
      LEFT JOIN quiz_attempt qa 
        ON q.id = qa.quiz_id 
        AND qa.status = 'completed'
      LEFT JOIN quiz_score qs 
        ON q.id = qs.quiz_id 
        AND qa.user_id = qs.user_id
      WHERE qa.user_id = ? 
        AND qa.status = 'completed';`,
        { replacements: [user_id] }
      );

      return {
        message: "Fetched answered Quizzes successfully",
        data: answered,
      };
    } catch (error) {
      throw error;
    }
  },

  getQuiz: async (quiz_id, user_id) => {
    try {
      const existingStatus = await QuizAttempt.findOne({
        where: { quiz_id, user_id },
        attributes: ["status"],
      });

      // if (existingStatus === "taken") {
      //   return {
      //     message: "Quiz is already taken by this user",
      //     is_taken: true,
      //   };
      // }

      

      const status = existingStatus?.status || null;
      // logInfo(existingStatus)

      let score = null;
      if(status && status === "pending") {
        const scoreResult = await QuizScore.findOne({ where: { quiz_id, user_id }, attributes: ['score'] });
        score = scoreResult.score;
      }

      const quiz_info = await Quiz.findOne({ where: { id: quiz_id } });
      const words = await QuizQuestion.findAll({ where: { quiz_id } });

      if(!quiz_info || !words) {
        throwError("Quiz not found", 404, true);  
      };

      return {
        // is_taken: false,
        message: "Fetched quiz successfully",
        quiz_info,
        words,
        status,
        score
      };
    } catch (error) {
      throw error;
    }
  },

  answerQuiz: async (
    user_id,
    quiz_id,
    score,
    taken_at,
    started_at,
    completed_at
  ) => {
    const transaction = await sequelize.transaction();
    try {
      const existing = await QuizAttempt.findOne({
        where: { user_id, quiz_id },
        transaction,
      });

      if (existing) {
        throwError("Quiz is already taken by user", 400, true);
      }

      await QuizAttempt.create({
        user_id,
        quiz_id,
        status: "pending",
        started_at,
        completed_at,
      });
      await QuizScore.create({ user_id, quiz_id, score, taken_at });

      await transaction.commit();

      return {
        message: "Quiz submitted successfully",
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  submitQuiz: async (quiz_id, user_id) => {
    try {
      const existingAttempt = await QuizAttempt.findOne({
        where: { quiz_id, user_id },
      });

      if (!existingAttempt) {
        throwError("Attempt not found", 400, true);
      }

      await existingAttempt.update({
        status: "completed",
        completed_at: new Date(),
      });

      return { message: "Quiz marked as completed" };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = quizTraineeService;
