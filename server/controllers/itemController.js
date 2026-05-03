import { Item } from "../models/index.js";

export const getItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { userId: req.userId }, // ← only this user's items
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createItem = async (req, res) => {
  try {
    const item = await Item.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, userId: req.userId }, // ← must belong to this user
    });
    if (!item) return res.status(404).json({ error: "Item not found" });

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    await item.destroy();
    res.json({ message: `"${item.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};