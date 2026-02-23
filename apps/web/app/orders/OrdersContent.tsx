'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrders } from '../_actions/orders';
import type { Order } from '@/lib/server-api';

interface OrdersContentProps {
  initialOrders?: Order[] | null;
  initialError?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  currentPage: number;
}

export default function OrdersContent({
  initialOrders,
  initialError,
  pagination,
  currentPage,
}: OrdersContentProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(
    Array.isArray(initialOrders) ? initialOrders : []
  );
  const [error, setError] = useState<string | null>(initialError || null);

  async function loadOrders() {
    setError(null);
    const response = await getOrders();
    if (response.error) setError(response.error);
    else if (response.data) setOrders(response.data);
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      PLACED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/30',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return map[status] || 'bg-white/10 text-white border-white/20';
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="border border-red-500/40 rounded-xl p-8 text-center max-w-md">
          <h2 className="text-lg font-medium text-red-400 mb-2">
            Failed to load orders
          </h2>
          <p className="text-sm text-[#9A9AA1] mb-6">{error}</p>
          <button
            onClick={loadOrders}
            className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push('/products')}
            className="text-sm text-[#9A9AA1] hover:text-white transition mb-4"
          >
            ← Products
          </button>
          <h1 className="text-3xl font-semibold tracking-tight">
            Orders
          </h1>
          <p className="text-sm text-[#9A9AA1] mt-2">
            View your order history and details
          </p>
        </div>

        {/* Empty */}
        {orders.length === 0 ? (
          <div className="border border-[#1F1F23] rounded-xl p-12 text-center">
            <p className="text-[#9A9AA1] text-sm mb-6">
              You haven’t placed any orders yet.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="border border-[#1F1F23] rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 text-xs text-[#9A9AA1] uppercase tracking-wide border-b border-[#2A2A30]">
              <span>Order</span>
              <span>Date</span>
              <span>Status</span>
              <span className="text-right">Total</span>
              <span></span>
            </div>

            {/* Rows */}
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="
                  grid grid-cols-5 gap-4
                  px-6 py-5
                  border-b border-[#2A2A30]
                  hover:bg-[#0B0B0D]
                  cursor-pointer
                  transition
                "
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-[#9A9AA1]">
                    {order.totalItems} items
                  </p>
                </div>

                <p className="text-sm text-[#E5E5EA]">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>

                <span
                  className={`inline-flex items-center justify-center px-3 py-1.5 text-xs rounded-full border ${statusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

                <p className="text-right font-medium">
                  ${order.total.toFixed(2)}
                </p>

                <div className="text-right text-sm text-[#9A9AA1]">
                  →
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/orders?page=${currentPage - 1}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-[#1F1F23] text-white border border-[#2A2A30] hover:bg-[#2A2A30]"
              >
                Previous
              </Link>
            )}
            
            <span className="px-4 py-2 text-sm text-[#9A9AA1]">
              Page {currentPage} of {pagination.totalPages}
            </span>

            {currentPage < pagination.totalPages && (
              <Link
                href={`/orders?page=${currentPage + 1}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-[#1F1F23] text-white border border-[#2A2A30] hover:bg-[#2A2A30]"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}