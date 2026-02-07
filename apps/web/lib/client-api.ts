'use client';

import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'tenant_1';

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

// This hook provides API methods that automatically handle authentication errors
export function useApi() {
  const router = useRouter();

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': TENANT_ID,
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
          // Redirect to login
          router.push('/login');
          return {
            error: 'Authentication required',
            message: 'Your session has expired. Please log in again.',
            statusCode: 401,
          };
        }
        
        return {
          error: error.message || error.error || 'API request failed',
          message: error.message || response.statusText,
          statusCode: response.status,
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

  return { request };
}
