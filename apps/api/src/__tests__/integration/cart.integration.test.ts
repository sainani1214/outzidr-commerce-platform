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
      url: '/api/v1/auth/register',
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
      url: '/api/v1/auth/login',
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
      url: '/api/v1/products',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Cart Product 1',
        description: 'Test product for cart',
        price: 50,
        inventory: 100,
        sku: 'CART-001',
      },
    });
    productId1 = JSON.parse(product1Response.body).data.id;

    const product2Response = await context.app.inject({
      method: 'POST',
      url: '/api/v1/products',
      headers: {
        'x-tenant-id': context.tenantId,
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Cart Product 2',
        description: 'Test product for cart',
        price: 75,
        inventory: 50,
        sku: 'CART-002',
      },
    });
    productId2 = JSON.parse(product2Response.body).data.id;
  });

  afterAll(async () => {
    await teardownTestContext(context);
  });

  describe('POST /api/v1/cart/items', () => {
    it('should add item to cart successfully', async () => {
      // Create product for this test
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Cart Test Product',
          description: 'Test product',
          price: 50,
          inventory: 100,
          sku: 'CART-TEST-001',
        },
      });
      const testProductId = JSON.parse(productResponse.body).data.id;

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId,
          quantity: 2,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
      expect(body.data.items).toBeDefined();
      expect(body.data.items.length).toBeGreaterThanOrEqual(1);
      const addedItem = body.data.items.find((item: any) => item.productId === testProductId);
      expect(addedItem).toBeDefined();
      expect(addedItem.quantity).toBe(2);
    });

    it('should add another item to existing cart', async () => {
      // Create another product
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Cart Test Product 2',
          description: 'Test product 2',
          price: 75,
          inventory: 50,
          sku: 'CART-TEST-002',
        },
      });
      const testProductId2 = JSON.parse(productResponse.body).data.id;

      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId2,
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.items.length).toBeGreaterThanOrEqual(1);
      const addedItem = body.data.items.find((item: any) => item.productId === testProductId2);
      expect(addedItem).toBeDefined();
      expect(addedItem.quantity).toBe(1);
    });

    it('should update quantity when adding same product', async () => {
      // Create product and add it twice
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Cart Test Product 3',
          description: 'Test product 3',
          price: 50,
          inventory: 100,
          sku: 'CART-TEST-003',
        },
      });
      const testProductId3 = JSON.parse(productResponse.body).data.id;

      // Add product first time
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId3,
          quantity: 2,
        },
      });

      // Add same product again
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId3,
          quantity: 1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const product3Item = body.data.items.find((item: any) => item.productId === testProductId3);
      expect(product3Item).toBeDefined();
      expect(product3Item.quantity).toBe(3);
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
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
        url: '/api/v1/cart/items',
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
        url: '/api/v1/cart/items',
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
        url: '/api/v1/cart/items',
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

  describe('GET /api/v1/cart', () => {
    it('should get cart with calculated pricing', async () => {
      // Create product and add to cart first
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Cart Get Test Product',
          description: 'Test product for get',
          price: 100,
          inventory: 50,
          sku: 'CART-GET-001',
        },
      });
      const testProductId = JSON.parse(productResponse.body).data.id;

      await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId,
          quantity: 2,
        },
      });

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
      expect(body.data).toBeDefined();
      expect(body.data.items).toBeDefined();
      expect(body.data.items.length).toBeGreaterThan(0);
      expect(body.data.total).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/cart',
        headers: {
          'x-tenant-id': context.tenantId,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/cart/items/:productId', () => {
    it('should update item quantity successfully', async () => {
      // Create product and add to cart first
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Cart Update Test Product',
          description: 'Test product for update',
          price: 50,
          inventory: 100,
          sku: 'CART-UPDATE-001',
        },
      });
      const testProductId = JSON.parse(productResponse.body).data.id;

      await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId,
          quantity: 2,
        },
      });

      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/v1/cart/items/${testProductId}`,
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
      const updatedItem = body.data.items.find((item: any) => item.productId === testProductId);
      expect(updatedItem).toBeDefined();
      expect(updatedItem.quantity).toBe(5);
    });

    it('should fail to update non-existent item', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: '/api/v1/cart/items/507f1f77bcf86cd799439011',
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
        url: `/api/v1/cart/items/${productId1}`,
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

  describe('DELETE /api/v1/cart/items/:productId', () => {
    it('should remove item from cart successfully', async () => {
      // Create product and add to cart first
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Cart Delete Test Product',
          description: 'Test product for delete',
          price: 50,
          inventory: 100,
          sku: 'CART-DELETE-001',
        },
      });
      const testProductId = JSON.parse(productResponse.body).data.id;

      await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          productId: testProductId,
          quantity: 2,
        },
      });

      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/v1/cart/items/${testProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
      const deletedItem = body.data.items.find((item: any) => item.productId === testProductId);
      expect(deletedItem).toBeUndefined();
    });

    it('should fail to remove non-existent item', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: '/api/v1/cart/items/507f1f77bcf86cd799439011',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should clear entire cart successfully', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: '/api/v1/cart',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return empty cart after clearing', async () => {
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
      expect(body.data.items.length).toBe(0);
      expect(body.data.total).toBe(0);
    });
  });

  describe('Cart Pricing with Dynamic Rules', () => {
    let pricingProductId: string;

    beforeAll(async () => {
      // Create product with pricing rule
      const productResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Pricing Test Product',
          description: 'Test product for pricing',
          price: 100,
          inventory: 100,
          sku: 'PRICING-001',
        },
      });
      pricingProductId = JSON.parse(productResponse.body).data.id;
    });

    it('should apply base price correctly', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/cart/items',
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
      expect(body.data.total).toBe(200);
    });
  });
});
