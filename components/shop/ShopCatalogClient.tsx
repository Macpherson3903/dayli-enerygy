"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ShopCatalogLayout from "@/components/shop/ShopCatalogLayout";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ProductGrid from "@/components/shop/ProductGrid";
import ProductCard from "@/components/ProductCard";
import type { ProductPublic } from "@/lib/types";
import {
  catalogItemMatchesPriceFilter,
  parseCatalogPriceFilterId,
  type CatalogPriceFilterId,
} from "@/lib/pricing";
import { motion } from "framer-motion";
import { clsx } from "clsx";

const PRODUCTS_PER_PAGE = 20;
const SPOTLIGHT_COUNT = 3;

export type CatalogTab = "products" | "packages";

export default function ShopCatalogClient({
  initialProducts,
  initialPackages = [],
  productCategories = [],
  packageCategories = [],
  spotlightProducts = [],
  spotlightPackages = [],
}: {
  initialProducts: ProductPublic[];
  initialPackages?: ProductPublic[];
  /** Admin + catalog product category slugs for Products tab sidebar */
  productCategories?: string[];
  /** Admin + catalog package category slugs for Packages tab sidebar */
  packageCategories?: string[];
  spotlightProducts?: ProductPublic[];
  spotlightPackages?: ProductPublic[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const catalogTab: CatalogTab =
    tabParam === "packages" ? "packages" : "products";

  const category = searchParams.get("category") || "all";
  const pkgCategory = searchParams.get("pkgCategory") || "all";
  const priceFilter = parseCatalogPriceFilterId(searchParams.get("price"));
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

  const setCatalogTab = useCallback(
    (t: CatalogTab) => {
      replaceParams((params) => {
        if (t === "products") {
          params.delete("tab");
          params.delete("pkgCategory");
        } else {
          params.set("tab", "packages");
          params.delete("category");
        }
        params.delete("page");
      });
    },
    [replaceParams]
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

  const setPackageCategory = useCallback(
    (cat: string) => {
      replaceParams((params) => {
        if (cat === "all" || !cat) {
          params.delete("pkgCategory");
        } else {
          params.set("pkgCategory", cat);
        }
        params.delete("page");
      });
    },
    [replaceParams]
  );

  const setPriceFilter = useCallback(
    (id: CatalogPriceFilterId) => {
      replaceParams((params) => {
        if (id === "all") {
          params.delete("price");
        } else {
          params.set("price", id);
        }
        params.delete("page");
      });
    },
    [replaceParams]
  );

  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const categories = useMemo(() => {
    const merged = new Set<string>([
      ...productCategories,
      ...initialProducts.map((p) => p.category).filter(Boolean),
    ]);
    merged.delete("all");
    return ["all", ...Array.from(merged).sort((a, b) => a.localeCompare(b))];
  }, [productCategories, initialProducts]);

  const packageCategoryOptions = useMemo(() => {
    const merged = new Set<string>([
      ...packageCategories,
      ...initialPackages.map((p) =>
        (p.category || "general").trim().toLowerCase()
      ),
    ]);
    merged.delete("all");
    return ["all", ...Array.from(merged).sort((a, b) => a.localeCompare(b))];
  }, [packageCategories, initialPackages]);

  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (priceFilter !== "all") {
      result = result.filter((p) =>
        catalogItemMatchesPriceFilter(
          { priceMin: p.priceMin, priceMax: p.priceMax },
          priceFilter
        )
      );
    }
    if (sort === "low") {
      result = [...result].sort((a, b) => a.priceMin - b.priceMin);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.priceMax - a.priceMax);
    }
    return result;
  }, [initialProducts, category, sort, search, priceFilter]);

  const filteredPackages = useMemo(() => {
    let result = initialPackages;
    if (pkgCategory !== "all") {
      result = result.filter(
        (p) =>
          (p.category || "general").trim().toLowerCase() === pkgCategory
      );
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (priceFilter !== "all") {
      result = result.filter((p) =>
        catalogItemMatchesPriceFilter(
          { priceMin: p.priceMin, priceMax: p.priceMax },
          priceFilter
        )
      );
    }
    if (sort === "low") {
      result = [...result].sort((a, b) => a.priceMin - b.priceMin);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.priceMax - a.priceMax);
    }
    return result;
  }, [initialPackages, pkgCategory, search, sort, priceFilter]);

  const activeList =
    catalogTab === "packages" ? filteredPackages : filteredProducts;
  const totalPages = Math.max(
    1,
    Math.ceil(activeList.length / PRODUCTS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedActive = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return activeList.slice(start, start + PRODUCTS_PER_PAGE);
  }, [currentPage, activeList]);

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

  const spotlight =
    catalogTab === "packages" ? spotlightPackages : spotlightProducts;
  const spotlightSafe = useMemo(() => {
    const raw = spotlight.slice(0, SPOTLIGHT_COUNT);
    if (raw.length >= SPOTLIGHT_COUNT) return raw;
    const pool =
      catalogTab === "packages" ? initialPackages : initialProducts;
    const ids = new Set(raw.map((p) => p.id));
    const filler = pool.filter((p) => !ids.has(p.id));
    const need = SPOTLIGHT_COUNT - raw.length;
    return [...raw, ...filler.slice(0, need)];
  }, [spotlight, catalogTab, initialPackages, initialProducts]);

  const paginationNav =
    activeList.length > PRODUCTS_PER_PAGE ? (
      <nav
        aria-label="Catalog pagination"
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
            className={clsx(
              "rounded-md border px-3 py-2 text-sm transition",
              n === currentPage
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            )}
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
    ) : null;

  return (
    <>
      <div
        className="mb-8 flex flex-wrap gap-2 border-b border-gray-200 pb-1"
        role="tablist"
        aria-label="Catalog type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={catalogTab === "products"}
          id="tab-products"
          aria-controls="catalog-panel"
          onClick={() => setCatalogTab("products")}
          className={clsx(
            "rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
            catalogTab === "products"
              ? "bg-brand-700 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Products
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={catalogTab === "packages"}
          id="tab-packages"
          aria-controls="catalog-panel"
          onClick={() => setCatalogTab("packages")}
          className={clsx(
            "rounded-t-lg px-4 py-2.5 text-sm font-medium transition",
            catalogTab === "packages"
              ? "bg-brand-700 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Packages
        </button>
      </div>

      <ShopToolbar sort={sort} setSort={setSort} onSearch={setSearch} />

      {spotlightSafe.length > 0 ? (
        <section
          className="mb-10"
          aria-label={
            catalogTab === "packages"
              ? "Highlighted packages"
              : "Highlighted products"
          }
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
            {catalogTab === "packages"
              ? "Highlighted packages"
              : "Highlighted products"}
            <span className="ml-2 font-normal normal-case text-gray-400">
              (random picks — refresh for new ones)
            </span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightSafe.map((item, i) => (
              <motion.div
                key={`${catalogTab}-spotlight-${item.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <ProductCard product={item} variant="shop" />
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      <div id="catalog-panel" role="tabpanel" aria-labelledby={`tab-${catalogTab}`}>
        {catalogTab === "products" ? (
          <ShopCatalogLayout
            category={category}
            setCategory={setCategory}
            categories={categories}
            filterLabel="Product category"
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
          >
            <ProductGrid products={paginatedActive} />
            {paginationNav}
          </ShopCatalogLayout>
        ) : (
          <ShopCatalogLayout
            category={pkgCategory}
            setCategory={setPackageCategory}
            categories={packageCategoryOptions}
            filterLabel="Package category"
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
          >
            <ProductGrid products={paginatedActive} />
            {paginationNav}
          </ShopCatalogLayout>
        )}
      </div>
    </>
  );
}
