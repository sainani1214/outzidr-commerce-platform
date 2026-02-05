export interface Product {
  id: string;
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
  finalPrice?: number;
  discountAmount?: number;
  appliedRules?: string[];
}

export interface CreateProductDTO {
  sku: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  inventory?: number;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'inventory';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface InventoryUpdateDTO {
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
}
