import { listSizingCalculations } from "@/lib/db/sizing-calculations";
import { PageHeader } from "@/components/ui/PageHeader";
import { SavedSizingList } from "@/components/admin/SavedSizingList";

export const dynamic = "force-dynamic";

export default async function SavedSizingsPage() {
  const rows = await listSizingCalculations();
  return (
    <div>
      <PageHeader
        title="Saved calculations"
        description="Open a saved sizing to review load totals, the products you recommended, and print the customer document."
      />
      <SavedSizingList rows={rows} />
    </div>
  );
}
