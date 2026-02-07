import mongoose, { Schema, Document } from 'mongoose';
import { Cart, CartStatus } from './cart.types';

export interface ICartItemDocument {
  productId: string;
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  appliedRules?: string[];
  subtotal: number;
}

export interface ICartDocument extends Document {
  tenantId: string;
  userId: string;
  items: ICartItemDocument[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  status: CartStatus;
  toCartObject(): Cart;
}

const CartItemSchema = new Schema<ICartItemDocument>(
  {
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    appliedRules: [{ type: String }],
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    items: [CartItemSchema],
    totalItems: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: Object.values(CartStatus), 
      default: CartStatus.ACTIVE 
    },
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ tenantId: 1, userId: 1 }, { unique: true });

CartSchema.methods.toCartObject = function (): Cart {
  return {
    id: this._id.toString(),
    tenantId: this.tenantId,
    userId: this.userId,
    items: this.items.map((item: ICartItemDocument) => ({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
      quantity: item.quantity,
      basePrice: item.basePrice,
      finalPrice: item.finalPrice,
      discountAmount: item.discountAmount,
      appliedRules: item.appliedRules,
      subtotal: item.subtotal,
    })),
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    totalDiscount: this.totalDiscount,
    total: this.total,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CartModel = mongoose.model<ICartDocument>('Cart', CartSchema);
