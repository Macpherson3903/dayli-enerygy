const steps = [
    "Browse Products",
    "Place Order Request",
    "Confirm via WhatsApp/Call",
    "Delivery & Installation",
];

export default function HowItWorks() {
    return (
        <section className="px-6 py-16 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>

            <ol className="space-y-3">
                {steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                        <span className="font-bold text-[#0B5D3B]">{i + 1}.</span>
                        {s}
                    </li>
                ))}
            </ol>
        </section>
    );
}