import { Purchase, Inventory, Item } from "../models/index.js";
import { Op } from "sequelize";


export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: { userId: req.userId }, // ← only this user's purchases
      include: Item,
      order: [["purchasedAt", "DESC"]], // newest first
    });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { itemId, quantity, price, currency, purchasedAt } = req.body;

    // Make sure the item belongs to this user before logging a purchase
    const item = await Item.findOne({
      where: { id: itemId, userId: req.userId },
    });
    if (!item) return res.status(404).json({ error: "Item not found." });
    

    // 1. Create purchase record
    const purchase = await Purchase.create({
      itemId,
      quantity,
      price,
      currency,
      purchasedAt: purchasedAt || new Date(), // set the purchasedAt to the current date if no input is provided
      userId: req.userId,
    });

    // 2. Update inventory
    let inventory = await Inventory.findOne({ where: { itemId } });

    if (!inventory) {
      inventory = await Inventory.create({
        itemId,
        quantity,
      });
    } else {
      inventory.quantity += quantity;
      await inventory.save();
    }

    // 3. Check restock alert
    let alert = null;
    if (inventory.quantity <= item.restockThreshold) {
      alert = `Low stock for ${item.name}`;
    }

    res.status(201).json({
      purchase,
      inventory,
      alert,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};