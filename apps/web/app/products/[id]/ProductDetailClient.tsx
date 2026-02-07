'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { addToCart } from '@/app/_actions/cart';
import type { Product } from '@/lib/server-api';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAddToCart() {
    if (quantity < 1 || quantity > product.inventory) return;

    setLoading(true);
    setMessage(null);

    const response = await addToCart(product.id, quantity);

    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage('Added to cart');
      setTimeout(() => router.push('/cart'), 800);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Back */}
        <button
          onClick={() => router.push('/products')}
          className="mb-12 flex items-center gap-2 text-sm text-[#9A9AA1] hover:text-white transition"
        >
          ← Back to products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* IMAGE */}
          <div className="bg-[#0F0F12] rounded-2xl p-10 flex items-center justify-center">
            {product.imageUrl ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-[#6E6E73]">
                No image available
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-center">
            {/* Category */}
            {product.category && (
              <span className="text-sm text-[#9A9AA1] mb-3">
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-5xl font-semibold tracking-tight mb-6">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-4xl font-semibold mb-8">
              ${product.price.toFixed(2)}
            </p>

            {/* Description */}
            <p className="text-[15px] leading-relaxed text-[#9A9AA1] max-w-xl mb-10">
              {product.description}
            </p>

            {/* Availability */}
            <div className="flex items-center gap-2 text-sm mb-10">
              <span className="text-[#9A9AA1]">Availability:</span>
              <span
                className={
                  product.inventory > 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }
              >
                {product.inventory > 0
                  ? `${product.inventory} in stock`
                  : 'Out of stock'}
              </span>
            </div>

            {/* Quantity */}
            <div className="mb-12">
              <label className="block text-sm text-[#9A9AA1] mb-2">
                Quantity
              </label>

              <div className="inline-flex items-center rounded-lg border border-[#2A2A30] overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 text-white hover:bg-[#1A1A1F] disabled:opacity-40"
                >
                  −
                </button>

                <div className="w-14 text-center text-sm font-medium">
                  {quantity}
                </div>

                <button
                  onClick={() =>
                    setQuantity(Math.min(product.inventory, quantity + 1))
                  }
                  disabled={quantity >= product.inventory}
                  className="w-12 h-12 text-white hover:bg-[#1A1A1F] disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-4 text-sm text-emerald-400">
                {message}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={loading || product.inventory === 0}
              className="
                w-full
                h-12
                rounded-lg
                bg-white
                text-black
                text-sm
                font-medium
                hover:bg-[#E5E5EA]
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {loading ? 'Adding…' : 'Add to cart'}
            </button>

            <button
              onClick={() => router.push('/cart')}
              className="
                mt-3
                w-full
                h-12
                rounded-lg
                border
                border-[#2A2A30]
                text-white
                text-sm
                hover:bg-[#1A1A1F]
                transition
              "
            >
              View cart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}