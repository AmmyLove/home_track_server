import { Consumption, Inventory, Item } from "../models/index.js";
import { Op } from "sequelize";

export const logConsumption = async (req, res) => {
  try {
    const { itemId, quantity, note, consumedAt } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "itemId and a positive quantity are required." });
    }

    // Verify item belongs to this user
    const item = await Item.findOne({ where: { id: itemId, userId: req.userId } });
    if (!item) return res.status(404).json({ error: "Item not found." });

    // Deduct from inventory
    const inventory = await Inventory.findOne({ where: { itemId } });
    if (!inventory) {
      return res.status(404).json({ error: "No inventory found for this item. Log a purchase first." });
    }

    if (inventory.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stock to consume that amount." });
    }

    inventory.quantity -= quantity;
    await inventory.save();

    const consumption = await Consumption.create({
      itemId,
      quantity,
      note: note || null,
      consumedAt: consumedAt || new Date(),
      userId: req.userId,
    });

    let alert = null;
    if (inventory.quantity <= item.restockThreshold) {
      alert = `Low stock for ${item.name} — only ${inventory.quantity} ${item.unit ?? ""} left`;
    }

    res.status(201).json({ consumption, inventory, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConsumptions = async (req, res) => {
  try {
    const consumptions = await Consumption.findAll({
      where: { userId: req.userId },
      include: Item,
      order: [["consumedAt", "DESC"]],
    });
    res.json(consumptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Returns average usage per day for each item over the last 30 days
// and predicts how many days of stock are left
export const getUsageInsights = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceStr = since.toISOString().split("T")[0];

    const consumptions = await Consumption.findAll({
      where: { userId: req.userId, consumedAt: { [Op.gte]: sinceStr } },
      include: Item,
    });

    // Group by item
    const byItem = {};
    for (const c of consumptions) {
      if (!byItem[c.itemId]) {
        byItem[c.itemId] = { item: c.Item, totalConsumed: 0 };
      }
      byItem[c.itemId].totalConsumed += c.quantity;
    }

    // Fetch current inventory for each item
    const insights = await Promise.all(
      Object.values(byItem).map(async ({ item, totalConsumed }) => {
        const avgPerDay = totalConsumed / 30;
        const inventory = await Inventory.findOne({ where: { itemId: item.id } });
        const currentStock = inventory?.quantity ?? 0;
        const daysLeft = avgPerDay > 0 ? Math.floor(currentStock / avgPerDay) : null;

        return {
          itemId: item.id,
          name: item.name,
          unit: item.unit,
          avgPerDay: parseFloat(avgPerDay.toFixed(3)),
          currentStock,
          daysLeft,
          needsRestockSoon: daysLeft !== null && daysLeft <= 7,
        };
      })
    );

    // Sort: items running out soonest first
    insights.sort((a, b) => {
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    });

    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};