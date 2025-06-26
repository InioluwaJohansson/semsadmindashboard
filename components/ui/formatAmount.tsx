export function formatAmount(value: number | string): string {
  return isNaN(value) ? "0" : value.toLocaleString("en-US");
}
