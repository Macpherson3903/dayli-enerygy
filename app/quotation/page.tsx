import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuotationCalculator } from "@/components/quotation/QuotationCalculator";
import { quotationHeader, quotationSeo } from "@/lib/content/quotation";

export const metadata: Metadata = {
  title: quotationSeo.title,
  description: quotationSeo.description,
  keywords: quotationSeo.keywords,
  openGraph: {
    title: "Quotation | Dayli Energy Solutions",
    description: quotationSeo.description,
    type: "website",
    url: "/quotation",
  },
};

export default function QuotationPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <PageHeader
            title={quotationHeader.title}
            description={quotationHeader.description}
          />
          <QuotationCalculator />
        </div>
      </main>
      <Footer />
    </>
  );
}
