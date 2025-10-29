const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Module = sequelize.define("Module", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(255),
    defaultValue: "published",
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "module",
  timestamps: false, // since you only have created_at
});

module.exports = Module;
