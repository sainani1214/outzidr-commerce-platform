export default function Hero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center px-6 bg-[#0B0B0F] text-white">
      <div className="max-w-4xl text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Enterprise Commerce Platform
        </p>

        <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
          Commerce infrastructure
          <br /> designed for scale
        </h1>

        <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
          A modern, multi-tenant commerce platform built for reliability,
          performance, and flexibility — powering real-world products,
          pricing, and orders at scale.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <button className="px-8 py-3 rounded-full bg-[#0A84FF] hover:bg-[#409CFF] transition">
            Browse Products
          </button>
          <button className="px-8 py-3 rounded-full border border-zinc-700 hover:border-zinc-500 transition">
            Platform Overview
          </button>
        </div>
      </div>
    </section>
  );
}
