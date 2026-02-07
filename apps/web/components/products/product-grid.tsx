const products = [
  { name: "Precision Keyboard", price: "$249" },
  { name: "Studio Headphones", price: "$349" },
  { name: "Pro Controller", price: "$199" },
  { name: "Smart Display", price: "$599" },
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div
          key={product.name}
          className="group rounded-2xl border border-zinc-800 bg-[#111114] p-6 hover:border-zinc-600 transition"
        >
          {/* Image placeholder */}
          <div className="h-56 rounded-xl bg-zinc-900 mb-6" />

          <h3 className="text-lg font-medium">{product.name}</h3>
          <p className="text-zinc-400 mt-2">{product.price}</p>

          <button className="mt-6 text-sm text-[#0A84FF] opacity-0 group-hover:opacity-100 transition">
            View details →
          </button>
        </div>
      ))}
    </div>
  );
}
