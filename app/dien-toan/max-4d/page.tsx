import HeaderWrapper from "@/app/components/HeaderWrapper";
import VietlottPage from "@/app/components/VietlottPage";
import { fetchVietlottResult } from "@/services/vietlottService";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kết Quả Vietlott Max 4D Hôm Nay - PHƯƠNG NGHI",
  description: "Kết quả xổ số điện toán Vietlott Max 4D mới nhất hôm nay, kỳ quay.",
};

export const revalidate = 300;

export default async function Max4DPage() {
  const initialResult = await fetchVietlottResult("max-4d");
  return (
    <>
      <HeaderWrapper />
      <main className="bg-gray-50 min-h-screen">
        <VietlottPage game="max-4d" initialResult={initialResult} />
      </main>
    </>
  );
}
