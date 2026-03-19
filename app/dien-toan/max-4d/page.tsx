import HeaderWrapper from "@/app/components/HeaderWrapper";
import VietlottPage from "@/app/components/VietlottPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Vietlott Max 4D Hôm Nay - PHƯƠNG NGHI",
  description: "Kết quả xổ số điện toán Vietlott Max 4D mới nhất hôm nay, kỳ quay.",
};

export default function Max4DPage() {
  return (
    <>
      <HeaderWrapper />
      <main className="bg-gray-50 min-h-screen">
        <VietlottPage game="max-4d" />
      </main>
    </>
  );
}
