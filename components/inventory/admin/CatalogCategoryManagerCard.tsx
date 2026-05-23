"use client";

import { useActionState, useEffect } from "react";
import { addInventoryCategoryAction } from "@/app/actions/products";
import { addPackageCategoryAction } from "@/app/actions/packages";
import {
  CatalogCategoryList,
  toCatalogCategoryRows,
  type CatalogCategoryRow,
} from "@/components/inventory/admin/CatalogCategoryList";
import type { InventoryCategoryRow } from "@/lib/db/products";
import type { PackageCategoryRow } from "@/lib/db/packages";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";

const initialState: { error?: string; ok?: boolean } | undefined = undefined;

const slugHint = (
  <p className="text-xs text-gray-500">
    Lowercase letters, numbers, and hyphens (e.g.{" "}
    <span className="font-mono">off-grid</span>).
  </p>
);

export function CatalogCategoryManagerCard({
  productCategories,
  packageCategories,
}: {
  productCategories: InventoryCategoryRow[];
  packageCategories: PackageCategoryRow[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [addProductState, addProductAction, addingProduct] = useActionState(
    addInventoryCategoryAction,
    initialState
  );
  const [addPackageState, addPackageAction, addingPackage] = useActionState(
    addPackageCategoryAction,
    initialState
  );

  const catalogRows: CatalogCategoryRow[] = toCatalogCategoryRows(
    productCategories,
    packageCategories
  );

  useEffect(() => {
    if (!addProductState) return;
    if (addProductState.error) {
      showStatusMessage(
        `Product category failed: ${addProductState.error}`,
        "error"
      );
      return;
    }
    if (addProductState.ok) {
      showStatusMessage("Product category added.", "success");
    }
  }, [addProductState, showStatusMessage]);

  useEffect(() => {
    if (!addPackageState) return;
    if (addPackageState.error) {
      showStatusMessage(
        `Package category failed: ${addPackageState.error}`,
        "error"
      );
      return;
    }
    if (addPackageState.ok) {
      showStatusMessage("Package category added.", "success");
    }
  }, [addPackageState, showStatusMessage]);

  return (
    <Card>
      <h3 className="text-base font-semibold">Manage categories</h3>
      <p className="mt-1 text-sm text-gray-600">
        Product categories filter the Products tab on the order page; package
        categories filter the Packages tab. Add either type below, then edit or
        remove from the combined list.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form action={addProductAction} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <p className="text-sm font-medium text-gray-900">Add product category</p>
          <Input
            name="categoryName"
            label="Category name"
            placeholder="e.g. accessories"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
          />
          {slugHint}
          {addProductState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {addProductState.error}
            </p>
          )}
          {addProductState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Product category added.
            </p>
          )}
          <Button type="submit" disabled={addingProduct}>
            {addingProduct ? "Adding…" : "Add product category"}
          </Button>
        </form>

        <form action={addPackageAction} className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <p className="text-sm font-medium text-gray-900">Add package category</p>
          <Input
            name="categoryName"
            label="Category name"
            placeholder="e.g. off-grid"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
          />
          {slugHint}
          {addPackageState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {addPackageState.error}
            </p>
          )}
          {addPackageState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Package category added.
            </p>
          )}
          <Button type="submit" disabled={addingPackage}>
            {addingPackage ? "Adding…" : "Add package category"}
          </Button>
        </form>
      </div>

      <CatalogCategoryList categories={catalogRows} />
    </Card>
  );
}
