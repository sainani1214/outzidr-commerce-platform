'use client';

import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 280);
    }, toast.duration ?? 5000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const tone = (() => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'from-emerald-500/15 to-green-500/10',
          border: 'border-emerald-500/40',
          icon: (
            <svg
              className="w-6 h-6 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.8}
                d="M6 12.5l4 4 8-8"
              />
            </svg>
          ),
        };

      case 'error':
        return {
          bg: 'from-red-500/15 to-rose-500/10',
          border: 'border-red-500/40',
          icon: (
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };

      case 'warning':
        return {
          bg: 'from-yellow-500/15 to-orange-500/10',
          border: 'border-yellow-500/40',
          icon: (
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 9v3m0 4h.01" />
            </svg>
          ),
        };

      case 'info':
      default:
        return {
          bg: 'from-cyan-500/15 to-blue-500/10',
          border: 'border-cyan-500/40',
          icon: (
            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M13 16h-1v-4h-1m1-4h.01" />
            </svg>
          ),
        };
    }
  })();

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-xl
        bg-linear-to-r ${tone.bg} ${tone.border}
        shadow-[0_20px_40px_rgba(0,0,0,0.55)]
        transition-all duration-300
        ${isExiting ? 'opacity-0 -translate-y-3 scale-95' : 'opacity-100 translate-y-0 scale-100'}
      `}
      style={{ minWidth: 340, maxWidth: 440 }}
    >
      {/* Icon */}
      <div className="mt-0.5 w-10 h-10 rounded-full bg-white/8 flex items-center justify-center shrink-0">
        {tone.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white leading-snug">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-0.5 text-sm text-gray-300 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(toast.id), 280);
        }}
        className="mt-0.5 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Toast Hook ---------------- */

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    removeToast,
    showSuccess: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    showError: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    showInfo: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    showWarning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
  };
}