import { redirect } from 'next/navigation';
import { fetchOrder } from '@/lib/server-api';
import { isAuthenticated } from '@/app/_actions/auth';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect('/login');
  }

  const { id } = await params;
  const response = await fetchOrder(id);

  if (response.error || !response.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/50 rounded-2xl p-8 backdrop-blur-lg text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-red-400 mb-3">Order Not Found</h2>
          <p className="text-red-300 mb-6">{response.error || 'Unable to load order details'}</p>
          <Link
            href="/orders"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white font-semibold transition-all transform hover:scale-105"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = response.data;

  const getStatusColor = (status: string) => {
    const colors = {
      PLACED: 'from-yellow-400 to-orange-500',
      CONFIRMED: 'from-blue-400 to-cyan-500',
      PROCESSING: 'from-blue-400 to-cyan-500',
      SHIPPED: 'from-purple-400 to-pink-500',
      DELIVERED: 'from-green-400 to-emerald-500',
      CANCELLED: 'from-red-400 to-rose-500',
    };
    return colors[status as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        {/* Back Button */}
        <Link
          href="/orders"
          className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Orders
        </Link>

        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                  Order Details
                </h1>
                <p className="text-sm sm:text-base text-gray-400">Order {order.orderNumber}</p>
              </div>
              <div className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg text-white font-semibold bg-gradient-to-r ${getStatusColor(order.status)} text-center`}>
                {order.status}
              </div>
            </div>
          </div>

          {/* Order Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/10">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Placed On</p>
              <p className="text-white text-sm sm:text-base font-medium">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Items</p>
              <p className="text-white text-sm sm:text-base font-medium">{order.totalItems} item(s)</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Subtotal</p>
              <p className="text-white text-sm sm:text-base font-medium">${order.subtotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Discount</p>
              <p className="text-white text-sm sm:text-base font-medium">${order.totalDiscount.toFixed(2)}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Items</h2>
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                        <span className="text-gray-400">
                          Quantity: <span className="text-white font-medium">{item.quantity}</span>
                        </span>
                        <span className="text-gray-400">
                          Price: <span className="text-white font-medium">${item.finalPrice.toFixed(2)}</span>
                        </span>
                        {item.discountAmount > 0 && (
                          <span className="text-green-400">
                            Discount: ${item.discountAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">Subtotal</p>
                      <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 sm:p-6 border border-cyan-500/20 mb-6 sm:mb-8">
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <div className="flex justify-between text-sm sm:text-base text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base text-gray-400">
                <span>Discount</span>
                <span className="text-white font-medium">-${order.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base text-gray-400">
                <span>Shipping</span>
                <span className="text-white font-medium">Free</span>
              </div>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-lg sm:text-xl font-semibold text-white">Total</span>
              <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Shipping Address</h3>
            <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
