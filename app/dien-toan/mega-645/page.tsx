import Header from "@/app/components/Header";
import VietlottPage from "@/app/components/VietlottPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Vietlott Mega 6/45 Hôm Nay - PHƯƠNG NGHI",
  description: "Kết quả xổ số điện toán Vietlott Mega 6/45 mới nhất hôm nay, jackpot, kỳ quay.",
};

export default function Mega645Page() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <VietlottPage game="mega-645" />
      </main>
    </>
  );
}
