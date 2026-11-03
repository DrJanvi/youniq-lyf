import "server-only";
import type { Prisma } from "@prisma/client";
import type { ListParams } from "@/lib/admin/list-params";
import { paginated, type PageParams } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import type { partnerRequestSchema } from "@/lib/validation";
import type { z } from "zod";

type PartnerRequestInput = z.infer<typeof partnerRequestSchema>;

export async function createPartnerRequest(input: PartnerRequestInput) {
  return prisma.partnerRequest.create({
    data: input,
    select: { id: true },
  });
}

export async function listPartnerRequests(page: PageParams, params: ListParams) {
  const where: Prisma.PartnerRequestWhereInput = params.q
    ? {
        OR: [
          { fullName: { contains: params.q } },
          { countryCode: { contains: params.q } },
          { phoneNumber: { contains: params.q } },
        ],
      }
    : {};
  const orderBy: Prisma.PartnerRequestOrderByWithRelationInput = {
    [params.sort]: params.dir,
  };
  const [rows, total] = await Promise.all([
    prisma.partnerRequest.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: page.skip,
      take: page.limit,
    }),
    prisma.partnerRequest.count({ where }),
  ]);
  return paginated(rows, total, page);
}
