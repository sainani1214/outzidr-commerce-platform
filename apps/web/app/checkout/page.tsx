import CheckoutHeader from "@/components/checkout/checkout-header";
import CheckoutLayout from "@/components/checkout/checkout-layout";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <CheckoutHeader />
        <CheckoutLayout />
      </div>
    </main>
  );
}