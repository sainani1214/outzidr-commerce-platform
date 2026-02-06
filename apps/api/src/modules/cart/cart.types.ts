export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  appliedRules?: string[];
  subtotal: number;
}

export interface Cart {
  id: string;
  tenantId: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}
