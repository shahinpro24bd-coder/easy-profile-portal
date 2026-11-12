import { describe, expect, it } from 'vitest';
import { totalOnlyInvoiceItems } from '@/portal/lib/invoice-total';

describe('Total-only new invoices', () => {
  it('creates a bill directly from the entered total without treatment selection', () => {
    expect(totalOnlyInvoiceItems('5000')).toEqual([
      { name: 'মোট বিল', price: 5000, quantity: 1, teeth: [] },
    ]);
  });
  it('rejects blank, negative, and invalid totals', () => {
    for (const value of ['', '0', '-500', 'abc', 'Infinity']) {
      expect(totalOnlyInvoiceItems(value)).toEqual([]);
    }
  });
});