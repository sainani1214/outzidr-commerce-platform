import ProductActions from "@/components/products/product-actions";
import ProductHero from "@/components/products/product-hero";
import ProductSpecs from "@/components/products/product-specs";
import ProductSummary from "@/components/products/product-summary";


export default function ProductDetailsPage() {
  return (
    <main className="bg-[#0B0B0F] text-white min-h-screen">
      
      <section className="max-w-7xl mx-auto px-8 pt-28 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <ProductHero />
        <div>
          <ProductSummary />
          <ProductActions />
        </div>
      </section>

      
      <div className="mt-32 border-t border-zinc-800" />

      
      <section className="max-w-5xl mx-auto px-8 py-24">
        <ProductSpecs />
      </section>
    </main>
  );
}
