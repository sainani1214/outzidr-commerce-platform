export enum OrderStatus {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  tenantId: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  shippingAddress: ShippingAddress;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: 'createdAt' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
