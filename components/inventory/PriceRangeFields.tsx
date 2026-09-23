import { Input } from "@/components/ui/Input";

export function PriceFields({
  price,
  promoPrice,
}: {
  price?: number;
  promoPrice?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        name="price"
        label="Price (₦)"
        type="number"
        min={0}
        step={1}
        required
        defaultValue={price}
      />
      <Input
        name="promoPrice"
        label="Promo price (₦, optional)"
        type="number"
        min={0}
        step={1}
        defaultValue={promoPrice ?? ""}
      />
    </div>
  );
}
