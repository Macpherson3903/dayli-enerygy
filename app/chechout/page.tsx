import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Checkout() {
    return (
        <div className="container py-12 grid md:grid-cols-2 gap-10">
            {/* FORM */}
            <div>
                <h2 className="text-xl font-semibold">
                    Complete Your Order Request
                </h2>

                <p className="text-sm text-gray-600 mt-2">
                    No online payment required. Our team will contact you.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                    <Input label="Full Name" />
                    <Input label="Phone Number" />
                    <Input label="Email" />
                    <Input label="Address" />
                </div>

                <Button className="mt-6 w-full">
                    Submit Order Request
                </Button>
            </div>

            {/* SUMMARY */}
            <div className="bg-gray-100 p-6 rounded-2xl">
                <h3 className="font-semibold">Order Summary</h3>
                <p className="text-sm text-gray-600 mt-2">
                    5kVA Inverter
                </p>
            </div>
        </div>
    );
}