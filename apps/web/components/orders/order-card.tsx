import OrderItems from "./order-items";
import OrderStatus from "./order-status";

export default function OrderCard() {
  return (
    <article
      className="
        bg-[#F5F5F7]
        rounded-2xl
        px-10
        py-8
        transition
        hover:bg-white
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#6E6E73]">
            Order
          </p>
          <p className="text-lg font-semibold">
            ORD-2502-000421
          </p>
        </div>

        <OrderStatus />
      </div>

      {/* Items */}
      <OrderItems />

      {/* Footer */}
      <div className="mt-10 flex items-center justify-between">
        <span className="text-sm text-[#6E6E73]">
          Feb 2, 2026
        </span>

        <span className="text-xl font-semibold">
          ₹32,499
        </span>
      </div>
    </article>
  );
}