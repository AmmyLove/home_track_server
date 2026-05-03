import express from "express";
import { createItem, getItems, deleteItem, updateItem } from "../controllers/itemController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createItem);
router.get("/", auth, getItems);
router.put("/:id", auth, updateItem);
router.delete("/:id", auth, deleteItem);


export default router;