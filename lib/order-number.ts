export function generateOrderNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DE-${y}${m}${day}-${r}`;
}
