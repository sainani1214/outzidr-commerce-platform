'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '@/app/_actions/cart';
import type { Product } from '@/lib/server-api';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (product.inventory === 0) return;

    setLoading(true);
    await addToCart(product.id, 1);
    setLoading(false);
  }

  return (
    <div
      className="
        group
        relative
        bg-[#0B0B0D]
        border border-[#1F1F23]
        rounded-xl
        overflow-hidden
        transition-all
        hover:border-[#2A2A30]
        hover:-translate-y-0.5
        hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_40px_rgba(0,0,0,0.6)]
      "
    >
      {/* IMAGE */}
      <Link href={`/products/${product.id}`}>
        <div
          className="
      relative
      aspect-square
      bg-[#0F0F12]
      overflow-hidden
    "
        >
          {product.imageUrl ? (
            <>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="
            object-cover
            transition-transform
            duration-300
            group-hover:scale-[1.03]
          "
              />
              <div
                className="
            pointer-events-none
            absolute
            inset-0
            bg-linear-to-b
            from-transparent
            via-transparent
            to-black/20
          "
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#6E6E73]">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-white leading-tight line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-[#9A9AA1] line-clamp-2">
          {product.description}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">
            ${product.price.toFixed(2)}
          </span>

          <span
            className={`text-[11px] ${product.inventory > 0
                ? 'text-emerald-400'
                : 'text-red-400'
              }`}
          >
            {product.inventory > 0
              ? `${product.inventory} in stock`
              : 'Out'}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={handleQuickAdd}
          disabled={loading || product.inventory === 0}
          className="
            mt-3
            h-9
            w-full
            rounded-md
            text-xs
            font-medium
            border
            border-[#2A2A30]
            text-white
            bg-transparent
            hover:bg-[#1A1A1F]
            transition
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          {loading ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}