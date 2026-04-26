export default function Hero() {
    return (
        <section className="relative bg-[#0B5D3B] text-white">
            <div className="absolute inset-0 opacity-30 bg-[url('/solar.jpg')] bg-cover bg-center" />

            <div className="relative px-6 py-24 max-w-4xl">
                <h1 className="text-4xl font-bold">
                    Power Your Life with Reliable Solar Energy
                </h1>

                <p className="mt-4 text-gray-100">
                    Affordable Solar Panels, Inverters & Batteries for Homes & Businesses.
                </p>

                <div className="mt-6 flex gap-4">
                    <button className="bg-[#38C172] px-5 py-2 rounded-md">
                        Browse Products
                    </button>
                    <button className="border border-white px-5 py-2 rounded-md">
                        Request a Quote
                    </button>
                </div>
            </div>
        </section>
    );
}