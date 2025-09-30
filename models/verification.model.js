const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const VerificationCode = sequelize.define("VerificationCode", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // nullable in SQL
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  code_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM("account_verification", "password_reset"),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "verification_codes",
  timestamps: false, // no created_at/updated_at
});

module.exports = VerificationCode;
