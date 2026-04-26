import Link from "next/link";
import Button from "../ui/Button";

export default function Navbar() {
    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container flex items-center justify-between py-4">
                <h1 className="font-bold text-lg text-brand-900">
                    Dayli Energy
                </h1>

                <div className="hidden md:flex gap-6 text-sm">
                    <Link href="/">Home</Link>
                    <Link href="/shop">Shop</Link>
                    <Link href="/contact">Contact</Link>
                </div>

                <Button>Request Quote</Button>
            </div>
        </nav>
    );
}