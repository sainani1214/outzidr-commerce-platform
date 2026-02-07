
function OrderStatus() {
  return (
    <div className="flex items-center gap-3 mb-12">
      <span className="h-3 w-3 rounded-full bg-[#2ECC71]" />
      <span className="text-sm font-medium text-[#2ECC71]">
        Delivered on Feb 4, 2026
      </span>
    </div>
  );
}

function OrderSummary() {
  return (
    <section className="grid grid-cols-2 gap-y-6 text-sm mb-14">
      <Meta label="Order number" value="ORD-2502-000421" />
      <Meta label="Placed on" value="February 2, 2026" />
      <Meta label="Payment method" value="Visa •••• 4242" />
      <Meta label="Billing address" value="Hyderabad, India" />
    </section>
  );

}

function OrderItems() {
  return (
    <section className="mb-16">
      <h2 className="text-lg font-semibold mb-6">
        Items
      </h2>

      <ul className="space-y-6">
        <Item
          name="MacBook Pro 14-inch"
          description="Space Black · 16GB · 512GB"
          price="₹29,999"
        />
        <Item
          name="USB-C Power Adapter"
          description="96W"
          price="₹2,500"
        />
      </ul>
    </section>
  );
}

function Item({ name, description, price }: any) {
  return (
    <li className="flex justify-between items-start">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-[#6E6E73] mt-1">
          {description}
        </p>
      </div>
      <p className="font-medium">{price}</p>
    </li>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[#6E6E73]">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

function OrderTotals() {
  return (
    <section className="border-t border-[#E5E5EA] pt-10 mb-16">
      <div className="space-y-4 text-sm">
        <Row label="Subtotal" value="₹32,499" />
        <Row label="Shipping" value="Free" />
        <Row label="Tax" value="₹0" />
      </div>

      <div className="flex justify-between items-center mt-8">
        <span className="text-lg font-semibold">
          Total
        </span>
        <span className="text-2xl font-semibold">
          ₹32,499
        </span>
      </div>
    </section>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between text-[#6E6E73]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );


}

function ShippingInfo() {
  return (
    <section className="bg-[#F5F5F7] rounded-2xl p-8">
      <h3 className="font-semibold mb-4">
        Shipping Address
      </h3>

      <p className="text-sm leading-relaxed text-[#6E6E73]">
        Sai Krishna<br />
        24, Hi-Tech City<br />
        Hyderabad, Telangana<br />
        India – 500081
      </p>
    </section>
  );
}



export default function OrderDetailsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-14">
        <h1 className="text-3xl font-semibold tracking-tight">
          Order Details
        </h1>
        <p className="mt-2 text-[#6E6E73]">
          Order ORD-2502-000421
        </p>
      </header>

      <OrderStatus />
      <OrderSummary />
      <OrderItems />
      <OrderTotals />
      <ShippingInfo />
    </main>
  );
}