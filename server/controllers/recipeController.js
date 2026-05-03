import { Recipe, Item, Inventory } from "../models/index.js";

// ─── Get all recipes ───────────────────────────────────────────────
export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      // Include items so we can show ingredient count on the list
      include: {
        model: Item,
        through: { attributes: ["quantity"] }, // quantity from RecipeItem join table
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Create a recipe with ingredients ─────────────────────────────
export const createRecipe = async (req, res) => {
  try {
    const { name, items } = req.body;
    if (!name?.trim())          return res.status(400).json({ error: "Recipe name is required." });
    if (!items || items.length === 0) return res.status(400).json({ error: "Add at least one ingredient." });

    const recipe = await Recipe.create({ name, userId: req.userId });

    for (const i of items) {
      // Verify each ingredient belongs to this user
      const item = await Item.findOne({ where: { id: i.itemId, userId: req.userId } });
      if (!item) return res.status(404).json({ error: `Item ${i.itemId} not found.` });
      await recipe.addItem(item, { through: { quantity: i.quantity } });
    }

    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get one recipe + shopping list ───────────────────────────────
// For each ingredient, we also check how much is currently in stock
// so the frontend can show "you need 500g, you have 200g"
export const getRecipeShoppingList = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      where: { id: req.params.id, userId: req.userId },
      include: {
        model: Item,
        through: { attributes: ["quantity"] }, // how much the recipe needs
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }

    // For each ingredient, attach current stock level
    const ingredients = await Promise.all(
      recipe.Items.map(async (item) => {
        const inventory = await Inventory.findOne({ where: { itemId: item.id } });
        const needed = item.RecipeItem.quantity;
        const inStock = inventory?.quantity ?? 0;

        return {
          itemId: item.id,
          name: item.name,
          unit: item.unit,
          needed,           // how much the recipe requires
          inStock,          // how much you currently have
          sufficient: inStock >= needed, // true = you have enough
          toBuy: Math.max(0, needed - inStock), // how much you still need to buy
        };
      })
    );

    res.json({ id: recipe.id, name: recipe.name, ingredients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Delete a recipe ───────────────────────────────────────────────
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    await recipe.destroy();
    res.json({ message: `"${recipe.name}" deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};