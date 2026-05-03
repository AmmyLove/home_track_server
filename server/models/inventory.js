import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Inventory = sequelize.define("Inventory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

export default Inventory;