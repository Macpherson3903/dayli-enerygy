import { clsx } from "clsx";
import type {
  InstallationBookingStatus,
  OrderStatus,
  ProductAgentInquiryStatus,
} from "@/lib/types";
import {
  INSTALLATION_BOOKING_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  PRODUCT_AGENT_INQUIRY_STATUS_LABEL,
} from "@/lib/constants";

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

const installationStyle: Record<InstallationBookingStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  site_visit_scheduled: "bg-purple-100 text-purple-800",
  quoted: "bg-cyan-100 text-cyan-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  installed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
};

export function InstallationBookingStatusBadge({
  status,
}: {
  status: InstallationBookingStatus;
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        installationStyle[status]
      )}
    >
      {INSTALLATION_BOOKING_STATUS_LABEL[status]}
    </span>
  );
}

const inquiryStyle: Record<ProductAgentInquiryStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
};

export function ProductAgentInquiryStatusBadge({
  status,
}: {
  status: ProductAgentInquiryStatus;
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        inquiryStyle[status]
      )}
    >
      {PRODUCT_AGENT_INQUIRY_STATUS_LABEL[status]}
    </span>
  );
}
