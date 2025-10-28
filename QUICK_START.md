# ⚡ Pasalubong - Quick Start Guide

Get the Pasalubong platform running in 5 minutes!

---

## 📋 What You Need

Before starting, install these:

1. **Node.js v18+** → [Download](https://nodejs.org/)
2. **MongoDB v6+** → [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud option)

---

## 🚀 Quick Setup (5 Steps)

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Using MongoDB Atlas?** Skip this step and use your Atlas connection string in step 3.

### 3️⃣ Configure Environment

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

Edit `.env` file:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pasalubong
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-to-random-string-in-production
```

**For MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string.

### 4️⃣ Create Admin Account

```bash
npm run seed:admin
```

**Admin Credentials:**
- Username: `admin`
- Password: `pasalubong123`

### 5️⃣ Start the Application

```bash
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Admin Login: http://localhost:5173/admin/login

---

## 🎯 What's Running?

| Service | Port | URL |
|---------|------|-----|
| Frontend (React) | 5173 | http://localhost:5173 |
| Backend (Express) | 3000 | http://localhost:3000 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## 🧪 Quick Test

1. **Open browser:** http://localhost:5173
2. **Login as admin:** http://localhost:5173/admin/login
   - Username: `admin`
   - Password: `pasalubong123`
3. **Create buyer account:** http://localhost:5173/buyer/register

---

## 🔧 Common Issues

### MongoDB Not Running?
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Can't Connect to MongoDB?
Check your `.env` file:
```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/pasalubong

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pasalubong
```

---

## 📚 Next Steps

- **Change admin password** after first login
- **Read full documentation:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Configure email** for verification (optional)
- **Add products** as seller
- **Test order flow** as buyer

---

## 🎓 User Roles

| Role | Registration | Login URL |
|------|--------------|-----------|
| **Admin** | Pre-seeded | http://localhost:5173/admin/login |
| **Buyer** | http://localhost:5173/buyer/register | http://localhost:5173/buyer/login |
| **Seller** | http://localhost:5173/seller/register | http://localhost:5173/seller/login |
| **Delivery** | http://localhost:5173/delivery/register | http://localhost:5173/delivery/login |

**Note:** Sellers and Delivery partners need admin approval after registration.

---

## 📦 Project Structure

```
Pasalubong-2/
├── server/              # Backend (Express + MongoDB)
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   └── index.js         # Server entry point
├── src/                 # Frontend (React)
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   └── utils/api.js     # API client
├── public/              # Static assets
├── .env                 # Environment config (create this)
└── package.json         # Dependencies
```

---

## 🛠️ Available Commands

```bash
# Development (both servers)
npm run dev

# Frontend only
npm run dev:client

# Backend only
npm run dev:server

# Build for production
npm run build

# Start production server
npm start

# Create admin user
npm run seed:admin

# Approve delivery partners
npm run approve:delivery

# Fix database indexes
node server/scripts/fix-buyer-order-indexes.js
```

---

## 🌟 Features

### For Buyers
- Browse and search products
- Shopping cart and favorites
- Multiple delivery addresses
- Order tracking
- Product reviews

### For Sellers
- Product management
- Inventory tracking
- Order processing
- Sales analytics
- Delivery assignment

### For Delivery Partners
- View assigned deliveries
- Route visualization
- Status updates
- Proof of delivery
- Earnings tracking

### For Admins
- Platform oversight
- User management
- Order monitoring
- Analytics dashboard
- Approval system

---

## 📞 Need Help?

- **Full Setup Guide:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Detailed Documentation:** [README.md](README.md)
- **Check logs:** Terminal output and browser console (F12)
- **Database issues:** Use MongoDB Compass to inspect data

---

## ✅ Setup Checklist

Before you start coding:

- [ ] Node.js v18+ installed
- [ ] MongoDB installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Admin user created (`npm run seed:admin`)
- [ ] Application running (`npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Can login as admin

**All checked? You're ready to go! 🎉**

---

**Last Updated:** January 2025