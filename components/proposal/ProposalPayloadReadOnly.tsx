import type { ProposalPayload } from "@/lib/types";

/** Read-only proposal document (shared: public proposal page + admin print). */
export function ProposalPayloadReadOnly({ data }: { data: ProposalPayload }) {
  return (
    <div className="space-y-8 text-gray-900 print:space-y-6">
      <section className="print:break-inside-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Client details
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium">{data.clientDetails.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{data.clientDetails.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd>{data.clientDetails.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Location</dt>
            <dd>{data.clientDetails.location || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">Date</dt>
            <dd>{data.clientDetails.date || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="print:break-inside-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          System overview
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-gray-500">System size (kW)</dt>
            <dd>{data.systemOverview.systemSizeKw || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Battery (kWh)</dt>
            <dd>{data.systemOverview.batteryKwh || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Battery (Ah)</dt>
            <dd>{data.systemOverview.batteryAh || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Inverter (kVA)</dt>
            <dd>{data.systemOverview.inverterKva || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Backup hours</dt>
            <dd>{data.systemOverview.backupHours || "—"}</dd>
          </div>
        </dl>
      </section>

      {data.appliances.length > 0 ? (
        <section className="print:break-inside-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Appliances / load
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 print:overflow-visible print:border-gray-400">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 print:bg-gray-100">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">H/day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.appliances.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.quantity}</td>
                    <td className="px-3 py-2">{row.hoursPerDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {data.systemSummary.length > 0 ? (
        <section className="print:break-inside-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            System summary
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 print:overflow-visible print:border-gray-400">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 print:bg-gray-100">
                <tr>
                  <th className="px-3 py-2">Parameter</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.systemSummary.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{row.parameter}</td>
                    <td className="px-3 py-2">{row.value}</td>
                    <td className="px-3 py-2">{row.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {data.costLines.length > 0 ? (
        <section className="print:break-inside-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cost</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 print:overflow-visible print:border-gray-400">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 print:bg-gray-100">
                <tr>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.costLines.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{row.qty}</td>
                    <td className="px-3 py-2">{row.item}</td>
                    <td className="px-3 py-2">{row.amount}</td>
                    <td className="px-3 py-2">{row.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {data.warranty.trim() ? (
        <section className="print:break-inside-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Warranty
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm text-gray-800">{data.warranty}</p>
        </section>
      ) : null}

      <section className="print:break-inside-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Timeline
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Delivery</dt>
            <dd>{data.timeline.delivery || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Installation</dt>
            <dd>{data.timeline.installation || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Testing</dt>
            <dd>{data.timeline.testing || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Total</dt>
            <dd>{data.timeline.total || "—"}</dd>
          </div>
        </dl>
      </section>

      {data.terms.trim() ? (
        <section className="print:break-inside-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Terms</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-gray-800">{data.terms}</p>
        </section>
      ) : null}

      {data.paymentTerms.trim() ? (
        <section className="print:break-inside-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payment terms
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm text-gray-800">{data.paymentTerms}</p>
        </section>
      ) : null}
    </div>
  );
}
