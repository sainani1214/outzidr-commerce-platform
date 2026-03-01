'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function extractTenantSlugFromHost(host: string | null): string {
  if (!host) return 'default';
  
  const hostname = host.split(':')[0];
  
  const parts = hostname.split('.');
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'default';
  }
  
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }
  
  if (parts.length > 2) {
    return parts[0];
  }
  
  return 'default';
}

interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export async function loginAction(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const tenantSlug = extractTenantSlugFromHost(host);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-slug': tenantSlug,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Login failed',
      };
    }

    const accessToken = data.accessToken || data.data?.accessToken;
    const refreshToken = data.refreshToken || data.data?.refreshToken;

    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      cookieStore.set('tenant_slug', tenantSlug, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });

      if (refreshToken) {
        cookieStore.set('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      }

      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid response from server',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<AuthResponse> {
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const tenantSlug = extractTenantSlugFromHost(host);

    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      };
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-slug': tenantSlug,
      },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await response.json();
    console.log('Register response:', data);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Registration failed',
      };
    }

    const accessToken = data.accessToken || data.data?.accessToken;
    const refreshToken = data.refreshToken || data.data?.refreshToken;

    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      cookieStore.set('tenant_slug', tenantSlug, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });

      if (refreshToken) {
        cookieStore.set('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      }

      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid response from server',
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  
  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('tenant_slug');

  return { success: true };
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  // Simple token existence check - proxy.ts already handles this
  return !!token;
}

export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  return { isAuthenticated: !!token };
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('tenant_slug');
}
