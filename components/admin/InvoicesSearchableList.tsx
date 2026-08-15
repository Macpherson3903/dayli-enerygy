"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { matchesSearch } from "@/lib/admin/search";

export type InvoiceListRow = {
  id: string;
  workOrderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  grandTotalLabel: string;
  issuedAtLabel: string;
};

function rowMatches(query: string, row: InvoiceListRow): boolean {
  return matchesSearch(query, [
    row.workOrderNumber,
    row.customerName,
    row.customerPhone,
    row.customerEmail,
    row.city,
  ]);
}

export function InvoicesSearchableList({ rows }: { rows: InvoiceListRow[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => rows.filter((row) => rowMatches(search, row)),
    [rows, search]
  );

  return (
    <div className="space-y-4">
      <AdminSearchField
        label="Search invoices"
        value={search}
        onChange={setSearch}
        placeholder="Work order no., name, phone, or email…"
        hint={
          rows.length === 0
            ? undefined
            : `Showing ${filtered.length} of ${rows.length} invoice${rows.length === 1 ? "" : "s"}`
        }
      />
      <ul className="space-y-2" role="list">
        {filtered.length === 0 ? (
          <li>
            <Card className="py-8 text-center text-sm text-gray-600">
              {rows.length === 0
                ? "No invoices yet."
                : "No invoices match your search. Try another term."}
            </Card>
          </li>
        ) : (
          filtered.map((invoice) => (
            <li key={invoice.id}>
              <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{invoice.workOrderNumber}</p>
                  <p className="text-sm text-gray-600">
                    {invoice.customerName} · {invoice.customerPhone}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {invoice.city} · {invoice.issuedAtLabel} · {invoice.grandTotalLabel}
                  </p>
                </div>
                <Link
                  className="text-sm font-medium text-brand-700 hover:underline"
                  href={`/admin/sales/invoices/${invoice.id}`}
                >
                  Open
                </Link>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
