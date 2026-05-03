import sequelize from "../config/database.js";

import User from "./user.js";
import Item from "./item.js";
import Purchase from "./purchase.js";
import Inventory from "./inventory.js";
import Recipe from "./recipe.js";
import RecipeItem from "./recipeItem.js";
import Consumption from "./consumption.js";


// =====================
// Associations
// =====================

// Every model gets a userId so users only ever see their own data
User.hasMany(Item,        { foreignKey: "userId" });
Item.belongsTo(User,      { foreignKey: "userId" });

User.hasMany(Purchase,    { foreignKey: "userId" });
Purchase.belongsTo(User,  { foreignKey: "userId" });

User.hasMany(Recipe,      { foreignKey: "userId" });
Recipe.belongsTo(User,    { foreignKey: "userId" });

User.hasMany(Consumption, { foreignKey: "userId" });
Consumption.belongsTo(User, { foreignKey: "userId" });

// Item ↔ Purchase
Item.hasMany(Purchase, { foreignKey: "itemId" });
Purchase.belongsTo(Item, { foreignKey: "itemId" });

// Item ↔ Inventory (1-1)
Item.hasOne(Inventory, { foreignKey: "itemId" });
Inventory.belongsTo(Item, { foreignKey: "itemId" });

// Item ↔ Consumption
Item.hasMany(Consumption, { foreignKey: "itemId" });
Consumption.belongsTo(Item, { foreignKey: "itemId" });

// Recipe ↔ Item (Many-to-Many)
Recipe.belongsToMany(Item, { through: RecipeItem, foreignKey: "recipeId" });
Item.belongsToMany(Recipe, { through: RecipeItem, foreignKey: "itemId" });

export { 
  sequelize, 
  User,
  Item, 
  Purchase, 
  Inventory, 
  Recipe, 
  RecipeItem, 
  Consumption };