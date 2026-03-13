import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") ?? "mt";

  const urls: Record<string, string> = {
    mb: "https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss",
    mt: "https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss",
    mn: "https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss",
  };

  const url = urls[region] ?? urls.mt;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (compatible; LotterySiteBot/1.0)",
      },
    });
    const text = await res.text();

    // Extract all <item> titles and first 1000 chars of each description
    const itemMatches = Array.from(text.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi));
    const items = itemMatches.map((m) => {
      const block = m[1];
      const title =
        block.match(/<title>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/title>/i)?.[1] ??
        block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
      const desc =
        block.match(/<description>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/description>/i)?.[1] ??
        block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ?? "";
      return { title: title.trim(), descPreview: desc.slice(0, 1500) };
    });

    return NextResponse.json({
      status: res.status,
      region,
      itemCount: items.length,
      items,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
