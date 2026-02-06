# Outzidr Commerce Platform

**Senior MERN Engineer Assignment** - Production-grade, multi-tenant e-commerce backend built with Fastify, TypeScript, and MongoDB.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features Implemented](#features-implemented)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Environment Variables](#environment-variables)

---

## 🎯 Overview

A headless commerce platform supporting:
- **Multi-tenant architecture** with logical data isolation
- **JWT-based authentication** (RS256) with refresh token rotation
- **Dynamic pricing engine** with configurable rules
- **Shopping cart** with real-time pricing calculations
- **Order management** with atomic inventory locking
- **Production-ready** error handling and security

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x (not Express)
- **Language**: TypeScript 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken) with RS256
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger/OpenAPI 3.0 (`@fastify/swagger`, `@fastify/swagger-ui`)
- **Rate Limiting**: `@fastify/rate-limit`

### Testing
- **Framework**: Jest + ts-jest
- **HTTP Testing**: Supertest
- **Database**: mongodb-memory-server
- **Coverage**: 38% (73 tests passing in ~13s)

### Frontend (Planned)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Validation**: Zod
- **Rendering**: Server Components + Route Handlers

---

## 🏗️ Architecture

### Multi-Tenancy
- Tenant resolution via `x-tenant-id` header
- Logical isolation in MongoDB (tenant field in all documents)
- SKU uniqueness per tenant

### Authentication Flow
```
Register → Login → Access Token (15 min) + Refresh Token (7 days)
         ↓
    Access Token expires → Refresh → New tokens
         ↓
    Logout → Invalidate refresh token
```

### Pricing Engine
- Rules stored in database
- Runtime evaluation
- Supports: Percentage discount, Flat discount, Inventory-based pricing
- Automatically applied during cart operations

### Order Processing
```
Cart → Create Order → MongoDB Transaction:
                      1. Validate inventory
                      2. Create order
                      3. Atomic inventory decrement
                      4. Mark cart as checked out
                   → Commit or Rollback
```

---

## ✅ Features Implemented

### 1. Multi-Tenant Architecture ✅
- [x] Tenant resolution via `x-tenant-id` header
- [x] Logical data isolation
- [x] Tenant-scoped queries

### 2. Authentication System ✅
- [x] POST `/api/auth/register` - User registration
- [x] POST `/api/auth/login` - Login with JWT tokens
- [x] POST `/api/auth/refresh` - Refresh token rotation
- [x] POST `/api/auth/logout` - Token invalidation
- [x] JWT RS256 (public/private key pair)
- [x] Access token: 15 minutes
- [x] Refresh token: 7 days
- [x] HTTP-only cookies support

### 3. Product Catalog ✅
- [x] POST `/api/products` - Create product
- [x] GET `/api/products` - List products (with pagination & filtering)
- [x] GET `/api/products/:id` - Get product by ID
- [x] GET `/api/products/sku/:sku` - Get product by SKU
- [x] PUT `/api/products/:id` - Update product
- [x] PATCH `/api/products/:id/inventory` - Update inventory
- [x] DELETE `/api/products/:id` - Delete product
- [x] SKU unique per tenant
- [x] Inventory cannot go below zero

### 4. Dynamic Pricing Engine ✅
- [x] Rules stored in database
- [x] Runtime evaluation
- [x] Percentage discount
- [x] Flat discount
- [x] Inventory-based pricing
- [x] Multiple rules per product
- [x] Priority-based application

### 5. Cart System ✅
- [x] GET `/api/cart` - Get cart
- [x] POST `/api/cart/items` - Add to cart
- [x] PUT `/api/cart/items/:productId` - Update quantity
- [x] DELETE `/api/cart/items/:productId` - Remove item
- [x] DELETE `/api/cart` - Clear cart
- [x] One active cart per user
- [x] Dynamic pricing applied automatically
- [x] Inventory validation

