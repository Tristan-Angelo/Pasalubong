# 🚀 Pasalubong - Complete Setup Guide

A comprehensive guide to set up and run the Pasalubong Filipino Gift Platform.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Admin Setup](#admin-setup)
7. [Testing the Application](#testing-the-application)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **MongoDB** (v6.0 or higher)
   - **Option A - Local Installation:**
     - Windows: https://www.mongodb.com/try/download/community
     - macOS: `brew install mongodb-community`
     - Linux: Follow official MongoDB docs
   - **Option B - MongoDB Atlas (Cloud - Recommended for beginners):**
     - Sign up at: https://www.mongodb.com/cloud/atlas
     - Create a free cluster
     - Get your connection string

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

---

## 📦 Installation Steps

### Step 1: Get the Project

If you already have the project folder, skip to Step 2.

```bash
# If cloning from repository
git clone <repository-url>
cd Pasalubong_new
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend:
- React 19, React Router, Tailwind CSS (Frontend)
- Express, MongoDB, Mongoose, JWT, Bcrypt (Backend)
- Development tools (Vite, Nodemon, Concurrently)

**Expected time:** 2-5 minutes depending on your internet speed

---

## 🗄️ Database Setup

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation wizard

2. **Start MongoDB Service**

   **Windows:**
   ```bash
   # MongoDB should start automatically as a service
   # Or manually start it:
   net start MongoDB
   ```

   **macOS:**
   ```bash
   brew services start mongodb-community
   ```

   **Linux:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Verify MongoDB is Running**
   ```bash
   # Try connecting with mongosh (MongoDB Shell)
   mongosh
   # You should see a connection message
   # Type 'exit' to quit
   ```

### Option B: MongoDB Atlas (Cloud - Easier Setup)

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Configure Access**
   - **Database Access:** Create a database user with password
   - **Network Access:** Add IP address (use `0.0.0.0/0` for development)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pasalubong?retryWrites=true&w=majority`

---

## ⚙️ Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

### Step 2: Edit .env File

Open `.env` in your text editor and configure:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# For LOCAL MongoDB:
MONGODB_URI=mongodb://localhost:27017/pasalubong

# For MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pasalubong?retryWrites=true&w=majority

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-secret-key-change-in-production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (OPTIONAL - for email verification)
# Leave empty to see verification links in console
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 3: Email Setup (Optional)

Email is used for user verification. If not configured, verification links will appear in the console.

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" at: https://myaccount.google.com/apppasswords
3. Use your Gmail address and app password in `.env`

**Without Email:**
- Verification links will be logged to the console
- Copy the link and paste in browser to verify accounts

---

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This starts:
- **Frontend (React + Vite):** http://localhost:5173
- **Backend (Express API):** http://localhost:3000

**You should see:**
```
[0] 
[0] > pasalubong@1.0.0 dev:server
[0] > nodemon server/index.js
[0] 
[1] 
[1] > pasalubong@1.0.0 dev:client
[1] > vite
[1] 
[0] ✅ MongoDB Connected: localhost
[0] 📦 Database: pasalubong
[0] 🚀 Server running on port 3000
[1] 
[1]   VITE v7.1.7  ready in 500 ms
[1] 
[1]   ➜  Local:   http://localhost:5173/
```

### Individual Commands

**Frontend only:**
```bash
npm run dev:client
```

**Backend only:**
```bash
npm run dev:server
```

### Production Mode

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

---

## 👨‍💼 Admin Setup

Before using the admin dashboard, you need to create an admin account.

### Create Admin Account

```bash
npm run seed:admin
```

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `pasalubong123`
- **Email:** `admin@pasalubong.com`

**⚠️ IMPORTANT:** Change the password after first login!

### Access Admin Dashboard

1. Open browser: http://localhost:5173/admin/login
2. Login with credentials above
3. Change password in settings

### Admin Features

- Dashboard with statistics
- Product management (CRUD)
- Order management
- User management (Buyers, Sellers, Delivery)
- Approve delivery persons
- Reports and analytics

---

## 🧪 Testing the Application

### 1. Test Homepage

Open: http://localhost:5173

You should see:
- Hero section with background
- Featured products
- Navigation menu
- Footer

### 2. Test User Registration

**Buyer Registration:**
- Go to: http://localhost:5173/buyer/register
- Fill in the form
- Check console for verification link (if email not configured)
- Click verification link
- Login at: http://localhost:5173/buyer/login

**Seller Registration:**
- Go to: http://localhost:5173/seller/register
- Complete registration
- Verify email
- Login at: http://localhost:5173/seller/login

**Delivery Registration:**
- Go to: http://localhost:5173/delivery/register
- Complete registration
- Verify email
- **Note:** Delivery accounts need admin approval

### 3. Approve Delivery Persons

After delivery person registers:

```bash
npm run approve:delivery
```

This approves all pending delivery accounts.

### 4. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**API Test:**
```bash
curl http://localhost:3000/api/v1/hello
```

---

## 🔍 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoDB Connection Failed`

**Solutions:**
1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Verify connection string in `.env`:**
   - Local: `mongodb://localhost:27017/pasalubong`
   - Atlas: Check your connection string has correct password

3. **Check MongoDB Atlas IP whitelist:**
   - Add `0.0.0.0/0` to Network Access

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
1. **Kill the process using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. **Change port in `.env`:**
   ```env
   PORT=3001
   ```

### Frontend Not Loading

**Error:** Blank page or connection refused

**Solutions:**
1. **Check Vite is running:** Look for `Local: http://localhost:5173/`
2. **Clear browser cache:** Ctrl+Shift+R (hard refresh)
3. **Check console for errors:** F12 → Console tab

### Email Verification Not Working

**Issue:** Not receiving verification emails

**Solutions:**
1. **Check console logs:** Verification links are logged if email not configured
2. **Verify email settings in `.env`:**
   - Correct EMAIL_HOST, EMAIL_PORT
   - Valid EMAIL_USER and EMAIL_PASSWORD
3. **For Gmail:** Use App Password, not regular password

### Admin Login Not Working

**Issue:** Cannot login to admin dashboard

**Solutions:**
1. **Run seed script again:**
   ```bash
   npm run seed:admin
   ```
2. **Check MongoDB connection**
3. **Verify credentials:**
   - Username: `admin`
   - Password: `pasalubong123`

### Dependencies Installation Failed

**Error:** npm install errors

**Solutions:**
1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```
2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

---

## 🌐 Production Deployment

### Build for Production

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret-key>
FRONTEND_URL=<your-production-domain>
EMAIL_HOST=<production-email-host>
EMAIL_USER=<production-email>
EMAIL_PASSWORD=<production-email-password>
```

### Start Production Server

```bash
npm start
```

### Deployment Platforms

**Recommended platforms:**

1. **Heroku**
   - Easy deployment
   - Free tier available
   - MongoDB Atlas integration

2. **Railway**
   - Modern platform
   - GitHub integration
   - Free tier

3. **DigitalOcean**
   - Full control
   - Droplets or App Platform
   - MongoDB hosting

4. **Vercel/Netlify** (Frontend) + **Render** (Backend)
   - Separate frontend and backend
   - Free tiers available

### Production Checklist

- [ ] Update JWT_SECRET to strong random string
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Set up email service (SendGrid, Mailgun, etc.)
- [ ] Enable HTTPS/SSL
- [ ] Set up domain name
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Create database backups
- [ ] Update admin password
- [ ] Test all features in production

---

## 📱 Application Features

### User Roles

1. **Buyers**
   - Browse products
   - Add to cart
   - Place orders
   - Track deliveries
   - Write reviews

2. **Sellers**
   - Add products
   - Manage inventory
   - Process orders
   - View analytics
   - Handle customer inquiries

3. **Delivery Partners**
   - View assigned deliveries
   - Accept/decline deliveries
   - Update delivery status
   - View route maps
   - Track earnings

4. **Admin**
   - Manage all users
   - Approve sellers/delivery
   - Monitor orders
   - Generate reports
   - System settings

---

## 🛠️ Development Tools

### Available Scripts

```bash
npm run dev              # Run both frontend and backend
npm run dev:client       # Run frontend only
npm run dev:server       # Run backend only
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run preview          # Preview production build
npm run seed:admin       # Create admin account
npm run approve:delivery # Approve delivery persons
```

### Project Structure

```
Pasalubong_new/
├── public/              # Static assets
│   ├── assets/          # Images, icons
│   └── uploads/         # User uploads
├── server/              # Backend (Express)
│   ├── config/          # Database, email config
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── utils/           # Helper functions
├── src/                 # Frontend (React)
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   └── utils/           # Frontend utilities
├── .env                 # Environment variables
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

---

## 📞 Support

### Common Issues

1. **MongoDB not connecting:** Check database setup section
2. **Port conflicts:** Change PORT in .env
3. **Email not working:** Check email configuration or use console links
4. **Admin can't login:** Run `npm run seed:admin`

### Getting Help

- Check this guide thoroughly
- Review error messages in console
- Check MongoDB connection
- Verify .env configuration
- Ensure all dependencies are installed

---

## 🎉 Success!

If you see:
- ✅ MongoDB Connected
- 🚀 Server running on port 3000
- ➜ Local: http://localhost:5173/

**Congratulations!** Your Pasalubong platform is running successfully!

### Next Steps:

1. Create admin account: `npm run seed:admin`
2. Login to admin dashboard
3. Add some products
4. Test buyer registration and ordering
5. Test seller registration and product management
6. Test delivery person workflow

---

**Built with ❤️ for authentic Filipino delicacies from Carigara & Barugo**

---

## 📄 Additional Documentation

- `README.md` - Project overview
- `BACKEND_INTEGRATION.md` - API documentation
- `.env.example` - Environment variables reference

---

*Last Updated: 2024*