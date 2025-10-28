# 📋 Pasalubong - System Requirements & Architecture

Complete technical specifications and requirements for the Pasalubong platform.

---

## 🖥️ System Requirements

### Minimum Requirements

| Component | Specification |
|-----------|---------------|
| **Operating System** | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ |
| **Processor** | Dual-core 2.0 GHz |
| **RAM** | 4 GB |
| **Storage** | 2 GB free space |
| **Internet** | Required for initial setup |
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |

### Recommended Requirements

| Component | Specification |
|-----------|---------------|
| **Operating System** | Windows 11, macOS 12+, Ubuntu 22.04+ |
| **Processor** | Quad-core 2.5 GHz or better |
| **RAM** | 8 GB or more |
| **Storage** | 5 GB free space (SSD recommended) |
| **Internet** | Broadband connection |
| **Browser** | Latest version of Chrome, Firefox, or Edge |

---

## 📦 Software Dependencies

### Required Software

#### 1. Node.js
- **Version:** v18.0.0 or higher
- **Purpose:** JavaScript runtime for backend and build tools
- **Download:** https://nodejs.org/
- **Verify:** `node --version`

#### 2. npm
- **Version:** v9.0.0 or higher
- **Purpose:** Package manager
- **Included with:** Node.js
- **Verify:** `npm --version`

#### 3. MongoDB
- **Version:** v6.0 or higher
- **Purpose:** NoSQL database
- **Options:**
  - **Local:** https://www.mongodb.com/try/download/community
  - **Cloud:** https://www.mongodb.com/cloud/atlas (Free tier available)
- **Verify:** `mongod --version`

### Optional Software

| Software | Purpose | Download |
|----------|---------|----------|
| **Git** | Version control | https://git-scm.com/ |
| **MongoDB Compass** | Database GUI | https://www.mongodb.com/products/compass |
| **Postman** | API testing | https://www.postman.com/ |
| **VS Code** | Code editor | https://code.visualstudio.com/ |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React 19 Single Page Application             │   │
│  │  • React Router for navigation                       │   │
│  │  • Tailwind CSS for styling                          │   │
│  │  • Vite for development & build                      │   │
│  │  • Component-based architecture                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS (REST API)
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (Server)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Express.js REST API Server                   │   │
│  │  • JWT authentication & authorization                │   │
│  │  • RESTful API endpoints                             │   │
│  │  • Middleware (CORS, Helmet, Compression)            │   │
│  │  • File upload handling (Multer)                     │   │
│  │  • Email service (Nodemailer)                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB NoSQL Database                  │   │
│  │  • Collections: Users, Products, Orders, etc.        │   │
│  │  • Indexes for performance optimization              │   │
│  │  • Aggregation pipelines for analytics               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SMTP
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  • Email Service (Gmail, SendGrid, Mailgun)                 │
│  • File Storage (Local filesystem or cloud)                 │
│  • Maps (Leaflet with OpenStreetMap)                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library for building interfaces |
| **React Router DOM** | 6.28.0 | Client-side routing |
| **Vite** | 7.1.7 | Build tool and dev server |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS framework |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React Leaflet** | 5.0.0 | React components for Leaflet |
| **Recharts** | 3.3.0 | Data visualization |
| **XLSX** | 0.18.5 | Excel export functionality |

#### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Web application framework |
| **MongoDB** | 6.8.0 | NoSQL database driver |
| **Mongoose** | 8.6.0 | MongoDB ODM |
| **JWT** | 9.0.2 | Token-based authentication |
| **Bcrypt.js** | 3.0.2 | Password hashing |
| **Nodemailer** | 7.0.9 | Email sending |
| **Multer** | 2.0.2 | File upload handling |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.0 | HTTP request logging |
| **Compression** | 1.7.4 | Response compression |

#### Development Tools

| Tool | Purpose |
|------|---------|
| **Nodemon** | Backend hot reload |
| **Concurrently** | Run multiple scripts |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixes |

---

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Bcrypt password hashing (10 rounds)
- Role-based access control (Admin, Seller, Buyer, Delivery)
- Email verification
- Password reset with secure tokens
- Session management

### Security Middleware
- **Helmet:** Security headers
- **CORS:** Cross-origin resource sharing
- **Rate Limiting:** API request throttling
- **Input Validation:** Request data validation
- **SQL Injection Protection:** Mongoose parameterized queries

### Data Protection
- Passwords hashed with bcrypt
- JWT tokens with expiration
- Secure file upload validation
- Environment variable protection
- HTTPS in production (recommended)

---

## 📊 Database Schema

### Collections Overview

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **buyers** | Buyer user accounts | email, password, profile info |
| **sellers** | Seller user accounts | businessName, email, approval status |
| **deliveries** | Delivery partner accounts | fullname, vehicleType, availability |
| **admins** | Admin user accounts | username, email, permissions |
| **products** | Product catalog | name, price, stock, seller |
| **buyerorders** | Customer orders | items, status, delivery info |
| **buyercarts** | Shopping carts | buyerId, items |
| **buyerfavorites** | Favorite products | buyerId, productIds |
| **buyeraddresses** | Delivery addresses | buyerId, address details |
| **notifications** | System notifications | recipient, type, message |

### Key Relationships

