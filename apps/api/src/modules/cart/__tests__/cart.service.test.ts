import { cartService } from '../cart.service';
import { productService } from '../../products/product.service';
import { pricingService } from '../../pricing/pricing.service';
import { CartModel } from '../cart.model';
import { ProductModel } from '../../products/product.model';
import { CartStatus } from '../cart.types';

describe('CartService', () => {
  const tenantId = 'tenant_test';
  const userId = 'user_123';
  let testProduct: any;

  beforeEach(async () => {
    testProduct = await ProductModel.create({
      tenantId,
      sku: 'TEST-SKU-001',
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      inventory: 50,
      isActive: true,
    });
  });

  describe('getCart', () => {
    it('should create and return empty cart if not exists', async () => {
      const cart = await cartService.getCart(tenantId, userId);

      expect(cart).toBeDefined();
      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should return existing cart', async () => {
      await CartModel.create({
        tenantId,
        userId,
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        status: CartStatus.ACTIVE,
      });

      const cart = await cartService.getCart(tenantId, userId);

      expect(cart).toBeDefined();
    });
  });

  describe('addItem', () => {
    it('should add new item to empty cart', async () => {
      const cart = await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 2,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(testProduct.id);
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.totalItems).toBe(2);
    });

    it('should increment quantity for existing item', async () => {
      await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 2,
      });

      const cart = await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 3,
      });

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalItems).toBe(5);
    });

    it('should throw error if product is inactive', async () => {
      testProduct.isActive = false;
      await testProduct.save();

      await expect(
        cartService.addItem(tenantId, userId, {
          productId: testProduct.id,
          quantity: 1,
        })
      ).rejects.toThrow('Product is not available');
    });

    it('should throw error if insufficient inventory', async () => {
      await expect(
        cartService.addItem(tenantId, userId, {
          productId: testProduct.id,
          quantity: 100,
        })
      ).rejects.toThrow('Only 50 items available in stock');
    });

    it('should throw error if adding more exceeds inventory', async () => {
      await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 30,
      });

      await expect(
        cartService.addItem(tenantId, userId, {
          productId: testProduct.id,
          quantity: 25,
        })
      ).rejects.toThrow('Only 50 items available in stock');
    });

    it('should apply dynamic pricing when adding items', async () => {
      const cart = await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 2,
      });

      expect(cart.items[0].basePrice).toBe(100);
      expect(cart.items[0].finalPrice).toBeDefined();
      expect(cart.subtotal).toBeGreaterThan(0);
    });
  });

  describe('updateItemQuantity', () => {
    beforeEach(async () => {
      await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 5,
      });
    });

    it('should update item quantity', async () => {
      const cart = await cartService.updateItemQuantity(
        tenantId,
        userId,
        testProduct.id,
        { quantity: 10 }
      );

      expect(cart.items[0].quantity).toBe(10);
      expect(cart.totalItems).toBe(10);
    });

    it('should throw error if cart not found', async () => {
      await expect(
        cartService.updateItemQuantity(tenantId, 'other_user', testProduct.id, {
          quantity: 5,
        })
      ).rejects.toThrow('Cart not found');
    });

    it('should throw error if item not in cart', async () => {
      await expect(
        cartService.updateItemQuantity(tenantId, userId, 'nonexistent', {
          quantity: 5,
        })
      ).rejects.toThrow('Item not found in cart');
    });

    it('should throw error if quantity is zero or negative', async () => {
      await expect(
        cartService.updateItemQuantity(tenantId, userId, testProduct.id, {
          quantity: 0,
        })
      ).rejects.toThrow('Quantity must be greater than 0');

      await expect(
        cartService.updateItemQuantity(tenantId, userId, testProduct.id, {
          quantity: -1,
        })
      ).rejects.toThrow('Quantity must be greater than 0');
    });

    it('should throw error if insufficient inventory', async () => {
      await expect(
        cartService.updateItemQuantity(tenantId, userId, testProduct.id, {
          quantity: 100,
        })
      ).rejects.toThrow('Only 50 items available in stock');
    });

    it('should recalculate pricing when quantity changes', async () => {
      const initialCart = await cartService.getCart(tenantId, userId);
      const initialTotal = initialCart.total;

      const updatedCart = await cartService.updateItemQuantity(
        tenantId,
        userId,
        testProduct.id,
        { quantity: 10 }
      );

      expect(updatedCart.total).not.toBe(initialTotal);
    });
  });

  describe('removeItem', () => {
    beforeEach(async () => {
      await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 5,
      });
    });

    it('should remove item from cart', async () => {
      const cart = await cartService.removeItem(tenantId, userId, testProduct.id);

      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should throw error if cart not found', async () => {
      await expect(
        cartService.removeItem(tenantId, 'other_user', testProduct.id)
      ).rejects.toThrow('Cart not found');
    });

    it('should throw error if item not in cart', async () => {
      await expect(
        cartService.removeItem(tenantId, userId, 'nonexistent')
      ).rejects.toThrow('Item not found in cart');
    });

    it('should recalculate totals after removal', async () => {
      const product2 = await ProductModel.create({
        tenantId,
        sku: 'TEST-SKU-002',
        name: 'Test Product 2',
        description: 'Test description',
        price: 50,
        inventory: 30,
        isActive: true,
      });

      await cartService.addItem(tenantId, userId, {
        productId: product2.id,
        quantity: 3,
      });

      const cart = await cartService.removeItem(tenantId, userId, testProduct.id);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(product2.id);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 5,
      });

      await cartService.clearCart(tenantId, userId);

      const cart = await cartService.getCart(tenantId, userId);
      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should handle clearing non-existent cart', async () => {
      await expect(
        cartService.clearCart(tenantId, 'nonexistent_user')
      ).resolves.not.toThrow();
    });
  });

  describe('getCartSummary', () => {
    it('should return cart summary', async () => {
      await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 5,
      });

      const summary = await cartService.getCartSummary(tenantId, userId);

      expect(summary.totalItems).toBe(5);
      expect(summary.subtotal).toBeGreaterThan(0);
      expect(summary.total).toBeGreaterThan(0);
    });

    it('should return empty summary for empty cart', async () => {
      const summary = await cartService.getCartSummary(tenantId, userId);

      expect(summary.totalItems).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.total).toBe(0);
    });
  });

  describe('multi-tenant isolation', () => {
    it('should isolate carts by tenant', async () => {
      // Create product for tenant1 (using testProduct that already exists with tenant_test)
      const tenant1Cart = await cartService.addItem(tenantId, userId, {
        productId: testProduct.id,
        quantity: 2,
      });

      // Create product for tenant2
      const tenant2Product = await ProductModel.create({
        tenantId: 'tenant2',
        sku: 'TEST-SKU-002',
        name: 'Test Product',
        description: 'Test description',
        price: 100,
        inventory: 50,
        isActive: true,
      });

      const tenant2Cart = await cartService.addItem('tenant2', userId, {
        productId: tenant2Product.id,
        quantity: 3,
      });

      expect(tenant1Cart.items).toHaveLength(1);
      expect(tenant2Cart.items).toHaveLength(1);
      expect(tenant1Cart.items[0].quantity).toBe(2);
      expect(tenant2Cart.items[0].quantity).toBe(3);
    });
  });
});
