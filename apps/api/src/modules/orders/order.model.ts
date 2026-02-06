import mongoose, { Schema, Document } from 'mongoose';
import { Order, OrderItem, OrderStatus, ShippingAddress } from './order.types';

export interface IOrderItemDocument {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface IShippingAddressDocument {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrderDocument extends Document {
  tenantId: string;
  userId: string;
  orderNumber: string;
  items: IOrderItemDocument[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: IShippingAddressDocument;
  toOrderObject(): Order;
}

const OrderItemSchema = new Schema<IOrderItemDocument>(
  {
    productId: { type: String, required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    basePrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddressDocument>(
  {
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    totalItems: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
OrderSchema.index({ tenantId: 1, status: 1 });

OrderSchema.methods.toOrderObject = function (): Order {
  return {
    id: this._id.toString(),
    tenantId: this.tenantId,
    userId: this.userId,
    orderNumber: this.orderNumber,
    items: this.items.map((item: IOrderItemDocument) => ({
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      basePrice: item.basePrice,
      finalPrice: item.finalPrice,
      discountAmount: item.discountAmount,
      subtotal: item.subtotal,
    })),
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    totalDiscount: this.totalDiscount,
    total: this.total,
    status: this.status,
    shippingAddress: {
      name: this.shippingAddress.name,
      addressLine1: this.shippingAddress.addressLine1,
      addressLine2: this.shippingAddress.addressLine2,
      city: this.shippingAddress.city,
      state: this.shippingAddress.state,
      postalCode: this.shippingAddress.postalCode,
      country: this.shippingAddress.country,
      phone: this.shippingAddress.phone,
    },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);
