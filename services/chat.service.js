const { ChatRoom, ChatMessage, User } = require("../models/associations");
const sequelize = require("../config/db");
const { throwError } = require("../utils/util"); // adjust path
const { logInfo, logError } = require("../utils/logs");

const chatService = {
    createChatRoom: async (trainerId, traineeId) => {
        console.log(trainerId, traineeId);
        try {
            const existingRoom = await ChatRoom.findOne({
                where: {
                    trainer_id: trainerId,
                    trainee_id: traineeId
                }
            });
            if (existingRoom) {
                logInfo(`Chat room already exists between trainer ${trainerId} and trainee ${traineeId}`);
                return {
                    message: "Chat room already exists",
                    chatRoom: existingRoom
                };
            }
            const newRoom = await ChatRoom.create({
                trainer_id: trainerId,
                trainee_id: traineeId
            });
            logInfo(`Created new chat room between trainer ${trainerId} and trainee ${traineeId}`);
            return {
                message: "Chat room created successfully",
                chatRoom: newRoom
            };
            
        } catch (error) {
            logError("Error creating chat room:", error);
            throwError("Failed to create chat room");
        }
    },

    sendMessage: async (roomId, senderId, message) => {
        try {
            const chatRoom = await ChatRoom.findByPk(roomId);
            if (!chatRoom) {
                throwError("Chat room not found");
            }
            const newMessage = await ChatMessage.create({
                room_id: roomId,
                sender_id: senderId,
                message
            });
            logInfo(`New message sent in chat room ${roomId} by user ${senderId}`);
            return {
                message: "Message sent successfully",
                chatMessage: newMessage
            };
        } catch (error) {
            logError("Error sending message:", error);
            throwError("Failed to send message");
        }
    },

    getMessagesByRoomId: async (roomId) => {
        try {
            const messages = await ChatMessage.findAll({
                where: {
                    room_id: roomId
                }
            });
            return {
                message: "Messages fetched successfully",
                messages
            };
        } catch (error) {
            logError("Error fetching messages:", error);
            throwError("Failed to fetch messages");
        }
    },

    getRoomsByTrainee: async (traineeId) => {

        //get chat rooms between trainer and trainee
        try {

            const chatRooms = await ChatRoom.findAll({
                where: {
                    trainee_id: traineeId
                }
            });

            return {
                message: "Chat rooms fetched successfully",
                chatRooms
            };
        } catch (error) {
            logError("Error fetching chat rooms:", error);
            throwError("Failed to fetch chat rooms");
        }
    }

};

module.exports = chatService;
