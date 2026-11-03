import "server-only";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const addressSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  addressLine: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  isDefault: true,
} as const;

export type SavedAddressDTO = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};

export type SavedAddressInput = Omit<SavedAddressDTO, "id" | "isDefault"> & {
  isDefault?: boolean;
};

export async function listSavedAddresses(userId: string): Promise<SavedAddressDTO[]> {
  return prisma.savedAddress.findMany({
    where: { userId },
    select: addressSelect,
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createSavedAddress(userId: string, input: SavedAddressInput) {
  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.savedAddress.count({ where: { userId } });
    const isDefault = input.isDefault === true || existingCount === 0;
    if (isDefault) {
      await tx.savedAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.savedAddress.create({
      data: { ...input, userId, isDefault },
      select: addressSelect,
    });
  });
}

export async function updateSavedAddress(
  userId: string,
  addressId: string,
  input: SavedAddressInput,
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.savedAddress.findFirst({
      where: { id: addressId, userId },
      select: { id: true, isDefault: true },
    });
    if (!existing) throw new ApiError(404, "Saved address not found");

    const isDefault = input.isDefault === true;
    if (isDefault) {
      await tx.savedAddress.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }
    return tx.savedAddress.update({
      where: { id: addressId },
      data: { ...input, isDefault },
      select: addressSelect,
    });
  });
}
