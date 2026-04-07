import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";

// Re-export the Prisma User type as our User type
export type User = PrismaUser;

export interface UserProfile {
  businessName: string;
  ownerName: string;
  businessType: string;
  phone: string;
  city: string;
  state: string;
  hours: string;
  services: string;
  firstMessage: string;
  personality: string;
  instructions: string;
  afterHoursMessage: string;
  holidayMessage: string;
}

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function readUsers(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createUser(data: {
  name: string;
  business: string;
  email: string;
  password: string;
}): Promise<User> {
  const parts = data.name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "";
  const digits = Math.floor(10000 + Math.random() * 90000).toString();
  const username = `${firstName}${lastInitial}${digits}`;

  return prisma.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      username,
    },
  });
}

export async function updateUser(id: string, data: Parameters<typeof prisma.user.update>[0]["data"]): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}
