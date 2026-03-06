import Link from 'next/link';
import { fetchTenants } from '@/lib/api';

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHomePage() {
  // Fetch real data from API
  const { data: tenants } = await fetchTenants();
  
  const totalTenants = tenants?.length || 0;
  const activeStores = tenants?.filter(t => t.isActive).length || 0;
  
  // TODO: Fetch actual product and pricing rule counts from API
  const totalProducts = 36; // Placeholder
  const pricingRules = 19; // Placeholder

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#2A2A30] bg-[#0B0B0D]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Outzidr Admin</h1>
            <p className="text-xs text-[#9A9AA1]">Platform Management Console</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#9A9AA1]">Super Admin</span>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              SA
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-white mb-2">
            Welcome to Admin Panel
          </h2>
          <p className="text-[#9A9AA1]">
            Manage tenants, domains, pricing rules, and platform settings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Tenants" value={totalTenants.toString()} icon="🏢" />
          <StatCard title="Active Stores" value={activeStores.toString()} icon="🏪" />
          <StatCard title="Total Products" value={totalProducts.toString()} icon="📦" />
          <StatCard title="Pricing Rules" value={pricingRules.toString()} icon="💰" />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="Manage Tenants"
            description="Create, edit, and manage tenant organizations"
            icon="🏢"
            href="/tenants"
            color="blue"
          />
          <ActionCard
            title="Domain Management"
            description="Configure custom domains and subdomains"
            icon="🌐"
            href="/domains"
            color="green"
          />
          <ActionCard
            title="Pricing Rules"
            description="Set up global and tenant-specific pricing"
            icon="💰"
            href="/pricing"
            color="purple"
          />
          <ActionCard
            title="Products Overview"
            description="View and manage all tenant products"
            icon="📦"
            href="/products"
            color="orange"
          />
          <ActionCard
            title="Users & Access"
            description="Manage admin users and permissions"
            icon="👥"
            href="/users"
            color="pink"
          />
          <ActionCard
            title="Platform Settings"
            description="Configure global platform settings"
            icon="⚙️"
            href="/settings"
            color="gray"
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="border border-[#2A2A30] rounded-xl p-6 bg-[#0B0B0D] hover:border-[#3A3A40] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm text-[#9A9AA1]">{title}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'hover:border-blue-500/50 hover:bg-blue-500/5',
    green: 'hover:border-green-500/50 hover:bg-green-500/5',
    purple: 'hover:border-purple-500/50 hover:bg-purple-500/5',
    orange: 'hover:border-orange-500/50 hover:bg-orange-500/5',
    pink: 'hover:border-pink-500/50 hover:bg-pink-500/5',
    gray: 'hover:border-gray-500/50 hover:bg-gray-500/5',
  };

  return (
    <Link
      href={href}
      className={`block border border-[#2A2A30] rounded-xl p-6 bg-[#0B0B0D] transition-all ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#9A9AA1]">{description}</p>
      <div className="mt-4 text-sm text-blue-400 flex items-center gap-2">
        Manage <span>→</span>
      </div>
    </Link>
  );
}
