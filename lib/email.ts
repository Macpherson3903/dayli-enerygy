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
