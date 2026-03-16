import { prisma } from "@/lib/prisma";

export async function getUserTickets(userId: string) {
  return prisma.lotteryTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTicket(
  userId: string,
  data: { province: string; drawDate: string; ticketNumber: string }
) {
  return prisma.lotteryTicket.create({
    data: {
      userId,
      province:     data.province,
      drawDate:     new Date(data.drawDate),
      ticketNumber: data.ticketNumber.trim(),
    },
  });
}

export async function deleteTicket(id: string, userId: string) {
  // Ensure the ticket belongs to the user before deleting
  const ticket = await prisma.lotteryTicket.findFirst({ where: { id, userId } });
  if (!ticket) return null;
  return prisma.lotteryTicket.delete({ where: { id } });
}

export async function getPendingTickets() {
  return prisma.lotteryTicket.findMany({
    where: { status: "pending" },
    include: { user: { select: { id: true, email: true } } },
  });
}

export async function updateTicketStatus(
  id: string,
  status: "win" | "lose"
) {
  return prisma.lotteryTicket.update({
    where: { id },
    data: { status },
  });
}
