/** Formats a Decimal/number/string price as Turkish Lira, e.g. 1500 -> "1.500 ₺". */
export function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺`;
}