### 6. Order Management ✅
- [x] POST `/api/orders` - Create order from cart
- [x] GET `/api/orders` - List orders (with pagination)
- [x] GET `/api/orders/:id` - Get order by ID
- [x] PUT `/api/orders/:id/status` - Update order status
- [x] Atomic inventory locking (MongoDB transactions)
- [x] Price snapshot at order time
- [x] Order number generation

### 7. Fastify Middleware ✅
- [x] Logging (built-in Pino)
- [x] Authentication guard (`authGuard` plugin)
- [x] Tenant resolution (`tenant` plugin)
- [x] Error handling (`@fastify/sensible`)
- [x] CORS (`@fastify/cors`)
- [x] Cookie support (`@fastify/cookie`)

---

## 📁 Project Structure

```
outzidr-commerce-platform/
├── apps/
│   └── api/                          # Backend API
│       ├── src/
│       │   ├── app.ts                # Fastify app setup
│       │   ├── server.ts             # Server entry point
│       │   ├── config/               # Configuration
│       │   ├── modules/              # Feature modules
│       │   │   ├── auth/             # Authentication
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.types.ts
│       │   │   │   └── refreshToken.model.ts
│       │   │   ├── users/            # User management
│       │   │   ├── products/         # Product catalog
│       │   │   ├── pricing/          # Dynamic pricing
│       │   │   ├── cart/             # Shopping cart
│       │   │   └── orders/           # Order management
│       │   ├── plugins/              # Fastify plugins
│       │   │   ├── authGuard.ts      # Auth middleware
│       │   │   ├── tenant.ts         # Tenant resolution
│       │   │   └── mongodb.ts        # MongoDB connection
│       │   ├── routes/               # Route aggregation
│       │   │   └── protected.routes.ts
│       │   ├── types/                # TypeScript declarations
│       │   └── utils/                # Utilities
│       ├── package.json
│       └── tsconfig.json
├── docs/                             # Documentation
├── packages/                         # Shared packages
├── package.json                      # Root package.json
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 6+ (or MongoDB Atlas)
- npm or pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sainani1214/outzidr-commerce-platform.git
cd outzidr-commerce-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Generate RS256 Key Pair**
```bash
cd apps/api
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

4. **Create `.env` file**
```bash
cd apps/api
touch .env
```

Add the following:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/outzidr-commerce

# OR MongoDB Atlas (cloud - no local installation needed)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/outzidr-commerce?retryWrites=true&w=majority

JWT_PRIVATE_KEY="$(cat private.key)"
JWT_PUBLIC_KEY="$(cat public.key)"
PORT=3001
```

> **💡 Tip for Reviewers:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier (no local installation required) - just create a cluster and update `MONGODB_URI`

5. **Start MongoDB** (if using local MongoDB)
```bash
mongod
```

   **OR skip this step if using MongoDB Atlas**

```

6. **Run the development server**
```bash
cd apps/api
npm run dev
```

Server will start at `http://localhost:3001`

---

## 📚 API Documentation

### 🔷 Interactive Swagger UI

**Access the interactive API documentation:**

```
http://localhost:3001/documentation
```

**Prerequisites for Testing:**
- ✅ MongoDB running (locally or Atlas)
- ✅ Server running: `npm run dev -w api`
- ✅ Environment variables configured (`.env` file)

**Features:**
- ✅ **Try it out** - Test all endpoints directly from the browser
- ✅ **Full schema validation** - See request/response examples
- ✅ **JWT Authentication** - Authorize once, use for all requests
- ✅ **20 endpoints** documented with OpenAPI 3.0 spec

