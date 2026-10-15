import HeaderWrapper from "@/app/components/HeaderWrapper";
import VietlottPage from "@/app/components/VietlottPage";
import { fetchVietlottResult } from "@/services/vietlottService";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Vietlott Power 6/55 Hôm Nay - PHƯƠNG NGHI",
  description: "Kết quả xổ số điện toán Vietlott Power 6/55 mới nhất hôm nay, jackpot, kỳ quay.",
};

export const revalidate = 300;

export default async function Power655Page() {
  const initialResult = await fetchVietlottResult("power-655");
  return (
    <>
      <HeaderWrapper />
      <main className="bg-gray-50 min-h-screen">
        <VietlottPage game="power-655" initialResult={initialResult} />
      </main>
    </>
  );
}
