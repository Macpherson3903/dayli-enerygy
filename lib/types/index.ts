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

export type ProposalApprovalStatus = "none" | "draft" | "sent" | "approved" | "declined";

export type ProposalApplianceRow = {
  name: string;
  quantity: number;
  watts: number;
  peakLoad: number;
  hoursPerDay: number;
  dailyEnergyWh: number;
};

export type ProposalSystemSummaryRow = {
  parameter: string;
  value: string;
  units: string;
};

export type ProposalCostLine = {
  qty: string;
  item: string;
  amount: string;
  totalAmount: string;
};

export type ProposalPayload = {
  clientDetails: {
    name: string;
    location: string;
    phone: string;
    email: string;
    date: string;
  };
  systemOverview: {
    systemSizeKw: string;
    batteryKwh: string;
    batteryAh: string;
    inverterKva: string;
    backupHours: string;
  };
  appliances: ProposalApplianceRow[];
  systemSummary: ProposalSystemSummaryRow[];
  costLines: ProposalCostLine[];
  warranty: string;
  timeline: {
    delivery: string;
    installation: string;
    testing: string;
    total: string;
  };
  terms: string;
  paymentTerms: string;
};

export type ProposalApproval = {
  status: ProposalApprovalStatus;
  token: string | null;
  tokenExpiresAt: Date | null;
  sentAt: Date | null;
  approvedAt: Date | null;
  signerName: string | null;
  signerIp: string | null;
};

export type InstallationBookingProposal = {
  data: ProposalPayload;
  approval: ProposalApproval;
};

export type ProductCategory = "solar" | "inverter" | "battery" | "all";

export type ProductDoc = {
  _id: ObjectId;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  priceMin: number;
  priceMax: number;
  /** @deprecated Legacy single price — migrated to priceMin/priceMax on read. */
  price?: number;
  description: string;
  shortDescription?: string;
  image: string;
  features: string[];
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Curated bundle: marketing/spec appliances; sold as one cart line. */
export type PackageDoc = {
  _id: ObjectId;
  name: string;
  slug: string;
  /** Package taxonomy for storefront filters (e.g. residential, commercial). */
  category: string;
  priceMin: number;
  priceMax: number;
  /** @deprecated Legacy single price — migrated to priceMin/priceMax on read. */
  price?: number;
  description: string;
  shortDescription?: string;
  image: string;
  features: string[];
  /** Marketing bullets, e.g. “Fridge”, “LED lighting”. */
  typicalAppliances: string[];
  stock: number;
  active: boolean;
  featured: boolean;
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

/** Site /contact form submission (persisted, then emails sent). */
export type ContactMessageStatus = "new" | "in_progress" | "resolved";

export type ContactMessageDoc = {
  _id: ObjectId;
  messageNumber: string;
  status: ContactMessageStatus;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  /** Set after send attempt (for ops / future retry tooling). */
  staffEmailSent?: boolean;
  customerEmailSent?: boolean;
  internalNotes: string;
  /** Optional client IP for abuse review */
  sourceIp?: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Sales follow-up for “Talk to an agent” product inquiries. */
export type ProductAgentInquiryStatus = "new" | "in_progress" | "resolved";

export type ProductAgentInquiryDoc = {
  _id: ObjectId;
  inquiryNumber: string;
  status: ProductAgentInquiryStatus;
  name: string;
  email: string;
  phone?: string;
  message: string;
  productId: string;
  productName: string;
  productSlug: string;
  internalNotes: string;
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
    /** Plain-text load estimate from the on-site quotation calculator. */
    quotationSummary?: string;
    /** Structured appliance rows when the client applied an estimate from the calculator. */
    quotationAppliances?: ProposalApplianceRow[];
    referredBy?: string;
    hearAboutUs?: string;
  };
  consent: true;
  status: InstallationBookingStatus;
  internalNotes: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Installation proposal (admin-filled; client approves via token link). */
  proposal?: InstallationBookingProposal;
};

export type ProductPublic = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand?: string;
  priceMin: number;
  priceMax: number;
  description: string;
  shortDescription?: string;
  image: string;
  features: string[];
  stock: number;
  /** Set when this row is a package (shop + PDP). */
  itemKind?: "product" | "package";
  typicalAppliances?: string[];
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

/** Local copy of a Clerk user for inspection in MongoDB. */
export type UserDoc = {
  _id: ObjectId;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  lastSignInAt: Date | null;
  /** Clerk account created time. */
  createdAt: Date;
  updatedAt: Date;
};

export type SizingRecommendationSnapshot = {
  role: "panels" | "inverter" | "batteries";
  source?: "catalog" | "manual";
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitLabel: string;
  coverageLabel: string;
  priceRange: string;
  note?: string;
};

export type SizingCalculationDoc = {
  _id: ObjectId;
  sizingNumber: string;
  customerName: string;
  createdByUserId: string;
  appliances: ProposalApplianceRow[];
  params: {
    systemVoltage: 12 | 24 | 48;
    peakSunHours: number;
    systemEfficiency: number;
    inverterOversize: number;
    daysOfAutonomy: number;
    depthOfDischarge: number;
  };
  totals: {
    peakLoadW: number;
    dailyEnergyWh: number;
  };
  result: {
    inverterW: number;
    inverterKva: number;
    arrayW: number;
    batteryWh: number;
    batteryAh: number;
    systemVoltage: 12 | 24 | 48;
  };
  recommendations: SizingRecommendationSnapshot[];
  createdAt: Date;
  updatedAt: Date;
};

export type QuotationApplianceSheetDoc = {
  _id: ObjectId;
  slug: string;
  name: string;
  watts: number;
  defaultHoursPerDay: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type InvoiceLineItem = {
  catalogItemId: string | null;
  catalogKind: "product" | "package" | null;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

export type InvoiceDoc = {
  _id: ObjectId;
  workOrderNumber: string;
  issuedAt: Date;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  lineItems: InvoiceLineItem[];
  labour: number;
  transportation: number;
  discount: number;
  vatPercent: number;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  paymentTerms: string;
  warranty: string;
  validity: string;
  accountNumber: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};
