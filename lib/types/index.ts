import type { ObjectId } from "mongodb";

export type AppRole = "customer" | "sales_admin" | "inventory_admin";

export type OrderStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "fulfilled"
  | "cancelled";

export type InstallationBookingStatus =
  | "new"
  | "contacted"
  | "site_visit_scheduled"
  | "quoted"
  | "confirmed"
  | "installed"
  | "cancelled";

export type ProductCategory = "solar" | "inverter" | "battery" | "all";

export type ProductDoc = {
  _id: ObjectId;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  price: number;
  description: string;
  shortDescription?: string;
  image: string;
  features: string[];
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LineItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type OrderDoc = {
  _id: ObjectId;
  orderNumber: string;
  lineItems: LineItem[];
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    preferredTime?: string;
  };
  status: OrderStatus;
  internalNotes: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InstallationBookingDoc = {
  _id: ObjectId;
  bookingNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  site: {
    address: string;
    city: string;
    state: string;
    propertyType: "residential" | "commercial";
    roofType: "pitched" | "flat" | "mixed" | "unknown";
  };
  schedule: {
    preferredDate: string;
    preferredTime: "morning" | "afternoon" | "evening" | "flexible";
  };
  details: {
    electricityBillRange: "lt50k" | "50k-100k" | "100k-250k" | "gt250k" | "unknown";
    message?: string;
  };
  consent: true;
  status: InstallationBookingStatus;
  internalNotes: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductPublic = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  price: number;
  description: string;
  shortDescription?: string;
  image: string;
  features: string[];
  stock: number;
};

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxStock: number;
};

export type CartDoc = {
  _id: ObjectId;
  userId: string;
  lines: CartLine[];
  createdAt: Date;
  updatedAt: Date;
};
