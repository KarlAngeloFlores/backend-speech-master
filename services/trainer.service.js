const { Op } = require("sequelize");
const { User, Quiz, QuizAttempt, Module } = require("../models/associations");
const { throwError } = require("../utils/util");
const sequelize = require("../config/db");

const trainerService = {
    getTrainees: async () => {
        try {
            
            const students = await User.findAll({where: { role: { [Op.ne]: 'trainer' } }});

            return {
                message: "Fetched students successfully",
                data: students
            }

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
            const traineesCount = await User.count({ where: { status: 'verified', role: 'trainee' } });

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
                totalModules: modulesCount
                },
                completion
            }

        } catch (error) {
            throw error;
        }
    }

}

module.exports = trainerService;