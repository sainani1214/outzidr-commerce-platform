'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, updateCartQuantity, removeCartItem } from '../_actions/cart';
import type { Cart } from '@/lib/server-api';

interface CartContentProps {
  initialCart?: Cart | null;
  initialError?: string;
}

export default function CartContent({ initialCart = null, initialError }: CartContentProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(initialCart || null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; productId: string; productName: string }>({
    show: false,
    productId: '',
    productName: ''
  });

  // Only refresh cart when user performs an action, not on mount
  async function refreshCart() {
    const response = await getCart();
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setCart(response.data);
      setError(null);
    }
  }

  async function handleUpdateQuantity(productId: string, newQuantity: number) {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    const response = await updateCartQuantity(productId, newQuantity);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setCart(response.data);
    }
    
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }

  async function handleRemove(productId: string) {
    setDeleteConfirm({ show: false, productId: '', productName: '' });
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    const response = await removeCartItem(productId);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setCart(response.data);
    }
    
    setUpdatingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }

  function showDeleteConfirmation(productId: string, productName: string) {
    setDeleteConfirm({ show: true, productId, productName });
  }

  function calculateTotal() {
    if (!cart) return 0;
    return cart.total;
  }

  // No loading state needed - data comes from server!
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 backdrop-blur-sm max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Cart</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={refreshCart}
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/products')}
            className="mb-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Shopping Cart
          </h1>
        </div>

        {isEmpty ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6">Add some products to get started</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const isUpdating = updatingItems.has(item.productId);
                
                return (
                  <div
                    key={item.productId}
                    className={`bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 sm:p-6 transition-all ${
                      isUpdating ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg className="w-12 h-12 sm:w-10 sm:h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>

                      {/* Product Details & Controls */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        {/* Product Info */}
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 truncate">
                              {item.name}
                            </h3>
                            <p className="text-gray-400 text-xs sm:text-sm mb-2">SKU: {item.sku}</p>
                            <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                              ${item.finalPrice.toFixed(2)}
                            </p>
                          </div>

                          {/* Delete Button - Desktop */}
                          <button
                            onClick={() => showDeleteConfirmation(item.productId, item.name)}
                            disabled={isUpdating}
                            className="hidden sm:block text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 p-2"
                            title="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Quantity Controls & Subtotal */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 sm:gap-3 bg-white/5 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="w-10 sm:w-12 text-center text-white font-semibold text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-base sm:text-lg font-semibold text-white">
                              ${item.subtotal.toFixed(2)}
                            </p>

                            {/* Delete Button - Mobile */}
                            <button
                              onClick={() => showDeleteConfirmation(item.productId, item.name)}
                              disabled={isUpdating}
                              className="sm:hidden text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 p-2"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 sm:p-6 lg:sticky lg:top-24">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Order Summary</h2>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base text-gray-400">
                    <span>Shipping</span>
                    <span className="text-xs sm:text-sm">Calculated at checkout</span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-white">
                    <span>Total</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/50"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => router.push('/products')}
                  className="w-full mt-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white/5 hover:bg-white/10 rounded-lg text-white font-semibold transition-all border border-white/10"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in duration-200">
              {/* Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-2 sm:mb-3">
                Remove Item?
              </h3>
              <p className="text-sm sm:text-base text-gray-300 text-center mb-4">
                Are you sure you want to remove
              </p>
              <p className="text-base sm:text-lg font-semibold text-cyan-400 text-center mb-6 sm:mb-8 px-2">
                {deleteConfirm.productName}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, productId: '', productName: '' })}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(deleteConfirm.productId)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg text-white font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-500/50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
