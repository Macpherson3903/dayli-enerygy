import { listQuotationAppliancesForAdmin } from "@/lib/db/quotation-appliances";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApplianceSheetEditor } from "@/components/admin/ApplianceSheetEditor";

export const dynamic = "force-dynamic";

export default async function ApplianceSheetPage() {
  const rows = await listQuotationAppliancesForAdmin();
  return (
    <div>
      <PageHeader
        title="Appliance sheet"
        description="Edit the shared load-calculator list. Changes apply to system sizing and the public quotation page."
      />
      <ApplianceSheetEditor rows={rows} />
    </div>
  );
}
