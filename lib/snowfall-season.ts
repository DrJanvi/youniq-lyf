const IST_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  month: "numeric",
  day: "numeric",
});

export function isSnowfallSeasonActive(date: Date): boolean {
  const parts = IST_DATE_FORMATTER.formatToParts(date);
  const monthPart = parts.find((part) => part.type === "month");
  const dayPart = parts.find((part) => part.type === "day");

  if (!monthPart || !dayPart) {
    throw new Error("Could not determine the current date in Asia/Kolkata.");
  }

  const month = Number(monthPart.value);
  const day = Number(dayPart.value);

  return month >= 11 || month === 1 || (month === 2 && day <= 11);
}
