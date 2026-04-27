import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <div className="container py-12">
        <CheckoutForm />
      </div>
      <Footer />
    </>
  );
}
