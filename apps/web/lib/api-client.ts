/**
 * API Client for Backend
 * Handles authentication, tenant headers, and API communication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_1';

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
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

class ApiClient {
  private baseURL: string;
  private tenantId: string;

  constructor() {
    this.baseURL = API_URL;
    this.tenantId = TENANT_ID;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw {
          error: data.error || 'API Error',
          message: data.message || response.statusText,
          statusCode: response.status,
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        error: 'Network Error',
        message: 'Failed to connect to the server',
        statusCode: 0,
      } as ApiError;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
  }) {
    return this.request<ApiResponse<any>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async login(email: string, password: string) {
    return this.request<ApiResponse<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
  }

  async logout() {
    return this.request<ApiResponse<any>>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, false);
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<ApiResponse<any>>('/users/me');
  }

  // Product endpoints
  async getProducts(params?: { page?: number; limit?: number; category?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    return this.request<ApiResponse<any[]>>(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(id: string) {
    return this.request<ApiResponse<any>>(`/products/${id}`);
  }

  async getProductBySku(sku: string) {
    return this.request<ApiResponse<any>>(`/products/sku/${sku}`);
  }

  // Cart endpoints
  async getCart() {
    return this.request<ApiResponse<any>>('/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request<ApiResponse<any>>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request<ApiResponse<any>>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request<ApiResponse<any>>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<ApiResponse<any>>('/cart', {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async createOrder(shippingAddress: any) {
    return this.request<ApiResponse<any>>('/orders', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress }),
    });
  }

  async getOrders(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<ApiResponse<any[]>>(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request<ApiResponse<any>>(`/orders/${id}`);
  }
}

export const apiClient = new ApiClient();
