"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { createInvoiceAction } from "@/app/actions/invoices";
import { matchesSearch } from "@/lib/admin/search";
import {
  DEFAULT_INVOICE_PAYMENT_TERMS,
  DEFAULT_INVOICE_VALIDITY,
  DEFAULT_INVOICE_VAT_PERCENT,
  DEFAULT_INVOICE_WARRANTY,
} from "@/lib/constants";
import { computeInvoiceTotals } from "@/lib/invoice-totals";
import { formatNaira, formatPriceRange } from "@/lib/pricing";

export type InvoiceCatalogPick = {
  id: string;
  kind: "product" | "package";
  name: string;
  category: string;
  priceMin: number;
  priceMax: number;
};

type LineDraft = {
  key: string;
  catalogItemId: string | null;
  catalogKind: "product" | "package" | null;
  description: string;
  quantity: number;
  unitCost: number;
};

function todayInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function newLine(): LineDraft {
  return {
    key: crypto.randomUUID(),
    catalogItemId: null,
    catalogKind: null,
    description: "",
    quantity: 1,
    unitCost: 0,
  };
}

function parseMoney(raw: string): number {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export function InvoiceForm({ catalog }: { catalog: InvoiceCatalogPick[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState(todayInputValue);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [lines, setLines] = useState<LineDraft[]>([newLine()]);
  const [labour, setLabour] = useState(0);
  const [transportation, setTransportation] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [vatPercent, setVatPercent] = useState(DEFAULT_INVOICE_VAT_PERCENT);
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_INVOICE_PAYMENT_TERMS);
  const [warranty, setWarranty] = useState(DEFAULT_INVOICE_WARRANTY);
  const [validity, setValidity] = useState(DEFAULT_INVOICE_VALIDITY);
  const [accountNumber, setAccountNumber] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [activeLineKey, setActiveLineKey] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      computeInvoiceTotals({
        lineItems: lines,
        labour,
        transportation,
        discount,
        vatPercent,
      }),
    [lines, labour, transportation, discount, vatPercent]
  );

  const catalogHits = useMemo(() => {
    if (!itemSearch.trim()) return catalog.slice(0, 8);
    return catalog
      .filter((item) =>
        matchesSearch(itemSearch, [item.name, item.category, item.kind])
      )
      .slice(0, 12);
  }, [catalog, itemSearch]);

  function updateLine(key: string, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addCatalogItem(item: InvoiceCatalogPick) {
    const targetKey = activeLineKey ?? lines[0]?.key;
    const next = {
      catalogItemId: item.id,
      catalogKind: item.kind,
      description: item.name,
      unitCost: item.priceMin,
    };
    if (targetKey) {
      updateLine(targetKey, next);
    } else {
      setLines([{ ...newLine(), ...next }]);
    }
    setItemSearch("");
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createInvoiceAction({
        issuedAt,
        customer,
        lineItems: lines.map((row) => ({
          catalogItemId: row.catalogItemId,
          catalogKind: row.catalogKind,
          description: row.description,
          quantity: row.quantity,
          unitCost: row.unitCost,
        })),
        labour,
        transportation,
        discount,
        vatPercent,
        paymentTerms,
        warranty,
        validity,
        accountNumber,
      });
      if (result.error || !result.id) {
        setError(result.error ?? "Could not save invoice");
        return;
      }
      router.push(`/admin/sales/invoices/${result.id}`);
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            name="issuedAt"
            type="date"
            required
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
          />
          <Input
            label="Customer name"
            name="customerName"
            required
            value={customer.name}
            onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
          />
          <Input
            label="Phone"
            name="phone"
            required
            value={customer.phone}
            onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={customer.email}
            onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
          />
          <Input
            label="Address"
            name="address"
            required
            value={customer.address}
            onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
          />
          <Input
            label="City"
            name="city"
            required
            value={customer.city}
            onChange={(e) => setCustomer((c) => ({ ...c, city: e.target.value }))}
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Line items</h2>
        <AdminSearchField
          label="Search catalog to add an item"
          value={itemSearch}
          onChange={setItemSearch}
          placeholder="Product or package name…"
          hint="Select a row below to fill the highlighted line, or type a custom description."
        />
        {catalogHits.length > 0 ? (
          <ul className="max-h-48 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-200">
            {catalogHits.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => addCatalogItem(item)}
                >
                  <span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="ml-2 text-xs capitalize text-gray-500">
                      {item.kind} · {item.category}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-600">
                    {formatPriceRange({
                      priceMin: item.priceMin,
                      priceMax: item.priceMax,
                    })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No catalog items match that search.</p>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="py-2 pr-2 font-medium">S/N</th>
                <th className="py-2 pr-2 font-medium">Description of item</th>
                <th className="py-2 pr-2 font-medium">Qty</th>
                <th className="py-2 pr-2 font-medium">Unit cost</th>
                <th className="py-2 pr-2 font-medium">Total</th>
                <th className="py-2 font-medium">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((row, index) => (
                <tr
                  key={row.key}
                  className={
                    activeLineKey === row.key ? "bg-brand-50/60" : undefined
                  }
                >
                  <td className="py-2 pr-2 align-top text-gray-500">{index + 1}</td>
                  <td className="py-2 pr-2">
                    <input
                      className="w-full min-w-[12rem] rounded-lg border border-gray-300 px-2 py-1.5"
                      value={row.description}
                      onFocus={() => setActiveLineKey(row.key)}
                      onChange={(e) =>
                        updateLine(row.key, {
                          description: e.target.value,
                          catalogItemId: null,
                          catalogKind: null,
                        })
                      }
                      required
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0.01}
                      step="any"
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1.5"
                      value={row.quantity}
                      onFocus={() => setActiveLineKey(row.key)}
                      onChange={(e) =>
                        updateLine(row.key, { quantity: parseMoney(e.target.value) })
                      }
                      required
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="w-28 rounded-lg border border-gray-300 px-2 py-1.5"
                      value={row.unitCost}
                      onFocus={() => setActiveLineKey(row.key)}
                      onChange={(e) =>
                        updateLine(row.key, { unitCost: parseMoney(e.target.value) })
                      }
                      required
                    />
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {formatNaira(totals.lineTotals[index] ?? 0)}
                  </td>
                  <td className="py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-700"
                      disabled={lines.length === 1}
                      onClick={() =>
                        setLines((prev) => prev.filter((r) => r.key !== row.key))
                      }
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1"
          onClick={() => {
            const row = newLine();
            setLines((prev) => [...prev, row]);
            setActiveLineKey(row.key);
          }}
        >
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Terms</h2>
          <Textarea
            label="Payment terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
          />
          <Textarea
            label="Warranty"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
          />
          <Input
            label="Validity"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
          />
          <Input
            label="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Company bank account"
          />
        </Card>
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Totals</h2>
          <Input
            label="Labour / installation"
            type="number"
            min={0}
            step="any"
            value={labour}
            onChange={(e) => setLabour(parseMoney(e.target.value))}
          />
          <Input
            label="Transportation"
            type="number"
            min={0}
            step="any"
            value={transportation}
            onChange={(e) => setTransportation(parseMoney(e.target.value))}
          />
          <Input
            label="Discount"
            type="number"
            min={0}
            step="any"
            value={discount}
            onChange={(e) => setDiscount(parseMoney(e.target.value))}
          />
          <Input
            label="VAT %"
            type="number"
            min={0}
            max={100}
            step="any"
            value={vatPercent}
            onChange={(e) => setVatPercent(parseMoney(e.target.value))}
          />
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd>{formatNaira(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">VAT</dt>
              <dd>{formatNaira(totals.vatAmount)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-gray-900">
              <dt>Grand total</dt>
              <dd>{formatNaira(totals.grandTotal)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" pending={pending}>
        Save invoice
      </Button>
    </form>
  );
}
