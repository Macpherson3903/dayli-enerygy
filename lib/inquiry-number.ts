export function generateProductAgentInquiryNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEA-${y}${m}${day}-${r}`;
}

/** Public /contact form submissions (stored in MongoDB before emails send). */
export function generateContactMessageNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEC-${y}${m}${day}-${r}`;
}
