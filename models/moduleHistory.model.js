const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ModuleHistory = sequelize.define(
  "ModuleHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "module_history",
    timestamps: false,
  }
);

module.exports = ModuleHistory;
