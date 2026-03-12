/**
 * lotteryService.ts
 *
 * Fetches real Vietnamese lottery results from xskt.com.vn RSS feeds.
 * Designed for server-side use in Next.js (Server Components / Route Handlers).
 *
 * Regions:
 *   mb – Miền Bắc
 *   mt – Miền Trung
 *   mn – Miền Nam
 */

import {
  type LotteryResult,
  type Region,
  type StationResult,
  type DailyRegionResult,
  STATION_SCHEDULE,
  ALL_STATIONS,
  stationSlug,
} from "@/app/lib/lotteryData";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface LotteryServiceResult {
  data: LotteryResult | null;
  date: string;
  region: Region;
  error: string | null;
}

export interface LotteryServiceState {
  results: Partial<Record<Region, LotteryResult>>;
  dates: Partial<Record<Region, string>>;
  loading: Record<Region, boolean>;
  errors: Partial<Record<Region, string>>;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RSS_ENDPOINTS: Record<Region, string> = {
  mb: "https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss",
  mt: "https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss",
  mn: "https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss",
};

const CACHE_TTL_SECONDS = 300;

// ---------------------------------------------------------------------------
// Prize label → result key mappings (supports multiple Vietnamese variants)
// ---------------------------------------------------------------------------

type PrizeKey = keyof LotteryResult;

const LABEL_MAP: Array<{ key: PrizeKey; patterns: RegExp[] }> = [
  {
    key: "special",
    // xskt.com.vn uses "ĐB" (U+0110 uppercase Đ)
    patterns: [
      /^[ĐĐđd][Bb]$/,   // exact "ĐB" / "đb" / "DB"
      /đặc\s*biệt/i,
      /gi[aả]i\s*(?:đặc\s*biệt|[đd]b)/i,
    ],
  },
  {
    key: "first",
    patterns: [/^1$/, /gi[aả]i\s*nh[aấ]t/i, /^nh[aấ]t$/i],
  },
  {
    key: "second",
    patterns: [/^2$/, /gi[aả]i\s*nh[iì]/i, /^nh[iì]$/i],
  },
  {
    key: "third",
    patterns: [/^3$/, /gi[aả]i\s*ba/i, /^ba$/i],
  },
  {
    key: "fourth",
    patterns: [/^4$/, /gi[aả]i\s*t[ưu]/i, /^t[ưu]$/i],
  },
  {
    key: "fifth",
    patterns: [/^5$/, /gi[aả]i\s*n[aă]m/i, /^n[aă]m$/i],
  },
  {
    key: "sixth",
    patterns: [/^6$/, /gi[aả]i\s*s[aá]u/i, /^s[aá]u$/i],
  },
  {
    key: "seventh",
    patterns: [/^7$/, /gi[aả]i\s*b[aả]y/i, /^b[aả]y$/i],
  },
];

function matchPrizeKey(label: string): PrizeKey | null {
  const clean = label.trim().replace(/\s+/g, " ");
  for (const { key, patterns } of LABEL_MAP) {
    if (patterns.some((p) => p.test(clean))) return key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function getTodayVN(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// parseRssDate removed — draw date now parsed from item <title> via parseDateFromTitle

/** Extract all digit-only tokens of length 2–6 from a string. */
function extractNumbers(raw: string): string[] {
  return (raw.match(/\b\d{2,6}\b/g) ?? []).filter((n) => n.length >= 2 && n.length <= 6);
}

/** Strip HTML tags and decode common entities. */
function stripHtml(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalise raw HTML/text into plain lines — <br>, </tr>, </td>, </li>
 * all become newlines so each prize sits on its own line.
 */
function toLines(raw: string): string[] {
  return raw
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .split(/[\n\r]+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Parser strategy 1: HTML <table> rows
// Each <tr> has a prize-label <td> and a numbers <td>
// ---------------------------------------------------------------------------

function parseHtmlTable(html: string): LotteryResult | null {
  const result: Partial<LotteryResult> = {};

  // Match every <tr>...</tr> block
  const trMatches = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
  for (const trMatch of trMatches) {
    const row = trMatch[1];
    // Pull all <td> or <th> cell contents
    const cells = Array.from(row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)).map(
      (m) => stripHtml(m[1])
    );
    if (cells.length < 2) continue;

    const key = matchPrizeKey(cells[0]);
    if (!key) continue;

    // Collect numbers from all remaining cells
    const nums = cells
      .slice(1)
      .flatMap((c) => extractNumbers(c))
      .filter(Boolean);
    if (nums.length > 0) result[key] = nums;
  }

  if (!result.special || result.special.length === 0) return null;

  return {
    special: result.special ?? [],
    first:   result.first   ?? [],
    second:  result.second  ?? [],
    third:   result.third   ?? [],
    fourth:  result.fourth  ?? [],
    fifth:   result.fifth   ?? [],
    sixth:   result.sixth   ?? [],
    seventh: result.seventh ?? [],
  };
}

// ---------------------------------------------------------------------------
// Parser strategy 2: plain-text "Label: numbers" lines
// ---------------------------------------------------------------------------

function parsePlainText(raw: string): LotteryResult | null {
  // Split into lines preserving <br>/<tr>/<td> boundaries
  const lines = toLines(raw);

  const result: Partial<LotteryResult> = {};

  for (const line of lines) {
    // Expect lines like "Giải nhất: 12345" or "ĐB: 12345 67890"
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const label = line.slice(0, colonIdx).trim();
    const valueRaw = line.slice(colonIdx + 1).trim();

    const key = matchPrizeKey(label);
    if (!key) continue;

    const nums = extractNumbers(valueRaw);
    if (nums.length > 0) result[key] = nums;
  }

  if (!result.special || result.special.length === 0) return null;

  return {
    special: result.special ?? [],
    first:   result.first   ?? [],
    second:  result.second  ?? [],
    third:   result.third   ?? [],
    fourth:  result.fourth  ?? [],
    fifth:   result.fifth   ?? [],
    sixth:   result.sixth   ?? [],
    seventh: result.seventh ?? [],
  };
}

// ---------------------------------------------------------------------------
// Parser strategy 3: positional extraction (Miền Bắc only)
// When labels are absent, group numbers by expected count per prize.
// MB layout: 1 | 1 | 2 | 6 | 4 | 6 | 3 | 4  = 27 total
// ---------------------------------------------------------------------------

const MB_COUNTS: Array<{ key: PrizeKey; count: number }> = [
  { key: "special", count: 1 },
  { key: "first",   count: 1 },
  { key: "second",  count: 2 },
  { key: "third",   count: 6 },
  { key: "fourth",  count: 4 },
  { key: "fifth",   count: 6 },
  { key: "sixth",   count: 3 },
  { key: "seventh", count: 4 },
];

function parsePositional(raw: string): LotteryResult | null {
  const text = stripHtml(raw.replace(/<!\[CDATA\[|\]\]>/g, ""));
  const all = extractNumbers(text);
  if (all.length < 10) return null; // Not enough numbers

  const result: Partial<LotteryResult> = {};
  let idx = 0;

  for (const { key, count } of MB_COUNTS) {
    const slice = all.slice(idx, idx + count);
    if (slice.length === 0) break;
    result[key] = slice;
    idx += count;
    if (idx >= all.length) break;
  }

  if (!result.special || result.special.length === 0) return null;

  return {
    special: result.special ?? [],
    first:   result.first   ?? [],
    second:  result.second  ?? [],
    third:   result.third   ?? [],
    fourth:  result.fourth  ?? [],
    fifth:   result.fifth   ?? [],
    sixth:   result.sixth   ?? [],
    seventh: result.seventh ?? [],
  };
}

// ---------------------------------------------------------------------------
// Orchestrate all strategies
// ---------------------------------------------------------------------------

function parseDescription(description: string): LotteryResult | null {
  return (
    parseHtmlTable(description) ??
    parsePlainText(description) ??
    parsePositional(description)
  );
}

// ---------------------------------------------------------------------------
// RSS extraction
// ---------------------------------------------------------------------------

/**
 * Parse the actual draw date from the RSS item title.
 * Title format: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 10/03 (Thứ Ba)"
 * Returns "DD/MM/YYYY" or null if not found.
 */
function parseDateFromTitle(title: string): string | null {
  const match = title.match(/ng[àa]y\s+(\d{1,2})\/(\d{1,2})/i);
  if (!match) return null;
  const day   = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year  = new Date().getFullYear();
  return `${day}/${month}/${year}`;
}

function extractDescriptionFromXml(xml: string): { description: string; drawDate: string } | null {
  // Grab the first <item> block
  const itemBlock = xml.match(/<item[^>]*>([\s\S]*?)<\/item>/i)?.[1] ?? xml;

  // Try CDATA-wrapped description first, then plain
  const description =
    itemBlock.match(/<description>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/description>/i)?.[1] ??
    itemBlock.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ??
    null;

  if (!description) return null;

  // Extract draw date from item <title> — most accurate source
  const itemTitle =
    itemBlock.match(/<title>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/title>/i)?.[1] ??
    itemBlock.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
    "";

  const drawDate = parseDateFromTitle(itemTitle) ?? getTodayVN();

  return { description, drawDate };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchLotteryResult(region: Region): Promise<LotteryServiceResult> {
  const date = getTodayVN();
  try {
    const response = await fetch(RSS_ENDPOINTS[region], {
      next: { revalidate: CACHE_TTL_SECONDS },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`API trả về lỗi HTTP ${response.status}`);
    }

    const xml = await response.text();
    const extracted = extractDescriptionFromXml(xml);

    if (!extracted) {
      throw new Error("Không tìm thấy thẻ <description> trong RSS feed");
    }

    const lotteryResult = parseDescription(extracted.description);

    if (!lotteryResult) {
      // Return raw snippet to help debug if all strategies fail
      const snippet = extracted.description.slice(0, 200).replace(/\s+/g, " ");
      throw new Error(`Không thể phân tích dữ liệu. Raw: ${snippet}`);
    }

    return {
      data: lotteryResult,
      date: extracted.drawDate,
      region,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      date,
      region,
      error: err instanceof Error ? err.message : "Lỗi không xác định",
    };
  }
}

// ---------------------------------------------------------------------------
// Extract ALL <item> blocks from RSS (for date-based lookup)
// ---------------------------------------------------------------------------

function extractAllRssItems(xml: string): Array<{ description: string; drawDate: string }> {
  const items: Array<{ description: string; drawDate: string }> = [];
  const matches = Array.from(xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi));

  for (const match of matches) {
    const block = match[1];

    const desc =
      block.match(/<description>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/description>/i)?.[1] ??
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ??
      "";

    const title =
      block.match(/<title>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/title>/i)?.[1] ??
      block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
      "";

    const drawDate = parseDateFromTitle(title);
    if (desc && drawDate) items.push({ description: desc, drawDate });
  }

  return items;
}

/**
 * Fetch lottery result for a specific region and date.
 * date must be in "DD/MM/YYYY" format.
 * Searches within the RSS feed (typically last ~7 days).
 */
export async function getLotteryByDate(
  region: Region,
  date: string // "DD/MM/YYYY"
): Promise<LotteryServiceResult> {
  try {
    const response = await fetch(RSS_ENDPOINTS[region], {
      next: { revalidate: CACHE_TTL_SECONDS },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) throw new Error(`API trả về lỗi HTTP ${response.status}`);

    const xml = await response.text();
    const items = extractAllRssItems(xml);
    const item = items.find((i) => i.drawDate === date);

    if (!item) {
      const available = items.map((i) => i.drawDate).join(", ");
      return {
        data: null,
        date,
        region,
        error: `Không có dữ liệu cho ngày ${date}. Dữ liệu có sẵn: ${available || "không có"}.`,
      };
    }

    const lotteryResult = parseDescription(item.description);
    if (!lotteryResult) throw new Error("Không thể phân tích kết quả xổ số");

    return { data: lotteryResult, date, region, error: null };
  } catch (err) {
    return {
      data: null,
      date,
      region,
      error: err instanceof Error ? err.message : "Lỗi không xác định",
    };
  }
}

// ---------------------------------------------------------------------------
// Per-station helpers for fetchDailyRegionResult
// ---------------------------------------------------------------------------

/** Extract all <item> blocks with title included. */
function extractAllRssItemsWithTitle(
  xml: string
): Array<{ description: string; drawDate: string; title: string }> {
  const items: Array<{ description: string; drawDate: string; title: string }> = [];
  const matches = Array.from(xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi));

  for (const match of matches) {
    const block = match[1];
    const desc =
      block.match(/<description>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/description>/i)?.[1] ??
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ??
      "";
    const title =
      block.match(/<title>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/title>/i)?.[1] ??
      block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ??
      "";
    const drawDate = parseDateFromTitle(title);
    if (desc && drawDate) items.push({ description: desc, drawDate, title });
  }

  return items;
}

/** Parse day-of-week (0=Sun) from a "DD/MM/YYYY" string. */
function getDayOfWeekFromVN(dateVN: string): number {
  const [dd, mm, yyyy] = dateVN.split("/");
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getDay();
}

/**
 * Try to detect which station an RSS item belongs to, by scanning the title
 * for a known station name. Falls back to "Hà Nội" for MB.
 */
function parseStationFromTitle(title: string, region: Region): string | null {
  // Normalise: uppercase, strip diacritics, replace Đ→D
  const norm = (s: string) =>
    s
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Đ/g, "D");

  const normTitle = norm(title);

  for (const station of ALL_STATIONS.filter((s) => s.region === region)) {
    if (normTitle.includes(norm(station.name))) return station.name;
  }

  if (region === "mb") return "Hà Nội";
  return null;
}

/** Convert "YYYY-MM-DD" → "DD/MM/YYYY" */
function isoToVN(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// fetchDailyRegionResult — multi-station aware
// ---------------------------------------------------------------------------

/**
 * Fetch lottery results for a region, returning one StationResult per station.
 *
 * Strategy:
 *  1. Fetch the RSS feed and extract all <item> blocks.
 *  2. Filter to the target date (latest if omitted).
 *  3. If multiple items exist for that date (one per station) parse each separately.
 *  4. If only one aggregated item exists, spread it across the day's scheduled stations.
 */
export async function fetchDailyRegionResult(
  region: Region,
  dateIso?: string // "YYYY-MM-DD" — undefined = latest
): Promise<DailyRegionResult> {
  const targetDateVN = dateIso ? isoToVN(dateIso) : null;

  try {
    const response = await fetch(RSS_ENDPOINTS[region], {
      next: { revalidate: CACHE_TTL_SECONDS },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) throw new Error(`API trả về lỗi HTTP ${response.status}`);

    const xml = await response.text();
    const allItems = extractAllRssItemsWithTitle(xml);
    if (allItems.length === 0) throw new Error("Không tìm thấy dữ liệu trong RSS feed");

    // Resolve target date
    const targetDate = targetDateVN ?? allItems[0].drawDate;

    const itemsForDate = allItems.filter((i) => i.drawDate === targetDate);
    if (itemsForDate.length === 0) {
      const available = allItems.map((i) => i.drawDate).join(", ");
      return {
        date: targetDate,
        region,
        stations: [],
        error: `Không có dữ liệu cho ngày ${targetDate}. Có sẵn: ${available || "không có"}.`,
      };
    }

    // ---- Try to detect per-station items ----
    const stationResults: StationResult[] = [];

    for (const item of itemsForDate) {
      const results = parseDescription(item.description);
      if (!results) continue;
      const name = parseStationFromTitle(item.title, region) ?? "Tổng hợp";
      stationResults.push({ stationId: stationSlug(name), stationName: name, results });
    }

    if (stationResults.length === 0) {
      return { date: targetDate, region, stations: [], error: "Không thể phân tích kết quả" };
    }

    // ---- If only one item and region has multiple stations, spread across schedule ----
    const isAggregated =
      stationResults.length === 1 &&
      region !== "mb" &&
      (stationResults[0].stationName === "Tổng hợp" ||
        !ALL_STATIONS.some(
          (s) => s.region === region && s.id === stationResults[0].stationId
        ));

    if (isAggregated) {
      const dayOfWeek = getDayOfWeekFromVN(targetDate);
      const scheduledNames = STATION_SCHEDULE[region][dayOfWeek] ?? [];
      const combinedResult = stationResults[0].results;

      const spread: StationResult[] = scheduledNames.map((name) => ({
        stationId: stationSlug(name),
        stationName: name,
        results: combinedResult,
      }));

      return { date: targetDate, region, stations: spread, error: null };
    }

    return { date: targetDate, region, stations: stationResults, error: null };
  } catch (err) {
    return {
      date: targetDateVN ?? getTodayVN(),
      region,
      stations: [],
      error: err instanceof Error ? err.message : "Lỗi không xác định",
    };
  }
}

export async function fetchAllRegions(): Promise<Record<Region, LotteryServiceResult>> {
  const [mb, mt, mn] = await Promise.all([
    fetchLotteryResult("mb"),
    fetchLotteryResult("mt"),
    fetchLotteryResult("mn"),
  ]);
  return { mb, mt, mn };
}

export function initialServiceState(): LotteryServiceState {
  return {
    results: {},
    dates: {},
    loading: { mb: false, mt: false, mn: false },
    errors: {},
  };
}
