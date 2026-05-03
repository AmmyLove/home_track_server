import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Purchase = sequelize.define("Purchase", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.ENUM("NGN", "USD", "EUR"),
    allowNull: false,
    defaultValue: "NGN",
  },
  purchasedAt: {
    type: DataTypes.DATEONLY, // stores just the date, no time
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default Purchase;