const buckets = new Map<string, { count: number; reset: number }>();

const WINDOW_MS = 60_000;
/** Default max requests per window when `maxPerWindow` is not passed. */
const DEFAULT_MAX = 20;

function key(id: string, action: string) {
  return `${id}:${action}`;
}

export function rateLimitCheck(
  id: string,
  action: string,
  options?: { maxPerWindow?: number }
): { ok: boolean; retryAfter?: number } {
  const max = options?.maxPerWindow ?? DEFAULT_MAX;
  const k = key(id, action);
  const now = Date.now();
  const b = buckets.get(k);
  if (!b || now > b.reset) {
    buckets.set(k, { count: 1, reset: now + WINDOW_MS });
    return { ok: true };
  }
  if (b.count >= max) {
    return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}
