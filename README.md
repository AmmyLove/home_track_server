# 🏡 HomeTrack

> Your little home helper — a personal home inventory and grocery tracking app.

HomeTrack helps you stay on top of what you have at home, what you've spent, and what you need to buy next. It tracks purchases, monitors stock levels, predicts when items will run out, and generates shopping lists from your favourite recipes.

---

## ✨ Features

| Feature | What it does |
|---|---|
| **Items** | Master list of everything you track at home |
| **Purchases** | Log grocery runs with price, quantity and currency |
| **Inventory** | Auto-updated stock levels with low-stock alerts |
| **Consumption** | Log usage to predict when you'll run out |
| **Recipes** | Save dishes and generate shopping lists |
| **Dashboard** | Spending totals, line chart, and restock alerts |

---

## 🔧 Tech Stack

**Backend**
- Node.js + Express.js
- Sequelize ORM
- PostgreSQL
- JWT authentication + bcrypt

**Frontend**
- React (Vite)
- React Router
- Recharts
- Axios

**Hosting**
- Backend → Render
- Frontend → Vercel
- Database → Render PostgreSQL

---

## 🚀 Running locally

### Prerequisites
- Node.js v18+
- PostgreSQL installed and running

### 1. Clone the repo
```bash
git clone https://github.com/AmmyLove/home_track.git
cd home-inventory
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create `server/.env`:

DB_NAME=
DB_USER=
DB_PASSWORD=your_password
DB_HOST=localhost
PORT=5000
JWT_SECRET=your_long_secret_key_here

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE home_inventory;"
```

Start the server:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```

Create `client/.env`:

VITE_API_URL=http://localhost:5000



Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.


---

## 🔐 Authentication

Every account is private. Users register with name, email and password. Passwords are hashed with bcrypt before storage. All API routes are protected with JWT tokens that expire after 7 days.

---

## 💱 Supported currencies

- ₦ NGN — Nigerian Naira
- $ USD — US Dollar  
- € EUR — Euro

Each purchase can use a different currency. Spending totals are grouped by currency so values are never incorrectly mixed.

---

Built with 🌿 and lots of jollof rice.