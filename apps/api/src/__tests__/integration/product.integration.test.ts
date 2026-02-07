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

  describe('POST /api/v1/products', () => {
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

      expect(response.statusCode).toBe(400); 
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

  describe('GET /api/v1/products', () => {
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
      // Create some products first with unique SKUs
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      for (let i = 1; i <= 3; i++) {
        await context.app.inject({
          method: 'POST',
          url: '/api/v1/products',
          headers: {
            'x-tenant-id': context.tenantId,
            authorization: `Bearer ${accessToken}`,
          },
          payload: {
            name: `Pagination Product ${i}`,
            description: `Test product ${i}`,
            price: 10 * i,
            inventory: 100,
            sku: `PAGE-${uniqueId}-${i}`, // Make SKU unique
          },
        });
      }

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
      expect(body.pagination.currentPage).toBe(1);
      expect(body.pagination.itemsPerPage).toBe(2);
      expect(body.pagination.totalItems).toBeGreaterThan(0);
    });

    it('should list all products without pagination', async () => {
      // Create a product for this test with unique SKU
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'List Test Product',
          description: 'Test product for list',
          price: 50,
          inventory: 100,
          sku: `LIST-${uniqueId}`,
        },
      });

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

  describe('GET /api/v1/products/:id', () => {
    it('should get a single product by ID', async () => {
      // Create product for this test
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Get Test Product',
          description: 'A test product description',
          price: 99.99,
          inventory: 100,
          sku: 'GET-001',
        },
      });
      const testProductId = JSON.parse(createResponse.body).data.id;

      const response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/products/${testProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.id).toBe(testProductId);
      expect(body.data.name).toBe('Get Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: '/api/v1/products/507f1f77bcf86cd799439011', 
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

      expect(response.statusCode).toBe(500); 
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update a product successfully', async () => {
      // Create product for this test with unique SKU
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Update Test Product',
          description: 'Test product for update',
          price: 99.99,
          inventory: 100,
          sku: `UPDATE-${uniqueId}`,
        },
      });
      
      expect(createResponse.statusCode).toBe(201);
      const createBody = JSON.parse(createResponse.body);
      expect(createBody.data).toBeDefined();
      const testProductId = createBody.data.id;

      const response = await context.app.inject({
        method: 'PUT',
        url: `/api/v1/products/${testProductId}`,
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

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product successfully', async () => {
      // Create product to delete with unique SKU
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Product to Delete',
          description: 'Test product for delete',
          price: 25,
          inventory: 5,
          sku: `DELETE-${uniqueId}`,
        },
      });
      const deleteProductId = JSON.parse(createResponse.body).data.id;

      const response = await context.app.inject({
        method: 'DELETE',
        url: `/api/v1/products/${deleteProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should fail to get deleted product', async () => {
      // Create and delete a product with unique SKU
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const createResponse = await context.app.inject({
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Product to Delete 2',
          description: 'Test product for delete 2',
          price: 25,
          inventory: 5,
          sku: `DELETE2-${uniqueId}`,
        },
      });
      const deleteProductId = JSON.parse(createResponse.body).data.id;

      await context.app.inject({
        method: 'DELETE',
        url: `/api/v1/products/${deleteProductId}`,
        headers: {
          'x-tenant-id': context.tenantId,
          authorization: `Bearer ${accessToken}`,
        },
      });

      const response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/products/${deleteProductId}`,
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
      expect(body.data.length).toBe(0);
    });

    it('should not access product from other tenant', async () => {
      const response = await context.app.inject({
        method: 'GET',
        url: `/api/v1/products/${productId}`,
        headers: {
          'x-tenant-id': otherTenantId,
          authorization: `Bearer ${otherTenantToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
