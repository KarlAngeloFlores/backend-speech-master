const User = require("./user.model");
const Quiz = require("./quiz.model");
const QuizQuestion = require("./quizQuestions.model");
const QuizAttempt = require("./quizAttempt.model");
const QuizScore = require("./quizScore.model");
const Module = require("./module.model");
const ModuleContent = require("./moduleContent.model");
const VerificationCode = require("./verification.model");

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

// User → VerificationCode (1:N)
User.hasMany(VerificationCode, { foreignKey: "user_id", onDelete: "CASCADE" });
VerificationCode.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

module.exports = {
  User,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizScore,
  Module,
  ModuleContent,
  VerificationCode,
};
