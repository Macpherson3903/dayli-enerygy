import nodemailer from "nodemailer";

/** Canonical SMTP_* vars; HOSTINGER_SMTP_* kept as legacy aliases. */
function getResolvedSmtpHost(): string {
  return (
    process.env.SMTP_HOST?.trim() ||
    process.env.HOSTINGER_SMTP_HOST?.trim() ||
    ""
  );
}

function getResolvedSmtpPort(): number {
  const raw =
    process.env.SMTP_PORT?.trim() ||
    process.env.HOSTINGER_SMTP_PORT?.trim() ||
    "587";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 587;
}

function getResolvedSmtpUser(): string {
  return (
    process.env.SMTP_USER?.trim() ||
    process.env.HOSTINGER_SMTP_USER?.trim() ||
    ""
  );
}

function getResolvedSmtpPass(): string {
  return (
    process.env.SMTP_PASS?.trim() ||
    process.env.HOSTINGER_SMTP_PASS?.trim() ||
    ""
  );
}

/** If SMTP_SECURE or HOSTINGER_SMTP_SECURE is set, honor it; else 465 → true, else false. */
function getResolvedSmtpSecure(port: number): boolean {
  const smtp = process.env.SMTP_SECURE?.trim();
  if (smtp !== undefined && smtp !== "") {
    return smtp === "true";
  }
  const legacy = process.env.HOSTINGER_SMTP_SECURE?.trim();
  if (legacy !== undefined && legacy !== "") {
    return legacy === "true";
  }
  return port === 465;
}

function getMailFrom(): string {
  const explicit = process.env.EMAIL_FROM?.trim();
  if (explicit) return explicit;
  const user = getResolvedSmtpUser();
  return `Dayli Energy <${user || "noreply@example.com"}>`;
}

/** Staff inbox for new orders: ORDER_NOTIFY_EMAIL or SMTP login address. */
function getOrderNotifyTo(): string {
  return (
    process.env.ORDER_NOTIFY_EMAIL?.trim() || getResolvedSmtpUser() || ""
  );
}

function getInstallationNotifyTo(): string {
  const direct = process.env.INSTALLATION_NOTIFY_EMAIL?.trim();
  if (direct) return direct;
  return process.env.ORDER_NOTIFY_EMAIL?.trim() || getResolvedSmtpUser() || "";
}

function getContactNotifyTo(): string {
  const direct = process.env.CONTACT_NOTIFY_EMAIL?.trim();
  if (direct) return direct;
  return process.env.ORDER_NOTIFY_EMAIL?.trim() || getResolvedSmtpUser() || "";
}

function getTransporter() {
  const host = getResolvedSmtpHost();
  const user = getResolvedSmtpUser();
  const pass = getResolvedSmtpPass();
  if (!host || !user || !pass) {
    return null;
  }
  const port = getResolvedSmtpPort();
  const secure = getResolvedSmtpSecure(port);
  return nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 25_000,
    tls: {
      minVersion: "TLSv1.2",
    },
    auth: {
      user,
      pass,
    },
  });
}

/** Sends a site contact form message to operations. Returns false if misconfigured or send fails. */
export async function sendContactInquiryEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  appUrl: string;
  /** Optional reference shown in subject/body for threading */
  reference?: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  const to = getContactNotifyTo();
  if (!transporter || !to) {
    console.info(
      "[email] Contact inquiry skipped (SMTP not configured or no notify address — set SMTP_* and optionally CONTACT_NOTIFY_EMAIL / ORDER_NOTIFY_EMAIL)"
    );
    return false;
  }
  const refLine = payload.reference
    ? [`Reference: ${payload.reference}`, ""]
    : [];
  const text = [
    "New contact form message (saved in database before this email was sent)",
    "",
    ...refLine,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    ...(payload.phone ? [`Phone: ${payload.phone}`] : []),
    `Subject: ${payload.subject}`,
    "",
    payload.message,
    "",
    `— Submitted via ${payload.appUrl}/contact`,
  ].join("\n");
  const subj = payload.reference
    ? `[Contact ${payload.reference}] ${payload.subject}`
    : `[Contact] ${payload.subject}`;
  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [to],
      replyTo: payload.email,
      subject: subj,
      text,
    });
    return true;
  } catch (e) {
    console.error("[email] Contact inquiry failed to send", e);
    return false;
  }
}

