import { redirect } from 'next/navigation';
import { fetchOrder } from '@/lib/server-api';
import { isAuthenticated } from '@/app/_actions/auth';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const authenticated = await isAuthenticated();
  if (!authenticated) redirect('/login');

  const { id } = await params;
  const response = await fetchOrder(id);

  if (response.error || !response.data) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="border border-red-500/40 rounded-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-medium text-red-400 mb-2">
            Order not found
          </h2>
          <p className="text-sm text-[#9A9AA1] mb-6">
            {response.error || 'Unable to load order details'}
          </p>
          <Link
            href="/orders"
            className="inline-block px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium"
          >
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const order = response.data;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          href="/orders"
          className="text-sm text-[#9A9AA1] hover:text-white transition mb-6 inline-block"
        >
          ← Orders
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-[#9A9AA1] mt-2">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Status */}
        <div className="mb-10">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm border border-[#2A2A30] bg-[#0B0B0D]">
            {order.status}
          </span>
        </div>

        {/* Items */}
        <section className="mb-12">
          <h2 className="text-xl font-medium mb-6">Items</h2>

          <div className="divide-y divide-[#2A2A30] border border-[#1F1F23] rounded-xl">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between px-6 py-5">
                <div className="max-w-[70%]">
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-[#9A9AA1] mt-1">
                      {item.description}
                    </p>
                  )}
                  <p className="text-sm text-[#9A9AA1] mt-2">
                    Qty {item.quantity} × ${item.finalPrice.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    ${item.subtotal.toFixed(2)}
                  </p>
                  {item.discountAmount > 0 && (
                    <p className="text-xs text-[#9A9AA1]">
                      −${item.discountAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="mb-12 max-w-md">
          <h2 className="text-xl font-medium mb-6">Order summary</h2>

          <div className="space-y-4 text-sm">
            <Row label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
            <Row label="Discount" value={`−$${order.totalDiscount.toFixed(2)}`} />
            <Row label="Shipping" value="Free" />
            <div className="border-t border-[#2A2A30] pt-4 flex justify-between font-medium text-base">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className="max-w-md">
          <h2 className="text-xl font-medium mb-4">Shipping address</h2>

          <div className="border border-[#1F1F23] rounded-xl p-5 text-sm text-[#E5E5EA] leading-relaxed">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="mt-2 text-[#9A9AA1]">
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}



function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[#9A9AA1]">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}