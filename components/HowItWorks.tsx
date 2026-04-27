"use client";

import {
    ShoppingCart,
    ClipboardList,
    Mail,
    Truck,
} from "lucide-react";

const steps = [
    {
        title: "Browse Products",
        desc: "Explore our solar panels, inverters, and batteries.",
        icon: ShoppingCart,
    },
    {
        title: "Place Order Request",
        desc: "Submit your order request through the website.",
        icon: ClipboardList,
    },
    {
        title: "Confirm via Email",
        desc: "We confirm details and pricing with you via email.",
        icon: Mail,
    },
    {
        title: "Delivery & Installation",
        desc: "We deliver and install your system professionally.",
        icon: Truck,
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-green-100 py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-green-900">
                        How It Works
                    </h2>
                    <p className="text-green-800 mt-2">
                        Simple steps to get your solar solution up and running
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => {
                        const Icon = step.icon;

                        return (
                            <div
                                key={i}
                                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-200 text-green-800 mb-4">
                                    <Icon size={22} />
                                </div>

                                <div className="text-sm font-semibold text-green-800 mb-1">
                                    Step {i + 1}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {step.title}
                                </h3>

                                <p className="text-sm text-gray-600">
                                    {step.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}