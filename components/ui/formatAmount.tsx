export function formatAmount(value: number | string): string {
  console.log(value.toLocaleString("en-US"))
  return isNaN(value) ? "0" : value.toLocaleString("en-US");
}
