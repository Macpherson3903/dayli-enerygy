import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ContactChannels } from "@/components/contact/ContactChannels";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
import {
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
        <PageHero
          eyebrow="Contact Our Team"
          title="Let's design a solar setup that fits your needs"
          description="Get help with product recommendations, quotes, delivery timelines, and technical guidance from the Dayli Energy team."
          backgroundImageUrl="https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1920&q=80"
          primaryCta={{ label: "Send a Message", href: "#contact-form" }}
          secondaryCta={{ label: "Browse Products", href: "/shop" }}
        />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <h2 className="text-2xl font-bold text-gray-900">Talk to our support specialists</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Share your location, expected power load, and preferred timeline. We will guide you
            to the right setup for your home or business.
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ContactChannels />
            </div>
            <div id="contact-form" className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
