import FeaturedProducts from "@/components/FeaturedProducts";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <main className="bg-[#0B0B0F] text-white">
      <Hero />
      <FeaturedProducts />
    </main>
  );
}