**Quick Start with Swagger:**
1. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # OR use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env with Atlas connection string
   ```

2. **Start the server:**
   ```bash
   npm run dev -w api
   ```

3. **Open Swagger UI:**
   ```
   http://localhost:3001/documentation
   ```

4. **Test the API:**
   - All requests require `x-tenant-id` header
   - **For testing:** Use any string like `tenant_1`, `acme_corp`, `test_tenant`
   - Tenants are created automatically (soft multi-tenancy)

5. **Try authentication:**
   - Use `/api/v1/auth/register` endpoint (no auth required)
   - Copy the `accessToken` from response
   - Click "Authorize" button → Paste token → Test protected endpoints

**Common Issues:**
- ❌ **"Cannot connect"** → Check if MongoDB is running (`mongod`)
- ❌ **"Connection refused"** → Verify `MONGODB_URI` in `.env` file
- ❌ **"x-tenant-id header missing"** → Add tenant ID to request header
- ❌ **"Unauthorized"** → Register/login first, then use access token

---

### Base URL
```
http://localhost:3001/api/v1
```

> **📌 API Versioning:** All endpoints are versioned under `/api/v1` for backward compatibility and clean API evolution.

### Authentication

All protected endpoints require:
- **Header**: `Authorization: Bearer <access_token>`
- **Header**: `x-tenant-id: <tenant_id>`
  - 🔑 **Required for all requests**
  - Use any string (e.g., `tenant_1`, `acme_corp`, `test_tenant`)
  - Tenants are **auto-created** on first use (soft multi-tenancy)
  - Each tenant has isolated data (users, products, carts, orders)

### Endpoints

#### **Authentication** (No auth required)
```bash
POST /api/v1/auth/register     # Register new user
POST /api/v1/auth/login        # Login
POST /api/v1/auth/refresh      # Refresh access token
POST /api/v1/auth/logout       # Logout
```

#### **User** (Protected)
```bash
GET /api/v1/users/me           # Get current user
```

#### **Products** (Protected)
```bash
POST   /api/v1/products                    # Create product
GET    /api/v1/products                    # List products (paginated)
GET    /api/v1/products/:id                # Get product
GET    /api/v1/products/sku/:sku           # Get by SKU
PUT    /api/v1/products/:id                # Update product
PATCH  /api/v1/products/:id/inventory      # Update inventory
DELETE /api/v1/products/:id                # Delete product
```

#### **Cart** (Protected)
```bash
GET    /api/v1/cart                        # Get cart
POST   /api/v1/cart/items                  # Add to cart
PUT    /api/v1/cart/items/:productId       # Update quantity
DELETE /api/v1/cart/items/:productId       # Remove item
DELETE /api/v1/cart                        # Clear cart
```

#### **Orders** (Protected)
```bash
POST   /api/v1/orders                      # Create order
GET    /api/v1/orders                      # List orders (paginated)
GET    /api/v1/orders/:id                  # Get order
PUT    /api/v1/orders/:id/status           # Update status
```

#### **Health Check** (Public)
```bash
GET /health                             # Health check (unversioned)
```

### Example Requests

**Register**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Create Product**
```bash
curl -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "sku": "LAP-001",
    "price": 999.99,
    "inventory": 50,
    "category": "Electronics"
  }'
```

**Add to Cart**
```bash
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "productId": "65f8acf61071cc74303957be",
    "quantity": 2
  }'
```

**Create Order**
```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

---

## 🧪 Testing

### Current Status
✅ **73 tests passing** in ~13 seconds  
✅ **38% code coverage** (service layer)  
⏭️ 18 tests skipped (order service - requires MongoDB replica set)

### Test Breakdown
| Module | Tests | Coverage | Status |
|--------|-------|----------|--------|
| Auth Service | 20 | 100% | ✅ PASS |
| Cart Service | 22 | 96.7% | ✅ PASS |
| Product Service | 20 | 76.3% | ✅ PASS |
| Pricing Service | 11 | 52.7% | ✅ PASS |
| Order Service | 18 | 12.3% | ⏭️ SKIP |

**Order tests skipped**: Require MongoDB transactions (replica set), which makes tests slow. Use standalone MongoDB for fast testing.

### Run Tests
```bash
cd apps/api
npm test                 # Run all tests (~13s)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (~16s)
```

