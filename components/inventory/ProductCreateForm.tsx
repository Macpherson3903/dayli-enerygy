"use client";

import { useActionState, useEffect } from "react";
import { createProductAction } from "@/app/actions/products";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUrlField } from "./ImageUrlField";
import { PriceRangeFields } from "./PriceRangeFields";
import { useStatusMessage } from "@/context/StatusMessageContext";

const initial: { error?: string; ok?: boolean } | undefined = undefined;

export function ProductCreateForm({ categories }: { categories: string[] }) {
  const { showStatusMessage } = useStatusMessage();
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initial
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Create product failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Product created successfully.", "success");
    }
  }, [state, showStatusMessage]);

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Add product</h2>
      {state?.error && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600 mb-2" role="status">
          Product created.
        </p>
      )}
      <form action={formAction} className="space-y-3">
        <Input name="name" label="Name" required />
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            required
            defaultValue={categories[0] ?? ""}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <Input name="brand" label="Brand (optional)" />
        <PriceRangeFields />
        <Textarea name="description" label="Description" required rows={4} />
        <Textarea
          name="shortDescription"
          label="Short description (optional)"
          rows={2}
        />
        <ImageUrlField />
        <Textarea
          name="features"
          label="Features (one per line)"
          rows={4}
          placeholder="One feature per line"
        />
        <Input
          name="stock"
          label="Stock"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={0}
        />
        <input type="hidden" name="active" value="true" readOnly />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create product"}
        </Button>
      </form>
    </Card>
  );
}
