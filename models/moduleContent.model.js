const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ModuleContent = sequelize.define("ModuleContent", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file: {
    type: DataTypes.BLOB("long"), // LONGBLOB for PDFs/Docs
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(100), // e.g., application/pdf
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER, // size in bytes
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "module_contents",
  timestamps: false,
});

module.exports = ModuleContent;
