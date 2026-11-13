import { getDhakaDateString } from '@/portal/lib/utils/date-time';

type DatedRecord = { paymentDate?: string; receiptDate?: string; paidAt?: string; date?: string; createdAt?: string };

/** Business dates are clinic calendar days, not the timestamp when an admin entered them. */
export function transactionDateFields(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day > getDhakaDateString()) {
    throw new Error('আজ বা আগের একটি সঠিক তারিখ বেছে নিন।');
  }
  const timestamp = new Date(`${day}T12:00:00+06:00`);
  if (!Number.isFinite(timestamp.getTime()) || getDhakaDateString(timestamp) !== day) {
    throw new Error('সঠিক তারিখ বেছে নিন।');
  }
  const iso = timestamp.toISOString();
  return { paymentDate: day, receiptDate: day, date: iso, paidAt: iso, createdAt: iso };
}

export function getPaymentDate(record: DatedRecord): string {
  return record.paymentDate || record.paidAt || record.date || record.createdAt || '';
}

export function getReceiptDate(record: DatedRecord): string {
  return record.receiptDate || record.date || record.createdAt || '';
}

export function clinicDay(value: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? getDhakaDateString(date) : '';
}

export function formatTransactionDate(value: string): string {
  const day = clinicDay(value);
  return day ? new Date(`${day}T12:00:00+06:00`).toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' }) : '—';
}