/**
 * Server-side API functions for Next.js
 * Used for SSR and SSG data fetching
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_1';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  sku: string;
  category?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Fetch products (SSR/SSG)
 * Used in server components and getServerSideProps/getStaticProps
 */
export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<ApiResponse<Product[]>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);

  const query = queryParams.toString();
  const url = `${API_URL}/products${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-tenant-id': TENANT_ID,
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.error || 'Failed to fetch products',
        message: errorData.message,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      error: 'Network Error',
      message: 'Failed to connect to the server',
    };
  }
}

/**
 * Fetch single product by ID (SSR/SSG)
 */
export async function fetchProduct(id: string): Promise<ApiResponse<Product>> {
  const url = `${API_URL}/products/${id}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-tenant-id': TENANT_ID,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.error || 'Failed to fetch product',
        message: errorData.message,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      error: 'Network Error',
      message: 'Failed to connect to the server',
    };
  }
}

/**
 * Fetch product by SKU (SSR/SSG)
 */
export async function fetchProductBySku(sku: string): Promise<ApiResponse<Product>> {
  const url = `${API_URL}/products/sku/${sku}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-tenant-id': TENANT_ID,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.error || 'Failed to fetch product',
        message: errorData.message,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      error: 'Network Error',
      message: 'Failed to connect to the server',
    };
  }
}