/** Customer copy after /contact — acknowledges receipt and includes their message. */
export async function sendContactConfirmationToCustomer(payload: {
  to: string;
  name: string;
  subject: string;
  message: string;
  phone?: string;
  appUrl: string;
  reference?: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.info(
      "[email] Contact confirmation skipped (SMTP not configured — set SMTP_*)"
    );
    return false;
  }
  const refBlock = payload.reference
    ? [`Reference: ${payload.reference}`, ""]
    : [];
  const text = [
    `Hello ${payload.name},`,
    "",
    "Thank you for contacting Dayli Energy. We have received your message and will respond as soon as we can.",
    "",
    ...refBlock,
    "--- What you sent ---",
    `Subject: ${payload.subject}`,
    ...(payload.phone ? [`Phone: ${payload.phone}`] : []),
    "",
    payload.message,
    "",
    "If you need anything urgent, reply to this email or use the phone number on our website.",
    "",
    "— Dayli Energy Solutions",
    payload.appUrl,
  ].join("\n");
  const subj = payload.reference
    ? `We received your message — ${payload.reference}`
    : `We received your message — ${payload.subject}`;
  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [payload.to.trim()],
      subject: subj,
      text,
    });
    return true;
  } catch (e) {
    console.error("[email] Contact confirmation to customer failed", e);
    return false;
  }
}

/** Product page “Talk to an agent” — same notify inbox as contact (`CONTACT_NOTIFY_EMAIL` / fallbacks). */
export async function sendProductAgentInquiryEmail(payload: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  productName: string;
  productId: string;
  productSlug: string;
  appUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  const to = getContactNotifyTo();
  if (!transporter || !to) {
    console.info(
      "[email] Product agent inquiry skipped (SMTP not configured or no notify address — set SMTP_* and CONTACT_NOTIFY_EMAIL or ORDER_NOTIFY_EMAIL)"
    );
    return false;
  }
  const productUrl = `${payload.appUrl}/order/${encodeURIComponent(payload.productSlug)}`;
  const text = [
    "Talk to an agent — product inquiry",
    "",
    `Product: ${payload.productName}`,
    `Product ID: ${payload.productId}`,
    `Product page: ${productUrl}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    ...(payload.phone ? [`Phone: ${payload.phone}`] : []),
    "",
    "Message:",
    payload.message,
    "",
    `— Submitted via ${payload.appUrl}`,
  ].join("\n");
  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [to],
      replyTo: payload.email,
      subject: `[Agent inquiry] ${payload.productName}`,
      text,
    });
    return true;
  } catch {
    console.error("[email] Product agent inquiry failed to send");
    return false;
  }
}

/** Customer acknowledgment after “Talk to an agent” — we received your message and will follow up. */
export async function sendProductAgentInquiryConfirmationToCustomer(payload: {
  to: string;
  inquiryNumber: string;
  productName: string;
  appUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.info("[email] Agent inquiry confirmation skipped (SMTP not configured)");
    return false;
  }
  const text = [
    "Hello,",
    "",
    "Thank you for contacting Dayli Energy. We have received your message regarding:",
    "",
    `Product: ${payload.productName}`,
    `Reference: ${payload.inquiryNumber}`,
    "",
    "Our team will follow up with you shortly by email or phone.",
    "",
    "If you have any urgent questions, reply to this email or use the contact details on our website.",
    "",
    `— Dayli Energy Solutions`,
    payload.appUrl,
  ].join("\n");
  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [payload.to],
      subject: `We received your message — ${payload.inquiryNumber}`,
      text,
    });
    return true;
  } catch {
    console.error("[email] Product agent inquiry confirmation to customer failed");
    return false;
  }
}

export async function sendNewOrderEmail(payload: {
  orderNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  lineCount: number;
  appUrl: string;
}) {
  const transporter = getTransporter();
  const to = getOrderNotifyTo();
  if (!transporter || !to) {
    console.info(
      "[email] Skipping (SMTP not configured or no notify address — set SMTP_* and optionally ORDER_NOTIFY_EMAIL)",
      payload.orderNumber
    );
    return;
  }
  const text = `New order request ${payload.orderNumber}

Name: ${payload.contactName}
Email: ${payload.contactEmail}
Phone: ${payload.contactPhone}
Items: ${payload.lineCount} line(s)

View in admin: ${payload.appUrl}/admin/sales
`;
  await transporter.sendMail({
    from: getMailFrom(),
    to: [to],
    subject: `New order request ${payload.orderNumber}`,
    text,
  });
}

export async function sendOrderConfirmationToCustomer(payload: {
  to: string;
  orderNumber: string;
  appUrl: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: getMailFrom(),
    to: [payload.to],
    subject: `We received your request — ${payload.orderNumber}`,
    text: `Thank you. Your order request ${payload.orderNumber} was received. Our team will contact you by phone or email.

— Dayli Energy
${payload.appUrl}
`,
  });
}

const ELECTRICITY_BILL_LABELS: Record<string, string> = {
  lt50k: "Below N50,000",
  "50k-100k": "N50,000 - N100,000",
  "100k-250k": "N100,000 - N250,000",
  gt250k: "Above N250,000",
  unknown: "Not sure",
};

/** Plain-text copy of the booking for the customer confirmation email. */
export function formatInstallationBookingCustomerCopy(payload: {
  bookingNumber: string;
  appUrl: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  roofType: string;
  preferredDate: string;
  preferredTime: string;
  electricityBillRange: string;
  message?: string;
  quotationSummary?: string;
}): string {
  const bill =
    ELECTRICITY_BILL_LABELS[payload.electricityBillRange] ??
    payload.electricityBillRange;

  const lines = [
    `Thank you, ${payload.name}.`,
    "",
    `Your installation request ${payload.bookingNumber} has been received. Below is a copy of what you submitted.`,
    "",
    "--- Contact ---",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    "",
    "--- Site ---",
    `Address: ${payload.address}`,
    `${payload.city}, ${payload.state}`,
    `Property type: ${payload.propertyType}`,
    `Roof type: ${payload.roofType}`,
    "",
    "--- Schedule ---",
    `Preferred date: ${payload.preferredDate}`,
    `Preferred time: ${payload.preferredTime}`,
  ];

  if (payload.electricityBillRange !== "unknown") {
    lines.push("", "--- Details ---", `Estimated monthly electricity bill: ${bill}`);
  }

  if (payload.quotationSummary) {
    lines.push("", "--- Load estimate ---", payload.quotationSummary);
  }

  if (payload.message) {
    lines.push("", "--- Additional notes ---", payload.message);
  }

  lines.push(
    "",
    "Our team will contact you soon to confirm your site visit and next steps.",
    "",
    "Dayli Energy",
    payload.appUrl
  );

  return lines.join("\n");
}

export async function sendInstallationBookingEmailToOps(payload: {
  bookingNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  roofType: string;
  preferredDate: string;
  preferredTime: string;
  electricityBillRange: string;
  message?: string;
  quotationSummary?: string;
  appUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  const to = getInstallationNotifyTo();
  if (!transporter || !to) {
    console.info(
      "[email] Installation booking email skipped (SMTP not configured or no notify address — set SMTP_* and optionally INSTALLATION_NOTIFY_EMAIL / ORDER_NOTIFY_EMAIL)"
    );
    return false;
  }

  const billLabel =
    payload.electricityBillRange !== "unknown"
      ? ELECTRICITY_BILL_LABELS[payload.electricityBillRange] ??
        payload.electricityBillRange
      : null;

  const text = [
    `New installation booking ${payload.bookingNumber}`,
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Address: ${payload.address}`,
    `City: ${payload.city}`,
    `State: ${payload.state}`,
    `Property type: ${payload.propertyType}`,
    `Roof type: ${payload.roofType}`,
    `Preferred date: ${payload.preferredDate}`,
    `Preferred time: ${payload.preferredTime}`,
    ...(billLabel ? [`Estimated monthly bill: ${billLabel}`] : []),
    ...(payload.quotationSummary
      ? ["", "Load estimate (quotation):", payload.quotationSummary]
      : []),
    ...(payload.message ? ["", "Message:", payload.message] : []),
    "",
    `Submitted via ${payload.appUrl}/installation-booking`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [to],
      replyTo: payload.email,
      subject: `[Installation Booking] ${payload.bookingNumber}`,
      text,
    });
    return true;
  } catch {
    console.error("[email] Installation booking failed to send");
    return false;
  }
}

