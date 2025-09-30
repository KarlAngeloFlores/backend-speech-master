const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QuizAttempt = sequelize.define("QuizAttempt", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // must belong to a user
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // must belong to a quiz
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true, // SQL doesn’t enforce NOT NULL
    validate: {
      isIn: [["pending", "completed"]],
    },
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "quiz_attempt",
  timestamps: false, // no created_at / updated_at in your SQL
});

module.exports = QuizAttempt;
