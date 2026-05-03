import Link from "next/link";

export default function FinalCTA() {
    return (
        <section
            className="relative overflow-hidden px-6 py-20 text-center text-white bg-gradient-to-b from-[#0B5D3B] to-[#06442B]"
            aria-labelledby="final-cta-title"
        >
            {/* subtle overlay pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />

            <div className="relative max-w-2xl mx-auto">
                <h2
                    id="final-cta-title"
                    className="text-3xl md:text-4xl font-bold tracking-tight"
                >
                    Ready to switch to solar?
                </h2>

                <p className="mt-4 text-white/80 text-base md:text-lg">
                    Take control of your energy costs with reliable solar, inverter, and battery solutions tailored for your home or business.
                </p>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/order"
                        className="w-full sm:w-auto bg-[#38C172] hover:bg-[#2faa63] transition-colors px-6 py-3 rounded-md font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-white/60"
                    >
                        Browse Products
                    </Link>
                </div>

                <p className="mt-6 text-xs text-white/60">
                    No online payments required — order confirmation is handled directly.
                </p>
            </div>
        </section>
    );
}