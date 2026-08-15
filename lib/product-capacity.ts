/** Parse rated capacity from catalog text (name, description, features). */

export type ParsedPanelSpec = { watts: number };
export type ParsedInverterSpec = { va: number };
export type ParsedBatterySpec = { ah: number; volts: number | null };

function catalogText(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" \n ");
}

export function parsePanelWatts(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:wp|watt(?:s)?)\b/i);
  if (m) {
    const n = Number.parseFloat(m[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const w = text.match(/(\d+(?:\.\d+)?)\s*w(?![a-z])/i);
  if (!w) return null;
  const n = Number.parseFloat(w[1]);
  if (!Number.isFinite(n) || n < 20 || n > 800) return null;
  return n;
}

export function parseInverterVa(text: string): number | null {
  const kva = text.match(/(\d+(?:\.\d+)?)\s*kva\b/i);
  if (kva) {
    const n = Number.parseFloat(kva[1]);
    return Number.isFinite(n) && n > 0 ? n * 1000 : null;
  }
  const kw = text.match(/(\d+(?:\.\d+)?)\s*kw\b/i);
  if (kw) {
    const n = Number.parseFloat(kw[1]);
    return Number.isFinite(n) && n > 0 ? n * 1000 : null;
  }
  const va = text.match(/(\d+(?:\.\d+)?)\s*va\b/i);
  if (va) {
    const n = Number.parseFloat(va[1]);
    return Number.isFinite(n) && n >= 300 ? n : null;
  }
  return null;
}

export function parseBatteryAh(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*ah\b/i);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseNominalVolts(text: string): number | null {
  const m = text.match(/\b(12|24|36|48)\s*v\b/i);
  if (!m) return null;
  return Number.parseInt(m[1], 10);
}

export function panelSpecFromCatalog(parts: Array<string | undefined>): ParsedPanelSpec | null {
  const watts = parsePanelWatts(catalogText(parts));
  return watts ? { watts } : null;
}

export function inverterSpecFromCatalog(
  parts: Array<string | undefined>
): ParsedInverterSpec | null {
  const va = parseInverterVa(catalogText(parts));
  return va ? { va } : null;
}

export function batterySpecFromCatalog(
  parts: Array<string | undefined>
): ParsedBatterySpec | null {
  const text = catalogText(parts);
  const ah = parseBatteryAh(text);
  if (!ah) return null;
  return { ah, volts: parseNominalVolts(text) };
}
