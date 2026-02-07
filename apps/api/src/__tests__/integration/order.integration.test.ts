import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestContext, teardownTestContext, TestContext } from '../helpers/testApp';

describe('Order Integration Tests', () => {
  let context: TestContext;
  let accessToken: string;
  let productId1: string;
  let productId2: string;
  let orderId: string;

  beforeAll(async () => {
    context = await setupTestContext();

    // Register and login
    await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      headers: {
        'x-tenant-id': context.tenantId,
      },
      payload: {
        email: 'order@example.com',
        password: 'Test@12345',
        confirmPassword: 'Test@12345',
        name: 'Order Tester',
      },
    });

    const loginResponse = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        'x-tenant-id': context.tenantId,
      },
      payload: {
        email: 'order@example.com',
        password: 'Test@12345',
      },
    });

    const loginBody = JSON.parse(loginResponse.body);
    accessToken = loginBody.accessToken;

    // Create test products
    const product1Response = await context.app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Order Product 1',
        price: 100,
        inventory: 50,
        sku: 'ORDER-001',
      },
    });
    productId1 = JSON.parse(product1Response.body)._id;

    const product2Response = await context.app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Order Product 2',
        price: 150,
        inventory: 30,
        sku: 'ORDER-002',
      },
    });
    productId2 = JSON.parse(product2Response.body)._id;

    // Add items to cart
    await context.app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        productId: productId1,
        quantity: 2,
      },
    });

    await context.app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        productId: productId2,
        quantity: 1,
      },
    });
  });

  afterAll(async () => {
    await teardownTestContext(context);
  });

  describe('POST /api/orders', () => {
    it('should create order from cart successfully', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          shippingAddress: {
            street: '123 Main St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA',
          },
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body._id).toBeDefined();
      expect(body.items).toBeDefined();
      expect(body.items.length).toBe(2);
      expect(body.totalAmount).toBe(350); // (100 * 2) + (150 * 1)
      expect(body.status).toBe('pending');
      expect(body.shippingAddress).toBeDefined();
      expect(body.shippingAddress.street).toBe('123 Main St');

      orderId = body._id;
    });

    it('should have reduced product stock after order', async () => {
      const product1Response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/products/${productId1}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      const product1 = JSON.parse(product1Response.body);
      expect(product1.stock).toBe(48); // 50 - 2

      const product2Response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/products/${productId2}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      const product2 = JSON.parse(product2Response.body);
      expect(product2.stock).toBe(29); // 30 - 1
    });

    it('should have cleared cart after order', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/cart',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items.length).toBe(0);
    });

    it('should fail to create order with empty cart', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          shippingAddress: {
            street: '456 Second St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA',
          },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('empty');
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          shippingAddress: {
            street: '789 Third St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA',
          },
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should fail without shipping address', async () => {
      // Add item to cart first
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: productId1,
          quantity: 1,
        },
      });

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should list user orders', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.orders).toBeDefined();
      expect(body.orders.length).toBeGreaterThan(0);
      expect(body.pagination).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get single order by ID', async () => {
      expect(orderId).toBeDefined();

      const response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/orders/${orderId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body._id).toBe(orderId);
      expect(body.items.length).toBe(2);
      expect(body.totalAmount).toBe(350);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/orders/507f1f77bcf86cd799439011',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid order ID', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/orders/invalid-id',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status successfully', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/v1/orders/${orderId}/status`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: 'processing',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('processing');
    });

    it('should fail with invalid status', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/v1/orders/${orderId}/status`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: 'invalid-status',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should fail for non-existent order', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: '/api/v1/orders/507f1f77bcf86cd799439011/status',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: 'shipped',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Insufficient Stock Handling', () => {
    let lowStockProductId: string;

    beforeAll(async () => {
      // Create product with low stock
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Low Stock Product',
          price: 50,
          inventory: 2,
          sku: 'LOW-STOCK-001',
        },
      });
      lowStockProductId = JSON.parse(productResponse.body)._id;
    });

    it('should fail order creation with insufficient stock', async () => {
      // Add more items than available stock
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: lowStockProductId,
          quantity: 5, // More than available stock (2)
        },
      });

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          shippingAddress: {
            street: '999 Stock St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA',
          },
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('stock');
    });

    it('should not reduce stock when order fails', async () => {
      const productResponse = await context.app.inject({
        method: 'GET',
        url: `/api/v1/products/${lowStockProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      const product = JSON.parse(productResponse.body);
      expect(product.stock).toBe(2); // Stock should remain unchanged
    });
  });

  describe('Tenant Isolation - Orders', () => {
    let otherTenantToken: string;
    const otherTenantId = 'order_other_tenant_' + Date.now();

    beforeAll(async () => {
      // Create user in different tenant
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': otherTenantId,
        },
        payload: {
          email: 'orderother@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Order Other Tenant',
        },
      });

      const loginResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': otherTenantId,
        },
        payload: {
          email: 'orderother@example.com',
          password: 'Test@12345',
        },
      });

      const loginBody = JSON.parse(loginResponse.body);
      otherTenantToken = loginBody.accessToken;
    });

    it('should not see orders from other tenant', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/orders',
        headers: {
          'x-tenant-id': otherTenantId,
          authorization: `Bearer ${otherTenantToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.orders.length).toBe(0);
    });

    it('should not access order from other tenant', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/orders/${orderId}`,
        headers: {
          'x-tenant-id': otherTenantId,
          authorization: `Bearer ${otherTenantToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
