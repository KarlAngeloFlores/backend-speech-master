const quizTraineeService = require("../services/quizTrainee.service");
const { logSuccess, logError } = require("../utils/logs");
const { sendSuccess, sendError, getFriendlyErrorMessage } = require("../utils/util");

const quizTraineeController = {
    getQuizzes: async (req, res) => {
        try {

            const userId = req.user.id;
            const result = await quizTraineeService.getQuizzes(userId);
            
            logSuccess(result.message);
            sendSuccess(res, 200, result);
            
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    getAnsweredQuizzes: async (req, res) => {
        try {

            const userId = req.user.id;
            const result = await quizTraineeService.getAnsweredQuizzes(userId);
            
            logSuccess(result.message);
            sendSuccess(res, 200, result);
            
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    

    getQuiz: async (req, res) => {
        try {
            
            const userId = req.user.id;
            const { id } = req.params;
            const result = await quizTraineeService.getQuiz(id, userId);

            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    answerQuiz: async (req, res) => {
        try {
            
            const userId = req.user.id;
            const { quiz_id, taken_at, score, started_at, completed_at } = req.body;
            const result = await quizTraineeService.answerQuiz(userId, quiz_id, score, taken_at, started_at, completed_at);

            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    submitQuiz: async (req, res) => {
        try {
            
            const userId = req.user.id;
            const { quiz_id } = req.body;
            const result = await quizTraineeService.submitQuiz(quiz_id, userId);
            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    }
};

module.exports = quizTraineeController;