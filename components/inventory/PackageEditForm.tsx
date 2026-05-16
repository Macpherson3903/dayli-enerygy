"use client";

import { useActionState, useEffect, useId } from "react";
import { updatePackageAction } from "@/app/actions/packages";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUrlField } from "./ImageUrlField";
import { PriceRangeFields } from "./PriceRangeFields";
import { useStatusMessage } from "@/context/StatusMessageContext";

const initial: { error?: string; ok?: boolean } | undefined = undefined;

export function PackageEditForm({
  packageId,
  pkg,
  categories,
}: {
  packageId: string;
  categories: string[];
  pkg: {
    name: string;
    slug: string;
    category: string;
    priceMin: number;
    priceMax: number;
    description: string;
    shortDescription?: string;
    image: string;
    features: string[];
    typicalAppliances: string[];
    stock: number;
    active: boolean;
    featured: boolean;
  };
}) {
  const { showStatusMessage } = useStatusMessage();
  const [state, formAction, pending] = useActionState(
    (prev: typeof initial, formData: FormData) =>
      updatePackageAction(packageId, prev, formData),
    initial
  );
  const activeId = useId();
  const featuredId = useId();

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Save failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Package updated successfully.", "success");
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
      <Input name="name" label="Name" defaultValue={pkg.name} required />
      <div>
        <label
          htmlFor="pkg-edit-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Package category
        </label>
        <select
          id="pkg-edit-category"
          name="category"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm capitalize"
          required
          defaultValue={pkg.category}
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
        label="URL slug"
        defaultValue={pkg.slug}
        required
        pattern="[a-z0-9]+(-[a-z0-9]+)*"
      />
      <PriceRangeFields priceMin={pkg.priceMin} priceMax={pkg.priceMax} />
      <Textarea
        name="description"
        label="Description"
        required
        rows={4}
        defaultValue={pkg.description}
      />
      <Textarea
        name="shortDescription"
        label="Short description (optional)"
        rows={2}
        defaultValue={pkg.shortDescription ?? ""}
      />
      <div key={packageId + pkg.image}>
        <ImageUrlField name="image" label="Image" defaultValue={pkg.image} />
      </div>
      <Textarea
        name="features"
        label="Kit highlights (one per line)"
        rows={4}
        defaultValue={pkg.features.join("\n")}
      />
      <Textarea
        name="typicalAppliances"
        label="Typical home loads (one per line)"
        rows={5}
        required
        defaultValue={pkg.typicalAppliances.join("\n")}
      />
      <Input
        name="stock"
        label="Stock"
        type="number"
        min={0}
        step={1}
        defaultValue={pkg.stock}
        required
      />
      <label
        className="flex items-center gap-2 text-sm"
        htmlFor={featuredId}
      >
        <input
          type="checkbox"
          name="featured"
          value="true"
          id={featuredId}
          defaultChecked={pkg.featured}
        />
        Featured on home page
      </label>
      <label className="flex items-center gap-2 text-sm" htmlFor={activeId}>
        <input
          type="checkbox"
          name="active"
          value="true"
          id={activeId}
          defaultChecked={pkg.active}
        />
        Visible on store
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
