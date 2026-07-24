export type Region = "mb" | "mt" | "mn";

// ---------------------------------------------------------------------------
// Station types
// ---------------------------------------------------------------------------

export interface StationResult {
  stationId: string;    // slug: "ben-tre"
  stationName: string;  // display: "Bến Tre"
  results: LotteryResult;
}

export interface DailyRegionResult {
  date: string;         // "DD/MM/YYYY"
  region: Region;
  stations: StationResult[];
  error: string | null;
}

// ---------------------------------------------------------------------------
// Station schedules: day-of-week (0=Sun) → station names
// ---------------------------------------------------------------------------

export const STATION_SCHEDULE: Record<Region, Record<number, string[]>> = {
  mb: {
    0: ["Hà Nội"], 1: ["Hà Nội"], 2: ["Hà Nội"],
    3: ["Hà Nội"], 4: ["Hà Nội"], 5: ["Hà Nội"], 6: ["Hà Nội"],
  },
  mt: {
    0: ["Khánh Hòa", "Thừa Thiên Huế"],
    1: ["Thừa Thiên Huế", "Phú Yên"],
    2: ["Đắk Lắk", "Quảng Nam"],
    3: ["Đà Nẵng", "Khánh Hòa"],
    4: ["Bình Định", "Quảng Trị", "Quảng Bình"],
    5: ["Gia Lai", "Ninh Thuận"],
    6: ["Đà Nẵng", "Quảng Ngãi", "Đắk Nông"],
  },
  mn: {
    0: ["Tiền Giang", "Kiên Giang", "Đà Lạt"],
    1: ["TP. HCM", "Đồng Tháp", "Cà Mau"],
    2: ["Bến Tre", "Vũng Tàu", "Bạc Liêu"],
    3: ["Đồng Nai", "Cần Thơ", "Sóc Trăng"],
    4: ["Tây Ninh", "An Giang", "Bình Thuận"],
    5: ["Bình Dương", "Vĩnh Long", "Trà Vinh"],
    6: ["TP. HCM", "Long An", "Bình Phước", "Hậu Giang"],
  },
};

export const DOW_LABELS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export function getDowLabel(dateIso: string): string | null {
  if (!dateIso) return null;
  let y = 0, m = 0, d = 0;
  if (dateIso.includes("-")) {
    const parts = dateIso.split("-").map(Number);
    y = parts[0]; m = parts[1]; d = parts[2];
  } else if (dateIso.includes("/")) {
    const parts = dateIso.split("/").map(Number);
    if (parts[2] > 1000) { d = parts[0]; m = parts[1]; y = parts[2]; }
    else if (parts[0] > 1000) { y = parts[0]; m = parts[1]; d = parts[2]; }
  }
  if (!y || !m || !d) return null;
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj.getTime())) return null;
  return DOW_LABELS[dateObj.getDay()] ?? null;
}

export function getStationsForDate(dateIso: string): Array<{ id: string; name: string; region: Region }> {
  if (!dateIso) return [];
  let y = 0, m = 0, d = 0;
  if (dateIso.includes("-")) {
    const parts = dateIso.split("-").map(Number);
    y = parts[0]; m = parts[1]; d = parts[2];
  } else if (dateIso.includes("/")) {
    const parts = dateIso.split("/").map(Number);
    if (parts[2] > 1000) { d = parts[0]; m = parts[1]; y = parts[2]; }
    else if (parts[0] > 1000) { y = parts[0]; m = parts[1]; d = parts[2]; }
  }
  if (!y || !m || !d) return [];
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj.getTime())) return [];

  const dow = dateObj.getDay();
  const scheduledNames: string[] = [
    ...(STATION_SCHEDULE.mb[dow] ?? []),
    ...(STATION_SCHEDULE.mt[dow] ?? []),
    ...(STATION_SCHEDULE.mn[dow] ?? []),
  ];

  return scheduledNames
    .map((name) => {
      const norm = normalizeStationName(name);
      return ALL_STATIONS.find((s) => normalizeStationName(s.name) === norm);
    })
    .filter(Boolean) as typeof ALL_STATIONS;
}

// ---------------------------------------------------------------------------
// All stations flat list (for TicketChecker dropdown)
// ---------------------------------------------------------------------------

