# Outzidr Admin Panel

Admin panel for managing the Outzidr multi-tenant e-commerce platform.

## Features

- **Tenant Management**: Create, edit, and delete tenant organizations
- **Domain Configuration**: Manage custom domains and subdomains
- **Pricing Rules**: Configure global and tenant-specific pricing
- **Product Overview**: Monitor products across all tenants
- **User Management**: Control admin access and permissions
- **Platform Settings**: Configure global settings

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Admin panel will be available at: http://localhost:3002

## Port Configuration

- **Web Store**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Admin Panel**: http://localhost:3002

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Admin Routes

- `/` - Dashboard
- `/tenants` - Tenant Management
- `/tenants/new` - Create New Tenant
- `/tenants/[id]` - Tenant Details
- `/domains` - Domain Management
- `/pricing` - Pricing Rules
- `/products` - Products Overview
- `/users` - User Management
- `/settings` - Platform Settings
