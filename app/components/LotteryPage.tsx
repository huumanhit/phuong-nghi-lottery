"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Region,
  LotteryResult,
  StationResult,
  DailyRegionResult,
  extractLoNumbers,
  PRIZE_ORDER,
  STATION_SCHEDULE,
} from "../lib/lotteryData";
import Link from "next/link";
import CountdownTimer from "./CountdownTimer";
import MultiStationTable from "./MultiStationTable";
import LotoGrid from "./LotoGrid";
import LotoStationGrid from "./LotoStationGrid";
import RegionTabs from "./RegionTabs";
import LotoStatsPanel from "./LotoStatsPanel";
import LoDauDuoiTable from "./LoDauDuoiTable";
import LotoFrequencyPanel from "./LotoFrequencyPanel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayVN(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}


function isoToVN(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Returns last 5 days as tab descriptors, today last */
function getLast5Days(): Array<{ iso: string; label: string; isToday: boolean }> {
  const result = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label =
      i === 0
        ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
        : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ iso, label, isToday: i === 0 });
  }
  return result;
}

function emptyResult(): LotteryResult {
  return {
    special: [], first: [], second: [], third: [],
    fourth: [], fifth: [], sixth: [], seventh: [], eighth: [],
  };
}

function mergeStationResults(stations: StationResult[]): LotteryResult {
  if (stations.length === 0) return emptyResult();
  if (stations.length === 1) return stations[0].results;
  const merged = emptyResult();
  for (const key of PRIZE_ORDER) {
    merged[key as keyof LotteryResult] = stations.flatMap(
      (s) => s.results[key as keyof LotteryResult] ?? []
    );
  }
  return merged;
}

function getRevealSequence(result: LotteryResult): { prize: string; idx: number }[] {
  const seq: { prize: string; idx: number }[] = [];
  const reversed = [...PRIZE_ORDER].reverse();
  for (const prize of reversed) {
    const nums = result[prize as keyof LotteryResult];
    for (let i = 0; i < nums.length; i++) seq.push({ prize, idx: i });
  }
  return seq;
}

/** Build a StationResult from a partial (animation) result */
function buildAnimatedStation(partial: Partial<LotteryResult>): StationResult {
  return {
    stationId: "ha-noi",
    stationName: "Hà Nội",
    results: {
      special: partial.special ?? [],
      first:   partial.first   ?? [],
      second:  partial.second  ?? [],
      third:   partial.third   ?? [],
      fourth:  partial.fourth  ?? [],
      fifth:   partial.fifth   ?? [],
      sixth:   partial.sixth   ?? [],
      seventh: partial.seventh ?? [],
      eighth:  partial.eighth  ?? [],
    },
  };
}

/** Create empty station placeholders for today's draw (all spinner slots) */
function getTodayStations(r: Region): StationResult[] {
  const dayOfWeek = new Date().getDay();
  const names = STATION_SCHEDULE[r][dayOfWeek] ?? [];
  return names.map((name, i) => ({
    stationId: `today-${i}`,
    stationName: name,
    results: { special: [], first: [], second: [], third: [], fourth: [], fifth: [], sixth: [], seventh: [], eighth: [] },
  }));
}

const REGION_NAMES: Record<Region, string> = {
  mb: "MIỀN BẮC",
  mt: "MIỀN TRUNG",
  mn: "MIỀN NAM",
};

const DRAW_TIMES: Record<Region, string> = {
  mb: "18:15",
  mt: "17:30",
  mn: "16:45",
};

/** True during the Vietnamese lottery draw window: 14:00 – 21:00 every day.
 *  All regions draw within this window (MN ~16:00, MT ~17:30, MB ~18:15).
 */
