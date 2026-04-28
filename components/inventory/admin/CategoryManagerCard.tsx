"use client";

import { useActionState } from "react";
import {
  addInventoryCategoryAction,
  removeInventoryCategoryAction,
} from "@/app/actions/products";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: { error?: string; ok?: boolean } | undefined = undefined;

export function CategoryManagerCard({ categories }: { categories: string[] }) {
  const [addState, addAction, adding] = useActionState(
    addInventoryCategoryAction,
    initialState
  );
  const [removeState, removeAction, removing] = useActionState(
    removeInventoryCategoryAction,
    initialState
  );

  return (
    <Card>
      <h3 className="text-base font-semibold">Manage categories</h3>
      <p className="mt-1 text-sm text-gray-600">
        Add new categories or remove unused ones.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <form action={addAction} className="space-y-2">
          <Input
            name="categoryName"
            label="New category"
            placeholder="e.g. accessories"
            required
          />
          {addState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {addState.error}
            </p>
          )}
          {addState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Category added.
            </p>
          )}
          <Button type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add category"}
          </Button>
        </form>

        <form action={removeAction} className="space-y-2">
          <label
            htmlFor="category-remove"
            className="block text-sm font-medium text-gray-700"
          >
            Remove category
          </label>
          <select
            id="category-remove"
            name="categoryName"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
          {removeState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {removeState.error}
            </p>
          )}
          {removeState?.ok && (
            <p className="text-sm text-green-700" role="status">
              Category removed.
            </p>
          )}
          <Button type="submit" disabled={removing}>
            {removing ? "Removing..." : "Remove category"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
