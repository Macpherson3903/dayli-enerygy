import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { SizingCalculationDoc } from "@/lib/types";

export function SavedSizingList({ rows }: { rows: SizingCalculationDoc[] }) {
  return (
    <div className="print:hidden no-print space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Saved calculations</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No saved sizings yet.</p>
      ) : (
        <ul className="space-y-2" role="list">
          {rows.map((row) => (
            <li key={row._id.toString()}>
              <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">{row.sizingNumber}</p>
                  <p className="text-sm text-gray-600">
                    {row.customerName} · {row.params.systemVoltage} V ·{" "}
                    {row.totals.peakLoadW.toLocaleString()} W peak ·{" "}
                    {row.createdAt.toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/admin/sales/saved-sizings/${row._id.toString()}`}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  View
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
