import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeaturedProducts from "@/components/FeaturedProducts";
import HowItWorks from "@/components/HowItWorks";
import WhyDayli from "@/components/WhyDayli";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-white text-gray-800">
      <Navbar />
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      <HowItWorks />
      <WhyDayli />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}