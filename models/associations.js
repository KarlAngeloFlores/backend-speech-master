const User = require("./user.model");
const Quiz = require("./quiz.model");
const QuizQuestion = require("./quizQuestions.model");
const QuizAttempt = require("./quizAttempt.model");
const QuizScore = require("./quizScore.model");
const Module = require("./module.model");
const ModuleContent = require("./moduleContent.model");
const ModuleHistory = require("./moduleHistory.model");
const VerificationCode = require("./verification.model");
const ChatRoom = require("./chatRoom.model");
const ChatMessage = require("./chatMessage.model");

/**
 * Associations
 */

// User → Quiz (1:N)
User.hasMany(Quiz, { foreignKey: "created_by", onDelete: "CASCADE" });
Quiz.belongsTo(User, { foreignKey: "created_by", onDelete: "CASCADE" });

// Quiz → QuizQuestion (1:N)
Quiz.hasMany(QuizQuestion, { foreignKey: "quiz_id", onDelete: "CASCADE" });
QuizQuestion.belongsTo(Quiz, { foreignKey: "quiz_id", onDelete: "CASCADE" });

// User → QuizAttempt (1:N)
User.hasMany(QuizAttempt, { foreignKey: "user_id", onDelete: "CASCADE" });
QuizAttempt.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Quiz → QuizAttempt (1:N)
Quiz.hasMany(QuizAttempt, { foreignKey: "quiz_id", onDelete: "CASCADE" });
QuizAttempt.belongsTo(Quiz, { foreignKey: "quiz_id", onDelete: "CASCADE" });

// User → QuizScore (1:N)
User.hasMany(QuizScore, { foreignKey: "user_id", onDelete: "CASCADE" });
QuizScore.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Quiz → QuizScore (1:N)
Quiz.hasMany(QuizScore, { foreignKey: "quiz_id", onDelete: "CASCADE" });
QuizScore.belongsTo(Quiz, { foreignKey: "quiz_id", onDelete: "CASCADE" });

// User → Module (1:N) (trainer creates modules)
User.hasMany(Module, { foreignKey: "created_by", onDelete: "CASCADE" });
Module.belongsTo(User, { foreignKey: "created_by", onDelete: "CASCADE" });

// Module → ModuleContent (1:N)
Module.hasMany(ModuleContent, { foreignKey: "module_id", onDelete: "CASCADE" });
ModuleContent.belongsTo(Module, { foreignKey: "module_id", onDelete: "CASCADE" });

// Module → ModuleHistory (1:N)
Module.hasMany(ModuleHistory, { foreignKey: "module_id", onDelete: "CASCADE" });
ModuleHistory.belongsTo(Module, { foreignKey: "module_id", onDelete: "CASCADE" });

// User → ModuleHistory (1:N)
User.hasMany(ModuleHistory, { foreignKey: "created_by", onDelete: "CASCADE" });
ModuleHistory.belongsTo(User, { foreignKey: "created_by", onDelete: "CASCADE" });

// User → VerificationCode (1:N)
User.hasMany(VerificationCode, { foreignKey: "user_id", onDelete: "CASCADE" });
VerificationCode.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// User → ChatRoom (1:N) (as trainer)
User.hasMany(ChatRoom, { foreignKey: "trainer_id", as: "TrainerRooms", onDelete: "CASCADE" });
ChatRoom.belongsTo(User, { foreignKey: "trainer_id", as: "Trainer", onDelete: "CASCADE" });

// User → ChatMessage (1:N)
User.hasMany(ChatMessage, { foreignKey: "sender_id", as: "SentMessages", onDelete: "CASCADE" });
ChatMessage.belongsTo(User, { foreignKey: "sender_id", as: "Sender", onDelete: "CASCADE" });
// ChatRoom → ChatMessage (1:N)
ChatRoom.hasMany(ChatMessage, { foreignKey: "room_id", as: "Messages", onDelete: "CASCADE" });
ChatMessage.belongsTo(ChatRoom, { foreignKey: "room_id", as: "Room", onDelete: "CASCADE" });


module.exports = {
  User,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizScore,
  Module,
  ModuleContent,
  ModuleHistory,
  VerificationCode,
  ChatRoom,
  ChatMessage,
};
