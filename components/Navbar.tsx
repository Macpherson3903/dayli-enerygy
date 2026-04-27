"use client"

import React, { useState } from "react";
import Link from "next/link";
import NavLinks from "./NavLinks";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const items = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Cart", href: "/cart" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-sm backdrop-saturate-105 border-b">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-xl font-bold text-[#0B5D3B]">Dayli Energy</Link>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <nav>
                        <NavLinks items={items} className="flex gap-4 items-center" />
                    </nav>

                    <div>
                        <Link href="/account" className="inline-flex items-center gap-2 bg-[#f1f5f9] hover:bg-[#e6eef3] text-gray-800 px-3 py-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B5D3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="uppercase text-sm">Account</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        onClick={() => setOpen((s) => !s)}
                        className="p-2 rounded-md focus:outline-none focus:ring"
                    >
                        {open ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile panel */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            className="md:hidden absolute left-0 right-0 top-full z-50 border-t bg-white shadow-md"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.16 }}
                        >
                            <div className="px-6 py-4">
                                <NavLinks items={items} className="flex flex-col gap-3 text-base" onLinkClick={() => setOpen(false)} />
                                <div className="mt-4">
                                    <button className="w-full bg-[#38C172] text-white px-4 py-2 rounded-md">Request Quote</button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}