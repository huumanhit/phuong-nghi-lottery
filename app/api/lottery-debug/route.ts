import { NextResponse } from "next/server";

export async function GET() {
  const url = "https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss";
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (compatible; LotterySiteBot/1.0)",
      },
    });
    const text = await res.text();
    // Return first 3000 chars so we can see the structure
    return NextResponse.json({ status: res.status, raw: text.slice(0, 3000) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
