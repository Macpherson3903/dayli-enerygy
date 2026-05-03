import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedPackages from "@/components/FeaturedPackages";
import HowItWorks from "@/components/HowItWorks";
import WhyDayli from "@/components/WhyDayli";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="bg-white text-gray-800">
      <Navbar />
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      <FeaturedPackages />
      <HowItWorks />
      <WhyDayli />
      <FinalCTA />
      <FAQ />
      <Footer />
    </main>
  );
}