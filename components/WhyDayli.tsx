"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Wallet, LifeBuoy } from "lucide-react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhyDayli() {
    return (
        <section className="px-6 py-16">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mb-10"
                >
                    <h2 className="text-3xl font-bold text-gray-900">
                        Why Choose Dayli Energy
                    </h2>
                    <p className="mt-2 text-gray-600 max-w-2xl">
                        We deliver dependable, cost-effective solar energy solutions designed to power homes and businesses with confidence and long-term efficiency.
                    </p>
                </motion.div>

                {/* Content Blocks */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    <motion.div
                        variants={item}
                        className="p-6 border border-green-200 bg-green-50 rounded-xl shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="text-green-600" size={20} />
                            <h3 className="font-semibold text-lg text-gray-900">
                                Reliable Energy Systems
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            High-performance solar solutions built for consistency, durability, and uninterrupted power supply in all conditions.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={item}
                        className="p-6 border border-green-200 bg-green-50 rounded-xl shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Wallet className="text-green-600" size={20} />
                            <h3 className="font-semibold text-lg text-gray-900">
                                Cost-Effective Solutions
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Affordable pricing without compromising quality, helping you reduce energy costs and maximize long-term savings.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={item}
                        className="p-6 border border-green-200 bg-green-50 rounded-xl shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <LifeBuoy className="text-green-600" size={20} />
                            <h3 className="font-semibold text-lg text-gray-900">
                                Expert Support & Guidance
                            </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Dedicated professionals available to guide you from selection to installation and ongoing system support.
                        </p>
                    </motion.div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="mt-10 text-center"
                >
                    <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                        Whether you're powering a home, business, or large facility, our solar solutions are designed to scale with your energy needs while maintaining efficiency and reliability over time.
                    </p>

                    <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Browse Products
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}