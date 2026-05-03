import Link from "next/link";
import { getPackagesAllForAdmin } from "@/lib/db/packages";
import { PackagesOverviewTable } from "@/components/inventory/admin/PackagesOverviewTable";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function InventoryPackagesPage() {
  const packages = await getPackagesAllForAdmin();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description="Curated solar bundles with typical home load guidance. Shown on the order page and optional featured section on the home page."
      />
      <p>
        <Link
          href="/admin/inventory/packages/add"
          className="inline-flex text-sm font-medium text-brand-700 hover:underline"
        >
          Add package
        </Link>
      </p>
      <PackagesOverviewTable packages={packages} />
    </div>
  );
}
