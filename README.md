# Pasalubong - Professional Filipino Gift Platform

A comprehensive, full-stack e-commerce platform for authentic Filipino gifts and delicacies from Carigara & Barugo, Leyte. Built with modern web technologies and designed for scalability, security, and excellent user experience.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [User Roles & Workflows](#-user-roles--workflows)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Frontend-Backend Interaction](#-frontend-backend-interaction)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

**Pasalubong** is a multi-vendor marketplace platform that connects Filipino gift sellers with buyers worldwide, featuring integrated delivery management and comprehensive admin controls. The platform supports three distinct user types (Buyers, Sellers, and Delivery Partners) plus an administrative dashboard for platform management.

### Key Highlights

- **Multi-vendor marketplace** with seller onboarding and product management
- **Real-time order tracking** with delivery assignment system
- **Secure authentication** with email verification and password reset
- **Role-based access control** for Buyers, Sellers, Delivery Partners, and Admins
- **Responsive design** optimized for mobile, tablet, and desktop
- **Notification system** for order updates and platform events
- **Product reviews and ratings** with image uploads
- **Shopping cart and favorites** management
- **Address management** with geocoding support
- **Interactive maps** for delivery route visualization

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React 19 SPA (Vite Dev Server)               │   │
│  │  - React Router for navigation                       │   │
│  │  - Tailwind CSS for styling                          │   │
│  │  - Component-based architecture                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Express.js Server (Port 3000)                │   │
│  │  - CORS, Helmet, Compression middleware              │   │
│  │  - JWT authentication                                │   │
│  │  - RESTful API endpoints                             │   │
│  │  - File upload handling (Multer)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB Database                        │   │
│  │  - Users (Buyers, Sellers, Delivery, Admins)        │   │
│  │  - Products, Orders, Reviews                         │   │
│  │  - Carts, Favorites, Addresses                       │   │
│  │  - Notifications                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SMTP
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  - Email Service (Nodemailer)                               │
│  - File Storage (Local/Public folder)                       │
│  - Geocoding Service (for addresses)                        │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request**: User interacts with React frontend
2. **API Call**: Frontend makes HTTP request to Express backend via `src/utils/api.js`
3. **Authentication**: JWT token validated by middleware (if protected route)
4. **Route Handler**: Express route processes request
5. **Database Operation**: Mongoose performs CRUD operations on MongoDB
6. **Response**: JSON response sent back to client
7. **UI Update**: React component updates based on response

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI library for building component-based interfaces |
| React Router DOM | 6.28.0 | Client-side routing and navigation |
| Vite | 7.1.7 | Fast build tool and dev server with HMR |
| Tailwind CSS | 3.4.18 | Utility-first CSS framework for styling |
| Leaflet | 1.9.4 | Interactive maps for delivery routes |
| React Leaflet | 5.0.0 | React components for Leaflet maps |
| Recharts | 3.3.0 | Charts and data visualization |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.18.2 | Web application framework |
| MongoDB | 6.8.0 | NoSQL database |
| Mongoose | 8.6.0 | MongoDB ODM for data modeling |
| JWT | 9.0.2 | Token-based authentication |
| Bcrypt.js | 3.0.2 | Password hashing |
| Nodemailer | 7.0.9 | Email sending service |
| Multer | 2.0.2 | File upload handling |
| Helmet | 7.1.0 | Security headers |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Morgan | 1.10.0 | HTTP request logging |
| Compression | 1.7.4 | Response compression |

### Development Tools

| Tool | Purpose |
|------|---------|
| Nodemon | Backend hot reload during development |
| Concurrently | Run multiple npm scripts simultaneously |
| ESLint | Code linting and quality checks |
| PostCSS | CSS processing with Autoprefixer |

---

## ✨ Features

### For Buyers
- ✅ Browse products by category with search and filters
- ✅ Add products to cart and favorites
- ✅ Manage multiple delivery addresses
- ✅ Place orders with COD payment
- ✅ Track order status in real-time
- ✅ Write reviews and rate products
- ✅ View order history and receipts
- ✅ Email verification and password reset
- ✅ Profile management with photo upload

### For Sellers
- ✅ Register and get admin approval
- ✅ Add, edit, and delete products
- ✅ Upload multiple product images
- ✅ Manage inventory and stock levels
- ✅ View and process orders
- ✅ Assign delivery partners to orders
- ✅ Track sales and revenue statistics
- ✅ Receive notifications for new orders
- ✅ Manage business profile and payment info

### For Delivery Partners
- ✅ Register and get admin approval
- ✅ View assigned deliveries
- ✅ Accept or decline delivery requests
- ✅ Update delivery status with proof
- ✅ View delivery routes on interactive maps
- ✅ Track earnings and statistics
- ✅ Manage availability status
- ✅ Receive real-time notifications

### For Admins
- ✅ Complete platform oversight dashboard
- ✅ Approve/reject seller and delivery registrations
- ✅ Manage all products across sellers
- ✅ Monitor and manage all orders
- ✅ View platform statistics and analytics
- ✅ Manage user accounts (buyers, sellers, delivery)
- ✅ Assign delivery partners to orders
- ✅ System configuration and settings

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Installation Guide](https://www.mongodb.com/docs/manual/installation/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Pasalubong (1)"
```

#### 2. Install Dependencies

```bash
npm install
```

This installs all frontend and backend dependencies defined in `package.json`.

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/pasalubong

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/pasalubong?retryWrites=true&w=majority

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Optional)
# For Gmail:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Important Notes:**
- If email is not configured, verification links will be logged to the console
- For Gmail, you need to generate an [App Password](https://myaccount.google.com/apppasswords)
- Change `JWT_SECRET` to a strong random string in production

#### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# If MongoDB is installed as a service
net start MongoDB

# Or run manually
mongod
```

**macOS/Linux:**
```bash
# If installed via Homebrew (macOS)
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

#### 5. Seed Admin Account

Create the initial admin user:

```bash
npm run seed:admin
```

This creates an admin account with:
- **Username:** `admin`
- **Password:** `pasalubong123`
- **Email:** `admin@pasalubong.com`

⚠️ **Change the password after first login!**

#### 6. Start the Application

```bash
npm run dev
```

This starts both servers:
- **Frontend (React + Vite):** http://localhost:5173
- **Backend (Express):** http://localhost:3000

### Access the Application

- **Homepage:** http://localhost:5173
- **Admin Login:** http://localhost:5173/admin/login
- **Buyer Login:** http://localhost:5173/buyer/login
- **Seller Login:** http://localhost:5173/seller/login
- **Delivery Login:** http://localhost:5173/delivery/login

---

## 📁 Project Structure

```
Pasalubong/
│
├── public/                          # Static assets served by Express
│   ├── assets/
│   │   └── images/                  # Product and marketing images
│   └── uploads/                     # User-uploaded files (created at runtime)
│
├── server/                          # Backend (Express.js)
│   ├── config/
│   │   ├── database.js              # MongoDB connection setup
│   │   ├── email.js                 # Nodemailer email service
│   │   └── upload.js                # Multer file upload config
│   │
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT authentication middleware
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── Admin.js                 # Admin user model
│   │   ├── Buyer.js                 # Buyer user model
│   │   ├── BuyerProfile.js          # Extended buyer profile
│   │   ├── BuyerAddress.js          # Buyer delivery addresses
│   │   ├── BuyerCart.js             # Shopping cart
│   │   ├── BuyerFavorite.js         # Favorite products
│   │   ├── BuyerOrder.js            # Buyer orders
│   │   ├── Seller.js                # Seller user model
│   │   ├── Delivery.js              # Delivery partner model
│   │   ├── Product.js               # Product catalog
│   │   ├── Order.js                 # Legacy order model
│   │   └── Notification.js          # System notifications
│   │
│   ├── routes/
│   │   ├── api/
│   │   │   ├── index.js             # API router aggregator
│   │   │   ├── auth.js              # Authentication endpoints
│   │   │   ├── admin.js             # Admin endpoints
│   │   │   ├── buyer.js             # Buyer endpoints
│   │   │   ├── seller.js            # Seller endpoints
│   │   │   ├── delivery.js          # Delivery endpoints
│   │   │   └── public.js            # Public endpoints (no auth)
│   │   └── health.js                # Health check endpoint
│   │
│   ├── scripts/
│   │   ├── seedAdmin.js             # Create initial admin user
│   │   ├── approveDeliveryPersons.js # Bulk approve delivery partners
│   │   └── fixDeliveryNames.js      # Data migration script
│   │
│   ├── utils/
│   │   ├── geocoding.js             # Address geocoding utilities
│   │   └── notificationService.js   # Notification creation service
│   │
│   └── index.js                     # Express server entry point
│
├── src/                             # Frontend (React)
│   ├── assets/
│   │   └── react.svg                # React logo
│   │
│   ├── components/                  # Reusable React components
│   │   ├── Navigation.jsx           # Main navigation bar
│   │   ├── Footer.jsx               # Footer component
│   │   ├── DashboardSidebar.jsx     # Dashboard sidebar navigation
│   │   ├── ProductCard.jsx          # Product display card
│   │   ├── ReviewCard.jsx           # Review display card
│   │   ├── ReviewModal.jsx          # Review submission modal
│   │   ├── ProtectedRoute.jsx       # Route authentication wrapper
│   │   ├── RouteMap.jsx             # Delivery route map
│   │   ├── AddressAutocomplete.jsx  # Address input with autocomplete
│   │   ├── AccountSettings.jsx      # Account settings component
│   │   └── ProfileSettings.jsx      # Profile settings component
│   │
│   ├── pages/                       # Page components
│   │   ├── common/
│   │   │   ├── HomePage.jsx         # Landing page
│   │   │   ├── AllProductsPage.jsx  # Product catalog page
│   │   │   └── VerifyEmail.jsx      # Email verification page
│   │   │
│   │   ├── buyer/
│   │   │   ├── BuyerLogin.jsx       # Buyer login page
│   │   │   ├── BuyerRegister.jsx    # Buyer registration page
│   │   │   ├── BuyerDashboard.jsx   # Buyer dashboard
│   │   │   ├── BuyerForgotPassword.jsx
│   │   │   └── BuyerResetPassword.jsx
│   │   │
│   │   ├── seller/
│   │   │   ├── SellerLogin.jsx      # Seller login page
│   │   │   ├── SellerRegister.jsx   # Seller registration page
│   │   │   ├── SellerDashboard.jsx  # Seller dashboard
│   │   │   ├── SellerForgotPassword.jsx
│   │   │   └── SellerResetPassword.jsx
│   │   │
│   │   ├── delivery/
│   │   │   ├── DeliveryLogin.jsx    # Delivery login page
│   │   │   ├── DeliveryRegister.jsx # Delivery registration page
│   │   │   ├── DeliveryDashboard.jsx # Delivery dashboard
│   │   │   ├── DeliveryForgotPassword.jsx
│   │   │   └── DeliveryResetPassword.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminLogin.jsx       # Admin login page
│   │       └── AdminDashboard.jsx   # Admin dashboard
│   │
│   ├── utils/
│   │   └── api.js                   # API client with all endpoints
│   │
│   ├── App.jsx                      # Main app component with routing
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Global styles + Tailwind directives
│
├── .env                             # Environment variables (create from .env.example)
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies and scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── eslint.config.js                 # ESLint configuration
├── nodemon.json                     # Nodemon configuration
└── README.md                        # This file
```

---

## 👥 User Roles & Workflows

### 1. Buyer Workflow

```
Registration → Email Verification → Login → Browse Products
     ↓
Add to Cart/Favorites → Manage Addresses → Place Order
     ↓
Track Order → Receive Delivery → Write Review
```

**Key Features:**
- Browse and search products
- Manage shopping cart and favorites
- Multiple delivery addresses
- Order tracking
- Product reviews with images

### 2. Seller Workflow

```
Registration → Admin Approval → Email Verification → Login
     ↓
Add Products → Manage Inventory → Receive Orders
     ↓
Process Orders → Assign Delivery → Track Sales
```

**Key Features:**
- Product management (CRUD)
- Inventory tracking
- Order processing
- Delivery assignment
- Sales analytics

### 3. Delivery Partner Workflow

```
Registration → Admin Approval → Email Verification → Login
     ↓
View Assignments → Accept/Decline → Pick Up Order
     ↓
Update Status → View Route → Complete Delivery → Upload Proof
```

**Key Features:**
- Delivery assignment management
- Route visualization
- Status updates
- Proof of delivery
- Earnings tracking

### 4. Admin Workflow

```
Login (Seeded Account) → Dashboard Overview
     ↓
Approve Sellers/Delivery → Manage Products → Monitor Orders
     ↓
View Analytics → Manage Users → System Configuration
```

**Key Features:**
- Platform-wide oversight
- User approval system
- Order management
- Analytics and reporting
- System configuration

---

## 🔌 API Documentation

### Base URL

- **Development:** `http://localhost:3000/api/v1`
- **Production:** `https://yourdomain.com/api/v1`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints Overview

#### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/products` | Get all products with filters |
| GET | `/public/products/:id` | Get single product details |
| GET | `/public/products/:id/reviews` | Get product reviews |
| GET | `/public/reviews/recent` | Get recent reviews |
| GET | `/public/categories` | Get product categories |

#### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/buyer/register` | Register new buyer |
| POST | `/auth/buyer/login` | Buyer login |
| POST | `/auth/seller/register` | Register new seller |
| POST | `/auth/seller/login` | Seller login |
| POST | `/auth/delivery/register` | Register delivery partner |
| POST | `/auth/delivery/login` | Delivery login |
| POST | `/auth/admin/login` | Admin login |
| GET | `/auth/:userType/verify-email` | Verify email with token |
| POST | `/auth/:userType/forgot-password` | Request password reset |
| POST | `/auth/:userType/reset-password` | Reset password with code |

#### Buyer Endpoints (Requires Buyer Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buyer/profile` | Get buyer profile |
| PUT | `/buyer/profile` | Update buyer profile |
| PUT | `/buyer/profile/email` | Change email |
| PUT | `/buyer/profile/password` | Change password |
| GET | `/buyer/products` | Get products (authenticated) |
| GET | `/buyer/cart` | Get shopping cart |
| POST | `/buyer/cart` | Add item to cart |
| PUT | `/buyer/cart/:productId` | Update cart item |
| DELETE | `/buyer/cart/:productId` | Remove from cart |
| GET | `/buyer/favorites` | Get favorite products |
| POST | `/buyer/favorites/:productId` | Add to favorites |
| DELETE | `/buyer/favorites/:productId` | Remove from favorites |
| GET | `/buyer/addresses` | Get delivery addresses |
| POST | `/buyer/addresses` | Add new address |
| PUT | `/buyer/addresses/:id` | Update address |
| DELETE | `/buyer/addresses/:id` | Delete address |
| PUT | `/buyer/addresses/:id/default` | Set default address |
| GET | `/buyer/orders` | Get order history |
| POST | `/buyer/orders` | Place new order |
| GET | `/buyer/orders/:id` | Get order details |
| PUT | `/buyer/orders/:id/cancel` | Cancel order |
| POST | `/buyer/orders/:id/reviews` | Submit product reviews |

#### Seller Endpoints (Requires Seller Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/seller/profile` | Get seller profile |
| PUT | `/seller/profile` | Update seller profile |
| PUT | `/seller/change-email` | Change email |
| PUT | `/seller/change-password` | Change password |
| GET | `/seller/products` | Get seller's products |
| POST | `/seller/products` | Add new product |
| PUT | `/seller/products/:id` | Update product |
| DELETE | `/seller/products/:id` | Delete product |
| POST | `/seller/products/upload-image` | Upload single image |
| POST | `/seller/products/upload-images` | Upload multiple images |
| GET | `/seller/orders` | Get seller's orders |
| PUT | `/seller/orders/:id/status` | Update order status |
| GET | `/seller/statistics` | Get sales statistics |
| GET | `/seller/delivery-persons` | Get available delivery partners |
| PUT | `/seller/orders/:id/assign-delivery` | Assign delivery partner |
| GET | `/seller/notifications` | Get notifications |
| PUT | `/seller/notifications/:id/read` | Mark notification as read |

#### Delivery Endpoints (Requires Delivery Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery/profile` | Get delivery profile |
| PUT | `/delivery/profile` | Update delivery profile |
| PUT | `/delivery/change-email` | Change email |
| PUT | `/delivery/change-password` | Change password |
| GET | `/delivery/deliveries` | Get assigned deliveries |
| POST | `/delivery/deliveries/:id/accept` | Accept delivery |
| POST | `/delivery/deliveries/:id/decline` | Decline delivery |
| PUT | `/delivery/deliveries/:id/status` | Update delivery status |
| GET | `/delivery/deliveries/:id/route` | Get delivery route |
| GET | `/delivery/statistics` | Get delivery statistics |
| GET | `/delivery/earnings` | Get earnings data |
| GET | `/delivery/notifications` | Get notifications |

#### Admin Endpoints (Requires Admin Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/profile` | Get admin profile |
| PUT | `/admin/profile` | Update admin profile |
| GET | `/admin/customers` | Get all buyers |
| GET | `/admin/sellers` | Get all sellers |
| GET | `/admin/riders` | Get all delivery partners |
| DELETE | `/admin/customers/:id` | Delete buyer |
| DELETE | `/admin/sellers/:id` | Delete seller |
| DELETE | `/admin/riders/:id` | Delete delivery partner |
| GET | `/admin/products` | Get all products |
| POST | `/admin/products` | Create product |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Delete product |
| GET | `/admin/orders` | Get all orders |
| GET | `/admin/buyer-orders` | Get buyer orders |
| PUT | `/admin/buyer-orders/:id/assign-delivery` | Assign delivery |
| GET | `/admin/delivery-persons` | Get delivery partners |
| GET | `/admin/notifications` | Get notifications |

### Example API Calls

#### Register a Buyer

```javascript
POST /api/v1/auth/buyer/register
Content-Type: application/json

{
  "fullname": "Juan Dela Cruz",
  "email": "juan@example.com",
  "phone": "+639123456789",
  "region": "Region VIII",
  "province": "Leyte",
  "city": "Carigara",
  "barangay": "Poblacion",
  "password": "securepassword123"
}
```

#### Login

```javascript
POST /api/v1/auth/buyer/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "securepassword123"
}

// Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "fullname": "Juan Dela Cruz",
    "email": "juan@example.com",
    "role": "buyer"
  }
}
```

#### Add to Cart

```javascript
POST /api/v1/buyer/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

#### Place Order

```javascript
POST /api/v1/buyer/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "addressId": "address_id",
  "paymentMethod": "Cash on Delivery",
  "notes": "Please call before delivery"
}
```

---

## 🗄️ Database Schema

### User Collections

#### Buyer
```javascript
{
  _id: ObjectId,
  fullname: String,
  email: String (unique, indexed),
  phone: String,
  region: String,
  province: String,
  city: String,
  barangay: String,
  password: String (hashed),
  isEmailVerified: Boolean,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordCode: String,
  resetPasswordExpires: Date,
  role: "buyer",
  createdAt: Date,
  updatedAt: Date
}
```

#### Seller
```javascript
{
  _id: ObjectId,
  businessName: String,
  ownerName: String,
  email: String (unique, indexed),
  phone: String,
  palawanPayNumber: String,
  palawanPayName: String,
  businessType: String (enum),
  region: String,
  province: String,
  city: String,
  barangay: String,
  password: String (hashed),
  isEmailVerified: Boolean,
  isApproved: Boolean,
  photo: String,
  role: "seller",
  createdAt: Date,
  updatedAt: Date
}
```

#### Delivery
```javascript
{
  _id: ObjectId,
  fullname: String,
  email: String (unique, indexed),
  phone: String,
  vehicleType: String (enum),
  vehiclePlate: String,
  licenseNumber: String,
  region: String,
  province: String,
  city: String,
  barangay: String,
  password: String (hashed),
  isEmailVerified: Boolean,
  isApproved: Boolean,
  isAvailable: Boolean,
  isActive: Boolean,
  photo: String,
  role: "delivery",
  createdAt: Date,
  updatedAt: Date
}
```

#### Admin
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  phone: String,
  role: "admin",
  isActive: Boolean,
  photo: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Product & Order Collections

#### Product
```javascript
{
  _id: ObjectId,
  sku: String (unique),
  name: String,
  category: String (enum),
  price: Number,
  stock: Number,
  seller: String,
  description: String,
  image: String,
  images: [String],
  rating: Number,
  reviewCount: Number,
  reviews: [{
    buyerId: ObjectId (ref: Buyer),
    buyerName: String,
    buyerPhoto: String,
    orderId: ObjectId (ref: BuyerOrder),
    rating: Number,
    comment: String,
    images: [String],
    createdAt: Date,
    helpful: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### BuyerOrder
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated),
  buyerId: ObjectId (ref: Buyer),
  items: [{
    productId: ObjectId (ref: Product),
    productName: String,
    productImage: String,
    sellerId: ObjectId (ref: Seller),
    sellerName: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  status: String (enum),
  paymentMethod: String,
  shippingAddress: {
    fullAddress: String,
    region: String,
    province: String,
    city: String,
    barangay: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryPersonId: ObjectId (ref: Delivery),
  deliveryPersonName: String,
  deliveryFee: Number,
  proofOfDelivery: String,
  proofOfDeliveryImages: [String],
  notes: String,
  cancelReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Supporting Collections

#### BuyerCart
```javascript
{
  _id: ObjectId,
  buyerId: ObjectId (ref: Buyer, unique),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    addedAt: Date
  }],
  updatedAt: Date
}
```

#### BuyerAddress
```javascript
{
  _id: ObjectId,
  buyerId: ObjectId (ref: Buyer),
  label: String,
  fullAddress: String,
  region: String,
  province: String,
  city: String,
  barangay: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification
```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,
  recipientModel: String (enum: Admin, Seller, Delivery, Buyer),
  type: String (enum),
  title: String,
  message: String,
  data: Mixed,
  isRead: Boolean,
  priority: String (enum),
  createdAt: Date (expires after 30 days)
}
```

---

## 🔄 Frontend-Backend Interaction

### How It Works

The Pasalubong platform uses a **client-server architecture** where the React frontend communicates with the Express backend through RESTful APIs.

### Communication Flow

```
┌─────────────────┐         HTTP Request          ┌─────────────────┐
│                 │  ────────────────────────────> │                 │
│  React Frontend │                                │ Express Backend │
│  (Port 5173)    │  <────────────────────────────│  (Port 3000)    │
│                 │         JSON Response          │                 │
└─────────────────┘                                └─────────────────┘
```

### API Client (`src/utils/api.js`)

All API calls are centralized in `src/utils/api.js`, which provides:

1. **Base Configuration**
   - Automatic environment detection (dev/prod)
   - Base URL configuration
   - Default headers (Content-Type, Authorization)

2. **Error Handling**
   - Consistent error format
   - Field-level validation errors
   - Network error detection

3. **Authentication**
   - Automatic token injection from localStorage/sessionStorage
   - Token management for different user types
   - Separate auth helpers for each role

### Example: Adding Product to Cart

**Frontend (React Component):**
```javascript
import { addToCart } from '../utils/api';

const handleAddToCart = async (productId) => {
  try {
    const response = await addToCart(productId, 1);
    console.log('Added to cart:', response);
    // Update UI
  } catch (error) {
    console.error('Error:', error.message);
    // Show error to user
  }
};
```

**API Client (`src/utils/api.js`):**
```javascript
export const addToCart = async (productId, quantity = 1) => {
  return buyerApiCall('/buyer/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  });
};

const buyerApiCall = async (endpoint, options = {}) => {
  const token = getBuyerToken(); // Get from localStorage
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};
```

**Backend Route (`server/routes/api/buyer.js`):**
```javascript
router.post('/cart', authenticateBuyer, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const buyerId = req.buyerId; // From auth middleware
    
    // Find or create cart
    let cart = await BuyerCart.findOne({ buyerId });
    if (!cart) {
      cart = new BuyerCart({ buyerId, items: [] });
    }
    
    // Add/update item
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    await cart.save();
    
    res.json({
      success: true,
      cart: cart
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});
```

### Development Proxy

During development, Vite proxies API requests to the Express server:

**`vite.config.js`:**
```javascript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

This means:
- Frontend makes request to: `http://localhost:5173/api/v1/buyer/cart`
- Vite proxies it to: `http://localhost:3000/api/v1/buyer/cart`
- No CORS issues during development

### Production Setup

In production:
- React app is built to `dist/` folder
- Express serves the built files as static assets
- All requests go to the same origin
- API routes are handled by Express
- Non-API routes serve `index.html` (for React Router)

---

## 💻 Development Guide

### Running the Application

#### Development Mode (Recommended)

Start both frontend and backend with hot reload:

```bash
npm run dev
```

This runs:
- Frontend: `vite` (port 5173)
- Backend: `nodemon server/index.js` (port 3000)

#### Individual Servers

**Frontend only:**
```bash
npm run dev:client
```

**Backend only:**
```bash
npm run dev:server
```

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `concurrently "npm run dev:server" "npm run dev:client"` | Start both servers |
| `dev:client` | `vite` | Start Vite dev server |
| `dev:server` | `nodemon server/index.js` | Start Express with nodemon |
| `build` | `vite build` | Build for production |
| `start` | `node server/index.js` | Start production server |
| `lint` | `eslint .` | Run ESLint |
| `preview` | `vite preview` | Preview production build |
| `seed:admin` | `node server/scripts/seedAdmin.js` | Create admin user |
| `approve:delivery` | `node server/scripts/approveDeliveryPersons.js` | Approve delivery partners |

### Development Workflow

1. **Start Development Servers**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Frontend changes auto-reload (Vite HMR)
   - Backend changes auto-restart (Nodemon)

3. **Test Features**
   - Use browser DevTools for frontend debugging
   - Check terminal for backend logs
   - Use MongoDB Compass to inspect database

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

### Code Style Guidelines

#### Frontend (React)

- Use functional components with hooks
- Follow component naming: `PascalCase.jsx`
- Use Tailwind CSS for styling
- Keep components small and focused
- Extract reusable logic into custom hooks

**Example Component:**
```javascript
import React, { useState, useEffect } from 'react';
import { getBuyerProducts } from '../utils/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getBuyerProducts();
        setProducts(data.products);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
```

#### Backend (Express)

- Use async/await for asynchronous operations
- Always handle errors with try-catch
- Validate input data
- Use meaningful HTTP status codes
- Add comments for complex logic

**Example Route:**
```javascript
// Get buyer profile
router.get('/profile', authenticateBuyer, async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.buyerId)
      .select('-password -verificationToken');
    
    if (!buyer) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Buyer not found'
      });
    }

    res.json({
      success: true,
      profile: buyer
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch profile'
    });
  }
});
```

### Adding New Features

#### 1. Add Database Model

Create model in `server/models/`:

```javascript
// server/models/NewFeature.js
import mongoose from 'mongoose';

const newFeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // ... other fields
}, {
  timestamps: true
});

export default mongoose.model('NewFeature', newFeatureSchema);
```

#### 2. Add API Routes

Add routes in `server/routes/api/`:

```javascript
// server/routes/api/newfeature.js
import { Router } from 'express';
import NewFeature from '../../models/NewFeature.js';

const router = Router();

router.get('/', async (req, res) => {
  // Implementation
});

export default router;
```

Mount in `server/routes/api/index.js`:

```javascript
import newFeatureRoutes from './newfeature.js';
router.use('/newfeature', newFeatureRoutes);
```

#### 3. Add API Client Functions

Add to `src/utils/api.js`:

```javascript
export const getNewFeatures = async () => {
  return apiCall('/newfeature', { method: 'GET' });
};
```

#### 4. Create React Components

Create component in `src/components/` or `src/pages/`:

```javascript
// src/components/NewFeature.jsx
import React from 'react';
import { getNewFeatures } from '../utils/api';

const NewFeature = () => {
  // Implementation
};

export default NewFeature;
```

#### 5. Add Routes

Update `src/App.jsx`:

```javascript
import NewFeature from './components/NewFeature';

// In Routes:
<Route path="/newfeature" element={<NewFeature />} />
```

---

## 🚀 Deployment

### Production Build

1. **Build the Frontend**
   ```bash
   npm run build
   ```
   This creates optimized files in `dist/` folder.

2. **Set Environment Variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export MONGODB_URI=your_production_mongodb_uri
   export JWT_SECRET=your_secure_jwt_secret
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Deployment Platforms

#### Heroku

1. Create `Procfile`:
   ```
   web: node server/index.js
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   ```

#### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Configure environment variables in Vercel dashboard

#### DigitalOcean / AWS / VPS

1. Install Node.js and MongoDB on server
2. Clone repository
3. Install dependencies: `npm install`
4. Build frontend: `npm run build`
5. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name pasalubong
   pm2 save
   pm2 startup
   ```
6. Configure Nginx as reverse proxy

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pasalubong
JWT_SECRET=your-super-secure-random-string-min-32-chars
FRONTEND_URL=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Failed

**Problem:** `MongoDB Connection Failed: connect ECONNREFUSED`

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   ```

2. Check MongoDB URI in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pasalubong
   ```

3. For MongoDB Atlas, ensure:
   - IP whitelist includes your IP
   - Credentials are correct
   - Network access is configured

#### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Kill process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. Change port in `.env`:
   ```env
   PORT=3001
   ```

#### Email Not Sending

**Problem:** Verification emails not received

**Solutions:**
1. Check console for verification link (test mode)
2. For Gmail:
   - Enable 2FA
   - Generate App Password
   - Use App Password in `.env`
3. Check spam folder
4. Verify email configuration:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

#### CORS Errors

**Problem:** `Access to fetch blocked by CORS policy`

**Solutions:**
1. In development, ensure Vite proxy is configured
2. In production, ensure frontend and backend are on same domain
3. Check CORS configuration in `server/index.js`

#### JWT Token Expired

**Problem:** `Token expired` error

**Solutions:**
1. Login again to get new token
2. Implement token refresh mechanism
3. Adjust token expiry in `server/middleware/authMiddleware.js`:
   ```javascript
   jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })
   ```

#### Build Errors

**Problem:** `npm run build` fails

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check for TypeScript errors (if using TS)
3. Ensure all imports are correct
4. Check ESLint errors: `npm run lint`

### Getting Help

- **Documentation:** Check this README and inline code comments
- **Logs:** Check browser console and terminal output
- **Database:** Use MongoDB Compass to inspect data
- **Network:** Use browser DevTools Network tab to debug API calls

---

## 📝 Additional Resources

### MongoDB Setup

For detailed MongoDB installation instructions, see:
- [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)
- [MongoDB Atlas (Cloud)](https://www.mongodb.com/cloud/atlas/register)

### Email Configuration

For email setup guides:
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun Setup](https://documentation.mailgun.com/en/latest/quickstart-sending.html)

### Learning Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [JWT Introduction](https://jwt.io/introduction)

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Tristan Angelo**
- Professional Filipino Gift Platform
- Enterprise-grade marketplace solution

---

## 🙏 Acknowledgments

- Built with ❤️ for authentic Filipino delicacies from Carigara & Barugo
- Special thanks to the local sellers and delivery partners
- Powered by modern web technologies

---

**For questions, issues, or contributions, please contact the development team.**


