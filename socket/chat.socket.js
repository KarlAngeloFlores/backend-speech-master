//socket gateway for chat
const { Server } = require("socket.io");
const chatService = require("../services/chat.service");

const chatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // User joins a specific chat room
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId}`);
        });

        // User sends a message to a room
        // NOTE: Message is already saved via HTTP API, socket just broadcasts it
        socket.on("sendMessage", async ({ roomId, senderId, message, messageId, created_at }) => {
            try {
                // Don't save again - message is already saved via API
                // Just broadcast to all users in that room
                const messageData = {
                    id: messageId,
                    room_id: roomId,
                    sender_id: senderId,
                    message: message,
                    created_at: created_at
                };
                
                io.to(roomId).emit("newMessage", messageData);
                console.log(`Message broadcast in room ${roomId} by user ${senderId}`);
            } catch (error) {
                console.error("Error broadcasting message:", error);
                // Emit error back to sender
                socket.emit("messageError", { error: "Failed to broadcast message" });
            }
        });

        // User disconnects
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

module.exports = chatSocket;
