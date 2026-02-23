'use client';

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

function getTokenFromCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const refreshToken = getTokenFromCookie('refresh_token');
    if (!refreshToken) {
      return false;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return !!data.success;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// This hook provides API methods that automatically handle authentication errors and token refresh
export function useApi() {
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
        
        // Handle 401 Unauthorized - try refresh first
        if (response.status === 401 && !endpoint.includes('/auth/')) {
          const refreshed = await attemptTokenRefresh();
          
          if (refreshed) {
            // Retry the original request
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': TENANT_ID,
                ...options.headers,
              },
              credentials: 'include',
            });

            if (retryResponse.ok) {
              if (retryResponse.status === 204) {
                return { data: {} as T };
              }
              const result = await retryResponse.json();
              return {
                data: result.data,
                pagination: result.pagination,
              };
            }
          }
          
          // Refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
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