```
Buyer ──┬── BuyerCart (1:1)
        ├── BuyerFavorites (1:1)
        ├── BuyerAddresses (1:N)
        └── BuyerOrders (1:N)

Seller ──── Products (1:N)

Product ──┬── Reviews (1:N)
          └── OrderItems (N:M)

BuyerOrder ──┬── OrderItems (1:N)
             ├── Buyer (N:1)
             └── DeliveryPerson (N:1)

DeliveryPerson ──── BuyerOrders (1:N)
```

---

## 🌐 API Architecture

### API Versioning
- Base URL: `/api/v1`
- RESTful design principles
- JSON request/response format

### Endpoint Categories

| Category | Base Path | Authentication |
|----------|-----------|----------------|
| **Public** | `/api/v1/public` | None |
| **Authentication** | `/api/v1/auth` | None (for login/register) |
| **Buyer** | `/api/v1/buyer` | Buyer JWT |
| **Seller** | `/api/v1/seller` | Seller JWT |
| **Delivery** | `/api/v1/delivery` | Delivery JWT |
| **Admin** | `/api/v1/admin` | Admin JWT |

### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Retrieve data | Get products, orders |
| **POST** | Create new resource | Register user, place order |
| **PUT** | Update existing resource | Update profile, order status |
| **DELETE** | Remove resource | Delete product, address |

---

## 🚀 Deployment Architecture

### Development Environment

```
Developer Machine
├── Frontend Dev Server (Vite) → Port 5173
├── Backend Dev Server (Nodemon) → Port 3000
└── Local MongoDB → Port 27017
```

### Production Environment

```
Production Server
├── Node.js Application
│   ├── Express Server (serves API + static files)
│   └── Built React App (static files)
├── MongoDB (Local or Atlas)
└── Reverse Proxy (Nginx/Apache) → Port 80/443
```

### Recommended Production Setup

1. **Application Server:**
   - Node.js v18+ with PM2 process manager
   - Environment: `NODE_ENV=production`

2. **Database:**
   - MongoDB Atlas (managed cloud)
   - Or self-hosted MongoDB with replica set

3. **Web Server:**
   - Nginx as reverse proxy
   - SSL/TLS certificate (Let's Encrypt)
   - Static file caching

4. **Monitoring:**
   - PM2 for process monitoring
   - MongoDB Atlas monitoring
   - Application logging

---

## 📈 Performance Specifications

### Response Times (Target)

| Operation | Target Time |
|-----------|-------------|
| Page Load | < 2 seconds |
| API Response | < 500ms |
| Database Query | < 100ms |
| File Upload | < 5 seconds (per MB) |

### Scalability

| Metric | Capacity |
|--------|----------|
| **Concurrent Users** | 100+ (development), 1000+ (production with scaling) |
| **Products** | 10,000+ |
| **Orders/Day** | 1,000+ |
| **Database Size** | 10GB+ |

### Optimization Features

- **Frontend:**
  - Code splitting
  - Lazy loading
  - Image optimization
  - Caching strategies

- **Backend:**
  - Database indexing
  - Query optimization
  - Response compression
  - Connection pooling

- **Database:**
  - Compound indexes
  - Aggregation pipelines
  - TTL indexes for temporary data

---

## 🔌 Network Requirements

### Ports Used

| Port | Service | Protocol |
|------|---------|----------|
| **5173** | Vite Dev Server | HTTP |
| **3000** | Express API Server | HTTP |
| **27017** | MongoDB | TCP |
| **587** | Email (SMTP) | TCP |

### Firewall Configuration

**Development:**
- Allow inbound: 5173, 3000
- Allow outbound: 27017, 587, 443 (for MongoDB Atlas, email)

**Production:**
- Allow inbound: 80, 443
- Allow outbound: 27017, 587, 443

---

## 📱 Browser Compatibility

### Supported Browsers

| Browser | Minimum Version |
|---------|-----------------|
| **Chrome** | 90+ |
| **Firefox** | 88+ |
| **Safari** | 14+ |
| **Edge** | 90+ |
| **Opera** | 76+ |

### Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile-optimized navigation
- Progressive Web App (PWA) ready

---

## 💾 Storage Requirements

### Development

| Component | Size |
|-----------|------|
| **Node Modules** | ~500 MB |
| **MongoDB Data** | ~100 MB (initial) |
| **Uploaded Files** | Variable |
| **Build Output** | ~10 MB |
| **Total** | ~1-2 GB |

### Production

| Component | Size |
|-----------|------|
| **Application Code** | ~50 MB |
| **MongoDB Data** | 1-10 GB (depends on usage) |
| **Uploaded Files** | Variable (user uploads) |
| **Logs** | ~100 MB/month |
| **Total** | 2-20 GB (recommended) |

---

## 🔄 Backup & Recovery

### Recommended Backup Strategy

1. **Database Backups:**
   - Daily automated backups
   - Retention: 30 days
   - MongoDB Atlas: Automatic backups included

2. **File Backups:**
   - Weekly backup of uploaded files
   - Cloud storage recommended (S3, Google Cloud)

3. **Code Repository:**
   - Git version control
   - Remote repository (GitHub, GitLab)

---

## 📞 Support & Maintenance

### System Monitoring

- Server uptime monitoring
- Database performance metrics
- Error logging and tracking
- User activity analytics

### Maintenance Windows

- **Development:** Continuous updates
- **Production:** Scheduled maintenance (off-peak hours)
- **Database:** Regular index optimization

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All dependencies updated to stable versions
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] SSL certificate installed
- [ ] Backup system configured
- [ ] Monitoring tools set up
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Documentation updated
- [ ] Admin account secured

---

**Last Updated:** January 2025
**Version:** 1.0.0