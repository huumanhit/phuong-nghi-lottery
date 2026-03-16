import Header from "@/app/components/Header";
import VietlottPage from "@/app/components/VietlottPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Vietlott Power 6/55 Hôm Nay - PHƯƠNG NGHI",
  description: "Kết quả xổ số điện toán Vietlott Power 6/55 mới nhất hôm nay, jackpot, kỳ quay.",
};

export default function Power655Page() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <VietlottPage game="power-655" />
      </main>
    </>
  );
}
