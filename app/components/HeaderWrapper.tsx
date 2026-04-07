import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import Header from "./Header";

// Cache store info 1 giờ — logo/settings hiếm khi thay đổi
const getStoreInfo = unstable_cache(
  async () => prisma.storeInfo.findUnique({ where: { id: "main" } }),
  ["store-info-header"],
  { revalidate: 3600 }
);

export default async function HeaderWrapper() {
  const info = await getStoreInfo();
  return (
    <Header
      logoUrl={info?.logoUrl ?? "/logo.png"}
      headerSettingsRaw={info?.headerSettings ?? ""}
    />
  );
}
