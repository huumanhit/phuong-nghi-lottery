/**
 * In-memory DB cache — giảm round-trip tới Supabase Tokyo
 * Giống cơ chế của lotteryService.ts nhưng dùng chung cho mọi DB query
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 phút

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (entry && entry.expiresAt > now) return entry.data;

  const data = await fetcher();
  store.set(key, { data, expiresAt: now + ttlMs });
  return data;
}

export function invalidate(keyPrefix: string) {
  Array.from(store.keys()).forEach((key) => {
    if (key.startsWith(keyPrefix)) store.delete(key);
  });
}
