import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Dayli Energy Solutions",
    description:
        "Read the terms of service for using Dayli Energy Solutions products, services, and website.",
    keywords: [
        "Dayli Energy terms",
        "solar company Nigeria terms",
        "energy services terms and conditions",
        "Dayli Energy Solutions policy",
    ],
    openGraph: {
        title: "Terms of Service | Dayli Energy Solutions",
        description:
            "Understand the rules and conditions for using Dayli Energy services.",
        type: "website",
        url: "/terms",
    },
};

export default function TermsPage() {
    return (
        <>
            <Navbar />

            <main className="bg-white text-gray-800 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#0B5D3B]">
                        Terms of Service
                    </h1>

                    <p className="mt-4 text-sm text-gray-600">
                        Last updated: {new Date().getFullYear()}
                    </p>

                    <section className="mt-10 space-y-6 text-sm leading-relaxed">

                        <div>
                            <h2 className="text-lg font-semibold">1. Overview</h2>
                            <p className="mt-2 text-gray-600">
                                These terms govern your use of the Dayli Energy Solutions website and services.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">2. Orders</h2>
                            <p className="mt-2 text-gray-600">
                                Orders are confirmed via direct communication (email, phone, or WhatsApp).
                                No online payment is processed on this platform.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">3. Pricing</h2>
                            <p className="mt-2 text-gray-600">
                                Prices may change without notice. Final pricing is confirmed before fulfillment.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">4. Delivery</h2>
                            <p className="mt-2 text-gray-600">
                                We provide nationwide and international delivery depending on agreement terms.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">5. Liability</h2>
                            <p className="mt-2 text-gray-600">
                                Dayli Energy is not responsible for damages resulting from improper installation or misuse.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">6. Contact</h2>
                            <p className="mt-2 text-gray-600">
                                For inquiries, contact support@daylienergy.com
                            </p>
                        </div>

                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}