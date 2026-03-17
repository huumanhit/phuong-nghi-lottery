import type { StationResult, LotteryResult } from "@/app/lib/lotteryData";

export type PrintLayout = "4x1" | "6x1" | "1x1";

const DOW_VN = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Convert YYYY-MM-DD → "T2 - 17/03/2026" */
export function isoToDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const dow = DOW_VN[d.getDay()] ?? "CN";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dow} - ${dd}/${mm}/${yyyy}`;
}

/** Convert DD/MM/YYYY → YYYY-MM-DD */
export function displayToIso(display: string): string {
  const [dd, mm, yyyy] = display.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

const MNMT_PRIZES: Array<{ key: keyof LotteryResult; label: string; money: string }> = [
  { key: "eighth",  label: "8",     money: "100N" },
  { key: "seventh", label: "7",     money: "200N" },
  { key: "sixth",   label: "6",     money: "400N" },
  { key: "fifth",   label: "5",     money: "1TR"  },
  { key: "fourth",  label: "4",     money: "3TR"  },
  { key: "third",   label: "3",     money: "10TR" },
  { key: "second",  label: "2",     money: "15TR" },
  { key: "first",   label: "1",     money: "30TR" },
  { key: "special", label: "ĐB",    money: "2Tỷ"  },
];

const MB_PRIZES: Array<{ key: keyof LotteryResult; label: string }> = [
  { key: "special", label: "ĐB"     },
  { key: "first",   label: "G.Nhất" },
  { key: "second",  label: "G.Nhì"  },
  { key: "third",   label: "G.Ba"   },
  { key: "fourth",  label: "G.Tư"   },
  { key: "fifth",   label: "G.Năm"  },
  { key: "sixth",   label: "G.Sáu"  },
  { key: "seventh", label: "G.Bảy"  },
];

/** Build the inner table HTML for one date+region block */
export function buildTableHTML(stns: StationResult[], isMb: boolean): string {
  if (isMb) {
    const s = stns[0];
    if (!s) return "";
    const rows = MB_PRIZES.map(({ key, label }) => {
      const nums: string[] = s.results[key] ?? [];
      if (nums.length === 0) return "";
      const isDB = key === "special";
      const isFirst = key === "first";
      const isSeventh = key === "seventh";
      const numStyle = isDB
        ? "font-size:1.4em;font-weight:900;color:#cc0000;"
        : isFirst
        ? "font-size:1.15em;font-weight:900;color:#cc0000;"
        : isSeventh
        ? "font-size:1.1em;font-weight:900;color:#cc0000;"
        : "font-weight:700;color:#222;";
      const rowBg = isDB ? "background:#fff0f0;" : "";
      const lblBg = isDB ? "background:#cc0000;color:#fff;" : "";
      return `<tr style="${rowBg}">
        <td class="lbl" style="${lblBg}">${label}</td>
        <td class="nums" style="${numStyle}">${nums.join("&nbsp;&nbsp;&nbsp;")}</td>
      </tr>`;
    }).filter(Boolean).join("");

    return `<div class="stn-name">${s.stationName}</div><table><tbody>${rows}</tbody></table>`;
  }

  const colW = stns.length > 0 ? Math.floor(72 / stns.length) : 24;
  const headerCells = stns.map((s) =>
    `<th style="width:${colW}%;border:1px solid #ccc;padding:2px 3px;background:#cc0000;color:#fff;font-size:.95em;">${s.stationName}</th>`
  ).join("");

  const prizeRows = MNMT_PRIZES.map(({ key, label, money }) => {
    const hasAny = stns.some((s) => (s.results[key] ?? []).length > 0);
    if (!hasAny) return "";
    const maxCount = Math.max(...stns.map((s) => (s.results[key] ?? []).length), 1);
    const isDB = key === "special";
    const isEighth = key === "eighth";
    const lblBg = isDB ? "background:#cc0000;color:#fff;" : "background:#fff3f3;";
    const numStyle = isDB
      ? "font-size:1.2em;font-weight:900;color:#cc0000;"
      : isEighth
      ? "font-size:1.1em;font-weight:900;color:#cc0000;"
      : "font-weight:700;color:#222;";

    return Array.from({ length: maxCount }, (_, rowIdx) => {
      const isFirstRow = rowIdx === 0;
      const lbl = isFirstRow
        ? `<td rowspan="${maxCount}" style="${lblBg}width:12%;border:1px solid #ccc;padding:1px 2px;text-align:center;vertical-align:middle;font-weight:900;color:${isDB ? "#fff" : "#cc0000"};white-space:nowrap;">
            <div>${label}</div><div style="font-size:.75em;font-weight:400;color:${isDB ? "rgba(255,255,255,0.8)" : "#999"}">${money}</div>
          </td>`
        : "";
      const numCells = stns.map((s) => {
        const num = (s.results[key] ?? [])[rowIdx];
        return `<td style="border:1px solid #ccc;padding:1px 3px;text-align:center;${numStyle}">${num ?? ""}</td>`;
      }).join("");
      return `<tr>${lbl}${numCells}</tr>`;
    }).join("");
  }).filter(Boolean).join("");

  return `<table style="width:100%">
    <thead><tr>
      <th style="width:12%;border:1px solid #ccc;padding:2px;background:#cc0000;color:#fff;">CN</th>
      ${headerCells}
    </tr></thead>
    <tbody>${prizeRows}</tbody>
  </table>`;
}

/** Build one ticket HTML block */
export function buildTicketHTML(
  stns: StationResult[],
  isMb: boolean,
  dateLabel: string
): string {
  const tableHTML = buildTableHTML(stns, isMb);
  return `<div class="ticket">
    <div class="tit">ĐẠI LÝ VÉ SỐ PHƯƠNG NGHI</div>
    <div class="sub2">BỘ VÉ PHÓNG TO BÁN HÓA ĐƠN HÀNG TUẦN</div>
    <div class="dat">${dateLabel}</div>
    ${tableHTML}
  </div>`;
}

/** Open a print window with an array of ticket HTMLs */
export function openPrintWindow(tickets: string[], layout: PrintLayout): void {
  const cols   = layout === "1x1" ? 1 : layout === "4x1" ? 2 : 3;
  const fs     = layout === "6x1" ? "7px" : layout === "4x1" ? "8px" : "11px";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>In Vé Dò</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;font-size:${fs}}
    .container{display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;padding:4px}
    .ticket{border:1px dashed #999;padding:5px 4px 4px;break-inside:avoid;page-break-inside:avoid}
    .tit{font-weight:900;color:#cc0000;text-align:center;font-size:1.15em;line-height:1.3;text-transform:uppercase}
    .sub2{text-align:center;color:#555;font-size:.82em;margin-top:1px}
    .dat{text-align:center;font-weight:700;color:#333;font-size:.9em;margin:2px 0 3px}
    .stn-name{text-align:center;font-weight:900;color:#cc0000;font-size:1em;margin-bottom:2px;text-transform:uppercase}
    table{width:100%;border-collapse:collapse;margin-top:2px}
    .lbl{width:22px;font-weight:900;color:#cc0000;padding:1px 2px;white-space:nowrap;vertical-align:middle;border:1px solid #ddd;text-align:center;background:#fff3f3}
    .nums{padding:1px 4px;vertical-align:middle;border:1px solid #ddd;text-align:center}
    @page{margin:4mm}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body>
    <div class="container">${tickets.join("")}</div>
  </body></html>`;

  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) { alert("Vui lòng cho phép popup để in vé dò"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

/** Get all dates (YYYY-MM-DD) between from and to inclusive, max 62 */
export function getDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(from + "T00:00:00");
  const end   = new Date(to   + "T00:00:00");
  const curr  = new Date(start);
  let count = 0;
  while (curr <= end && count < 62) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
    count++;
  }
  return dates;
}
