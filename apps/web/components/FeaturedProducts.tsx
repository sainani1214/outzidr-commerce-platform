const products = [
  { name: "Pro Controller", price: "$199" },
  { name: "Studio Headphones", price: "$349" },
  { name: "Precision Keyboard", price: "$249" },
];

export default function FeaturedProducts() {
  return (
    <section className="px-8 py-24 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold mb-12">
        Featured Products
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p) => (
          <div
            key={p.name}
            className="group rounded-2xl border border-zinc-800 bg-[#111114] p-6 hover:border-zinc-600 transition"
          >
            <div className="h-48 rounded-xl bg-zinc-900 mb-6" />

            <h3 className="text-lg font-medium">{p.name}</h3>
            <p className="text-zinc-400 mt-2">{p.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
