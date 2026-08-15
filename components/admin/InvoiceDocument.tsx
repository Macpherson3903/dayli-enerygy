import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { BUSINESS_ADDRESS_DISPLAY, WHATSAPP_DISPLAY } from "@/lib/content/business";
import { formatNaira } from "@/lib/pricing";
import type { InvoiceDoc } from "@/lib/types";

export function InvoiceDocument({ invoice }: { invoice: InvoiceDoc }) {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Image
            src="/logo.png"
            alt="Dayli Energy Solutions Ltd"
            width={180}
            height={48}
            className="h-12 w-auto object-contain"
          />
          <div>
            <p className="font-semibold text-gray-900">DAYLI ENERGY SOLUTIONS Ltd</p>
            <p className="max-w-md text-xs text-gray-600">{BUSINESS_ADDRESS_DISPLAY}</p>
            <p className="text-xs text-gray-600">
              {WHATSAPP_DISPLAY} · support@daylienergy.com · www.daylienergy.com
            </p>
          </div>
        </div>
        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Work order / sales &amp; installation order
          </p>
          <p className="font-medium">No. {invoice.workOrderNumber}</p>
          <p className="text-gray-600">{invoice.issuedAt.toLocaleDateString()}</p>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Customer name</dt>
          <dd className="font-medium">{invoice.customer.name}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd>{invoice.customer.phone}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Email</dt>
          <dd>{invoice.customer.email}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Address</dt>
          <dd>
            {invoice.customer.address}, {invoice.customer.city}
          </dd>
        </div>
      </dl>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left">S/N</th>
              <th className="border border-gray-300 px-3 py-2 text-left">
                Description of item
              </th>
              <th className="border border-gray-300 px-3 py-2 text-right">Qty</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Unit cost</th>
              <th className="border border-gray-300 px-3 py-2 text-right">Total cost</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((row, i) => (
              <tr key={`${row.description}-${i}`}>
                <td className="border border-gray-300 px-3 py-2">{i + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{row.description}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {row.quantity}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatNaira(row.unitCost)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {formatNaira(row.totalCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Payment terms:</span> {invoice.paymentTerms}
          </p>
          <p>
            <span className="font-medium">Warranty:</span> {invoice.warranty}
          </p>
          <p>
            <span className="font-medium">Validity:</span> {invoice.validity}
          </p>
          {invoice.accountNumber ? (
            <p>
              <span className="font-medium">Account #:</span> {invoice.accountNumber}
            </p>
          ) : null}
          <div className="mt-8 grid grid-cols-2 gap-6 text-xs text-gray-600">
            <p className="border-t border-gray-400 pt-2">Manager signature</p>
            <p className="border-t border-gray-400 pt-2">Customer signature</p>
          </div>
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatNaira(invoice.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Labour / installation</dt>
            <dd>{formatNaira(invoice.labour)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Transportation</dt>
            <dd>{formatNaira(invoice.transportation)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Discount</dt>
            <dd>−{formatNaira(invoice.discount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>VAT ({invoice.vatPercent}%)</dt>
            <dd>{formatNaira(invoice.vatAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
            <dt>Grand total</dt>
            <dd>{formatNaira(invoice.grandTotal)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
