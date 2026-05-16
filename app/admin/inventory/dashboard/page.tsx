import { getProductsAllForAdmin } from "@/lib/db/products";
import { InventoryDashboard } from "@/components/inventory/admin/InventoryDashboard";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function InventoryDashboardPage() {
  const products = await getProductsAllForAdmin();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory dashboard"
        description="Stock health and category breakdown from your catalog."
      />
      <InventoryDashboard products={products} />
    </div>
  );
}
