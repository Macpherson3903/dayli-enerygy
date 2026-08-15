"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { AdminSearchField } from "@/components/admin/AdminSearchField";
import { OrderStatusBadge } from "@/components/ui/StatusBadge";
import { matchesSearch } from "@/lib/admin/search";
import type { OrderStatus } from "@/lib/types";

export type OrderListRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  lineCount: number;
  createdAtLabel: string;
  status: OrderStatus;
};

function rowMatches(query: string, row: OrderListRow): boolean {
  return matchesSearch(query, [
    row.orderNumber,
    row.customerName,
    row.customerEmail,
    row.customerPhone,
  ]);
}

export function OrdersSearchableList({ rows }: { rows: OrderListRow[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => rows.filter((row) => rowMatches(search, row)),
    [rows, search]
  );

  return (
    <div className="space-y-4">
      <AdminSearchField
        label="Search orders"
        value={search}
        onChange={setSearch}
        placeholder="Order number, name, email, or phone…"
        hint={
          rows.length === 0
            ? undefined
            : `Showing ${filtered.length} of ${rows.length} order${rows.length === 1 ? "" : "s"}`
        }
      />
      <ul className="space-y-2" role="list">
        {filtered.length === 0 ? (
          <li>
            <Card className="py-8 text-center text-sm text-gray-600">
              {rows.length === 0
                ? "No orders yet."
                : "No orders match your search. Try another term."}
            </Card>
          </li>
        ) : (
          filtered.map((order) => (
            <li key={order.id}>
              <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">
                    {order.customerName} · {order.customerEmail}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.lineCount} line(s) · {order.createdAtLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <Link
                    className="text-sm font-medium text-brand-700 hover:underline"
                    href={`/admin/sales/orders/${order.id}`}
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
