export function formatMoney(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
}

export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toISOString().slice(0, 16).replace("T", " ");
}

/** ISO date -> value for <input type="datetime-local">. */
export function toLocalInput(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  const off = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - off).toISOString().slice(0, 16);
}
