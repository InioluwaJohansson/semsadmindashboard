export function formatAmount(value: number | string): string {
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}
