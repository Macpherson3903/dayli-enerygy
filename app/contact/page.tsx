import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  contactHeader,
  contactSeo,
} from "@/lib/content/contact";

export const metadata: Metadata = {
  title: contactSeo.title,
  description: contactSeo.description,
  keywords: contactSeo.keywords,
  openGraph: {
    title: "Contact | Dayli Energy Solutions",
    description: contactSeo.openGraphDescription,
    type: "website",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <PageHeader
            title={contactHeader.title}
            description={contactHeader.description}
          />
          <div className="mt-8 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ContactChannels />
            </div>
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
