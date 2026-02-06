import { productService } from '../product.service';
import { ProductModel } from '../product.model';

describe('ProductService', () => {
  const tenantId = 'tenant_test';

  describe('createProduct', () => {
    it('should create a product', async () => {
      const product = await productService.createProduct(tenantId, {
        sku: 'TEST-001',
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        inventory: 100,
        category: 'Electronics',
        tags: ['test', 'sample'],
      });

      expect(product).toBeDefined();
      expect(product.sku).toBe('TEST-001');
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(99.99);
      expect(product.isActive).toBe(true);
    });

    it('should throw error for duplicate SKU in same tenant', async () => {
      await productService.createProduct(tenantId, {
        sku: 'DUPLICATE-SKU',
        name: 'Product 1',
        description: 'Description',
        price: 50,
        inventory: 10,
      });

      await expect(
        productService.createProduct(tenantId, {
          sku: 'DUPLICATE-SKU',
          name: 'Product 2',
          description: 'Description',
          price: 60,
          inventory: 20,
        })
      ).rejects.toThrow();
    });

    it('should allow same SKU in different tenants', async () => {
      const product1 = await productService.createProduct('tenant1', {
        sku: 'SAME-SKU',
        name: 'Product 1',
        description: 'Description',
        price: 50,
        inventory: 10,
      });

      const product2 = await productService.createProduct('tenant2', {
        sku: 'SAME-SKU',
        name: 'Product 2',
        description: 'Description',
        price: 60,
        inventory: 20,
      });

      expect(product1.sku).toBe('SAME-SKU');
      expect(product2.sku).toBe('SAME-SKU');
      expect(product1.id).not.toBe(product2.id);
    });
  });

  describe('getProductById', () => {
    it('should get product by id', async () => {
      const created = await productService.createProduct(tenantId, {
        sku: 'GET-001',
        name: 'Get Product',
        description: 'Description',
        price: 75,
        inventory: 25,
      });

      const product = await productService.getProductById(tenantId, created.id);

      expect(product.id).toBe(created.id);
      expect(product.sku).toBe('GET-001');
    });

    it('should throw error if product not found', async () => {
      await expect(
        productService.getProductById(tenantId, '507f1f77bcf86cd799439011')
      ).rejects.toThrow('Product not found');
    });

    it('should not get product from different tenant', async () => {
      const product = await productService.createProduct('tenant1', {
        sku: 'TENANT-001',
        name: 'Tenant Product',
        description: 'Description',
        price: 100,
        inventory: 50,
      });

      await expect(
        productService.getProductById('tenant2', product.id)
      ).rejects.toThrow('Product not found');
    });
  });

  describe('getProductBySku', () => {
    it('should get product by SKU', async () => {
      await productService.createProduct(tenantId, {
        sku: 'SKU-LOOKUP',
        name: 'SKU Product',
        description: 'Description',
        price: 80,
        inventory: 30,
      });

      const product = await productService.getProductBySku(tenantId, 'SKU-LOOKUP');

      expect(product).toBeDefined();
      expect(product!.sku).toBe('SKU-LOOKUP');
    });

    it('should throw error if SKU not found', async () => {
      await expect(
        productService.getProductBySku(tenantId, 'NONEXISTENT')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('getProducts', () => {
    beforeEach(async () => {
      await ProductModel.create([
        {
          tenantId,
          sku: 'PROD-001',
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          inventory: 50,
          category: 'Electronics',
          isActive: true,
        },
        {
          tenantId,
          sku: 'PROD-002',
          name: 'Product 2',
          description: 'Description 2',
          price: 200,
          inventory: 30,
          category: 'Clothing',
          isActive: true,
        },
        {
          tenantId,
          sku: 'PROD-003',
          name: 'Product 3',
          description: 'Description 3',
          price: 150,
          inventory: 0,
          category: 'Electronics',
          isActive: false,
        },
      ]);
    });

    it('should get all products with pagination', async () => {
      const result = await productService.getProducts(tenantId, {
        page: 1,
        limit: 10,
      });

      expect(result.products).toHaveLength(3);
      expect(result.pagination.totalItems).toBe(3);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter by category', async () => {
      const result = await productService.getProducts(tenantId, {
        page: 1,
        limit: 10,
        category: 'Electronics',
      });

      expect(result.products).toHaveLength(2);
      expect(result.products.every((p) => p.category === 'Electronics')).toBe(true);
    });

    it('should filter by isActive', async () => {
      const result = await productService.getProducts(tenantId, {
        page: 1,
        limit: 10,
        isActive: true,
      });

      expect(result.products).toHaveLength(2);
      expect(result.products.every((p) => p.isActive)).toBe(true);
    });

    it('should search by name', async () => {
      const result = await productService.getProducts(tenantId, {
        page: 1,
        limit: 10,
        search: 'Product 1',
      });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Product 1');
    });

    it('should handle pagination', async () => {
      const page1 = await productService.getProducts(tenantId, {
        page: 1,
        limit: 2,
      });

      const page2 = await productService.getProducts(tenantId, {
        page: 2,
        limit: 2,
      });

      expect(page1.products).toHaveLength(2);
      expect(page2.products).toHaveLength(1);
      expect(page1.pagination.totalPages).toBe(2);
    });

    it('should isolate by tenant', async () => {
      await ProductModel.create({
        tenantId: 'other_tenant',
        sku: 'OTHER-001',
        name: 'Other Product',
        description: 'Description',
        price: 99,
        inventory: 10,
        isActive: true,
      });

      const result = await productService.getProducts(tenantId, {
        page: 1,
        limit: 10,
      });

      expect(result.products).toHaveLength(3);
      expect(result.products.every((p) => p.id !== 'OTHER-001')).toBe(true);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const product = await productService.createProduct(tenantId, {
        sku: 'UPDATE-001',
        name: 'Original Name',
        description: 'Original description',
        price: 100,
        inventory: 50,
      });

      const updated = await productService.updateProduct(tenantId, product.id, {
        name: 'Updated Name',
        price: 120,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.price).toBe(120);
      expect(updated.sku).toBe('UPDATE-001');
    });

    it('should not update product from different tenant', async () => {
      const product = await productService.createProduct('tenant1', {
        sku: 'TENANT-UPDATE',
        name: 'Product',
        description: 'Description',
        price: 100,
        inventory: 50,
      });

      await expect(
        productService.updateProduct('tenant2', product.id, { name: 'Hacked' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      const product = await productService.createProduct(tenantId, {
        sku: 'DELETE-001',
        name: 'Delete Product',
        description: 'Description',
        price: 100,
        inventory: 50,
      });

      await productService.deleteProduct(tenantId, product.id);

      await expect(
        productService.getProductById(tenantId, product.id)
      ).rejects.toThrow('Product not found');
    });

    it('should not delete product from different tenant', async () => {
      const product = await productService.createProduct('tenant1', {
        sku: 'TENANT-DELETE',
        name: 'Product',
        description: 'Description',
        price: 100,
        inventory: 50,
      });

      await expect(
        productService.deleteProduct('tenant2', product.id)
      ).rejects.toThrow('Product not found');
    });
  });

  describe('updateInventory', () => {
    it('should update inventory', async () => {
      const product = await productService.createProduct(tenantId, {
        sku: 'INV-001',
        name: 'Inventory Product',
        description: 'Description',
        price: 100,
        inventory: 50,
      });

      const updated = await productService.updateInventory(
        tenantId,
        product.id,
        { operation: 'set', quantity: 30 }
      );

      expect(updated.inventory).toBe(30);
    });

    it('should throw error for negative inventory', async () => {
      const product = await productService.createProduct(tenantId, {
        sku: 'INV-002',
        name: 'Inventory Product',
        description: 'Description',
        price: 100,
        inventory: 50,
      });

      await expect(
        productService.updateInventory(tenantId, product.id, {
          operation: 'set',
          quantity: -10,
        })
      ).rejects.toThrow();
    });
  });
});
