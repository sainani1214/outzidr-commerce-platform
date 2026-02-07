'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrders } from '../_actions/orders';
import type { Order } from '@/lib/server-api';

export default function OrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    const response = await getOrders();
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setOrders(Array.isArray(response.data) ? response.data : []);
    }
    
    setLoading(false);
  }

  function getStatusColor(status: string) {
    const colors = {
      pending: 'from-yellow-400 to-orange-500',
      processing: 'from-blue-400 to-cyan-500',
      shipped: 'from-purple-400 to-pink-500',
      delivered: 'from-green-400 to-emerald-500',
      cancelled: 'from-red-400 to-rose-500',
    };
    return colors[status as keyof typeof colors] || 'from-gray-400 to-gray-500';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <div className="h-8 w-32 bg-white/10 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-10 w-64 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <div className="h-6 w-48 bg-white/10 rounded mb-4 animate-pulse"></div>
                <div className="h-4 w-32 bg-white/10 rounded mb-4 animate-pulse"></div>
                <div className="h-24 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 backdrop-blur-sm max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Orders</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-4 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/products')}
            className="mb-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            My Orders
          </h1>
          <p className="text-gray-400 mt-2">View and track your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">Start shopping to place your first order</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      Order {order.orderNumber}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r ${getStatusColor(order.status)} capitalize`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">
                      <span className="text-sm">Total Amount</span>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">{order.totalItems} item(s)</p>
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-1 mt-1">
                        View Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
