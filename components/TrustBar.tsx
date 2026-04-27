"use client";

import { Zap, Truck, Headphones, ShieldCheck, Wrench, BadgeCheck } from "lucide-react";

export default function TrustBar() {
    const brands = [
        "Huawei Solar",
        "LG Solar",
        "Canadian Solar",
        "JA Solar",
        "Jinko Solar",
        "SMA Solar",
        "Growatt",
        "Victron Energy",
        "Fronius",
        "Solis",
        "Renogy",
        "Trina Solar",
        "Longi Solar",
        "Sungrow",
    ];

    const trustItems = [
        { label: "Nationwide Delivery", icon: Truck },
        { label: "Installation Support", icon: Wrench },
        { label: "24/7 Customer Support", icon: Headphones },
        { label: "Certified Solar Products", icon: BadgeCheck },
        { label: "Energy Efficiency Guarantee", icon: Zap },
        { label: "Warranty Protection", icon: ShieldCheck },
    ];

    return (
        <div className="w-full bg-green-50/70 backdrop-blur-md border-t border-green-300">

            {/* Trust Row */}
            <div className="px-4 py-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm text-green-900">
                    {trustItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="flex items-center gap-2">
                                <Icon size={16} className="text-green-800" />
                                <span>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lower Third Brand Strip (Full Width) */}
            <div className="w-full overflow-hidden border-t border-green-300 bg-green-100/50 py-3">
                <div className="flex items-center gap-10 whitespace-nowrap text-green-800 text-sm animate-scroll">
                    {brands.concat(brands).map((brand, idx) => (
                        <span key={idx} className="opacity-80 hover:opacity-100 transition">
                            {brand}
                        </span>
                    ))}
                </div>
            </div>

            {/* Animation */}
            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
        </div>
    );
}