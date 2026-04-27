"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

type NavItem = { label: string; href: string };

type Props = {
    items: NavItem[];
    className?: string;
    onLinkClick?: () => void;
};

export default function NavLinks({ items, className = "", onLinkClick }: Props) {
    const pathname = usePathname() || "/";

    const baseClass = className || "flex";

    const list = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
    };

    const item = {
        hidden: { opacity: 0, y: -6 },
        show: { opacity: 1, y: 0 },
    };

    const renderIcon = (label: string) => {
        const key = label.toLowerCase();
        switch (key) {
            case "home":
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 9.5L12 3l9 6.5" />
                        <path d="M9 22V12h6v10" />
                    </svg>
                );
            case "shop":
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M6 2L3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
                        <path d="M3 6h18" />
                    </svg>
                );
            case "about":
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                );
            case "contact":
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21 10a2 2 0 0 0-2-2h-3l-2-3H10L8 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6z" />
                    </svg>
                );
            case "cart":
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="9" cy="20" r="1" />
                        <circle cx="20" cy="20" r="1" />
                        <path d="M1 1h4l2.68 13.39A2 2 0 0 0 9.6 16h8.72a2 2 0 0 0 1.96-1.57L22 6H6" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                );
        }
    };

    const isMobileContainer = className.includes("flex-col");

    const ulClass = `${baseClass} ${className} ${isMobileContainer ? "bg-white w-full p-2" : ""}`;

    return (
        <motion.ul className={ulClass} initial="hidden" animate="show" variants={list}>
            {items.map((itemData) => {
                const isActive = pathname === itemData.href || (itemData.href !== "/" && pathname.startsWith(itemData.href));
                const isMobile = className.includes("flex-col");

                const linkBase = isMobile
                    ? "flex w-full items-center gap-2 px-4 py-2 rounded-md"
                    : "inline-flex items-center gap-2 px-2 py-1 rounded-md";

                const activeClass = isActive
                    ? isMobile
                        ? "bg-[#0B5D3B] text-white"
                        : "font-semibold text-[#0B5D3B]"
                    : "text-gray-800";

                return (
                    <motion.li key={itemData.href} variants={item}>
                        <Link
                            href={itemData.href}
                            className={`${linkBase} capitalize text-[15px] transition-transform transform duration-150 ease-in-out hover:scale-110 hover:bg-[#0B5D3B] hover:text-white ${activeClass}`}
                            aria-current={isActive ? "page" : undefined}
                            onClick={onLinkClick}
                        >
                            {/* show icons only on mobile for Home/Shop/About/Contact; keep Cart icon visible on desktop */}
                            {['Home', 'Shop', 'About', 'Contact'].includes(itemData.label) ? (
                                <span className="flex-shrink-0 text-current md:hidden">{renderIcon(itemData.label)}</span>
                            ) : (
                                <span className="flex-shrink-0 text-current">{renderIcon(itemData.label)}</span>
                            )}

                            <span>{itemData.label}</span>
                        </Link>
                    </motion.li>
                );
            })}
        </motion.ul>
    );
}
