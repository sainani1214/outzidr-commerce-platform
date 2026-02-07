import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="bg-[#0B0B0F] text-white min-h-screen flex flex-col">
      <Hero />
      <Footer />
    </div>
  );
}
