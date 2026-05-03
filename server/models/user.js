import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // no two accounts with the same email
    validate: {
      isEmail: true, // sequelize checks the format for us
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    // IMPORTANT: we never store the raw password — only the bcrypt hash
  },
  // ── Email verification ────────────────────────────────────────
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // false until user enters the OTP
  },
  // ── OTP fields (used for both verification and password reset)
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true, // null when no OTP is active
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true, // null when no OTP is active
  },

});

export default User;