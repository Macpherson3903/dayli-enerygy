import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";

const products = [
  {
    name: "5kVA Inverter",
    specs: "High efficiency hybrid inverter",
    price: "₦450,000",
    image: "/p1.jpg",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="bg-brand-900 text-white py-20">
        <div className="container text-center">
          <h1 className="text-4xl font-bold">
            Power Your Life with Reliable Solar Energy
          </h1>
          <p className="mt-4 text-gray-200">
            Affordable solar panels, batteries & inverters
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <Button>Browse Products</Button>
            <Button variant="secondary">Request Quote</Button>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container py-16 grid md:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </section>
    </>
  );
}