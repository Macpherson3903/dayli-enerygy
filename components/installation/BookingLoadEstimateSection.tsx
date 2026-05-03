import { getBookingApplianceRowsFromBooking } from "@/lib/proposal-defaults";
import type { InstallationBookingDoc } from "@/lib/types";

/** Shared load estimate: table when rows exist, else plain-text summary (legacy). */
export function BookingLoadEstimateSection({
  booking,
  heading,
}: {
  booking: InstallationBookingDoc;
  heading: string;
}) {
  const rows = getBookingApplianceRowsFromBooking(booking);
  const totals =
    rows.length > 0
      ? {
          peakLoad: rows.reduce((s, r) => s + r.peakLoad, 0),
          dailyWh: rows.reduce((s, r) => s + r.dailyEnergyWh, 0),
        }
      : null;

  if (rows.length > 0 && totals) {
    return (
      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{heading}</p>
        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-white print:overflow-visible">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
              <tr>
                <th className="px-3 py-2">Appliance</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">H/day</th>
                <th className="px-3 py-2">Peak (W)</th>
                <th className="px-3 py-2">Daily (Wh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-gray-900">{row.name}</td>
                  <td className="px-3 py-2 text-gray-700">{row.quantity}</td>
                  <td className="px-3 py-2 text-gray-700">{row.hoursPerDay}</td>
                  <td className="px-3 py-2 text-gray-700">{row.peakLoad.toLocaleString()}</td>
                  <td className="px-3 py-2 text-gray-700">{row.dailyEnergyWh.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50/80">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-xs font-medium text-gray-600">
                  Totals
                </td>
                <td className="px-3 py-2 text-sm font-semibold text-gray-900">
                  {totals.peakLoad.toLocaleString()} W
                </td>
                <td className="px-3 py-2 text-sm font-semibold text-gray-900">
                  {totals.dailyWh.toLocaleString()} Wh
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  if (booking.details.quotationSummary) {
    return (
      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{heading}</p>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-sans text-sm text-gray-800 print:max-h-none print:overflow-visible">
          {booking.details.quotationSummary}
        </pre>
      </div>
    );
  }

  return null;
}
