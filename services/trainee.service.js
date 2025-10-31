const sequelize = require("../config/db");
const { Quiz, QuizAttempt, Module, User } = require("../models/associations");

const traineeService = {
  getHome: async (user_id) => {
    try {
      //counts: Available Quiz, Completed Quiz, Modules Created

      const modulesCount = await Module.count();
      // const availableQuizzesCount = await
      const completedQuizzesCount = await QuizAttempt.count({
        where: {
          user_id: user_id,
          status: "completed",
        },
      });

      const availableQuizzesCount = await Quiz.count({
        where: sequelize.literal(`
          id NOT IN (
            SELECT quiz_id FROM quiz_attempt WHERE user_id = ${user_id}
          )
        `),  
      },);

      return {
        modulesCreated: modulesCount,
        availableQuizzes: availableQuizzesCount,
        completedQuizzes: completedQuizzesCount,
      };
    } catch (error) {
      throw error;
    }
  },

  getTrainers: async () => {
    try {
      const trainers = await User.findAll({
        where: {
          role: 'trainer'
        }, attributes: ['id', 'first_name', 'last_name', 'email']
      });
      return {
        message: "Trainers fetched successfully",
        trainers
      };
    } catch (error) {
      throw error;
    }
  }

};

module.exports = traineeService;
