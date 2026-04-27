import { clsx } from "clsx";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/constants";

const style: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  scheduled: "bg-purple-100 text-purple-800",
  fulfilled: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        style[status]
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
