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
    patterns: [
      /^[ĐĐđd][Bb]$/,
      /đặc\s*biệt/i,
      /gi[aả]i\s*(?:đặc\s*biệt|[đd]b)/i,
    ],
  },
  { key: "first",   patterns: [/^1$/, /gi[aả]i\s*nh[aấ]t/i, /^nh[aấ]t$/i] },
  { key: "second",  patterns: [/^2$/, /gi[aả]i\s*nh[iì]/i,  /^nh[iì]$/i]  },
  { key: "third",   patterns: [/^3$/, /gi[aả]i\s*ba/i,       /^ba$/i]      },
  { key: "fourth",  patterns: [/^4$/, /gi[aả]i\s*t[ưu]/i,   /^t[ưu]$/i]  },
  { key: "fifth",   patterns: [/^5$/, /gi[aả]i\s*n[aă]m/i,  /^n[aă]m$/i] },
  { key: "sixth",   patterns: [/^6$/, /gi[aả]i\s*s[aá]u/i,  /^s[aá]u$/i] },
  { key: "seventh", patterns: [/^7$/, /gi[aả]i\s*b[aả]y/i,  /^b[aả]y$/i] },
  { key: "eighth",  patterns: [/^8$/, /gi[aả]i\s*t[aá]m/i,  /^t[aá]m$/i] },
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
    eighth:  result.eighth  ?? [],
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
    eighth:  result.eighth  ?? [],
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
    eighth:  [],
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
 * stationName is optional — for MT/MN, filters to the specific station the user selected.
 */
