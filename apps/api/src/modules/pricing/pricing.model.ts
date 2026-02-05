import mongoose, { Schema, Document } from 'mongoose';
import { PricingRule as PricingRuleType, DiscountType, PricingRuleConditions } from './pricing.types';

export interface IPricingRuleDocument extends Document {
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
  toPricingRule(): PricingRuleType;
}

const PricingRuleSchema = new Schema<IPricingRuleDocument>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    conditions: {
      minInventory: { type: Number, min: 0 },
      maxInventory: { type: Number, min: 0 },
      minQuantity: { type: Number, min: 0 },
      maxQuantity: { type: Number, min: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PricingRuleSchema.index({ tenantId: 1, productId: 1, isActive: 1, priority: -1 });
PricingRuleSchema.index({ tenantId: 1, isActive: 1, priority: -1 });

PricingRuleSchema.methods.toPricingRule = function (): PricingRuleType {
  return {
    id: this._id.toString(),
    tenantId: this.tenantId,
    productId: this.productId,
    name: this.name,
    discountType: this.discountType,
    discountValue: this.discountValue,
    conditions: this.conditions,
    isActive: this.isActive,
    priority: this.priority,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const PricingRule = mongoose.model<IPricingRuleDocument>('PricingRule', PricingRuleSchema);
