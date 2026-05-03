"use client";

import { useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCartOptional } from "@/context/CartContext";
import type { AppRole } from "@/lib/types";
import BrandLogo from "./navbar/BrandLogo";
import NavItems from "./navbar/NavItems";
import DesktopActions from "./navbar/DesktopActions";
import MobileMenuButton from "./navbar/MobileMenuButton";
import MobileDrawer from "./navbar/MobileDrawer";
import type { NavItem } from "./navbar/types";

const BASE_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Order", href: "/order" },
  { label: "Quotation & installation", href: "/installation-booking" },
  {
    label: "Training",
    href: "https://www.glitecast.com/course/solar-pv-installation",
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function isAdminRole(role: AppRole | undefined): boolean {
  return role === "sales_admin" || role === "inventory_admin";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const itemCount = useCartOptional()?.itemCount ?? 0;
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const role = (user?.publicMetadata?.role as AppRole | undefined) ?? "customer";
  const loaded = authLoaded && userLoaded;
  const showDashboard = loaded && isSignedIn;
  const showAdminBadge = showDashboard && isAdminRole(role);

  const navItems = useMemo(() => BASE_ITEMS, []);

  return (
    <header className="sticky top-0 z-[1000] border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo showText />

        <NavItems items={navItems} />

        <DesktopActions
          itemCount={itemCount}
          loaded={loaded}
          isSignedIn={Boolean(isSignedIn)}
          showDashboard={showDashboard}
          showAdminBadge={showAdminBadge}
        />

        <MobileMenuButton open={open} onToggle={() => setOpen((s) => !s)} />
      </div>

      <MobileDrawer
        open={open}
        items={navItems}
        itemCount={itemCount}
        loaded={loaded}
        isSignedIn={Boolean(isSignedIn)}
        showDashboard={showDashboard}
        showAdminBadge={showAdminBadge}
        onClose={() => setOpen(false)}
      />
    </header>
  );
}
