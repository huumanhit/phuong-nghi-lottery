export type Region = "mb" | "mt" | "mn";

export interface LotteryResult {
  special: string[];
  first: string[];
  second: string[];
  third: string[];
  fourth: string[];
  fifth: string[];
  sixth: string[];
  seventh: string[];
}

export interface RegionResult {
  region: Region;
  date: string;
  results: LotteryResult;
}

function rnd(digits: number): string {
  return String(Math.floor(Math.random() * Math.pow(10, digits))).padStart(digits, "0");
}

export function generateMBResult(): LotteryResult {
  return {
    special: [rnd(5)],
    first: [rnd(5)],
    second: [rnd(5), rnd(5)],
    third: [rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5)],
    fourth: [rnd(4), rnd(4), rnd(4), rnd(4)],
    fifth: [rnd(4), rnd(4), rnd(4), rnd(4), rnd(4), rnd(4)],
    sixth: [rnd(3), rnd(3), rnd(3)],
    seventh: [rnd(2), rnd(2), rnd(2), rnd(2)],
  };
}

export function generateMTResult(): LotteryResult {
  return {
    special: [rnd(5)],
    first: [rnd(5)],
    second: [rnd(5)],
    third: [rnd(5), rnd(5)],
    fourth: [rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5)],
    fifth: [rnd(4), rnd(4), rnd(4)],
    sixth: [rnd(3), rnd(3)],
    seventh: [rnd(2)],
  };
}

export function generateMNResult(): LotteryResult {
  return {
    special: [rnd(5)],
    first: [rnd(5)],
    second: [rnd(5)],
    third: [rnd(5), rnd(5)],
    fourth: [rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5)],
    fifth: [rnd(4), rnd(4), rnd(4)],
    sixth: [rnd(3), rnd(3)],
    seventh: [rnd(2)],
  };
}

export const PRIZE_LABELS: Record<string, string> = {
  special: "Giải ĐB",
  first: "Giải Nhất",
  second: "Giải Nhì",
  third: "Giải Ba",
  fourth: "Giải Tư",
  fifth: "Giải Năm",
  sixth: "Giải Sáu",
  seventh: "Giải Bảy",
};

export const PRIZE_ORDER = ["special", "first", "second", "third", "fourth", "fifth", "sixth", "seventh"];

// Total numbers revealed per prize level across all reveals
export function getTotalNumbers(result: Partial<LotteryResult>): string[] {
  return PRIZE_ORDER.flatMap((key) => result[key as keyof LotteryResult] ?? []);
}

export function extractLoNumbers(result: Partial<LotteryResult>): Set<string> {
  const all = getTotalNumbers(result);
  const set = new Set<string>();
  all.forEach((n) => {
    if (n.length >= 2) set.add(n.slice(-2));
  });
  return set;
}
