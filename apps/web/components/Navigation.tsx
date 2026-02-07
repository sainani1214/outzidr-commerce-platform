'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logoutAction, checkAuthStatus } from '@/app/_actions/auth';
import { colors } from '@/styles/colors';
import { useToast } from '@/app/_providers/ToastProvider';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showSuccess } = useToast();

  useEffect(() => {
    // Check authentication status on mount and pathname change
    const checkAuth = async () => {
      try {
        const { isAuthenticated: authStatus } = await checkAuthStatus();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/cart', label: 'Cart' },
    { href: '/orders', label: 'Orders' },
  ];

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      showSuccess('Logged Out Successfully', 'See you soon!');
      setMobileMenuOpen(false);
      setIsAuthenticated(false);
      // Small delay to show the toast before navigation
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    }
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

          {/* Desktop Navigation */}
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
            
            {isAuthenticated ? (
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
            ) : (
              <Link
                href="/login"
                className="ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: colors.accent.primary,
                  color: 'white',
                }}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2" 
            style={{ color: colors.text.primary }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-t"
          style={{ 
            backgroundColor: colors.bg.secondary,
            borderColor: colors.border.subtle 
          }}
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: isActive ? colors.accent.primary : colors.text.secondary,
                    backgroundColor: isActive ? `${colors.accent.primary}15` : 'transparent',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full text-center block px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: colors.accent.primary,
                  color: 'white',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
