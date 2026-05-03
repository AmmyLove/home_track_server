import { Inventory, Item } from "../models/index.js";

export const getInventory = async (req, res) => {
  try {
  const inventory = await Inventory.findAll({
    include: {
        model: Item,
        where: { userId: req.userId }, // ← only items belonging to this user
        required: true,
      },
  });

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};