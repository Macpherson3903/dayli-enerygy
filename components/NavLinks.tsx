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

    return (
        <motion.ul className={`${baseClass} ${className}`} initial="hidden" animate="show" variants={list}>
            {items.map((itemData) => {
                const isActive = pathname === itemData.href || (itemData.href !== "/" && pathname.startsWith(itemData.href));

                return (
                    <motion.li key={itemData.href} variants={item}>
                        <Link
                            href={itemData.href}
                            className={`hover:text-[#0B5D3B] ${isActive ? "font-semibold text-[#0B5D3B]" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                            onClick={onLinkClick}
                        >
                            {itemData.label}
                        </Link>
                    </motion.li>
                );
            })}
        </motion.ul>
    );
}
