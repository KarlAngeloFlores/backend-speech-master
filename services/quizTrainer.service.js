const { Op, fn, col } = require('sequelize');
const { Quiz, QuizQuestion } = require("../models/associations");
const sequelize = require("../config/db");
const { throwError } = require("../utils/util");
const { logInfo } = require('../utils/logs');

const quizTrainerService = {
    createQuiz: async (type, title, total_points, timer_seconds, created_by, questions) => {

        const transaction = await sequelize.transaction();
        try {
            questions.forEach((q, idx) => {
                const currentNo = idx + 1;
                const word = q.question_word;

                if(!q.question_word || q.question_word.trim() === "") {
                    throwError(`Question word is missing at no.: ${currentNo}`, 404, true);
                };

                if (/\d/.test(q.question_word)) {
                    throwError(`Question word contains numbers at no.: ${currentNo}: "${word}"`, 404, true);
                };
            });

            const quiz = await Quiz.create({ type, title, total_points, timer_seconds, created_by }, { transaction });
            logInfo(quiz.id);
            const quiz_id = quiz.id;
            

            const questionValues = questions.map((q) => ({
            quiz_id,
            question_word: q.question_word.toLowerCase().trim(),
            difficulty: q.difficulty
            }));

            logInfo(questionValues);
            
            await QuizQuestion.bulkCreate(questionValues, { transaction });
            await transaction.commit();

            return {
                message: "Quiz created successfully",
                data: quiz
            }
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    deleteQuiz: async (id) => {
        const transaction = await sequelize.transaction();
        try {

            const quiz = await Quiz.findOne({ where: { id } });

            if(!quiz) {
                throwError("Quiz not found", 400, true);
            };

            await quiz.destroy({ transaction });
            await transaction.commit();

            return {
                message: "Quiz deleted successfully",
                data: id
            };
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        };
    },

    getAllQuizzes: async () => {
        try {
            
            const quizzes = await Quiz.findAll();

            return {
                quizzes,
                message: "Fetched quizzes successfully"
            }

        } catch (error) {
            throw error;
        }
    },

    getQuizResult: async (id) => {
        try {
            
            const [quiz_results] = await sequelize.query(`SELECT 
                u.id AS user_id, 
                u.first_name, 
                u.last_name, 
                u.middle_name, 
                qs.quiz_id, 
                qs.score, 
                qs.taken_at
            FROM user u
            LEFT JOIN quiz_score qs ON u.id = qs.user_id
            AND qs.quiz_id = ? 
            WHERE u.role = 'trainee';`, { replacements: [id] });

            const quiz_info = await Quiz.findOne({ where: { id } });

            if(!quiz_info) {
                throwError("Quiz not found", 404, true);
            }
            
            return {
                message: "Fetched quiz result successfully",
                quiz_results,
                quiz_info
            }

        } catch (error) {
            throw error;
        }
    }
}

module.exports = quizTrainerService;