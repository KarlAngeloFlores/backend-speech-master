const { Op } = require("sequelize");
const {
  User,
  Quiz,
  QuizAttempt,
  Module,
  QuizScore,
} = require("../models/associations");
const { throwError } = require("../utils/util");
const sequelize = require("../config/db");
const { logInfo } = require("../utils/logs");

const trainerService = {
  getTrainees: async () => {
    try {
      const students = await User.findAll({
        where: { role: { [Op.ne]: "trainer" } },
      });

      return {
        message: "Fetched students successfully",
        data: students,
      };
    } catch (error) {
      throw error;
    }
  },

  approveTrainee: async (id) => {
    const transaction = await sequelize.transaction();
    try {
      const trainee = await User.findOne({ where: { id }, transaction });

      if (!trainee) {
        throwError("Trainee not found", 404, true);
      }

      await trainee.update({ status: "verified" }, { transaction });

      await transaction.commit();

      return {
        message: "The trainee has been updated",
        data: trainee,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  deleteTrainee: async (id) => {
    const transaction = await sequelize.transaction();
    try {
      const trainee = await User.findOne({ where: { id }, transaction });

      if (!trainee) {
        throwError("Trainee not found", 404, true);
      }

      await trainee.destroy({ transaction });

      await transaction.commit();

      return { message: "Trainee deleted successfully", data: id };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getHome: async () => {
    try {
      const quizCount = await Quiz.count();
      const attemptCount = await QuizAttempt.count();
      const modulesCount = await Module.count();
      const traineesCount = await User.count({
        where: { status: "verified", role: "trainee" },
      });

      const [completion] = await sequelize.query(`SELECT 
    q.id AS quiz_id,
    q.title,
    COUNT(DISTINCT qa.user_id) AS completed_attempts
FROM quiz q
LEFT JOIN quiz_attempt qa 
    ON q.id = qa.quiz_id AND qa.status = 'completed'
GROUP BY q.id, q.title;`);

      return {
        message: "Fetched home data successfully",
        stats: {
          totalTrainees: traineesCount,
          totalQuizzes: quizCount,
          totalAttempts: attemptCount,
          totalModules: modulesCount,
        },
        completion,
      };
    } catch (error) {
      throw error;
    }
  },

getTraineePerformance: async (id) => {
  try {
    const quizzes = await Quiz.findAll({
      attributes: ["id", "title", "total_points"],
      include: [
        {
          model: QuizScore,
          attributes: ["score"],
          required: false, // LEFT JOIN (include quizzes without scores)
          where: { user_id: id },
        },
      ],
    });

    let totalPercentage = 0;
    let countedQuizzes = 0; // total quizzes considered

    const details = quizzes.map((quiz) => {
      const score = quiz.QuizScores[0]?.score ?? null;
      let percentage = 0; // default 0 if not answered

      if (score !== null) {
        percentage = (score / quiz.total_points) * 100;
      }

      totalPercentage += percentage;
      countedQuizzes++; // count this quiz no matter what

      return {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        score: score,
        total_points: quiz.total_points,
        percentage: score !== null ? percentage.toFixed(2) + "%" : "Not taken (0%)",
      };
    });

    let average = null;

    if (countedQuizzes > 0) {
      average = (totalPercentage / countedQuizzes).toFixed(2) + "%";
    } else {
      average = "No quizzes exist yet";
    }

    return {
      message: "Fetched trainee performance",
      data: {
        details,
        quizzes_total: quizzes.length,
        quizzes_taken: quizzes.filter(q => q.QuizScores.length > 0).length,
        average_grade: average,
      },
    };
  } catch (error) {
    throw error;
  }
},



};
module.exports = trainerService;
