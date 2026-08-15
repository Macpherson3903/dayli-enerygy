import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckoutForm } from "./CheckoutForm";
import { ensureCurrentUserInDb } from "@/lib/auth/sync-user";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  await ensureCurrentUserInDb();
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
