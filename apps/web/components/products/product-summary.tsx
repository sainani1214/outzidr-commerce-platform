export default function ProductSummary() {
  return (
    <div>
      <p className="text-sm uppercase tracking-widest text-zinc-400">
        New Release
      </p>

      <h1 className="mt-4 text-4xl font-semibold">
        Precision Wireless Headphones
      </h1>

      <p className="mt-4 text-zinc-400 max-w-xl">
        Designed for clarity, balance, and comfort. Precision-engineered
        components deliver studio-quality sound with everyday reliability.
      </p>

      <div className="mt-8 flex items-center gap-6">
        <span className="text-2xl font-medium">$349</span>
        <span className="text-sm text-green-500">
          In stock
        </span>
      </div>

      <p className="mt-2 text-sm text-zinc-500">
        SKU: PRC-HDP-001
      </p>
    </div>
  );
}
