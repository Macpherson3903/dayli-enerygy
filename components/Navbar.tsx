"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const items = [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: "About", href: "/about" },
        { label: "Cart", href: "/cart" },
    ];

    return (
        <header
            className={`sticky top-0 z-50 w-full border-b border-gray-200 shadow-sm transition-colors duration-200
            ${open ? "bg-white" : "bg-white md:bg-white/95 backdrop-blur-lg backdrop-saturate-105"}`}
        >
            <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Dayli Energy"
                        width={70}
                        height={22}
                        className="h-6 w-auto object-contain"
                        priority
                    />
                    <span className="text-lg font-bold text-[#0B5D3B]">
                        Dayli Energy
                    </span>
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-6">
                    <nav className="flex gap-4 items-center">
                        <NavLinks items={items} />
                    </nav>

                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 bg-[#f1f5f9] hover:bg-[#e6eef3] text-gray-800 px-3 py-2 rounded-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B5D3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="uppercase text-sm">Account</span>
                    </Link>
                </div>

                {/* Mobile toggle */}
                <div className="md:hidden">
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

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* blurred overlay */}
                        <motion.div
                            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />

                        {/* sidebar */}
                        <motion.aside
                            className="fixed left-0 top-0 bottom-0 z-50 md:hidden w-[80%] bg-white/90 backdrop-blur-xl shadow-lg border-r border-gray-100"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.18 }}
                        >
                            <div className="h-full flex flex-col">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4">
                                    <Link href="/" className="flex items-center gap-2">
                                        <Image
                                            src="/logo.png"
                                            alt="Dayli Energy"
                                            width={60}
                                            height={20}
                                            className="h-5 w-auto object-contain"
                                        />
                                        <span className="text-base font-bold text-[#0B5D3B]">
                                            Dayli Energy
                                        </span>
                                    </Link>

                                    <button
                                        onClick={() => setOpen(false)}
                                        className="p-2 rounded-md focus:outline-none focus:ring"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Nav */}
                                <nav className="flex flex-col w-full">
                                    <NavLinks
                                        items={items}
                                        className="flex flex-col w-full"
                                        onLinkClick={() => setOpen(false)}
                                    />

                                    <Link
                                        href="/account"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-6 py-4 text-gray-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0B5D3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Account</span>
                                    </Link>
                                </nav>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}