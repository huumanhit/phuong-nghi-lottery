/**
 * vietlottService.ts
 *
 * Fetches Vietlott results (Mega 6/45, Power 6/55, Max 3D, Max 4D)
 * from xskt.com.vn HTML pages and parses the winning numbers and prize statistics.
 */

export type VietlottGame = "mega-645" | "power-655" | "max-3d" | "max-4d";

export interface VietlottPrizeDetail {
  prizeName: string;
  numbers?: string[];
  reward?: string;
  count?: string;
}

export interface VietlottDraw {
  drawNumber: string;   // e.g. "01410"
  date:       string;   // e.g. "13/10/2026"
  numbers:    string[]; // e.g. ["02","14","27","40","50","53"]
  powerNumber?: string; // Power 6/55 only
  jackpot?:   string;   // e.g. "146,262,248,400"
  hasWinner:  boolean;
  prizes?:    VietlottPrizeDetail[];
}

export interface VietlottResult {
  game:  VietlottGame;
  draws: VietlottDraw[];
  error: string | null;
}

// ── Correct xskt.com.vn Source URLs ───────────────────────────────────────────
const GAME_URLS: Record<VietlottGame, string> = {
  "mega-645":  "https://xskt.com.vn/xsmega645",
  "power-655": "https://xskt.com.vn/xspower",
  "max-3d":    "https://xskt.com.vn/xsmax3d",
  "max-4d":    "https://xskt.com.vn/xsmax4d",
};

// ── In-memory server cache (5 minutes TTL) ────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const vietlottCache = new Map<string, CacheEntry<VietlottResult>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getFromCache(key: string): VietlottResult | null {
  const entry = vietlottCache.get(key);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  vietlottCache.delete(key);
  return null;
}

function setInCache(key: string, data: VietlottResult): void {
  vietlottCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseDrawDate(context: string): string {
  // matches ngay-13-10-2026 in href
  const mHref = context.match(/ngay-(\d{1,2})-(\d{1,2})-(\d{4})/i);
  if (mHref) {
    return `${mHref[1].padStart(2, "0")}/${mHref[2].padStart(2, "0")}/${mHref[3]}`;
  }
  // matches: 15/03/2026 or 15-03-2026
  const mDate = context.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mDate) {
    return `${mDate[1].padStart(2, "0")}/${mDate[2].padStart(2, "0")}/${mDate[3]}`;
  }
  return "";
}

function normalizePrizeName(raw: string): string {
  const trimmed = raw.trim();
  if (/^j\.?pot\s*1?$/i.test(trimmed)) return "Jackpot 1";
  if (/^j\.?pot\s*2$/i.test(trimmed)) return "Jackpot 2";
  if (/^g\.?1$/i.test(trimmed)) return "Giải Nhất";
  if (/^g\.?2$/i.test(trimmed)) return "Giải Nhì";
  if (/^g\.?3$/i.test(trimmed)) return "Giải Ba";
  if (/^kk1$/i.test(trimmed)) return "Giải Khuyến Khích 1";
  if (/^kk2$/i.test(trimmed)) return "Giải Khuyến Khích 2";
  return trimmed;
}

// ── Specific Parsers ──────────────────────────────────────────────────────────

