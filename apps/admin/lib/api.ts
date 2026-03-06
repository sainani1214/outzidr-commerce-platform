const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDTO {
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || 'An error occurred',
      };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Tenant APIs
export async function fetchTenants(): Promise<ApiResponse<Tenant[]>> {
  return fetchAPI<Tenant[]>('/admin/tenants');
}

export async function fetchTenant(id: string): Promise<ApiResponse<Tenant>> {
  return fetchAPI<Tenant>(`/admin/tenants/${id}`);
}

export async function createTenant(
  data: CreateTenantDTO
): Promise<ApiResponse<Tenant>> {
  return fetchAPI<Tenant>('/admin/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTenant(
  id: string,
  data: Partial<CreateTenantDTO>
): Promise<ApiResponse<Tenant>> {
  return fetchAPI<Tenant>(`/admin/tenants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTenant(id: string): Promise<ApiResponse<void>> {
  return fetchAPI<void>(`/admin/tenants/${id}`, {
    method: 'DELETE',
  });
}
