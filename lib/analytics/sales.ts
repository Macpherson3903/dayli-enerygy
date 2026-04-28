import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/constants";
import type { OrderDoc, OrderStatus } from "@/lib/types";
import type { BreakdownPoint, MultiSeriesPoint } from "@/lib/analytics/types";

const DAY_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  day: "numeric",
});

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayLabel(day: string): string {
  return DAY_FORMATTER.format(new Date(`${day}T00:00:00.000Z`));
}

export type SalesChartMetrics = {
  ordersAndCustomersByDay: MultiSeriesPoint[];
  statusBreakdown: BreakdownPoint[];
};

export function buildSalesChartMetrics(orders: OrderDoc[]): SalesChartMetrics {
  const ordersByDay = new Map<string, number>();
  const customersSeenByDay = new Map<string, Set<string>>();

  for (const order of orders) {
    const key = dayKey(order.createdAt);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);

    const email = order.contact.email.trim().toLowerCase();
    const dayCustomers = customersSeenByDay.get(key) ?? new Set<string>();
    dayCustomers.add(email);
    customersSeenByDay.set(key, dayCustomers);
  }

  const days = Array.from(
    new Set([...ordersByDay.keys(), ...customersSeenByDay.keys()])
  ).sort((a, b) => a.localeCompare(b));

  const ordersAndCustomersByDay = days.map((day) => ({
    label: dayLabel(day),
    orders: ordersByDay.get(day) ?? 0,
    customers: customersSeenByDay.get(day)?.size ?? 0,
  }));

  const statusCounts: Record<OrderStatus, number> = {
    new: 0,
    contacted: 0,
    scheduled: 0,
    fulfilled: 0,
    cancelled: 0,
  };
  for (const order of orders) {
    statusCounts[order.status] += 1;
  }
  const statusBreakdown = ORDER_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABEL[status],
    value: statusCounts[status],
  }));

  return {
    ordersAndCustomersByDay,
    statusBreakdown,
  };
}
