import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TENANT_ID = process.env.TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
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
      
      // Handle 401 Unauthorized - token expired or invalid
      // This will be caught by server components and redirect
      if (response.status === 401) {
        // For server-side requests, redirect immediately
        if (typeof window === 'undefined') {
          redirect('/login');
        }
        
        return {
          error: 'Authentication required',
          message: error.message || 'Your session has expired. Please log in again.',
          statusCode: 401,
        } as ApiResponse<T> & { statusCode: number };
      }
      
      return {
        error: error.message || error.error || 'API request failed',
        message: error.message || response.statusText,
      };
    }

    if (response.status === 204) {
      return { data: {} as T };
    }

    const result = await response.json();
    
    // Backend returns { success, data, pagination }
    // Frontend expects { data, pagination }
    return {
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors to allow Next.js to handle redirects
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
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
  imageUrl?: string;
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

export interface Cart {
  id: string;
  tenantId: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  status: string;
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

export interface OrderItem {
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
  status: string;
  shippingAddress: ShippingAddress;
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
