import OrdersHeader from "@/components/orders/orders-header";
import OrderCard from "@/components/orders/order-card";



export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <OrdersHeader />

        <section className="mt-16 space-y-12">
          <OrderCard />
          <OrderCard />
          <OrderCard />
        </section>
      </div>
    </main>
  );
}