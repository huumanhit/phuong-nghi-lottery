"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    const full = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (full === lastTracked.current) return;
    lastTracked.current = full;

    // Fire and forget — don't block rendering
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: full }),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
