/** All provinces that belong to Miền Bắc */
const MB_PROVINCES_LOWER = ["hà nội", "ha noi"];

/** All provinces that belong to Miền Trung */
const MT_PROVINCES_LOWER = [
  "đà nẵng", "da nang",
  "thừa thiên huế", "thua thien hue",
  "quảng nam", "quang nam",
  "quảng ngãi", "quang ngai",
  "bình định", "binh dinh",
  "phú yên", "phu yen",
  "khánh hòa", "khanh hoa",
  "ninh thuận", "ninh thuan",
  "bình thuận", "binh thuan",
  "gia lai", "kon tum",
  "đắk lắk", "dak lak",
  "đắk nông", "dak nong",
];

export function getRegionByProvince(province: string): "mb" | "mt" | "mn" {
  const p = province.toLowerCase();
  if (MB_PROVINCES_LOWER.some((v) => p.includes(v))) return "mb";
  if (MT_PROVINCES_LOWER.some((v) => p.includes(v)))  return "mt";
  return "mn";
}

/** MB tickets have 5 digits; MN/MT have 6 digits */
export function getTicketDigits(province: string): 5 | 6 {
  return getRegionByProvince(province) === "mb" ? 5 : 6;
}
