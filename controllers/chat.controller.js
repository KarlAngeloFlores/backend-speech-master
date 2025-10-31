const chatService = require("../services/chat.service");
const { logError, logSuccess } = require("../utils/logs");
const { sendSuccess, sendError, getFriendlyErrorMessage } = require("../utils/util");

const chatController = {
    createChatRoom: async (req, res) => {
        try {
            const { trainerId, traineeId } = req.body;
            const result = await chatService.createChatRoom(trainerId, traineeId);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { roomId, senderId, message } = req.body;
            const result = await chatService.sendMessage(roomId, senderId, message);
            logSuccess(result.message);
            sendSuccess(res, 200, result);
        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    },
    getMessagesByRoomId: async (req, res) => {
        try {
            const { roomId } = req.params;
            const result = await chatService.getMessagesByRoomId(roomId);
            logSuccess("Messages retrieved successfully");
            sendSuccess(res, 200, result);
        } catch (error) {
            logError(error.message);
            const status = 500;
            sendError(res, status, getFriendlyErrorMessage(error));
        }
    }
};

module.exports = chatController;