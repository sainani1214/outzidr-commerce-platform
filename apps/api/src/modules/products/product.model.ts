import mongoose, { Document, Schema } from 'mongoose';
import { Product } from './product.types';

export interface IProductDocument extends Document {
  tenantId: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  category?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toProductObject(): Product;
}

const productSchema = new Schema<IProductDocument>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    inventory: {
      type: Number,
      required: true,
      min: [0, 'Inventory cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Inventory must be an integer',
      },
    },
    category: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: SKU must be unique per tenant
productSchema.index({ sku: 1, tenantId: 1 }, { unique: true });

// Additional indexes for performance
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });
productSchema.index({ tenantId: 1, price: 1 });

// Method to convert document to plain Product object
productSchema.methods.toProductObject = function (): Product {
  return {
    id: this._id.toString(),
    tenantId: this.tenantId,
    sku: this.sku,
    name: this.name,
    description: this.description,
    price: this.price,
    inventory: this.inventory,
    category: this.category,
    tags: this.tags,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ProductModel = mongoose.model<IProductDocument>(
  'Product',
  productSchema
);
