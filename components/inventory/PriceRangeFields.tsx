import { Input } from "@/components/ui/Input";

export function PriceRangeFields({
  priceMin,
  priceMax,
}: {
  priceMin?: number;
  priceMax?: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        name="priceMin"
        label="Minimum price (₦)"
        type="number"
        min={0}
        step={1}
        required
        defaultValue={priceMin}
      />
      <Input
        name="priceMax"
        label="Maximum price (₦)"
        type="number"
        min={0}
        step={1}
        required
        defaultValue={priceMax}
      />
    </div>
  );
}
