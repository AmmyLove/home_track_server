import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Item = sequelize.define("Item", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  unit: {
    type: DataTypes.STRING, // kg, pcs, litres
  },
  restockThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

export default Item;