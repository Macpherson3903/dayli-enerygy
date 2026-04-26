import ProductCard from "@/components/ui/ProductCard";

export default function Shop() {
    return (
        <div className="container py-12 grid grid-cols-4 gap-8">
            {/* Sidebar */}
            <div>
                <h3 className="font-semibold mb-4">Filters</h3>
                <p className="text-sm text-gray-600">Category</p>
            </div>

            {/* Products */}
            <div className="col-span-3 grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, i) => (
                    <ProductCard key={i} product={{}} />
                ))}
            </div>
        </div>
    );
}