import "server-only";
import { prisma } from "@/lib/prisma";

const SETTING_ID = "home";
const DEFAULT_DURATION_SECONDS = 3 * 24 * 60 * 60 + 16 * 60 * 60 + 21 * 60 + 6;
const DEFAULT_SETTING = {
  image: "https://i.ibb.co/Yw3fc76/highlight.webp",
  title: "A Scent That Leaves a Lasting Impression",
  description:
    "Eternal OUD is an exquisite fragrance created for those who appreciate the art of refined perfumery.",
  buttonLink: "/category/fragrances",
};

export type HighlightedCategoryInput = {
  image: string;
  title: string;
  description: string;
  buttonLink: string;
  durationSeconds: number;
  isEnabled: boolean;
  autoRestart: boolean;
};

export async function getHighlightedCategorySetting() {
  const now = new Date();
  await prisma.highlightedCategorySetting.upsert({
    where: { id: SETTING_ID },
    update: {},
    create: {
      id: SETTING_ID,
      ...DEFAULT_SETTING,
      durationSeconds: DEFAULT_DURATION_SECONDS,
      isEnabled: true,
      timerEndsAt: new Date(now.getTime() + DEFAULT_DURATION_SECONDS * 1000),
    },
  });
  await prisma.highlightedCategorySetting.updateMany({
    where: {
      id: SETTING_ID,
      isEnabled: true,
      autoRestart: false,
      timerEndsAt: { lte: now },
    },
    data: { isEnabled: false },
  });
  return prisma.highlightedCategorySetting.findUniqueOrThrow({ where: { id: SETTING_ID } });
}

export async function saveHighlightedCategorySetting(input: HighlightedCategoryInput) {
  const existing = await getHighlightedCategorySetting();
  const now = new Date();
  const shouldStartTimer =
    input.isEnabled &&
    (!existing.isEnabled ||
      !existing.timerEndsAt ||
      existing.timerEndsAt <= now ||
      existing.durationSeconds !== input.durationSeconds);

  return prisma.highlightedCategorySetting.update({
    where: { id: SETTING_ID },
    data: {
      ...input,
      timerEndsAt: input.isEnabled
        ? shouldStartTimer
          ? new Date(now.getTime() + input.durationSeconds * 1000)
          : existing.timerEndsAt
        : null,
    },
  });
}

export function getCurrentTimerEnd(setting: {
  timerEndsAt: Date | null;
  durationSeconds: number;
  autoRestart: boolean;
}, now = new Date()) {
  if (!setting.timerEndsAt) return null;
  if (!setting.autoRestart || setting.timerEndsAt > now) return setting.timerEndsAt;

  const elapsedSinceEnd = now.getTime() - setting.timerEndsAt.getTime();
  const cyclesElapsed = Math.floor(elapsedSinceEnd / (setting.durationSeconds * 1000)) + 1;
  return new Date(setting.timerEndsAt.getTime() + cyclesElapsed * setting.durationSeconds * 1000);
}
