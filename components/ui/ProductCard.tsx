import Button from "./Button";

export default function ProductCard({ product }: any) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-soft">
            <img
                src={product.image}
                className="w-full h-48 object-cover rounded-xl"
            />

            <h3 className="mt-4 font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.specs}</p>

            <p className="mt-2 font-bold">{product.price}</p>

            <Button className="mt-4 w-full">
                Request Order
            </Button>
        </div>
    );
}