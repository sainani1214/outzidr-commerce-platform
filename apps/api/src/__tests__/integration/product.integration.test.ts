import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestContext, teardownTestContext, TestContext } from '../helpers/testApp';

describe('Product Integration Tests', () => {
  let context: TestContext;
  let accessToken: string;
  let productId: string;

  beforeAll(async () => {
    context = await setupTestContext();

    // Register and login to get access token
    await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      headers: {
        'x-tenant-id': context.tenantId,
      },
      payload: {
        email: 'product@example.com',
        password: 'Test@12345',
        confirmPassword: 'Test@12345',
        name: 'Product Tester',
      },
    });

    const loginResponse = await context.app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: {
        'x-tenant-id': context.tenantId,
      },
      payload: {
        email: 'product@example.com',
        password: 'Test@12345',
      },
    });

    const loginBody = JSON.parse(loginResponse.body);
    accessToken = loginBody.accessToken;
  });

  afterAll(async () => {
    await teardownTestContext(context);
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Test Product',
          description: 'A test product description',
          price: 99.99,
          inventory: 100,
          category: 'Electronics',
          sku: 'TEST-001',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
      expect(body.data.id).toBeDefined();
      expect(body.data.name).toBe('Test Product');
      expect(body.data.price).toBe(99.99);
      expect(body.data.inventory).toBe(100);
      expect(body.data.category).toBe('Electronics');
      expect(body.data.sku).toBe('TEST-001');
      expect(body.data.tenantId).toBe(context.tenantId);

      productId = body.data.id;
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
        },
        payload: {
          name: 'Unauthorized Product',
          price: 50,
          inventory: 10,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should fail with duplicate SKU', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Duplicate SKU Product',
          price: 49.99,
          inventory: 50,
          sku: 'TEST-001', // Same SKU as before
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    it('should fail with negative price', async () => {
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Negative Price Product',
          price: -10,
          inventory: 10,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    beforeAll(async () => {
      // Create multiple products for listing
      const products = [
        { name: 'Product 1', price: 10, inventory: 5, sku: 'PROD-001' },
        { name: 'Product 2', price: 20, inventory: 10, sku: 'PROD-002' },
        { name: 'Product 3', price: 30, inventory: 15, sku: 'PROD-003' },
      ];

      for (const product of products) {
        await context.app.inject({
          method: 'POST',
          url: '/api/v1/products',
          headers: {
            'x-tenant-id': context.tenantId,
            authorization: `Bearer ${accessToken}`,
          },
          payload: product,
        });
      }
    });

    it('should list products with pagination', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products?page=1&limit=2',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(2);
      expect(body.pagination.total).toBeGreaterThan(0);
    });

    it('should list all products without pagination', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product by ID', async () => {
      expect(productId).toBeDefined();

      const response = await context.app.inject({
        method: 'GET',
        url: `/api/products/${productId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(productId);
      expect(body.data.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products/507f1f77bcf86cd799439011', // Valid ObjectId but doesn't exist
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products/invalid-id',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product successfully', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/products/${productId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Updated Product Name',
          price: 149.99,
          inventory: 75,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.name).toBe('Updated Product Name');
      expect(body.data.price).toBe(149.99);
      expect(body.data.inventory).toBe(75);
    });

    it('should fail to update non-existent product', async () => {
      const response = await context.app.inject({
        method: 'PUT',
        url: '/api/v1/products/507f1f77bcf86cd799439011',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Should Fail',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let deleteProductId: string;

    beforeAll(async () => {
      // Create a product to delete
      const response = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Product to Delete',
          price: 25,
          inventory: 5,
          sku: 'DELETE-001',
        },
      });

      const body = JSON.parse(response.body);
      deleteProductId = body.data.id;
    });

    it('should delete a product successfully', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/products/${deleteProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('deleted');
    });

    it('should fail to get deleted product', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/products/${deleteProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should fail to delete non-existent product', async () => {
      const response = await context.app.inject({
        method: 'DELETE',
        url: '/api/v1/products/507f1f77bcf86cd799439011',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Tenant Isolation', () => {
    let otherTenantToken: string;
    const otherTenantId = 'other_tenant_' + Date.now();

    beforeAll(async () => {
      // Create user in different tenant
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        headers: {
          'x-tenant-id': otherTenantId,
        },
        payload: {
          email: 'other@example.com',
          password: 'Test@12345',
          confirmPassword: 'Test@12345',
          name: 'Other Tenant User',
        },
      });

      const loginResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        headers: {
          'x-tenant-id': otherTenantId,
        },
        payload: {
          email: 'other@example.com',
          password: 'Test@12345',
        },
      });

      const loginBody = JSON.parse(loginResponse.body);
      otherTenantToken = loginBody.accessToken;
    });

    it('should not see products from other tenant', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': otherTenantId,
          authorization: `Bearer ${otherTenantToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(0); // Should have no products
    });

    it('should not access product from other tenant', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/products/${productId}`,
        headers: {
          'x-tenant-id': otherTenantId,
          authorization: `Bearer ${otherTenantToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
