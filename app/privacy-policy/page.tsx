import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Dayli Energy Solutions",
    description:
        "Learn how Dayli Energy Solutions collects, uses, and protects your personal data when you use our solar and energy services.",
    keywords: [
        "Dayli Energy privacy policy",
        "solar company Nigeria privacy",
        "data protection energy company",
        "Dayli Energy Solutions policy",
    ],
    openGraph: {
        title: "Privacy Policy | Dayli Energy Solutions",
        description:
            "Understand how we handle your data at Dayli Energy Solutions.",
        type: "website",
        url: "/privacy-policy",
    },
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <Navbar />

            <main className="bg-white text-gray-800 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#0B5D3B]">
                        Privacy Policy
                    </h1>

                    <p className="mt-4 text-sm text-gray-600">
                        Last updated: {new Date().getFullYear()}
                    </p>

                    <section className="mt-10 space-y-6 text-sm leading-relaxed">
                        <p>
                            At Dayli Energy Solutions, we are committed to protecting your privacy
                            and ensuring the security of your personal information when you use our website and services.
                        </p>

                        <div>
                            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
                            <p className="mt-2 text-gray-600">
                                We collect basic information such as your name, phone number, email address,
                                and delivery details when you interact with our platform.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">2. How We Use Your Data</h2>
                            <p className="mt-2 text-gray-600">
                                Your data is used for order processing, communication, delivery coordination,
                                and customer support.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">3. Data Security</h2>
                            <p className="mt-2 text-gray-600">
                                We implement appropriate security measures to protect your personal information
                                from unauthorized access or misuse.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">4. Third-Party Sharing</h2>
                            <p className="mt-2 text-gray-600">
                                We do not sell your data. Information may only be shared with logistics partners
                                for delivery purposes.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold">5. Contact</h2>
                            <p className="mt-2 text-gray-600">
                                Contact us at support@daylienergy.com for any privacy concerns.
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}