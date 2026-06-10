/**
 * One-time migration script: copy all data from Tokyo → Singapore
 * Run: npx tsx scripts/migrate-tokyo-to-sg.ts
 */
import { PrismaClient } from "@prisma/client";

const TOKYO_URL =
  "postgresql://postgres.dbjyiyzksrimaqvfxpgb:XosoDb%402026Secure@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

const SG_URL =
  "postgresql://postgres.pohqmqckaakkztdqdrlb:XosoDb%402026Secure@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

const src = new PrismaClient({ datasources: { db: { url: TOKYO_URL } } });
const dst = new PrismaClient({ datasources: { db: { url: SG_URL } } });

async function migrate() {
  console.log("Connecting to both databases...");
  await src.$connect();
  await dst.$connect();

  // StoreInfo
  {
    const rows = await src.storeInfo.findMany();
    console.log(`StoreInfo: ${rows.length} rows`);
    for (const r of rows) {
      await dst.storeInfo.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // LotterySchedule
  {
    const rows = await src.lotterySchedule.findMany();
    console.log(`LotterySchedule: ${rows.length} rows`);
    for (const r of rows) {
      await dst.lotterySchedule.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // LotteryResult (potentially large — batch)
  {
    const total = await src.lotteryResult.count();
    console.log(`LotteryResult: ${total} rows`);
    const pageSize = 200;
    for (let skip = 0; skip < total; skip += pageSize) {
      const rows = await src.lotteryResult.findMany({ skip, take: pageSize });
      for (const r of rows) {
        await dst.lotteryResult.upsert({ where: { id: r.id }, update: r, create: r });
      }
      process.stdout.write(`  ${Math.min(skip + pageSize, total)}/${total}\r`);
    }
    console.log();
  }

  // DealerPoint
  {
    const rows = await src.dealerPoint.findMany();
    console.log(`DealerPoint: ${rows.length} rows`);
    for (const r of rows) {
      await dst.dealerPoint.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // LandingSection
  {
    const rows = await src.landingSection.findMany();
    console.log(`LandingSection: ${rows.length} rows`);
    for (const r of rows) {
      await dst.landingSection.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // NewsItem
  {
    const rows = await src.newsItem.findMany();
    console.log(`NewsItem: ${rows.length} rows`);
    for (const r of rows) {
      await dst.newsItem.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // Article
  {
    const rows = await src.article.findMany();
    console.log(`Article: ${rows.length} rows`);
    for (const r of rows) {
      await dst.article.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // GalleryImage
  {
    const rows = await src.galleryImage.findMany();
    console.log(`GalleryImage: ${rows.length} rows`);
    for (const r of rows) {
      await dst.galleryImage.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // VideoItem
  {
    const rows = await src.videoItem.findMany();
    console.log(`VideoItem: ${rows.length} rows`);
    for (const r of rows) {
      await dst.videoItem.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // JobPosting
  {
    const rows = await src.jobPosting.findMany();
    console.log(`JobPosting: ${rows.length} rows`);
    for (const r of rows) {
      await dst.jobPosting.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // Employee
  {
    const rows = await src.employee.findMany();
    console.log(`Employee: ${rows.length} rows`);
    for (const r of rows) {
      await dst.employee.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // User (migrate users if any)
  {
    const rows = await src.user.findMany();
    console.log(`User: ${rows.length} rows`);
    for (const r of rows) {
      await dst.user.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  // LotteryTicket (depends on User — migrate after)
  {
    const rows = await src.lotteryTicket.findMany();
    console.log(`LotteryTicket: ${rows.length} rows`);
    for (const r of rows) {
      await dst.lotteryTicket.upsert({ where: { id: r.id }, update: r, create: r });
    }
  }

  console.log("\n✅ Migration complete!");
  await src.$disconnect();
  await dst.$disconnect();
}

migrate().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
