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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('One number');
    }

    return errors;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('Password does not meet requirements');
      setPasswordErrors(errors);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
                onChange={handlePasswordChange}
                onFocus={() => setShowPasswordRequirements(true)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.bg.surface,
                  color: colors.text.primary,
                  border: `1px solid ${password && passwordErrors.length > 0 ? '#ef4444' : colors.border.subtle}`,
                }}
                placeholder="••••••••"
              />
              {showPasswordRequirements && (
                <div 
                  className="mt-2 p-3 rounded-lg text-xs space-y-1"
                  style={{ 
                    backgroundColor: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                  }}
                >
                  <p 
                    className="font-medium mb-1"
                    style={{ color: colors.text.secondary }}
                  >
                    Password must contain:
                  </p>
                  <div className="space-y-0.5">
                    {[
                      { label: 'At least 8 characters', test: password.length >= 8 },
                      { label: 'One uppercase letter (A-Z)', test: /[A-Z]/.test(password) },
                      { label: 'One lowercase letter (a-z)', test: /[a-z]/.test(password) },
                      { label: 'One number (0-9)', test: /[0-9]/.test(password) },
                    ].map((requirement, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {requirement.test ? (
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.muted }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span style={{ color: requirement.test ? '#10b981' : colors.text.muted }}>
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  border: `1px solid ${confirmPassword && password !== confirmPassword ? '#ef4444' : colors.border.subtle}`,
                }}
                placeholder="••••••••"
              />
              {confirmPassword && password !== confirmPassword && (
                <p 
                  className="mt-1 text-xs flex items-center gap-1"
                  style={{ color: '#ef4444' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p 
                  className="mt-1 text-xs flex items-center gap-1"
                  style={{ color: '#10b981' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Passwords match
                </p>
              )}
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