export async function getLotteryByDate(
  region: Region,
  date: string, // "DD/MM/YYYY"
  stationName?: string
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

    // For MT/MN with a specific station, use multi-station parser to get the correct station's data
    if (region !== "mb" && stationName) {
      const multiStation = parsePlainTextMultiStation(item.description);
      if (multiStation && multiStation.length > 0) {
        const targetSlug = stationSlug(stationName);
        const stationData = multiStation.find(
          (s) => stationSlug(s.stationName) === targetSlug
        );
        if (stationData) {
          return { data: stationData.results, date, region, error: null };
        }
        // Station not found in today's draw — return first available station
        return { data: multiStation[0].results, date, region, error: null };
      }
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

/** Safely convert a Partial<LotteryResult> to a full LotteryResult. */
function toFullResult(partial: Partial<LotteryResult>): LotteryResult {
  return {
    special: partial.special ?? [],
    first:   partial.first   ?? [],
    second:  partial.second  ?? [],
    third:   partial.third   ?? [],
    fourth:  partial.fourth  ?? [],
    fifth:   partial.fifth   ?? [],
    sixth:   partial.sixth   ?? [],
    seventh: partial.seventh ?? [],
    eighth:  partial.eighth  ?? [],
  };
}

/**
 * Parse a multi-column HTML table where each column (after the prize label)
 * represents one station.  Returns one Partial<LotteryResult> per station
 * in column order, or null if the table doesn't fit the expected shape.
 *
 * Handles two common formats:
 *   A) All numbers for a prize on one row: <tr><td>Tư</td><td>n1 n2 …</td>…</tr>
 *   B) One number per row (rowspan label):  <tr><td rowspan=7>Tư</td><td>n1</td>…</tr>
 *                                            <tr><td>n2</td>…</tr>
 */
function parseMultiStationDescription(
  html: string,
  numStations: number
): Array<Partial<LotteryResult>> | null {
  if (numStations <= 1) return null;

  const stationResults: Array<Partial<LotteryResult>> = Array.from(
    { length: numStations }, () => ({})
  );

  const append = (result: Partial<LotteryResult>, key: PrizeKey, nums: string[]) => {
    const existing = (result[key] ?? []) as string[];
    (result as Record<string, string[]>)[key] = [...existing, ...nums];
  };

  const trMatches = Array.from(html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
  let currentPrize: PrizeKey | null = null;
  let anyData = false;

  for (const trMatch of trMatches) {
    const cells = Array.from(
      trMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)
    ).map((m) => stripHtml(m[1]));

    if (cells.length === 0) continue;

    const prizeKey = matchPrizeKey(cells[0]);

    if (prizeKey !== null) {
      // Prize-label row: cells[0]=label, cells[1..N]=station values
      currentPrize = prizeKey;
      for (let i = 0; i < numStations; i++) {
        const nums = extractNumbers(cells[i + 1] ?? "");
        if (nums.length > 0) { append(stationResults[i], prizeKey, nums); anyData = true; }
      }
    } else if (currentPrize !== null && cells.length === numStations) {
      // Continuation row (rowspan label omitted): cells[0..N-1]=station values
      for (let i = 0; i < numStations; i++) {
        const nums = extractNumbers(cells[i] ?? "");
        if (nums.length > 0) { append(stationResults[i], currentPrize, nums); anyData = true; }
      }
    }
    // Header rows / unrecognized rows → skip
  }

  if (!anyData) return null;
  // Must have ĐB for at least one station to be valid
  if (!stationResults.some((r) => (r.special?.length ?? 0) > 0)) return null;
  return stationResults;
}

// ---------------------------------------------------------------------------
// Parser for xskt.com.vn plain-text multi-station format
//
// The RSS description uses this structure (one item per draw date):
//   [Station Name]
//   ĐB: 289565
//   1: 39264
//   2: 27223
//   3: 22861 - 27028
//   4: 77976 - 12244 - ...
//   5: 7415
//   6: 4140 - 7234 - 9374
//   7: 5828: 04          ← "7: <seventh>: <eighth>" on one line
//   [Next Station]
//   ...
// ---------------------------------------------------------------------------

function parsePlainTextMultiStation(
  text: string
): Array<{ stationName: string; results: LotteryResult }> | null {
  const lines = toLines(text);

  // Split into per-station sections at [Station Name] markers
  const sections: Array<{ name: string; lines: string[] }> = [];
  let currentName: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^\[(.+?)\]/);
    if (headerMatch) {
      if (currentName !== null && currentLines.length > 0) {
        sections.push({ name: currentName.trim(), lines: currentLines });
      }
      currentName = headerMatch[1].trim();
      currentLines = [];
    } else if (currentName !== null) {
      currentLines.push(line);
    }
  }
  if (currentName !== null && currentLines.length > 0) {
    sections.push({ name: currentName.trim(), lines: currentLines });
  }

  if (sections.length === 0) return null;

  const stationResults: Array<{ stationName: string; results: LotteryResult }> = [];

  for (const { name, lines: sLines } of sections) {
    const result: Partial<LotteryResult> = {};

    for (const line of sLines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const label = line.slice(0, colonIdx).trim();
      const key = matchPrizeKey(label);
      if (!key) continue;

      const afterLabel = line.slice(colonIdx + 1).trim();

      // "7: XXXX: YY" → seventh = XXXX, eighth = YY (xskt.com.vn compact notation)
      if (key === "seventh") {
        const secondColon = afterLabel.indexOf(":");
        if (secondColon !== -1) {
          const seventhNums = extractNumbers(afterLabel.slice(0, secondColon));
          const eighthNums  = extractNumbers(afterLabel.slice(secondColon + 1));
          if (seventhNums.length > 0) result.seventh = seventhNums;
          if (eighthNums.length > 0)  result.eighth  = eighthNums;
          continue;
        }
      }

      const nums = extractNumbers(afterLabel);
      if (nums.length > 0) result[key] = nums;
    }

    // Only include stations that have a valid ĐB prize
    if ((result.special?.length ?? 0) > 0) {
      stationResults.push({ stationName: name, results: toFullResult(result) });
    }
  }

  return stationResults.length > 0 ? stationResults : null;
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

    // ---- For MT/MN: try [Station] plain-text multi-station format first ----
    if (region !== "mb" && itemsForDate.length >= 1) {
      const multiStation = parsePlainTextMultiStation(itemsForDate[0].description);
      if (multiStation && multiStation.length > 0) {
        return {
          date: targetDate,
          region,
          stations: multiStation.map((s) => ({
            stationId: stationSlug(s.stationName),
            stationName: s.stationName,
            results: s.results,
          })),
          error: null,
        };
      }
    }

    // ---- Fallback: try to detect per-station items via title ----
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

      // Try HTML multi-column table format as last resort
      const perStation = parseMultiStationDescription(
        itemsForDate[0].description,
        scheduledNames.length
      );
      if (perStation && perStation.length === scheduledNames.length) {
        return {
          date: targetDate,
          region,
          stations: scheduledNames.map((name, i) => ({
            stationId: stationSlug(name),
            stationName: name,
            results: toFullResult(perStation[i]),
          })),
          error: null,
        };
      }

      // Last resort: same result for all stations
      return {
        date: targetDate,
        region,
        stations: scheduledNames.map((name) => ({
          stationId: stationSlug(name),
          stationName: name,
          results: stationResults[0].results,
        })),
        error: null,
      };
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

// ---------------------------------------------------------------------------
// Loto statistics for a specific station
// ---------------------------------------------------------------------------

export interface LotoStatEntry {
  number: string; // "00" – "99"
  count: number;
}

export interface StationLotoStats {
  stationName: string;
  region: Region;
  drawCount: number;
  stats: LotoStatEntry[]; // sorted by count desc
}

function extractLoNumsFromResult(result: LotteryResult): string[] {
  const all = [
    ...result.special, ...result.first, ...result.second, ...result.third,
    ...result.fourth, ...result.fifth, ...result.sixth, ...result.seventh, ...result.eighth,
  ];
  return all.map((n) => n.slice(-2)).filter((n) => /^\d{2}$/.test(n));
}

/**
 * Fetch loto-number frequency stats for a single station by scanning all
 * RSS items available in the feed (typically the last 7–10 draws).
 */
export async function fetchLotoStats(
  region: Region,
  stationName: string
): Promise<StationLotoStats> {
  try {
    const response = await fetch(RSS_ENDPOINTS[region], {
      next: { revalidate: CACHE_TTL_SECONDS },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const allItems = extractAllRssItemsWithTitle(xml);

    const freq: Record<string, number> = {};
    let drawCount = 0;
    const targetSlug = region !== "mb" ? stationSlug(stationName) : null;

    for (const item of allItems) {
      if (region !== "mb") {
        const multiStation = parsePlainTextMultiStation(item.description);
        if (multiStation) {
          const stationData = multiStation.find(
            (s) => stationSlug(s.stationName) === targetSlug
          );
          if (stationData) {
            drawCount++;
            for (const lo of extractLoNumsFromResult(stationData.results)) {
              freq[lo] = (freq[lo] ?? 0) + 1;
            }
          }
        }
      } else {
        const result = parseDescription(item.description);
        if (result) {
          drawCount++;
          for (const lo of extractLoNumsFromResult(result)) {
            freq[lo] = (freq[lo] ?? 0) + 1;
          }
        }
      }
    }

    const stats: LotoStatEntry[] = Object.entries(freq)
      .map(([number, count]) => ({ number, count }))
      .sort((a, b) => b.count - a.count || a.number.localeCompare(b.number));

    return { stationName, region, drawCount, stats };
  } catch {
    return { stationName, region, drawCount: 0, stats: [] };
  }
}

// ---------------------------------------------------------------------------
// Region-wide loto frequency statistics
// ---------------------------------------------------------------------------

export interface LotoFrequencyEntry {
  number: string;
  totalAppearances: number;
  sessionCount: number;
  lastSeenSessionIdx: number; // 0 = most recent session, -1 = never seen
}

export interface LotoFrequencyResult {
  region: Region;
  totalSessions: number;
  mostFrequent: LotoFrequencyEntry[];
  longestAbsent: LotoFrequencyEntry[];
}

export async function fetchLotoFrequency(region: Region): Promise<LotoFrequencyResult> {
  const empty: LotoFrequencyResult = { region, totalSessions: 0, mostFrequent: [], longestAbsent: [] };
  try {
    const response = await fetch(RSS_ENDPOINTS[region], {
      next: { revalidate: CACHE_TTL_SECONDS },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const allItems = extractAllRssItemsWithTitle(xml);
    const totalSessions = allItems.length;
    if (totalSessions === 0) return empty;

    const freq = new Map<string, { total: number; sessions: Set<number>; lastIdx: number }>();

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      let loNums: string[] = [];

      if (region !== "mb") {
        const multiStation = parsePlainTextMultiStation(item.description);
        if (multiStation) {
          loNums = multiStation.flatMap((s) => extractLoNumsFromResult(s.results));
        }
      } else {
        const result = parseDescription(item.description);
        if (result) loNums = extractLoNumsFromResult(result);
      }

      for (const lo of loNums) {
        const entry = freq.get(lo) ?? { total: 0, sessions: new Set<number>(), lastIdx: -1 };
        entry.total++;
        entry.sessions.add(i);
        if (entry.lastIdx === -1 || i < entry.lastIdx) entry.lastIdx = i;
        freq.set(lo, entry);
      }
    }

    const all: LotoFrequencyEntry[] = [];
    for (let n = 0; n <= 99; n++) {
      const key = String(n).padStart(2, "0");
      const f = freq.get(key);
      all.push({
        number: key,
        totalAppearances: f?.total ?? 0,
        sessionCount: f?.sessions.size ?? 0,
        lastSeenSessionIdx: f?.lastIdx ?? -1,
      });
    }

    const mostFrequent = [...all]
      .sort((a, b) =>
        b.sessionCount - a.sessionCount ||
        b.totalAppearances - a.totalAppearances ||
        a.number.localeCompare(b.number)
      )
      .slice(0, 20);

    const absOf = (e: LotoFrequencyEntry) =>
      e.lastSeenSessionIdx === -1 ? totalSessions : e.lastSeenSessionIdx;

    const longestAbsent = [...all]
      .sort((a, b) => absOf(b) - absOf(a) || a.number.localeCompare(b.number))
      .slice(0, 20);

    return { region, totalSessions, mostFrequent, longestAbsent };
  } catch {
    return empty;
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
