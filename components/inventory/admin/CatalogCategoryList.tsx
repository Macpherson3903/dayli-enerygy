"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  removeInventoryCategoryAction,
  renameInventoryCategoryAction,
} from "@/app/actions/products";
import {
  removePackageCategoryAction,
  renamePackageCategoryAction,
} from "@/app/actions/packages";
import type { InventoryCategoryRow } from "@/lib/db/products";
import type { PackageCategoryRow } from "@/lib/db/packages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";
import { clsx } from "clsx";
import { Pencil, Trash2 } from "lucide-react";

const initialState: { error?: string; ok?: boolean } | undefined = undefined;

export type CatalogCategoryRow = {
  kind: "product" | "package";
  name: string;
  itemCount: number;
  isBuiltIn: boolean;
};

function formatCategoryLabel(name: string): string {
  return name.replace(/-/g, " ");
}

function rowKey(row: CatalogCategoryRow): string {
  return `${row.kind}:${row.name}`;
}

export function toCatalogCategoryRows(
  products: InventoryCategoryRow[],
  packages: PackageCategoryRow[]
): CatalogCategoryRow[] {
  const productRows: CatalogCategoryRow[] = products.map((p) => ({
    kind: "product",
    name: p.name,
    itemCount: p.productCount,
    isBuiltIn: p.isBuiltIn,
  }));
  const packageRows: CatalogCategoryRow[] = packages.map((p) => ({
    kind: "package",
    name: p.name,
    itemCount: p.packageCount,
    isBuiltIn: p.isBuiltIn,
  }));
  return [...productRows, ...packageRows].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "product" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function CatalogCategoryList({
  categories,
}: {
  categories: CatalogCategoryRow[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "product" | "package">(
    "all"
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const [renameProductState, renameProductAction, renamingProduct] =
    useActionState(renameInventoryCategoryAction, initialState);
  const [removeProductState, removeProductAction, removingProduct] =
    useActionState(removeInventoryCategoryAction, initialState);
  const [renamePackageState, renamePackageAction, renamingPackage] =
    useActionState(renamePackageCategoryAction, initialState);
  const [removePackageState, removePackageAction, removingPackage] =
    useActionState(removePackageCategoryAction, initialState);

  const renaming = renamingProduct || renamingPackage;
  const removing = removingProduct || removingPackage;

  useEffect(() => {
    if (!renameProductState && !renamePackageState) return;
    const state = renameProductState ?? renamePackageState;
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Rename failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Category updated.", "success");
      setEditingKey(null);
    }
  }, [renameProductState, renamePackageState, showStatusMessage]);

  useEffect(() => {
    if (!removeProductState && !removePackageState) return;
    const state = removeProductState ?? removePackageState;
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Delete failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Category removed.", "success");
      setConfirmDeleteKey(null);
    }
  }, [removeProductState, removePackageState, showStatusMessage]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((c) => {
      if (kindFilter !== "all" && c.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.kind.toLowerCase().includes(q)
      );
    });
  }, [categories, search, kindFilter]);

  const productCount = categories.filter((c) => c.kind === "product").length;
  const packageCount = categories.filter((c) => c.kind === "package").length;

  function startEdit(row: CatalogCategoryRow) {
    setEditingKey(rowKey(row));
    setEditDraft(row.name);
    setConfirmDeleteKey(null);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditDraft("");
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            All categories ({categories.length})
          </h4>
          <p className="mt-1 text-sm text-gray-600">
            {productCount} product · {packageCount} package — rename updates
            every item in that category. Delete only when count is zero (built-in
            categories cannot be deleted).
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:max-w-xl">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(
              [
                { id: "all", label: "All" },
                { id: "product", label: "Products" },
                { id: "package", label: "Packages" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setKindFilter(opt.id)}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition",
                  kindFilter === opt.id
                    ? "bg-brand-700 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <Input
              name="categorySearch"
              label="Search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name…"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          {search.trim() || kindFilter !== "all"
            ? "No categories match your filters."
            : "No categories yet. Add one above."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {filtered.map((row) => {
            const key = rowKey(row);
            const isEditing = editingKey === key;
            const isConfirmingDelete = confirmDeleteKey === key;
            const canDelete = !row.isBuiltIn && row.itemCount === 0;
            const itemLabel = row.kind === "product" ? "product" : "package";
            const renameAction =
              row.kind === "product" ? renameProductAction : renamePackageAction;
            const removeAction =
              row.kind === "product" ? removeProductAction : removePackageAction;
            const renameError =
              row.kind === "product"
                ? renameProductState?.error
                : renamePackageState?.error;
            const removeError =
              row.kind === "product"
                ? removeProductState?.error
                : removePackageState?.error;

            return (
              <li
                key={key}
                className={clsx(
                  "px-4 py-3",
                  isEditing && "bg-brand-50/40",
                  isConfirmingDelete && "bg-red-50/50"
                )}
              >
                {isEditing ? (
                  <form action={renameAction} className="space-y-3">
                    <input
                      type="hidden"
                      name="fromCategory"
                      value={row.name}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <Input
                          name="toCategory"
                          label={`Rename ${row.kind} “${formatCategoryLabel(row.name)}”`}
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          required
                          pattern="[a-z0-9]+(-[a-z0-9]+)*"
                          title="Lowercase letters, numbers, and hyphens only"
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" size="sm" disabled={renaming}>
                          {renaming ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={renaming}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                    {renameError && isEditing ? (
                      <p className="text-sm text-red-600" role="alert">
                        {renameError}
                      </p>
                    ) : null}
                  </form>
                ) : isConfirmingDelete ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-800">
                      Remove {row.kind}{" "}
                      <span className="font-medium capitalize">
                        {formatCategoryLabel(row.name)}
                      </span>
                      ? This cannot be undone.
                    </p>
                    <form action={removeAction} className="flex flex-wrap gap-2">
                      <input
                        type="hidden"
                        name="categoryName"
                        value={row.name}
                      />
                      <Button
                        type="submit"
                        variant="danger"
                        size="sm"
                        disabled={removing}
                      >
                        {removing ? "Removing…" : "Confirm delete"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmDeleteKey(null)}
                        disabled={removing}
                      >
                        Cancel
                      </Button>
                    </form>
                    {removeError ? (
                      <p className="text-sm text-red-600" role="alert">
                        {removeError}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium capitalize text-gray-900">
                          {formatCategoryLabel(row.name)}
                        </p>
                        <span
                          className={clsx(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            row.kind === "product"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-violet-100 text-violet-900"
                          )}
                        >
                          {row.kind === "product" ? "Product" : "Package"}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-gray-500">
                        {row.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={clsx(
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            row.itemCount > 0
                              ? "bg-brand-100 text-brand-900"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {row.itemCount}{" "}
                          {row.itemCount === 1 ? itemLabel : `${itemLabel}s`}
                        </span>
                        {row.isBuiltIn ? (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            Built-in
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(row)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={!canDelete}
                        title={
                          row.isBuiltIn
                            ? "Built-in categories cannot be deleted"
                            : row.itemCount > 0
                              ? `Reassign or remove ${itemLabel}s before deleting`
                              : "Delete category"
                        }
                        onClick={() => {
                          setConfirmDeleteKey(key);
                          setEditingKey(null);
                        }}
                        className="inline-flex items-center gap-1.5 text-red-700 hover:bg-red-50 disabled:text-gray-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
