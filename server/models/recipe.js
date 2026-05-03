import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Recipe = sequelize.define("Recipe", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Recipe;