"use client";

import { useActionState } from "react";
import { createProductAction } from "@/app/actions/products";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUrlField } from "./ImageUrlField";

const initial: { error?: string; ok?: boolean } | undefined = undefined;

export function ProductCreateForm() {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initial
  );

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
        <Input
          name="slug"
          label="URL slug (lowercase, hyphens)"
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="e.g. solar-panel-300w"
        />
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
            defaultValue="solar"
          >
            <option value="solar">Solar</option>
            <option value="inverter">Inverter</option>
            <option value="battery">Battery</option>
          </select>
        </div>
        <Input
          name="price"
          label="Price (₦)"
          type="number"
          min={0}
          step={1}
          required
        />
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
