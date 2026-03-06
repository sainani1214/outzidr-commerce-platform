'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTenants, type Tenant } from '@/lib/api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);
    const response = await fetchTenants();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setTenants(response.data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#2A2A30] border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9A9AA1]">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#2A2A30] bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-white">Tenant Management</h1>
              <p className="text-sm text-[#9A9AA1]">Manage all tenant organizations</p>
            </div>
            <Link
              href="/tenants/new"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              + Create Tenant
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 border border-red-500/40 bg-red-500/10 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} onUpdate={loadTenants} />
          ))}
        </div>

        {tenants.length === 0 && !loading && (
          <div className="text-center py-12 border border-[#2A2A30] rounded-xl">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Tenants Yet</h3>
            <p className="text-[#9A9AA1] mb-6">Create your first tenant to get started</p>
            <Link
              href="/tenants/new"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Create First Tenant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function TenantCard({ tenant, onUpdate }: { tenant: Tenant; onUpdate: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="border border-[#2A2A30] rounded-xl p-6 bg-[#0B0B0D] hover:border-[#3A3A40] transition-colors relative">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tenant.isActive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {tenant.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Tenant Icon */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-4">
        {tenant.name.charAt(0)}
      </div>

      {/* Tenant Info */}
      <h3 className="text-lg font-semibold text-white mb-1">{tenant.name}</h3>
      <p className="text-sm text-[#9A9AA1] mb-4">{tenant.slug}.localhost:3000</p>

      {/* Tenant Details */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#6E6E73]">ID:</span>
          <code className="text-xs bg-[#1A1A1F] px-2 py-1 rounded text-blue-400">
            {tenant.tenantId.substring(0, 20)}...
          </code>
        </div>
        {tenant.customDomain && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6E6E73]">Domain:</span>
            <span className="text-white">{tenant.customDomain}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/tenants/${tenant.id}`}
          className="flex-1 h-10 flex items-center justify-center rounded-lg border border-[#2A2A30] text-sm font-medium text-white hover:bg-[#1A1A1F] transition-colors"
        >
          View Details
        </Link>
        <Link
          href={`http://${tenant.slug}.localhost:3000`}
          target="_blank"
          className="flex-1 h-10 flex items-center justify-center rounded-lg bg-blue-500 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          Open Store →
        </Link>
      </div>
    </div>
  );
}
