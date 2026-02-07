import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center px-4 sm:px-6 bg-[#0B0B0F] text-white">
      <div className="max-w-4xl text-center">
        <p className="text-sm sm:text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Enterprise Commerce Platform
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-semibold leading-tight px-2">
          Commerce infrastructure
          <br /> designed for scale
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-lg text-zinc-400 max-w-2xl mx-auto px-4">
          Multi-tenant platform powering products, pricing, and orders at scale.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <Link
            href="/products"
            className="px-8 py-3 text-base sm:text-base rounded-full bg-[#0A84FF] hover:bg-[#409CFF] transition text-center"
          >
            Browse Products
          </Link>
          <Link
            href="/products"
            className="px-8 py-3 text-base sm:text-base rounded-full border border-zinc-700 hover:border-zinc-500 transition text-center"
          >
            Platform Overview
          </Link>
        </div>
      </div>
    </section>
  );
}
