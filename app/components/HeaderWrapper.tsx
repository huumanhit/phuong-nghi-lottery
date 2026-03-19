import { prisma } from "@/lib/prisma";
import Header from "./Header";

export default async function HeaderWrapper() {
  const info = await prisma.storeInfo.findUnique({ where: { id: "main" } });
  return <Header logoUrl={info?.logoUrl ?? "/logo.png"} />;
}