function isDuringDrawHours(): boolean {
  const h = new Date().getHours();
  return h >= 14 && h < 21;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LotteryPage({ initialRegion = "mb" }: { initialRegion?: Region }) {
  const [region, setRegion] = useState<Region>(initialRegion);

  // Station data per region
  const [stationData, setStationData] = useState<Record<Region, StationResult[]>>({
    mb: [], mt: [], mn: [],
  });
  const [regionDates, setRegionDates]   = useState<Partial<Record<Region, string>>>({});
  const [regionLoading, setRegionLoading] = useState<Record<Region, boolean>>({
    mb: true, mt: false, mn: false,
  });
  const [regionError, setRegionError]   = useState<Partial<Record<Region, string>>>({});
  const fetchedRef = useRef<Set<Region>>(new Set());

  // MB animation state
  const [partialMb, setPartialMb]     = useState<Partial<LotteryResult>>({});
  const [revealedMb, setRevealedMb]   = useState<Set<string>>(new Set());
  const [isLive, setIsLive]           = useState(false);
  const [isCompleteMb, setIsCompleteMb] = useState(false);
  const [seqIdxMb, setSeqIdxMb]       = useState(0);
  const sequenceMbRef = useRef<{ prize: string; idx: number }[]>([]);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live polling state — auto-refresh during draw window
  const [isLivePolling, setIsLivePolling] = useState(false);
  const [polledRevealed, setPolledRevealed] = useState<Set<string>>(new Set());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDataRef = useRef<StationResult[]>([]);

  // Date state — "selected" drives which tab is active
  const [selectedDate, setSelectedDate]   = useState<string>("");   // "" = today (latest)
  const [dateStations, setDateStations]   = useState<StationResult[] | null>(null);
  const [dateLoading, setDateLoading]     = useState(false);
  const [dateError, setDateError]         = useState<string | null>(null);

  // isDateMode computed early so useEffects below can reference it safely
  const isDateMode = selectedDate !== "";

  // Toolbar feature state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [shareStatus, setShareStatus]       = useState<"idle" | "copied">("idle");
  const [isZoomed, setIsZoomed]             = useState(false);

  // Loto digit toggle — mutually exclusive
  const [lotoMode, setLotoMode] = useState<"units" | "tens" | null>(null);
  const toggleLoto = (mode: "units" | "tens") =>
    setLotoMode((prev) => (prev === mode ? null : mode));

  // -------------------------------------------------------------------------
  // Fetch latest for a region
  // -------------------------------------------------------------------------
  const fetchRegion = useCallback(async (r: Region) => {
    setRegionLoading((prev) => ({ ...prev, [r]: true }));
    setRegionError((prev) => { const n = { ...prev }; delete n[r]; return n; });

    try {
      const res = await fetch(`/api/lottery/daily?region=${r}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Lỗi máy chủ: HTTP ${res.status}`);
      const data = (await res.json()) as DailyRegionResult;
      if (data.error && data.stations.length === 0) throw new Error(data.error);

      setStationData((prev) => ({ ...prev, [r]: data.stations }));
      setRegionDates((prev)  => ({ ...prev, [r]: data.date }));

      if (r === "mb" && data.stations.length > 0) {
        sequenceMbRef.current = getRevealSequence(data.stations[0].results);
      }
      prevDataRef.current = data.stations;
      fetchedRef.current.add(r);
    } catch (err) {
      setRegionError((prev) => ({
        ...prev,
        [r]: err instanceof Error ? err.message : "Không thể tải dữ liệu",
      }));
    } finally {
      setRegionLoading((prev) => ({ ...prev, [r]: false }));
    }
  }, []);

  /** Silent fetch — no loading spinner, used for live polling */
  const silentFetchRegion = useCallback(async (r: Region) => {
    try {
      const res = await fetch(`/api/lottery/daily?region=${r}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as DailyRegionResult;
      if (data.error && data.stations.length === 0) return;

      // Detect newly revealed numbers vs previous poll
      const prev = prevDataRef.current;
      const newlyRevealed = new Set<string>();
      data.stations.forEach((newStation, sIdx) => {
        const prevStation = prev[sIdx];
        for (const prize of PRIZE_ORDER) {
          const newNums = newStation.results[prize as keyof LotteryResult] ?? [];
          const prevNums = prevStation?.results[prize as keyof LotteryResult] ?? [];
          newNums.forEach((num, idx) => {
            if (num && !prevNums[idx]) newlyRevealed.add(`${prize}-${idx}`);
          });
        }
      });

      prevDataRef.current = data.stations;
      setStationData((prev) => ({ ...prev, [r]: data.stations }));
      setRegionDates((prev) => ({ ...prev, [r]: data.date }));
      if (r === "mb" && data.stations.length > 0)
        sequenceMbRef.current = getRevealSequence(data.stations[0].results);
      fetchedRef.current.add(r);

      if (newlyRevealed.size > 0) {
        setPolledRevealed((prev) => new Set(Array.from(prev).concat(Array.from(newlyRevealed))));
        // Clear bounce animation after 1.5 seconds
        setTimeout(() => {
          setPolledRevealed((prev) => {
            const next = new Set(prev);
            newlyRevealed.forEach((k) => next.delete(k));
            return next;
          });
        }, 1500);
      }
    } catch { /* ignore errors during silent polling */ }
  }, []);

  useEffect(() => { fetchRegion("mb"); }, [fetchRegion]);

  useEffect(() => {
    if (stationData.mb.length > 0)
      sequenceMbRef.current = getRevealSequence(stationData.mb[0].results);
  }, [stationData.mb]);

  // -------------------------------------------------------------------------
  // Fetch by date
  // -------------------------------------------------------------------------
  const fetchByDate = useCallback(async (r: Region, dateIso: string) => {
    setDateLoading(true);
    setDateError(null);
    setDateStations(null);
    try {
      const res = await fetch(`/api/lottery/daily?region=${r}&date=${dateIso}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Lỗi máy chủ: HTTP ${res.status}`);
      const data = (await res.json()) as DailyRegionResult;
      if (data.error && data.stations.length === 0) throw new Error(data.error);
      setDateStations(data.stations);
    } catch (err) {
      setDateError(err instanceof Error ? err.message : "Không thể tải dữ liệu");
    } finally {
      setDateLoading(false);
    }
  }, []);

  const handleDateChange = useCallback((iso: string) => {
    setSelectedDate(iso);
    if (!iso) { setDateStations(null); setDateError(null); return; }
    fetchByDate(region, iso);
  }, [region, fetchByDate]);

  useEffect(() => {
    if (selectedDate) fetchByDate(region, selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  // -------------------------------------------------------------------------
  // Tab change
  // -------------------------------------------------------------------------
  const handleRegionChange = useCallback((r: Region) => {
    if (intervalRef.current) { clearInterval(intervalRef.current); setIsLive(false); }
    setRegion(r);
    if (!fetchedRef.current.has(r)) fetchRegion(r);
  }, [fetchRegion]);

  // Sync region state when URL ?region= param changes (e.g., via menu navigation)
  useEffect(() => {
    handleRegionChange(initialRegion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRegion]);

  // -------------------------------------------------------------------------
  // MB live animation
  // -------------------------------------------------------------------------
  const startLive = useCallback(() => {
    const mbResult = stationData.mb[0]?.results ?? emptyResult();
    setIsLive(true);
    setIsCompleteMb(false);
    setPartialMb({});
    setRevealedMb(new Set());
    setSeqIdxMb(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    let idx = 0;
    intervalRef.current = setInterval(() => {
      const seq = sequenceMbRef.current;
      if (idx >= seq.length) {
        clearInterval(intervalRef.current!);
        setIsLive(false);
        setIsCompleteMb(true);
        setPartialMb(mbResult);
        return;
      }
      const { prize, idx: numIdx } = seq[idx];
      const fullNums = mbResult[prize as keyof LotteryResult];
      setPartialMb((prev) => {
        const cur = { ...prev };
        const ex: string[] = (cur[prize as keyof LotteryResult] as string[]) ?? [];
        const upd = [...ex];
        upd[numIdx] = fullNums[numIdx];
        return { ...cur, [prize]: upd };
      });
      setRevealedMb((prev) => {
        const s = new Set(prev); s.add(`${prize}-${numIdx}`); return s;
      });
      idx++;
      setSeqIdxMb(idx);
    }, 350);
  }, [stationData.mb]);

  const resetMb = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsLive(false);
    setPartialMb({});
    setRevealedMb(new Set());
    setIsCompleteMb(false);
    setSeqIdxMb(0);
    fetchedRef.current.delete("mb");
    await fetchRegion("mb");
  }, [fetchRegion]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Auto live-polling: active every day 14:00–21:00 when viewing today
  // -------------------------------------------------------------------------
  useEffect(() => {
    const stopPolling = () => {
      if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    };

    if (isDateMode) {
      setIsLivePolling(false);
      stopPolling();
      return;
    }

    const startPolling = () => {
      if (pollIntervalRef.current) return; // already running
      pollIntervalRef.current = setInterval(() => silentFetchRegion(region), 12000);
    };

    const check = () => {
      // Stop polling if draw is complete (ĐB available) — check current stationData
      const currentStations = stationData[region];
      const drawDone = currentStations.length > 0 &&
        currentStations.every((s) => (s.results.special?.length ?? 0) > 0);

      if (isDuringDrawHours() && !drawDone) {
        setIsLivePolling(true);
        startPolling();
      } else {
        setIsLivePolling(false);
        stopPolling();
      }
    };

    check();
    // Re-check every minute to catch 14:00 start and 21:00 end
    const checkInterval = setInterval(check, 60000);
    return () => {
      clearInterval(checkInterval);
      stopPolling();
    };
  }, [region, isDateMode, silentFetchRegion, stationData]);

  // -------------------------------------------------------------------------
  // Derived display values
  // -------------------------------------------------------------------------
  const days = getLast5Days();

  const currentLoading = isDateMode ? dateLoading : regionLoading[region];
  const currentError   = isDateMode ? dateError   : (regionError[region] ?? null);

  // Build stations array to render
  const displayStations: StationResult[] = (() => {
    if (isDateMode) return dateStations ?? [];

    const regionDate = regionDates[region] ?? null;
    const dataIsOld  = regionDate !== null && regionDate !== getTodayVN();

    if (region === "mb") {
      if (isLive) return [buildAnimatedStation(partialMb)];
      // No data or old data → always show today's empty MB station
      // (spinners appear when isLivePolling=true, "—" otherwise)
      if (stationData.mb.length === 0 || dataIsOld)
        return [buildAnimatedStation({})];
      return stationData.mb;
    }

    // MT / MN: no/old data → always show today's empty stations for correct province names
    if (stationData[region].length === 0 || dataIsOld) {
      const todayStns = getTodayStations(region);
      if (todayStns.length > 0) return todayStns;
    }
    return stationData[region];
  })();

  const mbHasData = stationData.mb.length > 0 &&
    (stationData.mb[0]?.results.special.length ?? 0) > 0;
  const mbComplete = isDateMode ? true : isCompleteMb;

  const totalNums = sequenceMbRef.current.length;
  const progress  = totalNums > 0 ? Math.round((seqIdxMb / totalNums) * 100) : 0;

  const today    = getTodayVN();
  const drawDate = isDateMode
    ? (selectedDate ? isoToVN(selectedDate) : null)
    : (regionDates[region] ?? null);
  const isOldData = drawDate !== null && drawDate !== today;

  // Draw is complete when ĐB (special/jackpot — drawn last) is filled for ALL stations
  // Only counts if the API is already returning TODAY's data (not yesterday's)
  const isDrawComplete = !isDateMode && !isOldData && (() => {
    const stations = stationData[region];
    // Must have stations AND all special prizes filled
    if (stations.length === 0) return false;
    return stations.every((s) => (s.results.special?.length ?? 0) > 0);
  })();

  // Today's results exist (even if partial) in the API response
  const hasTodayData = !isOldData && stationData[region].length > 0;

  // Live mode: polling is on + viewing today + draw not yet done
  // (we always show today's table — either empty spinners or partial results)
  const isLiveWithTodayData = isLivePolling && !isDateMode && !isDrawComplete;

  // LotoGrid: combined lo numbers
  const loSource: LotteryResult = region === "mb"
    ? ((isCompleteMb && !isDateMode)
        ? (stationData.mb[0]?.results ?? emptyResult())
        : { ...emptyResult(), ...partialMb } as LotteryResult)
    : mergeStationResults(displayStations);
  const loNumbers = extractLoNumbers(loSource);

  // -------------------------------------------------------------------------
  // Toolbar handlers (defined after derived values so they can reference them)
  // -------------------------------------------------------------------------

  const handlePrint = (layout: "4x1" | "6x1" | "1x1") => {
    const date = drawDate ?? today;
    const stns = displayStations;

    // Day-of-week prefix (CN, T2…T7)
    const DOW_VN = ["CN","T2","T3","T4","T5","T6","T7"];
    const [dd, mm, yyyy] = date.split("/");
    const dateObj = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    const dow = DOW_VN[dateObj.getDay()] ?? "CN";
    const dateLabel = `${dow} - ${date}`;

    const isMb = region === "mb";

    // ── MN/MT: multi-station table ────────────────────────────────────────
    const MNMT_PRIZES: Array<{ key: keyof LotteryResult; label: string; money: string }> = [
      { key: "eighth",  label: "8",  money: "100N" },
      { key: "seventh", label: "7",  money: "200N" },
      { key: "sixth",   label: "6",  money: "400N" },
      { key: "fifth",   label: "5",  money: "1TR"  },
      { key: "fourth",  label: "4",  money: "3TR"  },
      { key: "third",   label: "3",  money: "10TR" },
      { key: "second",  label: "2",  money: "15TR" },
      { key: "first",   label: "1",  money: "30TR" },
      { key: "special", label: "ĐB", money: "2Tỷ"  },
    ];

    const MB_PRIZES: Array<{ key: keyof LotteryResult; label: string }> = [
      { key: "special", label: "ĐB"    },
      { key: "first",   label: "G.Nhất"},
      { key: "second",  label: "G.Nhì" },
      { key: "third",   label: "G.Ba"  },
      { key: "fourth",  label: "G.Tư"  },
      { key: "fifth",   label: "G.Năm" },
      { key: "sixth",   label: "G.Sáu" },
      { key: "seventh", label: "G.Bảy" },
    ];

    let tableHTML = "";

    if (isMb) {
      // Single station, all prizes in rows
      const s = stns[0];
      if (!s) return;
      const stationName = s.stationName;
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

      tableHTML = `
        <div class="stn-name">${stationName}</div>
        <table><tbody>${rows}</tbody></table>`;
    } else {
      // Multi-station: header row + prize sub-rows
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
          const isFirst = rowIdx === 0;
          const lbl = isFirst
            ? `<td rowspan="${maxCount}" style="${lblBg}width:${isMb ? 22 : 12}%;border:1px solid #ccc;padding:1px 2px;text-align:center;vertical-align:middle;font-weight:900;color:${isDB ? "#fff" : "#cc0000"};white-space:nowrap;">
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

      tableHTML = `
        <table style="width:100%">
          <thead><tr>
            <th style="width:12%;border:1px solid #ccc;padding:2px;background:#cc0000;color:#fff;">CN</th>
            ${headerCells}
          </tr></thead>
          <tbody>${prizeRows}</tbody>
        </table>`;
    }

    const singleTicket = `
      <div class="ticket">
        <div class="hdr">
          <div class="tit">ĐẠI LÝ VÉ SỐ PHƯƠNG NGHI</div>
          <div class="sub2">Hãy Đến Với Chúng Tôi Để Thay Đổi Cuộc Đời Bạn</div>
        </div>
        <div class="bp">
          <div class="dat">${dateLabel}</div>
          ${tableHTML}
        </div>
      </div>`;

    const cols   = layout === "1x1" ? 1 : 3;
    const copies = layout === "4x1" ? 4 : layout === "6x1" ? 6 : 1;
    const fs     = layout === "6x1" ? "7px" : layout === "4x1" ? "8px" : "11px";

    const origin = window.location.origin;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>In Vé Dò - Phương Nghi</title><link rel="icon" type="image/png" href="${origin}/logo.png"><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,Helvetica,sans-serif;font-size:${fs};background:#e8e8e8}
      .container{display:grid;grid-template-columns:repeat(${cols},1fr);gap:5px;padding:5px}
      .ticket{border:1.5px solid #aa0000;border-radius:3px;break-inside:avoid;page-break-inside:avoid;background:#fff;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.15)}
      .hdr{background:linear-gradient(180deg,#dd1111,#aa0000);padding:4px 5px;text-align:center}
      .tit{font-weight:900;color:#fff;font-size:1.1em;line-height:1.2;text-transform:uppercase;letter-spacing:.03em;text-shadow:0 1px 2px rgba(0,0,0,.3)}
      .sub2{color:rgba(255,255,255,.82);font-size:.62em;margin-top:2px;letter-spacing:.14em;text-transform:uppercase}
      .bp{padding:3px 4px 5px}
      .dat{text-align:center;font-weight:700;color:#333;font-size:.88em;margin-bottom:3px;padding-bottom:2px;border-bottom:1.5px solid #e00}
      .stn-name{text-align:center;font-weight:900;color:#cc0000;font-size:.95em;margin:2px 0 1px;text-transform:uppercase;letter-spacing:.03em}
      table{width:100%;border-collapse:collapse;margin-top:1px}
      td,th{border:1px solid #e0e0e0}
      .lbl{font-weight:900;padding:1px 2px;white-space:nowrap;vertical-align:middle;text-align:center;font-size:.85em;width:18px}
      .nums{padding:1px 3px;vertical-align:middle;text-align:center;font-weight:700;color:#222;white-space:normal;line-height:1.4}
      @page{margin:3mm}
      @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;background:#fff}}
    </style></head><body>
      <div class="container">${Array(copies).fill(singleTicket).join("")}</div>
    </body></html>`;

    const win = window.open("", "_blank", "width=900,height=650");
    if (!win) { alert("Vui lòng cho phép popup để in vé dò"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
    setShowPrintModal(false);
  };

  const handleShare = async () => {
    const url  = window.location.href;
    const text = `Kết quả XSKT ${REGION_NAMES[region]} ngày ${drawDate ?? today}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2500);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <>
    <div className="bg-gray-50">
      {/* ---- Page title ---- */}
      <div className="mb-4">
        <h1 className="text-lg font-extrabold text-red-800 uppercase tracking-wide">
          Trực Tiếp Xổ Số {REGION_NAMES[region]}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Ngày{" "}
          <span className="font-semibold text-gray-700">
            {isDateMode && selectedDate ? isoToVN(selectedDate) : today}
          </span>
          {!isDateMode && isOldData && (
            <span className="ml-2 text-xs text-orange-500 font-semibold">
              (đang chờ kết quả hôm nay)
            </span>
          )}
        </p>
      </div>

      {/* ---- Date tab pills ---- */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {days.map((day) => {
          const isActive = day.isToday ? !selectedDate : selectedDate === day.iso;
          return (
            <button
              key={day.iso}
              onClick={() => handleDateChange(day.isToday ? "" : day.iso)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-red-600 text-white shadow"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {day.label}
            </button>
          );
        })}
        <div className="ml-auto flex-shrink-0">
          <CountdownTimer isLive={isLive} />
        </div>
      </div>

      {/* ---- Waiting banner: today's results not yet available ---- */}
      {!isDateMode && !hasTodayData && !isLive && !currentLoading && (
        <div className={`mb-3 flex items-center gap-2 rounded-lg px-4 py-2.5 ${
          isLivePolling
            ? "bg-red-50 border border-red-300"
            : "bg-green-50 border border-green-300"
        }`}>
          <svg className={`animate-spin flex-shrink-0 ${isLivePolling ? "text-red-500" : "text-green-500"}`} width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 3 A9 9 0 0 1 21 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <div>
            <p className={`font-semibold text-sm ${isLivePolling ? "text-red-700" : "text-green-700"}`}>
              {isLivePolling
                ? `Đang chờ kết quả ${REGION_NAMES[region]} — tự động cập nhật mỗi 12 giây`
                : `Đang chờ Xổ Số ${REGION_NAMES[region]} lúc ${DRAW_TIMES[region]}`}
            </p>
            <p className={`text-xs ${isLivePolling ? "text-red-500" : "text-green-600"}`}>
              {isLivePolling
                ? "Số quay xong sẽ hiện lên, số chưa quay hiển thị ⏳"
                : "Kết quả sẽ xuất hiện khi xổ số bắt đầu"}
            </p>
          </div>
        </div>
      )}

      {/* ---- Live polling banner: today's results arriving ---- */}
      {isLiveWithTodayData && !isLive && !currentLoading && (
        <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-400 rounded-lg px-4 py-2.5">
          <svg className="animate-spin flex-shrink-0 text-red-600" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
            <path d="M12 3 A9 9 0 0 1 21 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <div>
            <p className="text-red-700 font-semibold text-sm">
              Đang xổ số trực tiếp — tự động cập nhật mỗi 12 giây
            </p>
            <p className="text-red-500 text-xs">Số quay xong sẽ hiện lên, số chưa quay hiển thị ⏳</p>
          </div>
        </div>
      )}

      {/* ---- Main grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left: result table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">

            {/* Panel header */}
            <div className="bg-red-700 px-4 py-2.5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-white font-extrabold text-sm leading-tight truncate">
                  XSKT {REGION_NAMES[region]}
                </div>
                <div className="text-red-200 text-xs mt-0.5">
                  Ngày {isDateMode && selectedDate ? isoToVN(selectedDate) : (drawDate ?? today)}
                </div>
              </div>
              <div className="flex-shrink-0">
                {currentLoading && (
                  <span className="bg-yellow-400 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse whitespace-nowrap">
                    ĐANG TẢI
                  </span>
                )}
                {!currentLoading && isLive && (
                  <span className="bg-green-400 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse whitespace-nowrap">
                    ● LIVE
                  </span>
                )}
                {!currentLoading && !isLive && isLiveWithTodayData && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse whitespace-nowrap">
                    ● TRỰC TIẾP
                  </span>
                )}
                {!currentLoading && displayStations.length > 0 && !isLive && !isLiveWithTodayData && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                    ● KẾT QUẢ
                  </span>
                )}
              </div>
            </div>

            {/* Region tabs */}
            <div className="px-3 pt-3">
              <RegionTabs active={region} onChange={handleRegionChange} />
            </div>

            {/* ---- Action toolbar ---- */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-t border-b border-red-100 bg-red-50 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setShowPrintModal(true)}
                disabled={displayStations.length === 0}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-red-200 rounded-lg text-red-700 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🖨️ In Vé Dò
              </button>
              <Link
                href="/doi-ve-trung"
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-red-200 rounded-lg text-red-700 hover:bg-red-100 active:scale-95 transition-all"
              >
                🔄 Đổi Số Trúng
              </Link>
              <button
                onClick={handleShare}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold border rounded-lg transition-all active:scale-95 ${
                  shareStatus === "copied"
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-red-200 text-red-700 hover:bg-red-100"
                }`}
              >
                {shareStatus === "copied" ? "✅ Đã sao chép!" : "📤 Chia Sẻ"}
              </button>
              <button
                onClick={() => setIsZoomed(true)}
                disabled={displayStations.length === 0}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-red-200 rounded-lg text-red-700 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🔍 Phóng to
              </button>
            </div>

            <div className="p-3">
              {/* Error */}
              {currentError && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <span className="font-bold">⚠</span>
                  <span>{currentError}</span>
                  {!isDateMode && region === "mb" && (
                    <button onClick={resetMb} className="ml-auto text-xs underline">Thử lại</button>
                  )}
                </div>
              )}

              {/* Loading */}
              {currentLoading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                  <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-sm">Đang tải kết quả xổ số...</span>
                </div>
              ) : (
                <>
                  {/* MB progress bar — only during replay */}
                  {region === "mb" && isLive && (
                    <div className="mb-3 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}


                  {/* Multi-station table */}
                  {displayStations.length > 0 ? (
                    <>
                      <MultiStationTable
                        stations={displayStations}
                        region={region}
                        revealed={region === "mb"
                          ? (isLive ? revealedMb : polledRevealed)
                          : polledRevealed}
                        isComplete={region === "mb"
                          ? (isLive ? mbComplete : !isLiveWithTodayData)
                          : !isLiveWithTodayData}
                        isLivePolling={isLiveWithTodayData && !isLive}
                      />
                      <LoDauDuoiTable stations={displayStations} />
                    </>
                  ) : !currentError ? (
                    <div className="py-12 text-center text-gray-400">
                      <p className="text-sm">Chưa có kết quả hôm nay</p>
                    </div>
                  ) : null}

                  {/* ── Digit toggle bar ── */}
                  {displayStations.length > 0 && (
                    <div className="flex items-center justify-around mt-3 px-2 py-2 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
                      {(["units", "tens"] as const).map((mode) => {
                        const isOn = lotoMode === mode;
                        const label = mode === "units" ? "Hàng đơn vị" : "Hàng chục";
                        return (
                          <div key={mode} className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                              {label}
                            </span>
                            <button
                              onClick={() => toggleLoto(mode)}
                              className={`relative flex items-center w-16 h-7 rounded-full transition-colors duration-200 ${
                                isOn ? "bg-green-500" : "bg-gray-400"
                              }`}
                            >
                              {isOn ? (
                                <>
                                  <span className="text-white text-[10px] font-extrabold ml-1.5">ON</span>
                                  <span className="absolute right-1 w-5 h-5 bg-white rounded-full shadow" />
                                </>
                              ) : (
                                <>
                                  <span className="absolute left-1 w-5 h-5 bg-white rounded-full shadow" />
                                  <span className="text-white text-[10px] font-extrabold ml-auto mr-1.5">OFF</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── Loto station grids ── */}
                  {lotoMode && displayStations.length > 0 && (
                    <div className="mt-3">
                      {displayStations.map((s) => (
                        <LotoStationGrid
                          key={`${lotoMode}-${s.stationId}`}
                          station={s}
                          mode={lotoMode}
                          date={drawDate ?? undefined}
                        />
                      ))}
                    </div>
                  )}

                  {/* ── Thống kê nhanh per station ── */}
                  {displayStations.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="h-px flex-1 bg-red-200" />
                        <span className="text-xs font-bold text-red-700 whitespace-nowrap uppercase tracking-wide">
                          Thống kê nhanh xổ số {REGION_NAMES[region]}
                        </span>
                        <div className="h-px flex-1 bg-red-200" />
                      </div>
                      {displayStations.map((s) => (
                        <LotoStatsPanel
                          key={s.stationId}
                          stationId={s.stationId}
                          stationName={s.stationName}
                          region={region}
                        />
                      ))}
                    </div>
                  )}

                  {/* ── Tần suất lô toàn kỳ ── */}
                  {displayStations.length > 0 && (
                    <LotoFrequencyPanel region={region} />
                  )}

                  {/* MB controls — only Refresh + optional Replay */}
                  {!isDateMode && region === "mb" && (
                    <div className="flex items-center justify-between mt-3 gap-3">
                      {/* Replay link — subtle, not prominent */}
                      {mbHasData && !isLive && (
                        <button
                          onClick={startLive}
                          className="text-xs text-gray-400 hover:text-red-600 underline transition-colors"
                        >
                          ▶ Xem quay số lại
                        </button>
                      )}
                      {isLive && (
                        <span className="text-xs text-green-600 font-semibold animate-pulse">
                          Đang quay... {progress}%
                        </span>
                      )}
                      <button
                        onClick={resetMb}
                        disabled={isLive || regionLoading.mb}
                        className={`ml-auto px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                          isLive || regionLoading.mb
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-red-700 text-red-700 hover:bg-red-50 active:scale-95"
                        }`}
                      >
                        Làm mới
                      </button>
                    </div>
                  )}

                  {/* MT/MN refresh */}
                  {!isDateMode && region !== "mb" && (
                    <div className="mt-3">
                      <button
                        onClick={() => { fetchedRef.current.delete(region); fetchRegion(region); }}
                        disabled={regionLoading[region]}
                        className={`w-full py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                          regionLoading[region]
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-red-700 text-red-700 hover:bg-red-50 active:scale-95"
                        }`}
                      >
                        Tải lại
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: LotoGrid + info */}
        <div className="lg:col-span-1">
          <LotoGrid hitNumbers={loNumbers} />

          <div className="mt-4 bg-white rounded-xl border border-red-200 shadow p-4 text-sm text-gray-600">
            <h4 className="font-bold text-red-700 mb-2">Thông Tin</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span>Khu vực:</span>
                <span className="font-semibold text-red-700">{REGION_NAMES[region]}</span>
              </li>
              <li className="flex justify-between">
                <span>Số đài hôm nay:</span>
                <span className="font-semibold">{displayStations.length || "—"}</span>
              </li>
              <li className="flex justify-between">
                <span>Ngày xổ:</span>
                <span className="font-semibold">{drawDate ?? today}</span>
              </li>
              <li className="flex justify-between">
                <span>Giờ quay:</span>
                <span className="font-semibold">{DRAW_TIMES[region]}</span>
              </li>
              <li className="flex justify-between">
                <span>Trạng thái:</span>
                <span className={`font-semibold ${
                  currentLoading      ? "text-yellow-600"
                  : isLive            ? "text-green-600"
                  : isLiveWithTodayData ? "text-red-600"
                  : displayStations.length > 0 ? "text-blue-600"
                  : "text-gray-400"
                }`}>
                  {currentLoading     ? "Đang tải"
                    : isDateMode      ? "Lịch sử"
                    : isLive          ? "Đang quay"
                    : isLiveWithTodayData ? "Đang xổ số"
                    : displayStations.length > 0 ? "Hoàn tất"
                    : "Chờ quay"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Số lô về:</span>
                <span className="font-semibold text-red-700">{loNumbers.size}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

      {/* ================================================================
          PRINT MODAL
          ================================================================ */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-red-700 text-base">Chọn loại vé dò cần in</h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Layout options */}
            <div className="flex gap-3 justify-center">
              {([
                { id: "1x1" as const, label: "In 1/1", desc: "1 vé / trang",
                  icon: (
                    <div className="w-full h-full bg-red-50 rounded-sm flex gap-0.5 p-0.5">
                      <div className="w-2.5 bg-red-400 rounded-sm" />
                      <div className="flex-1 flex flex-col gap-0.5">
                        {[1,2,3,4,5].map(i => <div key={i} className="bg-red-200 rounded-sm flex-1" />)}
                      </div>
                    </div>
                  )},
                { id: "4x1" as const, label: "In 4/1", desc: "4 vé / trang",
                  icon: <div className="grid grid-cols-2 gap-0.5 w-full h-full">{[1,2,3,4].map(i => <div key={i} className="bg-red-200 rounded-sm" />)}</div> },
                { id: "6x1" as const, label: "In 6/1", desc: "6 vé / trang",
                  icon: <div className="grid grid-cols-2 gap-0.5 w-full h-full">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-red-200 rounded-sm" />)}</div> },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handlePrint(opt.id)}
                  className="flex flex-col items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 active:scale-95 transition-all flex-1"
                >
                  <div className="w-12 h-14 border-2 border-gray-300 rounded-lg p-1">
                    {opt.icon}
                  </div>
                  <span className="text-xs font-extrabold text-gray-800">{opt.label}</span>
                  <span className="text-[10px] text-gray-400">{opt.desc}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-4">
              Số vé dò in trên mỗi trang A4
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          ZOOM MODAL (fullscreen results table)
          ================================================================ */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-red-700 flex-shrink-0">
            <span className="text-white font-extrabold text-base">
              XSKT {REGION_NAMES[region]} — {drawDate ?? today}
            </span>
            <button
              onClick={() => setIsZoomed(false)}
              className="text-white hover:text-red-200 text-2xl font-bold leading-none"
            >
              ✕
            </button>
          </div>

          {/* Scrollable table area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-3xl mx-auto">
              <MultiStationTable
                stations={displayStations}
                region={region}
                revealed={new Set()}
                isComplete={true}
              />
            </div>
          </div>

          {/* Footer hint */}
          <div className="flex-shrink-0 text-center py-2">
            <span className="text-white/50 text-xs">Nhấn ✕ hoặc bấm bên ngoài để đóng</span>
          </div>
        </div>
      )}
    </>
  );
}
