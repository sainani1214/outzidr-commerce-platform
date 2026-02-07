'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  handleAuthError: (error: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthError = (error: string) => {
    // Check if error is authentication related
    if (
      error === 'Authentication required' ||
      error.includes('session') ||
      error.includes('expired') ||
      error.includes('Unauthorized')
    ) {
      // Save the current path for redirect after login
      const currentPath = pathname !== '/login' ? pathname : '/products';
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  };

  // Global error listener for fetch errors
  useEffect(() => {
    const handleFetchError = (event: ErrorEvent) => {
      if (event.message.includes('401') || event.message.includes('Unauthorized')) {
        handleAuthError('Authentication required');
      }
    };

    window.addEventListener('error', handleFetchError);
    return () => window.removeEventListener('error', handleFetchError);
  }, []);

  return (
    <AuthContext.Provider value={{ handleAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
