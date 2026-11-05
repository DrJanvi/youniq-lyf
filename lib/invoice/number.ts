export function formatInvoiceNumber(sequence: number) {
  return `BNF-INV-${sequence.toString().padStart(6, "0")}`;
}
