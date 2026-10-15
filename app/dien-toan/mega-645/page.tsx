import HeaderWrapper from "@/app/components/HeaderWrapper";
import VietlottPage from "@/app/components/VietlottPage";
import { fetchVietlottResult } from "@/services/vietlottService";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Vietlott Mega 6/45 Hôm Nay - PHƯƠNG NGHI",
  description: "Kết quả xổ số điện toán Vietlott Mega 6/45 mới nhất hôm nay, jackpot, kỳ quay.",
};

export const revalidate = 300;

export default async function Mega645Page() {
  const initialResult = await fetchVietlottResult("mega-645");
  return (
    <>
      <HeaderWrapper />
      <main className="bg-gray-50 min-h-screen">
        <VietlottPage game="mega-645" initialResult={initialResult} />
      </main>
    </>
  );
}
