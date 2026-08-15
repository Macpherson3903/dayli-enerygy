import { BUSINESS_ADDRESS_DISPLAY, WHATSAPP_DISPLAY } from "@/lib/content/business";
import { formatNaira } from "@/lib/pricing";
import type { InvoiceDoc } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function invoiceEmailText(invoice: InvoiceDoc, appUrl: string): string {
  const lines = [
    `Work order / sales & installation order ${invoice.workOrderNumber}`,
    `Date: ${invoice.issuedAt.toLocaleDateString()}`,
    "",
    `Customer: ${invoice.customer.name}`,
    `Phone: ${invoice.customer.phone}`,
    `Email: ${invoice.customer.email}`,
    `Address: ${invoice.customer.address}, ${invoice.customer.city}`,
    "",
    "Items:",
    ...invoice.lineItems.map(
      (row, i) =>
        `${i + 1}. ${row.description} — qty ${row.quantity} × ${formatNaira(row.unitCost)} = ${formatNaira(row.totalCost)}`
    ),
    "",
    `Subtotal: ${formatNaira(invoice.subtotal)}`,
    `Labour / installation: ${formatNaira(invoice.labour)}`,
    `Transportation: ${formatNaira(invoice.transportation)}`,
    `Discount: ${formatNaira(invoice.discount)}`,
    `VAT (${invoice.vatPercent}%): ${formatNaira(invoice.vatAmount)}`,
    `Grand total: ${formatNaira(invoice.grandTotal)}`,
    "",
    `Payment terms: ${invoice.paymentTerms}`,
    `Warranty: ${invoice.warranty}`,
    `Validity: ${invoice.validity}`,
    ...(invoice.accountNumber ? [`Account #: ${invoice.accountNumber}`] : []),
    "",
    "DAYLI ENERGY SOLUTIONS Ltd",
    BUSINESS_ADDRESS_DISPLAY,
    `${WHATSAPP_DISPLAY} · support@daylienergy.com`,
    appUrl,
  ];
  return lines.join("\n");
}

export function invoiceEmailHtml(invoice: InvoiceDoc, appUrl: string): string {
  const itemRows = invoice.lineItems
    .map(
      (row, i) => `<tr>
        <td style="border:1px solid #d1d5db;padding:8px">${i + 1}</td>
        <td style="border:1px solid #d1d5db;padding:8px">${escapeHtml(row.description)}</td>
        <td style="border:1px solid #d1d5db;padding:8px;text-align:right">${row.quantity}</td>
        <td style="border:1px solid #d1d5db;padding:8px;text-align:right">${escapeHtml(formatNaira(row.unitCost))}</td>
        <td style="border:1px solid #d1d5db;padding:8px;text-align:right">${escapeHtml(formatNaira(row.totalCost))}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
  <p style="font-weight:bold">DAYLI ENERGY SOLUTIONS Ltd</p>
  <p style="font-size:13px;color:#4b5563">${escapeHtml(BUSINESS_ADDRESS_DISPLAY)}<br/>
  ${escapeHtml(WHATSAPP_DISPLAY)} · support@daylienergy.com · www.daylienergy.com</p>
  <h2>Work order / sales &amp; installation order ${escapeHtml(invoice.workOrderNumber)}</h2>
  <p>Date: ${escapeHtml(invoice.issuedAt.toLocaleDateString())}</p>
  <p>
    <strong>Customer:</strong> ${escapeHtml(invoice.customer.name)}<br/>
    <strong>Phone:</strong> ${escapeHtml(invoice.customer.phone)}<br/>
    <strong>Email:</strong> ${escapeHtml(invoice.customer.email)}<br/>
    <strong>Address:</strong> ${escapeHtml(`${invoice.customer.address}, ${invoice.customer.city}`)}
  </p>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    <thead>
      <tr>
        <th style="border:1px solid #d1d5db;padding:8px;text-align:left">S/N</th>
        <th style="border:1px solid #d1d5db;padding:8px;text-align:left">Description of item</th>
        <th style="border:1px solid #d1d5db;padding:8px;text-align:right">Qty</th>
        <th style="border:1px solid #d1d5db;padding:8px;text-align:right">Unit cost</th>
        <th style="border:1px solid #d1d5db;padding:8px;text-align:right">Total cost</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>
  <p>
    Subtotal: ${escapeHtml(formatNaira(invoice.subtotal))}<br/>
    Labour / installation: ${escapeHtml(formatNaira(invoice.labour))}<br/>
    Transportation: ${escapeHtml(formatNaira(invoice.transportation))}<br/>
    Discount: −${escapeHtml(formatNaira(invoice.discount))}<br/>
    VAT (${invoice.vatPercent}%): ${escapeHtml(formatNaira(invoice.vatAmount))}<br/>
    <strong>Grand total: ${escapeHtml(formatNaira(invoice.grandTotal))}</strong>
  </p>
  <p>
    <strong>Payment terms:</strong> ${escapeHtml(invoice.paymentTerms)}<br/>
    <strong>Warranty:</strong> ${escapeHtml(invoice.warranty)}<br/>
    <strong>Validity:</strong> ${escapeHtml(invoice.validity)}
    ${invoice.accountNumber ? `<br/><strong>Account #:</strong> ${escapeHtml(invoice.accountNumber)}` : ""}
  </p>
  <p style="font-size:13px;color:#4b5563">— Dayli Energy Solutions<br/>${escapeHtml(appUrl)}</p>
</body>
</html>`;
}
