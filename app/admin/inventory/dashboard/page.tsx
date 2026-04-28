import { getProductsAllForAdmin } from "@/lib/db/products";
import { InventoryDashboard } from "@/components/inventory/admin/InventoryDashboard";

export const dynamic = "force-dynamic";

export default async function InventoryDashboardPage() {
  const products = await getProductsAllForAdmin();
  return <InventoryDashboard products={products} />;
}
