export interface Tenant {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDTO {
  slug: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface UpdateTenantDTO {
  slug?: string;
  name?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface TenantQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface PaginatedTenants {
  tenants: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
