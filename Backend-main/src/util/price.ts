export function formatPrice(amountInCents: number, currency: string): string {
  const amount = amountInCents / 100;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
