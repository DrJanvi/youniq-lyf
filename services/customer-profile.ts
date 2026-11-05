import "server-only";
import type { UserGender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const customerProfileSelect = {
  name: true,
  email: true,
  phone: true,
  gender: true,
  dateOfBirth: true,
} as const;

export async function getCustomerProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: customerProfileSelect,
  });
}

export async function updateCustomerProfile(
  userId: string,
  input: {
    name: string;
    phone: string;
    gender: UserGender | "";
    dateOfBirth: string;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone || null,
      gender: input.gender || null,
      dateOfBirth: input.dateOfBirth
        ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
        : null,
    },
    select: customerProfileSelect,
  });
}
