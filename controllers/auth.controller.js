const { logError, logSuccess } = require("../utils/logs");
const { sendSuccess, sendError, getFriendlyErrorMessage } = require("../utils/util");
const authService = require("../services/auth.service")

const authController = {
    login: async (req, res) => {
        try {
            
            const { email, password } = req.body;
            const { accessToken, role, message, status } = await authService.login(email, password);
            logSuccess(message);
            sendSuccess(res, 200, { message, role, accessToken, status });

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },
    
    register: async (req, res) => {
        try {
            
            const { email, first_name, last_name, middle_name } = req.body;
            const result = await authService.register(email, first_name, last_name, middle_name);
            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    registerAndVerify: async (req, res) => {
        try {
            const { token, password, code } = req.body;
            const result = await authService.registerAndVerify(token, password, code);
            logSuccess(result.message);
            sendSuccess(res, 200, result)
        } catch (error) {
            logError(error.message);
            const status = error.statusCode || 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    logout: async (req, res) => {
        try {
               
            sendSuccess(res, 200, "Logged out successfully");
            logSuccess("Logged out successfully");

        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    me: async (req, res) => {
        try {
            
            sendSuccess(res, 200, { id: req.user.id, role: req.user.role, status: req.user.status });
            logSuccess("User is verified");

        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    forgotPassword: async (req, res) => {
        try {
            
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
            

        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    verifyResetPassword: async (req, res) => {
        try {
            
            const { email, code } = req.body;
            const result = await authService.verifyResetPassword(email, code);
            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    confirmNewPassword: async (req, res) => {
        try {
            
            const { email, newPassword, confirmPassword} = req.body;
            const result = await authService.confirmNewPassword(email, newPassword, confirmPassword);
            logSuccess(result.message);
            sendSuccess(res, 200, result);

        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    }
}

module.exports = authController;