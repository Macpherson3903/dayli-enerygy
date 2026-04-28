"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ShopCatalogLayout from "@/components/shop/ShopCatalogLayout";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ProductGrid from "@/components/shop/ProductGrid";
import type { ProductPublic } from "@/lib/types";

const PRODUCTS_PER_PAGE = 20;

export default function ShopCatalogClient({
  initialProducts,
}: {
  initialProducts: ProductPublic[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const category = searchParams.get("category") || "all";
  const rawPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      mutate(p);
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const setCategory = useCallback(
    (cat: string) => {
      replaceParams((params) => {
        if (cat === "all" || !cat) {
          params.delete("category");
        } else {
          params.set("category", cat);
        }
        params.delete("page");
      });
    },
    [replaceParams]
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.min(Math.max(nextPage, 1), totalPages);
      replaceParams((params) => {
        if (safePage === 1) {
          params.delete("page");
        } else {
          params.set("page", String(safePage));
        }
      });
    },
    [replaceParams, totalPages]
  );

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    const nums: number[] = [];
    for (let n = start; n <= end; n += 1) nums.push(n);
    return nums;
  }, [currentPage, totalPages]);

  return (
    <>
      <ShopToolbar sort={sort} setSort={setSort} onSearch={setSearch} />
      <ShopCatalogLayout
        category={category}
        setCategory={setCategory}
        categories={categories}
      >
        <ProductGrid products={paginatedProducts} />
        {filteredProducts.length > PRODUCTS_PER_PAGE ? (
          <nav
            aria-label="Shop product pagination"
            className="mt-8 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  n === currentPage
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        ) : null}
      </ShopCatalogLayout>
    </>
  );
}
