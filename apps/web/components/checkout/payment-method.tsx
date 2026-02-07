export default function PaymentMethod() {
  return (
    <section>
      <h2 className="text-xl font-medium mb-6">
        Payment method
      </h2>

      <div className="border border-[#E5E5EA] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <input type="radio" checked readOnly />
          <span className="font-medium">Credit or Debit Card</span>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <input placeholder="Card number" className="input" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="MM / YY" className="input" />
            <input placeholder="CVC" className="input" />
          </div>
        </div>

        <p className="text-xs text-[#6E6E73] mt-4">
          Payments are encrypted and securely processed.
        </p>
      </div>
    </section>
  );
}