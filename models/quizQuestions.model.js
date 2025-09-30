const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QuizQuestion = sequelize.define("QuizQuestion", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // should always belong to a quiz
  },
  question_word: {
    type: DataTypes.STRING(255),
    allowNull: true, // SQL doesn’t enforce NOT NULL
  },
  difficulty: {
    type: DataTypes.STRING(100),
    allowNull: true, // matches SQL (easy, medium, hard)
  },
}, {
  tableName: "quiz_questions",
  timestamps: false, // no created_at / updated_at in your SQL
});

module.exports = QuizQuestion;
