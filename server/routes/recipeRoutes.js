import express from "express";
import {
  getRecipes,
  createRecipe,
  getRecipeShoppingList,
  deleteRecipe,
} from "../controllers/recipeController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ← UPDATED: added GET / and DELETE /:id
router.get("/", auth,  getRecipes);
router.post("/", auth, createRecipe);
router.get("/:id", auth, getRecipeShoppingList);
router.delete("/:id", auth, deleteRecipe);

export default router;