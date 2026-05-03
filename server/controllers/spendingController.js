import { Purchase, Item } from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const CURRENCIES = ["NGN", "USD", "EUR"];

// Helper that builds the summary from an array of purchases
const summarize = (purchases) => {
  const totals = {};

  for (const currency of CURRENCIES) {
    const filtered = purchases.filter((p) => p.currency === currency);
    const total = filtered.reduce((sum, p) => sum + p.price * p.quantity, 0);
    totals[currency] = {
      count: filtered.length,
      total: parseFloat(total.toFixed(2)),
    };
  }

  return {
    totalPurchases: purchases.length,
    breakdown: totals,
    purchases,
  };
};

// All-time spending
export const getAllTimeSpending = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      where: { userId: req.userId }, 
      include: Item,
      order: [["purchasedAt", "DESC"]], // newest first
     });
    res.json(summarize(purchases));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Spending today
export const getDailySpending = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // "2026-03-28"
    const purchases = await Purchase.findAll({
      where: { userId: req.userId, purchasedAt: today },
      include: Item,
    });
    res.json(summarize(purchases));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Spending this week (Mon–Sun)
export const getWeeklySpending = async (req, res) => {
  try {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diffToMonday);
    const startStr = start.toISOString().split("T")[0];

    const purchases = await Purchase.findAll({
      where: { userId: req.userId, purchasedAt: { [Op.gte]: startStr } },
      include: Item,
    });
    res.json(summarize(purchases));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Spending this month
export const getMonthlySpending = async (req, res) => {
  try {
    const now = new Date();
    const startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const purchases = await Purchase.findAll({
      where: { userId: req.userId, purchasedAt: { [Op.gte]: startStr } },
      include: Item,
    });
    res.json(summarize(purchases));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyHistory = async (req, res) => {
  try {
    // Build the start date — first day of the month, 6 months ago
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startStr = start.toISOString().split("T")[0];

    const purchases = await Purchase.findAll({
      where: { userId: req.userId, purchasedAt: { [Op.gte]: startStr } },
      include: Item,
      order: [["purchasedAt", "ASC"]],
    });

    // Group purchases by "YYYY-MM" key
    // e.g. { "2026-01": { label: "Jan 2026", NGN: 0, USD: 0, EUR: 0 } }
    const months = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Key like "2026-01"
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      // Label like "Jan 2026"
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
      months[key] = { label, NGN: 0, USD: 0, EUR: 0 };
    }

    // Add each purchase's total to its month bucket
    for (const p of purchases) {
      const key = p.purchasedAt.slice(0, 7); // "2026-01-15" → "2026-01"
      if (months[key]) {
        months[key][p.currency] += p.price * p.quantity;
      }
    }

    // Round all totals to 2 decimal places
    const result = Object.values(months).map((m) => ({
      ...m,
      NGN: parseFloat(m.NGN.toFixed(2)),
      USD: parseFloat(m.USD.toFixed(2)),
      EUR: parseFloat(m.EUR.toFixed(2)),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};