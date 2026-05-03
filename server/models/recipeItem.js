import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RecipeItem = sequelize.define("RecipeItem", {
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

export default RecipeItem;