import { pricingService } from '../pricing.service';
import { PricingRule } from '../pricing.model';
import { DiscountType } from '../pricing.types';

describe('PricingService', () => {
  const tenantId = 'tenant_test';
  const productId = 'product_123';

  describe('calculatePrice', () => {
    it('should return base price when no rules apply', async () => {
      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.originalPrice).toBe(200);
      expect(result.finalPrice).toBe(200);
      expect(result.discountAmount).toBe(0);
      expect(result.appliedRules).toHaveLength(0);
    });

    it('should apply percentage discount', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: '10% off',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        conditions: {},
        priority: 1,
        isActive: true,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.originalPrice).toBe(200);
      expect(result.finalPrice).toBe(180);
      expect(result.discountAmount).toBe(20);
      expect(result.appliedRules).toHaveLength(1);
    });

    it('should apply flat discount', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: '$15 off',
        discountType: DiscountType.FLAT,
        discountValue: 15,
        conditions: {},
        priority: 1,
        isActive: true,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.finalPrice).toBe(185);
      expect(result.discountAmount).toBe(15);
    });

    it('should apply quantity-based discount', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: '20% off for 5+',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        conditions: { minQuantity: 5 },
        priority: 1,
        isActive: true,
      });

      const lowQty = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 3,
        basePrice: 100,
        inventory: 50,
      });

      expect(lowQty.discountAmount).toBe(0);

      const highQty = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 10,
        basePrice: 100,
        inventory: 50,
      });

      expect(highQty.discountAmount).toBe(200);
    });

    it('should apply inventory-based discount', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: 'Low stock discount',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 25,
        conditions: { maxInventory: 10 },
        priority: 1,
        isActive: true,
      });

      const highInventory = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(highInventory.discountAmount).toBe(0);

      const lowInventory = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 5,
      });

      expect(lowInventory.discountAmount).toBe(50);
    });

    it('should apply multiple rules in priority order', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: 'Rule 1',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        conditions: {},
        priority: 1,
        isActive: true,
      });

      await PricingRule.create({
        tenantId,
        productId,
        name: 'Rule 2',
        discountType: DiscountType.FLAT,
        discountValue: 5,
        conditions: {},
        priority: 2,
        isActive: true,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.appliedRules).toHaveLength(2);
      expect(result.discountAmount).toBe(25);
    });

    it('should not apply inactive rules', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: 'Inactive rule',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 50,
        conditions: {},
        priority: 1,
        isActive: false,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.discountAmount).toBe(0);
    });

    it('should not apply discount below zero', async () => {
      await PricingRule.create({
        tenantId,
        productId,
        name: 'Huge discount',
        discountType: DiscountType.FLAT,
        discountValue: 500,
        conditions: {},
        priority: 1,
        isActive: true,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.finalPrice).toBe(0);
      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });

    it('should isolate rules by tenant', async () => {
      await PricingRule.create({
        tenantId: 'tenant_other',
        productId,
        name: 'Other tenant rule',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 50,
        conditions: {},
        priority: 1,
        isActive: true,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.discountAmount).toBe(0);
    });

    it('should apply global rules (no productId)', async () => {
      await PricingRule.create({
        tenantId,
        name: 'Global discount',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 5,
        conditions: {},
        priority: 1,
        isActive: true,
      });

      const result = await pricingService.calculatePrice(tenantId, {
        productId,
        quantity: 2,
        basePrice: 100,
        inventory: 50,
      });

      expect(result.discountAmount).toBe(10);
    });
  });
});
