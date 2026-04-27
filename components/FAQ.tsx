"use client";

import { useState } from "react";

const faqs = [
    {
        question: "What products does Dayli Energy offer?",
        answer:
            "We specialize in solar panels, inverters, batteries, and complete solar energy systems for residential and commercial use.",
    },
    {
        question: "Do you provide installation services?",
        answer:
            "Yes. We offer professional installation services to ensure your solar systems are properly set up and optimized for performance.",
    },
    {
        question: "Can I place an order without paying online?",
        answer:
            "Yes. Dayli Energy does not require online payments. You can place an order request and confirm via WhatsApp, phone call, or email.",
    },
    {
        question: "How long does delivery take?",
        answer:
            "Delivery timelines depend on your location and product availability, but most orders are delivered within 3–7 working days.",
    },
    {
        question: "Do you offer warranty on products?",
        answer:
            "Yes, all our products come with manufacturer-backed warranties ranging from 1 to 10 years depending on the product type.",
    },
    {
        question: "Can I get help choosing the right solar system?",
        answer:
            "Absolutely. Our team provides free consultation to help you choose the right system based on your energy needs and budget.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="px-6 py-16 bg-green-50">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-green-900 mb-8 text-center">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-green-200 rounded-xl bg-white shadow-sm"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex justify-between items-center px-5 py-4 text-left"
                            >
                                <span className="font-medium text-green-900">
                                    {faq.question}
                                </span>
                                <span className="text-green-700 text-xl">
                                    {openIndex === index ? "−" : "+"}
                                </span>
                            </button>

                            {openIndex === index && (
                                <div className="px-5 pb-4 text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}