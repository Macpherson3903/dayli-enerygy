import Link from "next/link";
import { notFound } from "next/navigation";
import { getSizingCalculationById } from "@/lib/db/sizing-calculations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { SavedSizingPrintButton } from "@/components/admin/SavedSizingPrintButton";

export const dynamic = "force-dynamic";

function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export default async function SavedSizingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getSizingCalculationById(id);
  if (!row) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={row.sizingNumber}
        description={`${row.customerName} · ${row.createdAt.toLocaleString()}`}
        actions={<SavedSizingPrintButton />}
      />

      <div className="sizing-print-root space-y-6">
        <div className="hidden print:block">
          <p className="text-lg font-semibold text-gray-900">
            System sizing · {row.sizingNumber}
          </p>
          <p className="text-sm text-gray-600">
            {row.customerName} · {row.createdAt.toLocaleDateString()} ·{" "}
            {row.params.systemVoltage} V
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="min-w-full border-collapse border-2 border-gray-300 text-sm">
              <thead className="bg-gray-50 text-left text-gray-700">
                <tr>
                  <th className="border-2 border-gray-300 px-3 py-2">Appliance</th>
                  <th className="border-2 border-gray-300 px-3 py-2">Watts</th>
                  <th className="border-2 border-gray-300 px-3 py-2">Qty</th>
                  <th className="border-2 border-gray-300 px-3 py-2">H/day</th>
                  <th className="border-2 border-gray-300 px-3 py-2">Peak (W)</th>
                  <th className="border-2 border-gray-300 px-3 py-2">Daily (Wh)</th>
                </tr>
              </thead>
              <tbody>
                {row.appliances.map((a, i) => (
                  <tr key={`${a.name}-${i}`}>
                    <td className="border-2 border-gray-300 px-3 py-2">{a.name}</td>
                    <td className="border-2 border-gray-300 px-3 py-2">{a.watts}</td>
                    <td className="border-2 border-gray-300 px-3 py-2">{a.quantity}</td>
                    <td className="border-2 border-gray-300 px-3 py-2">{a.hoursPerDay}</td>
                    <td className="border-2 border-gray-300 px-3 py-2">
                      {formatNumber(a.peakLoad)}
                    </td>
                    <td className="border-2 border-gray-300 px-3 py-2">
                      {formatNumber(a.dailyEnergyWh)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={4} className="border-2 border-gray-300 px-3 py-2">
                    Totals
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2">
                    {formatNumber(row.totals.peakLoadW)} W
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2">
                    {formatNumber(row.totals.dailyEnergyWh)} Wh
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Inverter target"
            value={`${formatNumber(row.result.inverterKva, 2)} kVA`}
          />
          <Stat label="Solar array" value={`${formatNumber(row.result.arrayW)} W`} />
          <Stat
            label={`Battery at ${row.result.systemVoltage} V`}
            value={`${formatNumber(row.result.batteryAh)} Ah`}
          />
        </div>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-900">Recommended products</h2>
          {row.recommendations.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No products were added to this document. Open the sizing tool, click Recommend or add
              a manual product, then save again.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100" role="list">
              {row.recommendations.map((rec) => (
                <li key={rec.productId} className="py-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {rec.role}
                    {rec.source === "manual" ? " · manual" : ""}
                  </p>
                  <p className="font-medium text-gray-900">{rec.productName}</p>
                  <p className="text-sm text-gray-700">
                    Qty {rec.quantity} · {rec.unitLabel}
                  </p>
                  {rec.coverageLabel ? (
                    <p className="text-sm text-gray-600">{rec.coverageLabel}</p>
                  ) : null}
                  {rec.priceRange ? (
                    <p className="text-sm text-gray-600">{rec.priceRange}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="print:hidden">
        <Link
          href="/admin/sales/saved-sizings"
          className="text-sm text-brand-700 hover:underline"
        >
          Back to saved calculations
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
