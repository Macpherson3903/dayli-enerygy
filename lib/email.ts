import nodemailer from "nodemailer";

const smtpHost = process.env.HOSTINGER_SMTP_HOST;
const smtpPort = Number(process.env.HOSTINGER_SMTP_PORT ?? "587");
const smtpUser = process.env.HOSTINGER_SMTP_USER;
const smtpPass = process.env.HOSTINGER_SMTP_PASS;
const smtpSecure = (process.env.HOSTINGER_SMTP_SECURE ?? "false") === "true";
const from =
  process.env.EMAIL_FROM ??
  `Dayli Energy <${process.env.HOSTINGER_SMTP_USER ?? "noreply@example.com"}>`;
const adminTo = process.env.ORDER_NOTIFY_EMAIL;

function getInstallationNotifyTo() {
  const direct = process.env.INSTALLATION_NOTIFY_EMAIL?.trim();
  if (direct) return direct;
  return process.env.ORDER_NOTIFY_EMAIL?.trim() ?? "";
}

function getContactNotifyTo() {
  const direct = process.env.CONTACT_NOTIFY_EMAIL?.trim();
  if (direct) return direct;
  return process.env.ORDER_NOTIFY_EMAIL?.trim() ?? "";
}

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return null;
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
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
}): Promise<boolean> {
  const transporter = getTransporter();
  const to = getContactNotifyTo();
  if (!transporter || !to) {
    console.info(
      "[email] Contact inquiry skipped (Hostinger SMTP or CONTACT_NOTIFY_EMAIL / ORDER_NOTIFY_EMAIL not set)"
    );
    return false;
  }
  const text = [
    "New contact form message",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    ...(payload.phone ? [`Phone: ${payload.phone}`] : []),
    `Subject: ${payload.subject}`,
    "",
    payload.message,
    "",
    `— Submitted via ${payload.appUrl}/contact`,
  ].join("\n");
  try {
    await transporter.sendMail({
      from,
      to: [to],
      replyTo: payload.email,
      subject: `[Contact] ${payload.subject}`,
      text,
    });
    return true;
  } catch (e) {
    console.error("[email] Contact inquiry failed to send");
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
  if (!transporter || !adminTo) {
    console.info(
      "[email] Skipping (Hostinger SMTP or ORDER_NOTIFY_EMAIL not set)",
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
    from,
    to: [adminTo],
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
    from,
    to: [payload.to],
    subject: `We received your request — ${payload.orderNumber}`,
    text: `Thank you. Your order request ${payload.orderNumber} was received. Our team will contact you by phone or email.

— Dayli Energy
${payload.appUrl}
`,
  });
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
  appUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  const to = getInstallationNotifyTo();
  if (!transporter || !to) {
    console.info(
      "[email] Installation booking email skipped (Hostinger SMTP or INSTALLATION_NOTIFY_EMAIL / ORDER_NOTIFY_EMAIL not set)"
    );
    return false;
  }

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
    `Estimated monthly bill: ${payload.electricityBillRange}`,
    ...(payload.message ? ["", "Message:", payload.message] : []),
    "",
    `Submitted via ${payload.appUrl}/installation-booking`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from,
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

export async function sendInstallationBookingConfirmationToCustomer(payload: {
  to: string;
  bookingNumber: string;
  appUrl: string;
}): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from,
      to: [payload.to],
      subject: `We received your installation request — ${payload.bookingNumber}`,
      text: `Thank you. Your installation booking request ${payload.bookingNumber} has been received.

Our team will contact you soon to confirm your site visit and installation details.

Dayli Energy
${payload.appUrl}`,
    });
    return true;
  } catch {
    console.error("[email] Installation booking confirmation failed to send");
    return false;
  }
}
