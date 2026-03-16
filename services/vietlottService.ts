/**
 * vietlottService.ts
 *
 * Fetches Vietlott results (Mega 6/45, Power 6/55, Max4D)
 * from xskt.com.vn HTML pages and parses the numbers.
 */

export type VietlottGame = "mega-645" | "power-655" | "max-4d";

export interface VietlottDraw {
  drawNumber: string;   // e.g. "01484"
  date:       string;   // e.g. "15/03/2026"
  numbers:    string[]; // e.g. ["04","07","11","26","42","44"]
  powerNumber?: string; // Power 6/55 only
  jackpot?:   string;   // e.g. "24.896.153.000"
  hasWinner:  boolean;
}

export interface VietlottResult {
  game:  VietlottGame;
  draws: VietlottDraw[];
  error: string | null;
}

// ── Source URLs ───────────────────────────────────────────────────────────────
const GAME_URLS: Record<VietlottGame, string> = {
  "mega-645":  "https://xskt.com.vn/mega-645",
  "power-655": "https://xskt.com.vn/power-655",
  "max-4d":    "https://xskt.com.vn/max-4d",
};

// ── Game config ───────────────────────────────────────────────────────────────
const GAME_CONFIG: Record<VietlottGame, { count: number; max: number; hasPower: boolean }> = {
  "mega-645":  { count: 6, max: 45, hasPower: false },
  "power-655": { count: 6, max: 55, hasPower: true  },
  "max-4d":    { count: 4, max: 9,  hasPower: false },
};

// ── Strip HTML tags ───────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi,  " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");
}

// ── Parse a date string from Vietnamese text ──────────────────────────────────
function parseDate(text: string): string {
  // matches: 15/03/2026 or 15-03-2026
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) return `${m[1].padStart(2,"0")}/${m[2].padStart(2,"0")}/${m[3]}`;
  return "";
}

// ── Extract Mega/Power winning-number sequences (6 padded 2-digit numbers) ───
function extractBallSequences(text: string, count: number, maxVal: number): string[][] {
  const results: string[][] = [];
  // Match sequences of `count` space-separated 2-digit numbers within valid range
  const numPart = `(0[1-9]|[0-${Math.floor(maxVal / 10)}][0-9]|${Math.floor(maxVal / 10) + 1 <= 9 ? `[0-${Math.floor(maxVal/10)+1}]` : maxVal}[0-${maxVal % 10}])`;

  // Simpler: grab any sequence of `count` 2-digit numbers (01-max) separated by whitespace
  const seqRegex = new RegExp(
    `\\b${Array(count).fill("(\\d{2})").join("\\s+")}\\b`,
    "g"
  );
  let m: RegExpExecArray | null;
  while ((m = seqRegex.exec(text)) !== null) {
    const nums = m.slice(1);
    // Validate all numbers in valid range
    if (nums.every((n) => {
      const v = parseInt(n, 10);
      return v >= 1 && v <= maxVal;
    })) {
      results.push(nums);
    }
  }
  return results;
}

// ── Extract 4-digit Max4D numbers ────────────────────────────────────────────
function extractMax4D(text: string): string[][] {
  const results: string[][] = [];
  // 4-digit sequences
  const seqRegex = /\b(\d{4})\s+(\d{4})\s+(\d{4})\s+(\d{4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = seqRegex.exec(text)) !== null) {
    results.push([m[1], m[2], m[3], m[4]]);
  }
  return results;
}

// ── Extract jackpot amount ────────────────────────────────────────────────────
function extractJackpot(text: string): string {
  // e.g. "24.896.153.000" or "24,896,153,000"
  const m = text.match(/[\d]{2,3}[.,][\d]{3}[.,][\d]{3}[.,][\d]{3}/);
  return m ? m[0] : "";
}

// ── Extract draw number ───────────────────────────────────────────────────────
function extractDrawNumber(text: string): string {
  const m = text.match(/#?(\d{5,6})/);
  return m ? m[1] : "";
}

// ── Main fetch & parse function ───────────────────────────────────────────────
export async function fetchVietlottResult(game: VietlottGame): Promise<VietlottResult> {
  const url    = GAME_URLS[game];
  const config = GAME_CONFIG[game];

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const text = stripHtml(html);

    // Try to find number sequences
    let sequences: string[][];
    if (game === "max-4d") {
      sequences = extractMax4D(text);
    } else {
      sequences = extractBallSequences(text, config.count, config.max);
    }

    if (sequences.length === 0) {
      return { game, draws: [], error: "Không tìm thấy kết quả" };
    }

    // First sequence = latest draw numbers
    const numbers   = sequences[0];
    const jackpot   = extractJackpot(text);
    const drawNum   = extractDrawNumber(text);
    const dateMatch = parseDate(text);

    // Check if there's a winner mention
    const hasWinner = /trúng|winner|jackpot\s*1/i.test(text.slice(0, 5000));

    // For Power 6/55, last number is the "power number"
    let mainNumbers  = numbers;
    let powerNumber: string | undefined;
    if (game === "power-655" && numbers.length === 6) {
      mainNumbers = numbers.slice(0, 5);
      powerNumber = numbers[5];
    }

    const draw: VietlottDraw = {
      drawNumber: drawNum,
      date:       dateMatch,
      numbers:    mainNumbers,
      powerNumber,
      jackpot,
      hasWinner,
    };

    return { game, draws: [draw], error: null };
  } catch (err) {
    return {
      game,
      draws: [],
      error: err instanceof Error ? err.message : "Lỗi không xác định",
    };
  }
}
