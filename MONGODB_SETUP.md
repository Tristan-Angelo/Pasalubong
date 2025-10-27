# 🗄️ MongoDB Setup Guide

Complete guide to setting up MongoDB for the Pasalubong platform.

---

## 📋 Choose Your Setup Method

1. **[MongoDB Atlas (Cloud)](#option-1-mongodb-atlas-cloud)** - Recommended for beginners
   - ✅ No installation required
   - ✅ Free tier available
   - ✅ Automatic backups
   - ✅ Works from anywhere

2. **[Local MongoDB](#option-2-local-mongodb)** - Recommended for development
   - ✅ Full control
   - ✅ No internet required
   - ✅ Faster for local development
   - ❌ Requires installation

---

## Option 1: MongoDB Atlas (Cloud)

### Step 1: Create Account

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google account

### Step 2: Create Cluster

1. Click "Build a Database"
2. Choose **"M0 FREE"** tier
3. Select cloud provider (AWS, Google Cloud, or Azure)
4. Choose region closest to you
5. Cluster Name: `Pasalubong` (or keep default)
6. Click **"Create Cluster"**

**Wait 3-5 minutes** for cluster to be created.

### Step 3: Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `pasalubong_user` (or your choice)
5. Password: Click "Autogenerate Secure Password" (save this!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Choose one:
   - **For Development:** Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **For Production:** Add your specific IP address
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string

**Example:**
```
mongodb+srv://pasalubong_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Update Your .env File

1. Open `.env` file in your project
2. Replace `<password>` with your database user password
3. Add database name after `.net/`:

```env
MONGODB_URI=mongodb+srv://pasalubong_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pasalubong?retryWrites=true&w=majority
```

**Important:** 
- Replace `YOUR_PASSWORD` with actual password
- Add `/pasalubong` before the `?` to specify database name

### Step 7: Test Connection

```bash
npm run dev
```

Look for:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📦 Database: pasalubong
```

---

## Option 2: Local MongoDB

### Windows Installation

#### Step 1: Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Version: Select latest version
3. Platform: Windows
4. Package: MSI
5. Click **"Download"**

#### Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Choose **"Complete"** installation
3. **Important:** Check **"Install MongoDB as a Service"**
4. Check **"Install MongoDB Compass"** (GUI tool)
5. Click **"Next"** and **"Install"**

#### Step 3: Verify Installation

```bash
# Open Command Prompt or PowerShell
mongosh --version
```

You should see version information.

#### Step 4: Start MongoDB Service

MongoDB should start automatically. If not:

```bash
# Start MongoDB service
net start MongoDB

# Check if running
sc query MongoDB
```

#### Step 5: Configure .env

```env
MONGODB_URI=mongodb://localhost:27017/pasalubong
```

---

### macOS Installation

#### Step 1: Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Install MongoDB

```bash
# Tap MongoDB formula
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community
```

#### Step 3: Start MongoDB

```bash
# Start MongoDB service
brew services start mongodb-community

# Verify it's running
brew services list
```

#### Step 4: Configure .env

```env
MONGODB_URI=mongodb://localhost:27017/pasalubong
```

---

### Linux (Ubuntu/Debian) Installation

#### Step 1: Import MongoDB GPG Key

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
```

#### Step 2: Add MongoDB Repository

```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

#### Step 3: Install MongoDB

```bash
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Step 4: Start MongoDB

```bash
# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

#### Step 5: Configure .env

```env
MONGODB_URI=mongodb://localhost:27017/pasalubong
```

---

## 🔍 Verify MongoDB Connection

### Test with mongosh (MongoDB Shell)

```bash
# Connect to local MongoDB
mongosh

# Or connect to Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/pasalubong" --username pasalubong_user
```

You should see:
```
Current Mongosh Log ID: xxxxx
Connecting to: mongodb://localhost:27017/
Using MongoDB: 7.0.x
```

### Test with Your Application

```bash
npm run dev
```

Look for:
```
✅ MongoDB Connected: localhost (or your Atlas cluster)
📦 Database: pasalubong
🚀 Server running on port 3000
```

---

## 🛠️ MongoDB Tools

### MongoDB Compass (GUI)

**Download:** https://www.mongodb.com/try/download/compass

**Connect:**
- Local: `mongodb://localhost:27017`
- Atlas: Use connection string from Atlas

**Features:**
- Visual database browser
- Query builder
- Performance monitoring
- Index management

### mongosh (Shell)

**Useful Commands:**

```bash
# Show databases
show dbs

# Use database
use pasalubong

# Show collections
show collections

# Count documents
db.buyers.countDocuments()
db.sellers.countDocuments()
db.products.countDocuments()

# Find documents
db.buyers.find().pretty()

# Exit
exit
```

---

## 🔧 Troubleshooting

### Cannot Connect to MongoDB

**Local MongoDB:**

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   sc query MongoDB
   
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mongod
   ```

2. **Start MongoDB if not running:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Check MongoDB logs:**
   - Windows: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
   - macOS: `/usr/local/var/log/mongodb/mongo.log`
   - Linux: `/var/log/mongodb/mongod.log`

**MongoDB Atlas:**

1. **Check connection string:**
   - Password is correct (no special characters need URL encoding)
   - Database name is included: `/pasalubong?`
   
2. **Check Network Access:**
   - IP address is whitelisted
   - Try adding `0.0.0.0/0` for testing

3. **Check Database User:**
   - User exists in Database Access
   - Has correct permissions

### Port 27017 Already in Use

```bash
# Windows
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:27017 | xargs kill -9
```

### MongoDB Service Won't Start

**Windows:**
1. Open Services (services.msc)
2. Find "MongoDB Server"
3. Right-click → Start
4. If fails, check Event Viewer for errors

**macOS:**
```bash
# Check for errors
brew services list

# Reinstall if needed
brew reinstall mongodb-community
```

**Linux:**
```bash
# Check logs
sudo journalctl -u mongod

# Reset and restart
sudo systemctl reset-failed mongod
sudo systemctl start mongod
```

---

## 🔐 Security Best Practices

### For Production

1. **Enable Authentication:**
   ```bash
   # Create admin user in mongosh
   use admin
   db.createUser({
     user: "admin",
     pwd: "strongPassword",
     roles: ["root"]
   })
   ```

2. **Use Strong Passwords:**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

3. **Restrict Network Access:**
   - Don't use 0.0.0.0/0 in production
   - Whitelist specific IPs only

4. **Enable SSL/TLS:**
   - Atlas enables this by default
   - For local, configure in mongod.conf

5. **Regular Backups:**
   - Atlas: Automatic backups in paid tiers
   - Local: Use mongodump/mongorestore

---

## 📊 Database Structure

The Pasalubong platform uses these collections:

- `admins` - Admin users
- `buyers` - Customer accounts
- `sellers` - Seller accounts
- `deliveries` - Delivery person accounts
- `products` - Product catalog
- `buyerorders` - Customer orders
- `buyercarts` - Shopping carts
- `notifications` - User notifications
- `reviews` - Product reviews

---

## 🎯 Next Steps

After MongoDB is set up:

1. ✅ Update `.env` with connection string
2. ✅ Run `npm run dev` to start application
3. ✅ Run `npm run seed:admin` to create admin account
4. ✅ Access http://localhost:5173

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)

---

**Need more help?** Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete setup instructions.