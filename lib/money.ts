export function formatMoney(amount: number) {
  return `AED ${Number(amount).toFixed(amount % 1 === 0 ? 0 : 2)}`;
}
