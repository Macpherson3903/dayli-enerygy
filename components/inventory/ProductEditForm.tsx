"use client";

import { useActionState, useEffect, useId } from "react";
import { updateProductAction } from "@/app/actions/products";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUrlField } from "./ImageUrlField";
import { useStatusMessage } from "@/context/StatusMessageContext";

const initial: { error?: string; ok?: boolean } | undefined = undefined;

export function ProductEditForm({
  productId,
  product,
  categories,
}: {
  productId: string;
  product: {
    name: string;
    category: string;
    brand?: string;
    price: number;
    description: string;
    shortDescription?: string;
    image: string;
    features: string[];
    stock: number;
    active: boolean;
  };
  categories: string[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [state, formAction, pending] = useActionState(
    (prev: typeof initial, formData: FormData) =>
      updateProductAction(productId, prev, formData),
    initial
  );
  const activeId = useId();

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Save failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Product updated successfully.", "success");
    }
  }, [state, showStatusMessage]);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-gray-200 p-5">
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600" role="status">
          Saved.
        </p>
      )}
      <Input
        name="name"
        label="Name"
        defaultValue={product.name}
        required
      />
      <div>
        <label
          htmlFor="cat"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="cat"
          name="category"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          required
          defaultValue={product.category}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <Input
        name="brand"
        label="Brand (optional)"
        defaultValue={product.brand ?? ""}
      />
      <Input
        name="price"
        label="Price (₦)"
        type="number"
        min={0}
        step={1}
        defaultValue={product.price}
        required
      />
      <Textarea
        name="description"
        label="Description"
        required
        rows={4}
        defaultValue={product.description}
      />
      <Textarea
        name="shortDescription"
        label="Short description (optional)"
        rows={2}
        defaultValue={product.shortDescription ?? ""}
      />
      <div key={productId + product.image}>
        <ImageUrlField
          name="image"
          label="Image"
          defaultValue={product.image}
        />
      </div>
      <Textarea
        name="features"
        label="Features (one per line)"
        rows={4}
        defaultValue={product.features.join("\n")}
      />
      <Input
        name="stock"
        label="Stock"
        type="number"
        min={0}
        step={1}
        defaultValue={product.stock}
        required
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          value="true"
          id={activeId}
          defaultChecked={product.active}
        />
        <span>Visible on store</span>
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
