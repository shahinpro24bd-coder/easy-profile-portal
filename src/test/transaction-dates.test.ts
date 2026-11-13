import { afterEach, describe, expect, it, vi } from 'vitest';
import { clinicDay, getPaymentDate, getReceiptDate, transactionDateFields } from '@/portal/lib/transaction-dates';

afterEach(() => vi.useRealTimers());
describe('Selected clinic transaction date', () => {
  it('sends a payment made seven days ago as that clinic day, not today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-13T11:29:00Z'));
    const fields = transactionDateFields('2026-11-06');
    expect(fields.paymentDate).toBe('2026-11-06');
    expect(fields.receiptDate).toBe('2026-11-06');
    expect(fields.date).toBe('2026-11-06T06:00:00.000Z');
    expect(fields.paidAt).toBe(fields.date);
    expect(fields.createdAt).toBe(fields.date);
  });
  it('displays the selected payment day before its entry timestamp', () => {
    expect(clinicDay(getPaymentDate({ paymentDate: '2026-11-06', createdAt: '2026-11-13T11:29:00Z' }))).toBe('2026-11-06');
  });
  it('displays the selected bill day before its entry timestamp', () => {
    expect(clinicDay(getReceiptDate({ receiptDate: '2026-11-06', createdAt: '2026-11-13T11:29:00Z' }))).toBe('2026-11-06');
  });
  it('rejects a nonexistent date', () => expect(() => transactionDateFields('2026-02-30')).toThrow());
});