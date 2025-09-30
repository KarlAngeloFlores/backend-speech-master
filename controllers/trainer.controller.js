const trainerService = require("../services/trainer.service");
const { logSuccess, logError } = require("../utils/logs");
const { sendSuccess } = require("../utils/util");

const trainerController = {
    getTrainees: async (req, res) => {
        try {
            const result = await trainerService.getTrainees();
            logSuccess(result.message);
            sendSuccess(res, 200, result);
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },
    approveTrainee: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await trainerService.approveTrainee(id);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },
    deleteTrainee: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await trainerService.deleteTrainee(id);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    }
}

module.exports = trainerController;