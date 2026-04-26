const products = ["Solar Panel", "Inverter", "Battery"];

export default function FeaturedProducts() {
    return (
        <section className="px-6 py-16">
            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>

            <div className="grid md:grid-cols-3 gap-6">
                {products.map((p) => (
                    <div key={p} className="border rounded-lg p-4">
                        <div className="h-40 bg-gray-100 mb-4" />
                        <h3 className="font-semibold">{p}</h3>
                        <p className="text-sm text-gray-500">Short spec here</p>

                        <button className="mt-4 bg-[#38C172] text-white px-4 py-2 w-full rounded-md">
                            Request Order
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}