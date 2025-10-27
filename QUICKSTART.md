# ⚡ Quick Start Guide - Pasalubong

Get the Pasalubong platform running in 5 minutes!

---

## 🚀 Prerequisites

- Node.js (v18+) - [Download](https://nodejs.org/)
- MongoDB running locally OR [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas)

---

## 📦 Installation (3 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment file
cp .env.example .env
```

**Edit `.env` file:**

For **Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/pasalubong
```

For **MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/pasalubong
```

### 3. Create Admin Account

```bash
npm run seed:admin
```

**Admin Credentials:**
- Username: `admin`
- Password: `pasalubong123`

---

## ▶️ Run the Application

```bash
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:5173/admin/login

---

## ✅ Verify Setup

### Test Homepage
Open: http://localhost:5173

### Test Admin Login
1. Go to: http://localhost:5173/admin/login
2. Login with: `admin` / `pasalubong123`

### Test API
```bash
curl http://localhost:3000/health
```

---

## 🎯 Common Tasks

### Approve Delivery Persons
```bash
npm run approve:delivery
```

### Reset Admin Password
```bash
npm run seed:admin
# Answer 'yes' when prompted
```

### Build for Production
```bash
npm run build
npm start
```

---

## 🔧 Troubleshooting

### MongoDB Connection Failed
**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**MongoDB Atlas:**
- Check connection string in `.env`
- Verify password is correct
- Add `0.0.0.0/0` to Network Access

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Clear Everything and Restart
```bash
# Stop the server (Ctrl+C)
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📚 User Accounts

### Buyer
- Register: http://localhost:5173/buyer/register
- Login: http://localhost:5173/buyer/login

### Seller
- Register: http://localhost:5173/seller/register
- Login: http://localhost:5173/seller/login

### Delivery
- Register: http://localhost:5173/delivery/register
- Login: http://localhost:5173/delivery/login
- **Note:** Needs admin approval (`npm run approve:delivery`)

### Admin
- Login: http://localhost:5173/admin/login
- Username: `admin` / Password: `pasalubong123`

---

## 🎉 You're Ready!

The platform is now running. Check the full [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed information.

---

**Need help?** Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed troubleshooting.