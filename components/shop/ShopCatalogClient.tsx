"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ShopCatalogLayout from "@/components/shop/ShopCatalogLayout";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ProductGrid from "@/components/shop/ProductGrid";
import type { ProductPublic } from "@/lib/types";

export default function ShopCatalogClient({
  initialProducts,
}: {
  initialProducts: ProductPublic[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const category = searchParams.get("category") || "all";

  const setCategory = useCallback(
    (cat: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (cat === "all" || !cat) {
        p.delete("category");
      } else {
        p.set("category", cat);
      }
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const categories = useMemo(
    () =>
      ["all", ...Array.from(new Set(initialProducts.map((p) => p.category))).sort(
        (a, b) => a.localeCompare(b)
      )],
    [initialProducts]
  );

  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (sort === "low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [initialProducts, category, sort, search]);

  return (
    <>
      <ShopToolbar sort={sort} setSort={setSort} onSearch={setSearch} />
      <ShopCatalogLayout
        category={category}
        setCategory={setCategory}
        categories={categories}
      >
        <ProductGrid products={filteredProducts} />
      </ShopCatalogLayout>
    </>
  );
}
