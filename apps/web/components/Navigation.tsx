'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/_actions/auth';
import { colors } from '@/styles/colors';

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/cart', label: 'Cart' },
    { href: '/orders', label: 'Orders' },
  ];

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: `${colors.bg.secondary}cc`,
        borderColor: colors.border.subtle,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-semibold"
            style={{ color: colors.text.primary }}
          >
            Outzidr
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: isActive ? colors.accent.primary : colors.text.secondary,
                    backgroundColor: isActive ? `${colors.accent.primary}15` : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color: colors.text.secondary,
                border: `1px solid ${colors.border.subtle}`,
              }}
            >
              Logout
            </button>
          </div>

          <button className="md:hidden p-2" style={{ color: colors.text.primary }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