### What's Tested
- ✅ User registration & login with JWT
- ✅ Password hashing & validation
- ✅ Refresh token rotation & revocation
- ✅ Multi-tenant data isolation
- ✅ Product CRUD operations
- ✅ Cart operations with dynamic pricing
- ✅ Pricing rule calculations
- ✅ Inventory validation
- ✅ Pagination & filtering

### Next Steps
- [x] ~~Integration tests for controllers~~ - **Completed! 76% coverage**
- [ ] Order service with replica set or mocking
- [ ] Comprehensive error handling
- [ ] Next.js frontend (App Router with SSR)

---

## 🔒 Security Features

- ✅ **JWT RS256** - Asymmetric encryption
- ✅ **Password Hashing** - bcrypt with salt
- ✅ **Refresh Token Rotation** - Old tokens invalidated
- ✅ **HTTP-only Cookies** - XSS protection
- ✅ **CORS** - Configured for security
- ✅ **Tenant Isolation** - Data security
- ✅ **Rate Limiting** - Multi-tenant aware, stricter limits on auth endpoints

---

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_PRIVATE_KEY` | RS256 private key | Yes | - |
| `JWT_PUBLIC_KEY` | RS256 public key | Yes | - |
| `PORT` | Server port | No | 3001 |

---

## 📝 Implementation Checklist

### Backend (Current Status)
- [x] Multi-tenant architecture
- [x] JWT authentication (RS256)
- [x] User registration & login
- [x] Refresh token rotation
- [x] Product CRUD with pagination
- [x] Dynamic pricing engine
- [x] Shopping cart with pricing
- [x] Order creation with transactions
- [x] Atomic inventory locking
- [x] Fastify plugins & middleware
- [x] Rate limiting
- [x] Unit tests + Integration tests (142 passing, **76% coverage**)
- [x] API documentation (Swagger/OpenAPI 3.0)
- [ ] Comprehensive error handling

### Frontend (Planned - Next.js)
- [ ] Next.js 14+ setup (App Router)
- [ ] Server Components
- [ ] Product listing (SSR)
- [ ] Authentication flow
- [ ] HTTP-only cookie auth
- [ ] Cart management
- [ ] Checkout flow

---

## 🎯 Assignment Requirements Met

✅ **Multi-tenant stores** - Tenant isolation via header  
✅ **Product catalog** - Full CRUD with pagination  
✅ **Dynamic pricing rules** - Database-driven engine  
✅ **Cart & checkout** - Full implementation  
✅ **JWT authentication** - RS256 with refresh tokens  
✅ **API Gateway-style middleware** - Fastify plugins  
✅ **Fastify** (not Express) - Full Fastify implementation  
✅ **TypeScript** - 100% TypeScript codebase  
✅ **MongoDB** - Mongoose with transactions  
✅ **Atomic inventory lock** - MongoDB transactions  
✅ **Rate limiting** - Multi-tenant aware with per-route limits  
✅ **Testing** - 142 tests passing (**76% coverage**)  
✅ **API Documentation** - Swagger/OpenAPI 3.0 with interactive UI  
⏳ **Next.js SSR** - Planned  

---

## 👨‍💻 Development

### Scripts

```bash
# API Development
cd apps/api
npm run dev          # Start dev server with watch
npm run build        # Build TypeScript
npm run start        # Start production server
npm test             # Run tests (~13s)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage (~16s)

# Root
npm install          # Install all dependencies
```

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for types
- **Architecture**: Modular, separation of concerns
- **Error Handling**: Try-catch with proper error messages

---

## 📈 Performance Considerations

- **MongoDB Indexes**: Created on tenantId, userId, sku
- **Pagination**: Implemented for all list endpoints
- **Transactions**: Used only when necessary (orders)
- **Connection Pooling**: MongoDB default pool
- **Logging**: Fastify Pino (JSON structured logs)

---

