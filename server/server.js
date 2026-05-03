import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { sequelize } from './models/index.js';


import itemRoutes from "./routes/itemRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import spendingRoutes from "./routes/spendingRoutes.js";

import consumptionRoutes from "./routes/consumptionRoutes.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config();

const app = express();

// Middleware — this lets your server read JSON from requests
// app.use(cors({
//   origin: [
//     "http://localhost:5173",                
//     "https://hometrack.razeb.com",         
//   ],
//   credentials: true,
// }));

const allowedOrigins = ["http://localhost:5173", "https://hometrack.razeb.com"];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy: This origin is not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));


app.use(express.json());



app.use("/api/items", itemRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/spending", spendingRoutes);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/auth", authRoutes);



// Test route — just to confirm the server works
app.get('/', (req, res) => {
  res.json({ message: 'Home Inventory API is running!' });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;


sequelize.sync({ alter: true }) // creates tables if they don't exist
  .then(() => {
    console.log('Database connected and synced');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

