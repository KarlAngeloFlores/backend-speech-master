const quizTrainerService = require("../services/quizTrainer.service");
const { logSuccess, logError } = require("../utils/logs");
const { sendSuccess, sendError, getFriendlyErrorMessage } = require("../utils/util");

const quizTrainerController = {
    createQuiz: async (req, res) => {
        try {
            
            const created_by = req.user.id;
            const { type, title, total_points, timer_seconds, questions } = req.body;
            const result = await quizTrainerService.createQuiz(type, title, total_points, timer_seconds, created_by, questions);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
            
        } catch (error) {
            logError(error);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));

        }
    },

    deleteQuiz: async (req, res) => {
        try {
            
            const { id } = req.params;
            const result = await quizTrainerService.deleteQuiz(id);
            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    getAllQuizzes: async (req, res) => {
        try {
            
            const result = await quizTrainerService.getAllQuizzes();
            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    getQuizResult: async (req, res) => {
        try {

            const { id } = req.params;

            const result = await quizTrainerService.getQuizResult(id);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
            
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    }
}

module.exports = quizTrainerController;