const express = require("express");
const chatController = require("../controllers/chat.controller");
const router = express.Router();

router.get("/rooms/:roomId/messages", chatController.getMessagesByRoomId);
router.post("/create-room", chatController.createChatRoom);
router.post("/send-message", chatController.sendMessage);

module.exports = router;
