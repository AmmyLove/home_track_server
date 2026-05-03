import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Consumption = sequelize.define("Consumption", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING, // e.g. "Used for jollof rice"
  },
  consumedAt: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default Consumption;