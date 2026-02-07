'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCart } from '../_actions/cart';
import { createOrder } from '../_actions/orders';
import type { Cart } from '@/lib/server-api';

export default function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    const res = await getCart();
    if (res.error) setError(res.error);
    else if (res.data) {
      if (!res.data.items.length) {
        router.push('/cart');
        return;
      }
      setCart(res.data);
    }
    setLoading(false);
  }

  function calculateTotal() {
    return cart?.total || 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await createOrder(formData);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      router.push(`/orders/${res.data?.id}`);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#2A2A30] border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/cart')}
            className="text-sm text-[#9A9AA1] hover:text-white transition mb-3"
          >
            ← Back to cart
          </button>
          <h1 className="text-4xl font-semibold tracking-tight">
            Checkout
          </h1>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/40 bg-red-500/10 rounded-lg p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="border border-[#1F1F23] rounded-2xl p-8"
            >
              <h2 className="text-xl font-medium mb-6">
                Shipping information
              </h2>

              <div className="space-y-5">
                <Input
                  label="Full name"
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  placeholder="John Doe"
                />

                <Input
                  label="Address line 1"
                  value={formData.addressLine1}
                  onChange={(v) => setFormData({ ...formData, addressLine1: v })}
                  placeholder="123 Market Street"
                />

                <Input
                  label="Address line 2"
                  value={formData.addressLine2}
                  onChange={(v) => setFormData({ ...formData, addressLine2: v })}
                  placeholder="Apartment, suite, etc. (optional)"
                  optional
                />

                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(v) => setFormData({ ...formData, city: v })}
                    placeholder="San Francisco"
                  />
                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(v) => setFormData({ ...formData, state: v })}
                    placeholder="CA"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Input
                    label="Postal code"
                    value={formData.postalCode}
                    onChange={(v) => setFormData({ ...formData, postalCode: v })}
                    placeholder="94103"
                  />
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(v) => setFormData({ ...formData, country: v })}
                    placeholder="United States"
                  />
                </div>

                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full h-12 rounded-lg bg-white text-black text-sm font-medium hover:bg-[#E5E5EA] transition disabled:opacity-50"
              >
                {submitting ? 'Placing order…' : 'Place order'}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border border-[#1F1F23] rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-medium mb-6">
                Order summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart?.items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-14 h-14 bg-[#0F0F12] rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[#6E6E73]">—</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-[#9A9AA1]">
                        Qty {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-medium">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#2A2A30] pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-[#9A9AA1]">
                  <span>Subtotal</span>
                  <span className="text-white">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-[#9A9AA1]">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between font-medium text-base pt-3">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* -------------------- */
/* Input Component */
/* -------------------- */

function Input({
  label,
  value,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-[#9A9AA1] mb-2">
        {label}
        {optional && <span className="text-xs ml-1">(optional)</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={!optional}
        className="
          w-full h-11 px-4
          bg-[#0B0B0D]
          border border-[#2A2A30]
          rounded-lg
          text-sm
          placeholder-[#6E6E73]
          focus:outline-none
          focus:border-white
          transition
        "
      />
    </div>
  );
}