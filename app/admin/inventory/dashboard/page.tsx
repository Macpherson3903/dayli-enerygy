import { getInventoryCategories, getProductsAllForAdmin } from "@/lib/db/products";
import { InventoryDashboard } from "@/components/inventory/admin/InventoryDashboard";

export const dynamic = "force-dynamic";

export default async function InventoryDashboardPage() {
  const products = await getProductsAllForAdmin();
  const categories = await getInventoryCategories();
  return <InventoryDashboard products={products} categories={categories} />;
}
