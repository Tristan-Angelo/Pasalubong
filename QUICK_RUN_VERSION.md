# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with MongoDB connection string

# 3. Create admin account
npm run seed:admin

# 4. Run the application
npm run dev