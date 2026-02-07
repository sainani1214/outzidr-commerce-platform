'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/app/_actions/cart';
import type { Product } from '@/lib/server-api';
import { colors } from '@/styles/colors';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault(); 
    
    if (product.inventory === 0) return;

    setLoading(true);
    setMessage(null);

    const response = await addToCart(product.id, 1);

    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(null), 2000);
    }

    setLoading(false);
  }

  return (
    <div 
      className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] flex flex-col"
      style={{
        backgroundColor: colors.bg.secondary,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div 
          className="aspect-square flex items-center justify-center overflow-hidden bg-white/5"
          style={{ backgroundColor: colors.bg.surface }}
        >
          {product.imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ) : (
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: colors.text.muted }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 
            className="font-medium text-base sm:text-lg mb-1 line-clamp-1 hover:text-cyan-400 transition-colors"
            style={{ color: colors.text.primary }}
          >
            {product.name}
          </h3>
          <p 
            className="text-xs sm:text-sm line-clamp-2 mb-3"
            style={{ color: colors.text.secondary }}
          >
            {product.description}
          </p>
        </Link>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span 
              className="text-xl sm:text-2xl font-semibold"
              style={{ color: colors.accent.primary }}
            >
              ${product.price.toFixed(2)}
            </span>
            <span
              className="text-xs sm:text-sm"
              style={{
                color: product.inventory > 0 ? '#10b981' : '#ef4444',
              }}
            >
              {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
            </span>
          </div>

          {message && (
            <div className={`text-xs mb-2 text-center py-1 px-2 rounded ${
              message.includes('Error') ? 'text-red-400' : 'text-green-400'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleQuickAdd}
            disabled={loading || product.inventory === 0}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white text-sm font-semibold transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
