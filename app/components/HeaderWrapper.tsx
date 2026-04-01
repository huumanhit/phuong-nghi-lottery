import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import Header from "./Header";

export default async function HeaderWrapper() {
  noStore();
  const info = await prisma.storeInfo.findUnique({ where: { id: "main" } });
  return (
    <Header
      logoUrl={info?.logoUrl ?? "/logo.png"}
      headerSettingsRaw={info?.headerSettings ?? ""}
    />
  );
}