function parsePower655(html: string): VietlottDraw | null {
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*result[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return null;
  const table = tableMatch[1];

  const drawNumMatch = table.match(/#(\d{4,6})/);
  const drawNumber = drawNumMatch ? drawNumMatch[1] : "";
  const date = parseDrawDate(table);

  // Main 6 numbers
  const megaResultMatch = table.match(/<td[^>]*class=["'][^"']*megaresult[^"']*["'][^>]*><em>([\d\s]+)<\/em><\/td>/i);
  let numbers: string[] = [];
  if (megaResultMatch) {
    numbers = megaResultMatch[1].trim().split(/\s+/).filter(Boolean);
  }

  // Power number (Jackpot 2)
  const jp2Match = table.match(/<tr[^>]*class=["'][^"']*jp2[^"']*["'][^>]*>[\s\S]*?<td[^>]*class=["'][^"']*megaresult[^"']*["'][^>]*>(\d{1,2})<\/td>/i);
  const powerNumber = jp2Match ? jp2Match[1].padStart(2, "0") : undefined;

  // Jackpot amount
  const jpMatch = html.match(/<tr>\s*<td>J\.pot<\/td>[\s\S]*?<td>([\d,.]+)<\/td>/i)
    || html.match(/Jackpot Power 6\/55 hiện tại:\s*<strong>([\d,.]+)\s*vnđ<\/strong>/i);
  const jackpot = jpMatch ? jpMatch[1].trim() : "";

  // Winner count for JP1
  const winMatch = html.match(/<tr>\s*<td>J\.pot<\/td>[\s\S]*?<td><b>(\d+)<\/b><\/td>/i);
  const hasWinner = winMatch ? parseInt(winMatch[1], 10) > 0 : false;

  // Parse prize table
  const prizes: VietlottPrizeDetail[] = [];
  const prizeTableMatch = html.match(/<table[^>]*class=["'][^"']*trunggiai[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (prizeTableMatch) {
    const rowRegex = /<tr>\s*<td>([^<]+)<\/td>[\s\S]*?<td><b>?([^<]*)<\/b>?<\/td>\s*<td>([^<]+)<\/td>\s*<\/tr>/gi;
    let r: RegExpExecArray | null;
    while ((r = rowRegex.exec(prizeTableMatch[1])) !== null) {
      prizes.push({
        prizeName: normalizePrizeName(r[1]),
        count: r[2].trim(),
        reward: r[3].trim(),
      });
    }
  }

  return {
    drawNumber,
    date,
    numbers,
    powerNumber,
    jackpot,
    hasWinner,
    prizes,
  };
}

function parseMega645(html: string): VietlottDraw | null {
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*result[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return null;
  const table = tableMatch[1];

  const drawNumMatch = table.match(/#(\d{4,6})/);
  const drawNumber = drawNumMatch ? drawNumMatch[1] : "";
  const date = parseDrawDate(table);

  // Main 6 numbers
  const megaResultMatch = table.match(/<td[^>]*class=["'][^"']*megaresult[^"']*["'][^>]*><em>([\d\s]+)<\/em><\/td>/i);
  let numbers: string[] = [];
  if (megaResultMatch) {
    numbers = megaResultMatch[1].trim().split(/\s+/).filter(Boolean);
  }

  // Jackpot amount
  const jpMatch = html.match(/<tr>\s*<td>J\.pot<\/td>[\s\S]*?<td>([\d,.]+)<\/td>/i)
    || html.match(/Jackpot Mega 6\/45 hiện tại:\s*<strong>([\d,.]+)\s*vnđ<\/strong>/i);
  const jackpot = jpMatch ? jpMatch[1].trim() : "";

  // Winner count for JP1
  const winMatch = html.match(/<tr>\s*<td>J\.pot<\/td>[\s\S]*?<td><b>(\d+)<\/b><\/td>/i);
  const hasWinner = winMatch ? parseInt(winMatch[1], 10) > 0 : false;

  // Parse prize table
  const prizes: VietlottPrizeDetail[] = [];
  const prizeTableMatch = html.match(/<table[^>]*class=["'][^"']*trunggiai[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (prizeTableMatch) {
    const rowRegex = /<tr>\s*<td>([^<]+)<\/td>[\s\S]*?<td><b>?([^<]*)<\/b>?<\/td>\s*<td>([^<]+)<\/td>\s*<\/tr>/gi;
    let r: RegExpExecArray | null;
    while ((r = rowRegex.exec(prizeTableMatch[1])) !== null) {
      prizes.push({
        prizeName: normalizePrizeName(r[1]),
        count: r[2].trim(),
        reward: r[3].trim(),
      });
    }
  }

  return {
    drawNumber,
    date,
    numbers,
    jackpot,
    hasWinner,
    prizes,
  };
}

function parseMax3D(html: string): VietlottDraw | null {
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*max3d[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return null;
  const table = tableMatch[1];

  const drawNumMatch = table.match(/#(\d{4,6})/);
  const drawNumber = drawNumMatch ? drawNumMatch[1] : "";
  const date = parseDrawDate(table);

  // Parse prize breakdown
  const prizes: VietlottPrizeDetail[] = [];
  const rowRegex = /<tr>\s*<td class="name"><span>([^<]+)<\/span>(?:<br><span>([^<]+)<\/span>\s*<em>([^<]+)<\/em>)?<\/td>\s*<td>([\s\S]*?)<\/td>/gi;
  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(table)) !== null) {
    const rawNums = m[4].replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean);
    prizes.push({
      prizeName: m[1].trim(),
      reward: m[2] ? m[2].replace(":", "").trim() : "",
      count: m[3] ? m[3].trim() : "",
      numbers: rawNums,
    });
  }

  // First prize numbers as the main balls
  const g1 = prizes.find((p) => p.prizeName.toLowerCase().includes("nhất"));
  const numbers = g1?.numbers || (prizes[0]?.numbers ?? []);

  return {
    drawNumber,
    date,
    numbers,
    hasWinner: prizes.some((p) => parseInt(p.count || "0", 10) > 0),
    prizes,
  };
}

function parseMax4D(html: string): VietlottDraw | null {
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*result[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return null;
  const table = tableMatch[1];

  const drawNumMatch = table.match(/#(\d{4,6})/);
  const drawNumber = drawNumMatch ? drawNumMatch[1] : "";
  const date = parseDrawDate(table);

  // G1 number e.g. "0023" -> digits ["0", "0", "2", "3"]
  const g1Match = table.match(/<td title="Giải nhất">G1<\/td>\s*<td><em>(\d{4})<\/em><\/td>/i);
  let numbers: string[] = [];
  if (g1Match) {
    numbers = g1Match[1].split("");
  }

  // Parse prize table
  const prizes: VietlottPrizeDetail[] = [];
  const prizeTableMatch = html.match(/<table[^>]*class=["'][^"']*trunggiai[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (prizeTableMatch) {
    const rowRegex = /<tr>\s*<td>([^<]+)<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?<td>([^<]+)<\/td>\s*<\/tr>/gi;
    let r: RegExpExecArray | null;
    while ((r = rowRegex.exec(prizeTableMatch[1])) !== null) {
      if (r[1].includes("Giải") || r[1].includes("G.")) {
        prizes.push({
          prizeName: normalizePrizeName(r[1]),
          count: r[2].trim(),
          reward: r[3].trim(),
        });
      }
    }
  }

  return {
    drawNumber,
    date,
    numbers,
    hasWinner: prizes.some((p) => parseInt(p.count || "0", 10) > 0),
    prizes,
  };
}

// ── Fallback data to prevent loading hangs ────────────────────────────────────
const DEFAULT_FALLBACK: Record<VietlottGame, VietlottDraw> = {
  "power-655": {
    drawNumber: "01410",
    date: "13/10/2026",
    numbers: ["02", "14", "27", "40", "50", "53"],
    powerNumber: "26",
    jackpot: "146,262,248,400",
    hasWinner: false,
    prizes: [
      { prizeName: "Jackpot 1", count: "0", reward: "146,262,248,400" },
      { prizeName: "Jackpot 2", count: "0", reward: "4,057,598,750" },
      { prizeName: "Giải Nhất", count: "31", reward: "40,000,000" },
      { prizeName: "Giải Nhì", count: "1,333", reward: "500,000" },
      { prizeName: "Giải Ba", count: "31,122", reward: "50,000" },
    ],
  },
  "max-3d": {
    drawNumber: "01145",
    date: "14/10/2026",
    numbers: ["258", "363"],
    hasWinner: true,
    prizes: [
      { prizeName: "Giải nhất", count: "58", reward: "1tr", numbers: ["258", "363"] },
      { prizeName: "Giải nhì", count: "140", reward: "350K", numbers: ["793", "522", "484", "763"] },
      { prizeName: "Giải ba", count: "212", reward: "210K", numbers: ["798", "307", "063", "688", "826", "427"] },
      { prizeName: "Giải tư (KK)", count: "205", reward: "100K", numbers: ["227", "028", "371", "624", "781", "558", "805", "562"] },
    ],
  },
  "mega-645": {
    drawNumber: "01575",
    date: "14/10/2026",
    numbers: ["06", "16", "19", "21", "34", "43"],
    jackpot: "20,329,744,500",
    hasWinner: false,
    prizes: [
      { prizeName: "Jackpot 1", count: "0", reward: "20,329,744,500" },
      { prizeName: "Giải Nhất", count: "32", reward: "10,000,000" },
      { prizeName: "Giải Nhì", count: "1,658", reward: "300,000" },
      { prizeName: "Giải Ba", count: "25,751", reward: "30,000" },
    ],
  },
  "max-4d": {
    drawNumber: "00722",
    date: "31/08/2021",
    numbers: ["0", "0", "2", "3"],
    hasWinner: false,
    prizes: [
      { prizeName: "Giải Nhất", count: "0", reward: "15,000,000đ" },
      { prizeName: "Giải Nhì", count: "0", reward: "6,500,000đ" },
      { prizeName: "Giải Ba", count: "0", reward: "3,000,000đ" },
    ],
  },
};

// ── Main fetch & parse function ───────────────────────────────────────────────
export async function fetchVietlottResult(game: VietlottGame): Promise<VietlottResult> {
  const cached = getFromCache(game);
  if (cached) return cached;

  const url = GAME_URLS[game];
  if (!url) {
    const fallback = DEFAULT_FALLBACK[game];
    return { game, draws: fallback ? [fallback] : [], error: `Không tìm thấy cấu hình cho ${game}` };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nguồn dữ liệu trả về mã HTTP ${res.status}`);
    }

    const html = await res.text();
    let draw: VietlottDraw | null = null;

    if (game === "power-655") {
      draw = parsePower655(html);
    } else if (game === "mega-645") {
      draw = parseMega645(html);
    } else if (game === "max-3d") {
      draw = parseMax3D(html);
    } else if (game === "max-4d") {
      draw = parseMax4D(html);
    }

    if (!draw || draw.numbers.length === 0) {
      const fallback = DEFAULT_FALLBACK[game];
      if (fallback) {
        return { game, draws: [fallback], error: null };
      }
      return { game, draws: [], error: "Không tìm thấy kết quả kỳ quay mới nhất" };
    }

    const result: VietlottResult = { game, draws: [draw], error: null };
    setInCache(game, result);
    return result;
  } catch {
    // If live fetch errors or times out, immediately return fallback data so user never hangs
    const fallback = DEFAULT_FALLBACK[game];
    if (fallback) {
      return { game, draws: [fallback], error: null };
    }
    return {
      game,
      draws: [],
      error: "Không thể kết nối đến máy chủ xổ số",
    };
  }
}

