import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestContext, teardownTestContext, TestContext } from '../helpers/testApp';

describe('Cart Integration Tests', () => {
  let context: TestContext;
  let accessToken: string;
  let productId1: string;
  let productId2: string;

  beforeAll(async () => {
    context = await setupTestContext();

    // Register and login
    await context.app.inject({
      method: 'POST',
      url: '/api/auth/register',
      headers: {
        'x-tenant-id': context.tenantId,
      },
      payload: {
        email: 'cart@example.com',
        password: 'Test@12345',
        confirmPassword: 'Test@12345',
        name: 'Cart Tester',
      },
    });

    const loginResponse = await context.app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: {
        'x-tenant-id': context.tenantId,
      },
      payload: {
        email: 'cart@example.com',
        password: 'Test@12345',
      },
    });

    const loginBody = JSON.parse(loginResponse.body);
    accessToken = loginBody.accessToken;

    // Create test products
    const product1Response = await context.app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Cart Product 1',
        basePrice: 50,
        stock: 100,
        sku: 'CART-001',
      },
    });
    productId1 = JSON.parse(product1Response.body)._id;

    const product2Response = await context.app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Cart Product 2',
        basePrice: 75,
        stock: 50,
        sku: 'CART-002',
      },
    });
    productId2 = JSON.parse(product2Response.body)._id;
  });

  afterAll(async () => {
    await teardownTestContext(context);
  });

  describe('POST /api/cart/items', () => {
    it('should add item to cart successfully', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: productId1,
          quantity: 2,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items).toBeDefined();
      expect(body.items.length).toBe(1);
      expect(body.items[0].product.toString()).toBe(productId1);
      expect(body.items[0].quantity).toBe(2);
      expect(body.totalAmount).toBe(100); // 50 * 2
    });

    it('should add another item to existing cart', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: productId2,
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items.length).toBe(2);
      expect(body.totalAmount).toBe(175); // (50 * 2) + (75 * 1)
    });

    it('should update quantity when adding same product', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: productId1,
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const product1Item = body.items.find((item: any) => item.product.toString() === productId1);
      expect(product1Item.quantity).toBe(3); // 2 + 1
      expect(body.totalAmount).toBe(225); // (50 * 3) + (75 * 1)
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          productId: productId1,
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should fail with non-existent product', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: '507f1f77bcf86cd799439011',
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should fail with zero quantity', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: productId1,
          quantity: 0,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should fail with negative quantity', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: productId1,
          quantity: -5,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/cart', () => {
    it('should get cart with calculated pricing', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/cart',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items).toBeDefined();
      expect(body.items.length).toBeGreaterThan(0);
      expect(body.totalAmount).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/cart',
        headers: {
          'x-tenant-id': context.tenantId,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/cart/items/:productId', () => {
    it('should update item quantity successfully', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/cart/items/${productId1}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          quantity: 5,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const product1Item = body.items.find((item: any) => item.product.toString() === productId1);
      expect(product1Item.quantity).toBe(5);
      expect(body.totalAmount).toBe(325); // (50 * 5) + (75 * 1)
    });

    it('should fail to update non-existent item', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: '/api/cart/items/507f1f77bcf86cd799439011',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should fail with invalid quantity', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/cart/items/${productId1}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          quantity: -1,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/cart/items/:productId', () => {
    it('should remove item from cart successfully', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/cart/items/${productId2}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items.length).toBe(1);
      expect(body.totalAmount).toBe(250); // Only product1: 50 * 5
    });

    it('should fail to remove non-existent item', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: '/api/cart/items/507f1f77bcf86cd799439011',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/cart', () => {
    it('should clear entire cart successfully', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: '/api/cart',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('cleared');
    });

    it('should return empty cart after clearing', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/cart',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items.length).toBe(0);
      expect(body.totalAmount).toBe(0);
    });
  });

  describe('Cart Pricing with Dynamic Rules', () => {
    let pricingProductId: string;

    beforeAll(async () => {
      // Create product with pricing rule
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Pricing Test Product',
          basePrice: 100,
          stock: 100,
          sku: 'PRICING-001',
        },
      });
      pricingProductId = JSON.parse(productResponse.body)._id;
    });

    it('should apply base price correctly', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: pricingProductId,
          quantity: 2,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.totalAmount).toBe(200); // 100 * 2
    });
  });
});
