export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
  INVENTORY_BASED = 'INVENTORY_BASED',
}

export interface PricingRuleConditions {
  minInventory?: number;
  maxInventory?: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface PricingRule {
  id: string;
  tenantId: string;
  productId?: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  conditions: PricingRuleConditions;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePricingRuleDTO {
  productId?: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  conditions?: PricingRuleConditions;
  isActive?: boolean;
  priority?: number;
}

export interface UpdatePricingRuleDTO {
  name?: string;
  discountType?: DiscountType;
  discountValue?: number;
  conditions?: PricingRuleConditions;
  isActive?: boolean;
  priority?: number;
}

export interface PriceCalculationRequest {
  productId: string;
  quantity: number;
  basePrice: number;
  inventory: number;
}

export interface PriceCalculationResult {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    discountType: DiscountType;
    discountValue: number;
  }>;
}

export interface PricingRuleQuery {
  page?: number;
  limit?: number;
  productId?: string;
  isActive?: boolean;
  discountType?: DiscountType;
}
