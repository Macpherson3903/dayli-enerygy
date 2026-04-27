const products = [
    {
        id: 1,
        name: "Solar Panel",
        description:
            "High-efficiency monocrystalline solar panels designed for residential and commercial installations.",
        image: "/solarRoof.png",
    },
    {
        id: 2,
        name: "Inverter",
        description:
            "Reliable pure sine wave inverter for stable and efficient energy conversion.",
        image: "/inverter.png",
    },
    {
        id: 3,
        name: "Battery",
        description:
            "Durable deep-cycle lithium battery for long-lasting energy storage solutions.",
        image: "/battery.png",
    },
];

export default function FeaturedProducts() {
    return (
        <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Featured Products
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Premium solar energy solutions built for performance and reliability
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="group border border-gray-200 rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="h-52 w-full bg-gray-100 overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#38C172] transition-colors">
                                    {product.name}
                                </h3>

                                <p className="text-sm text-gray-500 mt-2">
                                    {product.description}
                                </p>

                                <button
                                    type="button"
                                    className="mt-6 w-full bg-[#38C172] hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
                                >
                                    Request Order
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}