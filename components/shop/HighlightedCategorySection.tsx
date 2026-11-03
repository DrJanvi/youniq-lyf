import { getCurrentTimerEnd, getHighlightedCategorySetting } from "@/services/highlighted-category";
import { HighlightedCategoryContent } from "./HighlightedCategoryContent";

export async function HighlightedCategorySection() {
  const setting = await getHighlightedCategorySetting();
  const now = new Date();
  const timerEnd = getCurrentTimerEnd(setting, now);

  if (
    !setting.isEnabled ||
    !timerEnd ||
    (!setting.autoRestart && timerEnd.getTime() <= now.getTime())
  ) {
    return null;
  }

  return (
    <HighlightedCategoryContent
      image={setting.image}
      title={setting.title}
      description={setting.description}
      buttonLink={setting.buttonLink}
      timerEndAt={timerEnd.toISOString()}
      durationSeconds={setting.durationSeconds}
      autoRestart={setting.autoRestart}
      initialRemainingSeconds={Math.max(0, Math.ceil((timerEnd.getTime() - now.getTime()) / 1000))}
    />
  );
}
