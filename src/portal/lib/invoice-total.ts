export function totalOnlyInvoiceItems(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return [];
  return [{ name: 'মোট বিল', price: amount, quantity: 1, teeth: [] as string[] }];
}