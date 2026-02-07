import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_1';

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

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
}

export async function createHeaders(includeAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-tenant-id': TENANT_ID,
  };

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<ApiResponse<T>> {
  try {
    const headers = await createHeaders(includeAuth);
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        error: error.message || error.error || 'API request failed',
        message: error.message || response.statusText,
      };
    }

    if (response.status === 204) {
      return { data: {} as T };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to server',
    };
  }
}

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
  return apiRequest<Product[]>(`/products${query ? `?${query}` : ''}`);
}

export async function fetchProduct(id: string): Promise<ApiResponse<Product>> {
  return apiRequest<Product>(`/products/${id}`);
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchCart(): Promise<ApiResponse<Cart>> {
  return apiRequest<Cart>('/cart');
}

export async function addToCart(
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  return apiRequest<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  return apiRequest<Cart>(`/cart/items/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(productId: string): Promise<ApiResponse<Cart>> {
  return apiRequest<Cart>(`/cart/items/${productId}`, {
    method: 'DELETE',
  });
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export async function fetchOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Order[]>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString();
  return apiRequest<Order[]>(`/orders${query ? `?${query}` : ''}`);
}

export async function fetchOrder(id: string): Promise<ApiResponse<Order>> {
  return apiRequest<Order>(`/orders/${id}`);
}

export async function createOrder(shippingAddress: any): Promise<ApiResponse<Order>> {
  return apiRequest<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({ shippingAddress }),
  });
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCurrentUser(): Promise<ApiResponse<User>> {
  return apiRequest<User>('/users/me');
}
