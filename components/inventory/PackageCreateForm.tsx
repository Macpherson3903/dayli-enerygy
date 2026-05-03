"use client";

import { useActionState, useEffect } from "react";
import { createPackageAction } from "@/app/actions/packages";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUrlField } from "./ImageUrlField";
import { useStatusMessage } from "@/context/StatusMessageContext";

const initial: { error?: string; ok?: boolean } | undefined = undefined;

export function PackageCreateForm({
  categories,
}: {
  categories: string[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [state, formAction, pending] = useActionState(
    createPackageAction,
    initial
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Create package failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Package created successfully.", "success");
    }
  }, [state, showStatusMessage]);

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Add package</h2>
      {state?.error && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600 mb-2" role="status">
          Package created.
        </p>
      )}
      <form action={formAction} className="space-y-3">
        <Input name="name" label="Name" required />
        <div>
          <label
            htmlFor="pkg-category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Package category
          </label>
          <select
            id="pkg-category"
            name="category"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm capitalize"
            required
            defaultValue={categories[0] ?? "general"}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Input
          name="slug"
          label="URL slug (optional)"
          placeholder="auto-generated if empty"
        />
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
          label="Kit highlights (one per line)"
          rows={4}
          placeholder="One bullet per line"
        />
        <Textarea
          name="typicalAppliances"
          label="Typical home loads (one per line)"
          rows={5}
          required
          placeholder={"e.g. LED lighting\nSmall refrigerator"}
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" value="true" />
          <span>Featured on home page</span>
        </label>
        <input type="hidden" name="active" value="true" readOnly />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create package"}
        </Button>
      </form>
    </Card>
  );
}
