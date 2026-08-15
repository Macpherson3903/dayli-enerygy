export type InvoiceMoneyInputs = {
  lineItems: { quantity: number; unitCost: number }[];
  labour: number;
  transportation: number;
  discount: number;
  vatPercent: number;
};

export type InvoiceMoneyTotals = {
  lineTotals: number[];
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
};

function money(n: number): number {
  const v = Number.isFinite(n) ? n : 0;
  return Math.round(v * 100) / 100;
}

export function computeInvoiceTotals(input: InvoiceMoneyInputs): InvoiceMoneyTotals {
  const lineTotals = input.lineItems.map((row) =>
    money(row.quantity * row.unitCost)
  );
  const subtotal = money(lineTotals.reduce((sum, n) => sum + n, 0));
  const labour = money(input.labour);
  const transportation = money(input.transportation);
  const discount = money(input.discount);
  const taxable = Math.max(0, money(subtotal + labour + transportation - discount));
  const vatAmount = money((taxable * money(input.vatPercent)) / 100);
  const grandTotal = money(taxable + vatAmount);
  return { lineTotals, subtotal, vatAmount, grandTotal };
}