export const ALL_STATIONS: Array<{ id: string; name: string; region: Region }> = [
  // Miền Bắc
  { id: "ha-noi",        name: "Hà Nội",          region: "mb" },
  // Miền Trung
  { id: "da-nang",       name: "Đà Nẵng",          region: "mt" },
  { id: "khanh-hoa",     name: "Khánh Hòa",        region: "mt" },
  { id: "thua-thien-hue",name: "Thừa Thiên Huế",   region: "mt" },
  { id: "phu-yen",       name: "Phú Yên",           region: "mt" },
  { id: "dak-lak",       name: "Đắk Lắk",           region: "mt" },
  { id: "quang-nam",     name: "Quảng Nam",         region: "mt" },
  { id: "binh-dinh",     name: "Bình Định",         region: "mt" },
  { id: "quang-tri",     name: "Quảng Trị",         region: "mt" },
  { id: "quang-binh",    name: "Quảng Bình",        region: "mt" },
  { id: "gia-lai",       name: "Gia Lai",            region: "mt" },
  { id: "ninh-thuan",    name: "Ninh Thuận",        region: "mt" },
  { id: "quang-ngai",    name: "Quảng Ngãi",        region: "mt" },
  { id: "dak-nong",      name: "Đắk Nông",          region: "mt" },
  // Miền Nam
  { id: "tp-hcm",        name: "TP. HCM",           region: "mn" },
  { id: "dong-nai",      name: "Đồng Nai",          region: "mn" },
  { id: "ben-tre",       name: "Bến Tre",           region: "mn" },
  { id: "vung-tau",      name: "Vũng Tàu",          region: "mn" },
  { id: "bac-lieu",      name: "Bạc Liêu",          region: "mn" },
  { id: "tien-giang",    name: "Tiền Giang",        region: "mn" },
  { id: "kien-giang",    name: "Kiên Giang",        region: "mn" },
  { id: "da-lat",        name: "Đà Lạt",            region: "mn" },
  { id: "long-an",       name: "Long An",           region: "mn" },
  { id: "dong-thap",     name: "Đồng Tháp",         region: "mn" },
  { id: "can-tho",       name: "Cần Thơ",           region: "mn" },
  { id: "soc-trang",     name: "Sóc Trăng",         region: "mn" },
  { id: "an-giang",      name: "An Giang",           region: "mn" },
  { id: "binh-thuan",    name: "Bình Thuận",        region: "mn" },
  { id: "binh-duong",    name: "Bình Dương",        region: "mn" },
  { id: "vinh-long",     name: "Vĩnh Long",         region: "mn" },
  { id: "tra-vinh",      name: "Trà Vinh",          region: "mn" },
  { id: "binh-phuoc",    name: "Bình Phước",        region: "mn" },
  { id: "hau-giang",     name: "Hậu Giang",         region: "mn" },
  { id: "ca-mau",        name: "Cà Mau",            region: "mn" },
  { id: "tay-ninh",      name: "Tây Ninh",          region: "mn" },
  { id: "kon-tum",       name: "Kon Tum",           region: "mt" },
  { id: "ba-ria-vung-tau", name: "Bà Rịa - Vũng Tàu", region: "mn" },
];

const STATION_ALIASES: Record<string, string> = {
  // Miền Nam
  "hồ chí minh": "TP. HCM",
  "ho chi minh": "TP. HCM",
  "tp.hcm": "TP. HCM",
  "tphcm": "TP. HCM",
  "thành phố hồ chí minh": "TP. HCM",
  "bà rịa": "Vũng Tàu",
  "bà rịa - vũng tàu": "Vũng Tàu",
  "bà rịa vũng tàu": "Vũng Tàu",
  "br-vt": "Vũng Tàu",
  "brvt": "Vũng Tàu",
  "lâm đồng": "Đà Lạt",
  // Miền Trung
  "thừa thiên huế": "Thừa Thiên Huế",
  "tt. huế": "Thừa Thiên Huế",
  "t.t. huế": "Thừa Thiên Huế",
  "thừa t. huế": "Thừa Thiên Huế",
  "tt-huế": "Thừa Thiên Huế",
  "huế": "Thừa Thiên Huế",
  "đắc lắc": "Đắk Lắk",
  "đăk lăk": "Đắk Lắk",
  "đăk lắc": "Đắk Lắk",
  "đắc nông": "Đắk Nông",
  "đăk nông": "Đắk Nông",
  // Miền Bắc
  "truyền thống": "Hà Nội",
  "miền bắc": "Hà Nội",
  "xsmb": "Hà Nội",
};

export function normalizeStationName(name: string): string {
  if (!name) return "";
  const key = name.trim().toLowerCase();
  return STATION_ALIASES[key] ?? name.trim();
}

/** Slugify a Vietnamese station name */
export function stationSlug(name: string): string {
  const norm = normalizeStationName(name);
  return norm
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface LotteryResult {
  special: string[];
  first: string[];
  second: string[];
  third: string[];
  fourth: string[];
  fifth: string[];
  sixth: string[];
  seventh: string[];
  eighth: string[];  // MN/MT only — 4 × 2-digit numbers
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
    eighth: [],
  };
}

export function generateMTResult(): LotteryResult {
  return {
    special: [rnd(6)],
    first: [rnd(5)],
    second: [rnd(5)],
    third: [rnd(5), rnd(5)],
    fourth: [rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5)],
    fifth: [rnd(4)],
    sixth: [rnd(3), rnd(3), rnd(3)],
    seventh: [rnd(3), rnd(3), rnd(3), rnd(3)],
    eighth: [rnd(2), rnd(2), rnd(2), rnd(2)],
  };
}

export function generateMNResult(): LotteryResult {
  return {
    special: [rnd(6)],
    first: [rnd(5)],
    second: [rnd(5)],
    third: [rnd(5), rnd(5)],
    fourth: [rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5), rnd(5)],
    fifth: [rnd(4)],
    sixth: [rnd(3), rnd(3), rnd(3)],
    seventh: [rnd(3), rnd(3), rnd(3), rnd(3)],
    eighth: [rnd(2), rnd(2), rnd(2), rnd(2)],
  };
}

export const PRIZE_LABELS: Record<string, string> = {
  special: "Giải ĐB",
  special_sub: "Giải Phụ ĐB",
  consolation: "Giải Khuyến Khích",
  first: "Giải Nhất",
  second: "Giải Nhì",
  third: "Giải Ba",
  fourth: "Giải Tư",
  fifth: "Giải Năm",
  sixth: "Giải Sáu",
  seventh: "Giải Bảy",
  eighth: "Giải Tám",
};

export const PRIZE_ORDER = ["special", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

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

export function extract3DigitLoNumbers(result: Partial<LotteryResult>): Set<string> {
  const all = getTotalNumbers(result);
  const set = new Set<string>();
  all.forEach((n) => {
    if (n.length >= 3) set.add(n.slice(-3));
  });
  return set;
}
