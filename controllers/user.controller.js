const userService = require("../services/user.service");
const { logError, logSuccess } = require("../utils/logs");
const { sendSuccess, sendError, getFriendlyErrorMessage } = require("../utils/util");

const userController = {
    getUser: async (req, res) => {
        try {
            
            const { id } = req.params;
            const result = await userService.getUser(id);
            logSuccess(result.message);
            sendSuccess(res, 200, result)

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    }
}

module.exports = userController;