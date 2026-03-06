'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTenant } from '@/lib/api';

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    customDomain: '',
  });

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await createTenant({
      name: formData.name,
      slug: formData.slug,
      domain: formData.domain || undefined,
      customDomain: formData.customDomain || undefined,
    });

    if (response.error) {
      setError(response.error);
      setLoading(false);
    } else {
      // Refresh the router cache and navigate
      router.refresh();
      router.push('/tenants');
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#2A2A30] bg-[#0B0B0D]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/tenants" className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block">
            ← Back to Tenants
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Tenant</h1>
          <p className="text-sm text-[#9A9AA1]">Add a new organization to the platform</p>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 border border-red-500/40 bg-red-500/10 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-[#2A2A30] rounded-xl p-8 bg-[#0B0B0D]">
          <div className="space-y-6">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Acme Corporation"
                required
                className="w-full h-12 px-4 bg-[#1A1A1F] border border-[#2A2A30] rounded-lg text-white placeholder-[#6E6E73] focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="mt-2 text-xs text-[#9A9AA1]">
                The official name of the organization
              </p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Slug *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="acme-corporation"
                  required
                  pattern="[a-z0-9-]+"
                  className="flex-1 h-12 px-4 bg-[#1A1A1F] border border-[#2A2A30] rounded-lg text-white placeholder-[#6E6E73] focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-[#9A9AA1] text-sm">.localhost:3000</span>
              </div>
              <p className="mt-2 text-xs text-[#9A9AA1]">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </div>

            {/* Domain (Optional) */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Default Domain (Optional)
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="acme.example.com"
                className="w-full h-12 px-4 bg-[#1A1A1F] border border-[#2A2A30] rounded-lg text-white placeholder-[#6E6E73] focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="mt-2 text-xs text-[#9A9AA1]">
                Default subdomain for this tenant
              </p>
            </div>

            {/* Custom Domain (Optional) */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                placeholder="www.acme.com"
                className="w-full h-12 px-4 bg-[#1A1A1F] border border-[#2A2A30] rounded-lg text-white placeholder-[#6E6E73] focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="mt-2 text-xs text-[#9A9AA1]">
                Custom domain for production use
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-[#2A2A30]">
            <Link
              href="/tenants"
              className="flex-1 h-12 flex items-center justify-center rounded-lg border border-[#2A2A30] text-white hover:bg-[#1A1A1F] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>

        {/* Preview */}
        {formData.slug && (
          <div className="mt-8 border border-[#2A2A30] rounded-xl p-6 bg-[#0B0B0D]">
            <h3 className="text-sm font-medium text-white mb-4">Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9A9AA1]">Store URL:</span>
                <code className="text-blue-400">
                  http://{formData.slug}.localhost:3000
                </code>
              </div>
              {formData.customDomain && (
                <div className="flex justify-between">
                  <span className="text-[#9A9AA1]">Custom URL:</span>
                  <code className="text-green-400">
                    https://{formData.customDomain}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
