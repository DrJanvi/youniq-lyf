import "server-only";
import type { Prisma } from "@prisma/client";
import type { ListParams } from "@/lib/admin/list-params";
import { ApiError } from "@/lib/http";
import { paginated, type PageParams } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import type {
  careerApplicationSchema,
  careerPageSettingSchema,
} from "@/lib/validation";
import type { z } from "zod";

type CareerApplicationInput = z.infer<typeof careerApplicationSchema>;
type CareerPageSettingInput = z.infer<typeof careerPageSettingSchema>;

export async function getCareerPageSettings() {
  const setting = await prisma.careerPageSetting.findUnique({
    where: { id: "careers" },
  });
  return { imageUrl: setting?.imageUrl ?? null };
}

export async function saveCareerPageSettings(input: CareerPageSettingInput) {
  await prisma.careerPageSetting.upsert({
    where: { id: "careers" },
    create: { id: "careers", imageUrl: input.imageUrl },
    update: { imageUrl: input.imageUrl },
  });
}

export async function createCareerApplication(
  input: CareerApplicationInput,
  resume: {
    publicId: string;
    fileName: string;
    contentType: string;
  },
) {
  return prisma.careerApplication.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      jobRole: input.jobRole,
      countryCode: input.countryCode,
      phoneNumber: input.phoneNumber,
      resumePublicId: resume.publicId,
      resumeFileName: resume.fileName,
      resumeContentType: resume.contentType,
      consentAt: new Date(),
    },
    select: { id: true },
  });
}

export async function listCareerApplications(page: PageParams, params: ListParams) {
  const where: Prisma.CareerApplicationWhereInput = params.q
    ? {
        OR: [
          { fullName: { contains: params.q } },
          { email: { contains: params.q } },
          { countryCode: { contains: params.q } },
          { phoneNumber: { contains: params.q } },
        ],
      }
    : {};
  const orderBy: Prisma.CareerApplicationOrderByWithRelationInput = {
    [params.sort]: params.dir,
  };
  const [rows, total] = await Promise.all([
    prisma.careerApplication.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: page.skip,
      take: page.limit,
    }),
    prisma.careerApplication.count({ where }),
  ]);
  return paginated(rows, total, page);
}

export async function getCareerApplicationResume(id: string) {
  const application = await prisma.careerApplication.findUnique({
    where: { id },
    select: {
      resumePublicId: true,
      resumeFileName: true,
      resumeContentType: true,
    },
  });
  if (!application) throw new ApiError(404, "Career application not found.");
  return application;
}
