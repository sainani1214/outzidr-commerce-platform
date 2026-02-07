'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAction } from '../_actions/auth';
import { colors } from '@/styles/colors';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await registerAction(name, email, password, confirmPassword);

    if (result.success) {
      router.push('/products');
      router.refresh();
    } else {
      setError(result.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: colors.bg.primary }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-2"
            style={{ color: colors.text.primary }}
          >
            Outzidr
          </h1>
          <p style={{ color: colors.text.secondary }} className="text-sm md:text-base">
            Create your account
          </p>
        </div>

        <div 
          className="rounded-2xl p-6 sm:p-10 backdrop-blur-xl"
          style={{ 
            backgroundColor: colors.bg.secondary,
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div 
                className="rounded-xl p-4 text-sm"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.bg.surface,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.bg.surface,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.bg.surface,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
                placeholder="••••••••"
              />
              <p 
                className="mt-1 text-xs"
                style={{ color: colors.text.muted }}
              >
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text.primary }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.bg.surface,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.subtle}`,
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-50 mt-6"
              style={{
                backgroundColor: colors.accent.primary,
                color: colors.text.primary,
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div 
                className="w-full border-t"
                style={{ borderColor: colors.border.subtle }}
              />
            </div>
            <div className="relative flex justify-center text-xs">
              <span 
                className="px-4"
                style={{ 
                  backgroundColor: colors.bg.secondary,
                  color: colors.text.muted,
                }}
              >
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full py-3 px-4 rounded-xl font-medium text-sm text-center"
            style={{
              color: colors.text.primary,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            Sign In
          </Link>
        </div>

        <p 
          className="text-center text-xs"
          style={{ color: colors.text.muted }}
        >
          By creating an account, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
