import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { InstallationQuoteBookingFlow } from "@/components/installation/InstallationQuoteBookingFlow";
import {
  installationBookingHeader,
  installationBookingSeo,
} from "@/lib/content/installation-booking";
import { getQuotationAppliancesPublic } from "@/lib/db/quotation-appliances";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: installationBookingSeo.title,
  description: installationBookingSeo.description,
  keywords: installationBookingSeo.keywords,
  openGraph: {
    title: "Quotation & installation | Dayli Energy Solutions",
    description: installationBookingSeo.description,
    type: "website",
    url: "/installation-booking",
  },
};

export default async function InstallationBookingPage() {
  const appliances = await getQuotationAppliancesPublic();
  return (
    <>
      <Navbar />
      <main className="bg-white text-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <PageHeader
            title={installationBookingHeader.title}
            description={installationBookingHeader.description}
          />
          <div className="mt-8">
            <InstallationQuoteBookingFlow appliances={appliances} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
