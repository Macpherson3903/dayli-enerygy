export function normalizeSearch(s: string): string {
  return s.trim().toLowerCase();
}

export function matchesSearch(query: string, fields: Array<string | number | null | undefined>): boolean {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = fields
    .map((f) => normalizeSearch(String(f ?? "")))
    .join(" ");
  return terms.every((t) => hay.includes(t));
}
