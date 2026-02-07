export default function OrderReview() {
  return (
    <div className="border border-[#E5E5EA] rounded-2xl p-8">
      <h2 className="text-xl font-medium mb-6">
        Order summary
      </h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-[#6E6E73]">Subtotal</span>
          <span>$349</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#6E6E73]">Discount</span>
          <span className="text-[#2ECC71]">−$20</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#6E6E73]">Shipping</span>
          <span>Free</span>
        </div>

        <div className="border-t border-[#E5E5EA] pt-4 flex justify-between text-lg font-medium">
          <span>Total</span>
          <span>$329</span>
        </div>
      </div>
    </div>
  );
}