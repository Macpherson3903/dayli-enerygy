import Navbar from "@/components/Navbar"

export default function Shop() {
    return (
        <>
        <Navbar />
        <div className="container py-12 grid grid-cols-4 gap-8">
            {/* Sidebar */}
            <div>
                <h3 className="font-semibold mb-4">Filters</h3>
                <p className="text-sm text-gray-600">Category</p>
            </div>
        </div>
        </>
    );
}