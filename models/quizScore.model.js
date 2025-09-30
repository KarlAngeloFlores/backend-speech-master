const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QuizScore = sequelize.define("QuizScore", {
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: true, // SQL doesn’t enforce NOT NULL
  },
  taken_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "quiz_score",
  timestamps: false, // no created_at/updated_at in SQL
});

module.exports = QuizScore;