/** Customer link to review and approve an installation proposal (no login). */
export async function sendProposalReadyEmail(payload: {
  to: string;
  bookingNumber: string;
  approveUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.info(
      "[email] Proposal ready email skipped (SMTP not configured — set SMTP_*)",
      payload.bookingNumber
    );
    return false;
  }
  if (!payload.to?.trim()) {
    console.info("[email] Proposal ready email skipped (no recipient)", payload.bookingNumber);
    return false;
  }
  const text = [
    `Your installation proposal for ${payload.bookingNumber} is ready.`,
    "",
    "Please open the link below to review the proposal and approve it:",
    payload.approveUrl,
    "",
    "This link expires in 14 days.",
    "",
    "— Dayli Energy",
  ].join("\n");
  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [payload.to.trim()],
      subject: `Your proposal is ready — ${payload.bookingNumber}`,
      text,
    });
    return true;
  } catch {
    console.error("[email] Proposal ready email failed to send", payload.bookingNumber);
    return false;
  }
}

export async function sendInstallationBookingConfirmationToCustomer(payload: {
  to: string;
  bookingNumber: string;
  text: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: getMailFrom(),
      to: [payload.to],
      subject: `We received your installation request — ${payload.bookingNumber}`,
      text: payload.text,
    });
    return true;
  } catch {
    console.error("[email] Installation booking confirmation failed to send");
    return false;
  }
}
