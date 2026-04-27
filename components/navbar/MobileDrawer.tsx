"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SignInButton, UserButton } from "@clerk/nextjs";
import BrandLogo from "./BrandLogo";
import NavItems from "./NavItems";
import type { NavItem } from "./types";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function MobileDrawer({
  open,
  items,
  itemCount,
  loaded,
  isSignedIn,
  showDashboard,
  showAdminBadge,
  onClose,
}: {
  open: boolean;
  items: NavItem[];
  itemCount: number;
  loaded: boolean;
  isSignedIn: boolean;
  showDashboard: boolean;
  showAdminBadge: boolean;
  onClose: () => void;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed inset-y-0 left-0 z-[9999] w-[80vw] max-w-sm border-r border-gray-200 bg-white shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <BrandLogo onClick={onClose} showText />
                <button
                  type="button"
                  className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 px-3 py-3">
                <NavItems items={items} onItemClick={onClose} vertical />

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <span>Cart</span>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                    {itemCount}
                  </span>
                </Link>

                {showDashboard && (
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="block rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white"
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              <div className="mt-auto border-t border-gray-200 px-3 py-3">
                {loaded && !isSignedIn && (
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button
                      type="button"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-800"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                )}

                {loaded && isSignedIn && (
                  <div className="flex items-center gap-2 px-1 py-1">
                    <UserButton />
                    {showAdminBadge && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        Admin
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}
