"use client";

import { useActionState, useEffect } from "react";
import {
  addPackageCategoryAction,
  removePackageCategoryAction,
  renamePackageCategoryAction,
} from "@/app/actions/packages";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";

const initialState: { error?: string; ok?: boolean } | undefined = undefined;

export function PackageCategoryManagerCard({
  categories,
}: {
  categories: string[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [addState, addAction, adding] = useActionState(
    addPackageCategoryAction,
    initialState
  );
  const [removeState, removeAction, removing] = useActionState(
    removePackageCategoryAction,
    initialState
  );
  const [renameState, renameAction, renaming] = useActionState(
    renamePackageCategoryAction,
    initialState
  );

  useEffect(() => {
    if (!addState) return;
    if (addState.error) {
      showStatusMessage(`Add failed: ${addState.error}`, "error");
      return;
    }
    if (addState.ok) {
      showStatusMessage("Package category added.", "success");
    }
  }, [addState, showStatusMessage]);

  useEffect(() => {
    if (!removeState) return;
    if (removeState.error) {
      showStatusMessage(`Remove failed: ${removeState.error}`, "error");
      return;
    }
    if (removeState.ok) {
      showStatusMessage("Package category removed.", "success");
    }
  }, [removeState, showStatusMessage]);

  useEffect(() => {
    if (!renameState) return;
    if (renameState.error) {
      showStatusMessage(`Rename failed: ${renameState.error}`, "error");
      return;
    }
    if (renameState.ok) {
      showStatusMessage("Package category updated.", "success");
    }
  }, [renameState, showStatusMessage]);

  return (
    <Card>
      <h3 className="text-base font-semibold">Manage package categories</h3>
      <p className="mt-1 text-sm text-gray-600">
        Categories appear in the Packages tab sidebar on the order page. Rename
        updates all packages using that category.
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        <form action={addAction} className="space-y-2">
          <Input
            name="categoryName"
            label="New category"
            placeholder="e.g. off-grid"
            required
          />
          {addState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {addState.error}
            </p>
          )}
          {addState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Added.
            </p>
          )}
          <Button type="submit" disabled={adding}>
            {adding ? "Adding…" : "Add category"}
          </Button>
        </form>

        <form action={renameAction} className="space-y-2">
          <label
            htmlFor="pkg-cat-rename-from"
            className="block text-sm font-medium text-gray-700"
          >
            Rename category
          </label>
          <select
            id="pkg-cat-rename-from"
            name="fromCategory"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Input
            name="toCategory"
            label="New name (slug-style)"
            placeholder="e.g. off-grid"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
          />
          {renameState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {renameState.error}
            </p>
          )}
          {renameState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Renamed.
            </p>
          )}
          <Button type="submit" disabled={renaming}>
            {renaming ? "Saving…" : "Update / rename"}
          </Button>
        </form>

        <form action={removeAction} className="space-y-2">
          <label
            htmlFor="pkg-cat-remove"
            className="block text-sm font-medium text-gray-700"
          >
            Remove category
          </label>
          <select
            id="pkg-cat-remove"
            name="categoryName"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Built-in categories (general, residential, commercial) cannot be
            removed. Others can be removed only when no package uses them.
          </p>
          {removeState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {removeState.error}
            </p>
          )}
          {removeState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Removed.
            </p>
          )}
          <Button type="submit" disabled={removing}>
            {removing ? "Removing…" : "Remove category"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
