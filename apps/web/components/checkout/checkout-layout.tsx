import OrderReview from "./checkout-order-review";
import PaymentMethod from "./payment-method";
import PlaceOrderButton from "./place-order-button";


export default function CheckoutLayout() {
  return (
    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
      {/* Left: forms */}
      <div className="lg:col-span-2 space-y-16">
        {/* <ShippingForm /> */}
        <PaymentMethod />
      </div>

      {/* Right: order summary */}
      <div className="space-y-8">
        <OrderReview />
        <PlaceOrderButton />
      </div>
    </div>
  );
}