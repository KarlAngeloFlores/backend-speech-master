const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Quiz = sequelize.define("Quiz", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  timer_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "quiz",
  timestamps: false, // only created_at, no updated_at
});

module.exports = Quiz;
