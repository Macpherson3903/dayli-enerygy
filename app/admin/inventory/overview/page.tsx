import { getProductsAllForAdmin } from "@/lib/db/products";
import { InventoryOverviewTable } from "@/components/inventory/admin/InventoryOverviewTable";

export const dynamic = "force-dynamic";

export default async function InventoryOverviewPage() {
  const products = await getProductsAllForAdmin();
  return <InventoryOverviewTable products={products} />;
}
