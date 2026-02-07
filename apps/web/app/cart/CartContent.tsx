'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, updateCartQuantity, removeCartItem } from '../_actions/cart';
import type { Cart } from '@/lib/server-api';

interface CartContentProps {
  initialCart?: Cart | null;
  initialError?: string;
}

export default function CartContent({
  initialCart = null,
  initialError,
}: CartContentProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(initialCart || null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    productId: string;
    productName: string;
  }>({ show: false, productId: '', productName: '' });

  async function refreshCart() {
    const response = await getCart();
    if (response.error) setError(response.error);
    else if (response.data) setCart(response.data);
  }

  async function handleUpdateQuantity(productId: string, qty: number) {
    if (qty < 1) return;
    setUpdatingItems((p) => new Set(p).add(productId));
    const res = await updateCartQuantity(productId, qty);
    if (res.data) setCart(res.data);
    if (res.error) setError(res.error);
    setUpdatingItems((p) => {
      const n = new Set(p);
      n.delete(productId);
      return n;
    });
  }

  async function handleRemove(productId: string) {
    setDeleteConfirm({ show: false, productId: '', productName: '' });
    setUpdatingItems((p) => new Set(p).add(productId));
    const res = await removeCartItem(productId);
    if (res.data) setCart(res.data);
    if (res.error) setError(res.error);
    setUpdatingItems((p) => {
      const n = new Set(p);
      n.delete(productId);
      return n;
    });
  }

  function calculateTotal() {
    return cart?.total ?? 0;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="border border-[#2A2A30] rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">
            Unable to load cart
          </h2>
          <p className="text-sm text-[#9A9AA1] mb-6">{error}</p>
          <button
            onClick={refreshCart}
            className="h-10 px-6 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#E5E5EA]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/products')}
            className="text-sm text-[#9A9AA1] hover:text-white transition mb-3"
          >
            ← Continue shopping
          </button>
          <h1 className="text-4xl font-semibold tracking-tight">
            Shopping Cart
          </h1>
        </div>

        {isEmpty ? (
          <div className="border border-[#1F1F23] rounded-2xl p-12 text-center">
            <p className="text-[#9A9AA1] mb-6">Your cart is empty.</p>
            <button
              onClick={() => router.push('/products')}
              className="h-11 px-8 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#E5E5EA]"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => {
                const updating = updatingItems.has(item.productId);
                return (
                  <div
                    key={item.productId}
                    className={`border border-[#1F1F23] rounded-2xl p-6 ${
                      updating ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 bg-[#0F0F12] rounded-xl flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-[#6E6E73]">
                            No image
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h3 className="text-lg font-medium">
                            {item.name}
                          </h3>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                show: true,
                                productId: item.productId,
                                productName: item.name,
                              })
                            }
                            className="text-sm text-[#9A9AA1] hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>

                        <p className="text-sm text-[#9A9AA1] mb-4">
                          ${item.finalPrice.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Qty */}
                          <div className="flex items-center border border-[#2A2A30] rounded-lg">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="w-10 h-10 hover:bg-[#1A1A1F]"
                            >
                              −
                            </button>
                            <div className="w-10 text-center text-sm">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="w-10 h-10 hover:bg-[#1A1A1F]"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-sm font-medium">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="border border-[#1F1F23] rounded-2xl p-6 h-fit sticky top-24">
              <h2 className="text-lg font-medium mb-6">Order Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-[#9A9AA1]">
                  <span>Subtotal</span>
                  <span className="text-white">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[#9A9AA1]">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-[#2A2A30] pt-4 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="mt-8 w-full h-12 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#E5E5EA]"
              >
                Checkout
              </button>

              <button
                onClick={() => router.push('/products')}
                className="mt-3 w-full h-11 rounded-lg border border-[#2A2A30] text-sm hover:bg-[#1A1A1F]"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-[#0B0B0D] border border-[#2A2A30] rounded-2xl p-8 max-w-sm w-full text-center">
              <h3 className="text-lg font-semibold mb-2">
                Remove item?
              </h3>
              <p className="text-sm text-[#9A9AA1] mb-6">
                {deleteConfirm.productName}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      show: false,
                      productId: '',
                      productName: '',
                    })
                  }
                  className="flex-1 h-10 rounded-lg border border-[#2A2A30] text-sm hover:bg-[#1A1A1F]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(deleteConfirm.productId)}
                  className="flex-1 h-10 rounded-lg bg-white text-black text-sm hover:bg-[#E5E5EA]"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}