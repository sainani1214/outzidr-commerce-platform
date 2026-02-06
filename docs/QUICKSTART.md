# Quick Start Guide

---

## Prerequisites

- Node.js 20+ installed
- MongoDB running (local or Atlas)
- Terminal/Command Line

---

## 🏃 Quick Setup

### 1. Clone & Install (1 min)

```bash
cd outzidr-commerce-platform
npm install
```

### 2. Generate JWT Keys (30 seconds)

```bash
cd apps/api
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

### 3. Create .env File (30 seconds)

Create `apps/api/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/outzidr-commerce
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
<paste private.key contents>
-----END RSA PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
<paste public.key contents>
-----END PUBLIC KEY-----"
PORT=3001
```

**OR** use this one-liner:
```bash
cd apps/api
echo "MONGODB_URI=mongodb://localhost:27017/outzidr-commerce" > .env
echo "JWT_PRIVATE_KEY=\"$(cat private.key)\"" >> .env
echo "JWT_PUBLIC_KEY=\"$(cat public.key)\"" >> .env
echo "PORT=3001" >> .env
```

### 4. Start the Server (10 seconds)

```bash
cd apps/api
npm run dev
```

You should see:
```
MongoDB connected
Server listening at http://0.0.0.0:3001
```

---

## ✅ Test the API (2 minutes)

### 1. Health Check
```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

### 2. Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Save the `accessToken` from response!**

### 4. Create a Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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

**Save the product `id` from response!**

### 5. Add to Cart
```bash
curl -X POST http://localhost:3001/api/cart/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "productId": "YOUR_PRODUCT_ID_HERE",
    "quantity": 2
  }'
```

### 6. Create Order
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
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

## 🎯 Key Features to Test

### Multi-Tenancy
Try creating products with different `x-tenant-id` headers. They won't see each other's data!

```bash
# Tenant 1
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "x-tenant-id: tenant_1"

# Tenant 2 (empty results)
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "x-tenant-id: tenant_2"
```

### Dynamic Pricing
Add 10+ items to cart and watch the price change based on quantity!

### Atomic Inventory
Try creating 2 orders simultaneously with low inventory. Only one will succeed!

### Token Refresh
Wait 15 minutes for access token to expire, then:

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_1" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📁 Project Structure

```
apps/api/src/
├── app.ts                    # Fastify app setup
├── server.ts                 # Entry point
├── modules/
│   ├── auth/                 # Authentication
│   ├── users/                # User management
│   ├── products/             # Product catalog
│   ├── pricing/              # Dynamic pricing engine
│   ├── cart/                 # Shopping cart
│   └── orders/               # Order management
├── plugins/
│   ├── authGuard.ts          # JWT authentication
│   ├── tenant.ts             # Multi-tenancy
│   └── mongodb.ts            # Database connection
└── routes/
    └── protected.routes.ts   # Protected route aggregation
```

---

## 🔍 What to Look For

### Senior-Level Code Quality:
1. **TypeScript**: Strict types, no `any`
2. **Architecture**: Clean separation of concerns
3. **Error Handling**: Try-catch with proper rollbacks
4. **Security**: JWT RS256, bcrypt, token rotation
5. **Database**: MongoDB transactions for atomicity
6. **Scalability**: Multi-tenant design
7. **Business Logic**: Complex pricing engine

### Production-Ready Patterns:
- ✅ Proper error handling with meaningful messages
- ✅ Validation before database operations
- ✅ Atomic operations (MongoDB transactions)
- ✅ Security best practices
- ✅ Logging (structured JSON logs)
- ✅ CORS configuration
- ✅ Environment variables

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
```bash
# Start MongoDB
mongod

# Or use Atlas URI in .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### "JWT verification failed"
- Make sure you're using the correct access token
- Token expires in 15 minutes - use refresh endpoint
- Check that JWT keys are properly set in .env

### "401 Unauthorized"
- Include `Authorization: Bearer <token>` header
- Include `x-tenant-id` header
- Make sure token hasn't expired

### "400 Bad Request"
- Check request body format (must be valid JSON)
- Verify all required fields are present
- Check console logs for specific error message

---

## 📊 Testing Checklist

- [ ] Health check works
- [ ] User registration works
- [ ] Login returns tokens
- [ ] Protected endpoints require auth
- [ ] Multi-tenancy isolates data
- [ ] Products can be created/listed/updated
- [ ] Cart operations work
- [ ] Orders create successfully
- [ ] Inventory decrements after order
- [ ] Pricing rules apply automatically
- [ ] Token refresh works
- [ ] Logout invalidates token

---

