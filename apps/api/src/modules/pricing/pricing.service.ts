import { PricingRule, IPricingRuleDocument } from './pricing.model';
import {
  DiscountType,
  CreatePricingRuleDTO,
  UpdatePricingRuleDTO,
  PriceCalculationRequest,
  PriceCalculationResult,
  PricingRuleQuery,
} from './pricing.types';

class PricingService {
  async calculatePrice(
    tenantId: string,
    request: PriceCalculationRequest
  ): Promise<PriceCalculationResult> {
    const { productId, quantity, basePrice, inventory } = request;

    const rules = await PricingRule.find({
      tenantId,
      $or: [
        { productId },
        { productId: { $exists: false } },
      ],
      isActive: true,
    }).sort({ priority: -1 });

    const applicableRules = rules.filter((rule) =>
      this.isRuleApplicable(rule, inventory, quantity)
    );

    let finalPrice = basePrice * quantity;
    let totalDiscount = 0;
    const appliedRules: PriceCalculationResult['appliedRules'] = [];

    for (const rule of applicableRules) {
      const discount = this.calculateDiscount(
        rule,
        basePrice,
        quantity,
        inventory
      );

      if (discount > 0) {
        totalDiscount += discount;
        appliedRules.push({
          ruleId: rule._id.toString(),
          ruleName: rule.name,
          discountType: rule.discountType,
          discountValue: rule.discountValue,
        });
      }
    }

    finalPrice = Math.max(0, finalPrice - totalDiscount);

    return {
      originalPrice: basePrice * quantity,
      finalPrice,
      discountAmount: totalDiscount,
      appliedRules,
    };
  }

  private isRuleApplicable(
    rule: IPricingRuleDocument,
    inventory: number,
    quantity: number
  ): boolean {
    const { conditions } = rule;

    if (conditions.minInventory !== undefined && inventory < conditions.minInventory) {
      return false;
    }

    if (conditions.maxInventory !== undefined && inventory > conditions.maxInventory) {
      return false;
    }

    if (conditions.minQuantity !== undefined && quantity < conditions.minQuantity) {
      return false;
    }

    if (conditions.maxQuantity !== undefined && quantity > conditions.maxQuantity) {
      return false;
    }

    return true;
  }

  private calculateDiscount(
    rule: IPricingRuleDocument,
    basePrice: number,
    quantity: number,
    inventory: number
  ): number {
    const totalPrice = basePrice * quantity;

    switch (rule.discountType) {
      case DiscountType.PERCENTAGE:
        return (totalPrice * rule.discountValue) / 100;

      case DiscountType.FLAT:
        return rule.discountValue;

      case DiscountType.INVENTORY_BASED:
        if (rule.conditions.minInventory && inventory >= rule.conditions.minInventory) {
          return (totalPrice * rule.discountValue) / 100;
        }
        return 0;

      default:
        return 0;
    }
  }

  async createRule(
    tenantId: string,
    data: CreatePricingRuleDTO
  ): Promise<IPricingRuleDocument> {
    const rule = new PricingRule({
      tenantId,
      ...data,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 0,
      conditions: data.conditions ?? {},
    });

    await rule.save();
    return rule;
  }

  async getRules(tenantId: string, query: PricingRuleQuery) {
    const {
      page = 1,
      limit = 20,
      productId,
      isActive,
      discountType,
    } = query;

    const filter: any = { tenantId };

    if (productId) {
      filter.$or = [{ productId }, { productId: { $exists: false } }];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (discountType) {
      filter.discountType = discountType;
    }

    const skip = (page - 1) * limit;

    const [rules, total] = await Promise.all([
      PricingRule.find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PricingRule.countDocuments(filter),
    ]);

    return {
      rules: rules.map((rule) => rule.toPricingRule()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getRuleById(tenantId: string, ruleId: string): Promise<IPricingRuleDocument | null> {
    return PricingRule.findOne({ _id: ruleId, tenantId });
  }

  async updateRule(
    tenantId: string,
    ruleId: string,
    data: UpdatePricingRuleDTO
  ): Promise<IPricingRuleDocument | null> {
    const rule = await PricingRule.findOneAndUpdate(
      { _id: ruleId, tenantId },
      { $set: data },
      { new: true, runValidators: true }
    );

    return rule;
  }

  async deleteRule(tenantId: string, ruleId: string): Promise<boolean> {
    const result = await PricingRule.deleteOne({ _id: ruleId, tenantId });
    return result.deletedCount > 0;
  }
}

export const pricingService = new PricingService();
