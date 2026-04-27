import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8 min-h-[60vh]">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="rounded-2xl border border-gray-200 p-2 bg-white">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-700"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </>
  );
}
